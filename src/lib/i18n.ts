/**
 * Interface copy for site 2. Chapter titles and narration live here; every
 * figure, name, theme and project still comes from the data files.
 *
 * The voice is deliberately different from site 1: this page is a narrative,
 * so the copy is scene-setting rather than procedural. Where the organiser's
 * own documents have a phrase for something, that phrase is used — the forum
 * motto and the session working titles are quoted, not paraphrased.
 */
import { createI18n } from 'vue-i18n';
import type { Lang } from './shared/content-types';

export const UI_META: Record<Lang, { title: string; description: string }> = {
  uz: {
    title: 'Tourism Investment Forum 2026 — Toshkent, 25–27 noyabr',
    description:
      'Birinchi xalqaro turizm investitsiya forumi. Oʻzbekiston Respublikasi Turizm qoʻmitasi. {regions} ta hududdan {count} ta investitsiya loyihasi, sakkiz yoʻnalish va bir kunlik ishbilarmonlik dasturi. Konsept/demo loyiha — rasmiy maʼlumot: invest.gov.uz',
  },
  ru: {
    title: 'Tourism Investment Forum 2026 — Ташкент, 25–27 ноября',
    description:
      'Первый международный инвестиционный форум в сфере туризма. Комитет по туризму Республики Узбекистан. {count} инвестиционных проектов из {regions} регионов, восемь направлений и однодневная деловая программа. Концепт/демо — официальная информация: invest.gov.uz',
  },
  en: {
    title: 'Tourism Investment Forum 2026 — Tashkent, 25–27 November',
    description:
      'The First International Tourism Investment Forum, convened by the Tourism Committee of the Republic of Uzbekistan. {count} investment projects from {regions} regions, eight thematic directions and a one-day business programme. Concept/demo project — official information: invest.gov.uz',
  },
};

