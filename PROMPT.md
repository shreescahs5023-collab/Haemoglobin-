# Ready-to-use AI coding prompt

Build a complete responsive web app called **Hb Colour Reader** for medical laboratory technology (MLT) education.

## Core purpose
The user uploads a photograph of a blood-stained paper/sample used for a hemoglobin colour comparator. The app lets the user tap the blood-colour area, calculates an average RGB value, compares it with the reference colour levels from the supplied comparator chart, and produces an **approximate comparator-equivalent hemoglobin report**.

## Reference chart values
Use these values exactly as displayed in the supplied reference chart:
- 30% = 4.7 g/dL
- 40% = 6.3 g/dL
- 50% = 7.8 g/dL
- 60% = 9.4 g/dL
- 70% = 10.9 g/dL
- 80% = 12.5 g/dL
- 90% = 14.1 g/dL
- 100% = 15.6 g/dL

Chart interpretation shown in the supplied image:
- Men and women below 70%: Actual anemia range
- Men 70–85%: Suggestive anemia range
- Women 70–80%: Suggestive anemia range
- Men above 85%: Normal range
- Women above 80%: Normal range

Do not present these comparator categories as a validated modern diagnostic reference interval. Label the result as an educational/comparator estimate.

## Required features
1. Mobile-first responsive design.
2. Upload JPG/PNG/WebP using camera or gallery.
3. Display uploaded image on an HTML canvas.
4. Let the user tap/click the blood-colour area.
5. Show a selectable sampling radius.
6. Average the selected area's RGB values while ignoring near-white paper and extremely dark pixels.
7. Compare the measured RGB colour with the 8 reference RGB colours using Euclidean RGB distance.
8. Show:
   - comparator percentage
   - comparator-equivalent Hb in g/dL
   - measured RGB
   - nearest reference
   - colour distance
   - sex-specific interpretation
9. Show all 8 comparator reference swatches.
10. Display the original supplied comparator chart as a reference image.
11. Allow sample ID, sex and date.
12. Generate a printable laboratory-style report.
13. Include a strong warning:
   - photograph-based colour matching is affected by lighting, flash, white balance, paper type, sample volume and glare
   - this is not a laboratory Hb measurement
   - confirm with a validated laboratory method before clinical decisions
14. No backend, no login, no external API and no paid service.
15. Do not upload patient images to a server; perform image processing in the browser.
16. Add basic PWA/offline support with manifest.json and service worker.
17. Use semantic HTML, accessible labels, large touch targets and simple English.
18. Make it suitable for deployment directly to Netlify and GitHub Pages.

## Technical structure
Create:
- index.html
- styles.css
- app.js
- manifest.json
- sw.js
- README.md
- assets/hb-comparator-reference.jpg

## UI sections
1. Sample details
2. Upload Hb colour sample
3. Colour measurement
4. Comparator result
5. Reference chart
6. Printable report

## Important safety/accuracy wording
Use the phrase **"Comparator-equivalent Hb (approximate)"**, not "measured Hb".
Use the phrase **"Educational colour-comparator estimate"**.
Do not diagnose anemia from the photograph alone.

## Deployment
The project must work as a static website:
- Netlify: drag-and-drop deployment; no build command.
- GitHub Pages: main branch, root directory.
