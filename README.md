# Hb Colour Reader – Netlify / GitHub

A lightweight, client-side educational hemoglobin colour comparator app.

## Features
- Upload a photograph of an Hb colour sample.
- Tap the blood colour in the image.
- Samples an average RGB colour around the selected point.
- Compares it with 8 reference colour levels from the supplied comparator chart.
- Displays comparator-equivalent Hb:
  - 30% → 4.7 g/dL
  - 40% → 6.3 g/dL
  - 50% → 7.8 g/dL
  - 60% → 9.4 g/dL
  - 70% → 10.9 g/dL
  - 80% → 12.5 g/dL
  - 90% → 14.1 g/dL
  - 100% → 15.6 g/dL
- Provides sex-specific wording based on the supplied chart:
  - Men: below 70% = actual anemia range; 70–85% = suggestive; above 85% = normal.
  - Women: below 70% = actual anemia range; 70–80% = suggestive; above 80% = normal.
- Generates a printable report.
- Works without a backend and can be deployed as a static site.
- Includes a basic service worker for offline caching.

## Deploy to Netlify
1. Unzip the project.
2. Go to Netlify and choose **Add new project / Deploy manually**.
3. Drag the project folder into the deploy area, or connect the GitHub repository.
4. No build command is required.
5. Publish directory: the project root.

## Deploy with GitHub Pages
1. Create a new GitHub repository.
2. Upload all files and folders.
3. In repository Settings → Pages, select the main branch and root folder.
4. Save and open the generated GitHub Pages address.

## Important limitation
This is a teaching/screening demonstration, not a validated hemoglobin analyzer. Photograph lighting, camera processing, paper colour, sample volume, glare and staining technique can significantly affect RGB matching. Clinical decisions must use a validated laboratory Hb method.
