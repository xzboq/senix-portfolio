import type { L, Locale } from "./i18n";

export type Slug = "kiber-yordamchi" | "senixsearch" | "wishpool" | "weather" | "drift-chirchik" | "fresh-chirchik";

export interface FlowNode {
  t: string;
  dashed?: boolean;
}
export interface Project {
  slug: Slug;
  num: string;
  name: string;
  statusKey: "kiber" | "search" | "wish" | "weather" | "drift" | "fresh";
  stack: string[];
  github?: string;
  live?: string;
  /** Колонки схемы: подписи локализованы в text.flow, узлы — технические названия. */
  flow: FlowNode[][];
  text: L<ProjectText>;
}
export interface ProjectText {
  kind: string;
  tagline: string;
  problem: string;
  solution: string;
  flow: string[];
  flowLead: string;
  features: string[];
  facts: { k: string; v: string }[];
  honest: string[];
}

export const projects: Project[] = [
  {
    slug: "kiber-yordamchi",
    num: "01",
    name: "Kiber Yordamchi",
    statusKey: "kiber",
    stack: ["Python", "aiogram 3", "SQLAlchemy 2", "httpx", "SQLite / PostgreSQL", "pytest"],
    flow: [
      [{ t: "URL" }, { t: "Message" }, { t: "APK file" }],
      [{ t: "URL normalize" }, { t: "SSRF guard · pinned IP" }, { t: "Quarantine · never executed" }],
      [{ t: "url_scanner" }, { t: "message_analyzer" }, { t: "apk_analyzer" }, { t: "threat_intel" }],
      [{ t: "Signals" }, { t: "Risk Engine" }, { t: "Evidence E01…" }],
      [{ t: "Verdict + score" }, { t: "Action plan" }, { t: "History · reports" }],
    ],
    text: {
      en: {
        kind: "Telegram bot · anti-fraud",
        tagline: "An anti-fraud bot for Uzbekistan: it checks links, messages and APK files, and explains its verdict with evidence.",
        problem:
          "In Telegram, scammers ask you to “vote” for someone, to send the code from an SMS, promise prizes and copy the look of banks. A person has seconds to decide whether a link, a message or a file can be trusted, and no way to see why it looks wrong.",
        solution:
          "Kiber Yordamchi takes a link, a message or an APK and returns a verdict, a score and numbered evidence (E01, E02…) with a recommendation. If you already entered a code, an incident-response scenario walks you through what to do next.",
        flow: ["Input", "Guards", "Analyzers", "Engine", "Result"],
        flowLead: "Everything an analyzer notices becomes a typed signal. Only the Risk Engine turns signals into a verdict.",
        features: [
          "Link check: normalization, SSRF-safe fetch, redirect analysis, HTML patterns (OTP forms, password and card collection, brand imitation, homoglyph domains).",
          "Message check: urgency, fake voting, fake giveaways, investment bait, code requests, fake support; links inside are scanned too.",
          "APK static analysis: SHA-256, magic bytes, manifest, dangerous permissions and combinations (SMS + INTERNET = OTP interception), DEX strings, embedded bot tokens, signing certificate.",
          "Threat intelligence: URLhaus and OpenPhish (no keys) plus optional VirusTotal. Cached for one hour; an unavailable feed never breaks a scan.",
          "User reports feed a local threat base: an indicator becomes SUSPICIOUS after 3 reports and MALICIOUS after 5. Admin moderation with trust points.",
          "Privacy: one-time codes are masked in logs and in the database. Per-user rate limits.",
          "9 learning topics on buttons; interface in Russian, Uzbek and English.",
        ],
        facts: [
          { k: "Tests", v: "24" },
          { k: "APK limits", v: "5000 files · ×50 · 60 s" },
          { k: "Rate limits", v: "6 scans/min · 3 APK/h" },
          { k: "Verdicts", v: "SAFE → DANGEROUS + UNKNOWN" },
          { k: "Deploy", v: "long polling · no open ports" },
        ],
        honest: [
          "The source code is not published on GitHub yet, so there is no link to it here.",
          "The Engine Lab on this page is a port of the scoring code. The bot itself runs on a server.",
          "By the original spec, a dynamic APK sandbox, QR and screenshot checks and a public API are outside the MVP.",
        ],
      },
      ru: {
        kind: "Telegram-бот · антифрод",
        tagline: "Антифрод-бот для Узбекистана: проверяет ссылки, сообщения и APK-файлы и объясняет вердикт доказательствами.",
        problem:
          "В Telegram мошенники просят «проголосовать», прислать код из SMS, обещают призы и копируют внешний вид банков. У человека есть секунды, чтобы решить, можно ли доверять ссылке, сообщению или файлу, и нет способа увидеть, что именно выглядит подозрительно.",
        solution:
          "Kiber Yordamchi принимает ссылку, сообщение или APK и возвращает вердикт, оценку и пронумерованные доказательства (E01, E02…) с рекомендацией. Если код уже введён, сценарий реагирования на инцидент подскажет, что делать дальше.",
        flow: ["Вход", "Защита", "Анализаторы", "Движок", "Результат"],
        flowLead: "Всё, что замечает анализатор, становится типизированным сигналом. Только Risk Engine превращает сигналы в вердикт.",
        features: [
          "Проверка ссылок: нормализация, SSRF-защищённая загрузка, анализ редиректов, HTML-паттерны (формы OTP, сбор паролей и карт, имитация брендов, домены-омоглифы).",
          "Проверка сообщений: срочность, фальшивое голосование, фальшивые розыгрыши, инвестиционная приманка, просьбы прислать код, фальшивая поддержка; ссылки внутри тоже сканируются.",
          "Статический анализ APK: SHA-256, magic bytes, манифест, опасные разрешения и связки (SMS + INTERNET = перехват OTP), строки DEX, встроенные токены ботов, сертификат.",
          "Threat intelligence: URLhaus и OpenPhish (без ключей) плюс опциональный VirusTotal. Кэш на час; недоступный фид не ломает проверку.",
          "Жалобы пользователей формируют локальную базу угроз: индикатор становится SUSPICIOUS после 3 жалоб и MALICIOUS после 5. Админ-модерация с баллами доверия.",
          "Приватность: одноразовые коды маскируются в логах и БД. Лимиты запросов на пользователя.",
          "9 обучающих тем на кнопках; интерфейс на русском, узбекском и английском.",
        ],
        facts: [
          { k: "Тесты", v: "24" },
          { k: "Лимиты APK", v: "5000 файлов · ×50 · 60 с" },
          { k: "Лимиты запросов", v: "6 проверок/мин · 3 APK/час" },
          { k: "Вердикты", v: "SAFE → DANGEROUS + UNKNOWN" },
          { k: "Деплой", v: "long polling · без открытых портов" },
        ],
        honest: [
          "Исходный код пока не опубликован на GitHub, поэтому ссылки на него здесь нет.",
          "Engine Lab на этой странице — порт кода оценки. Сам бот работает на сервере.",
          "По исходному ТЗ динамическая песочница APK, проверка QR и скриншотов и публичный API находятся вне MVP.",
        ],
      },
      uz: {
        kind: "Telegram bot · antifrod",
        tagline: "Oʻzbekiston uchun antifrod-bot: havolalar, xabarlar va APK fayllarni tekshiradi va xulosani dalillar bilan tushuntiradi.",
        problem:
          "Telegramda firibgarlar “ovoz bering” deydi, SMS kodni yuborishni soʻraydi, sovrinlar va’da qiladi va banklar koʻrinishini nusxalaydi. Odamda havola, xabar yoki fayl ishonchli-yoʻqligini hal qilish uchun bir necha soniya bor va nima shubhali koʻrinayotganini koʻrishning yoʻli yoʻq.",
        solution:
          "Kiber Yordamchi havola, xabar yoki APK qabul qiladi va xulosa, baho hamda raqamlangan dalillarni (E01, E02…) tavsiya bilan qaytaradi. Agar kod allaqachon kiritilgan boʻlsa, hodisaga javob berish ssenariysi keyingi qadamlarni koʻrsatadi.",
        flow: ["Kirish", "Himoya", "Tahlilchilar", "Dvigatel", "Natija"],
        flowLead: "Tahlilchi payqagan har bir narsa turlangan signalga aylanadi. Signallarni xulosaga faqat Risk Engine aylantiradi.",
        features: [
          "Havola tekshiruvi: normalizatsiya, SSRF-himoyalangan yuklash, yoʻnaltirishlar tahlili, HTML andozalari (OTP formalar, parol va karta yigʻish, brend taqlidi, omoglif domenlar).",
          "Xabar tekshiruvi: shoshilish, soxta ovoz berish, soxta sovrin oʻyinlari, investitsiya oʻljasi, kod soʻrash, soxta yordam xizmati; ichidagi havolalar ham skanerlanadi.",
          "APK statik tahlili: SHA-256, magic bytes, manifest, xavfli ruxsatlar va bogʻlanishlar (SMS + INTERNET = OTP ushlash), DEX satrlari, ichiga joylangan bot tokenlari, sertifikat.",
          "Threat intelligence: URLhaus va OpenPhish (kalitsiz) hamda ixtiyoriy VirusTotal. Bir soatga keshlanadi; mavjud boʻlmagan oqim tekshiruvni buzmaydi.",
          "Foydalanuvchi shikoyatlari mahalliy tahdidlar bazasini hosil qiladi: indikator 3 ta shikoyatdan keyin SUSPICIOUS, 5 tadan keyin MALICIOUS boʻladi. Ishonch ballari bilan admin moderatsiyasi.",
          "Maxfiylik: bir martalik kodlar jurnal va bazada maskalanadi. Foydalanuvchi boʻyicha soʻrov limitlari.",
          "Tugmalardagi 9 ta oʻquv mavzu; interfeys rus, oʻzbek va ingliz tillarida.",
        ],
        facts: [
          { k: "Testlar", v: "24" },
          { k: "APK limitlari", v: "5000 fayl · ×50 · 60 s" },
          { k: "Soʻrov limitlari", v: "6 tekshiruv/daq · 3 APK/soat" },
          { k: "Xulosalar", v: "SAFE → DANGEROUS + UNKNOWN" },
          { k: "Joylashtirish", v: "long polling · ochiq portlarsiz" },
        ],
        honest: [
          "Manba kodi hali GitHubda nashr etilmagan, shuning uchun bu yerda unga havola yoʻq.",
          "Ushbu sahifadagi Engine Lab — baholash kodining portidir. Botning oʻzi serverda ishlaydi.",
          "Dastlabki topshiriqqa koʻra dinamik APK sandbox, QR va skrinshot tekshiruvi hamda ochiq API MVP dan tashqarida.",
        ],
      },
    },
  },
  {
    slug: "senixsearch",
    num: "02",
    name: "SenixSearch",
    statusKey: "search",
    stack: ["Python 3.10+", "python-telegram-bot 21", "httpx", "asyncio"],
    github: "https://github.com/SenixDev14yo/SenixSearch",
    flow: [
      [{ t: "Pronounceable candidates" }, { t: "Mask a?b?c" }, { t: "Rarity rating" }],
      [{ t: "t.me/<name>" }, { t: "tgme_page_title?" }],
      [{ t: "fragment.com/username/<name>" }, { t: "Available · Sold · Taken" }],
      [{ t: "Inline-button UI" }, { t: "Custom emoji entities" }, { t: "Traps · background poller" }],
    ],
    text: {
      en: {
        kind: "Telegram bot · tool",
        tagline: "A bot that hunts free, rare Telegram usernames and checks every one live against both Telegram and Fragment.",
        problem:
          "Most username checkers only look at t.me. But Telegram moved nearly all nice five-letter names to Fragment auctions, so a checker offers names that can’t actually be claimed. The name looks free, and the claim fails with “username is invalid”.",
        solution:
          "SenixSearch cross-checks Fragment, Telegram’s official username marketplace. A name is reported free only if it is free on t.me and absent from Fragment. The generator targets consonant-cluster names with rare letters (x z q j k w v) that were never auctioned.",
        flow: ["Generate", "Check t.me", "Check Fragment", "Reply"],
        flowLead: "Two independent checks, one honest answer. The bot only offers names that survive both.",
        features: [
          "Free search: pronounceable candidates, only genuinely claimable results are returned.",
          "Rare five-letter search built on the Fragment insight.",
          "Mask search (a?b?c) and rating search by length, rare letters and distinct characters.",
          "Traps: watch a taken username and get notified the moment it frees up.",
          "Premium decoration: animated custom emoji rendered inside message text, with graceful fallback.",
          "Per-user daily limits and a premium tier, in a single file with JSON storage.",
        ],
        facts: [
          { k: "Sources per name", v: "2" },
          { k: "License", v: "MIT" },
          { k: "Storage", v: "JSON · no database" },
          { k: "Runtime", v: "fully async" },
        ],
        honest: [
          "Availability comes from public web signatures (t.me and Fragment), not from a user MTProto session.",
          "The bot’s interface is in Russian.",
          "Not affiliated with Telegram or Fragment. Built for learning and portfolio purposes.",
        ],
      },
      ru: {
        kind: "Telegram-бот · инструмент",
        tagline: "Бот, который ищет свободные редкие юзернеймы Telegram и проверяет каждый вживую и в Telegram, и на Fragment.",
        problem:
          "Большинство чекеров смотрят только на t.me. Но Telegram перевёл почти все красивые пятибуквенные имена на аукционы Fragment, поэтому чекер предлагает имена, которые нельзя занять. Имя выглядит свободным, а при попытке занять появляется «username is invalid».",
        solution:
          "SenixSearch сверяется с Fragment — официальным маркетплейсом юзернеймов Telegram. Имя считается свободным, только если оно свободно на t.me и отсутствует на Fragment. Генератор целится в имена с кластерами согласных и редкими буквами (x z q j k w v), которые никогда не выставлялись на аукцион.",
        flow: ["Генерация", "Проверка t.me", "Проверка Fragment", "Ответ"],
        flowLead: "Две независимые проверки и один честный ответ. Бот предлагает только те имена, что прошли обе.",
        features: [
          "Свободный поиск: произносимые кандидаты, возвращаются только реально доступные имена.",
          "Поиск редких пятибуквенных имён на основе наблюдения о Fragment.",
          "Поиск по маске (a?b?c) и по рейтингу: длина, редкие буквы, разные символы.",
          "Ловушки: следит за занятым юзернеймом и сообщает, как только он освободится.",
          "Премиум-оформление: анимированные кастомные эмодзи внутри текста с корректным запасным вариантом.",
          "Дневные лимиты на пользователя и премиум-уровень; всё в одном файле с JSON-хранилищем.",
        ],
        facts: [
          { k: "Источников на имя", v: "2" },
          { k: "Лицензия", v: "MIT" },
          { k: "Хранилище", v: "JSON · без БД" },
          { k: "Рантайм", v: "полностью async" },
        ],
        honest: [
          "Доступность определяется по публичным веб-признакам (t.me и Fragment), а не через пользовательскую сессию MTProto.",
          "Интерфейс бота на русском.",
          "Не связан с Telegram и Fragment. Сделан в учебных целях и для портфолио.",
        ],
      },
      uz: {
        kind: "Telegram bot · vosita",
        tagline: "Telegramdagi boʻsh, noyob usernamelarni qidiradigan va har birini Telegram hamda Fragmentda jonli tekshiradigan bot.",
        problem:
          "Koʻpchilik tekshirgichlar faqat t.me ga qaraydi. Lekin Telegram deyarli barcha chiroyli besh harfli nomlarni Fragment auksionlariga oʻtkazgan, shuning uchun tekshirgich band qilib boʻlmaydigan nomlarni taklif qiladi. Nom boʻshdek koʻrinadi, band qilishda esa “username is invalid” chiqadi.",
        solution:
          "SenixSearch Fragment — Telegramning rasmiy username bozori — bilan solishtiradi. Nom faqat t.me da boʻsh va Fragmentda yoʻq boʻlsagina boʻsh deb hisoblanadi. Generator hech qachon auksionga qoʻyilmagan, noyob harflarli (x z q j k w v) undoshlar klasterli nomlarni nishonga oladi.",
        flow: ["Yaratish", "t.me tekshiruvi", "Fragment tekshiruvi", "Javob"],
        flowLead: "Ikki mustaqil tekshiruv, bitta halol javob. Bot faqat ikkalasidan ham oʻtgan nomlarni taklif qiladi.",
        features: [
          "Boʻsh qidiruv: talaffuz qilinadigan nomzodlar, faqat haqiqatan band qilish mumkin boʻlganlari qaytariladi.",
          "Fragment haqidagi kuzatuvga asoslangan noyob besh harfli nomlar qidiruvi.",
          "Maska (a?b?c) va reyting boʻyicha qidiruv: uzunlik, noyob harflar, turli belgilar.",
          "Tuzoqlar: band username’ni kuzatadi va u boʻshashi bilan xabar beradi.",
          "Premium bezak: xabar matni ichida animatsiyali maxsus emojilar, zaxira variant bilan.",
          "Foydalanuvchi uchun kunlik limitlar va premium daraja; hammasi JSON saqlashli bitta faylda.",
        ],
        facts: [
          { k: "Nom uchun manba", v: "2" },
          { k: "Litsenziya", v: "MIT" },
          { k: "Saqlash", v: "JSON · bazasiz" },
          { k: "Ishlash", v: "toʻliq async" },
        ],
        honest: [
          "Mavjudlik ochiq veb-belgilar (t.me va Fragment) orqali aniqlanadi, foydalanuvchi MTProto sessiyasi orqali emas.",
          "Botning interfeysi rus tilida.",
          "Telegram va Fragment bilan bogʻliq emas. Oʻrganish va portfolio maqsadida yaratilgan.",
        ],
      },
    },
  },
  {
    slug: "wishpool",
    num: "03",
    name: "WishPool",
    statusKey: "wish",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion", "Playwright"],
    live: "https://wishpool-two.vercel.app",
    flow: [
      [{ t: "Browser" }],
      [{ t: "Next.js App Router · 11 pages" }, { t: "WishPoolApp (client)" }],
      [{ t: "wishpool-data.ts · demo data" }, { t: "localStorage · wishpool:wishes" }, { t: "2 API route handlers · static" }],
      [{ t: "PostgreSQL schema · not connected", dashed: true }, { t: "Auth · uploads", dashed: true }],
    ],
    text: {
      en: {
        kind: "Web platform · MVP",
        tagline: "A platform for wishes and good deeds: publish a wish, and others help fulfil it fully or in part.",
        problem:
          "People have needs and wishes, and others are willing to help, but there is no simple place where the two meet with trust, statuses and proof that a wish was actually fulfilled.",
        solution:
          "WishPool gives every wish a catalog card, a status, comments, confirmations and a trust rating, so a wish can be fulfilled by several people step by step. It includes profiles, a top of users, notifications, settings and a draft admin panel.",
        flow: ["Client", "App", "Data", "Planned"],
        flowLead: "A working front-end MVP. Dashed boxes are designed but deliberately not built yet.",
        features: [
          "Catalog with search, sorting, status filter and ten categories.",
          "Wish page: images, status, city, description, comments, update history, confirmations, author and trust block.",
          "Creation form with a live card preview.",
          "Profiles for a user and a benefactor, top lists by tab, notifications, settings toggles, about page, admin draft.",
          "Statuses: Published, In progress, Fulfilled, Archive.",
        ],
        facts: [
          { k: "Pages", v: "11" },
          { k: "API routes", v: "2 (demo)" },
          { k: "Browser audit", v: "1440×1100 · 390×844" },
          { k: "Console errors", v: "0" },
        ],
        honest: [
          "This is an MVP on demo data: there is no real authentication and no database at runtime.",
          "New wishes and edits are stored only in your browser (localStorage).",
          "Image upload blocks, comments, notifications and the admin panel are UI-only. A PostgreSQL schema is drafted but not connected.",
        ],
      },
      ru: {
        kind: "Веб-платформа · MVP",
        tagline: "Платформа желаний и добрых дел: публикуешь желание — другие помогают исполнить его полностью или частично.",
        problem:
          "У людей есть желания и потребности, и другие готовы помогать, но нет простого места, где они встречаются с доверием, статусами и подтверждением того, что желание действительно исполнено.",
        solution:
          "WishPool даёт каждому желанию карточку в каталоге, статус, комментарии, подтверждения и рейтинг доверия, чтобы желание можно было исполнять по шагам вместе с несколькими людьми. Есть профили, топ пользователей, уведомления, настройки и черновая админ-панель.",
        flow: ["Клиент", "Приложение", "Данные", "В планах"],
        flowLead: "Рабочий фронтенд-MVP. Пунктирные блоки спроектированы, но намеренно ещё не построены.",
        features: [
          "Каталог с поиском, сортировкой, фильтром по статусу и десятью категориями.",
          "Страница желания: изображения, статус, город, описание, комментарии, история обновлений, подтверждения, автор и блок доверия.",
          "Форма создания с живым превью карточки.",
          "Профили пользователя и благотворителя, топы по вкладкам, уведомления, переключатели настроек, страница о проекте, черновик админки.",
          "Статусы: Опубликовано, В процессе исполнения, Исполнено, Архив.",
        ],
        facts: [
          { k: "Страниц", v: "11" },
          { k: "API-маршрутов", v: "2 (демо)" },
          { k: "Аудит в браузере", v: "1440×1100 · 390×844" },
          { k: "Ошибок консоли", v: "0" },
        ],
        honest: [
          "Это MVP на демо-данных: реальной авторизации и базы данных в рантайме нет.",
          "Новые желания и правки хранятся только в вашем браузере (localStorage).",
          "Блоки загрузки изображений, комментарии, уведомления и админ-панель — только интерфейс. Схема PostgreSQL набросана, но не подключена.",
        ],
      },
      uz: {
        kind: "Veb-platforma · MVP",
        tagline: "Istaklar va ezgu ishlar platformasi: istak eʼlon qilasiz — boshqalar uni toʻliq yoki qisman amalga oshirishga yordam beradi.",
        problem:
          "Odamlarning istak va ehtiyojlari bor, boshqalar esa yordam berishga tayyor, lekin ular ishonch, holatlar va istak haqiqatan bajarilgani tasdigʻi bilan uchrashadigan oddiy joy yoʻq.",
        solution:
          "WishPool har bir istakka katalog kartasi, holat, izohlar, tasdiqlar va ishonch reytingini beradi, shunda istakni bir necha kishi bosqichma-bosqich bajara oladi. Profillar, foydalanuvchilar topi, bildirishnomalar, sozlamalar va qoralama admin-panel bor.",
        flow: ["Mijoz", "Ilova", "Maʼlumot", "Rejada"],
        flowLead: "Ishlaydigan frontend-MVP. Punktir bloklar loyihalangan, lekin ataylab hali qurilmagan.",
        features: [
          "Qidiruv, saralash, holat filtri va oʻnta turkumli katalog.",
          "Istak sahifasi: rasmlar, holat, shahar, tavsif, izohlar, yangilanishlar tarixi, tasdiqlar, muallif va ishonch bloki.",
          "Kartaning jonli koʻrinishi bilan yaratish formasi.",
          "Foydalanuvchi va xayrixoh profillari, yorliqlar boʻyicha toplar, bildirishnomalar, sozlama tugmalari, loyiha haqida sahifa, admin qoralamasi.",
          "Holatlar: Eʼlon qilingan, Bajarilmoqda, Bajarilgan, Arxiv.",
        ],
        facts: [
          { k: "Sahifalar", v: "11" },
          { k: "API marshrutlari", v: "2 (demo)" },
          { k: "Brauzer auditi", v: "1440×1100 · 390×844" },
          { k: "Konsol xatolari", v: "0" },
        ],
        honest: [
          "Bu demo maʼlumotlardagi MVP: haqiqiy autentifikatsiya va ishlash vaqtida baza yoʻq.",
          "Yangi istaklar va tahrirlar faqat brauzeringizda (localStorage) saqlanadi.",
          "Rasm yuklash bloklari, izohlar, bildirishnomalar va admin-panel — faqat interfeys. PostgreSQL sxemasi chizilgan, lekin ulanmagan.",
        ],
      },
    },
  },
  {
    slug: "weather",
    num: "04",
    name: "Weather",
    statusKey: "weather",
    stack: ["React Native 0.76", "Expo 52", "TypeScript", "NativeWind", "TanStack Query", "Zustand"],
    flow: [
      [{ t: "GPS · expo-location" }, { t: "City search · geocoding" }],
      [{ t: "Open-Meteo forecast API" }, { t: "normalize → domain types" }],
      [{ t: "TanStack Query · persisted" }, { t: "AsyncStorage" }, { t: "Zustand · units · language · theme · cities" }],
      [{ t: "Home · hourly · daily" }, { t: "Search" }, { t: "Settings" }],
    ],
    text: {
      en: {
        kind: "Mobile app · React Native",
        tagline: "A weather app: city search, geolocation, hourly and seven-day forecast, and data that stays available offline.",
        problem:
          "A weather app is open in bad conditions: weak network, a moving user, a one-second attention span. It has to show something useful even when the request fails.",
        solution:
          "Weather keeps server data (forecasts) and device data (units, language, theme, saved cities) in separate layers. Forecasts are cached and persisted, so the last known weather is on screen before the network answers.",
        flow: ["Input", "Source", "State", "Screens"],
        flowLead: "Server state lives in React Query, preferences in Zustand. Nothing needs an account.",
        features: [
          "City search and geolocation.",
          "Current conditions, a 24-hour hourly forecast, a seven-day forecast, UV index.",
          "Saved cities, Celsius and Fahrenheit, light and dark theme.",
          "Interface in Russian and English with a small dependency-free i18n layer.",
          "Weather code mapping and adaptive backgrounds.",
        ],
        facts: [
          { k: "Data source", v: "Open-Meteo · no key" },
          { k: "Hourly window", v: "24 h" },
          { k: "Account", v: "none · all on device" },
        ],
        honest: [
          "This is a local Expo build. It is not published in a store and has no repository link.",
          "The live block on this page calls the same public API, not the app itself.",
        ],
      },
      ru: {
        kind: "Мобильное приложение · React Native",
        tagline: "Приложение погоды: поиск города, геолокация, почасовой и семидневный прогноз и данные, доступные без сети.",
        problem:
          "Приложением погоды пользуются в плохих условиях: слабая сеть, человек в движении, секунда внимания. Оно должно показывать что-то полезное, даже когда запрос не удался.",
        solution:
          "Weather разделяет серверные данные (прогнозы) и данные устройства (единицы, язык, тема, сохранённые города). Прогнозы кэшируются и сохраняются, поэтому последняя известная погода на экране раньше, чем ответит сеть.",
        flow: ["Вход", "Источник", "Состояние", "Экраны"],
        flowLead: "Серверное состояние живёт в React Query, настройки в Zustand. Аккаунт не нужен.",
        features: [
          "Поиск города и геолокация.",
          "Текущая погода, почасовой прогноз на 24 часа, прогноз на семь дней, УФ-индекс.",
          "Сохранённые города, градусы Цельсия и Фаренгейта, светлая и тёмная тема.",
          "Интерфейс на русском и английском с небольшим i18n-слоем без зависимостей.",
          "Сопоставление кодов погоды и адаптивные фоны.",
        ],
        facts: [
          { k: "Источник данных", v: "Open-Meteo · без ключа" },
          { k: "Почасовое окно", v: "24 ч" },
          { k: "Аккаунт", v: "нет · всё на устройстве" },
        ],
        honest: [
          "Это локальная сборка Expo. Она не опубликована в магазине, ссылки на репозиторий нет.",
          "Живой блок на этой странице обращается к тому же публичному API, а не к самому приложению.",
        ],
      },
      uz: {
        kind: "Mobil ilova · React Native",
        tagline: "Ob-havo ilovasi: shahar qidirish, geolokatsiya, soatlik va yetti kunlik prognoz hamda tarmoqsiz ham mavjud maʼlumotlar.",
        problem:
          "Ob-havo ilovasidan noqulay sharoitda foydalaniladi: zaif tarmoq, harakatdagi odam, bir soniyalik eʼtibor. U soʻrov muvaffaqiyatsiz boʻlganda ham foydali narsa koʻrsatishi kerak.",
        solution:
          "Weather server maʼlumotlari (prognozlar) va qurilma maʼlumotlarini (birliklar, til, mavzu, saqlangan shaharlar) alohida qatlamlarda saqlaydi. Prognozlar keshlanadi va saqlanadi, shuning uchun tarmoq javob berguncha ekranda soʻnggi maʼlum ob-havo turadi.",
        flow: ["Kirish", "Manba", "Holat", "Ekranlar"],
        flowLead: "Server holati React Query’da, sozlamalar Zustand’da. Akkaunt kerak emas.",
        features: [
          "Shahar qidirish va geolokatsiya.",
          "Joriy holat, 24 soatlik soatlik prognoz, yetti kunlik prognoz, UF indeks.",
          "Saqlangan shaharlar, Selsiy va Farengeyt, yorugʻ va qorongʻi mavzu.",
          "Bogʻliqliksiz kichik i18n qatlami bilan rus va ingliz tillaridagi interfeys.",
          "Ob-havo kodlarini moslashtirish va moslashuvchan fonlar.",
        ],
        facts: [
          { k: "Maʼlumot manbai", v: "Open-Meteo · kalitsiz" },
          { k: "Soatlik oyna", v: "24 soat" },
          { k: "Akkaunt", v: "yoʻq · hammasi qurilmada" },
        ],
        honest: [
          "Bu lokal Expo versiyasi. U doʻkonda nashr etilmagan va repozitoriyga havola yoʻq.",
          "Ushbu sahifadagi jonli blok ilovaning oʻziga emas, xuddi shu ochiq API ga murojaat qiladi.",
        ],
      },
    },
  },
  {
    slug: "drift-chirchik",
    num: "05",
    name: "Drift Chirchik",
    statusKey: "drift",
    stack: ["three.js", "JavaScript", "WebGL", "Android WebView", "Java", "Blender"],
    flow: [
      [{ t: "Blender models" }, { t: "build_cars.py" }, { t: "int16 positions · int8 normals" }],
      [{ t: "index.html" }, { t: "three.js · GLTFLoader" }, { t: "bloom post-processing" }],
      [{ t: "Chirchiq map" }, { t: "9 drift zones" }, { t: "traffic · weather" }],
      [{ t: "MainActivity.java" }, { t: "WebView · fullscreen" }],
      [{ t: "aapt2 → javac → d8" }, { t: "zipalign → apksigner" }, { t: "DriftChirchik.apk" }],
    ],
    text: {
      en: {
        kind: "3D game · Android",
        tagline: "A 3D drift game set in my hometown: real Chirchiq landmarks, Uzbek street cars and a garage — packed into an Android app.",
        problem:
          "Drift games are set in Tokyo or Los Angeles, with cars nobody here drives. I wanted to slide a Nexia or a Damas around Navoi Square and the Central Bazaar — streets I actually know.",
        solution:
          "Drift Chirchik is a three.js game in a single HTML file, wrapped in a tiny native Android shell. The map is laid out in metres from the Navoi monument, drift zones sit on real places in the city, and 18 cars that drive around Uzbekistan are all rear-wheel drive — so there is something to drift.",
        flow: ["Models", "Engine", "World", "Android shell", "Build"],
        flowLead: "Car bodies are exported from Blender and packed into compact typed arrays. The whole game is one page; Java only opens it fullscreen.",
        features: [
          "18 cars from Damas to Camaro and an electric BYD Han, each with its own top speed, acceleration, grip and steering, and factory colours.",
          "9 drift zones on real places: Navoi Square, the Central Bazaar, microdistricts, Dustlik, the Maxam industrial zone, Troitsk. Bronze, silver and gold for points in 60 seconds.",
          "Garage with upgrades for engine, tyres and steering, paint colours and a “next goal” — the cheapest car you don’t own yet.",
          "Streets with markings, tiled pavements, lamps, parked cars and benches; traffic, rain and weather.",
          "Fines and an anti-radar: the city reacts to how you drive.",
          "Auto-detects a phone or a weak device and starts with light graphics: pixel density, draw distance, fog and shadows are tuned per preset.",
          "Progress is saved in localStorage; old saves are migrated safely.",
        ],
        facts: [
          { k: "Cars", v: "18 · all RWD" },
          { k: "Drift zones", v: "9" },
          { k: "Build", v: "no Android Studio" },
          { k: "Android", v: "7.0+ · API 24–36" },
          { k: "Version", v: "1.6" },
        ],
        honest: [
          "The APK isn’t published in Google Play — it is installed directly.",
          "The garage on this page uses the real numbers from the game’s car table, but it is not the game itself.",
          "The source code is not on GitHub yet.",
        ],
      },
      ru: {
        kind: "3D-игра · Android",
        tagline: "3D-дрифт в моём родном городе: настоящие места Чирчика, машины с узбекских улиц и гараж — всё в Android-приложении.",
        problem:
          "Дрифт-игры происходят в Токио или Лос-Анджелесе, на машинах, на которых здесь никто не ездит. Мне хотелось пустить боком Нексию или Дамас вокруг площади Навои и Центрального рынка — по улицам, которые я знаю.",
        solution:
          "Дрифт Чирчик — игра на three.js в одном HTML-файле, завёрнутая в маленькую нативную оболочку Android. Карта размечена в метрах от памятника Навои, дрифт-зоны стоят на настоящих местах города, а все 18 машин, которые ездят по Узбекистану, заднеприводные — чтобы было чем дрифтить.",
        flow: ["Модели", "Движок", "Мир", "Оболочка Android", "Сборка"],
        flowLead: "Кузова машин экспортируются из Blender и упаковываются в компактные типизированные массивы. Вся игра — одна страница; Java только открывает её на весь экран.",
        features: [
          "18 машин от Дамаса до Камаро и электрического BYD Хан: у каждой своя максималка, разгон, сцепление, руль и заводские цвета.",
          "9 дрифт-зон на настоящих местах: площадь Навои, Центральный рынок, микрорайоны, Дустлик, промзона «Максам», Троицк. Бронза, серебро и золото за очки за 60 секунд.",
          "Гараж с прокачкой мотора, шин и руля, покраской и «ближайшей целью» — самой дешёвой машиной, которой ещё нет.",
          "Улицы с разметкой, тротуары из плитки, фонари, машины у обочины и скамейки; поток машин, дождь и погода.",
          "Штрафы и антирадар: город реагирует на то, как ты ездишь.",
          "Сам определяет телефон или слабое устройство и включает лёгкую графику: плотность пикселей, дальность прорисовки, туман и тени настроены по пресетам.",
          "Прогресс хранится в localStorage, старые сохранения аккуратно переносятся.",
        ],
        facts: [
          { k: "Машины", v: "18 · все заднеприводные" },
          { k: "Дрифт-зоны", v: "9" },
          { k: "Сборка", v: "без Android Studio" },
          { k: "Android", v: "7.0+ · API 24–36" },
          { k: "Версия", v: "1.6" },
        ],
        honest: [
          "APK не опубликован в Google Play — ставится напрямую.",
          "Гараж на этой странице использует настоящие цифры из таблицы машин игры, но это не сама игра.",
          "Исходный код пока не выложен на GitHub.",
        ],
      },
      uz: {
        kind: "3D oʻyin · Android",
        tagline: "Ona shahrimdagi 3D drift: Chirchiqning haqiqiy joylari, Oʻzbekiston koʻchalaridagi mashinalar va garaj — hammasi Android ilovada.",
        problem:
          "Drift oʻyinlari Tokio yoki Los-Anjelesda, bu yerda hech kim haydamaydigan mashinalarda boʻladi. Men Neksiya yoki Damasni Navoiy maydoni va Markaziy bozor atrofida — oʻzim biladigan koʻchalarda yonlatib haydagim keldi.",
        solution:
          "Drift Chirchik — bitta HTML fayldagi three.js oʻyini, kichik nativ Android qobigʻiga oʻralgan. Xarita Navoiy haykalidan metrlarda belgilangan, drift zonalari shaharning haqiqiy joylarida, Oʻzbekistonda yuradigan 18 ta mashinaning barchasi orqa yetakchi — drift qilishga imkon bor.",
        flow: ["Modellar", "Dvigatel", "Dunyo", "Android qobigʻi", "Yigʻish"],
        flowLead: "Mashina kuzovlari Blenderdan eksport qilinib, ixcham turlangan massivlarga joylanadi. Butun oʻyin — bitta sahifa; Java uni faqat toʻliq ekranda ochadi.",
        features: [
          "Damasdan Kamarogacha 18 ta mashina va elektr BYD Han: har birining oʻz tezligi, tezlanishi, ilashishi, rul va zavod ranglari bor.",
          "Haqiqiy joylarda 9 ta drift zonasi: Navoiy maydoni, Markaziy bozor, mavzelar, Doʻstlik, «Maxam» sanoat zonasi, Troitsk. 60 soniyadagi ochkolar uchun bronza, kumush va oltin.",
          "Motor, shina va rulni kuchaytirish, boʻyash va «yaqin maqsad» — hali yoʻq eng arzon mashina bilan garaj.",
          "Chiziqli koʻchalar, plitkali yoʻlaklar, chiroqlar, chetda turgan mashinalar va oʻrindiqlar; transport oqimi, yomgʻir va ob-havo.",
          "Jarimalar va antiradar: shahar qanday haydashingizga javob beradi.",
          "Telefon yoki kuchsiz qurilmani oʻzi aniqlab, yengil grafikani yoqadi: piksel zichligi, chizish masofasi, tuman va soyalar presetlar boʻyicha.",
          "Progress localStorage’da saqlanadi, eski saqlanmalar ehtiyotkorlik bilan koʻchiriladi.",
        ],
        facts: [
          { k: "Mashinalar", v: "18 · hammasi orqa yetakchi" },
          { k: "Drift zonalari", v: "9" },
          { k: "Yigʻish", v: "Android Studio’siz" },
          { k: "Android", v: "7.0+ · API 24–36" },
          { k: "Versiya", v: "1.6" },
        ],
        honest: [
          "APK Google Play’da nashr etilmagan — toʻgʻridan-toʻgʻri oʻrnatiladi.",
          "Bu sahifadagi garaj oʻyindagi mashinalar jadvalining haqiqiy raqamlaridan foydalanadi, lekin bu oʻyinning oʻzi emas.",
          "Manba kodi hali GitHubga joylanmagan.",
        ],
      },
    },
  },
  {
    slug: "fresh-chirchik",
    num: "06",
    name: "Fresh Chirchik",
    statusKey: "fresh",
    stack: ["HTML", "JavaScript", "Telegram Mini Apps", "Cloudflare Workers", "Bot API"],
    live: "https://fresh-chirchik.tudookzy.workers.dev",
    flow: [
      [{ t: "index.html" }, { t: "Menu · cart · RU/UZ/EN" }],
      [{ t: "window.Telegram.WebApp?" }, { t: "Mini app · MainButton" }, { t: "Website · copy text", dashed: true }],
      [{ t: "Cloudflare Worker" }, { t: "initData HMAC check" }, { t: "sum recalculated" }],
      [{ t: "Bot API sendMessage" }, { t: "Owner’s chat" }],
    ],
    text: {
      en: {
        kind: "Telegram mini app · website",
        tagline: "A menu and ordering page for a juice bar in Chirchiq: one HTML file that is a Telegram mini app inside Telegram and a normal website outside it.",
        problem:
          "A small juice bar with 405 followers keeps its menu in Instagram posts and takes orders only in direct messages. They work until midnight — exactly when nobody is there to reply.",
        solution:
          "One page with the menu, a cart, pickup or delivery and phone validation. Opened in Telegram it becomes a mini app with a native “Send order” button, and the order goes straight to the owner’s chat through a Cloudflare Worker. Opened in a browser, the same order is assembled into text and copied.",
        flow: ["Page", "Mode", "Worker", "Owner"],
        flowLead: "The mode is decided by one check — whether window.Telegram.WebApp exists. There are no separate builds.",
        features: [
          "Menu by category — fresh juices, detox, smoothies, lemonades — and an order with a running total.",
          "Sizes are drawn as two glasses of different height, each filled with the colour of its drink: you see the size and scan the list by colour.",
          "Open / closed badge on Tashkent time; in the last hour it shows the minutes left before closing.",
          "The exact ready-by minute (“ready by 19:42”). After 23:50 the page honestly says it is too late to press a juice tonight.",
          "The worker verifies Telegram’s initData signature, rejects stale or forged requests, recalculates the sum on the server and escapes the text.",
          "The webhook is protected with a secret token derived from the bot token; the token itself lives only in worker secrets.",
          "Three languages: Russian, Uzbek, English.",
        ],
        facts: [
          { k: "Builds", v: "1 file · 2 modes" },
          { k: "Backend", v: "Cloudflare Worker" },
          { k: "Hours", v: "08:00–00:00 · UTC+5" },
          { k: "Languages", v: "RU · UZ · EN" },
        ],
        honest: [
          "This is a demo mockup made before the bar agreed: prices in the menu are examples, and orders go to my test chat.",
          "The page is not the venue’s official site and is marked as a demo in its footer.",
          "There are no photos on purpose — I don’t have theirs, and stock photos would pretend to be their product.",
        ],
      },
      ru: {
        kind: "Telegram-мини-апп · сайт",
        tagline: "Меню и заказ для фреш-бара в Чирчике: один HTML-файл, который в Telegram становится мини-аппом, а в браузере — обычным сайтом.",
        problem:
          "У маленького фреш-бара 405 подписчиков, меню живёт в постах инстаграма, а заказы — только в личке. Работают до полуночи — как раз тогда, когда отвечать некому.",
        solution:
          "Одна страница: меню, корзина, самовывоз или доставка, проверка телефона. Открытая в Telegram, она становится мини-аппом с нативной кнопкой «Отправить заказ», и заказ через Cloudflare Worker улетает владельцу в чат. Открытая в браузере, тот же заказ собирается в текст и копируется.",
        flow: ["Страница", "Режим", "Воркер", "Владелец"],
        flowLead: "Режим решает одна проверка — есть ли window.Telegram.WebApp. Отдельных сборок нет.",
        features: [
          "Меню по категориям — фреши, детокс, смузи, лимонады — и заказ с итоговой суммой.",
          "Размеры нарисованы двумя стаканами разной высоты, каждый залит цветом своего напитка: размер видно глазом, а список сканируется по цвету.",
          "Бейдж «Открыто / Закрыто» по ташкентскому времени; в последний час показывает, сколько минут осталось до закрытия.",
          "Точная минута готовности («готово к 19:42»). После 23:50 страница честно пишет, что сегодня уже не успеем.",
          "Воркер проверяет подпись initData от Telegram, отбивает устаревшие и поддельные запросы, пересчитывает сумму на сервере и экранирует текст.",
          "Вебхук защищён секретом, выведенным из токена бота; сам токен живёт только в секретах воркера.",
          "Три языка: русский, узбекский, английский.",
        ],
        facts: [
          { k: "Сборки", v: "1 файл · 2 режима" },
          { k: "Бэкенд", v: "Cloudflare Worker" },
          { k: "Часы", v: "08:00–00:00 · UTC+5" },
          { k: "Языки", v: "RU · UZ · EN" },
        ],
        honest: [
          "Это демо-макет, сделанный до согласия бара: цены в меню примерные, а заказы приходят в мой тестовый чат.",
          "Страница не официальный сайт заведения, и в подвале это помечено.",
          "Фотографий нет намеренно: их фото у меня нет, а стоковые выдавали бы себя за их продукцию.",
        ],
      },
      uz: {
        kind: "Telegram mini-ilova · sayt",
        tagline: "Chirchiqdagi fresh-bar uchun menyu va buyurtma: Telegramda mini-ilova, brauzerda oddiy saytga aylanadigan bitta HTML fayl.",
        problem:
          "Kichik fresh-barning 405 obunachisi bor, menyu Instagram postlarida, buyurtmalar esa faqat shaxsiy xabarda. Ular yarim tungacha ishlaydi — aynan javob beradigan odam yoʻq paytda.",
        solution:
          "Bitta sahifa: menyu, savat, olib ketish yoki yetkazib berish, telefon tekshiruvi. Telegramda ochilsa, nativ «Buyurtma yuborish» tugmali mini-ilovaga aylanadi va buyurtma Cloudflare Worker orqali egasining chatiga boradi. Brauzerda ochilsa, xuddi shu buyurtma matnga yigʻilib, nusxalanadi.",
        flow: ["Sahifa", "Rejim", "Worker", "Egasi"],
        flowLead: "Rejimni bitta tekshiruv hal qiladi — window.Telegram.WebApp bormi. Alohida yigʻmalar yoʻq.",
        features: [
          "Toifalar boʻyicha menyu — freshlar, detoks, smuzi, limonadlar — va umumiy summali buyurtma.",
          "Hajmlar har xil balandlikdagi ikki stakan bilan chizilgan, har biri oʻz ichimligi rangida: hajm koʻzga koʻrinadi, roʻyxat rang boʻyicha koʻriladi.",
          "Toshkent vaqti boʻyicha «Ochiq / Yopiq» belgisi; oxirgi soatda yopilishgacha qolgan daqiqalarni koʻrsatadi.",
          "Aniq tayyor boʻlish daqiqasi («19:42 da tayyor»). 23:50 dan keyin sahifa bugun ulgurmasligini halol yozadi.",
          "Worker Telegram initData imzosini tekshiradi, eskirgan va soxta soʻrovlarni rad etadi, summani serverda qayta hisoblaydi va matnni ekranlaydi.",
          "Vebhuk bot tokenidan olingan maxfiy kalit bilan himoyalangan; tokenning oʻzi faqat worker sirlarida.",
          "Uch til: rus, oʻzbek, ingliz.",
        ],
        facts: [
          { k: "Yigʻmalar", v: "1 fayl · 2 rejim" },
          { k: "Backend", v: "Cloudflare Worker" },
          { k: "Ish vaqti", v: "08:00–00:00 · UTC+5" },
          { k: "Tillar", v: "RU · UZ · EN" },
        ],
        honest: [
          "Bu bar rozilik bermasdan oldin qilingan demo-maket: menyudagi narxlar taxminiy, buyurtmalar esa mening test chatimga keladi.",
          "Sahifa muassasaning rasmiy sayti emas va bu pastki qismda belgilangan.",
          "Rasmlar ataylab yoʻq: ularning rasmlari menda yoʻq, stok rasmlar esa ularning mahsuloti sifatida koʻrinardi.",
        ],
      },
    },
  },
];

