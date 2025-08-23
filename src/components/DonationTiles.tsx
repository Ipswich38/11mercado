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

      <div className="space-y-4">
        {donationDrives.length === 0 ? (
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 text-center",
            "bg-gray-900 rounded-3xl p-8 shadow-xl border-2 border-yellow-400 text-center"
          )}>
            <div className="text-6xl mb-4">🎯</div>
            <h3 className={getContrastClass(
              "text-lg font-semibold text-slate-900 mb-2",
              "text-lg font-semibold text-yellow-400 mb-2"
            )}>
              No Active Campaigns
            </h3>
            <p className={getContrastClass(
              "text-slate-600",
              "text-yellow-200"
            )}>
              The donation period has not started yet. Check back later for upcoming fundraising campaigns.
            </p>
          </div>
        ) : (
          donationDrives.map((drive) => {
            
            return (
              <div
                key={drive.id}
                className={getContrastClass(
                  "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
                  "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className={getContrastClass("text-blue-600", "text-yellow-400")} size={24} />
                  <h3 className={getContrastClass(
                    "text-lg font-semibold text-slate-900",
                    "text-lg font-semibold text-yellow-400"
                  )}>
                    {drive.title}
                  </h3>
                </div>
                
                <div className="mb-4">
                  <div className={getContrastClass(
                    "text-3xl font-bold text-green-600 text-center",
                    "text-3xl font-bold text-yellow-400 text-center"
                  )}>
                    ₱{drive.currentAmount.toLocaleString()}
                  </div>
                  <div className={getContrastClass(
                    "text-sm text-slate-600 text-center mt-2",
                    "text-sm text-yellow-200 text-center mt-2"
                  )}>
                    Total Raised
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className={getContrastClass("text-slate-500", "text-yellow-400")} />
                    <span className={getContrastClass(
                      "text-sm text-slate-600",
                      "text-sm text-yellow-200"
                    )}>
                      {drive.receipts.length} contributors
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={getContrastClass("text-slate-500", "text-yellow-400")} />
                    <span className={getContrastClass(
                      "text-sm text-slate-600",
                      "text-sm text-yellow-200"
                    )}>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}