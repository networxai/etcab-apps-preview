/* Shared mock plumbing: theme from ?theme=, status bar, icons, map, car art. */
(function () {
  const q = new URLSearchParams(location.search)
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.theme = theme
  window.THEME = theme

  /* ── ECO: the one canonical data set (review X4–X7). Rider, driver, partner and console pages read their shared facts
     from here, so the same ride, day, money format, payment roster and partner rules cannot drift between surfaces.
     A page may invent its own local rows (history, queue), but anything that appears on two surfaces comes from ECO. ── */
  const NB = ' ' /* no-break space: thousands, and before ֏ (U+202F measured 2 px at 16 px in Google Sans and read as «1100») */
  const grp = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, NB)
  window.ECO = {
    NB,
    /* Money: «1 100 ֏», negative «−3 400 ֏» (U+2212). Never «1100 ֏», never a comma or dot for thousands. */
    amd: (n) => (n < 0 ? '−' : '') + grp(n) + NB + '֏',
    /* A plain number with grouping: «9 800». */
    num: (n) => (Number.isInteger(n) ? (n < 0 ? '−' : '') + grp(n) : ECO.dec(n)),
    /* Decimals use the Armenian/Russian comma: «4,3». */
    dec: (x, d = 1) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(d).replace('.', ','),
    km: (x) => ECO.dec(x) + ' կմ',
    pct: (x) => grp(x) + NB + '%',

    /* The demo day: Friday 9 October 2026, the status bar reads 9:41. */
    DAY: { iso: '2026-10-09', now: '9:41', today: 'Ուրբաթ, 9 հոկտ.', todayLong: 'Ուրբաթ, 9 հոկտեմբերի', short: '9 հոկտ.',
      tomorrow: 'Վաղը, շաբաթ, 10 հոկտ.', yesterday: 'Երեկ, հինգշաբթի, 8 հոկտ.', ru: 'Пятница, 9 окт.' },

    /* «One ride everywhere»: the walkthrough trip, seen by the rider (rider-*), the driver (driver-offer/ride) and the
       console (dispatch, rides). Route geometry is routes.js pickupToDrop (4 289 m, 375 s) and driverToPickup (1,4 km). */
    RIDE: {
      no: '2417', tier: 'Eco City', tierId: 'city',
      pickup: 'Մաշտոցի պող. 37', pickupNote: 'Մատենադարանի դիմաց', drop: 'Կոմիտասի պող. 22',
      requested: '9:40', assigned: '9:41', pickupAt: '9:45', dropAt: '9:51',
      approachMin: 4, approachKm: 1.4, km: 4.3, min: 6, fare: 1100, pay: 'cash',
      riding: { clock: '9:47', left: 4 }, /* the riding state: status bar 9:47, «4 րոպե · ժամանում 9:51» */
      driver: { name: 'Արամ Պետրոսյան', short: 'Արամ Պ.', first: 'Արամ', ini: 'ԱՊ', phone: '093 44-55-66', plate: '01 ET 001',
        car: 'Volkswagen ID.3', carHy: 'Volkswagen ID.3 · սպիտակ', rating: '4,9' },
      rider: { name: 'Աննա', phone: '091 23-45-67', rating: '4,8' },
    },

    /* Payment roster at launch: cash and company account are live; card, Idram and Telcell are «Շուտով» everywhere.
       Driver earnings and the console's mix therefore split cash / company only. Strings from apps/rider i18n. */
    PAY: {
      cash: { label: 'Կանխիկ', icon: 'banknote', live: true },
      company: { label: 'Ընկերության հաշվին', short: 'Ընկերություն', icon: 'building-2', live: true },
      /* Owner 2026-10-15: cash, card, NFC, Google Pay, Apple Pay. In-app card / wallets are charged by the app (ETAPI
         CASHLESS); POS and NFC are paid at the driver's terminal or phone (ETAPI CASHLESS_POS); cash is ETAPI CASH. */
      card: { label: 'Քարտ', icon: 'credit-card', live: true, last4: '4242' },
      applepay: { label: 'Apple Pay', icon: 'smartphone', live: true },
      googlepay: { label: 'Google Pay', icon: 'smartphone', live: true },
      pos: { label: 'POS տերմինալ', icon: 'credit-card', live: true },
      nfc: { label: 'NFC', icon: 'smartphone-nfc', live: true },
      idram: { label: 'Idram', live: false }, telcell: { label: 'Telcell', live: false },
      soon: 'Շուտով',
    },

    /* Corporate client used on every surface (rider booking, receipt, console Companies). */
    /* Owner 2026-10-14 (change list): no company/cost-centre code and no fixed routes, anywhere. */
    COMPANY: { name: 'Արարատ Սոֆթ ՍՊԸ', short: 'Արարատ Սոֆթ', tin: '02612345',
      rider: 'Աննա Հակոբյան', limit: 300000, used: 184600, email: 'finance@araratsoft.am',
      /* Per-employee monthly limit (owner 2026-10-14, corporate #1): by amount OR by ride count, per calendar month.
         The company default applies unless an employee has his own. Over the limit → the ride is personal (cash).
         Աննա (the rider app's company rider): 65 000 ֏ a month, 52 400 used (= console Employees row) → 12 600 left. */
      empLimit: { default: { by: 'amount', amount: 50000 }, rider: { by: 'amount', amount: 65000, used: 52400, left: 12600 },
        /* The over-limit variant the rider app draws: 600 ֏ left against an 1 100 ֏ fare. */
        low: { left: 600 } },
      /* Allowed places per employee (corporate #4): «Ընկերության հաշվին» is offered only when pickup AND destination are
         each within radius of one of these. office = the company's own address, on every employee by default. */
      places: { radius: 300, office: { label: 'Գրասենյակ', addr: 'Վազգեն Սարգսյանի 26/1' },
        rider: [{ kind: 'home', label: 'Տուն', addr: 'Կոմիտասի պող. 22' }, { kind: 'office', label: 'Գրասենյակ', addr: 'Վազգեն Սարգսյանի 26/1' },
          { kind: 'other', label: 'Զվարթնոց', addr: 'Զվարթնոց օդանավակայան' }] },
      /* Owner 2026-10-14 (#11): no invoices in the product. The fleet tracks each month and sends the client a report;
         accounting invoices outside ETCAB. paid = the optional «Վճարված» mark. */
      months: [
        { key: '2026-09', label: 'Սեպտեմբեր 2026', rides: 214, amount: 268400, paid: true, paidOn: '6 հոկտ.' },
        { key: '2026-10', label: 'Հոկտեմբեր 2026', rides: 131, amount: 184600, paid: false, open: true },
      ] },

    /* Tariffs (= car class, owner #9). preorders: may this tariff be booked in advance (owner #1, set in console
       Tariffs; illustrative values). A due pre-order is searched automatically among this tariff's drivers (Q1). */
    TIERS: [
      { id: 'city', name: 'Eco City', preorders: true }, { id: 'comfort', name: 'Eco Comfort', preorders: true },
      { id: 'kids', name: 'Eco Kids', preorders: false }, { id: 'business', name: 'Eco Business', preorders: true },
      { id: 'van', name: 'Eco Van', preorders: false }, { id: 'vip', name: 'Eco Vip', preorders: true },
    ],

    /* Partner (own car, prepaid wallet). Reference = the API's driver.paymentReference: six digits, zero-padded
       (migration 20261011100000_driver_payment_reference), labelled «Վճարման կոդ» in both the app and the console.
       Blocked below 0 ֏, warned below 3 000 ֏ (Eco Comfort's rule, ECO.PARTNER.rules.comfort; the flat values are its aliases), and both are amber: a domain refusal, not a failure. */
    /* rules: owner #3 — partner balance rules are per tariff (console Tariffs / Fee plans). Karen drives Eco Comfort. */
    PARTNER: { name: 'Կարեն Մելքոնյան', ref: '000041', refLabel: 'Վճարման կոդ', tier: 'comfort', warnBelow: 3000, blockBelow: 0,
      rules: { city: { fee: 15, warnBelow: 2000, blockBelow: 0 }, comfort: { fee: 15, warnBelow: 3000, blockBelow: 0 },
        kids: { fee: 16, warnBelow: 3000, blockBelow: 0 }, business: { fee: 18, warnBelow: 4000, blockBelow: 0 },
        van: { fee: 18, warnBelow: 4000, blockBelow: 0 }, vip: { fee: 20, warnBelow: 5000, blockBelow: 0 } },
      bank: { name: 'Ամերիաբանկ', holder: 'Էկո Տաքսի ՍՊԸ', account: '1570 0412 3456 4417', accountMasked: '1570 •••• 4417' },
      office: { address: 'Կոմիտասի պող. 38', hours: 'Երկ–Շբթ · 09:00–20:00' } },

    /* Pre-orders (§8 scheduled_ride), one set for every surface: the rider's bookings (rider-preorders, -history, -home,
       -book), the driver's commitments (driver-preorders, -home) and the console's scheduled lane and booking panel.
       Day words follow apps/rider lib/schedule.ts formatWhen: «Այսօր, …», «Վաղը, …», a weekday (lower-case, as the app
       renders it) for < 7 days, then «12 հոկտեմբերի, …». Fares are the fixed_upfront tariff (rider-history comment).
       held = heldFrom (T−30: no new offers reach that driver; the driver's «Սկսել» opens), the activation sweep runs at T−15.
       Fields marked "ahead" are drawn ahead of the wire: customerScheduledRideSchema carries only scheduledFor, pickupText,
       destinationText, activatedRideId, cancelledAt and problemReason (RIDER-NOTES, "Drawn ahead of the app"). */
    /* The fleet's dispatcher desk (dispatcherPhone() in both apps' config; rider-account already shows it) and the
       console settings the apps obey. reminderMin: owner decision 2026-10-12, a rider reminder push N minutes before a
       pre-order, set in console Settings → Dispatch (drawn ahead: no push type yet). */
    /* lowRating: owner #15 — 1–3 ★ is low, follow up within 24 h; both set in console Settings → Dispatch. */
    DISPATCH: { phone: '010 55-55-55', reminderMin: 30, lowRating: { max: 3, followUpH: 24 } },
    /* Rider SOS (owner #2): the walkthrough ride while riding at 9:47; a red alert on console Dispatch until «Լուծված է». */
    SOS: { ride: '2417', at: '9:47', from: 'rider', name: 'Աննա', phone: '091 23-45-67', driver: 'Արամ Պ.', plate: '01 ET 001',
      where: 'Մաշտոցի պող. 18', near: 'Մատենադարանից 300 մ' },
    /* Documents (owner #5: expired insurance stops orders until a new one is uploaded and approved). Արամ is valid
       (the app's block state is the 21 Oct scenario); the console's live example is Վահե. */
    DOCS: { aram: { insurance: '20.10.2026', permit: '21.10.2026' },
      blocked: { name: 'Վահե Սարգսյան', short: 'Վահե Ս.', doc: 'insurance', expired: '05.10.2026', uploaded: '9:20' } },

    /* ── p1p2 pass: facts that two surfaces show. ── */
    /* The rider ECO.RIDE.rider as the console's customer record knows her (admin/customers/[id]); the rider app's
       saved places are the same two. */
    CUSTOMER: { name: 'Աննա Հակոբյան', short: 'Աննա Հ.', phone: '091 23-45-67', since: 'մարտ 2025', rides: 47, rating: '4,8', debt: 0,
      places: { home: 'Կոմիտասի պող. 22', work: 'Վազգեն Սարգսյանի 26/1' } },
    /* A blacklisted caller (§10.11): refused by the rider app at order (book.blacklisted), flagged at console intake
       (blacklist-notice.tsx), and listed in the Requests inbox as «refused at order». */
    BLACKLIST: { phone: '096 70-11-58', name: 'Գևորգ Ս.', reason: 'Երեք անգամ չեկավ, վիճել է վարորդի հետ', since: '2 հոկտ.', by: 'Անի Դավթյան', refusedAt: '9:12' },
    /* Console operators (shell avatar ԱԴ/ՄՀ/ՍԱ). Roles follow the API's operator roles. The API's operator has an email,
       not a name (operators.tsx lists by email); the names are the console shell's, drawn ahead. */
    OPERATORS: [
      { name: 'Անի Դավթյան', ini: 'ԱԴ', role: 'dispatcher', on: true, email: 'ani@ecotaxi.am' },
      { name: 'Մարիամ Հովսեփյան', ini: 'ՄՀ', role: 'dispatcher', on: true, email: 'mariam@ecotaxi.am' },
      { name: 'Սոնա Աբգարյան', ini: 'ՍԱ', role: 'dispatcher', on: true, email: 'sona@ecotaxi.am' },
      { name: 'Գոհար Մինասյան', ini: 'ԳՄ', role: 'admin', on: false, email: 'gohar@ecotaxi.am' },
    ],
    /* Rider-home ads = console Promotions (the owner's «partners always on home» rule). Order is the carousel order. */
    PROMOS: [
      { id: 'lumen', who: 'Լյումեն սրճարան', offer: '−15% ուղևորներին', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&h=340&q=80&auto=format&fit=crop', on: true, addr: 'Աբովյան 12', until: '31 հոկտ.', taps: 412 },
      { id: 'taron', who: 'Տարոն ռեստորան', offer: 'Աղանդեր՝ նվեր', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=340&q=80&auto=format&fit=crop', on: true, addr: 'Թումանյան 21', until: '15 նոյ.', taps: 268 },
      { id: 'araks', who: 'Արաքս սպա', offer: 'Մերսում՝ −20%', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=700&h=340&q=80&auto=format&fit=crop', on: true, addr: 'Սայաթ-Նովա 5', until: '30 նոյ.', taps: 97 },
    ],
    /* ── Change list 2026-10-14 ── */
    /* Airport transfers (console Transfers; tariff «Transfer»). Booked by the office for someone else; they reach the
       driver exactly like pre-orders (driver-preorders shows a «Տրանսֆեր» badge + flight). dir: 'arr' = pick up at
       Zvartnots after a landing, 'dep' = take someone to it. All drawn ahead: no transfer entity in the API. */
    TRANSFER_TIER: { id: 'transfer', name: 'Transfer', fare: 6000, waitFreeMin: 60 },
    TRANSFERS: [
      { id: 'T-0031', dir: 'arr', flight: 'FZ 715', from: 'Դուբայ', land: '13:40', when: 'Վաղը, 14:10', day: 'Շաբաթ, 10 հոկտ.', time: '14:10', held: '13:40',
        passenger: 'Դավիթ Ավետիսյան', phone: '+971 50 214 7781', pax: 2, bags: 3, terminal: 'Ժամանման սրահ · ելք 2', sign: 'ARARAT SOFT · D. AVETISYAN',
        pickup: 'Զվարթնոց օդանավակայան', drop: 'Ամիրյան 1, Մարիոթ հյուրանոց', km: 13.4, fare: 6000, pay: 'company', company: true,
        status: 'assigned', driver: { name: 'Արամ Պետրոսյան', short: 'Արամ Պ.', plate: '01 ET 001' }, by: 'Անի Դավթյան', booked: 'Այսօր, 9:20' },
      { id: 'T-0030', dir: 'dep', flight: 'SU 1861', to: 'Մոսկվա', depart: '17:55', when: 'Այսօր, 15:10', day: 'Ուրբաթ, 9 հոկտ.', time: '15:10', held: '14:40',
        passenger: 'Елена Смирнова', phone: '+7 916 402-18-55', pax: 1, bags: 1, terminal: 'Մեկնման սրահ',
        pickup: 'Աբովյան 3, Ռադիսոն հյուրանոց', drop: 'Զվարթնոց օդանավակայան', km: 14.1, fare: 6000, pay: 'cash', company: false,
        status: 'assigned', driver: { name: 'Սուրեն Մկրտչյան', short: 'Սուրեն Մ.', plate: '22 OU 447' }, by: 'Մարիամ Հովսեփյան', booked: 'Երեկ, 18:02' },
      { id: 'T-0032', dir: 'arr', flight: 'A3 920', from: 'Աթենք', land: '23:15', when: 'Այսօր, 23:40', day: 'Ուրբաթ, 9 հոկտ.', time: '23:40', held: '23:10',
        passenger: 'Нина Арутюнян', phone: '098 77-31-02', pax: 1, bags: 2, terminal: 'Ժամանման սրահ · ելք 1',
        pickup: 'Զվարթնոց օդանավակայան', drop: 'Դավթաշեն, 3-րդ թաղ. 14', km: 15.8, fare: 6000, pay: 'cash', company: false,
        status: 'unassigned', driver: null, by: 'Սոնա Աբգարյան', booked: 'Այսօր, 8:51' },
      { id: 'T-0027', dir: 'arr', flight: 'W6 4521', from: 'Վիեննա', land: '04:20', when: 'Այսօր, 04:40', day: 'Ուրբաթ, 9 հոկտ.', time: '04:40',
        passenger: 'Արմեն Գասպարյան', phone: '091 50-22-19', pax: 3, bags: 4, terminal: 'Ժամանման սրահ · ելք 2',
        pickup: 'Զվարթնոց օդանավակայան', drop: 'Բաղրամյան պող. 24', km: 12.9, fare: 6000, pay: 'cash', company: false,
        status: 'done', driver: { name: 'Գագիկ Հովհաննիսյան', short: 'Գագիկ Հ.', plate: '35 LL 210' }, by: 'Սոնա Աբգարյան', booked: 'Երեկ, 16:40' },
    ],
    /* Tariffs each car may take (console Vehicles → «Սակագներ»). A driver's own order (driver «Նոր պատվեր», change
       list 2026-10-14) offers only these. Արամ's VW ID.3: Eco City + Eco Kids; Կարեն's (partner) car: Eco Comfort + Eco City. */
    CAR_TIERS: { aram: ['city', 'kids'], partner: ['comfort', 'city'] },
    /* Promotions (console Promotions; rider promo entry, booking and receipt). The applied example: AUTUMN15 on the
       walkthrough's 1 100 ֏ → −165 ֏ → 935 ֏. The fleet funds the discount; the driver's fare is unchanged (drawn ahead). */
    PROMO: {
      codes: [
        { code: 'AUTUMN15', kind: 'pct', value: 15, cap: 500, total: 1000, used: 412, perRider: 3, from: '01.10.2026', to: '31.10.2026', tiers: ['city', 'comfort'], newOnly: false, on: true },
        { code: 'WELCOME', kind: 'amd', value: 700, total: null, used: 268, perRider: 1, from: '01.03.2026', to: null, tiers: null, newOnly: true, on: true },
        { code: 'ZVARTNOTS', kind: 'amd', value: 1000, total: 300, used: 300, perRider: 1, from: '01.09.2026', to: '30.09.2026', tiers: ['city'], newOnly: false, on: false },
      ],
      applied: { code: 'AUTUMN15', fare: 1100, off: 165, pay: 935 },
      /* Referral: the invitee gets 700 ֏ off the first ride; the inviter gets 700 ֏ off his next ride once the invitee
         completes that first ride. Աննա's own code and her stats. */
      referral: { inviter: 700, invitee: 700, after: 'first_ride', expiresDays: 30, code: 'ANNA4821', link: 'eco.am/r/ANNA4821',
        mine: { invited: 5, joined: 3, earned: 1400 }, total: { invited: 186, joined: 121, rewarded: 94, spent: 151900 } },
    },
    /* App versions for «update required» (rider R68, driver D40): the minimum the fleet accepts, set by the office. */
    APP: { rider: { have: '1.3.2', min: '1.4.0' }, driver: { have: '2.2.7', min: '2.3.0' } },
    /* The walkthrough ride's fiscal receipt (R58, drawn ahead: no fiscal API yet; console's «Ֆիսկալ հերթ»). */
    /* The receipt is the Tax Service's (ETAPI register-income): the ride is filed as the driver's income through the
       platform; it returns receipt_id + receipt_url. Cash is filed after ETAPI's 24 h hold, cashless at once. */
    FISCAL: { ride: '2417', no: 'RI-7F3K29Q', tin: '02598741', seller: 'Էկո Տաքսի ՍՊԸ', driverTin: '23457812', driver: 'Արամ Պետրոսյան', income: 'Կանխիկ', at: '9 հոկտ. 2026, 9:51', url: 'taxservice.am/r/RI-7F3K29Q' },
    /* The partner's top-up arriving (P10): Կարեն, blocked at −320 ֏ in the app, pays 5 000 ֏ at the office. */
    TOPUP: { id: 'TU-0419', amount: 5000, before: -320, after: 4680, via: 'office', at: '10:12', by: 'Անի Դավթյան' },

    BOOKINGS: {
      /* Աննա's (ECO.RIDE.rider) walkthrough booking: tomorrow's airport run, pre-assigned to Սուրեն. */
      air: { id: 'B-0912', who: 'rider', when: 'Վաղը, 08:30', day: 'Շաբաթ, 10 հոկտ.', iso: '2026-10-10T08:30', time: '08:30', held: '08:00', activates: '08:15',
        pickup: 'Կոմիտասի պող. 22', drop: 'Զվարթնոց օդանավակայան', dropShort: 'Զվարթնոց', tier: 'Eco City', km: 12.6, min: 17, fare: 1900, pay: 'cash',
        rider: 'Աննա', phone: '091 23-45-67', booked: 'Այսօր, 9:38',
        driver: { name: 'Սուրեն Մկրտչյան', short: 'Սուրեն Մ.', first: 'Սուրեն', ini: 'ՍՄ', phone: '094 12-40-77', plate: '22 OU 447', car: 'Toyota Prius · մոխրագույն', rating: '4,8' },
        /* The activation story (R41/R43): the sweep assigns at 08:12, the driver starts early at 08:02 (held from 08:00). */
        assignedAt: '08:12', startedAt: '08:02', etaMin: 6,
        /* Owner ruling 2026-10-12 (a): when the rider presses «Սկսել հիմա», the pre-assigned driver gets the first offer
           (the normal offer screen, 20 s); if he declines or lets it expire the ride goes to normal dispatch. Drawn ahead. */
        startNow: { at: '9:52', offerSec: 20, first: 'Սուրեն Մ.', fallback: 'auto' /* Q1: then automatic search among Eco City drivers */ } },
      /* A booking whose pre-assigned driver was blocked: problemReason → the rider's warn tag «Մեքենան դեռ նշանակված չէ»,
         the console's driver_blocked pill. */
      sun: { id: 'B-0917', who: 'rider', when: 'կիրակի, 19:00', day: 'Կիրակի, 11 հոկտ.', iso: '2026-10-11T19:00', time: '19:00', held: '18:30', activates: '18:45',
        pickup: 'Կասկադ', drop: 'Մաշտոցի պող. 37', tier: 'Eco Comfort', km: 2.4, min: 6, fare: 1000, pay: 'cash',
        rider: 'Աննա', phone: '091 23-45-67', booked: 'Երեկ, 21:14', problem: 'driver_blocked', driver: null },
      /* A company booking (ADR-C2 on a pre-order): billed to ECO.COMPANY. Home → office, both allowed places (corporate #4). */
      co: { id: 'B-0921', who: 'rider', when: 'երկուշաբթի, 09:00', day: 'Երկուշաբթի, 12 հոկտ.', iso: '2026-10-12T09:00', time: '09:00', held: '08:30', activates: '08:45',
        pickup: 'Կոմիտասի պող. 22', drop: 'Վազգեն Սարգսյանի 26/1', tier: 'Eco City', km: 4.1, min: 11, fare: 1100, pay: 'company',
        rider: 'Աննա Հակոբյան', phone: '091 23-45-67', booked: 'Այսօր, 9:39', driver: null },
      /* Արամ's (ECO.RIDE.driver) two commitments, as driver-preorders draws them.
         kom was 10:05 (held from 09:35), which held Արամ while the walkthrough offered him R-2417 at 9:41. Moved to 10:35:
         held from 10:05, after R-2417 drops at 9:51, so the walkthrough and the hold no longer overlap (p1p2 pass). */
      kom: { id: 'B-0898', who: 'driver', when: 'Այսօր, 10:35', iso: '2026-10-09T10:35', time: '10:35', held: '10:05', activates: '10:20',
        pickup: 'Կոմիտասի պող. 49', drop: 'Հանրապետության հր.', tier: 'Eco City', fare: 1200, pay: 'cash', rider: 'Լուսինե', phone: '098 51-20-44',
        driver: { name: 'Արամ Պետրոսյան', short: 'Արամ Պ.', plate: '01 ET 001' } },
      bag: { id: 'B-0904', who: 'driver', when: 'Վաղը, 07:40', iso: '2026-10-10T07:40', time: '07:40', held: '07:10', activates: '07:25',
        pickup: 'Բաղրամյան պող. 24', drop: 'Զվարթնոց', tier: 'Eco City', km: 13.1, fare: 2000, pay: 'cash', rider: 'Արմեն', phone: '077 41-22-08',
        driver: { name: 'Արամ Պետրոսյան', short: 'Արամ Պ.', plate: '01 ET 001' } },
    },
  }

  /* iOS status bar. */
  window.statusBar = function (host, time) {
    const el = document.createElement('div')
    el.className = 'statusbar'
    el.dataset.bg = 'map'
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `<span>${time || '9:41'}</span><span class="sys">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .4 10.4 10.4 0 0 0 .8 3.3L2 4.6a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.3-1.3A6.6 6.6 0 0 0 8 4a6.6 6.6 0 0 0-4.7 1.8l1.3 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.2l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z"/></svg>
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.8" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45"/></svg>
    </span>`
    host.appendChild(el)
    const hb = document.createElement('div')
    hb.className = 'homebar'
    host.appendChild(hb)
  }

  /* Lucide, one set, 1.75 stroke. */
  window.icons = function () {
    if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } })
  }

  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
  window.cssVar = css

  /* ── Map: 2GIS MapGL JS when a key is present, Stadia raster otherwise ──────────────────────────────
     2GIS is the fleet's only map provider (docs/reference/2gis-platform.md §5); the real apps render
     MapGL in a WebView. The key is NEVER in a file this folder commits. It is read at runtime from, in order:
       1. window.MAPGL_KEY, set by the optional, git-ignored v2/mapgl.local.js (one line);
       2. the ?mapglKey= URL parameter;
       3. localStorage 'mapglKey'.
     No key, a refused key ('invalidtilekey') or an unreachable CDN all fall back to the raster map with a
     small badge saying why. Day/night use 2GIS's own public day and night styles, the same ids as the console
     (apps/operator/components/map/mapgl.ts → MAP_STYLE), so night is a real dark map, not a dimmed one. */
  const MAPGL_URL = 'https://mapgl.2gis.com/api/js/v1'
  const MAP_STYLE = { light: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b', dark: 'e05ac437-fcc2-4845-ad74-b1de9ce07555' }
  /* Map language = the app's language (review X2). Armenian first; 2GIS renders hy labels («Մեսրոպ Մաշտոցի պողոտա»).
     ?lang=ru / ?lang=en switch it with the UI; anything else is hy. */
  const MAP_LANG = ({ ru: 'ru', en: 'en' })[q.get('lang')] || 'hy'
  /* The "ride" basemap (review X3): 2GIS's own day/night style, minus the groups that compete with our pins —
     POI icons and their labels, landmark and park 3D models, 3D trees, parking and traffic-light glyphs.
     Streets, house numbers, metro and district labels stay: a pickup is read against them. graphicsPreset 'light'
     also drops the remaining 3D props. Built at runtime from the public style (same request MapGL makes), so the
     filter is the whole spec: in the RN WebView it is one constant list. If the fetch fails the full style stays. */
  const CALM_DROP = /^(POI icons New|Non-unique icons POI|Sights|Mega POI|Zoo|Parking lots|Parking lots layer|Parking roof|Traffic lights|3D Models Animated|Immersive Model 3D|Immersive Model 3D 2GIS|Model 3D|3D trees (summer|autumn|winter)|Point 3D Entity\. Immersive park|3D Models\. Immersive park)$/
  const STYLE_PATHS = { fontsPath: 'https://mapgl.2gis.com/api/fonts', iconsPath: 'https://disk.2gis.com/styles/assets/icons', modelsPath: 'https://disk.2gis.com/styles/assets/models' }
  const calmStyles = {}
  const calmStyle = (id, key) => calmStyles[id] || (calmStyles[id] = fetch('https://styles.api.2gis.com/styles/' + id + '?key=' + encodeURIComponent(key))
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('style ' + r.status))))
    .then((j) => { const s = j.result || j; s.layers = (s.layers || []).filter((l) => !CALM_DROP.test(String(l.name || '').trim())); return s })
    .catch((e) => { console.warn('[v2] map: calm style unavailable, using the full 2GIS style', e); return null }))
  const mapglKey = () => {
    if (typeof window.MAPGL_KEY === 'string' && window.MAPGL_KEY) return window.MAPGL_KEY
    const q = new URLSearchParams(location.search).get('mapglKey')
    if (q) return q
    try { return localStorage.getItem('mapglKey') } catch (e) { console.warn('[v2] map: localStorage unavailable, no stored 2GIS key', e); return null }
  }
  let mapglLoading = null
  const loadMapGL = () => mapglLoading || (mapglLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = MAPGL_URL
    s.onload = () => (window.mapgl ? resolve(window.mapgl) : reject(new Error('mapgl global missing')))
    s.onerror = () => reject(new Error('MapGL script failed to load'))
    document.head.appendChild(s)
  }))

  const badge = (el, text, opts) => {
    const b = document.createElement('div')
    b.className = 'map-badge'
    b.setAttribute('role', 'note')
    b.textContent = text
    Object.assign(b.style, opts.badge || { top: '116px', left: '16px' })
    el.parentElement.appendChild(b)
  }

  /* Raster fallback (Stadia "Alidade Smooth"; CARTO now answers every request with an API-key tile). */
  const rasterBackend = (el, opts) => {
    const style = theme === 'dark' ? 'alidade_smooth_dark' : 'alidade_smooth'
    const map = L.map(el, { zoomControl: false, attributionControl: false, zoomSnap: 0.05, fadeAnimation: false,
      zoomAnimation: false, inertia: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, keyboard: false })
    L.tileLayer(`https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}@2x.png`, { maxZoom: 20, tileSize: 256 })
      .on('load', () => { document.documentElement.dataset.mapReady = 'raster' }).addTo(map)
    map.fitBounds(L.latLngBounds(opts.fit), { paddingTopLeft: opts.padTL || [24, 24], paddingBottomRight: opts.padBR || [24, 24] })
    return {
      route(pts, o) {
        L.polyline(pts, { color: css('--route-casing'), weight: (o.weight || 5) + 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map)
        L.polyline(pts, { color: o.color || css('--route'), weight: o.weight || 5, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: o.dash || null }).addTo(map)
      },
      html(ll, html, size, anchor) {
        L.marker(ll, { icon: L.divIcon({ className: 'marker-reset', html: `<div data-marker style="display:contents">${html}</div>`, iconSize: size, iconAnchor: anchor || [size[0] / 2, size[1] / 2] }), interactive: false, keyboard: false }).addTo(map)
      },
    }
  }

  /* MapGL backend. Coordinates are [lon, lat] in MapGL, [lat, lon] everywhere else in this mock. */
  const mapglBackend = (mapgl, el, node, opts, key, onRefused) => {
    /* The container stops at the sheet's rounded top, so 2GIS's logo and copyright (bottom-left, kept as the
       terms require) sit just above the sheet instead of under it. */
    /* opts.keyboard: the height of a raised on-screen keyboard (px). The map box also stops above it, so the
       2GIS logo is never under the keys (rider search used to need a spacer for this). */
    const inset = Math.max(0, (opts.sheetH || 0) - 24, opts.keyboard || 0)
    el.style.bottom = inset + 'px'
    const lats = opts.fit.map((p) => p[0]), lons = opts.fit.map((p) => p[1])
    const sw = [Math.min(...lons), Math.min(...lats)], ne = [Math.max(...lons), Math.max(...lats)]
    const map = new mapgl.Map(node, {
      key, center: [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2], zoom: 16,
      style: MAP_STYLE[theme], zoomControl: false, lang: MAP_LANG, graphicsPreset: 'light',
    })
    if (opts.calm) map.setStyle(opts.calm, STYLE_PATHS)
    map.on('error', (ev) => { if (ev && ev.type === 'invalidtilekey') onRefused() })
    /* 2GIS attribution must stay visible (2GIS terms; review X1). Whatever sits over the map's bottom edge — a sheet,
       a card, a button bar — the logo is lifted until nothing in the page covers it: elementFromPoint at its corners. */
    let logoPad = 0
    const keepLogo = () => {
      const a = el.querySelector('a[href*="2gis"]')
      if (!a) return
      for (let i = 0; i < 6; i++) {
        const r = a.getBoundingClientRect()
        if (r.width < 2) return
        const hit = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]]
          .map(([x, y]) => document.elementFromPoint(x, y)).find((t) => t && !el.contains(t))
        if (!hit) return
        const ht = hit.getBoundingClientRect()
        if (ht.top <= el.getBoundingClientRect().top + 80) return /* a full-screen scrim or modal: the logo is dimmed with the map, not hidden by a sheet */
        logoPad += Math.ceil(r.bottom - ht.top) + 6
        /* MapGL's setControlsLayoutPadding does not move the copyright, so its control pane is lifted directly. */
        let pane = a.parentElement
        while (pane && pane !== el && getComputedStyle(pane).position !== 'absolute') pane = pane.parentElement
        if (!pane || pane === el) return
        pane.style.setProperty('bottom', logoPad + 'px', 'important')
      }
    }
    map.on('idle', keepLogo)
    window.addEventListener('resize', keepLogo)
    /* 'idle' = style, tiles and overlays all drawn. Screenshots and the index wait on this flag. */
    let settled = false
    map.on('idle', () => {
      if (!settled) { settled = true; fit(); setTimeout(() => { document.documentElement.dataset.mapReady = '2gis' }, 3000); return } /* one re-fit on a fully laid-out map, then report ready */
      document.documentElement.dataset.mapReady = '2gis'
    })
    const [l, t] = opts.padTL || [24, 24], [r, b] = opts.padBR || [24, 24]
    /* Fit once now and again when the style has loaded: a fit issued before the style (or before an iframe
       is laid out) can land off-centre, which is what the index showed on one dark phone. */
    const fit = () => { map.invalidateSize && map.invalidateSize(); map.fitBounds({ southWest: sw, northEast: ne }, { padding: { top: t, left: l, right: r, bottom: Math.max(0, b - inset) }, skipAnimation: true }) }
    fit()
    map.on('styleload', fit)
    const ll = (p) => [p[1], p[0]]
    return {
      route(pts, o) {
        const dashed = !!o.dash
        new mapgl.Polyline(map, {
          coordinates: pts.map(ll), width: o.weight || 5, color: o.color || css('--route'),
          interactive: false,
          ...(dashed ? { dashLength: 3, gapLength: 6, gapColor: '#00000000' } : { width2: (o.weight || 5) + 4, color2: css('--route-casing') }),
        })
      },
      html(p, html, size, anchor) {
        new mapgl.HtmlMarker(map, {
          coordinates: ll(p), anchor: anchor || [size[0] / 2, size[1] / 2],
          html: `<div data-marker style="width:${size[0]}px;height:${size[1]}px;position:relative">${html}</div>`,
        })
      },
    }
  }

  window.makeMap = function (el, opts) {
    const ops = []
    let backend = null
    const replay = (b) => { backend = b; ops.forEach(([m, args]) => b[m](...args)) }
    /* Each backend gets its own host inside #map, so a refused MapGL can be hidden rather than torn down
       mid-frame (destroying it while it is still compiling shaders throws a WebGL context-lost error). */
    const host = () => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0'; el.appendChild(d); return d }
    const fallback = (why) => {
      el.style.bottom = ''
      el.dataset.provider = 'raster'
      badge(el, why, opts)
      replay(rasterBackend(host(), opts))
    }
    const adapter = {
      route: (...a) => (ops.push(['route', a]), backend && backend.route(...a)),
      html: (...a) => (ops.push(['html', a]), backend && backend.html(...a)),
    }
    const key = mapglKey()
    if (!key) { fallback('2GIS key missing — add v2/mapgl.local.js'); return adapter }
    el.dataset.provider = '2gis'
    Promise.all([loadMapGL(), opts.calm === false ? null : calmStyle(MAP_STYLE[theme], key)]).then(([mapgl, calm]) => {
      opts = { ...opts, calm }
      let refused = false
      const glHost = host()
      replay(mapglBackend(mapgl, el, glHost, opts, key, () => {
        if (refused) return
        refused = true
        console.warn('[v2] map: 2GIS refused the key (invalidtilekey); showing the raster fallback')
        glHost.style.display = 'none'
        fallback('2GIS key refused — check v2/mapgl.local.js')
      }))
    }).catch((err) => {
      console.warn('[v2] map: MapGL unavailable; showing the raster fallback', err)
      fallback('2GIS map unavailable')
    })
    return adapter
  }
  window.drawRoute = (map, pts, o = {}) => map.route(pts, o)
  window.htmlMarker = (map, ll, html, size, anchor) => map.html(ll, html, size, anchor)

  /* Top-down car for the map. */
  window.carTop = function (deg, fill, glass) {
    return `<svg width="18" height="34" viewBox="0 0 18 34" style="transform:rotate(${deg}deg);filter:drop-shadow(0 1px 2px rgb(0 0 0 / .35))">
      <rect x="1" y="1" width="16" height="32" rx="6" fill="${fill || 'var(--car-top)'}" stroke="rgb(0 0 0 / .16)" stroke-width=".75"/>
      <path d="M3.5 10.5c3.6-1.6 7.4-1.6 11 0l-1 4.5c-2.9-.9-6.1-.9-9 0z" fill="${glass || 'var(--car-top-glass)'}"/>
      <path d="M4.5 25.5c2.9.7 6.1.7 9 0l.8 3.2c-3.5 1.1-7.1 1.1-10.6 0z" fill="${glass || 'var(--car-top-glass)'}" opacity=".8"/>
      <rect x="5.5" y="17.5" width="7" height="4" rx="1.2" fill="var(--lime)"/>
    </svg>`
  }

  /* Tier cars are the fleet's own renders (assets/eco/cars/*.webp, ¾ front, transparent). */
  window.carImg = function (kind, alt) {
    return `<img src="assets/eco/cars/${kind}.webp" alt="${alt || ''}" decoding="async">`
  }
})()

