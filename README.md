# sport.NAVOIY — Professional Futbol Onlayn Do‘koni v2.0

Rasmiy Kelme va Jako futbol mahsulotlari do‘koni. Ushbu loyiha maxsus taqdim etilgan dizayn tizimi (Pitch Black Gold) bo‘yicha ham kompyuter (desktop), ham telefon (mobile) uchun 100% moslashtirilgan.

Do‘konda to‘liq funksional xarid jarayoni, 3 bosqichli buyurtma rasmiylashtirish (stepper), promokodlar tizimi, ko‘p tillilik (UZ / RU / EN), tungi va kunduzgi rejim (Dark / Light mode) hamda to‘liq Admin boshqaruv paneli mavjud.

---

## 🚀 Ishga tushirish

Loyiha Python standart kutubxonasi va SQLite’dan foydalanadi (qo‘shimcha paket o‘rnatish shart emas):

```powershell
py server.py
```

Server ishga tushgach brauzerda:
- **Asosiy do‘kon (Mijozlar uchun):** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Admin boshqaruv paneli:** [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

---

## 🔐 Admin Panel Kirish Ma'lumotlari

Tizimda birlamchi xavfsiz admin hisobi sozlangan:
- **Login:** `admin`
- **Parol:** `admin2026`

Admin parolini o‘zgartirish yoki yangi xesh yaratish uchun:
```powershell
py server.py --hash-password
```

O‘z maxfiy qiymatlaringizni muhit o‘zgaruvchilari orqali xavfsiz kiritishingiz mumkin:
```powershell
$env:ADMIN_USERNAME = "sizning_loginingiz"
$env:ADMIN_PASSWORD_HASH = "yuqoridagi buyruq bergan pbkdf2 xeshi"
py server.py
```

---

## ⚡ Asosiy Imkoniyatlar va Qoidalar

1. **-1 So'm Narx Qoidasi (Majburiy):**
   - Papkalarda va adminda kiritilgan narxlar (masalan: 120 000, 250 000, 450 000 so‘m) saytda avtomatik 1 so‘m ayirib ko‘rsatiladi: `119 999 so‘m`, `249 999 so‘m`, `449 999 so‘m`.
   - Eski narxlar chizilgan holda ko‘rsatiladi (masalan: ~~499 999~~ → 449 999 so‘m).
   - Savat va buyurtma jami summasi ko‘rsatilgan narxlar bo‘yicha aniq hisoblanadi.

2. **9 ta Rasmiy Kategoriya (TZ bo‘yicha):**
   - Futbol formalari (klub va milliy terma jamoa)
   - Futbolka va shortiklar
   - Futbol getrlari / paypoqlar
   - Mashg‘ulot kiyimlari
   - Darvozabon kiyimlari va qo‘lqoplari
   - Futbol butsalari va krossovkalari
   - Himoya vositalari
   - Futbol to‘plari
   - Aksessuarlar (sumka, kepka va boshqalar)

3. **Ko‘p Rasmli Galereya (Multi-photo Gallery):**
   - Papkadagi barcha rasmlar (masalan, sarakanoshkalar uchun 34 ta, kelme futbolkalar uchun 16 ta rasm) mahsulot batafsil oynasida interaktiv miniatyuralar bilan almashinadi.
   - O‘lcham tanlash (kiyimlar uchun S, M, L, XL, XXL; poyabzallar uchun 38–45), rang kiritish va miqdor tanlash mavjud.

4. **Promokod Tizimi (TZ 7-bo‘lim):**
   - 400 000 so‘mdan oshganda: **50 000 so‘m** avtomatik chegirma.
   - 800 000 so‘mdan oshganda: **100 000 so‘m** avtomatik chegirma.
   - Birlamchi promokod: `YANGI2026`.

5. **3 Bosqichli Xarid Jarayoni (Stepper):**
   - 1. Savat (tovarlar, miqdor, promokod)
   - 2. Yetkazib berish (Mijoz ismi, telefon, O‘zbekistonning 14 ta viloyati, to‘liq manzil)
   - 3. To‘lov va Tasdiq (Naqd pul, Karta orqali Humo/Uzcard, Click, Payme)
   - Buyurtma muvaffaqiyatli topshirilgach unikal `#ID` beriladi.

6. **Haqiqiy Sharhlar Tizimi (TZ 5.9):**
   - Faqat ro‘yxatdan o‘tgan mijoz o‘z nomidan 1 dan 5 gacha yulduz va fikr yozishi mumkin.
   - Admin sharh yoza olmaydi yoki tahrirlay olmaydi, faqat nomaqbul sharhni yashirishi yoki o‘chirishi mumkin.

7. **Admin Boshqaruv Paneli:**
   - **Boshqaruv paneli (Dashboard):** Jami savdo, yangi buyurtmalar, mijozlar va tovarlar KPI matritsasi.
   - **Buyurtmalar nazorati:** Holatlar bo‘yicha filtr ("Yangi", "Tasdiqlandi", "Yetkazilmoqda", "Yetkazildi", "Bekor qilindi"), to‘liq mijoz va mahsulotlar tafsilotlari.
   - **Mahsulotlar:** Yangi mahsulot qo‘shish, tahrirlash, o‘chirish, serverdagi rasmlardan vizual tanlash imkoniyati.
   - **Mijozlar bazasi:** Ro‘yxatdan o‘tganlar ro‘yxati, buyurtmalar soni, mijozni bloklash / blokdan chiqarish.
   - **Promokodlar:** Yangi promokod yaratish, yoqish / o‘chirish, muddat va limit belgilash.
   - **Sharhlar moderatsiyasi:** Sharhlarni ko‘rish, yashirish yoki o‘chirish.

8. **Telegram Bot Integratsiyasi (Ixtiyoriy):**
   Buyurtmalar va aloqa xabarlari Telegram botga borishi uchun:
   ```powershell
   $env:TELEGRAM_BOT_TOKEN = "bot_tokeni"
   $env:TELEGRAM_CHAT_ID = "chat_id"
   py server.py
   ```
