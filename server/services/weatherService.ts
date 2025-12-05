import https from 'https';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  feelsLike: number;
  location: string;
}

class WeatherService {
  private get apiKey(): string {
    return process.env.WEATHER_API_KEY || '';
  }

  private get location(): string {
    return process.env.WEATHER_LOCATION || 'New York';
  }

  private get units(): string {
    return process.env.WEATHER_UNITS || 'imperial';
  }

  private async fetchWeatherData(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error('Failed to parse weather data'));
            }
          } else {
            reject(new Error(`Weather API returned status ${res.statusCode}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  async getCurrentWeather(): Promise<WeatherData> {
    try {
      const url = `https://api.weatherapi.com/v1/current.json?key=${this.apiKey}&q=${encodeURIComponent(this.location)}&aqi=no`;
      const data = await this.fetchWeatherData(url);
      const isFahrenheit = this.units === 'imperial';

      return {
        temperature: isFahrenheit ? data.current.temp_f : data.current.temp_c,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        feelsLike: isFahrenheit ? data.current.feelslike_f : data.current.feelslike_c,
        location: data.location.name + ', ' + data.location.region,
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      throw new Error('Failed to fetch weather data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async getForecast(days: number = 3): Promise<any> {
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(this.location)}&days=${days}&aqi=no`;
      const data = await this.fetchWeatherData(url);

      return data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        maxTemp: this.units === 'imperial' ? day.day.maxtemp_f : day.day.maxtemp_c,
        minTemp: this.units === 'imperial' ? day.day.mintemp_f : day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
      }));
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw new Error('Failed to fetch forecast: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export default new WeatherService();
