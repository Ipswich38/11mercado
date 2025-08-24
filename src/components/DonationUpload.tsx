import React from 'react';
import { Upload, FileText, TrendingUp } from 'lucide-react';

export default function DonationUpload({ donationDrives, handleReceiptUpload, getContrastClass }) {
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
          Upload Donation Receipts
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Help track our community donations by uploading your receipts
        </p>
      </div>

      <div className="space-y-4">
        {donationDrives.map((drive) => {
          const progress = (drive.currentAmount / drive.targetAmount) * 100;
          
          return (
            <div
              key={drive.id}
              className={getContrastClass(
                "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
                "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className={getContrastClass("text-green-600", "text-yellow-400")} size={24} />
                <h3 className={getContrastClass(
                  "text-lg font-semibold text-slate-900",
                  "text-lg font-semibold text-yellow-400"
                )}>
                  {drive.title}
                </h3>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className={getContrastClass("text-sm text-slate-600", "text-sm text-yellow-200")}>
                    Progress
                  </span>
                  <span className={getContrastClass("text-sm font-medium text-slate-900", "text-sm font-medium text-yellow-400")}>
                    ₱{drive.currentAmount.toLocaleString()} / ₱{drive.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className={getContrastClass("bg-slate-200 rounded-full h-3", "bg-gray-700 rounded-full h-3")}>
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className={getContrastClass("text-xs text-slate-500 mt-1", "text-xs text-yellow-300 mt-1")}>
                  {progress.toFixed(1)}% completed
                </p>
              </div>
              
              <button
                onClick={() => handleReceiptUpload(drive.id)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Upload size={20} />
                Upload Receipt
              </button>
              
              <div className="mt-4">
                <h4 className={getContrastClass(
                  "text-sm font-medium text-slate-900 mb-2",
                  "text-sm font-medium text-yellow-400 mb-2"
                )}>
                  Recent Receipts
                </h4>
                <div className="space-y-2">
                  {(drive.receipts || []).slice(-3).map((receipt) => (
                    <div key={receipt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <FileText size={16} className="text-slate-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          ₱{receipt.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-600">
                          {receipt.description} • {receipt.uploadedBy}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {receipt.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}