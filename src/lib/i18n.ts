/**
 * Interface copy for site 2. Chapter titles and narration live here; every
 * figure and fact still comes from content.json.
 *
 * The voice is deliberately different from site 1: this page is a narrative,
 * so the copy is first-person-plural and scene-setting rather than procedural.
 */
import { createI18n } from 'vue-i18n';
import type { Lang } from './shared/content-types';

export const UI_META: Record<Lang, { title: string; description: string }> = {
  uz: {
    title: 'Invest in Uzbekistan — Buyuk Ipak yoʻlidan 2030 gacha',
    description:
      'Yetti bobda: chorrahadagi mamlakat, iqtisodiy impuls, yosh aholi, oʻnta sektor va “Oʻzbekiston — 2030” yoʻl xaritasi. Konsept/demo loyiha — rasmiy maʼlumot: invest.gov.uz',
  },
  ru: {
    title: 'Invest in Uzbekistan — от Великого шёлкового пути к 2030',
    description:
      'Семь глав: страна на перекрёстке, экономический импульс, молодое население, десять отраслей и дорожная карта «Узбекистан — 2030». Концепт/демо — официальная информация: invest.gov.uz',
  },
  en: {
    title: 'Invest in Uzbekistan — From the Silk Road to 2030',
    description:
      'Seven chapters: a country at the crossroads, economic momentum, a young population, ten sectors and the Uzbekistan-2030 roadmap. Concept/demo project — official information: invest.gov.uz',
  },
};

const en = {
  skip: 'Skip to the chapters',
  menu: { open: 'Menu', close: 'Close', label: 'Chapters', language: 'Language' },
  progress: 'Reading progress',
  scrollHint: 'Scroll',
  state: {
    loading: 'Loading…',
    errorTitle: 'The data did not load',
    errorBody: 'Every figure in this story comes from one data file, and it could not be read.',
    retry: 'Try again',
  },
  chapters: {
    prologue: { n: 'Prologue', title: 'A country at the crossroads' },
    crossroads: { n: 'Chapter I', title: 'Where Europe meets Asia' },
    momentum: { n: 'Chapter II', title: 'Economic momentum' },
    young: { n: 'Chapter III', title: 'A young country' },
    sectors: { n: 'Chapter IV', title: 'A mosaic of opportunity' },
    roadmap: { n: 'Chapter V', title: 'The road to 2030' },
    epilogue: { n: 'Epilogue', title: 'Let us build what comes next' },
  },
  prologue: {
    lead: 'For two thousand years the roads between East and West ran through here.',
    body: 'Today the same geography carries goods, capital and people again — and the state has put a single door in front of it.',
    agency: 'Investment Promotion Agency',
  },
  crossroads: {
    lead: 'Double-landlocked, and yet in the middle of everything.',
    body: 'Uzbekistan borders all four other Central Asian republics and Afghanistan, with rail and road corridors running west to Europe, east to China and south to the Indian Ocean.',
    europe: 'Europe',
    asia: 'Asia',
  },
  momentum: {
    lead: 'Four figures that describe 2025.',
    body: 'Each one is published by the Agency; the date and source travel with the number.',
  },
  young: {
    lead: 'The median citizen is twenty-nine years old.',
    body: 'Every dot is a hundred thousand people. Pick a cohort and see how much of the country it is.',
    highlight: 'under 30',
    cohortLabel: 'Cohort',
    perDot: 'one dot = 100 000 people',
    fieldAlt: '{n} dots, one per hundred thousand people; the highlighted dots are the selected cohort.',
  },
  sectors: {
    lead: 'Ten sectors the state has put first.',
    body: 'Scroll sideways. Each card opens the Agency’s page for that sector.',
    open: 'Open the official page',
  },
  roadmap: {
    lead: 'From the founding of the Agency to the 2030 horizon.',
    body: 'The strategy sets one hundred goals across five priorities.',
  },
  epilogue: {
    lead: 'Let us build the future together',
    body: 'Three questions, and the Agency takes it from there.',
    step: 'Step',
    of: 'of',
    next: 'Next',
    back: 'Back',
    submit: 'Send enquiry',
    submitting: 'Sending…',
    q1: 'Who is asking?',
    q2: 'Which sector?',
    q3: 'How do we reach you?',
    roles: {
      investor: 'A company investing directly',
      fund: 'A fund or financial institution',
      advisor: 'An advisor acting for a client',
      other: 'Something else',
    },
    sectorAny: 'Not decided yet',
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
  },
  contact: { phone: 'Phone', email: 'Email', address: 'Address', map: 'Open in Maps' },
  sources: {
    label: 'Source',
    asOf: 'as of {date}',
    title: 'Sources',
    body: 'Every figure in this story, with the date it was collected.',
    machine: 'The Russian text on this page was translated from English and is not an official text.',
  },
  footer: {
    links: 'Official links',
    disclaimerTitle: 'Concept project',
    disclaimer:
      'This site is a concept/demo project and is not operated by the Agency. For official information see invest.gov.uz.',
  },
  tiif: { held: 'Held', past: 'This forum has taken place.' },
};

