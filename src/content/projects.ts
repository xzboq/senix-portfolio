import type { L, Locale } from "./i18n";

export type Slug = "kiber-yordamchi" | "senixsearch" | "wishpool" | "weather";

export interface FlowNode {
  t: string;
  dashed?: boolean;
}
export interface Project {
  slug: Slug;
  num: string;
  name: string;
  statusKey: "kiber" | "search" | "wish" | "weather";
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
];

export const bySlug = (s: string) => projects.find((p) => p.slug === s);
export const nextOf = (s: Slug) => projects[(projects.findIndex((p) => p.slug === s) + 1) % projects.length];
export const txt = (p: Project, l: Locale) => p.text[l];
