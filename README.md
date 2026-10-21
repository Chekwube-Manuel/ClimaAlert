# ClimaAlert NG

ClimaAlert NG is a lightweight weather app for checking current conditions and a five-day forecast for Nigerian cities.

## Run locally

Open `index.html` through a local static server. Browser geolocation generally requires HTTPS or localhost.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

This is a static HTML, CSS, and JavaScript site. No package installation or build command is required.

- **Vercel / Netlify:** set the project root as the output/publish directory and leave build and install commands empty.
- **GitHub Pages:** choose the deployment branch and the root folder in Settings → Pages.

The root `index.html` is the deployment entry point.

## Weather API key

The app currently calls the OpenWeatherMap API directly from the browser. A key embedded in frontend JavaScript is visible to visitors. Rotate the existing key if it has been exposed, and restrict it to the intended API and domains where OpenWeatherMap supports those controls. For stronger protection, move API calls behind a server-side endpoint.

## Project structure

```text
ClimaAlert/
├── index.html
├── ClimaUpdated.html
├── doc/
│   └── updated.html
└── README.md
```
