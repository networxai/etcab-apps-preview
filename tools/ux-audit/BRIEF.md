# Laws of UX audit — shared brief

Audit the ETCAB (Eco Taxi, Yerevan) mockups against the Laws of UX (https://lawsofux.com): Aesthetic-Usability,
Choice Overload, Chunking, Cognitive Load, Doherty Threshold, Fitts's Law, Flow, Goal-Gradient, Hick's Law,
Jakob's Law, Common Region, Proximity, Prägnanz, Similarity, Uniform Connectedness, Mental Model, Miller's Law,
Occam's Razor, Paradox of the Active User, Pareto, Parkinson's Law, Peak-End Rule, Postel's Law, Selective
Attention, Serial Position, Tesler's Law, Von Restorff, Working Memory, Zeigarnik.

Context that must NOT be "fixed" away (owner decisions):
- Payment: cash, card (iPay/ArCa), Apple Pay, Google Pay, «NFC · POS» (one method, at the driver). +2 % service fee on
  card / Apple Pay / Google Pay / NFC·POS, the company's, on our receipt only, never on the Tax Service receipt.
  Cash and company rides: no fee. No refunds. Company rides never go to ETAPI.
- Tariff is the main config; zones add exceptions (airport: no cash on pickup, no Eco Kids, ≥ 2 h pre-orders, +500 ֏;
  fixed zone-to-zone fares).
- Console rules (/home/vardan/projects/ETCAB/CLAUDE.md "Console rules"): the queue is the centrepiece; no modals mid-
  call; no pagination on the live queue; 8+ rides visible at 1440×900; notice tones (blue = concurrency only, amber =
  domain refusal, red = real failure); numbers mono; hover-revealed actions by opacity + focus-within.
- Driver: §10 morphing button, 52 px primary targets, Sun mode, glanceable at speed.
- Copy is Armenian-first; keep the existing glossary. Every page also renders in ru/en through i18n.js (don't break
  text nodes into tiny fragments; new Armenian strings are fine — the lead re-translates them).

Severity: high = slows or misleads a real task (wrong tap, missed info, extra steps on a frequent path);
medium = friction; low = polish.

Output: tools/ux-audit/<surface>.json — an array of
{ "law": "Fitts's Law", "screen": "<file>", "state": "<state id or query>", "issue": "<one sentence>",
  "fix": "<one sentence>", "severity": "high|medium|low", "fixed": true|false }
Fix every HIGH finding directly (and mediums that are cheap and safe); leave lows as findings. Keep findings honest:
quality over quantity, no padding — 15–40 findings per surface is about right.
