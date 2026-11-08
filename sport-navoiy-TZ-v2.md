# Texnik topshiriq (TZ): sport.NAVOIY onlayn do'koni

**Versiya:** 2.0 (buyurtmachi javoblari kiritilgan)
**Loyiha nomi:** sport.NAVOIY
**Yo'nalish:** faqat futbol mahsulotlari onlayn do'koni

---

## 1. Loyiha haqida

### 1.1. Maqsad
sport.NAVOIY — faqat futbolga oid mahsulotlar sotiladigan onlayn do'kon. Mijoz ro'yxatdan o'tadi, mahsulotni tanlaydi, savatga qo'shadi, promokod ishlatadi va buyurtma beradi. Buyurtma Telegram bot orqali do'kon egasiga yetib boradi.

### 1.2. Asosiy tamoyillar
- Dizayn **oddiy**, toza va tushunarli
- Telefondan foydalanish birinchi o'rinda (mobile-first)
- Faqat futbol yo'nalishi
- Barcha ikonkalar **SVG**; emoji va stikerlar hech qayerda ishlatilmaydi
- Mijoz ma'lumotlari va admin kirish ma'lumotlari xavfsiz saqlanadi

### 1.3. Maqsadli auditoriya
Futbol o'ynaydigan va sevadigan yoshlar va kattalar, jamoa uchun forma oluvchilar. Hudud: butun O'zbekiston.

---

## 2. Logotip va firma uslubi

- Logotip buyurtmachi tomonidan berilgan: **"D&A SPORT KELME"** (qora fonda, oltin va kumush ranglarda, toj, doira va sport ikonkalari bilan)
- Logotip headerda, footerda, brauzer tabida (favicon) va ijtimoiy tarmoq preview rasmida ishlatiladi
- **Rang palitrasi logotipdan olinadi:** oltin, kumush, qora

| Vazifasi | Kunduzgi rejim | Tungi rejim |
|----------|----------------|-------------|
| Fon | `#FFFFFF` | `#0B0B0D` |
| Kartochka foni | `#F4F4F5` | `#17171A` |
| Asosiy matn | `#16161A` | `#F2F2F3` |
| Ikkinchi darajali matn | `#6B7280` | `#A1A1AA` |
| Aksent (oltin) | `#B8901F` | `#D4AF37` |
| Chegirma / xato | `#D32F2F` | `#FF5A52` |

- Logotip qora fonli bo'lgani uchun **kunduzgi rejimda** u yumaloq yoki yumshoq burchakli qora "nishon" ichida ko'rsatiladi. Ideal variant: **shaffof fonli (PNG yoki SVG)** logotip. Buyurtmachi bunday fayl bera olsa, yaxshiroq natija bo'ladi.
- Logotip tarkibidagi nom (D&A SPORT KELME) va sayt nomi (sport.NAVOIY) farq qiladi. Sahifa sarlavhasi (title) va matnlarda **sport.NAVOIY** ishlatiladi, logotip rasm sifatida o'z holicha turadi.

---

## 3. Sayt tuzilishi (sahifalar)

| № | Sahifa | Yo'l | Tavsif |
|---|--------|------|--------|
| 1 | Bosh sahifa | `/` | Banner, kategoriyalar, yangi va ommabop mahsulotlar |
| 2 | Katalog | `/catalog` | Filtr, saralash, qidiruv |
| 3 | Kategoriya | `/catalog/:kategoriya` | Kategoriya mahsulotlari |
| 4 | Mahsulot | `/product/:id` | Batafsil ma'lumot, sharhlar |
| 5 | Savat | `/cart` | Tanlangan mahsulotlar, promokod |
| 6 | Buyurtma rasmiylashtirish | `/checkout` | Ma'lumot, yetkazib berish, to'lov |
| 7 | Buyurtma qabul qilindi | `/success` | Buyurtma raqami |
| 8 | Kirish / Ro'yxatdan o'tish | `/login`, `/register` | Foydalanuvchi uchun |
| 9 | Shaxsiy kabinet | `/account` | Ma'lumotlar, buyurtmalar, sevimlilar |
| 10 | Sevimlilar | `/wishlist` | Saqlangan mahsulotlar |
| 11 | Biz haqimizda | `/about` | Qisqacha ma'lumot |
| 12 | Aloqa | `/contact` | Telefon, manzil, ijtimoiy tarmoqlar |
| 13 | Yetkazib berish va to'lov | `/delivery` | Shartlar |
| 14 | Maxfiylik siyosati | `/privacy` | Ma'lumotlar bilan ishlash |
| 15 | 404 | `/404` | Sahifa topilmadi |
| 16 | Admin panel | alohida yo'l | 10-bo'lim |

