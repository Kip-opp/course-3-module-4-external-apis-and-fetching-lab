// AccuWeather-Inspired Comprehensive Weather App
// Features: Current weather, 5-day forecast, hourly forecast, weather alerts, location-based weather

// API Configuration
const WEATHER_API = {
    // National Weather Service for alerts
    alerts: "https://api.weather.gov/alerts/active?area=",
    
    // Open-Meteo for current weather and forecasts (free alternative to commercial APIs)
    current: "https://api.open-meteo.com/v1/forecast",
    forecast: "https://api.open-meteo.com/v1/forecast",
    
    // Geocoding API for location search
    geocoding: "https://geocoding-api.open-meteo.com/v1/search"
};

// State management
let currentLocation = null;

// DOM Elements
const elements = {
    locationInput: document.getElementById('location-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    currentLocation: document.getElementById('current-location'),
    currentTime: document.getElementById('current-time'),
    currentTemp: document.getElementById('current-temp'),
    weatherIcon: document.getElementById('weather-icon'),
    weatherCondition: document.getElementById('weather-condition'),
    feelsLike: document.getElementById('feels-like'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    precipitation: document.getElementById('precipitation'),
    visibility: document.getElementById('visibility'),
    alertsContainer: document.getElementById('alerts-container'),
    alertCount: document.getElementById('alert-count'),
    hourlyGrid: document.getElementById('hourly-grid'),
    dailyList: document.getElementById('daily-list'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    pressure: document.getElementById('pressure'),
    uvIndex: document.getElementById('uv-index'),
    dewPoint: document.getElementById('dew-point'),
    cloudCover: document.getElementById('cloud-cover'),
    errorMessage: document.getElementById('error-message'),
    loadingOverlay: document.getElementById('loading-overlay'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    hourlyTab: document.getElementById('hourly-forecast'),
    dailyTab: document.getElementById('daily-forecast')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeTabs();
    
    // Try to get user's location on load
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                currentLocation = { latitude, longitude, name: 'Current Location' };
                loadWeatherData();
            },
            () => {
                // Fallback to default location if geolocation fails
                currentLocation = { latitude: 40.7128, longitude: -74.0060, name: 'New York, NY' };
                loadWeatherData();
            }
        );
    } else {
        // Fallback for browsers that don't support geolocation
        currentLocation = { latitude: 40.7128, longitude: -74.0060, name: 'New York, NY' };
        loadWeatherData();
    }
});

// Event Listeners
function initializeEventListeners() {
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.locationBtn.addEventListener('click', handleLocationRequest);
    elements.refreshBtn.addEventListener('click', () => loadWeatherData(true));
    elements.locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Error message click to dismiss
    elements.errorMessage.addEventListener('click', () => {
        elements.errorMessage.classList.add('hidden');
    });
}

function initializeTabs() {
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active tab
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide content
            const tabType = btn.dataset.tab;
            elements.hourlyTab.classList.toggle('active', tabType === 'hourly');
            elements.dailyTab.classList.toggle('active', tabType === 'daily');
        });
    });
}

