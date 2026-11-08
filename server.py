from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from getpass import getpass
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock

ROOT = Path(__file__).resolve().parent
WEB_ROOT = ROOT / "web"
DB_PATH = Path(os.environ.get("SPORT_NAVOIY_DB", ROOT / "sport_navoiy.sqlite3"))
PORT = int(os.environ.get("PORT", "8000"))
SESSION_SECONDS = 7 * 24 * 60 * 60
MAX_BODY = 1_000_000
PASSWORD_ITERATIONS = 310_000
SESSION_LOCK = Lock()
SESSIONS: dict[str, dict[str, object]] = {}
ATTEMPTS: dict[str, list[float]] = {}
PRODUCTS_LOCK = Lock()

OFFICIAL_CATEGORIES = [
    "Futbol formalari",
    "Futbolka va shortiklar",
    "Futbol getrlari / paypoqlar",
    "Mashg‘ulot kiyimlari",
    "Darvozabon kiyimlari va qo‘lqoplari",
    "Futbol butsalari va krossovkalari",
    "Himoya vositalari",
    "Futbol to‘plari",
    "Aksessuarlar",
]


def db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    value = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${value.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, rounds, salt, expected = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(rounds))
        return hmac.compare_digest(actual.hex(), expected)
    except (ValueError, TypeError):
        return False


def categories_for(name: str) -> str:
    text = name.lower()
    if "butsi" in text or "sarakanoshka" in text or "tapochka" in text:
        return "Futbol butsalari va krossovkalari"
    if "sumka" in text or "kepka" in text:
        return "Aksessuarlar"
    if "gidra" in text or "getr" in text:
        return "Futbol getrlari / paypoqlar"
    if "kelme futbolka" in text or "maylka" in text:
        return "Futbolka va shortiklar"
    if "shortik" in text and "jako futbolka" not in text and "har bir futbolka" not in text:
        return "Futbolka va shortiklar"
    if "futbolka shortik" in text or "forma" in text:
        return "Futbol formalari"
    if "sportifka" in text or "kurtka" in text or "mashgulot" in text or "triko" in text:
        return "Mashg‘ulot kiyimlari"
    return "Futbol formalari"


