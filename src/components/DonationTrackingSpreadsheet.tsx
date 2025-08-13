import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Search, Filter, Eye, CheckCircle, AlertCircle, Clock, DollarSign, Calendar, User, Upload } from 'lucide-react';

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

export default function DonationTrackingSpreadsheet({ getContrastClass, onClose }) {
  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<DonationEntry | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'mode' | 'reference'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    filterAndSortDonations();
  }, [donations, searchTerm, filterMode, sortBy, sortOrder]);

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
        donation.eSignature.toLowerCase().includes(search)
      );
    }

    // Apply mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(donation => donation.donationMode === filterMode);
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
      totalEntries: filteredDonations.length
    };

    filteredDonations.forEach(donation => {
      const amount = parseFloat(donation.amount || '0');
      totals.totalAmount += amount;
      
      if (donation.allocation) {
        totals.generalSPTA += donation.allocation.generalSPTA;
        totals.mercadoPTA += donation.allocation.mercadoPTA;
      }

      totals[donation.donationMode]++;
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
      'IP Address',
      'User Agent'
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
        donation.ipAddress,
        `"${donation.userAgent}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `donation_tracking_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totals = calculateTotals();

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={32} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-2xl font-bold text-white",
                "text-2xl font-bold text-yellow-400"
              )}>
                Donation Tracking Spreadsheet
              </h1>
              <p className={getContrastClass(
                "text-green-100 text-sm",
                "text-yellow-200 text-sm"
              )}>
                Complete audit trail for all donations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={getContrastClass(
              "bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors",
              "bg-gray-800 border border-yellow-400 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-yellow-400"
            )}
          >
            Close
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass("text-white/70 text-xs", "text-yellow-300 text-xs")}>
              Total Entries
            </div>
            <div className={getContrastClass("text-white font-bold text-lg", "text-yellow-400 font-bold text-lg")}>
              {totals.totalEntries}
            </div>
          </div>
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass("text-white/70 text-xs", "text-yellow-300 text-xs")}>
              Total Amount
            </div>
            <div className={getContrastClass("text-white font-bold text-lg", "text-yellow-400 font-bold text-lg")}>
              ₱{totals.totalAmount.toLocaleString()}
            </div>
          </div>
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass("text-white/70 text-xs", "text-yellow-300 text-xs")}>
              General SPTA
            </div>
            <div className={getContrastClass("text-white font-bold text-lg", "text-yellow-400 font-bold text-lg")}>
              ₱{totals.generalSPTA.toLocaleString()}
            </div>
          </div>
          <div className={getContrastClass(
            "bg-white/10 rounded-lg p-3",
            "bg-gray-800 border border-yellow-400 rounded-lg p-3"
          )}>
            <div className={getContrastClass("text-white/70 text-xs", "text-yellow-300 text-xs")}>
              11Mercado PTA
            </div>
            <div className={getContrastClass("text-white font-bold text-lg", "text-yellow-400 font-bold text-lg")}>
              ₱{totals.mercadoPTA.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={getContrastClass(
        "bg-gray-50 border-b p-4",
        "bg-gray-900 border-b border-gray-700 p-4"
      )}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className={getContrastClass(
                "absolute left-3 top-3 text-gray-400",
                "absolute left-3 top-3 text-yellow-400"
              )} />
              <input
                type="text"
                placeholder="Search by name, reference number, signature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 p-3 rounded-xl border ${getContrastClass(
                  'border-gray-300 bg-white text-gray-900',
                  'border-gray-600 bg-gray-800 text-yellow-200'
                )} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
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
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">
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
                {searchTerm || filterMode !== 'all' ? 'Try adjusting your search or filter criteria' : 'No donations have been submitted yet'}
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
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        {donation.hasPhoto && (
                          <CheckCircle size={16} className="text-blue-500" />
                        )}
                      </div>
                      
                      <h3 className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                        {donation.parentName}
                      </h3>
                      <p className={getContrastClass("text-gray-600 text-sm", "text-yellow-200 text-sm")}>
                        Student: {donation.studentName}
                      </p>
                      <p className={getContrastClass("text-gray-500 text-xs", "text-yellow-300 text-xs")}>
                        Signature: <em>{donation.eSignature}</em>
                      </p>
                    </div>

                    <div className="text-right">
                      {donation.amount && (
                        <div className={getContrastClass("text-xl font-bold text-gray-900", "text-xl font-bold text-yellow-400")}>
                          ₱{parseFloat(donation.amount).toLocaleString()}
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
                        <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
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
                        <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
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
            "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto",
            "bg-gray-900 border border-yellow-400 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          )}>
            <div className={getContrastClass(
              "bg-gray-50 border-b p-4",
              "bg-gray-800 border-b border-gray-700 p-4"
            )}>
              <div className="flex items-center justify-between">
                <h2 className={getContrastClass("text-xl font-semibold text-gray-900", "text-xl font-semibold text-yellow-400")}>
                  Donation Details
                </h2>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className={getContrastClass(
                    "text-gray-500 hover:text-gray-700",
                    "text-yellow-400 hover:text-yellow-300"
                  )}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Reference Number
                  </label>
                  <div className={getContrastClass("text-gray-900 font-mono", "text-yellow-200 font-mono")}>
                    {selectedDonation.referenceNumber}
                  </div>
                </div>
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Submission
                  </label>
                  <div className={getContrastClass("text-gray-900", "text-yellow-200")}>
                    {selectedDonation.submissionDate} {selectedDonation.submissionTime}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Parent/Guardian
                  </label>
                  <div className={getContrastClass("text-gray-900", "text-yellow-200")}>
                    {selectedDonation.parentName}
                  </div>
                </div>
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Student
                  </label>
                  <div className={getContrastClass("text-gray-900", "text-yellow-200")}>
                    {selectedDonation.studentName}
                  </div>
                </div>
              </div>

              <div>
                <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                  Electronic Signature
                </label>
                <div className={getContrastClass("text-gray-900 italic", "text-yellow-200 italic")}>
                  {selectedDonation.eSignature}
                </div>
              </div>

              {selectedDonation.allocation && (
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Allocation Breakdown
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className={getContrastClass("bg-gray-50 p-3 rounded", "bg-gray-800 p-3 rounded")}>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>General SPTA</div>
                      <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                        ₱{selectedDonation.allocation.generalSPTA.toLocaleString()}
                      </div>
                    </div>
                    <div className={getContrastClass("bg-gray-50 p-3 rounded", "bg-gray-800 p-3 rounded")}>
                      <div className={getContrastClass("text-xs text-gray-500", "text-xs text-yellow-300")}>11Mercado PTA</div>
                      <div className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                        ₱{selectedDonation.allocation.mercadoPTA.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Attachments
                  </label>
                  <div className="space-y-1">
                    <div className={getContrastClass("text-gray-900 text-sm", "text-yellow-200 text-sm")}>
                      Receipt: {selectedDonation.hasReceipt ? `✓ ${selectedDonation.fileNames.receipt}` : '✗ None'}
                    </div>
                    <div className={getContrastClass("text-gray-900 text-sm", "text-yellow-200 text-sm")}>
                      Photo: {selectedDonation.hasPhoto ? `✓ ${selectedDonation.fileNames.photo}` : '✗ None'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Technical Info
                  </label>
                  <div className={getContrastClass("text-gray-900 text-xs", "text-yellow-200 text-xs")}>
                    IP: {selectedDonation.ipAddress}
                  </div>
                </div>
              </div>

              {selectedDonation.items && (
                <div>
                  <label className={getContrastClass("text-sm font-medium text-gray-700", "text-sm font-medium text-yellow-400")}>
                    Items Description
                  </label>
                  <div className={getContrastClass("text-gray-900", "text-yellow-200")}>
                    {selectedDonation.items}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}