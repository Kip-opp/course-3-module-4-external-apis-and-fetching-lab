# AccuWeather-Inspired Comprehensive Weather App

A modern, feature-rich weather application built with vanilla JavaScript, HTML, and CSS that provides comprehensive weather information including current conditions, 5-day forecasts, hourly forecasts, and weather alerts.

## Features

### 🌤️ Current Weather
- Real-time temperature and feels-like temperature
- Weather condition with animated icons
- Comprehensive weather statistics:
  - Humidity percentage
  - Wind speed (with gusts if available)
  - Precipitation probability
  - Atmospheric pressure
  - Cloud cover percentage
  - Visibility estimation

### 📅 5-Day Forecast
- Daily weather predictions for the next 5 days
- High and low temperatures
- Weather conditions
- Precipitation probability
- Clean, card-based layout

### ⏰ Hourly Forecast
- Next 24 hours of weather data
- Hourly temperature and conditions
- Precipitation probability for each hour
- Easy-to-read grid layout

### 🚨 Weather Alerts
- Real-time weather alerts from National Weather Service
- Alert severity indicators (Extreme, Severe, Moderate, Minor)
- Alert descriptions and timing
- Automatic alert count display

### 📍 Location-Based Weather
- Automatic geolocation detection
- Search by city, state, or ZIP code
- Location name display
- Fallback to default location if geolocation fails

### 🎨 Modern Design
- Apple-inspired UI design with clean aesthetics
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Dark mode compatible color scheme

## Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript ES6+** - Async/await, fetch API, modern DOM manipulation
- **Open-Meteo API** - Free weather data and forecasts
- **National Weather Service API** - Weather alerts
- **Open-Meteo Geocoding API** - Location search

## APIs Used

### Weather Data
- **Open-Meteo**: `https://api.open-meteo.com/v1/forecast`
  - Current weather conditions
  - Hourly and daily forecasts
  - Multiple weather parameters

### Weather Alerts
- **National Weather Service**: `https://api.weather.gov/alerts/active`
  - Real-time weather alerts
  - Alert severity and descriptions

### Location Search
- **Open-Meteo Geocoding**: `https://geocoding-api.open-meteo.com/v1/search`
  - City and location search
  - Coordinates retrieval

## Installation & Usage

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-3-module-4-external-apis-and-fetching-lab
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Python 2
   python -m SimpleHTTPServer 8000
   
   # Or using Node.js (if you have http-server installed)
   npx http-server -p 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000` in your web browser.

### Features Overview

1. **Current Weather Display**
   - Shows temperature, conditions, and detailed statistics
   - Updates automatically with location changes

2. **Location Management**
   - Automatic geolocation on first visit
   - Search bar for specific locations
   - Current location button for quick updates

3. **Forecast Tabs**
   - Switch between hourly and 5-day forecasts
   - Interactive tab interface

4. **Weather Alerts**
   - Real-time alert notifications
   - Severity-based color coding
   - Detailed alert information

5. **Additional Weather Details**
   - Sunrise and sunset times
   - Pressure and UV index
   - Dew point and cloud cover

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Performance Features

- **Parallel API Requests**: All weather data is fetched simultaneously for optimal performance
- **Error Handling**: Graceful fallbacks when APIs are unavailable
- **Loading States**: Smooth loading animations and states
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Customization

### Styling
The CSS is organized with CSS custom properties (variables) for easy theming:
- Color palette variables in `:root`
- Typography and spacing variables
- Shadow and animation variables

### API Configuration
API endpoints are centralized in the `WEATHER_API` object for easy modification:
```javascript
const WEATHER_API = {
    current: "https://api.open-meteo.com/v1/forecast",
    forecast: "https://api.open-meteo.com/v1/forecast",
    alerts: "https://api.weather.gov/alerts/active?area=",
    geocoding: "https://geocoding-api.open-meteo.com/v1/search"
};
```

## Future Enhancements

Potential features that could be added:
- Weather maps and radar
- Multiple location favorites
- Weather notifications
- Historical weather data
- Weather widgets
- Dark/light theme toggle
- Unit conversion (Celsius/Fahrenheit)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue in the repository.

---

**Built with ❤️ using modern web technologies**