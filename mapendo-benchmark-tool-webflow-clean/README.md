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

## Embed in Webflow

Use a Webflow Code Embed with an iframe and listen for the tool's height message. The iframe reports its content height whenever the layout changes, so the embedded page ends immediately after its final section without a fixed-height gap.

```html
<iframe id="mapendo-benchmark-frame" src="https://mingqi-mpd.github.io/benchmark-tool/?v=scroll-1" title="Mapendo Mobile UA Benchmark Calculator" loading="lazy" scrolling="no"></iframe>
<style>#mapendo-benchmark-frame{display:block;width:100%;height:1px;border:0;overflow:hidden}</style>
<script>
  (() => {
    const frame = document.getElementById("mapendo-benchmark-frame");
    window.addEventListener("message", (event) => {
      if (event.origin !== "https://mingqi-mpd.github.io" || event.source !== frame.contentWindow) return;
      if (event.data?.type === "mapendo-benchmark-height") {
        frame.style.height = `${Math.max(1, Math.ceil(event.data.height))}px`;
        return;
      }

      if (event.data?.type === "mapendo-benchmark-scroll") {
        const frameTop = window.scrollY + frame.getBoundingClientRect().top;
        window.scrollTo({
          top: Math.max(0, frameTop + event.data.offsetTop - 24),
          behavior: "smooth"
        });
        return;
      }

      if (event.data?.type === "mapendo-benchmark-wheel") {
        const multiplier = event.data.deltaMode === 1
          ? 16
          : event.data.deltaMode === 2
            ? window.innerHeight
            : 1;
        window.scrollBy(0, event.data.deltaY * multiplier);
      }
    });
  })();
</script>
```

## Lead form

The full-report form is connected to Mapendo's Mailchimp Audience. It requires a work email and explicit consent to receive the report and follow-up sales and marketing communications.

## Edit benchmark data

All benchmark inputs live in `benchmarks.json`. Country and vertical options filter each other so unavailable combinations are never offered. Game verticals automatically display their fixed IAA or IAP monetization model, and results show only the metrics available for the selected combination.
