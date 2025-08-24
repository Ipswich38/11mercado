import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Users, Calendar, RefreshCw } from 'lucide-react';
import { getAllDonationsFromCentralDB } from '../utils/centralizedDatabase';

export default function DonationTiles({ donationDrives, getContrastClass }) {
  const [centralizedTotal, setCentralizedTotal] = useState(0);
  const [generalSPTA, setGeneralSPTA] = useState(0);
  const [mercadoPTA, setMercadoPTA] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadCentralizedData = async () => {
    setIsLoading(true);
    try {
      const donations = await getAllDonationsFromCentralDB();
      
      if (!donations || !Array.isArray(donations)) {
        console.warn('No valid donations data received');
        setCentralizedTotal(0);
        setGeneralSPTA(0);
        setMercadoPTA(0);
        return;
      }
      
      const total = donations.reduce((sum, d) => {
        try {
          return sum + (parseFloat(d?.amount) || 0);
        } catch (e) {
          return sum;
        }
      }, 0);
      
      const generalTotal = donations.reduce((sum, d) => {
        try {
          return sum + ((d?.allocation?.generalSPTA || d?.allocation?.general_spta) || 0);
        } catch (e) {
          return sum;
        }
      }, 0);
      
      const mercadoTotal = donations.reduce((sum, d) => {
        try {
          return sum + ((d?.allocation?.mercadoPTA || d?.allocation?.mercado_pta) || 0);
        } catch (e) {
          return sum;
        }
      }, 0);
      
      setCentralizedTotal(total);
      setGeneralSPTA(generalTotal);
      setMercadoPTA(mercadoTotal);
      
      console.log(`💰 DonationTiles loaded ₱${total} from ${donations.length} donations`);
      console.log(`📊 Breakdown: General SPTA ₱${generalTotal}, 11Mercado PTA ₱${mercadoTotal}`);
    } catch (error) {
      console.error('Error loading centralized data in DonationTiles:', error);
      // Set safe defaults on error
      setCentralizedTotal(0);
      setGeneralSPTA(0);
      setMercadoPTA(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCentralizedData();
  }, []);

  // Use centralized total from actual donations - this is the real donated amount
  const totalRaised = centralizedTotal;

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={28} className={getContrastClass("text-white", "text-yellow-400")} />
            <h3 className={getContrastClass(
              "text-xl font-semibold text-white",
              "text-xl font-semibold text-yellow-400"
            )}>
              Overall Progress
            </h3>
          </div>
          <button
            onClick={loadCentralizedData}
            disabled={isLoading}
            className={getContrastClass(
              "p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white",
              "p-2 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400"
            )}
            title="Refresh donation data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
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
              {donationDrives.reduce((sum, drive) => sum + ((drive?.receipts || []).length), 0)} total contributors
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