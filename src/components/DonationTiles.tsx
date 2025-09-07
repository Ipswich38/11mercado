import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Calendar, RefreshCw, Shield, CheckCircle, Info } from 'lucide-react';
import { getAllDonationsFromCentralDB } from '../utils/centralizedDatabase';
import { loadAccurateDonationData, calculateAccurateTotals } from '../utils/csvDataLoader';

export default function DonationTiles({ donationDrives, getContrastClass }) {
  const [centralizedTotal, setCentralizedTotal] = useState(0);
  const [generalSPTA, setGeneralSPTA] = useState(0);
  const [mercadoPTA, setMercadoPTA] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadCentralizedData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 DonationTiles: Loading accurate CSV data as source of truth...');
      
      // Use the accurate CSV data as primary source
      const csvDonations = await loadAccurateDonationData();
      
      if (csvDonations && csvDonations.length > 0) {
        console.log('✅ DonationTiles: Using accurate CSV data');
        const { totalAmount, totalGeneralSPTA, totalMercadoPTA } = calculateAccurateTotals(csvDonations);
        
        setCentralizedTotal(totalAmount);
        setGeneralSPTA(totalGeneralSPTA);
        setMercadoPTA(totalMercadoPTA);
        
        console.log(`💰 DonationTiles loaded accurate data: ₱${totalAmount} total`);
        console.log(`📊 Accurate Breakdown: General SPTA ₱${totalGeneralSPTA}, 11Mercado PTA ₱${totalMercadoPTA}`);
        return;
      }
      
      // Fallback to Supabase data if CSV is not available
      console.log('⚠️ DonationTiles: CSV data not available, falling back to Supabase...');
      const donations = await getAllDonationsFromCentralDB();
      
      console.log('📊 DonationTiles: Received Supabase donations data:', {
        donations: donations,
        isArray: Array.isArray(donations),
        length: donations?.length,
        firstDonation: donations?.[0]
      });
      
      if (!donations || !Array.isArray(donations)) {
        console.warn('❌ DonationTiles: No valid donations data received');
        setCentralizedTotal(0);
        setGeneralSPTA(0);
        setMercadoPTA(0);
        return;
      }
      
      const total = donations.reduce((sum, d) => {
        try {
          // Handle both string and number amounts from different sources
          let amount = d?.amount;
          if (typeof amount === 'string') {
            amount = parseFloat(amount);
          } else if (typeof amount === 'number') {
            amount = amount;
          } else {
            amount = 0;
          }
          
          // Ensure we have a valid number
          if (isNaN(amount) || !isFinite(amount)) {
            console.warn(`Invalid amount found in donation:`, d?.reference_number, amount);
            return sum;
          }
          
          return sum + amount;
        } catch (e) {
          console.warn(`Error processing amount for donation:`, d?.reference_number, e);
          return sum;
        }
      }, 0);
      
      const generalTotal = donations.reduce((sum, d) => {
        try {
          const amount = parseFloat(d?.amount) || 0;
          const allocation = (d?.allocation?.generalSPTA || d?.allocation?.general_spta) || 0;
          
          // If amount is negative, make allocation negative too
          if (amount < 0 && allocation > 0) {
            return sum - allocation;
          }
          // If amount is positive or zero, use allocation as-is
          return sum + allocation;
        } catch (e) {
          return sum;
        }
      }, 0);
      
      const mercadoTotal = donations.reduce((sum, d) => {
        try {
          const amount = parseFloat(d?.amount) || 0;
          const allocation = (d?.allocation?.mercadoPTA || d?.allocation?.mercado_pta) || 0;
          
          // If amount is negative, make allocation negative too
          if (amount < 0 && allocation > 0) {
            return sum - allocation;
          }
          // If amount is positive or zero, use allocation as-is
          return sum + allocation;
        } catch (e) {
          return sum;
        }
      }, 0);
      
      setCentralizedTotal(total);
      setGeneralSPTA(generalTotal);
      setMercadoPTA(mercadoTotal);
      
      console.log(`💰 DonationTiles loaded ₱${total} from ${donations.length} donations (Supabase fallback)`);
      console.log(`📊 Breakdown: General SPTA ₱${generalTotal}, 11Mercado PTA ₱${mercadoTotal}`);
    } catch (error) {
      console.error('Error loading donation data in DonationTiles:', error);
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
            "text-title-medium text-white/90 mb-4",
            "text-title-medium text-surface-200 mb-4"
          )}>
            Total Raised
          </div>
          
          {/* Allocation Breakdown */}
          <div className="space-y-4 mt-6">
            <div className={getContrastClass(
              "bg-white/10 rounded-material-lg p-4",
              "bg-surface-700/30 rounded-material-lg p-4"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={getContrastClass(
                    "text-body-medium text-white/80",
                    "text-body-medium text-surface-300"
                  )}>
                    CSANSCI VSC / SPTA Membership
                  </span>
                  <div className="relative group">
                    <Info size={16} className={getContrastClass("text-white/60 hover:text-white cursor-help", "text-surface-400 hover:text-surface-100 cursor-help")} />
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white text-xs rounded-lg p-3 w-72 z-10 shadow-lg">
                      <div className="text-xs">
                        <div className="font-semibold mb-2 text-yellow-300">DepEd-Authorized Voluntary School Contributions</div>
                        <div className="mb-2 text-yellow-200">P395 Reference Breakdown:</div>
                        <div>• Philippine Red Cross: ₱50</div>
                        <div>• PTA Membership Dues: ₱150</div>
                        <div>• BSP/GSP: ₱50</div>
                        <div>• School Publication: ₱90</div>
                        <div>• Anti-TB Fund Drive: ₱5</div>
                        <div>• Learners Organizations: ₱50</div>
                        <div className="mt-2 pt-2 border-t border-gray-500 text-gray-300 text-xs leading-relaxed">
                          <strong>Note:</strong> All contributions are completely voluntary and may be allocated according to parent preference.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={getContrastClass(
                  "text-title-large text-white",
                  "text-title-large text-surface-100"
                )}>
                  ₱{generalSPTA.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className={getContrastClass(
              "bg-white/10 rounded-material-lg p-4",
              "bg-surface-700/30 rounded-material-lg p-4"
            )}>
              <div className="flex items-center justify-between">
                <span className={getContrastClass(
                  "text-body-medium text-white/80",
                  "text-body-medium text-surface-300"
                )}>
                  11-MERCADO HRPTA FUNDS
                </span>
                <div className={getContrastClass(
                  "text-title-large text-white",
                  "text-title-large text-surface-100"
                )}>
                  ₱{mercadoPTA.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className={getContrastClass(
              "bg-white/15 rounded-material-lg p-4 border border-white/20",
              "bg-surface-600/40 rounded-material-lg p-4 border border-surface-500/30"
            )}>
              <div className="flex items-center justify-between">
                <span className={getContrastClass(
                  "text-body-large font-semibold text-white",
                  "text-body-large font-semibold text-surface-100"
                )}>
                  TOTAL DONATIONS
                </span>
                <div className={getContrastClass(
                  "text-display-small text-white font-bold",
                  "text-display-small text-surface-100 font-bold"
                )}>
                  ₱{totalRaised.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {totalRaised > 0 && (
        <div className={getContrastClass(
          "card-elevated p-6",
          "glass-dark rounded-material-xl p-6 border border-surface-700"
        )}>
          <div className={getContrastClass(
            "text-body-large text-surface-600 text-center mb-4",
            "text-body-large text-surface-300 text-center mb-4"
          )}>
            Thank you to all our generous donors who are supporting 11Mercado SPTA initiatives
          </div>
          
          {/* Data Integrity Footer */}
          <div className={getContrastClass(
            "flex items-center justify-center gap-3 pt-4 border-t border-surface-200/20 text-surface-500",
            "flex items-center justify-center gap-3 pt-4 border-t border-surface-600/30 text-surface-400"
          )}>
            <div className="flex items-center gap-2">
              <Shield size={14} className={getContrastClass("text-success-600", "text-success-400")} />
              <span className="text-body-small">Duplicate Detection Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className={getContrastClass("text-success-600", "text-success-400")} />
              <span className="text-body-small">Data Verified Sep 2025</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}