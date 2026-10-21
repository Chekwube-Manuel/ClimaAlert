# ClimaAlert

A responsive weather dashboard with current conditions and a five-day forecast for cities worldwide, including Nigerian cities.

## Features

- City search with location and country details
- Current temperature, feels-like temperature, humidity, wind speed, and UV index
- Five-day daily forecast
- Optional browser geolocation
- Responsive desktop and mobile layout
- No API key or build step required

## Technology

- HTML, CSS, and vanilla JavaScript
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)

## Run locally

Because browser geolocation requires a secure context, use localhost rather than opening the HTML file directly.

With Python installed:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

Alternatively, use any static file server. There is no package installation or compilation step.

## Deploy

### GitHub Pages
1. Open the repository's **Settings → Pages**.
2. Under Build and deployment, select **Deploy from a branch**.
3. Select the deployment branch and the `/` (root) folder, then save.
4. Wait for the Pages deployment workflow to finish.

### Vercel or Netlify
Import the repository and use these settings:
- Framework preset: **Other** / static site
- Build command: leave empty
- Output directory: `.`
- Install command: leave empty

The root `index.html` is the entry point. No secrets or environment variables are required.

## Notes

Weather data is supplied by Open-Meteo. Network access is required. Browser geolocation is optional and only runs after the user presses **Use my location**.