---

## 4. Mahsulot kategoriyalari (tasdiqlangan)

1. Futbol formalari (klub va terma jamoa)
2. Futbolka va shortiklar
3. Futbol getrlari / paypoqlar
4. Mashg'ulot kiyimlari (kostyum, kurtka, sviter)
5. Darvozabon kiyimlari va qo'lqoplari
6. Futbol butsalari va krossovkalari
7. Himoya vositalari (shchitok va boshqalar)
8. Futbol to'plari
9. Aksessuarlar (sumka, kapitan lentasi, shapka)

Kategoriyalar admin paneldan qo'shiladi, tahrirlanadi va o'chiriladi (3 tilda nomlanadi).

---

## 5. Funksional talablar

### 5.1. Bosh sahifa
- Header: logotip, menyu, qidiruv, til tanlash (UZ / EN / RU), rejim almashtirgich, sevimlilar, savat, kirish
- Asosiy banner (1–3 slayd, admin paneldan boshqariladi)
- Kategoriyalar bloki
- "Yangi mahsulotlar" va "Ommabop mahsulotlar" bloklari
- "Nega bizni tanlaydilar" (yetkazib berish, sifat, qulay to'lov)
- Footer: aloqa, ijtimoiy tarmoqlar, foydali havolalar

### 5.2. Katalog
- Mahsulotlar grid ko'rinishida
- **Filtrlar:** kategoriya, narx oralig'i, o'lcham, rang, brend, klub/jamoa, mavjudligi
- **Saralash:** arzon → qimmat, qimmat → arzon, yangilari, ommabopligi
- Nom bo'yicha qidiruv
- Sahifalash yoki "Yana ko'rsatish"

### 5.3. Mahsulot kartochkasi
Rasm, nom, narx, "Yangi" / "Chegirma" belgisi, sevimlilarga qo'shish (SVG yurakcha), "Savatga" tugmasi.

### 5.4. Mahsulot sahifasi
- Rasmlar galereyasi (3–5 ta, kattalashtirish bilan)
- Nom, brend, artikul, narx (6-bo'lim qoidasi bilan)
- O'lcham tanlash (kiyim: S–XXL, bolalar: yosh bo'yicha, butsa: 36–46), rang tanlash, miqdor
- "Savatga qo'shish" va "Hoziroq sotib olish"
- Tavsif (material, parvarish), o'lchamlar jadvali (o'lcham gidi)
- Omborda mavjudligi
- **Sharhlar bloki** (5.9-band)
- O'xshash mahsulotlar

### 5.5. Savat
- Mahsulot ro'yxati (rasm, nom, o'lcham, rang, narx, miqdor), miqdorni o'zgartirish, o'chirish
- **Promokod kiritish maydoni** (7-bo'lim)
- Oraliq summa, chegirma, yetkazib berish narxi, jami summa
- Savat ma'lumoti brauzerda saqlanadi; kirgan foydalanuvchi uchun serverda ham saqlanishi mumkin

### 5.6. Buyurtma rasmiylashtirish
Ro'yxatdan o'tgan foydalanuvchi uchun ism va telefon avtomatik to'ldiriladi. Kiritiladigan ma'lumotlar:
- Ism, telefon (+998 formatida tekshiruv bilan)
- Yetkazib berish usuli: yetkazib berish yoki do'kondan olib ketish
- Viloyat, shahar/tuman, manzil
- Izoh (ixtiyoriy)
- To'lov usuli (9-bo'lim)

Buyurtma yakunida **buyurtma raqami** ko'rsatiladi va buyurtma Telegram botga yuboriladi.

### 5.7. Ro'yxatdan o'tish va shaxsiy kabinet (majburiy)
- Ro'yxatdan o'tish: ism, telefon raqami, parol
- Parol tekshiruvi (kamida 8 belgi), parol serverda **shifrlangan (hash)** holda saqlanadi
- Soxta akkauntlarga qarshi: telefon raqamini tasdiqlash (SMS yoki Telegram bot orqali) tavsiya etiladi. Qaysi usul tanlanishi ishlab chiqish bosqichida kelishiladi.
- **Ro'yxatdan o'tgan har bir foydalanuvchi admin panelda ko'rinadi** (10-bo'lim)
- Kabinet: shaxsiy ma'lumotlar, buyurtmalar tarixi, sevimlilar, saqlangan manzillar
- Buyurtma berish va sharh yozish uchun ro'yxatdan o'tish talab qilinadi