type Messages = typeof en;

const uz: Messages = {
  skip: 'Boblarga oʻtish',
  menu: { open: 'Menyu', close: 'Yopish', label: 'Boblar', language: 'Til' },
  progress: 'Oʻqish jarayoni',
  scrollHint: 'Pastga',
  state: {
    loading: 'Yuklanmoqda…',
    errorTitle: 'Maʼlumot yuklanmadi',
    errorBody: 'Bu hikoyadagi har bir raqam bitta maʼlumot faylidan olinadi — u oʻqilmadi.',
    retry: 'Qayta urinish',
  },
  chapters: {
    prologue: { n: 'Prolog', title: 'Chorrahadagi mamlakat' },
    crossroads: { n: 'I bob', title: 'Yevropa Osiyo bilan uchrashadigan joy' },
    momentum: { n: 'II bob', title: 'Iqtisodiy impuls' },
    young: { n: 'III bob', title: 'Yosh mamlakat' },
    sectors: { n: 'IV bob', title: 'Imkoniyatlar mozaikasi' },
    roadmap: { n: 'V bob', title: '2030 ga yoʻl' },
    epilogue: { n: 'Epilog', title: 'Keyingisini birga quramiz' },
  },
  prologue: {
    lead: 'Ikki ming yil davomida Sharq va Gʻarb orasidagi yoʻllar shu yerdan oʻtgan.',
    body: 'Bugun oʻsha geografiya yana tovar, kapital va odamlarni olib oʻtmoqda — davlat esa uning oldiga yagona darcha qoʻydi.',
    agency: 'Investitsiyalarni jalb qilish agentligi',
  },
  crossroads: {
    lead: 'Ikki karra quruqlik bilan oʻralgan — va shunga qaramay hamma narsaning markazida.',
    body: 'Oʻzbekiston qolgan toʻrtta Markaziy Osiyo davlati va Afgʻoniston bilan chegaradosh; temir yoʻl va avtomobil yoʻllari gʻarbda Yevropaga, sharqda Xitoyga, janubda Hind okeaniga olib boradi.',
    europe: 'Yevropa',
    asia: 'Osiyo',
  },
  momentum: {
    lead: '2025 yilni tavsiflovchi toʻrtta raqam.',
    body: 'Har biri agentlik tomonidan eʼlon qilingan; sana va manba raqam bilan birga yuradi.',
  },
  young: {
    lead: 'Oʻrtacha fuqaro yigirma toʻqqiz yoshda.',
    body: 'Har bir nuqta — yuz ming kishi. Guruhni tanlang va u mamlakatning qanchasi ekanini koʻring.',
    highlight: '30 yoshgacha',
    cohortLabel: 'Guruh',
    perDot: 'bitta nuqta = 100 000 kishi',
    fieldAlt:
      '{n} ta nuqta, har biri yuz ming kishi; yorugʻ nuqtalar — tanlangan guruh.',
  },
  sectors: {
    lead: 'Davlat birinchi oʻringa qoʻygan oʻnta sektor.',
    body: 'Yon tomonga suring. Har bir karta agentlikning shu sektor sahifasini ochadi.',
    open: 'Rasmiy sahifani ochish',
  },
  roadmap: {
    lead: 'Agentlik tashkil etilganidan 2030 ufqigacha.',
    body: 'Strategiya besh ustuvor yoʻnalish boʻyicha yuzta maqsad belgilaydi.',
  },
  epilogue: {
    lead: 'Kelajakni birga quramiz',
    body: 'Uchta savol — qolganini agentlik oʻz zimmasiga oladi.',
    step: 'Qadam',
    of: '/',
    next: 'Keyingi',
    back: 'Orqaga',
    submit: 'Soʻrovni yuborish',
    submitting: 'Yuborilmoqda…',
    q1: 'Kim soʻramoqda?',
    q2: 'Qaysi sektor?',
    q3: 'Siz bilan qanday bogʻlanamiz?',
    roles: {
      investor: 'Bevosita investitsiya kirituvchi kompaniya',
      fund: 'Fond yoki moliya instituti',
      advisor: 'Mijoz nomidan ish koʻruvchi maslahatchi',
      other: 'Boshqa',
    },
    sectorAny: 'Hali tanlanmagan',
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
  },
  contact: { phone: 'Telefon', email: 'Elektron pochta', address: 'Manzil', map: 'Xaritada ochish' },
  sources: {
    label: 'Manba',
    asOf: '{date} holatiga',
    title: 'Manbalar',
    body: 'Hikoyadagi har bir raqam va uning yigʻilgan sanasi.',
    machine: 'Sahifadagi ruscha matn ingliz tilidan tarjima qilingan va rasmiy matn emas.',
  },
  footer: {
    links: 'Rasmiy havolalar',
    disclaimerTitle: 'Konsept loyiha',
    disclaimer:
      'Ushbu sayt konsept/demo loyiha boʻlib, agentlik tomonidan yuritilmaydi. Rasmiy maʼlumot uchun: invest.gov.uz.',
  },
  tiif: { held: 'Oʻtkazilgan', past: 'Bu forum boʻlib oʻtgan.' },
};

