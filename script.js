//API handler
const API_KEY = '009352fa67ec30bbae467f67872f8034';
const API_BASE = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const locationBtn = document.getElementById('locationBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');

// Weather Display Elements
const cityName = document.getElementById('cityName');
const weatherDate = document.getElementById('weatherDate');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weatherDescription');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

// Initialize App
function initApp() {
    searchForm.addEventListener('submit', handleSearch);
    locationBtn.addEventListener('click', handleGeolocation);
    
    // Try to get user's location on load
    handleGeolocation();
}

// Handle Search Form Submit
function handleSearch(e) {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (city) {
        getWeatherByCity(city);
        cityInput.value = '';
    }
}

// Handle Geolocation
function handleGeolocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                handleError('Unable to get your location. Please search for a city.');
            }
        );
    } else {
        handleError('Geolocation is not supported by your browser.');
    }
}

// Fetch Weather by City Name
async function getWeatherByCity(city) {
    showLoading();
    hideError();
    
    try {
        const currentWeather = await fetchCurrentWeather(city);
        const forecast = await fetchForecast(city);
        
        updateUI(currentWeather, forecast);
        hideLoading();
    } catch (error) {
        hideLoading();
        handleError(error.message);
    }
}

// Fetch Weather by Coordinates
async function getWeatherByCoords(lat, lon) {
    showLoading();
    hideError();
    
    try {
        const currentWeather = await fetchCurrentWeatherByCoords(lat, lon);
        const forecast = await fetchForecastByCoords(lat, lon);
        
        updateUI(currentWeather, forecast);
        hideLoading();
    } catch (error) {
        hideLoading();
        handleError(error.message);
    }
}

// Fetch Current Weather Data by City Name
async function fetchCurrentWeather(city) {
    try {
        const url = `${API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            }
            if (response.status === 401) {
                throw new Error('API key issue. Please check your API key.');
            }
            throw new Error(`Failed to fetch weather data: ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Fetch Current Weather Data by Coordinates
async function fetchCurrentWeatherByCoords(lat, lon) {
    try {
        const url = `${API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(`Failed to fetch weather data: ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Fetch 5-Day Forecast by City Name
async function fetchForecast(city) {
    try {
        const url = `${API_BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        console.log('Fetching forecast from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Forecast API Error:', errorData);
            throw new Error(`Failed to fetch forecast data: ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Forecast data received:', data);
        return data;
    } catch (error) {
        console.error('Forecast fetch error:', error);
        throw error;
    }
}

// Fetch 5-Day Forecast by Coordinates
async function fetchForecastByCoords(lat, lon) {
    try {
        const url = `${API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        console.log('Fetching forecast from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Forecast API Error:', errorData);
            throw new Error(`Failed to fetch forecast data: ${errorData.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Forecast data received:', data);
        return data;
    } catch (error) {
        console.error('Forecast fetch error:', error);
        throw error;
    }
}

// Update UI with Weather Data
function updateUI(current, forecast) {
    // Update current weather
    updateCurrentWeather(current);
    
    // Update forecast
    updateForecast(forecast);
    
    // Update background based on weather
    updateBackground(current.weather[0].main.toLowerCase());
    
    // Show weather content
    weatherContent.classList.remove('hidden');
}

// Update Current Weather Display
function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    
    const date = new Date();
    weatherDate.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    weatherIcon.textContent = getWeatherIcon(data.weather[0].id, data.weather[0].icon);
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
}

// Update 5-Day Forecast Display
function updateForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Get daily forecasts (one per day at noon)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    ).slice(0, 5);
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather[0].id, day.weather[0].icon)}</div>
            <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
            <div class="forecast-temp-range">
                ${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°
            </div>
        `;
        
        forecastContainer.appendChild(card);
    });
}

// Get Weather Icon based on OpenWeatherMap condition code
function getWeatherIcon(code, icon) {
    // Check if it's night time
    const isNight = icon && icon.includes('n');
    
    // Thunderstorm
    if (code >= 200 && code < 300) return '⛈️';
    // Drizzle
    if (code >= 300 && code < 400) return '🌦️';
    // Rain
    if (code >= 500 && code < 600) return '🌧️';
    // Snow
    if (code >= 600 && code < 700) return '❄️';
    // Atmosphere (fog, mist, etc.)
    if (code >= 700 && code < 800) return '🌫️';
    // Clear
    if (code === 800) return isNight ? '🌙' : '☀️';
    // Clouds
    if (code > 800) return isNight ? '☁️' : '⛅';
    
    return '🌤️';
}

// Update Background Based on Weather Condition
function updateBackground(condition) {
    const body = document.body;
    body.className = ''; // Remove all classes
    
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;
    
    if (isNight) {
        body.classList.add('night');
    } else if (condition.includes('clear')) {
        body.classList.add('clear');
    } else if (condition.includes('sun')) {
        body.classList.add('sunny');
    } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) {
        body.classList.add('rainy');
    } else if (condition.includes('cloud')) {
        body.classList.add('cloudy');
    }
}

// Loading State Management
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Error Handling
function handleError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('active');
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);