### 5.8. Sevimlilar
Mahsulotni sevimlilarga qo'shish va olib tashlash, alohida sahifa.

### 5.9. Sharhlar (haqiqiy odamlar uchun)
Qoidalar:
1. Sharhni **faqat ro'yxatdan o'tgan haqiqiy foydalanuvchi o'zi qo'lda** yozadi
2. Bot, avtomatik yoki sun'iy intellekt orqali sharh yaratish **mumkin emas**
3. Admin paneldan **sharh yozish yoki tahrirlash funksiyasi bo'lmaydi.** Admin faqat nomaqbul sharhni (haqorat, reklama, spam) yashirishi yoki o'chirishi mumkin
4. Bir foydalanuvchi bitta mahsulotga bitta sharh qoldiradi
5. Sharh tarkibi: reyting (1–5 yulduz, SVG) va matn
6. Spamdan himoya: CAPTCHA va yozish tezligini cheklash
7. Sharhda foydalanuvchi ismi va sana ko'rsatiladi

### 5.10. Aloqa
- **Admin telefon raqami: +998 50 784 05 13** (bosilganda qo'ng'iroq qilinadi)
- Do'kon manzili, ish vaqti, xarita
- Telegram va Instagram havolalari
- Xabar yuborish formasi (ism, telefon, xabar), xabar Telegram botga keladi

---

## 6. Narxlar qoidasi

Saytda narx doimo **haqiqiy yaxlit narxdan 1 so'm kam** ko'rsatiladi.

| Adminda kiritilgan | Saytda ko'rinadi |
|--------------------|------------------|
| 300 000 so'm | **299 999 so'm** |
| 150 000 so'm | **149 999 so'm** |
| 85 000 so'm | **84 999 so'm** |

