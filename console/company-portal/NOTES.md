# Company console (decision P1, 2026-10-16): second draw, after the owner's answers

A corporate client gets its own login. It sees and creates **only its own company's orders**. It books a ride for an
employee, follows the company's rides live, reads its history (with the period report folded in), and keeps its
employees and allowed tariffs. It never edits a price, never pays, and never sees an invoice (owner decision 11: the
product has no invoices). Company rides never go to ETAPI.

Pages: `index.html` (Live orders), `new.html`, `history.html`, `employees.html` (Settings › Employees),
`settings.html` (Settings › Tariffs and Settings › Company), `login.html`. `report.html` only redirects to
`history.html?state=month`. The fleet side lives in `../company.html?tab=settings` («Ընկերության վահանակ» block;
`&portal=off` for a company without a portal). Each page takes `?theme=light|dark` and `?state=…`; the states are listed
in `window.STATES` and in each file's top comment. Built on `../console.css`, `../corporate.css` (unchanged),
`portal.css` (layout only), `portal.js` (shell and data) and `../company-report.js` (the report's data set).

## Owner decisions, 2026-10-16
1. **No map anywhere.**
2. **Nav is four items:** Ընթացիկ պատվերներ (Live orders), Նոր պատվեր, Պատմություն, Կարգավորումներ. On a phone, the same
   four sit in a bottom bar.
3. **Live orders are view only.** There is no cancel, no call button and no action of any kind. The ride panel shows
   read-only details. «Մեքենա դեռ չկա» is plain information: a neutral line in the panel and an amber pill with an icon
   in the row. The fleet's dispatch owns every change.
4. **The Report is folded into History.** The period is a month, a week or chosen days. It shows the accumulated ride
   count and amount, every ride or the per-employee totals, Excel / CSV / PDF for exactly that period, and «Վճարված»
   read-only on a closed month.
5. **Exactly one login per company: its manager.** There are no roles and no portal-user list. The fleet sets the
   manager's name and phone on the console's company page. On the company side the phone is locked, with the line
   «Համարը փոխում է տաքսի ծառայությունը».
6. **Settings has three tabs:**
   - Employees: add, remove, monthly limit, allowed places.
   - Tariffs: the tariffs the company allows its employees. Eco Vip is off for Արարատ Սոֆթ.
   - Company: the legal details and agreement, read-only; report addresses; notifications; the manager's own account.
7. **New order is the dispatch intake without a map, for the company's employees only.** The first field is the
   employee's phone. Only a registered employee's number is accepted. Any other number is refused in amber with
   «Ավելացնել աշխատակից». The tariff grid shows only the allowed tariffs. Payment is locked to the company's account.
8. **Fleet side:** the console's company page gets «Ընկերության վահանակ», with three parts:
   - the portal on or off (some companies want no portal);
   - the manager's name and phone (the one login);
   - the allowed tariffs, the same setting the company sees. Whoever changes it last wins, and every change is audited.
   With the portal off, the login is closed and answers like an unknown number. The allowed tariffs still govern the
   rider app and the dispatch intake.
The other open questions keep the defaults drawn earlier (listed at the end).

## What it is, and how it differs from the dispatch console
- **Density number: every live company ride on one screen without scrolling at 1366×768 (up to 10), and a booking for an
  employee in under 30 seconds.**
- **Calmer on purpose.** There is no queue, no shift bar, no sounds, no problem count and no keyboard legend. The top bar
  holds only connection, language and theme.
- **Kept from the console:** the three grounds, both themes (light base, `data-theme` only), mono numbers in fixed columns,
  notice tones (blue only for "this changed", amber for a domain refusal, neutral for a clean outcome or information, red
  only for what failed), armed confirms («Հաստատե՞լ»), docked panels, and never a modal.
- **Trends refused:** a live map (owner decision, and 2GIS tiles bill per load); bento dashboards and charts on Live
  orders (the booker checks a car, not spend). History's one visual is a share bar per employee.

## What the API would need (for the CTO; nothing here is decided)
- **One login per company.** Add to `company`: `portal_enabled boolean default false`, `manager_name`,
  `manager_phone` (unique per tenant among enabled portals). No separate user table and no roles.
  - Login is phone + SMS OTP on the customer-auth path (ADR-C6). The JWT carries `companyId`.
  - Disabling the portal, or changing the manager's phone, revokes the existing sessions.
  - OTP send answers the same for an unknown number, a disabled portal and a valid manager, and is rate-limited per phone
    and per IP.
- **Allowed tariffs per company:** `company_allowed_tier(tenant_id, company_id, tier_id)`, or an array on the
  agreement. It is edited from both sides; the latest write wins, and every change is audited.
  - It is enforced in the domain (`corporateEligibility`), so the rider app, the dispatch intake and the portal refuse the
    same rides. The refusal code is `tier_not_allowed`.
  - Changing it never touches rides already booked.
- **A route group `/client/*`** with its own guard. **`companyId` comes from the token, never from the body or query.**
  Every read and every write re-states `tenant_id AND company_id` in its own `WHERE`. Another company's ride answers
  404, not 403.
  - `GET /client/rides?scope=live|planned|history&from&to&employee&state&bookedBy&q`: one continuous list with a cursor.
    **Live rides are read-only: there is no cancel or edit route.**
  - `GET /client/employees/lookup?phone=`: only the company's own employees match.
  - `POST /client/rides` `{employeePhone, pickup, drop, tierId, scheduledAt?, note?}`:
    - `paymentMethod` is forced to `on_account`.
    - Inside the create transaction it checks: the employee belongs to this company, tariff allowed, the company's credit
      headroom (`FOR UPDATE`), the employee's monthly limit against the fixed upfront price, and the allowed places.
    - Refusals are 409s with codes: `not_employee`, `tier_not_allowed`, `company_over_limit`, `employee_over_limit`,
      `place_not_allowed`, `employee_stopped`. A moved price is `quote_changed`.
  - `GET /client/history/summary?from&to&group=employee`, plus
    `GET /client/history/export?from&to&format=xlsx|csv|pdf`. Both use the same generator as the console's company
    report, so the two never disagree.
  - `GET/POST/DELETE /client/employees` and `PATCH /client/employees/:id` (limit, places).
  - `GET/PUT /client/tariffs`.
  - `PATCH /client/settings` (report emails, notifications).
- **Wire schemas** live in `packages/shared` as a separate `client*` family. They leave out the driver's phone, earnings
  and fees, `fare_breakdown`, dispatch reasons and every other company. The client view parses strictly, like the
  operator console.
- **Realtime:** a per-company channel that carries only state changes of the company's rides. REST stays the truth: with
  the socket down the client polls every 30 s and says so.
- **Audit:** portal bookings are recorded with the actor «Վահանակից» (the manager), and the history shows that.

## Defaults kept (no change from the first draw)
- The driver is shown as short name, plate and car, with no phone.
- A pre-order counts against the limit when it is ridden.
- No guest rides.
- «Վճարված» is read-only.
- A stopped employee shows «Սպասարկումը դադարեցված է» and the fleet's phone.
- The employee gets an SMS when a car is assigned.
- One phone belongs to one company.
- Monthly auto-send replaces the fleet's «Ուղարկել ընկերությանը» when the company turns it on.
- Only the final company price is shown.

## Audit (`../console-audit.js`, Playwright, 2026-10-16, second draw)
42 portal page-states × light/dark × 1440×900, 1366×768 and 390×844, plus the two `company.html` settings states at
1440 and 1366 (the operator console is a desktop surface), make **260 runs: 0 overlaps, 0 clips, 0 contrast failures,
0 small-text-under-7:1, 0 console errors, no horizontal scroll.**
- **18 truncations, all deliberate:**
  - 12: the airport route in a table cell at 1366.
  - 4: the legal address field on `company.html`'s existing Data form at 1366.
  - 2: a new employee's name in a cell.
- **80 excepted** results, all inside the employee phone dropdown (`data-overlay`).
- **Rows straddling a scroll box's bottom edge** were marked `data-peek` before `audit()` ran. A row cut by scrolling
  otherwise reads as "occluded" by the bottom bar or a total row. No other result was suppressed.
- **Tightest margin: 1.01×**, from the console's own blue notice (`--info` on `--info-soft`) at 13px in light: 4.55:1.
  That passes AA but sits below the 7:1 this console holds 13px labels to. Dispatch uses the same token.