const en = {
  skip: 'Skip to the chapters',
  menu: { open: 'Menu', close: 'Close', label: 'Chapters', sections: 'Sections', language: 'Language' },
  nav: {
    why: 'Why Uzbekistan',
    themes: 'Directions',
    projects: 'Projects',
    programme: 'Programme',
    contacts: 'Contact',
    cta: 'Register interest',
  },
  progress: 'Reading progress',
  scrollHint: 'Scroll',
  state: {
    loading: 'Loading…',
    errorTitle: 'The data did not load',
    errorBody: 'Every figure on this page comes from the forum data files, and they could not be read.',
    retry: 'Try again',
  },
  chapters: {
    prologue: { n: 'The forum', title: 'Tourism Investment Forum 2026' },
    crossroads: { n: 'Chapter I', title: 'The Silk Road still runs through here' },
    momentum: { n: 'Chapter II', title: 'The ground it stands on' },
    themes: { n: 'Chapter III', title: 'Eight directions' },
    portfolio: { n: 'Chapter IV', title: 'The project portfolio' },
    programme: { n: 'Chapter V', title: 'One day, end to end' },
    path: { n: 'Chapter VI', title: 'From a proposal to a project' },
    epilogue: { n: 'Epilogue', title: 'Bring us your interest' },
  },
  prologue: {
    organiser: 'Tourism Committee of the Republic of Uzbekistan',
    within: 'Within the Tashkent International Tourism Fair 2026',
    lead: 'Three days of a tourism fair, and one day given entirely to capital.',
    cta: 'See the project portfolio',
    cta2: 'Register your interest',
  },
  crossroads: {
    lead: 'Two thousand years of travellers, and the roads are still here.',
    body: 'Samarkand, Bukhara, Khiva and Shakhrisabz sit on a UNESCO list; the mountains, the deserts and the reservoirs around them have barely been built on. That gap between what the country has and what has been built is the whole investment case.',
    europe: 'Europe',
    asia: 'Asia',
  },
  momentum: {
    lead: 'Tourism does not get invested in by itself.',
    body: 'It is invested in because of the economy around it. Four figures for 2025, each published by the Agency, each carrying its source and date.',
  },
  themes: {
    lead: 'Eight directions the forum is organised around.',
    body: 'Scroll sideways, or pick one — every project in the portfolio is filed under one of them.',
    filter: 'Show the projects',
    projectsIn: 'no projects | 1 project | {count} projects',
  },
  portfolio: {
    lead: '{count} projects, gathered from {regions} regions.',
    body: 'Each dot is a project, sized by the investment it is asking for. Choose one to read it.',
    searchLabel: 'Search the portfolio',
    searchPlaceholder: 'Name, place or activity…',
    allRegions: 'Every region',
    allSegments: 'Every direction',
    sortBy: 'Sort',
    sortLargest: 'Largest first',
    sortSmallest: 'Smallest first',
    sortRegion: 'By region',
    sortName: 'By name',
    results: 'no projects | 1 project | {count} projects',
    clear: 'Clear filters',
    empty: 'Nothing matches that. Try a broader search.',
    totalLabel: 'Investment sought, stated in USD',
    projectsLabel: 'Projects in the portfolio',
    regionsLabel: 'Regions represented',
    totalNote:
      'The total covers the {n} projects whose figure is stated in US dollars. {uzs} are stated in Uzbek soums and {open} leave the figure open, so they are counted but not added.',
    fieldAlt: 'A field of {n} dots, one per project, sized by the investment sought.',
    close: 'Close',
    open: 'Open this project',
    noFigure: 'Not stated',
    offScale: 'Off the scale',
    labels: { investment: 'Investment', overview: 'Overview' },
    blocks: {
      concept: 'What it is',
      opportunity: 'Investment opportunity',
      whyInvest: 'Why invest',
      place: 'Location and access',
    },
    uzsNote: 'Stated in Uzbek soums by the region that submitted it.',
    asStated: 'As written in the project sheet: {raw}',
  },
  programme: {
    lead: 'The whole day, hour by hour.',
    body: 'A one-day investment programme inside a three-day fair: three plenaries, a project showcase and an afternoon of scheduled meetings.',
    sessionsTitle: 'The four key sessions',
    sessionsBody: 'The organiser has given each one an English working title.',
    workingTitle: 'Working title',
    expand: 'Show the topics',
    collapse: 'Hide the topics',
    kinds: {
      break: 'Break',
      opening: 'Opening',
      keynote: 'Keynote',
      plenary: 'Plenary {n}',
      showcase: 'Showcase',
      b2b: 'B2B',
      closing: 'Closing',
    },
  },
  path: {
    lead: 'Six steps, and the forum is only the fifth.',
    body: 'A project does not arrive at the forum and leave again. It is collected, verified, documented, matched, negotiated and then followed.',
    standardTitle: 'What a project sheet has to say',
    standardBody: 'Every project in the portfolio is described against the same ten blocks, so investors compare like with like.',
    criteriaTitle: 'How projects are chosen',
    stagesTitle: 'How the forum itself was built',
    goalsTitle: 'What the forum sets out to do',
  },
  epilogue: {
    lead: 'Tell us what you are looking for',
    body: 'Three questions, and the organiser takes it from there.',
    step: 'Step',
    of: 'of',
    next: 'Next',
    back: 'Back',
    submit: 'Send enquiry',
    submitting: 'Sending…',
    q1: 'Who is asking?',
    q2: 'Which direction interests you?',
    q3: 'How do we reach you?',
    themeAny: 'Not decided yet',
    name: 'Name',
    email: 'Work email',
    message: 'Anything we should know?',
    errors: {
      role: 'Please choose one.',
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
    },
    sentTitle: 'Your enquiry is ready to send',
    sentMailto:
      'Your mail client should have opened with the message prefilled. If it did not, write to the address below.',
    sentPosted: 'Your enquiry has been submitted.',
    failed: 'The enquiry could not be sent. Please write to the address below instead.',
    outcomesTitle: 'What the forum expects to come out of it',
    outcomesQuantitative: 'In numbers',
    outcomesQualitative: 'In kind',
    participantsTitle: 'Who is in the room',
  },
  contact: { phone: 'Phone', email: 'Email', address: 'Address', map: 'Open in Maps' },
  sources: {
    label: 'Source',
    asOf: 'as of {date}',
    title: 'Sources',
    body: 'Every figure on this page, and the document it was taken from.',
    documents: 'Documents supplied by the organiser',
    contributedBy: 'The portfolio was assembled from proposals by',
    machine: 'The Russian text on this page was translated from English and is not an official text.',
    projectLanguage:
      'Project titles and descriptions appear in the English the organiser prepared them in.',
  },
  footer: {
    links: 'Official links',
    disclaimerTitle: 'Concept project',
    disclaimer:
      'This site is a concept/demo project and is not operated by the Tourism Committee or the Agency. For official information see invest.gov.uz.',
  },
};

