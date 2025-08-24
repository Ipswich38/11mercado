import React from 'react';
import { Wrench, Clock, AlertCircle } from 'lucide-react';

interface MaintenanceModeProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
}

export default function MaintenanceMode({ getContrastClass }: MaintenanceModeProps) {
  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4",
      "fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4"
    )}>
      <div className={getContrastClass(
        "bg-white rounded-3xl p-8 shadow-2xl border max-w-md w-full text-center",
        "bg-gray-900 rounded-3xl p-8 shadow-2xl border-2 border-yellow-400 max-w-md w-full text-center"
      )}>
        <div className={getContrastClass("text-blue-600 mb-4", "text-yellow-400 mb-4")}>
          <Wrench size={64} className="mx-auto mb-2" />
        </div>
        
        <h1 className={getContrastClass(
          "text-2xl font-bold text-gray-900 mb-4",
          "text-2xl font-bold text-yellow-400 mb-4"
        )}>
          Donation System Maintenance
        </h1>
        
        <div className={getContrastClass(
          "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6",
          "bg-yellow-900/20 border border-yellow-400 rounded-lg p-4 mb-6"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-yellow-600" />
            <span className={getContrastClass("font-medium text-yellow-800", "font-medium text-yellow-200")}>
              Under Development
            </span>
          </div>
          <p className={getContrastClass("text-yellow-700 text-sm", "text-yellow-300 text-sm")}>
            We're rebuilding the donation form to ensure better mobile compatibility and data synchronization across all devices.
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Clock size={16} className={getContrastClass("text-gray-500", "text-yellow-500")} />
            <span className={getContrastClass("text-gray-700 text-sm", "text-yellow-200 text-sm")}>
              Estimated completion: 15-30 minutes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className={getContrastClass("w-4 h-4 bg-green-500 rounded-full", "w-4 h-4 bg-green-400 rounded-full")}></div>
            <span className={getContrastClass("text-gray-700 text-sm", "text-yellow-200 text-sm")}>
              Other app features remain available
            </span>
          </div>
        </div>
        
        <p className={getContrastClass("text-gray-600 text-xs", "text-yellow-300 text-xs")}>
          Thank you for your patience while we improve your experience!
        </p>
      </div>
    </div>
  );
}