// Main Data Loading Function
async function loadWeatherData() {
    if (!currentLocation) return;
    
    try {
        showLoading(true);
        clearError();
        
        // Load all data in parallel for better performance
        const [currentWeather, forecast, alerts] = await Promise.all([
            fetchCurrentWeather(currentLocation.latitude, currentLocation.longitude),
            fetchForecast(currentLocation.latitude, currentLocation.longitude),
            fetchWeatherAlerts(currentLocation.latitude, currentLocation.longitude)
        ]);
        
        // Update UI with all data
        updateCurrentWeather(currentWeather);
        updateForecast(forecast);
        updateAlerts(alerts);
        
        // Update location display
        elements.currentLocation.textContent = currentLocation.name;
        updateTime();
        
    } catch {
        console.error('Error loading weather data');
        showError('Failed to load weather data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// API Fetching Functions
async function fetchCurrentWeather(latitude, longitude) {
    const url = `${WEATHER_API.current}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch current weather');
    }
    
    return response.json();
}

async function fetchForecast(latitude, longitude) {
    const url = `${WEATHER_API.forecast}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset,daylight_duration,sunshine_duration&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch forecast');
    }
    
    return response.json();
}

async function fetchWeatherAlerts(latitude, longitude) {
    // For NWS alerts, we need to get the state/zone first
    // This is a simplified approach - in a real app, you'd want more precise location matching
    const url = `${WEATHER_API.alerts}active?point=${latitude},${longitude}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { features: [] }; // Return empty if no alerts
        }
        return response.json();
    } catch (error) {
        console.warn('Alerts API failed, returning empty alerts');
        return { features: [] };
    }
}

// Geocoding for location search
async function geocodeLocation(query) {
    const url = `${WEATHER_API.geocoding}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Location not found');
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
        throw new Error('Location not found');
    }
    
    const result = data.results[0];
    return {
        latitude: result.latitude,
        longitude: result.longitude,
        name: `${result.name}, ${result.admin1 || result.country}`
    };
}

// UI Update Functions
function updateCurrentWeather(data) {
    const current = data.current;
    
    // Temperature
    elements.currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
    
    // Condition and Icon
    const condition = getWeatherCondition(current.weather_code, current.is_day);
    elements.weatherCondition.textContent = condition.text;
    elements.weatherIcon.innerHTML = `<div style="font-size: 48px">${condition.icon}</div>`;
    
    // Statistics
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} mph`;
    elements.precipitation.textContent = `${current.precipitation > 0 ? Math.round(current.precipitation) : 0}%`;
    elements.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
    elements.cloudCover.textContent = `${current.cloud_cover}%`;
    
    // Additional details (if available)
    if (current.wind_gusts_10m) {
        elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)}/${Math.round(current.wind_gusts_10m)} mph`;
    }
    
    // Visibility approximation (simplified)
    const visibility = current.cloud_cover > 80 ? '1-2' : current.cloud_cover > 50 ? '3-5' : '6+';
    elements.visibility.textContent = `${visibility} mi`;
}

function updateForecast(data) {
    // Update hourly forecast
    updateHourlyForecast(data.hourly);
    
    // Update daily forecast
    updateDailyForecast(data.daily);
    
    // Update additional details
    if (data.daily && data.daily.sunrise && data.daily.sunset) {
        const todayIndex = 0; // Today's data
        elements.sunrise.textContent = formatTime(data.daily.sunrise[todayIndex]);
        elements.sunset.textContent = formatTime(data.daily.sunset[todayIndex]);
    }
}

function updateHourlyForecast(hourlyData) {
    elements.hourlyGrid.innerHTML = '';
    
    // Show next 24 hours
    const hoursToShow = 24;
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < hoursToShow; i++) {
        const hourIndex = (currentHour + i) % 24;
        const time = new Date();
        time.setHours(hourIndex);
        
        const temp = Math.round(hourlyData.temperature_2m[i]);
        const precip = hourlyData.precipitation_probability[i];
        const condition = getWeatherCondition(hourlyData.weather_code[i], hourlyData.is_day[i]);
        
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-item';
        hourElement.innerHTML = `
            <div class="hourly-time">${formatHour(time)}</div>
            <div class="hourly-icon">${condition.icon}</div>
            <div class="hourly-temp">${temp}°</div>
            <div class="hourly-precip">${precip}% precip</div>
        `;
        
        elements.hourlyGrid.appendChild(hourElement);
    }
}

function updateDailyForecast(dailyData) {
    elements.dailyList.innerHTML = '';
    
    // Show next 5 days
    const daysToShow = Math.min(5, dailyData.time.length);
    
    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(dailyData.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);
        const precip = dailyData.precipitation_probability_max[i];
        const condition = getWeatherCondition(dailyData.weather_code[i], true);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'daily-item';
        dayElement.innerHTML = `
            <div>
                <div class="daily-day">${dayName}</div>
                <div class="daily-condition">${condition.text}</div>
            </div>
            <div class="daily-temp">${maxTemp}°</div>
            <div class="daily-temp">${minTemp}°</div>
            <div class="daily-precip">${precip}% precip</div>
        `;
        
        elements.dailyList.appendChild(dayElement);
    }
}

