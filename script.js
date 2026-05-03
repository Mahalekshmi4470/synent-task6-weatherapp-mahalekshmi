/* ================= CONFIG ================= */

const API_KEY = "1a3b11adf1b2e090f7cf96deff118577"; // 🔴 Replace with your OpenWeather API key
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/* ================= DOM ELEMENTS ================= */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggleBtn = document.getElementById("unitToggleBtn"); // ✅ fixed

const loadingDiv = document.getElementById("loadingSpinner"); // ✅ fixed
const errorDiv = document.getElementById("errorMsg"); // ✅ fixed
const weatherInfoDiv = document.getElementById("weatherInfo");
const emptyStateDiv = document.getElementById("emptyState");

const cityName = document.getElementById("cityName");
const dateTime = document.getElementById("dateTimeDisplay"); // ✅ fixed
const description = document.getElementById("weatherDesc"); // ✅ fixed
const temperature = document.getElementById("temperature");
const tempUnit = document.getElementById("tempUnit");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("windSpeed"); // ✅ fixed
const weatherIcon = document.getElementById("weatherIcon");

const historyDiv = document.getElementById("historyList"); // ✅ fixed
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const countryCode = document.getElementById("countryCode");

/* ================= STATE ================= */

let isCelsius = true;
let currentWeatherData = null;

/* ================= FETCH WEATHER ================= */

async function fetchWeather(city) {
  if (!city || city.trim() === "") {
    showError("Please enter a valid city name.");
    return;
  }

  showLoading(true);
  hideError();

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("City not found!");
    }

    const data = await response.json();

    currentWeatherData = data;
    updateWeatherUI(data);
    saveToHistory(data.name);
  } catch (error) {
    showError(error.message);
    weatherInfoDiv.classList.add("hidden");
  }

  showLoading(false);
}

/* ================= UPDATE UI ================= */

function updateWeatherUI(data) {
  errorDiv.classList.add("hidden");
  emptyStateDiv.classList.add("hidden");
  weatherInfoDiv.classList.remove("hidden");

  cityName.innerText = data.name;
  countryCode.innerText = data.sys.country;

  const now = new Date();
  dateTime.innerText = now.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Capitalize description
  const desc =
    data.weather[0].description.charAt(0).toUpperCase() +
    data.weather[0].description.slice(1);

  description.innerText = desc;

  let temp = data.main.temp;
  let feels = data.main.feels_like;

  if (isCelsius) {
    temp = temp.toFixed(1);
    feels = feels.toFixed(1);
    tempUnit.innerText = "°C";
  } else {
    temp = ((temp * 9) / 5 + 32).toFixed(1);
    feels = ((feels * 9) / 5 + 32).toFixed(1);
    tempUnit.innerText = "°F";
  }

  temperature.innerText = temp;
  feelsLike.innerText = `Feels like: ${feels}${tempUnit.innerText}`;

  humidity.innerText = `💧 Humidity: ${data.main.humidity}%`;

  // Wind conversion
  let windSpeed = data.wind.speed;
  if (!isCelsius) {
    windSpeed = (windSpeed * 2.237).toFixed(1);
    wind.innerText = `🌬 Wind: ${windSpeed} mph`;
  } else {
    wind.innerText = `🌬 Wind: ${windSpeed} m/s`;
  }

  // Weather Icon
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

}

/* ================= LOADING ================= */

function showLoading(show) {
  loadingDiv.classList.toggle("hidden", !show);
  searchBtn.disabled = show;
}

/* ================= ERROR ================= */

function showError(message) {
  errorDiv.innerText = message;
  errorDiv.classList.remove("hidden");
}

function hideError() {
  errorDiv.classList.add("hidden");
}

/* ================= HISTORY ================= */

function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  if (!history.map((c) => c.toLowerCase()).includes(city.toLowerCase())) {
    history.push(city);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }

  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];

  historyDiv.innerHTML = "";

  if (history.length === 0) {
    historyDiv.innerHTML = `<p class="history-placeholder">No recent cities</p>`;
    return;
  }

  history.forEach((city) => {
    const span = document.createElement("span");
    span.innerText = city;
    span.classList.add("history-item");

    span.addEventListener("click", () => {
      fetchWeather(city);
    });

    historyDiv.appendChild(span);
  });
}

/* ================= EVENTS ================= */

searchBtn.addEventListener("click", () => {
  fetchWeather(cityInput.value);
  cityInput.value = "";
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather(cityInput.value);
    cityInput.value = "";
  }
});
cityInput.addEventListener("input", hideError);
unitToggleBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;

  unitToggleBtn.innerText = isCelsius ? "🌡️ °C" : "🌡️ °F";

  if (currentWeatherData) {
    updateWeatherUI(currentWeatherData);
  }
});
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("weatherHistory");
  renderHistory();
});

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  cityInput.focus();
});