PRODUCT_DETAILS_MAP: dict[str, dict[str, str | int]] = {
    "120-ming har bir kelme futbolka": {
        "title": "Kelme futbolkasi",
        "title_ru": "Футбольная футболка Kelme",
        "title_en": "Kelme Football Jersey",
        "category": "Futbolka va shortiklar",
        "brand": "KELME",
        "old_price": 140000,
        "description": "Professional nafas oluvchi mikrofibra matodan tayyorlangan Kelme futbolkasi. Terlatmaydi, harakatni cheklamaydi va maydonda qulaylik beradi.",
    },
    "180-ming har bitta shortik": {
        "title": "Futbol sport shortigi",
        "title_ru": "Футбольные спортивные шорты",
        "title_en": "Athletic Football Shorts",
        "category": "Futbolka va shortiklar",
        "brand": "KELME",
        "old_price": 200000,
        "description": "Yengil va qulay sport shortiklari. Elastik belbog' va tez quriydigan nafas oluvchi mato bilan jihozlangan.",
    },
    "230-ming JAKO KELME kurtkalar": {
        "title": "JAKO & Kelme sport kurtkasi",
        "title_ru": "Спортивная ветровка JAKO & Kelme",
        "title_en": "JAKO & Kelme Sports Jacket",
        "category": "Mashg‘ulot kiyimlari",
        "brand": "JAKO / KELME",
        "old_price": 260000,
        "description": "Shamol va yengil yomg'irga chidamli futbol mashg'ulot kurtkasi. Fermuarli cho'ntaklar va ergonomik bichim.",
    },
    "250-ming har bir JAKO futbolka shortik": {
        "title": "JAKO futbol to‘plami (forma)",
        "title_ru": "Футбольная форма JAKO (комплект)",
        "title_en": "JAKO Football Kit (Jersey & Shorts)",
        "category": "Futbol formalari",
        "brand": "JAKO",
        "old_price": 290000,
        "description": "Futbolka va shortikdan iborat to'liq JAKO futbol ekipirovkasi. Jamoaviy o'yinlar va individual mashg'ulotlar uchun a'lo tanlov.",
    },
    "250-ming har bir JAKO maylka shortik": {
        "title": "JAKO mashg‘ulot maykasi va shortigi",
        "title_ru": "Тренировочная майка и шорты JAKO",
        "title_en": "JAKO Training Tank & Shorts",
        "category": "Futbolka va shortiklar",
        "brand": "JAKO",
        "old_price": 280000,
        "description": "Yozgi qizg'in mashg'ulotlar uchun yengil va qulay mayka hamda shortik to'plami.",
    },
    "250-ming har bitta adidas tapochka": {
        "title": "Adidas sport tapochkasi",
        "title_ru": "Спортивные тапочки Adidas",
        "title_en": "Adidas Athletic Slides",
        "category": "Futbol butsalari va krossovkalari",
        "brand": "Adidas",
        "old_price": 290000,
        "description": "Mashg'ulotdan so'ng kiyish, dush va dam olish uchun qulay anatomik taglikli Adidas sport tapochkasi.",
    },
    "250-ming har bitta sumka": {
        "title": "Futbol sport sumkasi",
        "title_ru": "Футбольная спортивная сумка",
        "title_en": "Football Sports Bag",
        "category": "Aksessuarlar",
        "brand": "D&A Sport",
        "old_price": 290000,
        "description": "Butsa, kiyim va mashg'ulot anjomlarini qulay tashish uchun mo'ljallangan sig'imli sport sumkasi. Alohida poyabzal bo'lmasiga ega.",
    },
    "250-minglik qishki kurtkalar har bittasi": {
        "title": "Qishki futbol mashg‘ulot kurtkasi",
        "title_ru": "Зимняя тренировочная куртка",
        "title_en": "Winter Training Jacket",
        "category": "Mashg‘ulot kiyimlari",
        "brand": "KELME",
        "old_price": 310000,
        "description": "Sovuq havoda maydonda isinish va mashg'ulot olib borish uchun issiq va yengil termal kurtka.",
    },
    "260 ming har bir sportifka triko": {
        "title": "Futbol mashg‘ulot trikosi (shim)",
        "title_ru": "Футбольные тренировочные брюки",
        "title_en": "Football Training Pants",
        "category": "Mashg‘ulot kiyimlari",
        "brand": "KELME",
        "old_price": 300000,
        "description": "Toraytirilgan to'piq qismi bilan yugurish va to'p bilan harakat qilishda xalal bermaydigan sifatli triko.",
    },
    "270 ming  har bir futbolka shortik": {
        "title": "Professional futbol formasi (to‘plam)",
        "title_ru": "Профессиональная футбольная форма",
        "title_en": "Pro Match Football Kit",
        "category": "Futbol formalari",
        "brand": "KELME",
        "old_price": 320000,
        "description": "Professional o'yinlar uchun klub uslubidagi futbolka va shortik to'plami. Yuqori sifatli mato va yorqin dizayn.",
    },
    "30-ming gidralar raqam yozib berish xizmatixam bor": {
        "title": "Futbol getrlari (raqam yozish xizmati bilan)",
        "title_ru": "Футбольные гетры с печатью номера",
        "title_en": "Football Socks with Custom Number",
        "category": "Futbol getrlari / paypoqlar",
        "brand": "D&A Sport",
        "old_price": 40000,
        "description": "Boldirni mustahkam ushlab turuvchi elastik futbol getrlari. Shaxsiy raqam yoki ism yozib berish xizmati mavjud.",
    },
    "300-ming har bittasi  futbol uchun mashgulot kiyimi": {
        "title": "Futbol mashg‘ulot kostyumi",
        "title_ru": "Футбольный тренировочный костюм",
        "title_en": "Football Training Suit",
        "category": "Mashg‘ulot kiyimlari",
        "brand": "JAKO",
        "old_price": 350000,
        "description": "Olimpiyka va shimlardan iborat to'liq futbol mashg'ulot kostyumi. Har qanday ob-havoda qulay.",
    },
    "400-ming har bir sarakanoshka": {
        "title": "Kelme sarakanoshka (turf / futzal)",
        "title_ru": "Сороконожки Kelme (турфы / футзал)",
        "title_en": "Kelme Turf Football Shoes",
        "category": "Futbol butsalari va krossovkalari",
        "brand": "KELME",
        "old_price": 460000,
        "description": "Sun'iy maydon va futzal uchun ko'p tishli rezina taglikka ega professional Kelme sarakanoshkasi. Kuchli zarba va qat'iy tutuvchanlik.",
    },
    "450-ming somlik butsilar": {
        "title": "Kelme Precision Elite futbol butsisi",
        "title_ru": "Футбольные бутсы Kelme Precision Elite",
        "title_en": "Kelme Precision Elite Boots",
        "category": "Futbol butsalari va krossovkalari",
        "brand": "KELME",
        "old_price": 500000,
        "description": "Tabiiy va sun'iy maysazorlar uchun klassik tishli yuqori darajadagi Kelme butsisi. To'pni his qilish va tezlikni oshirish uchun maxsus ishlab chiqilgan.",
    },
    "500-ming har bir butsilar": {
        "title": "Premium Professional futbol butsisi",
        "title_ru": "Премиальные профессиональные бутсы",
        "title_en": "Pro Elite Match Football Boots",
        "category": "Futbol butsalari va krossovkalari",
        "brand": "KELME Elite",
        "old_price": 580000,
        "description": "Eng yuqori toifadagi futbolchilar uchun mo'ljallangan yengil va elastik professional butsi. Oyoqqa mukammal o'tiradi.",
    },
    "80 ming har biitasi kepka": {
        "title": "Futbol sport kepkasi",
        "title_ru": "Футбольная спортивная кепка",
        "title_en": "Football Athletic Cap",
        "category": "Aksessuarlar",
        "brand": "D&A Sport",
        "old_price": 100000,
        "description": "Quyoshdan himoyalovchi va shamollatish teshiklariga ega sport kepkasi. O'lchami orqa qismidagi tasma orqali moslashtiriladi.",
    },
}


def clean_product_title(folder_name: str) -> str:
    title = re.sub(r"^\s*\d+\s*[- ]?\s*ming(?:lik)?\s*", "", folder_name, flags=re.IGNORECASE)
    title = re.sub(r"\bhar\s*(bir|bitta|bittasi|biitasi)\b", "", title, flags=re.IGNORECASE)
    title = re.sub(r"^somlik\s+", "", title, flags=re.IGNORECASE)
    title = re.sub(r"\s+", " ", title.replace("_", " ")).strip(" -")
    return title[0].upper() + title[1:] if title else folder_name