/* «Բոլոր էկրանները»: a page opened on its own (not inside the viewer, not a screenshot run) gets one quiet pill back
   to the viewer (index.html), pointed at this very screen and state. The viewer's hash key is the page path relative
   to this script's folder, so it holds in the repo and on the preview site alike. */
;(() => {
  const me = document.currentScript && document.currentScript.src
  if (!me || window.top !== window || navigator.webdriver) return
  const base = new URL('.', me), here = new URL(location.href)
  const a = base.pathname.split('/').filter(Boolean), b = here.pathname.replace(/\.html$/, '').split('/').filter(Boolean)
  let i = 0
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++
  const key = '../'.repeat(a.length - i) + b.slice(i).join('/')
  if (key === 'index') return
  const q = new URLSearchParams(here.search), t = q.get('sun') === '1' ? 'sun' : q.get('theme') || 'light'
  ;['theme', 'sun', 'embed'].forEach((k) => q.delete(k))
  const go = () => {
    const el = document.createElement('a')
    el.href = new URL('index.html', base).href + '#' + new URLSearchParams({ p: key, s: q.toString(), t })
    el.textContent = '← Բոլոր էկրանները'
    el.setAttribute('style', 'position:fixed;z-index:2147483647;left:12px;bottom:12px;height:32px;padding:0 12px;border-radius:99px;'
      + 'background:#141416;color:#fff;font:500 13px/32px system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 16px rgb(0 0 0/.25);opacity:.88')
    document.body.appendChild(el)
  }
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go)
})()