1. Admin panelda mahsulot narxi **yaxlit** kiritiladi (masalan, 300 000). Sayt avtomatik 1 so'm ayirib ko'rsatadi.
2. Qoida katalogda, mahsulot sahifasida, savatda va buyurtmada bir xil ishlaydi.
3. Valyuta so'm, raqamlar probel bilan: `299 999 so'm`.
4. Chegirma bo'lsa eski narx chizilgan holda ko'rsatiladi: ~~349 999~~ → **299 999 so'm**.
5. Savat jami summasi ko'rsatilgan narxlar yig'indisi bo'yicha hisoblanadi.
6. Promokod chegirmasi hisoblanadigan summa ham ko'rsatilgan narxlar yig'indisi.

---

## 7. Promokod

| Savat summasi | Chegirma |
|---------------|----------|
| 400 000 so'mdan **oshgan** | **50 000 so'm** |
| 800 000 so'mdan **oshgan** | **100 000 so'm** |

Qoidalar:
- Mijoz savatda promokodni kiritadi, tizim savat summasiga qarab chegirmani avtomatik hisoblaydi
- Summa 400 000 dan oshmasa, promokod qo'llanmaydi va "Chegirma uchun buyurtma summasi 400 000 so'mdan oshishi kerak" degan xabar chiqadi
- Bir buyurtmada bitta promokod
- Ikki chegirma qo'shilmaydi: 800 000 dan oshganda faqat 100 000 so'm chegirma beriladi (50 000 + 100 000 emas)
- Admin paneldan promokodlarni **yaratish, yoqish/o'chirish, amal qilish muddatini va foydalanish sonini cheklash** mumkin
- Chegirma summasi buyurtma, savat va Telegram xabarida ko'rinadi

---

## 8. Tungi / kunduzgi rejim

- Headerda almashtirgich (SVG: quyosh va oy)
- Birinchi kirishda qurilma sozlamasiga qarab avtomatik tanlanadi
- Tanlov brauzerda saqlanadi
- Almashganda sahifa qayta yuklanmaydi
- Ikkala rejimda ham matn va fon kontrasti o'qish uchun yetarli
- Logotip ikkala rejimda yaxshi ko'rinadi (2-bo'lim)

---

## 9. Ko'p tillilik, to'lov va yetkazib berish

### 9.1. Tillar
| Til | Kod | Izoh |
|-----|-----|------|
| O'zbek (lotin) | `uz` | Asosiy til |
| Ingliz | `en` | |
| Rus | `ru` | |

- Til almashtirgich headerda, tanlov saqlanadi
- Menyu, tugmalar, xato xabarlari, formalar, **mahsulot nomi va tavsifi, kategoriyalar** hammasi 3 tilda
- Admin panelda mahsulot va kategoriya 3 tilda kiritiladi
- Foydalanuvchi yozgan sharhlar tarjima qilinmaydi (yozilgan tilida qoladi)

### 9.2. To'lov usullari (hammasi bo'ladi)
- Naqd pul (yetkazib berilganda yoki do'konda)
- Karta orqali o'tkazma (Humo / Uzcard)
- Onlayn to'lov: **Click** va **Payme**

Click va Payme ulash uchun alohida **merchant (sotuvchi) akkaunti** kerak bo'ladi. Buni buyurtmachi to'lov tizimlarida rasmiylashtiradi.

### 9.3. Yetkazib berish
- **Barcha viloyatlar** bo'yicha
- Yetkazib berish narxi va muddati **viloyat bo'yicha** admin panelda belgilanadi
- Do'kondan olib ketish imkoni (bepul)
- Shartlar "Yetkazib berish va to'lov" sahifasida

### 9.4. Buyurtmani qabul qilish: Telegram bot
Buyurtma berilganda botga xabar boradi:
- Buyurtma raqami va vaqti
- Mijoz ismi, telefoni, viloyat va manzil
- Mahsulotlar (nom, artikul, o'lcham, rang, miqdor, narx)
- Promokod va chegirma summasi
- Yetkazib berish usuli va narxi
- To'lov usuli va to'lov holati
- Jami summa

Aloqa formasidagi xabarlar ham shu botga keladi. **Bot tokeni faqat serverda saqlanadi**, sayt kodida ochiq turmaydi.

---

## 10. Admin panel

### 10.1. Kirish va xavfsizlik (muhim)
- Admin panelga kirish **login va parol bilan** himoyalangan
- **Login va parol sayt kodida, sahifalarda, TZ hujjatida yoki brauzerga yuklanadigan hech qanday faylda ochiq yozilmaydi.** Ularni faqat buyurtmachi biladi
- Tekshiruv **faqat serverda** bajariladi, parol serverda shifrlangan (hash) holda saqlanadi
- Admin panelga havola saytning ochiq menyusida ko'rsatilmaydi
- Noto'g'ri urinishlar soni cheklanadi (ketma-ket xato kiritilsa vaqtincha bloklanadi)
- Admin kirish ma'lumotlari ishlab chiquvchiga hujjat orqali emas, **maxfiy tarzda alohida** yetkaziladi yoki buyurtmachining o'zi serverda kiritadi
- Sessiya muddati cheklangan, "Chiqish" tugmasi bor
- Admin telefon raqami va bot tokeni kabi sozlamalar ham frontend kodida ochiq turmaydi

### 10.2. Imkoniyatlar
| Bo'lim | Imkoniyat |
|--------|-----------|
| Mahsulotlar | Qo'shish, tahrirlash, o'chirish, rasm yuklash. Maydonlar: nom (3 til), tavsif (3 til), kategoriya, brend, klub, yaxlit narx, chegirma, o'lchamlar, ranglar, ombordagi miqdor, artikul |
| Kategoriyalar | Qo'shish, tahrirlash (3 tilda) |
| Foydalanuvchilar | **Ro'yxatdan o'tganlar ro'yxati:** ism, telefon, ro'yxatdan o'tgan sana, buyurtmalar soni. Qidiruv va bloklash |
| Buyurtmalar | Ro'yxat, holatini o'zgartirish (yangi, tasdiqlandi, yetkazilmoqda, yetkazildi, bekor qilindi) |
| Promokodlar | Yaratish, yoqish/o'chirish, muddat va limit |
| Sharhlar | Ko'rish, nomaqbulini yashirish yoki o'chirish (yozish va tahrirlash yo'q) |
| Yetkazib berish | Viloyat bo'yicha narx va muddat |
| Bannerlar | Bosh sahifa bannerlarini almashtirish |
| Sozlamalar | Aloqa ma'lumotlari, ijtimoiy tarmoq havolalari |

Admin panel telefon va kompyuterda ishlaydigan bo'lishi kerak. Foydalanuvchilar ro'yxatida parollar hech qachon ko'rsatilmaydi.

---

## 11. SEO va tezlik

- Har sahifa uchun alohida title va meta description
- Mahsulotlar uchun tushunarli havolalar
- Rasmlar siqilgan va lazy load
- Telefonda sahifa 3 soniyadan tez ochilishi
- Open Graph (Telegram va Instagramda chiroyli preview)
- Til versiyalari uchun hreflang
- Domen hozircha yo'q: sayt dastlab hosting beradigan vaqtinchalik manzilda ishlaydi, domen keyin ulanadi

---

## 12. Texnik talablar

- Brauzerlar: Chrome, Safari, Firefox, Edge (so'nggi 2 versiya)
- Qurilmalar: Android, iOS, planshet, kompyuter
- Breakpointlar: 360px, 768px, 1024px, 1280px; tugmalar kamida 44px
- **Server qismi (backend) majburiy.** Ro'yxatdan o'tish, admin panel, sharhlar, promokodlar va xavfsiz parol tekshiruvi faqat brauzer xotirasi (localStorage) bilan xavfsiz ishlay olmaydi. Texnologiya (masalan, Node.js + ma'lumotlar bazasi yoki tayyor xizmat) ishlab chiqish bosqichida kelishiladi
- Savat, til va rejim tanlovi brauzerda saqlanadi
- HTTPS (SSL) majburiy
- Formalarda tekshiruv (validatsiya) va spamdan himoya
- Shaxsiy ma'lumotlar (ism, telefon, manzil) faqat buyurtma va aloqa uchun ishlatiladi, maxfiylik siyosati sahifasi bor

---

## 13. Buyurtmachi taqdim etadigan materiallar

| Nima | Holati |
|------|--------|
| Logotip | Berilgan. Shaffof fonli (PNG/SVG) variant bo'lsa yaxshi |
| Mahsulot rasmlari, nomlari, narxlari | Buyurtmachida bor |
| Admin telefon raqami | +998 50 784 05 13 |
| Admin login va parol | Maxfiy, alohida yetkaziladi |
| Telegram bot (tokeni va buyurtma keladigan chat) | Kerak |
| Do'kon manzili va ish vaqti | Kerak |
| Telegram va Instagram havolalari | Kerak |
| Click va Payme merchant ma'lumotlari | Kerak |
| Viloyatlar bo'yicha yetkazib berish narxlari | Kerak |
| Domen | Hozircha kerak emas |

---

## 14. Ishlab chiqish bosqichlari

| Bosqich | Mazmuni |
|---------|---------|
| 1 | TZ ni tasdiqlash, materiallarni yig'ish |
| 2 | Dizayn: bosh sahifa, katalog, mahsulot, savat (ikki rejimda) |
| 3 | Frontend: sahifalar, rejimlar, 3 til |
| 4 | Backend: ro'yxatdan o'tish, mahsulotlar bazasi, sharhlar, promokod |
| 5 | Admin panel va xavfsizlik |
| 6 | Savat, buyurtma, Telegram bot, to'lov tizimlari |
| 7 | Mahsulotlarni kiritish, tarjimalar |
| 8 | Sinov (telefon va kompyuter), xatolarni tuzatish |
| 9 | Ishga tushirish (hosting, SSL) |

---

## 15. Qabul qilish mezonlari

- [ ] Barcha sahifalar telefon va kompyuterda to'g'ri ko'rinadi
- [ ] Tungi va kunduzgi rejim ishlaydi, tanlov eslab qolinadi
- [ ] 3 til (UZ, EN, RU) to'liq tarjima qilingan
- [ ] Narxlar "1 so'm kam" qoidasiga mos (adminda 300 000 → saytda 299 999)
- [ ] Katalog, filtr, qidiruv va saralash ishlaydi
- [ ] Mahsulotni o'lcham va rang bilan savatga qo'shish mumkin
- [ ] Ro'yxatdan o'tish ishlaydi va foydalanuvchilar admin panelda ko'rinadi
- [ ] Promokod: 400 000 dan oshganda 50 000, 800 000 dan oshganda 100 000 chegirma to'g'ri hisoblanadi
- [ ] Sharhni faqat ro'yxatdan o'tgan odam yoza oladi, adminda sharh yozish funksiyasi yo'q
- [ ] Buyurtma Telegram botga to'liq ma'lumot bilan yetib boradi
- [ ] Naqd, karta, Click va Payme to'lov usullari ishlaydi
- [ ] Barcha viloyatlarga yetkazib berish narxlari hisoblanadi
- [ ] Admin login va parol sayt kodida, sahifalarda va hujjatlarda ochiq ko'rinmaydi
- [ ] Emoji va stikerlar umuman yo'q, ikonkalar SVG
- [ ] Logotip va favicon to'g'ri joylashtirilgan
- [ ] Sahifalar telefonda tez yuklanadi

---

*Hujjat oxiri.*
