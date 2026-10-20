# Revolut, measured: what to revise in PR #12 (P-017)

Source: `reverse-brand` headed run by Erdi, 2026-10-20 (6 pages of revolut.com, 1440 and 390 px; `~/reverse-brand/out/revolut.com/`). Unofficial analysis, used for patterns and proportions only; nothing is copied. Myna brand rules (P-011 to P-016) still apply.

## Measured vs PR #12

| | Revolut (measured) | PR #12 now | Revise to |
|---|---|---|---|
| Display headline | 48 → 88 px, weight 500, line-height 1.0, tracking -0.024em | 52 → 112 px, weight 700, -0.045em | 48 → 88 px, weight 600 (Montserrat is wider than Aeonik), line-height 1.0, -0.025em |
| Section headline (h2) | 30 → 48 px, weight 500, line-height 1.0 | 36 → 60 px, weight 700 | 32 → 48 px, weight 600, line-height 1.05 |
| Card / subhead (h3) | 16 → 24–26 px, weight 500 | 18–22 px, weight 700 | 20 → 24 px, weight 600 |
| Body | 16 px, line-height 1.5 | 16 px, line-height 1.7 | line-height 1.55 on the home |
| Lead | 18 px, line-height 1.33 | 17–20 px, line-height 1.6 | 18 px, line-height 1.4 |
| Buttons | pill, 42 px tall, 24 px side padding, 16 px weight 500; white or black filled, plus translucent white on photos | pill, 48 px, 15 px weight 600 | keep 48 px (touch target) but 16 px weight 500; add a translucent-white pill on photos (flat rgba, no blur) |
| Cards | radius 20, padding 24; #f7f7f7 on white, #1c1c1e on black | radius 28, padding 32–40 | radius 20, padding 24 |
| Colour | monochrome: white ground, #f7f7f7 surface, #1f1f1f text, #717173 muted, black bands; colour only in photos | beige ground, navy bands, electric buttons | keep the brand colours, but use **white** as the home ground with beige/soft blue only as card surfaces; keep electric for one action per screen |
| Container | 1000 px | 1200 px | ~1040 px for text and cards; photos stay full-bleed |
| Section rhythm | light, dark, light, dark | photo, white, photo, navy, white, navy, white, beige, photo card, navy | already alternating; drop the beige band (identity block on white) |
| Imagery | 68 media elements, 32% full-bleed, 15 of them looping mp4 videos | 6 photos, all still | optional, needs Erdi: one short muted loop (≤ 1 MB) in the hero or moments; would need a P-015 exception for an autoplaying video |
| Voice | 99% sentence case, median 4 words per headline, no exclamation marks | sentence case, 4–7 words | shorten the long ones, e.g. "Myna Fit, pelacak latihan dan catatan makan." (7) → "Latihan dan makan, tercatat." (4) |
| Motion | ease, 0.3 s | strong ease-out, 0.18–0.7 s | keep (P-015) |
| Breakpoints | 600, 720, 840, 1200, 1600, 1920 | 640, 768, 1024, 1280 | add a 1600 px step so headlines and photos scale on large screens |

## Order of work

1. Type scale and weights (biggest visual gap: Revolut reads lighter and calmer, PR #12 reads heavy).
2. White ground, cards at radius 20 / padding 24, container ~1040 px.
3. Buttons: 16 px weight 500, translucent pill on photos.
4. Shorter headlines.
5. Decide on a hero/moment video loop (product decision for Erdi).

## Tool notes

- The Revolut guide overflows by 5 px at 390 px, and the Revolut video file is corrupt (probably the original run resumed after the Mac woke while a second run wrote the same file). Both are `reverse-brand` issues, not data issues; the measurements above come from `analysis.json`.
