import React from 'react';
import { TrendingUp, Target, Users, Calendar } from 'lucide-react';

export default function DonationTiles({ donationDrives, getContrastClass }) {
  const totalRaised = donationDrives.reduce((sum, drive) => sum + drive.currentAmount, 0);

  return (
    <div className="p-4 space-y-4">
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <h2 className={getContrastClass(
          "text-2xl font-light text-slate-900 mb-2",
          "text-2xl font-light text-yellow-400 mb-2"
        )}>
          Donation Progress
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Track our community fundraising efforts
        </p>
      </div>

      <div className={getContrastClass(
        "bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-xl text-white",
        "bg-gray-900 p-6 rounded-3xl shadow-xl border-2 border-yellow-400"
      )}>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={28} className={getContrastClass("text-white", "text-yellow-400")} />
          <h3 className={getContrastClass(
            "text-xl font-semibold text-white",
            "text-xl font-semibold text-yellow-400"
          )}>
            Overall Progress
          </h3>
        </div>
        
        <div className="text-center mb-6">
          <div className={getContrastClass(
            "text-4xl font-light text-white mb-2",
            "text-4xl font-light text-yellow-400 mb-2"
          )}>
            ₱{totalRaised.toLocaleString()}
          </div>
          <div className={getContrastClass(
            "text-white/90",
            "text-yellow-200"
          )}>
            Total Raised
          </div>
        </div>
      </div>

      {totalRaised > 0 && (
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 text-center shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 text-center shadow-xl border-2 border-yellow-400"
        )}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users size={20} className={getContrastClass("text-slate-500", "text-yellow-400")} />
            <span className={getContrastClass("text-sm text-slate-600", "text-sm text-yellow-200")}>
              {donationDrives.reduce((sum, drive) => sum + (drive.receipts?.length || 0), 0)} total contributors
            </span>
          </div>
          <div className={getContrastClass(
            "text-sm text-slate-600",
            "text-sm text-yellow-200"
          )}>
            Thank you to all our generous donors who are supporting 11Mercado SPTA initiatives
          </div>
        </div>
      )}
    </div>
  );
}