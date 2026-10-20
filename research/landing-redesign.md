# Landing redesign research (mynahealth.id)

Goal: find what makes a corporate wellness/lifestyle landing feel distinctive and premium, and turn it into a concrete redesign for mynahealth.id. Erdi (2026-10-20): the current landing looks generic/template, lacks wow and visuals, the structure and content are boring, and the products don't come across as worth trying.

Constraints: static Astro + Tailwind v4, CSP self only (no external scripts/CDNs), light theme, brand guideline 2026 (navy #032b84, electric #113bfe, cyan #24dde2, soft blue #dae7fc, beige #fbf6f0, capsule supergraphic, Montserrat for Garet), no medical content, no prices, founders hidden, no city in copy, contact by email (halo@mynahealth.id), Myna Fit CTA "Jadi Sehat Bareng".

## Round 1: mkdir.directory (2026-10-20)

- **What it is:** a hand-picked list of 34 free web-design inspiration galleries, ranked by votes; no categories, no UI kits/assets/skills. Curator unknown. Source: https://mkdir.directory/ (confidence: high).
- **Most useful for us:**
  - Unsection, section-by-section inspiration (hero, feature, CTA, FAQ, footer…) plus an Industries view: https://www.unsection.com (free members: unlimited on Mondays only).
  - One Page Love genres `/genre/landing-page`, `/genre/app`, `/genre/launching-soon` (Myna Food): https://onepagelove.com
  - Land-book https://land-book.com, Saaspo https://saaspo.com (403 to the fetcher, unconfirmed), SaaS Landing Page https://saaslandingpage.com, Minimal Gallery https://minimal.gallery
  - Navbar Gallery https://www.navbar.gallery, Footer.design https://www.footer.design
  - Motion references: GSAP Showcase https://gsap.com/showcase/, Lenis https://lenis.dev/showcase, Codrops Hub https://tympanus.net/codrops/hub/, Movin https://movin.design (any technique must be self-hosted and reduced-motion safe)
  - Award galleries: Awwwards https://www.awwwards.com, CSS Design Awards https://www.cssdesignawards.com, The FWA https://thefwa.com, Siteinspire https://www.siteinspire.com (`/websites/category/minimal`, `/typographic`)
- **Gap:** no wellness/health-specific gallery on the list; One Page Love and Siteinspire show no health category. Next: Awwwards category filter, Unsection Industries.

## Round 2a: section patterns (Unsection, One Page Love, SaaS Landing Page)

Caveat: galleries are mostly thumbnails; patterns come from tags and section names plus general knowledge, not a close look at each example (confidence: medium). Unsection has an Industries view with "Health" (unsection.com/industry/healthcare) but no wellness examples.

- **Hero:** editorial split (Miso, onepagelove.com/miso); centered headline with a device stack rising into the next section; **supergraphic frame**, brand shapes crop photos and screens (Softle, onepagelove.com/softle); 3D/mesh stage (Tara, onepagelove.com/tara). Best fit: supergraphic frame with pill masks cropping people photos and one real app screen overlapping a pill edge, editorial headline.
- **Product showcase:** layered screen stack (≤3° tilt, consistent chrome); scroll-pinned walkthrough (crossfades); bento of large real UI crops in brand tiles; tabbed switcher with auto-advance.
- **Coming soon:** teaser card in the brand shape + "Segera hadir" + one line + `mailto:` with a preset subject; sibling card beside the live app, muted.
- **Closing CTA:** full-width pill band; person photo with CTA overlay; split card, one half per app. **Footer:** oversized wordmark bleeding off the edge; quiet 3-column; brand-color footer echoing the supergraphic.
- **Trust without stats:** principles block; transparency links (UU PDP privacy, "bukan pengganti tenaga profesional", legal entity, address, real email). (A founder/team section is out: founders stay hidden, P-008.)

## Round 2b: wellness/lifestyle exemplars

Caveat: no gallery listing could be confirmed for these brands; WebFetch sees text, not rendered layout; (k) = prior knowledge. Whoop returned 403. Confidence: medium.

- **Gentler Streak** https://gentlerstories.com/gentlerstreak/ (Apple Design Award 2024): one thesis ("rest counts"); one real feature screen per section with a short conversational headline; privacy gets its own section written as a feature.
- **Bevel** https://www.bevel.health: centered hero with a row of real screens; the app's metric cards placed over real lifestyle photos; chat bubbles over screenshots explain the AI coach without a demo.
- **Oura** https://ouraring.com: campaign photo with the product small in frame; organised by life moments, not features.
- **Ladder** https://joinladder.com: first CTA is a low-commitment 2-minute quiz; defines itself by what it is not; publishes an llms.txt of brand facts.
- **ZOE** https://zoe.com: food photography + manifesto; health disclaimer has a visible section of its own; weak on showing the app.
- **Strava** https://www.strava.com: community hero; alternating rows of real screens; a strip of short trust claims instead of statistics.

**Premium patterns:** one emotional thesis driving every section; real UI in context (on people photos or cropped to one card), not generic mockups; one idea per section; a brand device used as a system (Myna's capsule); trust without numbers (privacy, how it works, what it is/isn't); a low-commitment first step.
**Anti-patterns:** repeating hero/feature blocks as filler; screenshot collages with no story; commerce before the idea; logo walls and inflated stats.

## Proposed redesign (for Erdi's approval, 2026-10-20)

Thesis: **kebiasaan kecil, setiap hari** (small habits, every day). Every section serves it; the capsule is the system that frames photos and real UI.

1. **Hero:** editorial headline left; right, the capsule frame with a person photo and one real Myna Fit card overlapping the capsule edge. CTAs: "Jadi Sehat Bareng" (Myna Fit) and "Kenali Myna Health".
2. **Trust strip** of short true claims, no stats: berbahasa Indonesia · langsung dari browser · data dilindungi UU PDP · bukan layanan medis.
3. **Three life moments** (Oura): pagi, di gym, saat makan; each one sentence and one large real UI crop in a capsule tile (bento).
4. **Myna Fit walkthrough:** the existing interactive switcher, with short annotation bubbles over the real screens (Bevel).
5. **Myna Food teaser:** sibling card, muted, "Segera hadir", `mailto:` with subject "Kabari saya: Myna Food".
6. **Privacy as a feature** (Gentler): what is stored, not sold, export/delete.
7. **What Myna Health is and isn't** (Ladder/ZOE): the disclaimer as an honest visible section.
8. **Company identity** (KYC), compact.
9. **Closing:** split card, one half per app; **footer** with an oversized wordmark bleeding off the edge.

Needs: 1–2 more people photos (phone in hand, daylight), crops from the existing Myna Fit screens. No new copy claims beyond what is true today.

