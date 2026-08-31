# Mapendo UA Benchmark Tool MVP

A lightweight, responsive benchmark calculator built with plain HTML, CSS, JavaScript, and a JSON data file.

The current visual system follows Mapendo's website: locally hosted CircularStd fonts, Mapendo blue and navy, pill-shaped calls to action, light cards, and an original transparent benchmark illustration in `assets/illustrations/`.

## Preview locally

Because the tool loads its data from `benchmarks.json`, preview it through a local web server rather than opening `index.html` directly.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push these files to the root of a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch and `/ (root)`, then save.

No build command or framework is required.

## Lead form

The full-report form is connected to Mapendo's Mailchimp Audience. It requires a work email and explicit consent to receive the report and follow-up sales and marketing communications.

## Edit benchmark data

All benchmark inputs live in `benchmarks.json`. Country and vertical options filter each other so unavailable combinations are never offered. Game verticals automatically display their fixed IAA or IAP monetization model, and results show only the metrics available for the selected combination.