type Messages = typeof en;

const uz: Messages = {
  skip: 'Boblarga oʻtish',
  menu: { open: 'Menyu', close: 'Yopish', label: 'Boblar', sections: 'Boʻlimlar', language: 'Til' },
  nav: {
    why: 'Nega Oʻzbekiston',
    themes: 'Yoʻnalishlar',
    projects: 'Loyihalar',
    programme: 'Dastur',
    contacts: 'Aloqa',
    cta: 'Qiziqishni bildirish',
  },
  progress: 'Oʻqish jarayoni',
  scrollHint: 'Pastga',
  state: {
    loading: 'Yuklanmoqda…',
    errorTitle: 'Maʼlumot yuklanmadi',
    errorBody: 'Sahifadagi har bir raqam forum maʼlumot fayllaridan olinadi — ular oʻqilmadi.',
    retry: 'Qayta urinish',
  },
  chapters: {
    prologue: { n: 'Forum', title: 'Tourism Investment Forum 2026' },
    crossroads: { n: 'I bob', title: 'Ipak yoʻli hamon shu yerdan oʻtadi' },
    momentum: { n: 'II bob', title: 'Qaysi zamin ustida turibdi' },
    themes: { n: 'III bob', title: 'Sakkiz yoʻnalish' },
    portfolio: { n: 'IV bob', title: 'Loyihalar portfeli' },
    programme: { n: 'V bob', title: 'Bir kun — boshidan oxirigacha' },
    path: { n: 'VI bob', title: 'Takliftan loyihagacha' },
    epilogue: { n: 'Epilog', title: 'Qiziqishingizni bildiring' },
  },
  prologue: {
    organiser: 'Oʻzbekiston Respublikasi Turizm qoʻmitasi',
    within: 'Toshkent xalqaro turizm yarmarkasi — 2026 doirasida',
    lead: 'Turizm yarmarkasining uch kuni, va butunlay kapitalga ajratilgan bir kun.',
    cta: 'Loyihalar portfelini koʻrish',
    cta2: 'Qiziqishni bildirish',
  },
  crossroads: {
    lead: 'Ikki ming yillik yoʻlovchilar — yoʻllar esa hamon shu yerda.',
    body: 'Samarqand, Buxoro, Xiva va Shahrisabz YUNESKO roʻyxatida; ularni oʻrab turgan togʻlar, choʻllar va suv omborlarida esa deyarli hech narsa qurilmagan. Mamlakatda bori bilan qurilgani oʻrtasidagi shu farq — investitsiya uchun asosiy dalil.',
    europe: 'Yevropa',
    asia: 'Osiyo',
  },
  momentum: {
    lead: 'Turizmga oʻz-oʻzidan investitsiya kiritilmaydi.',
    body: 'Unga atrofdagi iqtisodiyot tufayli sarmoya kiritiladi. 2025 yilga oid toʻrtta raqam; har biri agentlik tomonidan eʼlon qilingan, har biri manbasi va sanasi bilan.',
  },
  themes: {
    lead: 'Forum tashkil etilgan sakkizta yoʻnalish.',
    body: 'Yon tomonga suring yoki birini tanlang — portfeldagi har bir loyiha shulardan biriga tegishli.',
    filter: 'Loyihalarni koʻrsatish',
    projectsIn: 'loyiha yoʻq | 1 ta loyiha | {count} ta loyiha',
  },
  portfolio: {
    lead: '{regions} ta hududdan yigʻilgan {count} ta loyiha.',
    body: 'Har bir nuqta — bitta loyiha; kattaligi soʻralayotgan investitsiyaga mos. Oʻqish uchun birini tanlang.',
    searchLabel: 'Portfeldan qidirish',
    searchPlaceholder: 'Nomi, joyi yoki faoliyati…',
    allRegions: 'Barcha hududlar',
    allSegments: 'Barcha yoʻnalishlar',
    sortBy: 'Saralash',
    sortLargest: 'Avval kattasi',
    sortSmallest: 'Avval kichigi',
    sortRegion: 'Hudud boʻyicha',
    sortName: 'Nomi boʻyicha',
    results: 'loyiha yoʻq | 1 ta loyiha | {count} ta loyiha',
    clear: 'Filtrlarni tozalash',
    empty: 'Mos keladigani topilmadi. Qidiruvni kengaytiring.',
    totalLabel: 'AQSh dollarida koʻrsatilgan investitsiya talabi',
    projectsLabel: 'Portfeldagi loyihalar',
    regionsLabel: 'Ishtirok etayotgan hududlar',
    totalNote:
      'Jami summa raqami AQSh dollarida koʻrsatilgan {n} ta loyihani qamraydi. Yana {uzs} tasi soʻmda berilgan, {open} tasida raqam koʻrsatilmagan — ular sanalgan, lekin qoʻshilmagan.',
    fieldAlt: '{n} ta nuqtadan iborat maydon; har biri bitta loyiha, kattaligi soʻralgan investitsiyaga mos.',
    close: 'Yopish',
    open: 'Loyihani ochish',
    noFigure: 'Koʻrsatilmagan',
    offScale: 'Shkaladan tashqari',
    labels: { investment: 'Investitsiya', overview: 'Loyiha haqida' },
    blocks: {
      concept: 'Nimadan iborat',
      opportunity: 'Investitsiya sharoitlari',
      whyInvest: 'Nega aynan shu loyiha',
      place: 'Joylashuv va yoʻllar',
    },
    uzsNote: 'Taqdim etgan hudud tomonidan soʻmda koʻrsatilgan.',
    asStated: 'Loyiha varaqasida shunday yozilgan: {raw}',
  },
  programme: {
    lead: 'Butun kun — soat sayin.',
    body: 'Uch kunlik yarmarka ichidagi bir kunlik investitsiya dasturi: uchta plenar sessiya, loyihalar taqdimoti va kelishilgan uchrashuvlarga ajratilgan tushdan keyingi vaqt.',
    sessionsTitle: 'Toʻrtta kalit sessiya',
    sessionsBody: 'Tashkilotchi har biriga inglizcha ishchi nom bergan.',
    workingTitle: 'Ishchi nom',
    expand: 'Mavzularni koʻrsatish',
    collapse: 'Mavzularni yashirish',
    kinds: {
      break: 'Tanaffus',
      opening: 'Ochilish',
      keynote: 'Asosiy maʼruza',
      plenary: '{n}-plenar sessiya',
      showcase: 'Taqdimot',
      b2b: 'B2B',
      closing: 'Yakun',
    },
  },
  path: {
    lead: 'Olti qadam — forum esa ularning beshinchisi, xolos.',
    body: 'Loyiha forumga kelib, keyin ketib qolmaydi. U yigʻiladi, tekshiriladi, hujjatlashtiriladi, investor bilan solishtiriladi, muzokara qilinadi va keyin kuzatib boriladi.',
    standardTitle: 'Loyiha varaqasi nimani aytishi kerak',
    standardBody: 'Portfeldagi har bir loyiha bir xil oʻnta blok boʻyicha tavsiflanadi — investor oʻxshashni oʻxshash bilan solishtiradi.',
    criteriaTitle: 'Loyihalar qanday tanlanadi',
    stagesTitle: 'Forumning oʻzi qanday tayyorlandi',
    goalsTitle: 'Forum nimani maqsad qilgan',
  },
  epilogue: {
    lead: 'Nimani qidirayotganingizni ayting',
    body: 'Uchta savol — qolganini tashkilotchi oʻz zimmasiga oladi.',
    step: 'Qadam',
    of: '/',
    next: 'Keyingi',
    back: 'Orqaga',
    submit: 'Soʻrovni yuborish',
    submitting: 'Yuborilmoqda…',
    q1: 'Kim soʻramoqda?',
    q2: 'Qaysi yoʻnalish qiziqtiradi?',
    q3: 'Siz bilan qanday bogʻlanamiz?',
    themeAny: 'Hali tanlanmagan',
    name: 'Ism',
    email: 'Ish elektron pochtasi',
    message: 'Bilishimiz kerak boʻlgan narsa bormi?',
    errors: {
      role: 'Bittasini tanlang.',
      name: 'Ismingizni kiriting.',
      email: 'Toʻgʻri elektron pochta manzilini kiriting.',
    },
    sentTitle: 'Soʻrovingiz yuborishga tayyor',
    sentMailto:
      'Pochta ilovangiz tayyor xat bilan ochilgan boʻlishi kerak. Ochilmagan boʻlsa, quyidagi manzilga yozing.',
    sentPosted: 'Soʻrovingiz yuborildi.',
    failed: 'Soʻrovni yuborib boʻlmadi. Iltimos, quyidagi manzilga yozing.',
    outcomesTitle: 'Forumdan nima kutilmoqda',
    outcomesQuantitative: 'Raqamlarda',
    outcomesQualitative: 'Sifat jihatidan',
    participantsTitle: 'Zalda kimlar boʻladi',
  },
  contact: { phone: 'Telefon', email: 'Elektron pochta', address: 'Manzil', map: 'Xaritada ochish' },
  sources: {
    label: 'Manba',
    asOf: '{date} holatiga',
    title: 'Manbalar',
    body: 'Sahifadagi har bir raqam va u olingan hujjat.',
    documents: 'Tashkilotchi taqdim etgan hujjatlar',
    contributedBy: 'Portfel quyidagilarning takliflaridan shakllantirilgan',
    machine: 'Sahifadagi ruscha matn ingliz tilidan tarjima qilingan va rasmiy matn emas.',
    projectLanguage:
      'Loyiha nomlari va tavsiflari tashkilotchi tayyorlagan ingliz tilida keltirilgan.',
  },
  footer: {
    links: 'Rasmiy havolalar',
    disclaimerTitle: 'Konsept loyiha',
    disclaimer:
      'Ushbu sayt konsept/demo loyiha boʻlib, Turizm qoʻmitasi yoki agentlik tomonidan yuritilmaydi. Rasmiy maʼlumot uchun: invest.gov.uz.',
  },
};