function updateAlerts(data) {
    elements.alertsContainer.innerHTML = '';
    
    if (!data.features || data.features.length === 0) {
        const noAlerts = document.createElement('div');
        noAlerts.className = 'no-alerts';
        noAlerts.innerHTML = '<p>No active weather alerts for your area.</p>';
        elements.alertsContainer.appendChild(noAlerts);
        elements.alertCount.textContent = '0 active';
        return;
    }
    
    elements.alertCount.textContent = `${data.features.length} active`;
    
    data.features.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = `alert-card ${getAlertSeverity(alert.properties.severity)}`;
        
        const title = alert.properties.event || 'Weather Alert';
        const description = alert.properties.description || alert.properties.headline || 'No description available';
        const time = new Date(alert.properties.effective).toLocaleString();
        
        alertElement.innerHTML = `
            <div>
                <div class="alert-title">${title}</div>
                <div class="alert-description">${description}</div>
            </div>
            <div class="alert-time">${time}</div>
        `;
        
        elements.alertsContainer.appendChild(alertElement);
    });
}

// Helper Functions
function getWeatherCondition(weatherCode, isDay) {
    // Open-Meteo weather codes mapping
    const codes = {
        0: { text: 'Clear sky', icon: isDay ? '☀️' : '🌙' },
        1: { text: 'Mainly clear', icon: isDay ? '🌤️' : '🌙' },
        2: { text: 'Partly cloudy', icon: '⛅' },
        3: { text: 'Overcast', icon: '☁️' },
        45: { text: 'Fog', icon: '🌫️' },
        48: { text: 'Depositing rime fog', icon: '🌫️' },
        51: { text: 'Light drizzle', icon: '🌦️' },
        53: { text: 'Moderate drizzle', icon: '🌦️' },
        55: { text: 'Dense drizzle', icon: '🌧️' },
        61: { text: 'Slight rain', icon: '🌦️' },
        63: { text: 'Moderate rain', icon: '🌧️' },
        65: { text: 'Heavy rain', icon: '🌧️' },
        71: { text: 'Slight snow fall', icon: '❄️' },
        73: { text: 'Moderate snow fall', icon: '❄️' },
        75: { text: 'Heavy snow fall', icon: '❄️' },
        80: { text: 'Rain showers', icon: '🌦️' },
        81: { text: 'Heavy rain showers', icon: '🌧️' },
        95: { text: 'Thunderstorm', icon: '⛈️' },
        96: { text: 'Thunderstorm with slight hail', icon: '⛈️' },
        99: { text: 'Thunderstorm with heavy hail', icon: '⛈️' }
    };
    
    return codes[weatherCode] || codes[0];
}

function getAlertSeverity(severity) {
    switch (severity?.toLowerCase()) {
        case 'extreme': return 'danger';
        case 'severe': return 'warning';
        case 'moderate': return 'info';
        case 'minor': return 'info';
        default: return 'info';
    }
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatHour(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
}

function updateTime() {
    const now = new Date();
    elements.currentTime.textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Event Handlers
async function handleSearch() {
    const query = elements.locationInput.value.trim();
    if (!query) return;
    
    try {
        showLoading(true);
        clearError();
        
        const location = await geocodeLocation(query);
        currentLocation = location;
        elements.locationInput.value = '';
        
        await loadWeatherData();
        
    } catch {
        showError('Location not found. Please try a different search.');
    } finally {
        showLoading(false);
    }
}

function handleLocationRequest() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Try to get a name for the location
                geocodeLocation(`${latitude},${longitude}`)
                    .then(location => {
                        currentLocation = location;
                        loadWeatherData();
                    })
                    .catch(() => {
                        // Fallback if geocoding fails
                        currentLocation = { latitude, longitude, name: 'Current Location' };
                        loadWeatherData();
                    });
            },
            () => {
                showError('Unable to get your location. Please enable location services.');
                showLoading(false);
            }
        );
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

// UI Utility Functions
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
}

function clearError() {
    elements.errorMessage.classList.add('hidden');
}