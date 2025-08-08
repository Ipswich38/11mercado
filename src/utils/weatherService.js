// Weather service to fetch real-time weather data
const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'demo';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let weatherCache = new Map();
let forecastCache = new Map();

// Default location for CSJ-DMNSHS (approximate coordinates for demonstration)
const DEFAULT_LOCATION = {
  lat: 14.5995, // Manila coordinates as example
  lon: 120.9842,
  name: 'Manila, Philippines',
};

export const fetchWeatherData = async (location = DEFAULT_LOCATION) => {
  try {
    const cacheKey = `weather_${location.lat}_${location.lon}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // For demo purposes, return mock data if no API key
    if (WEATHER_API_KEY === 'demo') {
      const mockData = getMockWeatherData();
      weatherCache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    }

    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`,
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();

    const weatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: getWeatherIcon(data.weather[0].main),
      location: data.name,
      feelsLike: Math.round(data.main.feels_like),
      lastUpdated: new Date().toLocaleTimeString(),
    };
    
    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getMockWeatherData();
  }
};

const getMockWeatherData = () => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];
  const temps = [28, 30, 32, 29, 31];
  const randomCondition =
    conditions[Math.floor(Math.random() * conditions.length)];
  const randomTemp = temps[Math.floor(Math.random() * temps.length)];

  return {
    temperature: randomTemp,
    condition: randomCondition,
    humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
    windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
    icon: getWeatherIcon(randomCondition),
    location: 'Manila, Philippines',
    feelsLike: randomTemp + Math.floor(Math.random() * 4) - 2,
    lastUpdated: new Date().toLocaleTimeString(),
  };
};

const getWeatherIcon = (condition) => {
  const iconMap = {
    Clear: '☀️',
    Sunny: '☀️',
    Clouds: '☁️',
    'Partly Cloudy': '⛅',
    Cloudy: '☁️',
    Rain: '🌧️',
    'Light Rain': '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
  };

  return iconMap[condition] || '🌤️';
};

export const fetchForecast = async (location = DEFAULT_LOCATION) => {
  try {
    const cacheKey = `forecast_${location.lat}_${location.lon}`;
    const cached = forecastCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    if (WEATHER_API_KEY === 'demo') {
      const mockData = getMockForecast();
      forecastCache.set(cacheKey, { data: mockData, timestamp: Date.now() });
      return mockData;
    }

    const response = await fetch(
      `${WEATHER_BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`,
    );

    if (!response.ok) {
      throw new Error('Forecast data fetch failed');
    }

    const data = await response.json();

    // Get next 5 days forecast
    const dailyForecasts = data.list
      .filter((_, index) => index % 8 === 0)
      .slice(0, 5);

    const forecastData = dailyForecasts.map((forecast) => ({
      date: new Date(forecast.dt * 1000).toLocaleDateString('en-US', {
        weekday: 'short',
      }),
      temperature: Math.round(forecast.main.temp),
      condition: forecast.weather[0].description,
      icon: getWeatherIcon(forecast.weather[0].main),
    }));
    
    forecastCache.set(cacheKey, { data: forecastData, timestamp: Date.now() });
    return forecastData;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return getMockForecast();
  }
};

const getMockForecast = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'];

  return days.map((day) => ({
    date: day,
    temperature: Math.floor(Math.random() * 8) + 26, // 26-34°C
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    icon: getWeatherIcon(
      conditions[Math.floor(Math.random() * conditions.length)],
    ),
  }));
};

// Clear cache function for memory management
export const clearWeatherCache = () => {
  weatherCache.clear();
  forecastCache.clear();
};
