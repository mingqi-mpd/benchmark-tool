# Mapendo UA Benchmark Tool MVP

A lightweight, responsive benchmark calculator built with plain HTML, CSS, JavaScript, and a JSON data file.

## Preview locally

Because the tool loads its mock data from `benchmarks.json`, preview it through a local web server rather than opening `index.html` directly.

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

## Connect the lead form

The advanced benchmark form currently ends in a demo confirmation. Replace the submit handler near the end of `app.js` with your CRM, marketing automation, or form endpoint before launching lead collection.

## Edit benchmark data

All mock benchmark inputs live in `benchmarks.json`. Countries and platforms apply multipliers to each vertical's baseline CPI, volume, and D7 ROAS ranges. Monthly budget, when supplied, is used to estimate daily install volume.
