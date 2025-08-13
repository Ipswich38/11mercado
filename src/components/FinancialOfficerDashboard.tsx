import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  Receipt,
  Camera,
  PieChart,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  LogOut
} from 'lucide-react';

interface DonationEntry {
  referenceNumber: string;
  submissionDate: string;
  submissionTime: string;
  submissionTimestamp: string;
  parentName: string;
  studentName: string;
  donationMode: 'ewallet' | 'bank' | 'cash' | 'inkind';
  amount?: string;
  allocation?: {
    generalSPTA: number;
    mercadoPTA: number;
  };
  date: string;
  time?: string;
  handedTo?: string;
  items?: string;
  hasReceipt: boolean;
  hasPhoto: boolean;
  fileNames: {
    receipt: string | null;
    photo: string | null;
  };
  eSignature: string;
  agreementAcceptanceTimestamp: string;
  ipAddress: string;
  userAgent: string;
}

export default function FinancialOfficerDashboard({ getContrastClass, onLogout, userInfo }) {
  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<DonationEntry | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'mode' | 'reference'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedView, setSelectedView] = useState<'overview' | 'details'>('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    loadDonations();
    const interval = setInterval(loadDonations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortDonations();
  }, [donations, searchTerm, filterMode, sortBy, sortOrder, dateRange]);

  const loadDonations = () => {
    const savedDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
    setDonations(savedDonations);
  };

  const filterAndSortDonations = () => {
    let filtered = [...donations];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(donation => 
        donation.parentName.toLowerCase().includes(search) ||
        donation.studentName.toLowerCase().includes(search) ||
        donation.referenceNumber.toLowerCase().includes(search) ||
        donation.eSignature.toLowerCase().includes(search) ||
        (donation.amount && donation.amount.includes(search))
      );
    }

    // Apply mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(donation => donation.donationMode === filterMode);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(donation => 
        new Date(donation.submissionDate) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(donation => 
        new Date(donation.submissionDate) <= new Date(dateRange.end)
      );
    }

    // Sort donations
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.submissionTimestamp).getTime() - new Date(b.submissionTimestamp).getTime();
          break;
        case 'amount':
          const amountA = parseFloat(a.amount || '0');
          const amountB = parseFloat(b.amount || '0');
          compareValue = amountA - amountB;
          break;
        case 'mode':
          compareValue = a.donationMode.localeCompare(b.donationMode);
          break;
        case 'reference':
          compareValue = a.referenceNumber.localeCompare(b.referenceNumber);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredDonations(filtered);
  };

  const calculateTotals = () => {
    const totals = {
      totalAmount: 0,
      generalSPTA: 0,
      mercadoPTA: 0,
      ewallet: 0,
      bank: 0,
      cash: 0,
      inkind: 0,
      totalEntries: filteredDonations.length,
      withReceipts: 0,
      withPhotos: 0,
      completedToday: 0,
      completedThisMonth: 0
    };

    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    filteredDonations.forEach(donation => {
      const amount = parseFloat(donation.amount || '0');
      totals.totalAmount += amount;
      
      if (donation.allocation) {
        totals.generalSPTA += donation.allocation.generalSPTA;
        totals.mercadoPTA += donation.allocation.mercadoPTA;
      }

      totals[donation.donationMode]++;
      
      if (donation.hasReceipt) totals.withReceipts++;
      if (donation.hasPhoto) totals.withPhotos++;

      const donationDate = new Date(donation.submissionDate);
      if (donationDate.toDateString() === today) totals.completedToday++;
      if (donationDate.getMonth() === thisMonth && donationDate.getFullYear() === thisYear) {
        totals.completedThisMonth++;
      }
    });

    return totals;
  };

  const exportToCSV = () => {
    const headers = [
      'Reference Number',
      'Submission Date',
      'Submission Time', 
      'Parent/Guardian Name',
      'Student Name',
      'Donation Mode',
      'Amount',
      'General SPTA Allocation',
      '11Mercado PTA Allocation',
      'Transaction Date',
      'Transaction Time',
      'Handed To',
      'Items Description',
      'Has Receipt',
      'Has Photo',
      'Receipt Filename',
      'Photo Filename',
      'Electronic Signature',
      'Agreement Timestamp',
      'IP Address'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredDonations.map(donation => [
        donation.referenceNumber,
        donation.submissionDate,
        donation.submissionTime,
        `"${donation.parentName}"`,
        `"${donation.studentName}"`,
        donation.donationMode.toUpperCase(),
        donation.amount || 'N/A',
        donation.allocation?.generalSPTA || 0,
        donation.allocation?.mercadoPTA || 0,
        donation.date,
        donation.time || 'N/A',
        `"${donation.handedTo || 'N/A'}"`,
        `"${donation.items || 'N/A'}"`,
        donation.hasReceipt ? 'Yes' : 'No',
        donation.hasPhoto ? 'Yes' : 'No',
        `"${donation.fileNames.receipt || 'N/A'}"`,
        `"${donation.fileNames.photo || 'N/A'}"`,
        `"${donation.eSignature}"`,
        donation.agreementAcceptanceTimestamp,
        donation.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateFinancialSummaryReport = () => {
    const totals = calculateTotals();
    const reportContent = `
FINANCIAL SUMMARY REPORT
========================

Report Generated: ${new Date().toLocaleString()}
Generated By: ${userInfo?.firstName} (${userInfo?.userType?.toUpperCase()})

SUMMARY STATISTICS:
===================
Total Donations: ₱${totals.totalAmount.toLocaleString()}
Total Entries: ${totals.totalEntries}
Entries Today: ${totals.completedToday}
Entries This Month: ${totals.completedThisMonth}

ALLOCATION BREAKDOWN:
====================
General SPTA: ₱${totals.generalSPTA.toLocaleString()} (${((totals.generalSPTA / totals.totalAmount) * 100).toFixed(1)}%)
11Mercado PTA Projects: ₱${totals.mercadoPTA.toLocaleString()} (${((totals.mercadoPTA / totals.totalAmount) * 100).toFixed(1)}%)

DONATION MODES:
===============
E-wallet: ${totals.ewallet} entries
Bank Transfer: ${totals.bank} entries
Cash: ${totals.cash} entries
In-kind: ${totals.inkind} entries

DOCUMENTATION STATUS:
====================
Entries with Receipts: ${totals.withReceipts}/${totals.totalEntries} (${((totals.withReceipts / totals.totalEntries) * 100).toFixed(1)}%)
Entries with Photos: ${totals.withPhotos}/${totals.totalEntries} (${((totals.withPhotos / totals.totalEntries) * 100).toFixed(1)}%)

COMPLIANCE NOTES:
================
- All entries include electronic signatures
- All monetary donations require transaction receipts
- All cash and in-kind donations require photographic evidence
- Complete audit trail maintained with IP address logging

This report covers ${totals.totalEntries} donation entries.
For detailed records, export the complete CSV file.

Generated by 11Mercado Financial Tracking System
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial_Summary_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totals = calculateTotals();

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
                  "text-lg font-light tracking-tight text-slate-900",
                  "text-lg font-light tracking-tight text-yellow-400"
                )}>
                  Financial Officer Dashboard
                </h1>
                <p className={getContrastClass("text-xs text-slate-600", "text-xs text-yellow-200")}>
                  Welcome, {userInfo?.firstName} ({userInfo?.userType?.charAt(0).toUpperCase() + userInfo?.userType?.slice(1)})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadDonations()}
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
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-400 hover:bg-red-900/20 hover:text-red-400 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                )}
                title="Logout"
              >
                <LogOut size={16} />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl",
            "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-green-400/50 shadow-xl"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className={getContrastClass("text-green-600", "text-green-400")} size={24} />
              <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                Total Donations
              </h3>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-green-400")}>
              ₱{totals.totalAmount.toLocaleString()}
            </div>
            <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
              {totals.totalEntries} entries • Today: {totals.completedToday}
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl",
            "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-400/50 shadow-xl"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <PieChart className={getContrastClass("text-blue-600", "text-blue-400")} size={24} />
              <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                General SPTA
              </h3>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-blue-400")}>
              ₱{totals.generalSPTA.toLocaleString()}
            </div>
            <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
              {totals.totalAmount > 0 ? ((totals.generalSPTA / totals.totalAmount) * 100).toFixed(1) : 0}% of total
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl",
            "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-purple-400/50 shadow-xl"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className={getContrastClass("text-purple-600", "text-purple-400")} size={24} />
              <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                11Mercado PTA
              </h3>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-purple-400")}>
              ₱{totals.mercadoPTA.toLocaleString()}
            </div>
            <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
              {totals.totalAmount > 0 ? ((totals.mercadoPTA / totals.totalAmount) * 100).toFixed(1) : 0}% of total
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl",
            "bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-400/50 shadow-xl"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <FileText className={getContrastClass("text-yellow-600", "text-yellow-400")} size={24} />
              <h3 className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                Documentation
              </h3>
            </div>
            <div className={getContrastClass("text-2xl font-bold text-gray-900", "text-2xl font-bold text-yellow-400")}>
              {totals.withReceipts + totals.withPhotos}
            </div>
            <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
              Receipts: {totals.withReceipts} • Photos: {totals.withPhotos}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={getContrastClass(
          "bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-xl mb-6",
          "bg-gray-900/70 backdrop-blur-md rounded-2xl p-4 border-2 border-yellow-400/50 shadow-xl mb-6"
        )}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className={getContrastClass(
                  "absolute left-3 top-3 text-gray-400",
                  "absolute left-3 top-3 text-yellow-400"
                )} />
                <input
                  type="text"
                  placeholder="Search by name, reference, amount, signature..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 p-3 rounded-xl border ${getContrastClass(
                    'border-gray-300 bg-white text-gray-900',
                    'border-gray-600 bg-gray-800 text-yellow-200'
                  )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className={`p-3 rounded-xl border ${getContrastClass(
                  'border-gray-300 bg-white text-gray-900',
                  'border-gray-600 bg-gray-800 text-yellow-200'
                )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="all">All Modes</option>
                <option value="ewallet">E-wallet</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="inkind">In-kind</option>
              </select>

              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className={`p-3 rounded-xl border ${getContrastClass(
                  'border-gray-300 bg-white text-gray-900',
                  'border-gray-600 bg-gray-800 text-yellow-200'
                )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Start Date"
              />

              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className={`p-3 rounded-xl border ${getContrastClass(
                  'border-gray-300 bg-white text-gray-900',
                  'border-gray-600 bg-gray-800 text-yellow-200'
                )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="End Date"
              />

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort as any);
                  setSortOrder(order as any);
                }}
                className={`p-3 rounded-xl border ${getContrastClass(
                  'border-gray-300 bg-white text-gray-900',
                  'border-gray-600 bg-gray-800 text-yellow-200'
                )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="mode-asc">Mode A-Z</option>
                <option value="reference-asc">Reference A-Z</option>
              </select>

              <button
                onClick={exportToCSV}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Download size={20} />
                Export CSV
              </button>

              <button
                onClick={generateFinancialSummaryReport}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
              >
                <FileText size={20} />
                Summary Report
              </button>
            </div>
          </div>
        </div>

        {/* Donations List */}
        <div className={getContrastClass(
          "bg-white/70 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl",
          "bg-gray-900/70 backdrop-blur-md rounded-2xl border-2 border-yellow-400/50 shadow-xl"
        )}>
          <div className="p-6">
            <h2 className={getContrastClass("text-xl font-semibold text-gray-900 mb-4", "text-xl font-semibold text-yellow-400 mb-4")}>
              Donation Records ({filteredDonations.length})
            </h2>
            
            {filteredDonations.length === 0 ? (
              <div className={getContrastClass(
                "text-center py-12 bg-gray-50 rounded-xl",
                "text-center py-12 bg-gray-800 rounded-xl"
              )}>
                <FileSpreadsheet size={48} className={getContrastClass("mx-auto mb-4 text-gray-400", "mx-auto mb-4 text-yellow-400")} />
                <h3 className={getContrastClass("text-lg font-medium text-gray-900", "text-lg font-medium text-yellow-400")}>
                  No donations found
                </h3>
                <p className={getContrastClass("text-gray-500", "text-yellow-200")}>
                  {searchTerm || filterMode !== 'all' || dateRange.start || dateRange.end 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No donations have been submitted yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation.referenceNumber}
                    className={getContrastClass(
                      "bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow",
                      "bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-yellow-400 transition-colors"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={getContrastClass(
                            "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium",
                            "bg-gray-800 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium border border-yellow-400"
                          )}>
                            {donation.referenceNumber}
                          </span>
                          <span className={getContrastClass(
                            `bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full capitalize`,
                            `bg-gray-700 text-yellow-200 text-xs px-2 py-1 rounded-full capitalize`
                          )}>
                            {donation.donationMode.replace('ewallet', 'E-wallet').replace('inkind', 'In-kind')}
                          </span>
                          {donation.hasReceipt && (
                            <Receipt size={16} className="text-green-500" />
                          )}
                          {donation.hasPhoto && (
                            <Camera size={16} className="text-blue-500" />
                          )}
                        </div>
                        
                        <h3 className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                          {donation.parentName}
                        </h3>
                        <p className={getContrastClass("text-gray-600 text-sm", "text-yellow-200 text-sm")}>
                          Student: {donation.studentName}
                        </p>
                        <p className={getContrastClass("text-gray-500 text-xs", "text-yellow-300 text-xs")}>
                          Signature: <em>{donation.eSignature}</em> • IP: {donation.ipAddress}
                        </p>
                      </div>

                      <div className="text-right">
                        {donation.amount && (
                          <div className={getContrastClass("text-xl font-bold text-gray-900", "text-xl font-bold text-yellow-400")}>
                            ₱{parseFloat(donation.amount).toLocaleString()}
                          </div>
                        )}
                        {!donation.amount && (
                          <div className={getContrastClass("text-lg font-bold text-purple-600", "text-lg font-bold text-purple-400")}>
                            In-kind
                          </div>
                        )}
                        <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                          {donation.submissionDate}
                        </div>
                        <div className={getContrastClass("text-xs text-gray-400", "text-xs text-yellow-400")}>
                          {donation.submissionTime}
                        </div>
                      </div>
                    </div>

                    {donation.allocation && (
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className={getContrastClass(
                          "bg-gray-50 rounded-lg p-3",
                          "bg-gray-800 rounded-lg p-3"
                        )}>
                          <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                            General SPTA
                          </div>
                          <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-blue-400")}>
                            ₱{donation.allocation.generalSPTA.toLocaleString()}
                          </div>
                        </div>
                        <div className={getContrastClass(
                          "bg-gray-50 rounded-lg p-3",
                          "bg-gray-800 rounded-lg p-3"
                        )}>
                          <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                            11Mercado PTA
                          </div>
                          <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-purple-400")}>
                            ₱{donation.allocation.mercadoPTA.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className={getContrastClass("text-gray-500", "text-yellow-300")}>
                        {donation.items && (
                          <span>Items: {donation.items.substring(0, 50)}{donation.items.length > 50 ? '...' : ''}</span>
                        )}
                        {donation.handedTo && (
                          <span>Handed to: {donation.handedTo}</span>
                        )}
                        {donation.fileNames.receipt && (
                          <span className="ml-2">📄 {donation.fileNames.receipt}</span>
                        )}
                        {donation.fileNames.photo && (
                          <span className="ml-2">📷 {donation.fileNames.photo}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className={getContrastClass(
                          "text-blue-600 hover:text-blue-800 flex items-center gap-1",
                          "text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                        )}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed View Modal */}
        {selectedDonation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
            <div className={getContrastClass(
              "bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto",
              "bg-gray-900 border border-yellow-400 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            )}>
              <div className={getContrastClass(
                "bg-gray-50 border-b p-4",
                "bg-gray-800 border-b border-gray-700 p-4"
              )}>
                <div className="flex items-center justify-between">
                  <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                    Financial Record Details
                  </h2>
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className={getContrastClass(
                      "text-gray-500 hover:text-gray-700 text-2xl",
                      "text-yellow-400 hover:text-yellow-300 text-2xl"
                    )}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Transaction Details */}
                  <div className={getContrastClass(
                    "bg-gray-50 rounded-lg p-4",
                    "bg-gray-800 rounded-lg p-4"
                  )}>
                    <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                      Transaction Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Reference:</span>
                        <span className={getContrastClass("ml-2 text-gray-900 font-mono", "ml-2 text-yellow-100 font-mono")}>
                          {selectedDonation.referenceNumber}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Mode:</span>
                        <span className={getContrastClass("ml-2 text-gray-900 capitalize", "ml-2 text-yellow-100 capitalize")}>
                          {selectedDonation.donationMode.replace('ewallet', 'E-wallet').replace('inkind', 'In-kind')}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Amount:</span>
                        <span className={getContrastClass("ml-2 text-gray-900 font-bold", "ml-2 text-yellow-100 font-bold")}>
                          {selectedDonation.amount ? `₱${parseFloat(selectedDonation.amount).toLocaleString()}` : 'In-kind donation'}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Date:</span>
                        <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                          {selectedDonation.submissionDate} at {selectedDonation.submissionTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className={getContrastClass(
                    "bg-gray-50 rounded-lg p-4",
                    "bg-gray-800 rounded-lg p-4"
                  )}>
                    <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                      Donor Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Parent/Guardian:</span>
                        <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                          {selectedDonation.parentName}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Student:</span>
                        <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                          {selectedDonation.studentName}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>E-Signature:</span>
                        <span className={getContrastClass("ml-2 text-gray-900 italic", "ml-2 text-yellow-100 italic")}>
                          {selectedDonation.eSignature}
                        </span>
                      </div>
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>IP Address:</span>
                        <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                          {selectedDonation.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Allocation Breakdown */}
                {selectedDonation.allocation && (
                  <div className={getContrastClass(
                    "bg-blue-50 rounded-lg p-4",
                    "bg-gray-800 rounded-lg p-4"
                  )}>
                    <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                      Fund Allocation
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={getContrastClass("bg-white p-3 rounded", "bg-gray-700 p-3 rounded")}>
                        <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-300")}>General SPTA</div>
                        <div className={getContrastClass("font-bold text-lg text-gray-900", "font-bold text-lg text-blue-400")}>
                          ₱{selectedDonation.allocation.generalSPTA.toLocaleString()}
                        </div>
                        <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                          {selectedDonation.amount ? (
                            ((selectedDonation.allocation.generalSPTA / parseFloat(selectedDonation.amount)) * 100).toFixed(1) + '%'
                          ) : 'N/A'}
                        </div>
                      </div>
                      <div className={getContrastClass("bg-white p-3 rounded", "bg-gray-700 p-3 rounded")}>
                        <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-300")}>11Mercado PTA Projects</div>
                        <div className={getContrastClass("font-bold text-lg text-gray-900", "font-bold text-lg text-purple-400")}>
                          ₱{selectedDonation.allocation.mercadoPTA.toLocaleString()}
                        </div>
                        <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>
                          {selectedDonation.amount ? (
                            ((selectedDonation.allocation.mercadoPTA / parseFloat(selectedDonation.amount)) * 100).toFixed(1) + '%'
                          ) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentation Status */}
                <div className={getContrastClass(
                  "bg-green-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                    Documentation & Compliance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className={selectedDonation.hasReceipt ? "text-green-500" : "text-gray-400"} size={16} />
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                          Transaction Receipt
                        </span>
                      </div>
                      <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-100")}>
                        Status: {selectedDonation.hasReceipt ? (
                          <span className="text-green-600 font-medium">✓ Uploaded</span>
                        ) : (
                          <span className="text-gray-500">✗ Not Required</span>
                        )}
                      </div>
                      {selectedDonation.fileNames.receipt && (
                        <div className={getContrastClass("text-xs text-gray-500 mt-1", "text-xs text-yellow-300 mt-1")}>
                          File: {selectedDonation.fileNames.receipt}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className={selectedDonation.hasPhoto ? "text-green-500" : "text-gray-400"} size={16} />
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>
                          Photo Evidence
                        </span>
                      </div>
                      <div className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-100")}>
                        Status: {selectedDonation.hasPhoto ? (
                          <span className="text-green-600 font-medium">✓ Uploaded</span>
                        ) : (
                          <span className="text-gray-500">✗ Not Required</span>
                        )}
                      </div>
                      {selectedDonation.fileNames.photo && (
                        <div className={getContrastClass("text-xs text-gray-500 mt-1", "text-xs text-yellow-300 mt-1")}>
                          File: {selectedDonation.fileNames.photo}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {(selectedDonation.items || selectedDonation.handedTo) && (
                  <div className={getContrastClass(
                    "bg-gray-50 rounded-lg p-4",
                    "bg-gray-800 rounded-lg p-4"
                  )}>
                    <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                      Additional Information
                    </h3>
                    {selectedDonation.items && (
                      <div className="mb-3">
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Items Description:</span>
                        <p className={getContrastClass("mt-1 text-gray-900", "mt-1 text-yellow-100")}>
                          {selectedDonation.items}
                        </p>
                      </div>
                    )}
                    {selectedDonation.handedTo && (
                      <div>
                        <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Handed to:</span>
                        <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                          {selectedDonation.handedTo}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Trail */}
                <div className={getContrastClass(
                  "bg-yellow-50 rounded-lg p-4",
                  "bg-gray-800 rounded-lg p-4"
                )}>
                  <h3 className={getContrastClass("font-semibold text-gray-900 mb-3", "font-semibold text-yellow-400 mb-3")}>
                    Audit Trail
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>Agreement Timestamp:</span>
                      <span className={getContrastClass("ml-2 text-gray-900", "ml-2 text-yellow-100")}>
                        {new Date(selectedDonation.agreementAcceptanceTimestamp).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className={getContrastClass("font-medium text-gray-700", "font-medium text-yellow-200")}>User Agent:</span>
                      <span className={getContrastClass("ml-2 text-gray-900 text-xs", "ml-2 text-yellow-100 text-xs")}>
                        {selectedDonation.userAgent}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}