const ru: Messages = {
  skip: 'Перейти к главам',
  menu: { open: 'Меню', close: 'Закрыть', label: 'Главы', language: 'Язык' },
  progress: 'Прогресс чтения',
  scrollHint: 'Вниз',
  state: {
    loading: 'Загрузка…',
    errorTitle: 'Данные не загрузились',
    errorBody: 'Все цифры этой истории берутся из одного файла данных — прочитать его не удалось.',
    retry: 'Попробовать снова',
  },
  chapters: {
    prologue: { n: 'Пролог', title: 'Страна на перекрёстке' },
    crossroads: { n: 'Глава I', title: 'Там, где Европа встречает Азию' },
    momentum: { n: 'Глава II', title: 'Экономический импульс' },
    young: { n: 'Глава III', title: 'Молодая страна' },
    sectors: { n: 'Глава IV', title: 'Мозаика возможностей' },
    roadmap: { n: 'Глава V', title: 'Дорога к 2030' },
    epilogue: { n: 'Эпилог', title: 'Построим следующее вместе' },
  },
  prologue: {
    lead: 'Две тысячи лет дороги между Востоком и Западом шли здесь.',
    body: 'Сегодня та же география снова несёт товары, капитал и людей — а государство поставило перед ней единое окно.',
    agency: 'Агентство по привлечению инвестиций',
  },
  crossroads: {
    lead: 'Дважды не имеющая выхода к морю — и всё же в центре всего.',
    body: 'Узбекистан граничит со всеми четырьмя республиками Центральной Азии и Афганистаном; железные и автомобильные дороги ведут на запад в Европу, на восток в Китай и на юг к Индийскому океану.',
    europe: 'Европа',
    asia: 'Азия',
  },
  momentum: {
    lead: 'Четыре цифры, описывающие 2025 год.',
    body: 'Каждая опубликована Агентством; дата и источник идут вместе с цифрой.',
  },
  young: {
    lead: 'Медианному гражданину двадцать девять лет.',
    body: 'Каждая точка — сто тысяч человек. Выберите группу и увидите, какую часть страны она составляет.',
    highlight: 'младше 30',
    cohortLabel: 'Группа',
    perDot: 'одна точка = 100 000 человек',
    fieldAlt: '{n} точек, каждая — сто тысяч человек; подсвеченные точки — выбранная группа.',
  },
  sectors: {
    lead: 'Десять отраслей, поставленных государством на первое место.',
    body: 'Листайте вбок. Каждая карточка открывает страницу Агентства по этой отрасли.',
    open: 'Открыть официальную страницу',
  },
  roadmap: {
    lead: 'От создания Агентства до горизонта 2030 года.',
    body: 'Стратегия ставит сто целей по пяти приоритетным направлениям.',
  },
  epilogue: {
    lead: 'Построим будущее вместе',
    body: 'Три вопроса — дальше Агентство берёт всё на себя.',
    step: 'Шаг',
    of: 'из',
    next: 'Далее',
    back: 'Назад',
    submit: 'Отправить запрос',
    submitting: 'Отправка…',
    q1: 'Кто обращается?',
    q2: 'Какая отрасль?',
    q3: 'Как с вами связаться?',
    roles: {
      investor: 'Компания, инвестирующая напрямую',
      fund: 'Фонд или финансовый институт',
      advisor: 'Консультант, действующий за клиента',
      other: 'Другое',
    },
    sectorAny: 'Пока не определено',
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
  },
  contact: { phone: 'Телефон', email: 'Эл. почта', address: 'Адрес', map: 'Открыть на карте' },
  sources: {
    label: 'Источник',
    asOf: 'на {date}',
    title: 'Источники',
    body: 'Каждая цифра этой истории и дата её сбора.',
    machine: 'Русский текст на этой странице переведён с английского и не является официальным.',
  },
  footer: {
    links: 'Официальные ссылки',
    disclaimerTitle: 'Концептуальный проект',
    disclaimer:
      'Этот сайт — концепт/демо и не ведётся Агентством. За официальной информацией обращайтесь на invest.gov.uz.',
  },
  tiif: { held: 'Проведён', past: 'Форум уже состоялся.' },
};

export const i18n = createI18n({
  legacy: false,
  locale: 'uz',
  fallbackLocale: 'en',
  messages: { uz, ru, en },
});