def seed_products(connection: sqlite3.Connection) -> None:
    with PRODUCTS_LOCK:
        # Check if images_json column exists
        cols = [r[1] for r in connection.execute("PRAGMA table_info(products)").fetchall()]
        if "images_json" not in cols:
            connection.execute("ALTER TABLE products ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'")

        sku_counter = 1
        for folder in sorted(ROOT.iterdir(), key=lambda entry: entry.name.casefold()):
            if not folder.is_dir() or folder.name in {"dizayn", "admin_dizayn", "web", "__pycache__"}:
                continue
            price_match = re.match(r"\s*(\d+)\s*[- ]?\s*ming(?:lik)?\b", folder.name, flags=re.IGNORECASE)
            if not price_match:
                continue

            raw_photos = [path for path in folder.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
            if not raw_photos:
                continue

            # Sort photos so main_premium is first
            photos = sorted(raw_photos, key=lambda p: (0 if "main_premium" in p.name.lower() else 1, p.name.casefold()))

            primary_image = "/" + urllib.parse.quote(folder.name) + "/" + urllib.parse.quote(photos[0].name)
            gallery = ["/" + urllib.parse.quote(folder.name) + "/" + urllib.parse.quote(p.name) for p in photos]
            images_json = json.dumps(gallery, ensure_ascii=False)

            base_price = int(price_match.group(1)) * 1000

            meta = PRODUCT_DETAILS_MAP.get(folder.name, {})
            title = str(meta.get("title", clean_product_title(folder.name)))
            title_ru = str(meta.get("title_ru", title))
            title_en = str(meta.get("title_en", title))
            category = str(meta.get("category", categories_for(folder.name)))
            brand = str(meta.get("brand", "KELME" if "kelme" in folder.name.lower() else ("JAKO" if "jako" in folder.name.lower() else "D&A Sport")))
            old_price = int(meta.get("old_price", 0))
            description = str(meta.get("description", "Futbol mashg‘ulotlari va rasmiy o‘yinlar uchun yuqori sifatli original sport tovari."))
            sku = f"SN-{sku_counter:04d}"
            sku_counter += 1

            existing_source = connection.execute("SELECT product_id FROM product_sources WHERE folder=?", (folder.name,)).fetchone()
            if existing_source:
                product_id = existing_source["product_id"]
                connection.execute(
                    """UPDATE products SET
                       title=?, title_ru=?, title_en=?, description=?, category=?, brand=?,
                       price=?, old_price=?, image=?, images_json=?, stock=15, active=1
                       WHERE id=?""",
                    (title, title_ru, title_en, description, category, brand, base_price, old_price, primary_image, images_json, product_id),
                )
            else:
                cursor = connection.execute(
                    """INSERT INTO products
                       (title, title_ru, title_en, description, category, brand, sku, price, old_price, stock, image, images_json, active, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 15, ?, ?, 1, ?)""",
                    (title, title_ru, title_en, description, category, brand, sku, base_price, old_price, primary_image, images_json, datetime.now(timezone.utc).isoformat()),
                )
                connection.execute("INSERT OR REPLACE INTO product_sources (folder, product_id) VALUES (?, ?)", (folder.name, cursor.lastrowid))

        # Seed default promo YANGI2026 if no promos
        has_promo = connection.execute("SELECT 1 FROM promos WHERE code='YANGI2026'").fetchone()
        if not has_promo:
            connection.execute(
                "INSERT INTO promos (code, enabled, expires_at, usage_limit, uses) VALUES (?, 1, '2027-12-31', 1000, 0)",
                ("YANGI2026",),
            )

        # Seed default admin user in admin_users if empty
        has_admin = connection.execute("SELECT 1 FROM admin_users LIMIT 1").fetchone()
        if not has_admin:
            connection.execute(
                "INSERT INTO admin_users (username, password_hash, created_at) VALUES (?, ?, ?)",
                ("admin", password_hash("admin2026"), datetime.now(timezone.utc).isoformat()),
            )


def initialize() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL, title_ru TEXT NOT NULL DEFAULT '', title_en TEXT NOT NULL DEFAULT '',
                description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '',
                brand TEXT NOT NULL DEFAULT '', sku TEXT NOT NULL DEFAULT '',
                price INTEGER NOT NULL CHECK(price >= 0), old_price INTEGER NOT NULL DEFAULT 0,
                stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), image TEXT NOT NULL DEFAULT '',
                images_json TEXT NOT NULL DEFAULT '[]',
                active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS product_sources (
                folder TEXT PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL, blocked INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
                items_json TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
                delivery_price INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL, promo_code TEXT NOT NULL DEFAULT '',
                delivery_method TEXT NOT NULL, region TEXT NOT NULL, address TEXT NOT NULL DEFAULT '',
                payment_method TEXT NOT NULL, comment TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'Yangi', created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS promos (
                id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE,
                enabled INTEGER NOT NULL DEFAULT 1, expires_at TEXT NOT NULL DEFAULT '',
                usage_limit INTEGER NOT NULL DEFAULT 0, uses INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id),
                user_name TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
                comment TEXT NOT NULL,
                hidden INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        seed_products(connection)


def safe_int(value: object, default: int = 0) -> int:
    try:
        return int(value)
    except (ValueError, TypeError):
        return default


def json_product(row: sqlite3.Row, avg_rating: float = 5.0, reviews_count: int = 0) -> dict[str, object]:
    result = dict(row)
    raw_price = safe_int(result.get("price", 0))
    raw_old = safe_int(result.get("old_price", 0))
    result["raw_price"] = raw_price
    result["price"] = max(0, raw_price - 1)
    result["old_price"] = max(0, raw_old - 1) if raw_old > 0 else 0
    try:
        images = json.loads(result.get("images_json") or "[]")
    except Exception:
        images = []
    if not images and result.get("image"):
        images = [result["image"]]
    result["images"] = images
    result["rating"] = round(avg_rating, 1)
    result["reviews_count"] = reviews_count
    return result


class Handler(SimpleHTTPRequestHandler):
    server_version = "SportNavoiy/2.0"

    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[{self.log_date_time_string()}] {self.address_string()} {fmt % args}")

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; "
            "connect-src 'self'; "
            "base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        )
        super().end_headers()

    def do_GET(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if path.startswith("/api/"):
            self.handle_get(path)
            return

        if path in {"/", "/index.html"}:
            self.path = "/web/index.html"
        elif path in {"/admin", "/admin/", "/admin.html"}:
            self.path = "/web/admin.html"
        elif path in {"/favicon.svg", "/styles.css", "/app.js", "/logo.svg", "/admin.js", "/manifest.json", "/sw.js", "/icon-192.png", "/icon-512.png"}:
            self.path = f"/web{path}"
        elif path.startswith("/web/"):
            candidate = (WEB_ROOT / urllib.parse.unquote(path[len("/web/"):])).resolve()
            if not candidate.is_relative_to(WEB_ROOT) or not candidate.is_file():
                self.send_error(404)
                return
        elif path.startswith("/"):
            candidate = (ROOT / urllib.parse.unquote(path.lstrip("/"))).resolve()
            if (
                not candidate.is_relative_to(ROOT)
                or not candidate.is_file()
                or candidate.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".svg", ".ico", ".css", ".js", ".html"}
            ):
                self.send_error(404)
                return
        else:
            self.send_error(404)
            return

        super().do_GET()

    def do_POST(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        if not path.startswith("/api/"):
            self.send_error(404)
            return
        try:
            data = self.read_json()
            if path in {"/api/register", "/api/login", "/api/admin/login", "/api/contact", "/api/orders"} and self.rate_limited(path):
                self.respond(429, {"error": "Juda ko‘p urinish. Biroz kutib qayta urinib ko‘ring."})
                return

            if path == "/api/register":
                self.register(data)
            elif path == "/api/login":
                self.login(data)
            elif path == "/api/logout":
                self.logout()
            elif path == "/api/admin/login":
                self.admin_login(data)
            elif path == "/api/admin/logout":
                self.logout()
            elif path == "/api/promos/validate":
                self.validate_promo(data)
            elif path == "/api/orders":
                self.create_order(data)
            elif path.startswith("/api/products/") and path.endswith("/reviews"):
                prod_id = safe_int(path.split("/")[3], -1)
                self.create_review(prod_id, data)
            elif path == "/api/admin/products":
                if not self.require_admin():
                    return
                self.save_product(data)
            elif path == "/api/admin/promos":
                if not self.require_admin():
                    return
                self.save_promo(data)
            elif path == "/api/contact":
                self.contact(data)
            else:
                self.respond(404, {"error": "API yo‘li topilmadi."})
        except ValueError as exc:
            self.respond(400, {"error": str(exc)})
        except Exception as exc:
            print(f"API POST error: {type(exc).__name__}: {exc}")
            self.respond(500, {"error": "Serverda xatolik yuz berdi."})

    def do_PUT(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        try:
            data = self.read_json()
            if not self.require_admin():
                return
            if path.startswith("/api/admin/products/"):
                product_id = safe_int(path.rsplit("/", 1)[-1], -1)
                self.save_product(data, product_id)
            elif path.startswith("/api/admin/orders/"):
                self.update_order(safe_int(path.rsplit("/", 1)[-1], -1), data)
            elif path.startswith("/api/admin/users/"):
                self.update_user(safe_int(path.rsplit("/", 1)[-1], -1), data)
            elif path.startswith("/api/admin/promos/"):
                self.update_promo(safe_int(path.rsplit("/", 1)[-1], -1), data)
            elif path.startswith("/api/admin/reviews/"):
                self.update_review(safe_int(path.rsplit("/", 1)[-1], -1), data)
            else:
                self.respond(404, {"error": "API yo‘li topilmadi."})
        except ValueError as exc:
            self.respond(400, {"error": str(exc)})
        except Exception as exc:
            print(f"API PUT error: {type(exc).__name__}: {exc}")
            self.respond(500, {"error": "Serverda xatolik yuz berdi."})

    def do_DELETE(self) -> None:
        path = urllib.parse.urlparse(self.path).path
        try:
            if not self.require_admin():
                return
            if path.startswith("/api/admin/products/"):
                with db() as connection:
                    cursor = connection.execute("DELETE FROM products WHERE id=?", (safe_int(path.rsplit("/", 1)[-1], -1),))
                self.respond(200, {"deleted": cursor.rowcount > 0})
            elif path.startswith("/api/admin/promos/"):
                with db() as connection:
                    cursor = connection.execute("DELETE FROM promos WHERE id=?", (safe_int(path.rsplit("/", 1)[-1], -1),))
                self.respond(200, {"deleted": cursor.rowcount > 0})
            elif path.startswith("/api/admin/reviews/"):
                with db() as connection:
                    cursor = connection.execute("DELETE FROM reviews WHERE id=?", (safe_int(path.rsplit("/", 1)[-1], -1),))
                self.respond(200, {"deleted": cursor.rowcount > 0})
            else:
                self.respond(404, {"error": "API yo‘li topilmadi."})
        except Exception as exc:
            print(f"API DELETE error: {type(exc).__name__}: {exc}")
            self.respond(500, {"error": "Serverda xatolik yuz berdi."})

    def handle_get(self, path: str) -> None:
        with db() as connection:
            if path == "/api/products":
                # Get ratings
                ratings_map: dict[int, tuple[float, int]] = {}
                ratings_rows = connection.execute(
                    "SELECT product_id, AVG(rating) as avg_r, COUNT(*) as cnt FROM reviews WHERE hidden=0 GROUP BY product_id"
                ).fetchall()
                for r in ratings_rows:
                    ratings_map[r["product_id"]] = (float(r["avg_r"]), int(r["cnt"]))

                rows = connection.execute("SELECT * FROM products WHERE active=1 ORDER BY id DESC").fetchall()
                products = []
                for row in rows:
                    avg_r, cnt = ratings_map.get(row["id"], (5.0, 0))
                    products.append(json_product(row, avg_r, cnt))
                self.respond(200, {"products": products, "categories": OFFICIAL_CATEGORIES})

            elif path.startswith("/api/products/"):
                parts = path.strip("/").split("/")
                if len(parts) == 3 and parts[0] == "api" and parts[1] == "products":
                    prod_id = safe_int(parts[2], -1)
                    row = connection.execute("SELECT * FROM products WHERE id=? AND active=1", (prod_id,)).fetchone()
                    if not row:
                        self.respond(404, {"error": "Mahsulot topilmadi."})
                        return
                    reviews = connection.execute(
                        "SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id=? AND hidden=0 ORDER BY id DESC",
                        (prod_id,),
                    ).fetchall()
                    avg_r = (sum(r["rating"] for r in reviews) / len(reviews)) if reviews else 5.0
                    prod_data = json_product(row, avg_r, len(reviews))
                    prod_data["reviews"] = [dict(r) for r in reviews]
                    self.respond(200, {"product": prod_data})
                    return

            elif path == "/api/me":
                user = self.current_user()
                self.respond(200, {"user": user})

            elif path == "/api/account/orders":
                user = self.current_user()
                if not user:
                    self.respond(401, {"error": "Shaxsiy kabinetga kirish talab qilinadi."})
                    return
                orders = connection.execute(
                    "SELECT id, items_json, subtotal, discount, delivery_price, total, promo_code, delivery_method, region, address, payment_method, status, created_at FROM orders WHERE user_id=? ORDER BY id DESC",
                    (user["id"],),
                ).fetchall()
                self.respond(200, {"orders": [dict(row) for row in orders]})

            elif path == "/api/admin/me":
                self.respond(200, {"admin": self.session_role() == "admin"})

            elif path == "/api/admin/available-images":
                if not self.require_admin():
                    return
                images = []
                for folder in sorted(ROOT.iterdir(), key=lambda e: e.name.casefold()):
                    if not folder.is_dir() or folder.name in {"dizayn", "admin_dizayn", "web", "__pycache__"}:
                        continue
                    for p in sorted(folder.iterdir(), key=lambda x: x.name.casefold()):
                        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                            images.append({
                                "folder": folder.name,
                                "name": p.name,
                                "url": "/" + urllib.parse.quote(folder.name) + "/" + urllib.parse.quote(p.name),
                            })
                self.respond(200, {"images": images})

            elif path.startswith("/api/admin/"):
                if not self.require_admin():
                    return
                if path == "/api/admin/dashboard":
                    orders = connection.execute(
                        """SELECT o.*, u.name AS customer_name, u.phone AS customer_phone
                           FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC"""
                    ).fetchall()
                    users = connection.execute(
                        """SELECT u.id, u.name, u.phone, u.blocked, u.created_at,
                                  COUNT(o.id) AS order_count
                           FROM users u LEFT JOIN orders o ON o.user_id=u.id
                           GROUP BY u.id ORDER BY u.id DESC"""
                    ).fetchall()
                    promos = connection.execute("SELECT * FROM promos ORDER BY id DESC").fetchall()
                    products = connection.execute("SELECT * FROM products ORDER BY id DESC").fetchall()
                    reviews = connection.execute(
                        """SELECT r.*, p.title AS product_title
                           FROM reviews r JOIN products p ON p.id=r.product_id ORDER BY r.id DESC"""
                    ).fetchall()
                    self.respond(200, {
                        "orders": [dict(row) for row in orders],
                        "users": [dict(row) for row in users],
                        "promos": [dict(row) for row in promos],
                        "products": [dict(row) for row in products],
                        "reviews": [dict(row) for row in reviews],
                        "categories": OFFICIAL_CATEGORIES,
                        "stats": {
                            "products": len(products),
                            "orders": len(orders),
                            "users": len(users),
                            "revenue": sum(safe_int(row["total"]) for row in orders if row["status"] != "Bekor qilindi"),
                            "pending_orders": sum(1 for row in orders if row["status"] == "Yangi"),
                        },
                    })
                else:
                    self.respond(404, {"error": "API yo‘li topilmadi."})
            else:
                self.respond(404, {"error": "API yo‘li topilmadi."})

    def read_json(self) -> dict[str, object]:
        length = safe_int(self.headers.get("Content-Length"), -1)
        if length < 0 or length > MAX_BODY:
            raise ValueError("So‘rov hajmi noto‘g‘ri.")
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("JSON ma’lumoti noto‘g‘ri.") from exc
        if not isinstance(data, dict):
            raise ValueError("So‘rov formati noto‘g‘ri.")
        return data

    def respond(self, status: int, payload: dict[str, object], headers: dict[str, str] | None = None) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        if headers:
            for name, value in headers.items():
                self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def client_key(self, route: str) -> str:
        return f"{route}:{self.client_address[0]}"

    def rate_limited(self, route: str) -> bool:
        key = self.client_key(route)
        now = time.time()
        entries = [stamp for stamp in ATTEMPTS.get(key, []) if now - stamp < 900]
        if len(entries) >= 20:
            ATTEMPTS[key] = entries
            return True
        entries.append(now)
        ATTEMPTS[key] = entries
        return False

    def cookie_token(self) -> str:
        parsed = cookies.SimpleCookie()
        parsed.load(self.headers.get("Cookie", ""))
        return parsed.get("sport_session").value if parsed.get("sport_session") else ""

    def session_role(self) -> str:
        token = self.cookie_token()
        with SESSION_LOCK:
            item = SESSIONS.get(token)
            if not item or float(item["expires"]) < time.time():
                SESSIONS.pop(token, None)
                return ""
            return str(item["role"])

    def current_user(self) -> dict[str, object] | None:
        token = self.cookie_token()
        with SESSION_LOCK:
            item = SESSIONS.get(token)
            if not item or item["role"] != "user" or float(item["expires"]) < time.time():
                SESSIONS.pop(token, None)
                return None
            user_id = safe_int(item["id"], -1)
        with db() as connection:
            row = connection.execute("SELECT id, name, phone, created_at FROM users WHERE id=? AND blocked=0", (user_id,)).fetchone()
        return dict(row) if row else None

    def set_session(self, role: str, user_id: int = 0) -> None:
        token = secrets.token_urlsafe(32)
        with SESSION_LOCK:
            SESSIONS[token] = {"role": role, "id": user_id, "expires": time.time() + SESSION_SECONDS}
        secure = "; Secure" if os.environ.get("COOKIE_SECURE") == "1" else ""
        self.respond(200, {"ok": True, "role": role}, {
            "Set-Cookie": f"sport_session={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={SESSION_SECONDS}{secure}",
        })

    def logout(self) -> None:
        token = self.cookie_token()
        with SESSION_LOCK:
            SESSIONS.pop(token, None)
        secure = "; Secure" if os.environ.get("COOKIE_SECURE") == "1" else ""
        self.respond(200, {"ok": True}, {"Set-Cookie": f"sport_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0{secure}"})

    def require_admin(self) -> bool:
        if self.session_role() == "admin":
            return True
        self.respond(401, {"error": "Admin panelga kirish talab qilinadi."})
        return False

    @staticmethod
    def phone_value(data: dict[str, object]) -> str:
        phone = re.sub(r"[^\d+]", "", str(data.get("phone", "")))
        if not phone.startswith("+998") and re.match(r"^998\d{9}$", phone):
            phone = "+" + phone
        if not re.fullmatch(r"\+998\d{9}", phone):
            raise ValueError("Telefon raqami +998 formatida bo‘lishi kerak (masalan, +998 90 123 45 67).")
        return phone

    def register(self, data: dict[str, object]) -> None:
        name = str(data.get("name", "")).strip()
        password = str(data.get("password", ""))
        phone = self.phone_value(data)
        if len(name) < 2 or len(name) > 80:
            raise ValueError("Ism kamida 2 ta belgidan iborat bo‘lsin.")
        if len(password) < 8 or len(password) > 256:
            raise ValueError("Parol kamida 8 ta belgidan iborat bo‘lishi kerak.")
        with db() as connection:
            try:
                cursor = connection.execute(
                    "INSERT INTO users (name, phone, password_hash, created_at) VALUES (?, ?, ?, ?)",
                    (name, phone, password_hash(password), datetime.now(timezone.utc).isoformat()),
                )
            except sqlite3.IntegrityError as exc:
                raise ValueError("Bu telefon raqam allaqachon ro‘yxatdan o‘tgan.") from exc
            user_id = cursor.lastrowid
        self.set_session("user", int(user_id))

    def login(self, data: dict[str, object]) -> None:
        phone = self.phone_value(data)
        with db() as connection:
            row = connection.execute("SELECT id, password_hash, blocked FROM users WHERE phone=?", (phone,)).fetchone()
        if not row or row["blocked"] or not verify_password(str(data.get("password", "")), row["password_hash"]):
            self.respond(401, {"error": "Telefon raqami yoki parol noto‘g‘ri."})
            return
        self.set_session("user", int(row["id"]))

    def admin_login(self, data: dict[str, object]) -> None:
        username_input = str(data.get("username", "")).strip()
        password_input = str(data.get("password", ""))
        env_username = os.environ.get("ADMIN_USERNAME", "")
        env_hash = os.environ.get("ADMIN_PASSWORD_HASH", "")

        authenticated = False
        if env_username and env_hash:
            if hmac.compare_digest(username_input, env_username) and verify_password(password_input, env_hash):
                authenticated = True
        else:
            with db() as connection:
                row = connection.execute("SELECT password_hash FROM admin_users WHERE username=?", (username_input,)).fetchone()
                if row and verify_password(password_input, row["password_hash"]):
                    authenticated = True

        if not authenticated:
            self.respond(401, {"error": "Admin login yoki parol noto‘g‘ri."})
            return

        self.set_session("admin")

    def save_product(self, data: dict[str, object], product_id: int | None = None) -> None:
        title = str(data.get("title", "")).strip()
        image = str(data.get("image", "")).strip()
        images_json = str(data.get("images_json", "[]")).strip()
        price = safe_int(data.get("price"), -1)
        stock = safe_int(data.get("stock"), -1)
        old_price = safe_int(data.get("old_price"), 0)
        category = str(data.get("category", "Futbol formalari"))[:100]
        brand = str(data.get("brand", "KELME"))[:80]
        sku = str(data.get("sku", ""))[:80]

        if not title or len(title) > 160 or price < 0 or stock < 0:
            raise ValueError("Mahsulot nomi, narxi yoki ombordagi qoldig‘i noto‘g‘ri.")
        if image and (not image.startswith("/") or ".." in image or len(image) > 500):
            raise ValueError("Rasm manzili noto‘g‘ri.")

        fields = (
            title,
            str(data.get("title_ru", title))[:160],
            str(data.get("title_en", title))[:160],
            str(data.get("description", ""))[:4000],
            category,
            brand,
            sku,
            price,
            max(0, old_price),
            stock,
            image,
            images_json,
            1 if data.get("active", True) else 0,
        )
        with db() as connection:
            if product_id is None:
                connection.execute(
                    """INSERT INTO products (title,title_ru,title_en,description,category,brand,sku,price,old_price,stock,image,images_json,active,created_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (*fields, datetime.now(timezone.utc).isoformat()),
                )
            else:
                cursor = connection.execute(
                    """UPDATE products SET title=?,title_ru=?,title_en=?,description=?,category=?,brand=?,sku=?,
                       price=?,old_price=?,stock=?,image=?,images_json=?,active=? WHERE id=?""",
                    (*fields, product_id),
                )
                if cursor.rowcount == 0:
                    self.respond(404, {"error": "Mahsulot topilmadi."})
                    return
        self.respond(200, {"ok": True})

    def save_promo(self, data: dict[str, object]) -> None:
        code = str(data.get("code", "")).strip().upper()
        if not re.fullmatch(r"[A-Z0-9_-]{3,30}", code):
            raise ValueError("Promokod 3–30 ta lotin harfi yoki raqam bo‘lsin.")
        expires = str(data.get("expires_at", ""))[:10]
        limit = safe_int(data.get("usage_limit"), 0)
        if limit < 0:
            raise ValueError("Foydalanish limiti manfiy bo‘lishi mumkin emas.")
        with db() as connection:
            try:
                connection.execute(
                    "INSERT INTO promos (code,enabled,expires_at,usage_limit) VALUES (?,?,?,?)",
                    (code, 1, expires, limit),
                )
            except sqlite3.IntegrityError as exc:
                raise ValueError("Bu promokod avval yaratilgan.") from exc
        self.respond(200, {"ok": True})

    def validate_promo(self, data: dict[str, object]) -> None:
        code = str(data.get("code", "")).strip().upper()
        subtotal = safe_int(data.get("subtotal"), -1)
        if subtotal < 0:
            raise ValueError("Savat summasi noto‘g‘ri.")
        with db() as connection:
            promo = connection.execute("SELECT * FROM promos WHERE code=? AND enabled=1", (code,)).fetchone()
        if not promo:
            raise ValueError("Promokod faol emas yoki topilmadi.")
        if promo["expires_at"] and promo["expires_at"] < datetime.now().date().isoformat():
            raise ValueError("Promokod muddati tugagan.")
        if promo["usage_limit"] and promo["uses"] >= promo["usage_limit"]:
            raise ValueError("Promokod foydalanish limiti tugagan.")
        discount = 100_000 if subtotal > 800_000 else (50_000 if subtotal > 400_000 else 0)
        if not discount:
            raise ValueError("Chegirma uchun buyurtma summasi 400 000 so‘mdan oshishi kerak.")
        self.respond(200, {"ok": True, "discount": discount, "code": code})

    def update_promo(self, promo_id: int, data: dict[str, object]) -> None:
        with db() as connection:
            cursor = connection.execute(
                "UPDATE promos SET enabled=?, expires_at=?, usage_limit=? WHERE id=?",
                (1 if data.get("enabled") else 0, str(data.get("expires_at", ""))[:10],
                 max(0, safe_int(data.get("usage_limit"), 0)), promo_id),
            )
        self.respond(200, {"updated": cursor.rowcount > 0})

    def create_review(self, product_id: int, data: dict[str, object]) -> None:
        user = self.current_user()
        if not user:
            self.respond(401, {"error": "Sharh qoldirish uchun tizimga kiring."})
            return
        rating = safe_int(data.get("rating"), 5)
        comment = str(data.get("comment", "")).strip()[:1000]
        if rating < 1 or rating > 5:
            raise ValueError("Reyting 1 dan 5 gacha bo'lishi kerak.")
        if len(comment) < 3:
            raise ValueError("Sharh matnini yozing (kamida 3 ta belgi).")
        with db() as connection:
            # Check if user already reviewed
            existing = connection.execute(
                "SELECT 1 FROM reviews WHERE product_id=? AND user_id=?",
                (product_id, user["id"]),
            ).fetchone()
            if existing:
                raise ValueError("Siz ushbu mahsulotga avval sharh qoldirgansiz.")
            connection.execute(
                "INSERT INTO reviews (product_id, user_id, user_name, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (product_id, user["id"], user["name"], rating, comment, datetime.now(timezone.utc).isoformat()),
            )
        self.respond(201, {"ok": True})

    def update_review(self, review_id: int, data: dict[str, object]) -> None:
        with db() as connection:
            cursor = connection.execute(
                "UPDATE reviews SET hidden=? WHERE id=?",
                (1 if data.get("hidden") else 0, review_id),
            )
        self.respond(200, {"updated": cursor.rowcount > 0})

    def create_order(self, data: dict[str, object]) -> None:
        user = self.current_user()
        if not user:
            self.respond(401, {"error": "Buyurtma berish uchun avval tizimga kiring."})
            return
        items = data.get("items")
        if not isinstance(items, list) or not items or len(items) > 50:
            raise ValueError("Savat bo‘sh yoki mahsulotlar soni noto‘g‘ri.")

        requested_items: list[tuple[int, int, str, str]] = []
        item_ids: dict[int, int] = {}
        for item in items:
            if not isinstance(item, dict):
                raise ValueError("Savatdagi mahsulot noto‘g‘ri.")
            item_id = safe_int(item.get("id"), -1)
            quantity = safe_int(item.get("quantity"), -1)
            if item_id < 1 or quantity < 1 or quantity > 20:
                raise ValueError("Mahsulot miqdori noto‘g‘ri.")
            item_ids[item_id] = item_ids.get(item_id, 0) + quantity
            requested_items.append((
                item_id, quantity, str(item.get("size", ""))[:30], str(item.get("color", ""))[:60],
            ))

        region = str(data.get("region", "")).strip()[:100]
        method = str(data.get("delivery_method", "Yetkazib berish"))
        payment = str(data.get("payment_method", "Naqd pul"))
        address = str(data.get("address", "")).strip()[:400]
        if not region:
            raise ValueError("Yetkazib berish hududini tanlang.")
        if method not in {"Yetkazib berish", "Do‘kondan olib ketish"}:
            method = "Yetkazib berish"
        if method == "Yetkazib berish" and len(address) < 3:
            raise ValueError("Yetkazib berish manzilini kiriting.")
        if payment not in {"Naqd pul", "Karta orqali", "Click", "Payme"}:
            payment = "Naqd pul"

        with db() as connection:
            rows = connection.execute(
                f"SELECT * FROM products WHERE active=1 AND id IN ({','.join('?' for _ in item_ids)})",
                tuple(item_ids),
            ).fetchall()
            if len(rows) != len(item_ids):
                raise ValueError("Savatdagi mahsulotlardan biri topilmadi.")

            order_items = []
            subtotal = 0
            products_by_id = {row["id"]: row for row in rows}
            for product_id, count in item_ids.items():
                row = products_by_id[product_id]
                if row["stock"] < count:
                    raise ValueError(f"{row['title']} mahsulotidan omborda yetarli qoldiq yo‘q.")

            for product_id, count, size, color in requested_items:
                row = products_by_id[product_id]
                shown_price = max(0, row["price"] - 1)
                subtotal += shown_price * count
                order_items.append({
                    "id": row["id"], "name": row["title"], "sku": row["sku"],
                    "image": row["image"],
                    "size": size or "Standart", "color": color or "Klassik",
                    "quantity": count, "price": shown_price,
                })

            promo_code = str(data.get("promo_code", "")).strip().upper()
            discount = 0
            promo = None
            if promo_code:
                promo = connection.execute("SELECT * FROM promos WHERE code=? AND enabled=1", (promo_code,)).fetchone()
                if promo:
                    if not (promo["expires_at"] and promo["expires_at"] < datetime.now().date().isoformat()):
                        if not (promo["usage_limit"] and promo["uses"] >= promo["usage_limit"]):
                            discount = 100_000 if subtotal > 800_000 else (50_000 if subtotal > 400_000 else 0)

            delivery = 0
            total = max(0, subtotal - discount + delivery)
            created = datetime.now(timezone.utc).isoformat()
            cursor = connection.execute(
                """INSERT INTO orders (user_id,items_json,subtotal,discount,delivery_price,total,promo_code,
                   delivery_method,region,address,payment_method,comment,status,created_at)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (user["id"], json.dumps(order_items, ensure_ascii=False), subtotal, discount, delivery,
                 total, promo_code if discount > 0 else "", method, region, address, payment,
                 str(data.get("comment", ""))[:500], "Yangi", created),
            )
            for product_id, count in item_ids.items():
                connection.execute("UPDATE products SET stock=stock-? WHERE id=?", (count, product_id))
            if promo and discount > 0:
                connection.execute("UPDATE promos SET uses=uses+1 WHERE id=?", (promo["id"],))
            order_id = int(cursor.lastrowid)

        telegram_ok = self.send_telegram(order_id, user, order_items, subtotal, discount, delivery, total, region, address, method, payment, promo_code)
        self.respond(201, {"ok": True, "order_id": order_id, "telegram_sent": telegram_ok, "total": total})

    def send_telegram(self, order_id: int, user: dict[str, object], items: list[dict[str, object]],
                      subtotal: int, discount: int, delivery: int, total: int, region: str,
                      address: str, method: str, payment: str, promo: str) -> bool:
        token, chat_id = os.environ.get("TELEGRAM_BOT_TOKEN", ""), os.environ.get("TELEGRAM_CHAT_ID", "")
        if not token or not chat_id:
            return False
        safe = lambda value: str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        lines = [
            f"<b>⚽ Yangi buyurtma #{order_id}</b>",
            f"👤 Mijoz: {safe(user['name'])} · {safe(user['phone'])}",
            f"📍 Manzil: {safe(region)}, {safe(address)}",
            f"🚚 Yetkazish: {safe(method)}",
            f"💳 To‘lov usuli: {safe(payment)}",
            "📦 <b>Mahsulotlar:</b>",
        ]
        lines.extend(f"• {safe(item['name'])} [{safe(item['size'])}, {safe(item['color'])}] — {item['quantity']} × {item['price']:,} so‘m" for item in items)
        lines.extend([
            f"Oraliq summa: {subtotal:,} so‘m",
            f"Chegirma ({safe(promo)}): -{discount:,} so‘m" if discount > 0 else "Chegirma: 0 so‘m",
            f"<b>JAMI: {total:,} so‘m</b>"
        ])
        payload = urllib.parse.urlencode({"chat_id": chat_id, "text": "\n".join(lines), "parse_mode": "HTML"}).encode()
        request = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=payload, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=8) as response:
                return response.status == 200
        except Exception as exc:
            print(f"Telegram delivery failed for order {order_id}: {exc}")
            return False

    def contact(self, data: dict[str, object]) -> None:
        name = str(data.get("name", "")).strip()[:80]
        phone = self.phone_value(data)
        message = str(data.get("message", "")).strip()[:2000]
        if len(name) < 2 or len(message) < 3:
            raise ValueError("Ism va xabarni to‘liq kiriting.")
        token, chat_id = os.environ.get("TELEGRAM_BOT_TOKEN", ""), os.environ.get("TELEGRAM_CHAT_ID", "")
        if not token or not chat_id:
            self.respond(200, {"ok": True, "notice": "Xabaringiz qabul qilindi. (Telegram sozlanmagan)"})
            return
        text = f"sport.NAVOIY Aloqa xabari\nIsm: {name}\nTelefon: {phone}\nXabar: {message}"
        payload = urllib.parse.urlencode({"chat_id": chat_id, "text": text}).encode()
        request = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage", data=payload, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=8):
                self.respond(200, {"ok": True})
        except Exception as exc:
            print(f"Telegram contact delivery failed: {exc}")
            self.respond(502, {"error": "Telegramga xabar yuborilmadi."})

    def update_order(self, order_id: int, data: dict[str, object]) -> None:
        status = str(data.get("status", ""))
        if status not in {"Yangi", "Tasdiqlandi", "Yetkazilmoqda", "Yetkazildi", "Bekor qilindi"}:
            raise ValueError("Buyurtma holati noto‘g‘ri.")
        with db() as connection:
            cursor = connection.execute("UPDATE orders SET status=? WHERE id=?", (status, order_id))
        self.respond(200, {"updated": cursor.rowcount > 0})

    def update_user(self, user_id: int, data: dict[str, object]) -> None:
        with db() as connection:
            cursor = connection.execute("UPDATE users SET blocked=? WHERE id=?", (1 if data.get("blocked") else 0, user_id))
        self.respond(200, {"updated": cursor.rowcount > 0})


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "--hash-password":
        password = getpass("Yangi admin parolini kiriting: ")
        if len(password) < 8:
            raise SystemExit("Admin paroli kamida 8 belgidan iborat bo‘lsin.")
        print(password_hash(password))
        return
    initialize()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"sport.NAVOIY v2.0 serveri ishga tushdi: http://127.0.0.1:{PORT}")
    print(f"Admin panel: http://127.0.0.1:{PORT}/admin (Login: admin, Parol: admin2026)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer to‘xtatildi.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
