import React from 'react';
import { MapPin, Thermometer, Droplets, Wind } from 'lucide-react';

export default function WeatherApp({ weather, getContrastClass }) {
  return (
    <div className="p-4 space-y-4">
      <div className={getContrastClass(
        "bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-3xl shadow-xl text-white",
        "bg-gray-900 p-6 rounded-3xl shadow-xl border-2 border-yellow-400 text-yellow-400"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} />
          <span className="text-sm opacity-90">{weather.location}</span>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-5xl font-light mb-2">{weather.temperature}</div>
          <div className="text-xl opacity-90">{weather.condition}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Droplets size={20} className="opacity-80" />
            <div>
              <div className="text-sm opacity-80">Humidity</div>
              <div className="font-semibold">{weather.humidity}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wind size={20} className="opacity-80" />
            <div>
              <div className="text-sm opacity-80">Wind</div>
              <div className="font-semibold">{weather.windSpeed}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <h3 className={getContrastClass(
          "text-lg font-semibold text-slate-900 mb-4",
          "text-lg font-semibold text-yellow-400 mb-4"
        )}>
          3-Day Forecast
        </h3>
        
        <div className="space-y-3">
          {weather.forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{day.icon}</span>
                <div>
                  <div className={getContrastClass("font-medium text-slate-900", "font-medium text-yellow-400")}>
                    {day.day}
                  </div>
                  <div className={getContrastClass("text-sm text-slate-600", "text-sm text-yellow-200")}>
                    {day.condition}
                  </div>
                </div>
              </div>
              <div className={getContrastClass("text-slate-900 font-medium", "text-yellow-400 font-medium")}>
                {day.high} / {day.low}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}