const ru: Messages = {
  skip: 'Перейти к главам',
  menu: { open: 'Меню', close: 'Закрыть', label: 'Главы', sections: 'Разделы', language: 'Язык' },
  nav: {
    why: 'Почему Узбекистан',
    themes: 'Направления',
    projects: 'Проекты',
    programme: 'Программа',
    contacts: 'Контакты',
    cta: 'Заявить интерес',
  },
  progress: 'Прогресс чтения',
  scrollHint: 'Вниз',
  state: {
    loading: 'Загрузка…',
    errorTitle: 'Данные не загрузились',
    errorBody: 'Все цифры на этой странице берутся из файлов данных форума — прочитать их не удалось.',
    retry: 'Попробовать снова',
  },
  chapters: {
    prologue: { n: 'Форум', title: 'Tourism Investment Forum 2026' },
    crossroads: { n: 'Глава I', title: 'Шёлковый путь по-прежнему проходит здесь' },
    momentum: { n: 'Глава II', title: 'На какой почве он стоит' },
    themes: { n: 'Глава III', title: 'Восемь направлений' },
    portfolio: { n: 'Глава IV', title: 'Портфель проектов' },
    programme: { n: 'Глава V', title: 'Один день, от начала до конца' },
    path: { n: 'Глава VI', title: 'От предложения к проекту' },
    epilogue: { n: 'Эпилог', title: 'Заявите о своём интересе' },
  },
  prologue: {
    organiser: 'Комитет по туризму Республики Узбекистан',
    within: 'В рамках Ташкентской международной туристической ярмарки — 2026',
    lead: 'Три дня туристической ярмарки — и один день, целиком отданный капиталу.',
    cta: 'Смотреть портфель проектов',
    cta2: 'Заявить о своём интересе',
  },
  crossroads: {
    lead: 'Две тысячи лет путников — и дороги всё ещё здесь.',
    body: 'Самарканд, Бухара, Хива и Шахрисабз — в списке ЮНЕСКО; а в горах, пустынях и у водохранилищ вокруг них почти ничего не построено. Разрыв между тем, что у страны есть, и тем, что построено, — и есть главный инвестиционный аргумент.',
    europe: 'Европа',
    asia: 'Азия',
  },
  momentum: {
    lead: 'В туризм не инвестируют сами по себе.',
    body: 'В него инвестируют из-за экономики вокруг. Четыре цифры за 2025 год, каждая опубликована Агентством, каждая — с источником и датой.',
  },
  themes: {
    lead: 'Восемь направлений, вокруг которых построен форум.',
    body: 'Листайте вбок или выберите одно — каждый проект портфеля отнесён к одному из них.',
    filter: 'Показать проекты',
    projectsIn: 'нет проектов | {count} проект | {count} проекта | {count} проектов',
  },
  portfolio: {
    lead: '{count} проектов, собранных из {regions} регионов.',
    body: 'Каждая точка — проект, её размер соответствует запрашиваемым инвестициям. Выберите один, чтобы прочитать.',
    searchLabel: 'Поиск по портфелю',
    searchPlaceholder: 'Название, место или вид деятельности…',
    allRegions: 'Все регионы',
    allSegments: 'Все направления',
    sortBy: 'Сортировка',
    sortLargest: 'Сначала крупные',
    sortSmallest: 'Сначала небольшие',
    sortRegion: 'По регионам',
    sortName: 'По названию',
    results: 'нет проектов | {count} проект | {count} проекта | {count} проектов',
    clear: 'Сбросить фильтры',
    empty: 'Ничего не найдено. Попробуйте расширить запрос.',
    totalLabel: 'Запрашиваемые инвестиции, указанные в долларах США',
    projectsLabel: 'Проектов в портфеле',
    regionsLabel: 'Представленных регионов',
    totalNote:
      'Итог охватывает {n} проектов, сумма которых указана в долларах США. Ещё {uzs} указаны в сумах, а в {open} сумма не проставлена — они учтены, но не просуммированы.',
    fieldAlt: 'Поле из {n} точек, по одной на проект; размер соответствует запрашиваемым инвестициям.',
    close: 'Закрыть',
    open: 'Открыть проект',
    noFigure: 'Не указано',
    offScale: 'Вне шкалы',
    labels: { investment: 'Инвестиции', overview: 'О проекте' },
    blocks: {
      concept: 'Из чего состоит',
      opportunity: 'Условия инвестирования',
      whyInvest: 'Почему этот проект',
      place: 'Расположение и доступность',
    },
    uzsNote: 'Указано в сумах регионом, подавшим проект.',
    asStated: 'В проектном листе записано так: {raw}',
  },
  programme: {
    lead: 'Весь день — час за часом.',
    body: 'Однодневная инвестиционная программа внутри трёхдневной ярмарки: три пленарные сессии, презентация проектов и вторая половина дня под заранее назначенные встречи.',
    sessionsTitle: 'Четыре ключевые сессии',
    sessionsBody: 'Организатор дал каждой английское рабочее название.',
    workingTitle: 'Рабочее название',
    expand: 'Показать темы',
    collapse: 'Скрыть темы',
    kinds: {
      break: 'Перерыв',
      opening: 'Открытие',
      keynote: 'Ключевое выступление',
      plenary: 'Пленарная сессия {n}',
      showcase: 'Презентация',
      b2b: 'B2B',
      closing: 'Закрытие',
    },
  },
  path: {
    lead: 'Шесть этапов — и форум лишь пятый из них.',
    body: 'Проект не просто приезжает на форум и уезжает. Его собирают, проверяют, документируют, сопоставляют с инвестором, обсуждают — и затем сопровождают.',
    standardTitle: 'Что должен сообщать проектный лист',
    standardBody: 'Каждый проект портфеля описан по одним и тем же десяти блокам — чтобы инвестор сравнивал сопоставимое.',
    criteriaTitle: 'Как отбираются проекты',
    stagesTitle: 'Как готовился сам форум',
    goalsTitle: 'Чего форум хочет добиться',
  },
  epilogue: {
    lead: 'Расскажите, что вы ищете',
    body: 'Три вопроса — дальше организатор берёт всё на себя.',
    step: 'Шаг',
    of: 'из',
    next: 'Далее',
    back: 'Назад',
    submit: 'Отправить запрос',
    submitting: 'Отправка…',
    q1: 'Кто обращается?',
    q2: 'Какое направление вам интересно?',
    q3: 'Как с вами связаться?',
    themeAny: 'Пока не определено',
    name: 'Имя',
    email: 'Рабочая почта',
    message: 'Что нам стоит знать?',
    errors: {
      role: 'Выберите один вариант.',
      name: 'Укажите ваше имя.',
      email: 'Укажите корректный адрес электронной почты.',
    },
    sentTitle: 'Ваш запрос готов к отправке',
    sentMailto:
      'Почтовый клиент должен был открыться с готовым письмом. Если нет — напишите на адрес ниже.',
    sentPosted: 'Ваш запрос отправлен.',
    failed: 'Не удалось отправить запрос. Пожалуйста, напишите на адрес ниже.',
    outcomesTitle: 'Чего ждут от форума',
    outcomesQuantitative: 'В цифрах',
    outcomesQualitative: 'По существу',
    participantsTitle: 'Кто будет в зале',
  },
  contact: { phone: 'Телефон', email: 'Эл. почта', address: 'Адрес', map: 'Открыть на карте' },
  sources: {
    label: 'Источник',
    asOf: 'на {date}',
    title: 'Источники',
    body: 'Каждая цифра на этой странице и документ, из которого она взята.',
    documents: 'Документы, предоставленные организатором',
    contributedBy: 'Портфель сформирован из предложений',
    machine: 'Русский текст на этой странице переведён с английского и не является официальным.',
    projectLanguage:
      'Названия и описания проектов приведены на английском языке, как их подготовил организатор.',
  },
  footer: {
    links: 'Официальные ссылки',
    disclaimerTitle: 'Концептуальный проект',
    disclaimer:
      'Этот сайт — концепт/демо, он не ведётся Комитетом по туризму или Агентством. За официальной информацией обращайтесь на invest.gov.uz.',
  },
};

/**
 * Russian needs four slots where uz and en need three.
 *
 * Message order is: none | one | few (2-4) | many (5-20, and 0-digit endings).
 * Uzbek has no number agreement at all and English has the usual two, so both
 * stay on vue-i18n's default rule.
 */
function russianPlural(choice: number): number {
  if (choice === 0) return 0;
  const hundreds = Math.abs(choice) % 100;
  if (hundreds > 10 && hundreds < 20) return 3;
  const units = hundreds % 10;
  if (units === 1) return 1;
  if (units > 1 && units < 5) return 2;
  return 3;
}

export const i18n = createI18n({
  legacy: false,
  locale: 'uz',
  fallbackLocale: 'en',
  messages: { uz, ru, en },
  pluralRules: { ru: russianPlural },
});
