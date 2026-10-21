"use strict";

const elements = {
  form: document.querySelector("#searchForm"),
  cityInput: document.querySelector("#cityInput"),
  locationButton: document.querySelector("#locationButton"),
  status: document.querySelector("#status"),
  weatherPanel: document.querySelector("#weatherPanel"),
  forecastSection: document.querySelector("#forecastSection"),
  placeName: document.querySelector("#placeName"),
  weatherDescription: document.querySelector("#weatherDescription"),
  feelsLike: document.querySelector("#feelsLike"),
  weatherSymbol: document.querySelector("#weatherSymbol"),
  temperature: document.querySelector("#temperature"),
  windSpeed: document.querySelector("#windSpeed"),
  humidity: document.querySelector("#humidity"),
  uvIndex: document.querySelector("#uvIndex"),
  forecastGrid: document.querySelector("#forecastGrid")
};

const weatherCodes = {
  0: ["Clear sky", "☀"], 1: ["Mainly clear", "🌤"], 2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"], 45: ["Fog", "≋"], 48: ["Depositing rime fog", "≋"],
  51: ["Light drizzle", "☂"], 53: ["Drizzle", "☂"], 55: ["Heavy drizzle", "☂"],
  56: ["Freezing drizzle", "❄"], 57: ["Freezing drizzle", "❄"],
  61: ["Light rain", "🌦"], 63: ["Rain", "🌧"], 65: ["Heavy rain", "🌧"],
  66: ["Freezing rain", "❄"], 67: ["Heavy freezing rain", "❄"],
  71: ["Light snow", "❄"], 73: ["Snow", "❄"], 75: ["Heavy snow", "❄"],
  77: ["Snow grains", "❄"], 80: ["Rain showers", "🌦"], 81: ["Rain showers", "🌧"],
  82: ["Heavy rain showers", "🌧"], 85: ["Snow showers", "❄"], 86: ["Heavy snow showers", "❄"],
  95: ["Thunderstorm", "⛈"], 96: ["Thunderstorm with hail", "⛈"], 99: ["Severe thunderstorm", "⛈"]
};

function weatherInfo(code) {
  return weatherCodes[code] || ["Conditions unavailable", "☁"];
}

function setStatus(message, state = "info") {
  elements.status.textContent = message;
  elements.status.dataset.state = state;
}

function formatTemperature(value) {
  return Number.isFinite(value) ? Math.round(value) : "--";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.status === 404 ? "We couldn't find that city. Check the spelling and try again." : "Weather service is temporarily unavailable. Please try again.");
  }
  return response.json();
}

async function findCity(city) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const data = await fetchJson(url);
  if (!data.results?.length) throw new Error("We couldn't find that city. Try another name.");
  return data.results[0];
}

async function loadWeather(latitude, longitude, placeName, country = "") {
  setStatus("Getting the latest forecast…");
  elements.weatherPanel.hidden = true;
  elements.forecastSection.hidden = true;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max",
    timezone: "auto",
    forecast_days: "5"
  });

  const data = await fetchJson(url);
  if (!data.current || !data.daily) throw new Error("Weather data was incomplete. Please try again.");

  const current = data.current;
  const [description, symbol] = weatherInfo(current.weather_code);
  elements.placeName.textContent = country ? `${placeName}, ${country}` : placeName;
  elements.weatherDescription.textContent = description;
  elements.feelsLike.textContent = `Feels like ${formatTemperature(current.apparent_temperature)}°C`;
  elements.weatherSymbol.textContent = symbol;
  elements.temperature.textContent = formatTemperature(current.temperature_2m);
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  elements.uvIndex.textContent = Number.isFinite(data.daily.uv_index_max?.[0]) ? data.daily.uv_index_max[0].toFixed(1) : "--";

  elements.forecastGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.daily.time.forEach((dateString, index) => {
    const [dayDescription, daySymbol] = weatherInfo(data.daily.weather_code[index]);
    const date = new Date(`${dateString}T12:00:00`);
    const day = document.createElement("article");
    day.className = "forecast-card";
    const dayName = document.createElement("div");
    dayName.className = "forecast-day";
    dayName.textContent = index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
    const icon = document.createElement("span");
    icon.className = "forecast-symbol";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = daySymbol;
    const high = document.createElement("div");
    high.className = "forecast-temp";
    high.textContent = `${formatTemperature(data.daily.temperature_2m_max[index])}°`;
    const low = document.createElement("div");
    low.className = "forecast-low";
    low.textContent = `Low ${formatTemperature(data.daily.temperature_2m_min[index])}°`;
    const condition = document.createElement("p");
    condition.className = "forecast-condition";
    condition.textContent = dayDescription;
    day.append(dayName, icon, high, low, condition);
    fragment.append(day);
  });
  elements.forecastGrid.append(fragment);
  elements.weatherPanel.hidden = false;
  elements.forecastSection.hidden = false;
  setStatus(`Updated for ${placeName}.`);
}

async function searchWeather(city) {
  const query = city.trim();
  if (!query) {
    setStatus("Enter a city name to search.", "error");
    elements.cityInput.focus();
    return;
  }

  try {
    setStatus("Finding your city…");
    const place = await findCity(query);
    await loadWeather(place.latitude, place.longitude, place.name, place.country);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.", "error");
  }
}

elements.form.addEventListener("submit", event => {
  event.preventDefault();
  searchWeather(elements.cityInput.value);
});

elements.locationButton.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    setStatus("Location is not supported by this browser. Search for a city instead.", "error");
    return;
  }
  setStatus("Requesting your location…");
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        await loadWeather(coords.latitude, coords.longitude, "Your location");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to load weather.", "error");
      }
    },
    error => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Location permission was denied. You can search for a city instead."
        : "Could not determine your location. Search for a city instead.";
      setStatus(message, "error");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});
