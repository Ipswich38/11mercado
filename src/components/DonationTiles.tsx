import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, RefreshCw } from 'lucide-react';
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
    <div className="p-4 space-y-6">
      <div className={getContrastClass(
        "card-elevated p-6",
        "glass-dark rounded-material-xl p-6 border border-surface-700"
      )}>
        <h2 className={getContrastClass(
          "text-headline-medium text-surface-900 mb-3",
          "text-headline-medium text-surface-100 mb-3"
        )}>
          Donation Progress
        </h2>
        <p className={getContrastClass(
          "text-body-large text-surface-600",
          "text-body-large text-surface-400"
        )}>
          Track our community fundraising efforts
        </p>
      </div>

      <div className={getContrastClass(
        "card-elevated bg-gradient-to-br from-success-500 to-success-600 p-6 text-white",
        "glass-dark bg-gradient-to-br from-success-600 to-success-700 p-6 border border-surface-700"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={28} className={getContrastClass("text-white", "text-surface-100")} />
            <h3 className={getContrastClass(
              "text-title-large text-white",
              "text-title-large text-surface-100"
            )}>
              Overall Progress
            </h3>
          </div>
          <button
            onClick={loadCentralizedData}
            disabled={isLoading}
            className={getContrastClass(
              "btn-text state-layer p-3 rounded-material text-white hover:bg-white/10",
              "btn-text state-layer p-3 rounded-material text-surface-100 hover:bg-surface-700/20"
            )}
            title="Refresh donation data"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className={getContrastClass(
            "text-display-small text-white mb-2",
            "text-display-small text-surface-100 mb-2"
          )}>
            ₱{totalRaised.toLocaleString()}
          </div>
          <div className={getContrastClass(
            "text-title-medium text-white/90",
            "text-title-medium text-surface-200"
          )}>
            Total Raised
          </div>
        </div>
      </div>

      {totalRaised > 0 && (
        <div className={getContrastClass(
          "card-elevated p-6 text-center",
          "glass-dark rounded-material-xl p-6 text-center border border-surface-700"
        )}>
          <div className={getContrastClass(
            "text-body-large text-surface-600",
            "text-body-large text-surface-300"
          )}>
            Thank you to all our generous donors who are supporting 11Mercado SPTA initiatives
          </div>
        </div>
      )}
    </div>
  );
}