export const bySlug = (s: string) => projects.find((p) => p.slug === s);
export const nextOf = (s: Slug) => projects[(projects.findIndex((p) => p.slug === s) + 1) % projects.length];
export const prevOf = (s: Slug) => projects[(projects.findIndex((p) => p.slug === s) - 1 + projects.length) % projects.length];
export const txt = (p: Project, l: Locale) => p.text[l];

/** Небольшие проекты и эксперименты: без отдельной страницы. */
export interface MoreProject {
  name: string;
  stack: string[];
  href?: string;
  text: L<{ kind: string; about: string }>;
}

export const more: MoreProject[] = [
  {
    name: "LIFE//HUB",
    stack: ["Node.js", "Express 5", "JavaScript"],
    text: {
      en: { kind: "Web · AI", about: "One chat for ChatGPT, Claude, DeepSeek, Grok and Gemini. A small Node server calls the chosen provider, so API keys never reach the browser." },
      ru: { kind: "Веб · ИИ", about: "Один чат для ChatGPT, Claude, DeepSeek, Grok и Gemini. Небольшой Node-сервер сам обращается к выбранному провайдеру, поэтому ключи API никогда не попадают в браузер." },
      uz: { kind: "Veb · AI", about: "ChatGPT, Claude, DeepSeek, Grok va Gemini uchun bitta chat. Kichik Node-server tanlangan provayderga oʻzi murojaat qiladi, shuning uchun API kalitlari brauzerga tushmaydi." },
    },
  },
  {
    name: "NEXUS PRO",
    stack: ["Python", "HTML", "JavaScript"],
    text: {
      en: { kind: "Developer tool", about: "A local command center for developers: a web dashboard served by a small Python server and started with one script." },
      ru: { kind: "Инструмент разработчика", about: "Локальный командный центр разработчика: веб-панель, которую отдаёт небольшой Python-сервер, запускается одним скриптом." },
      uz: { kind: "Dasturchi vositasi", about: "Dasturchi uchun lokal boshqaruv markazi: kichik Python-server beradigan veb-panel, bitta skript bilan ishga tushadi." },
    },
  },
  {
    name: "Vanta Visuals",
    stack: ["Java 21", "Fabric", "Minecraft 1.21"],
    text: {
      en: { kind: "Minecraft mod", about: "A client-side visuals mod for Minecraft on Fabric, built around a scalable module system." },
      ru: { kind: "Мод для Minecraft", about: "Клиентский мод визуальных эффектов для Minecraft на Fabric, построенный на расширяемой системе модулей." },
      uz: { kind: "Minecraft modi", about: "Fabric’dagi Minecraft uchun mijoz tomonidagi vizual effektlar modi, kengaytiriladigan modullar tizimiga qurilgan." },
    },
  },
  {
    name: "Horoscope bot",
    stack: ["Python", "aiogram 3", "SQLite"],
    text: {
      en: { kind: "Telegram bot", about: "Zodiac sign, daily horoscope, predictions and advice. aiogram 3 routers, FSM states and an SQLite database." },
      ru: { kind: "Telegram-бот", about: "Знак зодиака, гороскоп на день, предсказания и советы. Роутеры aiogram 3, состояния FSM и база SQLite." },
      uz: { kind: "Telegram bot", about: "Burj belgisi, kunlik munajjimlar bashorati, bashoratlar va maslahatlar. aiogram 3 routerlari, FSM holatlari va SQLite bazasi." },
    },
  },
  {
    name: "OSINT Mini App",
    stack: ["HTML", "Telegram Mini Apps"],
    href: "https://github.com/xzboq/OSINT-Mini-App",
    text: {
      en: { kind: "Telegram mini app", about: "A Telegram mini app for open-source intelligence lookups. The source is public on GitHub." },
      ru: { kind: "Telegram-мини-апп", about: "Мини-апп в Telegram для поиска по открытым источникам (OSINT). Исходный код открыт на GitHub." },
      uz: { kind: "Telegram mini-ilova", about: "Ochiq manbalardan qidirish (OSINT) uchun Telegram mini-ilovasi. Manba kodi GitHubda ochiq." },
    },
  },
];
