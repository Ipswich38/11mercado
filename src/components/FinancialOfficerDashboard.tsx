import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Download, 
  RefreshCw,
  LogOut,
  FileSpreadsheet,
  Database,
  TrendingUp,
  PieChart,
  Users,
  Calendar,
  Receipt,
  Eye,
  X
} from 'lucide-react';
import { getAllDonationsFromCentralDB, getDonationStatsFromCentralDB } from '../utils/centralizedDatabase';

export default function FinancialOfficerDashboard({ getContrastClass, onLogout, userInfo }) {
  const [donations, setDonations] = useState([]);
  const [donationStats, setDonationStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      console.log('💰 Loading Finance Dashboard data...');
      
      const donationsData = await getAllDonationsFromCentralDB();
      const statsData = await getDonationStatsFromCentralDB();
      
      // Ensure donations is always an array
      const safeDonations = Array.isArray(donationsData) ? donationsData : [];
      const safeStats = statsData || {
        totalDonations: 0,
        totalAmount: 0,
        totalGeneralSPTA: 0,
        totalMercadoPTA: 0
      };
      
      setDonations(safeDonations);
      setDonationStats(safeStats);
      setIsLoading(false);
      
      console.log(`✅ Finance Dashboard loaded ${safeDonations.length} donations`);
      console.log(`💰 Total amount: ₱${safeStats.totalAmount}`);
      
    } catch (error) {
      console.error('Error loading Finance Dashboard data:', error);
      setIsLoading(false);
      // Set safe defaults
      setDonations([]);
      setDonationStats({
        totalDonations: 0,
        totalAmount: 0,
        totalGeneralSPTA: 0,
        totalMercadoPTA: 0
      });
    }
  };

  const exportToCSV = () => {
    try {
      if (!donations || donations.length === 0) {
        alert('No donation data to export');
        return;
      }

      const headers = [
        'Reference Number',
        'Date',
        'Parent Name', 
        'Student Name',
        'Donation Mode',
        'Amount',
        'General SPTA',
        'Mercado PTA',
        'E-Signature',
        'Created At'
      ];

      const csvData = donations.map(donation => [
        donation.reference_number || '',
        donation.submission_date || '',
        donation.parent_name || '',
        donation.student_name || '',
        donation.donation_mode || '',
        donation.amount || 0,
        donation.allocation?.generalSPTA || donation.allocation?.general_spta || 0,
        donation.allocation?.mercadoPTA || donation.allocation?.mercado_pta || 0,
        donation.e_signature || '',
        donation.created_at || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV export completed');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const exportToExcel = () => {
    try {
      if (!donations || donations.length === 0) {
        alert('No donation data to export');
        return;
      }

      // Create Excel-compatible format (tab-separated values)
      const headers = [
        'Reference Number',
        'Date', 
        'Parent Name',
        'Student Name', 
        'Donation Mode',
        'Amount',
        'General SPTA',
        'Mercado PTA',
        'E-Signature',
        'Created At'
      ];

      const excelData = donations.map(donation => [
        donation.reference_number || '',
        donation.submission_date || '',
        donation.parent_name || '',
        donation.student_name || '',
        donation.donation_mode || '',
        donation.amount || 0,
        donation.allocation?.generalSPTA || donation.allocation?.general_spta || 0,  
        donation.allocation?.mercadoPTA || donation.allocation?.mercado_pta || 0,
        donation.e_signature || '',
        donation.created_at || ''
      ]);

      const excelContent = [headers, ...excelData]
        .map(row => row.join('\t'))
        .join('\n');

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `donations_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click(); 
      document.body.removeChild(link);
      
      console.log('✅ Excel export completed');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Finance Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your donation data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContrastClass(
      "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30",
      "min-h-screen bg-black"
    )}>
      {/* Header */}
      <header className={getContrastClass(
        "bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-xl sticky top-0 z-40",
        "bg-black/80 backdrop-blur-xl border-b-2 border-yellow-400/50 sticky top-0 z-40"
      )}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h1 className={getContrastClass(
                  "text-xl font-bold text-slate-900",
                  "text-xl font-bold text-yellow-400"
                )}>
                  Finance Dashboard
                </h1>
                <p className={getContrastClass(
                  "text-sm text-slate-600",
                  "text-sm text-yellow-200"
                )}>
                  Welcome, {userInfo?.firstName || 'Finance Officer'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className={getContrastClass(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-400 hover:bg-blue-900/20 hover:text-blue-400 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                )}
                title="Refresh Data"
              >
                <RefreshCw size={16} />
                <span className="text-xs font-medium">Refresh</span>
              </button>
              
              <button
                onClick={onLogout}
                className={getContrastClass(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                )}
              >
                <LogOut size={16} />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  Total Amount
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{donationStats?.totalAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className={getContrastClass("text-green-500", "text-yellow-400")} size={32} />
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  Total Donations
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  {donationStats?.totalDonations || 0}
                </p>
              </div>
              <Users className={getContrastClass("text-blue-500", "text-yellow-400")} size={32} />
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  General SPTA
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{donationStats?.totalGeneralSPTA?.toLocaleString() || '0'}
                </p>
              </div>
              <PieChart className={getContrastClass("text-purple-500", "text-yellow-400")} size={32} />
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  11Mercado PTA
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{donationStats?.totalMercadoPTA?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingUp className={getContrastClass("text-orange-500", "text-yellow-400")} size={32} />
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <h2 className={getContrastClass(
            "text-xl font-semibold text-slate-900 mb-4",
            "text-xl font-semibold text-yellow-400 mb-4"
          )}>
            Export Data
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportToCSV}
              className={getContrastClass(
                "flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors",
                "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              )}
            >
              <Download size={16} />
              Export CSV
            </button>
            
            <button
              onClick={exportToExcel}
              className={getContrastClass(
                "flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors",
                "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              )}
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Donations List */}
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <h2 className={getContrastClass(
            "text-xl font-semibold text-slate-900 mb-4",
            "text-xl font-semibold text-yellow-400 mb-4"
          )}>
            Recent Donations ({donations.length})
          </h2>
          
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <Database className={getContrastClass("text-gray-400", "text-gray-600")} size={48} />
              <p className={getContrastClass("text-gray-600 mt-2", "text-gray-400 mt-2")}>
                No donations found
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {donations.map((donation, index) => (
                <div
                  key={donation.id || index}
                  className={getContrastClass(
                    "bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:bg-white/60 transition-all cursor-pointer",
                    "bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 hover:bg-gray-800/80 transition-all cursor-pointer"
                  )}
                  onClick={() => setSelectedDonation(donation)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt size={16} className={getContrastClass("text-blue-500", "text-yellow-400")} />
                        <span className={getContrastClass(
                          "text-sm font-medium text-slate-700",
                          "text-sm font-medium text-yellow-300"
                        )}>
                          {donation.reference_number}
                        </span>
                        <span className={getContrastClass(
                          "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full",
                          "text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/50"
                        )}>
                          {donation.donation_mode}
                        </span>
                      </div>
                      
                      <h3 className={getContrastClass(
                        "font-semibold text-slate-900",
                        "font-semibold text-yellow-400"
                      )}>
                        {donation.parent_name}
                      </h3>
                      <p className={getContrastClass(
                        "text-sm text-slate-600",
                        "text-sm text-yellow-200"
                      )}>
                        Student: {donation.student_name}
                      </p>
                      <p className={getContrastClass(
                        "text-xs text-slate-500",
                        "text-xs text-yellow-300"
                      )}>
                        {donation.submission_date}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={getContrastClass(
                        "text-xl font-bold text-slate-900",
                        "text-xl font-bold text-yellow-400"
                      )}>
                        ₱{donation.amount?.toLocaleString() || '0'}
                      </div>
                      <button className={getContrastClass(
                        "text-xs text-blue-600 hover:text-blue-800",
                        "text-xs text-yellow-400 hover:text-yellow-300"
                      )}>
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={getContrastClass(
            "bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl",
            "bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={getContrastClass(
                "text-lg font-semibold text-slate-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Donation Details
              </h3>
              <button
                onClick={() => setSelectedDonation(null)}
                className={getContrastClass(
                  "text-gray-500 hover:text-gray-700",
                  "text-gray-400 hover:text-gray-200"
                )}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Reference Number
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  {selectedDonation.reference_number}
                </p>
              </div>
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Amount
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  ₱{selectedDonation.amount?.toLocaleString() || '0'}
                </p>
              </div>
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Parent Name
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  {selectedDonation.parent_name}
                </p>
              </div>
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Student Name
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  {selectedDonation.student_name}
                </p>
              </div>
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Donation Mode
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  {selectedDonation.donation_mode}
                </p>
              </div>
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  Date
                </label>
                <p className={getContrastClass("font-medium text-gray-900", "font-medium text-yellow-400")}>
                  {selectedDonation.submission_date}
                </p>
              </div>
              
              {selectedDonation.allocation && (
                <div>
                  <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                    Allocation
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className={getContrastClass(
                      "bg-gray-50 rounded-lg p-2",
                      "bg-gray-800 rounded-lg p-2"
                    )}>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        General SPTA
                      </div>
                      <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                        ₱{(selectedDonation.allocation.generalSPTA || selectedDonation.allocation.general_spta || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className={getContrastClass(
                      "bg-gray-50 rounded-lg p-2",
                      "bg-gray-800 rounded-lg p-2"
                    )}>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                        11Mercado PTA
                      </div>
                      <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                        ₱{(selectedDonation.allocation.mercadoPTA || selectedDonation.allocation.mercado_pta || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                  E-Signature
                </label>
                <p className={getContrastClass("font-medium text-gray-900 italic", "font-medium text-yellow-400 italic")}>
                  {selectedDonation.e_signature}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}