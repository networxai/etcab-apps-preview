# Mockup translation glossary (hy → en / ru)

Product: Eco Taxi (Yerevan) — rider app, driver app, operator console. Keep brand and tier names as they are: Eco Taxi, Eco City, Eco Comfort, Eco Kids, Eco Business, Eco Van, Eco Vip, 2GIS, Idram, ETAPI, iPay, ArCa, Apple Pay, Google Pay, NFC, POS, SMS, PDF, CSV, Excel, SOS. ֏ stays ֏.

| hy | en | ru |
|---|---|---|
| Ուղևոր | rider | пассажир |
| Վարորդ | driver | водитель |
| Դիսպետչեր | dispatcher | диспетчер |
| Օպերատոր | operator | оператор |
| Վահանակ | console | консоль |
| Ավտոպարկ | fleet | автопарк |
| Գործընկեր (driver who owns the car) | partner | партнёр |
| Պատվեր | order | заказ |
| Ուղևորություն | ride | поездка |
| Նախնական պատվեր | pre-order | предзаказ |
| Սակագին | tariff | тариф |
| Գոտի | zone | зона |
| Գոտուց գոտի | zone to zone | из зоны в зону |
| Հերթափոխ | shift | смена |
| Հաշվեկշիռ | balance | баланс |
| Լիցքավորում | top-up | пополнение |
| Միջնորդավճար | commission | комиссия |
| Սպասարկման վճար | service fee | сервисный сбор |
| Հավելավճար | surcharge | надбавка |
| Կանխիկ | cash | наличные |
| Քարտ | card | карта |
| Անկանխիկ | cashless | безналичный |
| Ընկերություն / Ընկերության հաշվին | company / on company account | компания / за счёт компании |
| Ստացական | receipt | квитанция |
| ՊԵԿ (State Revenue Committee) | Tax Service | КГД |
| ՊԵԿ կտրոն | Tax Service receipt | чек КГД |
| ՀՎՀՀ | TIN | ИНН |
| Սև ցուցակ | blacklist | чёрный список |
| Հաստատել / Հաստատում | approve / approval | подтвердить / подтверждение |
| Տրանսֆեր | transfer | трансфер |
| Պրոմոկոդ / Ակցիա | promo code / promotion | промокод / акция |
| Չեղարկել | cancel | отменить |
| Պահել | save | сохранить |
| Ծանուցում | notification | уведомление |
| Սպասում | waiting | ожидание |
| Մոտեցում | approach (pickup ETA) | подача |
| րոպե / ր | min | мин |
| կմ / մ | km / m | км / м |
| ժ | h | ч |
| վ | s | с |

Places and people (transliterate, don't translate):
Երևան Yerevan / Ереван · Զվարթնոց Zvartnots / Звартноц · Կենտրոն Kentron / Кентрон · Մաշտոցի պող. Mashtots Ave / пр. Маштоца · Կոմիտասի պող. Komitas Ave / пр. Комитаса · Թումանյան փ. Tumanyan St / ул. Туманяна · Աբովյան Abovyan / Абовяна · Կասկադ Cascade / Каскад · Հանրապետության հրապարակ Republic Square / площадь Республики · Աննա Anna / Анна · Արամ Aram / Арам · Սուրեն Suren / Сурен · Վահե Vahe / Ваге · Անի Ani / Ани · Կարեն Karen / Карен · Գագիկ Gagik / Гагик · Սոնա Sona / Сона. Other Armenian names: standard transliteration. «ՍՊԸ» → LLC / ООО.

Dates: հոկտ. Oct / окт. · weekdays: Երկ Mon/Пн, Երք Tue/Вт, Չրք Wed/Ср, Հնգ Thu/Чт, Ուրբ Fri/Пт, Շբթ Sat/Сб, Կիր Sun/Вс. «Այսօր» Today/Сегодня, «Վաղը» Tomorrow/Завтра.

Rules:
- `{#}` is a number that gets put back in order: keep exactly the same count of `{#}`, in the same order of meaning.
- UI strings are short: a button stays a button-length phrase. Match the register of a modern app (Uber / Yandex Go for ru).
- Russian uses «» quotes; English uses “ ”. Keep punctuation like ·, —, →, ←, ✓ as in the source.
- Keep any English already inside a string as is (vendor field names like `api_key`).
- A string that is only a name/number/code (e.g. «01 ET 001», «R-2417») → same in both languages.
