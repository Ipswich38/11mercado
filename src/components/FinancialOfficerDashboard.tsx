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
  LogOut,
  Image,
  X,
  ZoomIn,
  Edit3,
  Trash2,
  Save,
  UserCheck,
  Shield,
  History
} from 'lucide-react';
import { getAllDonationsFromCentralDB } from '../utils/centralizedDatabase';

interface DonationEntry {
  id?: string;
  reference_number: string;
  submission_date: string;
  submission_time?: string;
  submission_timestamp?: string;
  parent_name: string;
  student_name: string;
  donation_mode: 'e-wallet' | 'bank-transfer' | 'cash' | 'in-kind';
  amount?: number;
  allocation?: {
    generalSPTA?: number;
    mercadoPTA?: number;
    general_spta?: number;
    mercado_pta?: number;
  };
  handed_to?: string;
  items?: string;
  has_receipt: boolean;
  has_photo: boolean;
  attachment_filename?: string;
  e_signature: string;
  created_at: string;
  updated_at: string;
}

export default function FinancialOfficerDashboard({ getContrastClass, onLogout, userInfo }) {
  // Error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [safeMode, setSafeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [donations, setDonations] = useState<DonationEntry[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState<DonationEntry | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'mode' | 'reference'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedView, setSelectedView] = useState<'overview' | 'details'>('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewingImage, setViewingImage] = useState<{ src: string; name: string; type: 'receipt' | 'photo' } | null>(null);
  const [editingDonation, setEditingDonation] = useState<DonationEntry | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditAction, setAuditAction] = useState<'edit' | 'delete'>('edit');
  const [auditReason, setAuditReason] = useState('');
  const [auditSignature, setAuditSignature] = useState('');
  const [pendingAction, setPendingAction] = useState<{ action: 'edit' | 'delete'; donation: DonationEntry } | null>(null);

  // Error boundary function
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Finance Dashboard Error:', error, errorInfo);
    setHasError(true);
    setErrorMessage(error.message);
    setSafeMode(true);
  };

  // Enable safe mode if loading fails
  const enableSafeMode = () => {
    console.warn('Enabling Finance Dashboard Safe Mode');
    setSafeMode(true);
    setIsLoading(false);
    setDonations([]);
    setFilteredDonations([]);
  };

  // If there's an error, show fallback UI
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance Dashboard Error</h2>
          <p className="text-gray-600 mb-4">The Finance Dashboard encountered an error and cannot load properly.</p>
          <p className="text-sm text-red-600 mb-6">{errorMessage}</p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
                window.location.reload();
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Dashboard
            </button>
            <button 
              onClick={onLogout}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Finance Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your donation data.</p>
          <button 
            onClick={enableSafeMode}
            className="mt-4 text-sm text-blue-500 hover:text-blue-700 underline"
          >
            Having issues? Click here for safe mode
          </button>
        </div>
      </div>
    );
  }

  // Show safe mode notice
  if (safeMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Safe Mode:</strong> Finance Dashboard is running in safe mode due to data loading issues. Some features may be limited.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Finance Dashboard - Safe Mode</h2>
          <p className="text-gray-600 mb-6">Unable to load donation data. Please check your connection and try refreshing.</p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                setIsLoading(true);
                setSafeMode(false);
                loadDonations();
              }}
              className="w-full max-w-xs bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Loading Again
            </button>
            <button 
              onClick={onLogout}
              className="w-full max-w-xs bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    try {
      loadDonations();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        try {
          loadDonations();
        } catch (intervalError) {
          console.error('Error in interval refresh:', intervalError);
        }
      }, 30000);
      
      // Listen for localStorage changes (for real-time updates)
      const handleStorageChange = (event) => {
        try {
          if (event.key === 'donationEntries' || event.key === null) {
            loadDonations();
          }
        } catch (storageError) {
          console.error('Error handling storage change:', storageError);
        }
      };
      
      // Listen for focus events (when user comes back to tab)
      const handleFocus = () => {
        try {
          loadDonations();
        } catch (focusError) {
          console.error('Error handling focus event:', focusError);
        }
      };
      
      // Listen for custom donation update events
      const handleDonationUpdate = () => {
        try {
          loadDonations();
        } catch (updateError) {
          console.error('Error handling donation update:', updateError);
        }
      };
      
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('donationUpdated', handleDonationUpdate);
      }
      
      return () => {
        try {
          clearInterval(interval);
          if (typeof window !== 'undefined') {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('donationUpdated', handleDonationUpdate);
          }
        } catch (cleanupError) {
          console.error('Error in useEffect cleanup:', cleanupError);
        }
      };
    } catch (effectError) {
      console.error('Error in useEffect setup:', effectError);
      handleError(effectError, 'Failed to initialize Finance Dashboard');
    }
  }, []);

  useEffect(() => {
    try {
      filterAndSortDonations();
    } catch (filterError) {
      console.error('Error filtering donations:', filterError);
      handleError(filterError, 'Failed to filter donations');
    }
  }, [donations, searchTerm, filterMode, sortBy, sortOrder, dateRange]);

  useEffect(() => {
    try {
      const handleEscKey = (event: KeyboardEvent) => {
        try {
          if (event.key === 'Escape') {
            if (viewingImage) setViewingImage(null);
            else if (selectedDonation) setSelectedDonation(null);
          }
        } catch (keyError) {
          console.error('Error handling escape key:', keyError);
        }
      };

      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
      }
    } catch (escError) {
      console.error('Error setting up escape key handler:', escError);
    }
  }, [viewingImage, selectedDonation]);

  const loadDonations = async () => {
    try {
      console.log('🔄 Loading donations from centralized database...');
      const centralizedDonations = await getAllDonationsFromCentralDB();
      
      console.log('📊 Raw donations received:', centralizedDonations);
      
      if (!centralizedDonations || !Array.isArray(centralizedDonations)) {
        console.warn('No valid donations received, falling back to localStorage');
        try {
          const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
          console.log('📱 localStorage donations found:', localDonations);
          setDonations(localDonations);
          console.log(`📱 Fallback: loaded ${localDonations.length} donations from localStorage`);
        } catch (e) {
          console.error('Error reading localStorage fallback:', e);
          setDonations([]);
        }
        return;
      }
      
      // Transform the data to match our interface
      const transformedDonations = centralizedDonations.map(donation => {
        try {
          return {
            ...donation,
            referenceNumber: donation.reference_number || donation.referenceNumber,
            submissionDate: donation.submission_date || donation.submissionDate,
            submissionTime: donation.submission_time || (donation.created_at ? new Date(donation.created_at).toLocaleTimeString() : ''),
            submissionTimestamp: donation.created_at || donation.submissionTimestamp,
            parentName: donation.parent_name || donation.parentName,
            studentName: donation.student_name || donation.studentName,
            donationMode: donation.donation_mode || donation.donationMode,
            amount: donation.amount ? donation.amount.toString() : (donation.amount === 0 ? '0' : ''),
            hasReceipt: donation.has_receipt || donation.hasReceipt || false,
            hasPhoto: donation.has_photo || donation.hasPhoto || false,
            fileNames: {
              receipt: donation.attachment_filename || donation.fileNames?.receipt || null,
              photo: donation.attachment_filename || donation.fileNames?.photo || null
            },
            eSignature: donation.e_signature || donation.eSignature,
            agreementAcceptanceTimestamp: donation.created_at || donation.agreementAcceptanceTimestamp,
            ipAddress: donation.ipAddress || '127.0.0.1',
            userAgent: donation.userAgent || 'Centralized Database Entry',
            date: donation.submission_date || donation.date,
            time: donation.submission_time || donation.time,
            handedTo: donation.handed_to || donation.handedTo,
            items: donation.items
          };
        } catch (transformError) {
          console.error('Error transforming donation:', transformError, donation);
          return donation; // Return original if transformation fails
        }
      }).filter(Boolean); // Filter out any null/undefined results
      
      console.log('📊 Transformed donations:', transformedDonations);
      setDonations(transformedDonations);
      console.log(`💰 Finance Dashboard loaded ${transformedDonations.length} donations from centralized DB`);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading centralized donations:', error);
      // Fallback to localStorage if centralized DB fails
      try {
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        setDonations(localDonations);
        console.log(`📱 Fallback: loaded ${localDonations.length} donations from localStorage`);
        setIsLoading(false);
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
        console.warn('All data loading failed, enabling safe mode');
        enableSafeMode();
      }
    }
  };

  const clearDatabase = () => {
    if (window.confirm('Are you sure you want to clear all donation records? This action cannot be undone.')) {
      localStorage.removeItem('donationEntries');
      localStorage.removeItem('donationFiles');
      setDonations([]);
      alert('Database cleared successfully!');
    }
  };

  const filterAndSortDonations = () => {
    let filtered = [...donations];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(donation => 
        (donation.parentName || donation.parent_name || '').toLowerCase().includes(search) ||
        (donation.studentName || donation.student_name || '').toLowerCase().includes(search) ||
        (donation.referenceNumber || donation.reference_number || '').toLowerCase().includes(search) ||
        (donation.eSignature || donation.e_signature || '').toLowerCase().includes(search) ||
        (donation.amount && donation.amount.toString().includes(search))
      );
    }

    // Apply mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(donation => 
        (donation.donationMode || donation.donation_mode) === filterMode ||
        (filterMode === 'ewallet' && (donation.donationMode || donation.donation_mode) === 'e-wallet')
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(donation => 
        new Date(donation.submissionDate || donation.submission_date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(donation => 
        new Date(donation.submissionDate || donation.submission_date) <= new Date(dateRange.end)
      );
    }

    // Sort donations
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.submissionTimestamp || a.created_at).getTime() - new Date(b.submissionTimestamp || b.created_at).getTime();
          break;
        case 'amount':
          const amountA = parseFloat((a.amount || 0).toString());
          const amountB = parseFloat((b.amount || 0).toString());
          compareValue = amountA - amountB;
          break;
        case 'mode':
          compareValue = (a.donationMode || a.donation_mode).localeCompare(b.donationMode || b.donation_mode);
          break;
        case 'reference':
          compareValue = (a.referenceNumber || a.reference_number).localeCompare(b.referenceNumber || b.reference_number);
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredDonations(filtered);
  };

  const calculateTotals = () => {
    console.log('📊 Calculating totals for donations:', filteredDonations);
    
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
      console.log('💰 Processing donation:', donation.referenceNumber || donation.reference_number, 'amount:', donation.amount);
      const amount = parseFloat((donation.amount || 0).toString());
      console.log('💰 Parsed amount:', amount);
      totals.totalAmount += amount;
      
      if (donation.allocation) {
        totals.generalSPTA += donation.allocation.generalSPTA || donation.allocation.general_spta || 0;
        totals.mercadoPTA += donation.allocation.mercadoPTA || donation.allocation.mercado_pta || 0;
      }

      // Handle donation mode counting (convert e-wallet to ewallet for counting)
      const mode = (donation.donationMode || donation.donation_mode) === 'e-wallet' ? 'ewallet' : (donation.donationMode || donation.donation_mode);
      if (totals[mode] !== undefined) {
        totals[mode]++;
      }
      
      if (donation.hasReceipt || donation.has_receipt) totals.withReceipts++;
      if (donation.hasPhoto || donation.has_photo) totals.withPhotos++;

      const donationDate = new Date(donation.submissionDate || donation.submission_date);
      if (donationDate.toDateString() === today) totals.completedToday++;
      if (donationDate.getMonth() === thisMonth && donationDate.getFullYear() === thisYear) {
        totals.completedThisMonth++;
      }
    });

    console.log('📊 Final totals calculated:', totals);
    return totals;
  };

  const viewImage = (referenceNumber: string, fileName: string, type: 'receipt' | 'photo') => {
    try {
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      const fileKey = `${referenceNumber}_${type}`;
      const fileData = fileStorage[fileKey];
      
      if (fileData && fileData.data) {
        setViewingImage({
          src: fileData.data,
          name: fileName,
          type: type
        });
      } else {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} file not found. This may occur if the donation was submitted before the image storage feature was implemented.\n\nFor missing files, please ask the donor to resubmit their ${type} or contact the admin for assistance.`);
      }
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image file. Please try again or contact support.');
    }
  };

  const downloadImage = (referenceNumber: string, fileName: string, type: 'receipt' | 'photo') => {
    try {
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      const fileKey = `${referenceNumber}_${type}`;
      const fileData = fileStorage[fileKey];
      
      if (fileData && fileData.data) {
        // Create download link
        const link = document.createElement('a');
        link.href = fileData.data;
        link.download = fileName || `${referenceNumber}_${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} file not found. Cannot download missing file.`);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const debugFileStorage = () => {
    try {
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      const donationEntries = JSON.parse(localStorage.getItem('donationEntries') || '[]');
      
      console.log('=== FILE STORAGE DEBUG ===');
      console.log('donationFiles keys:', Object.keys(fileStorage));
      console.log('donationEntries with files:', donationEntries.filter(d => d.hasReceipt || d.hasPhoto).map(d => ({
        ref: d.referenceNumber,
        hasReceipt: d.hasReceipt,
        hasPhoto: d.hasPhoto,
        receiptName: d.fileNames?.receipt,
        photoName: d.fileNames?.photo
      })));
      
      // Check which files exist vs which are claimed to exist
      donationEntries.forEach(donation => {
        if (donation.hasReceipt) {
          const receiptKey = `${donation.referenceNumber}_receipt`;
          const exists = !!fileStorage[receiptKey];
          if (!exists) {
            console.warn(`Missing receipt file for ${donation.referenceNumber}`);
          }
        }
        if (donation.hasPhoto) {
          const photoKey = `${donation.referenceNumber}_photo`;
          const exists = !!fileStorage[photoKey];
          if (!exists) {
            console.warn(`Missing photo file for ${donation.referenceNumber}`);
          }
        }
      });
      
      alert(`Debug info logged to console. Found ${Object.keys(fileStorage).length} stored files for ${donationEntries.length} donation entries.`);
    } catch (error) {
      console.error('Debug error:', error);
      alert('Error debugging file storage.');
    }
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
      'Receipt Image Link',
      'Photo Image Link'
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
        `"${donation.fileNames?.receipt || 'N/A'}"`,
        `"${donation.fileNames?.photo || 'N/A'}"`,
        `"${donation.eSignature}"`,
        donation.agreementAcceptanceTimestamp,
        donation.fileNames?.receipt ? `View Receipt for ${donation.referenceNumber}` : 'N/A',
        donation.fileNames?.photo ? `View Photo for ${donation.referenceNumber}` : 'N/A'
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

  const exportToExcel = () => {
    // Create Excel-compatible XML
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
      'Receipt Image Link',
      'Photo Image Link'
    ];

    let excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
<Author>11Mercado PTA Financial System</Author>
<LastAuthor>11Mercado PTA Financial System</LastAuthor>
<Created>${new Date().toISOString()}</Created>
<Version>1.0</Version>
</DocumentProperties>
<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
<WindowHeight>8180</WindowHeight>
<WindowWidth>14440</WindowWidth>
<WindowTopX>120</WindowTopX>
<WindowTopY>120</WindowTopY>
<ProtectStructure>False</ProtectStructure>
<ProtectWindows>False</ProtectWindows>
</ExcelWorkbook>
<Styles>
<Style ss:ID="Default" ss:Name="Normal">
<Alignment ss:Vertical="Bottom"/>
<Borders/>
<Font ss:FontName="Arial"/>
<Interior/>
<NumberFormat/>
<Protection/>
</Style>
<Style ss:ID="Header">
<Font ss:FontName="Arial" ss:Size="11" ss:Bold="1"/>
<Interior ss:Color="#4F81BD" ss:Pattern="Solid"/>
<Font ss:Color="#FFFFFF"/>
</Style>
<Style ss:ID="Currency">
<NumberFormat ss:Format="₱#,##0.00"/>
</Style>
<Style ss:ID="Hyperlink">
<Font ss:FontName="Arial" ss:Size="11" ss:Color="#0000FF" ss:Underline="Single"/>
</Style>
</Styles>
<Worksheet ss:Name="Financial Report">
<Table>
<Row>`;

    headers.forEach(header => {
      excelContent += `<Cell ss:StyleID="Header"><Data ss:Type="String">${header}</Data></Cell>`;
    });
    excelContent += '</Row>';

    filteredDonations.forEach(donation => {
      excelContent += '<Row>';
      
      const rowData = [
        donation.referenceNumber,
        donation.submissionDate,
        donation.submissionTime,
        donation.parentName,
        donation.studentName,
        donation.donationMode.toUpperCase(),
        donation.amount || 'N/A',
        donation.allocation?.generalSPTA || 0,
        donation.allocation?.mercadoPTA || 0,
        donation.date,
        donation.time || 'N/A',
        donation.handedTo || 'N/A',
        donation.items || 'N/A',
        donation.hasReceipt ? 'Yes' : 'No',
        donation.hasPhoto ? 'Yes' : 'No',
        donation.fileNames?.receipt || 'N/A',
        donation.fileNames?.photo || 'N/A',
        donation.eSignature,
        donation.agreementAcceptanceTimestamp
      ];

      rowData.forEach((cell, index) => {
        if (index === 6 || index === 7 || index === 8) { // Amount columns
          excelContent += `<Cell ss:StyleID="Currency"><Data ss:Type="Number">${parseFloat(cell.toString()) || 0}</Data></Cell>`;
        } else {
          excelContent += `<Cell><Data ss:Type="String">${cell.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`;
        }
      });

      // Add image links with hyperlinks
      if (donation.fileNames?.receipt) {
        excelContent += `<Cell ss:StyleID="Hyperlink"><Data ss:Type="String">View Receipt: ${donation.fileNames?.receipt}</Data></Cell>`;
      } else {
        excelContent += `<Cell><Data ss:Type="String">N/A</Data></Cell>`;
      }

      if (donation.fileNames?.photo) {
        excelContent += `<Cell ss:StyleID="Hyperlink"><Data ss:Type="String">View Photo: ${donation.fileNames?.photo}</Data></Cell>`;
      } else {
        excelContent += `<Cell><Data ss:Type="String">N/A</Data></Cell>`;
      }

      excelContent += '</Row>';
    });

    excelContent += `</Table>
</Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.xls`);
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
Total Donations: ${totals.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
Total Entries: ${totals.totalEntries}
Entries Today: ${totals.completedToday}
Entries This Month: ${totals.completedThisMonth}

ALLOCATION BREAKDOWN:
====================
General SPTA: ${totals.generalSPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} (${((totals.generalSPTA / totals.totalAmount) * 100).toFixed(1)}%)
11Mercado PTA Projects: ${totals.mercadoPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })} (${((totals.mercadoPTA / totals.totalAmount) * 100).toFixed(1)}%)

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
- Complete audit trail maintained with electronic signatures

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

  const getStoredImage = (referenceNumber: string, type: 'receipt' | 'photo'): string | null => {
    try {
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      const fileKey = `${referenceNumber}_${type}`;
      return fileStorage[fileKey]?.data || null;
    } catch (error) {
      console.error('Error retrieving stored image:', error);
      return null;
    }
  };


  const requestAction = (action: 'edit' | 'delete', donation: DonationEntry) => {
    setPendingAction({ action, donation });
    setAuditAction(action);
    setAuditReason('');
    setAuditSignature('');
    setShowAuditModal(true);
  };

  const executeAction = () => {
    if (!pendingAction || !auditReason.trim() || !auditSignature.trim()) {
      alert('Please provide both reason and e-signature to proceed.');
      return;
    }

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: auditAction,
      reason: auditReason,
      signature: auditSignature,
      officerName: userInfo?.firstName,
      officerType: userInfo?.userType,
      referenceNumber: pendingAction.donation.referenceNumber
    };

    // Save audit trail
    const existingAudits = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    existingAudits.push(auditEntry);
    localStorage.setItem('auditTrail', JSON.stringify(existingAudits));

    if (auditAction === 'delete') {
      // Remove from donations
      const updatedDonations = donations.filter(d => d.referenceNumber !== pendingAction.donation.referenceNumber);
      setDonations(updatedDonations);
      localStorage.setItem('donationEntries', JSON.stringify(updatedDonations));
      
      // Remove associated files
      const fileStorage = JSON.parse(localStorage.getItem('donationFiles') || '{}');
      delete fileStorage[`${pendingAction.donation.referenceNumber}_receipt`];
      delete fileStorage[`${pendingAction.donation.referenceNumber}_photo`];
      localStorage.setItem('donationFiles', JSON.stringify(fileStorage));
      
      alert('Record deleted successfully with audit trail.');
    } else if (auditAction === 'edit') {
      setEditingDonation(pendingAction.donation);
      alert('You can now edit this record. Changes will be tracked in the audit trail.');
    }

    // Reset states
    setShowAuditModal(false);
    setPendingAction(null);
    setAuditReason('');
    setAuditSignature('');
  };

  const saveEditedDonation = (editedDonation: DonationEntry) => {
    const updatedDonations = donations.map(d => 
      d.referenceNumber === editedDonation.referenceNumber ? editedDonation : d
    );
    setDonations(updatedDonations);
    localStorage.setItem('donationEntries', JSON.stringify(updatedDonations));
    
    // Log the edit in audit trail
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action: 'edit_completed',
      reason: 'Record updated',
      signature: auditSignature,
      officerName: userInfo?.firstName,
      officerType: userInfo?.userType,
      referenceNumber: editedDonation.referenceNumber
    };

    const existingAudits = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    existingAudits.push(auditEntry);
    localStorage.setItem('auditTrail', JSON.stringify(existingAudits));
    
    setEditingDonation(null);
    alert('Record updated successfully with audit trail.');
  };

  let totals;
  try {
    totals = calculateTotals();
  } catch (totalsError) {
    console.error('Error calculating totals:', totalsError);
    handleError(totalsError, 'Failed to calculate donation totals');
    return null; // This will show the error UI
  }

  try {
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
                onClick={clearDatabase}
                className={getContrastClass(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-yellow-400 hover:bg-orange-900/20 hover:text-orange-400 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                )}
                title="Clear Database"
              >
                <AlertCircle size={16} />
                <span className="text-xs font-medium">Clear DB</span>
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
              {totals.totalAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
              {totals.generalSPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
              {totals.mercadoPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
              >
                <Download size={16} />
                CSV
              </button>

              <button
                onClick={debugFileStorage}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
                title="Debug file storage (check console)"
              >
                🔍 Debug
              </button>

              <button
                onClick={exportToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>

              <button
                onClick={generateFinancialSummaryReport}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 transition-colors text-sm"
              >
                <FileText size={16} />
                Report
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
                            {donation.referenceNumber || donation.reference_number}
                          </span>
                          <span className={getContrastClass(
                            `bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full capitalize`,
                            `bg-gray-700 text-yellow-200 text-xs px-2 py-1 rounded-full capitalize`
                          )}>
                            {(donation.donationMode || donation.donation_mode || '').replace('e-wallet', 'E-wallet').replace('ewallet', 'E-wallet').replace('inkind', 'In-kind').replace('in-kind', 'In-kind')}
                          </span>
                          {donation.hasReceipt && (
                            <button
                              onClick={() => viewImage(donation.referenceNumber, donation.fileNames?.receipt!, 'receipt')}
                              className="p-1 rounded hover:bg-green-100 hover:bg-opacity-20"
                              title="View receipt image"
                            >
                              <Receipt size={16} className="text-green-500" />
                            </button>
                          )}
                          {donation.hasPhoto && (
                            <button
                              onClick={() => viewImage(donation.referenceNumber, donation.fileNames?.photo!, 'photo')}
                              className="p-1 rounded hover:bg-blue-100 hover:bg-opacity-20"
                              title="View photo evidence"
                            >
                              <Camera size={16} className="text-blue-500" />
                            </button>
                          )}
                        </div>
                        
                        <h3 className={getContrastClass("font-semibold text-gray-900", "font-semibold text-yellow-400")}>
                          {donation.parentName || donation.parent_name}
                        </h3>
                        <p className={getContrastClass("text-gray-600 text-sm", "text-yellow-200 text-sm")}>
                          Student: {donation.studentName || donation.student_name}
                        </p>
                        <p className={getContrastClass("text-gray-500 text-xs", "text-yellow-300 text-xs")}>
                          Signature: <em>{donation.eSignature || donation.e_signature}</em> • IP: {donation.ipAddress || '127.0.0.1'}
                        </p>
                      </div>

                      <div className="text-right">
                        {donation.amount && (
                          <div className={getContrastClass("text-xl font-bold text-gray-900", "text-xl font-bold text-yellow-400")}>
                            {parseFloat(donation.amount.toString()).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                          </div>
                        )}
                        {!donation.amount && (
                          <div className={getContrastClass("text-lg font-bold text-purple-600", "text-lg font-bold text-purple-400")}>
                            In-kind
                          </div>
                        )}
                        <div className={getContrastClass("text-sm text-gray-500", "text-sm text-yellow-300")}>
                          {donation.submissionDate || donation.submission_date}
                        </div>
                        <div className={getContrastClass("text-xs text-gray-400", "text-xs text-yellow-400")}>
                          {donation.submissionTime || donation.submission_time}
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
                            {(donation.allocation.generalSPTA || donation.allocation.general_spta || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
                            {(donation.allocation.mercadoPTA || donation.allocation.mercado_pta || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
                        {donation.fileNames?.receipt && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => viewImage(donation.referenceNumber, donation.fileNames?.receipt!, 'receipt')}
                              className={getContrastClass(
                                "text-blue-600 hover:text-blue-800 underline text-xs",
                                "text-yellow-400 hover:text-yellow-300 underline text-xs"
                              )}
                              title="View receipt image"
                            >
                              📄 {donation.fileNames?.receipt}
                            </button>
                            <button
                              onClick={() => downloadImage(donation.referenceNumber, donation.fileNames?.receipt!, 'receipt')}
                              className={getContrastClass(
                                "text-blue-600 hover:text-blue-800 text-xs px-1",
                                "text-yellow-400 hover:text-yellow-300 text-xs px-1"
                              )}
                              title="Download receipt"
                            >
                              ⬇️
                            </button>
                          </div>
                        )}
                        {donation.fileNames?.photo && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => viewImage(donation.referenceNumber, donation.fileNames?.photo!, 'photo')}
                              className={getContrastClass(
                                "text-green-600 hover:text-green-800 underline text-xs",
                                "text-green-400 hover:text-green-300 underline text-xs"
                              )}
                              title="View photo evidence"
                            >
                              📷 {donation.fileNames?.photo}
                            </button>
                            <button
                              onClick={() => downloadImage(donation.referenceNumber, donation.fileNames?.photo!, 'photo')}
                              className={getContrastClass(
                                "text-green-600 hover:text-green-800 text-xs px-1",
                                "text-green-400 hover:text-green-300 text-xs px-1"
                              )}
                              title="Download photo"
                            >
                              ⬇️
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDonation(donation)}
                          className={getContrastClass(
                            "text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded",
                            "text-yellow-400 hover:text-yellow-300 flex items-center gap-1 px-2 py-1 rounded"
                          )}
                          title="View full details"
                        >
                          <Eye size={14} />
                          <span className="text-xs">View</span>
                        </button>
                        <button
                          onClick={() => requestAction('edit', donation)}
                          className={getContrastClass(
                            "text-green-600 hover:text-green-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-50",
                            "text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-green-900/20"
                          )}
                          title="Edit record with audit trail"
                        >
                          <Edit3 size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => requestAction('delete', donation)}
                          className={getContrastClass(
                            "text-red-600 hover:text-red-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50",
                            "text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-900/20"
                          )}
                          title="Delete record with audit trail"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
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
                          {selectedDonation.amount ? parseFloat(selectedDonation.amount).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }) : 'In-kind donation'}
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
                          {selectedDonation.allocation.generalSPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
                          {selectedDonation.allocation.mercadoPTA.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
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
                      {selectedDonation.fileNames?.receipt && (
                        <button
                          onClick={() => viewImage(selectedDonation.referenceNumber, selectedDonation.fileNames?.receipt!, 'receipt')}
                          className={getContrastClass(
                            "text-xs text-blue-600 hover:text-blue-800 underline mt-1 flex items-center gap-1",
                            "text-xs text-yellow-400 hover:text-yellow-300 underline mt-1 flex items-center gap-1"
                          )}
                        >
                          <Image size={12} />
                          View: {selectedDonation.fileNames?.receipt}
                        </button>
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
                      {selectedDonation.fileNames?.photo && (
                        <button
                          onClick={() => viewImage(selectedDonation.referenceNumber, selectedDonation.fileNames?.photo!, 'photo')}
                          className={getContrastClass(
                            "text-xs text-green-600 hover:text-green-800 underline mt-1 flex items-center gap-1",
                            "text-xs text-green-400 hover:text-green-300 underline mt-1 flex items-center gap-1"
                          )}
                        >
                          <Image size={12} />
                          View: {selectedDonation.fileNames?.photo}
                        </button>
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

        {/* Image Viewing Modal */}
        {viewingImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-70 p-4">
            <div className={getContrastClass(
              "bg-white rounded-xl max-w-6xl max-h-[95vh] overflow-auto relative",
              "bg-gray-900 border border-yellow-400 rounded-xl max-w-6xl max-h-[95vh] overflow-auto relative"
            )}>
              <div className={getContrastClass(
                "bg-gray-50 border-b p-4 flex items-center justify-between sticky top-0 z-10",
                "bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10"
              )}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    viewingImage.type === 'receipt' 
                      ? getContrastClass('bg-blue-100 text-blue-600', 'bg-gray-700 text-blue-400')
                      : getContrastClass('bg-green-100 text-green-600', 'bg-gray-700 text-green-400')
                  }`}>
                    {viewingImage.type === 'receipt' ? <Receipt size={20} /> : <Camera size={20} />}
                  </div>
                  <div>
                    <h2 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
                      {viewingImage.type === 'receipt' ? 'Transaction Receipt' : 'Photo Evidence'}
                    </h2>
                    <p className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                      {viewingImage.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingImage(null)}
                  className={getContrastClass(
                    "text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100",
                    "text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-gray-700"
                  )}
                  title="Close image viewer"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <img
                    src={viewingImage.src}
                    alt={viewingImage.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    style={{ imageRendering: 'auto' }}
                  />
                </div>
                <div className={getContrastClass(
                  "mt-4 text-center text-sm text-gray-500",
                  "mt-4 text-center text-sm text-yellow-300"
                )}>
                  Click the X button above or press ESC to close this image viewer.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Modal for Edit/Delete Authorization */}
        {showAuditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-80 p-4">
            <div className={getContrastClass(
              "bg-white rounded-xl max-w-md w-full",
              "bg-gray-900 border border-yellow-400 rounded-xl max-w-md w-full"
            )}>
              <div className={getContrastClass(
                "bg-orange-50 border-b p-4",
                "bg-gray-800 border-b border-gray-700 p-4"
              )}>
                <div className="flex items-center gap-3">
                  <Shield className={getContrastClass("text-orange-600", "text-orange-400")} size={24} />
                  <h2 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
                    Authorization Required
                  </h2>
                </div>
                <p className={getContrastClass("text-sm text-gray-600 mt-2", "text-sm text-yellow-200 mt-2")}>
                  You are about to {auditAction} record: {pendingAction?.donation.referenceNumber}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
                    Reason for {auditAction} *
                  </label>
                  <textarea
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
                      "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
                    )}
                    rows={3}
                    placeholder={`Please explain why you need to ${auditAction} this record...`}
                    required
                  />
                </div>

                <div>
                  <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
                    Your E-Signature *
                  </label>
                  <input
                    type="text"
                    value={auditSignature}
                    onChange={(e) => setAuditSignature(e.target.value)}
                    className={getContrastClass(
                      "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
                      "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
                    )}
                    placeholder="Type your full name as electronic signature"
                    required
                  />
                </div>

                <div className={getContrastClass(
                  "bg-yellow-50 border border-yellow-200 rounded-lg p-3",
                  "bg-gray-800 border border-yellow-400 rounded-lg p-3"
                )}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={getContrastClass("text-yellow-600", "text-yellow-400")} size={16} />
                    <div>
                      <p className={getContrastClass("text-sm font-medium text-yellow-800", "text-sm font-medium text-yellow-200")}>
                        Audit Trail Notice
                      </p>
                      <p className={getContrastClass("text-xs text-yellow-700", "text-xs text-yellow-300")}>
                        This action will be permanently logged with your credentials, reason, and timestamp.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    setShowAuditModal(false);
                    setPendingAction(null);
                    setAuditReason('');
                    setAuditSignature('');
                  }}
                  className={getContrastClass(
                    "flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors",
                    "flex-1 bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 py-2 px-4 rounded-lg transition-colors"
                  )}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={!auditReason.trim() || !auditSignature.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    auditAction === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
                  } text-white disabled:cursor-not-allowed`}
                >
                  <UserCheck size={16} />
                  Authorize {auditAction.charAt(0).toUpperCase() + auditAction.slice(1)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingDonation && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-80 p-4 overflow-y-auto">
            <div className={getContrastClass(
              "bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto",
              "bg-gray-900 border border-yellow-400 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            )}>
              <div className={getContrastClass(
                "bg-green-50 border-b p-4 sticky top-0",
                "bg-gray-800 border-b border-gray-700 p-4 sticky top-0"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Edit3 className={getContrastClass("text-green-600", "text-green-400")} size={24} />
                    <div>
                      <h2 className={getContrastClass("text-lg font-semibold text-gray-900", "text-lg font-semibold text-yellow-400")}>
                        Edit Donation Record
                      </h2>
                      <p className={getContrastClass("text-sm text-gray-600", "text-sm text-yellow-200")}>
                        {editingDonation.referenceNumber} - Changes will be audited
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingDonation(null)}
                    className={getContrastClass(
                      "text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100",
                      "text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-gray-700"
                    )}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <EditDonationForm 
                  donation={editingDonation}
                  onSave={saveEditedDonation}
                  onCancel={() => setEditingDonation(null)}
                  getContrastClass={getContrastClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Viewing Modal */}
        {viewingImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-90 p-4">
            <div className="relative max-w-full max-h-full">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-yellow-400 text-2xl bg-black/50 rounded-full w-8 h-8 flex items-center justify-center"
                title="Close image viewer"
              >
                ✕
              </button>
              <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-4xl max-h-[90vh]">
                <div className="bg-gray-100 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {viewingImage.type === 'receipt' ? (
                        <Receipt size={16} className="text-blue-600" />
                      ) : (
                        <Camera size={16} className="text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {viewingImage.type === 'receipt' ? 'Transaction Receipt' : 'Photo Evidence'}: {viewingImage.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = viewingImage.src;
                        link.download = viewingImage.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                      title="Download image"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-[80vh] overflow-auto">
                  {viewingImage.src.startsWith('data:image/') ? (
                    <img
                      src={viewingImage.src}
                      alt={viewingImage.name}
                      className="max-w-full max-h-full object-contain mx-auto block"
                      style={{ maxHeight: '70vh' }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                      <p className="text-gray-600 mb-2">Unable to display file</p>
                      <p className="text-sm text-gray-500">
                        File format may not be supported or the file may be corrupted.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    );
  } catch (renderError) {
    console.error('Error rendering Finance Dashboard:', renderError);
    handleError(renderError, 'Failed to render Finance Dashboard');
    return null; // This will show the error UI
  }
}

// Edit Donation Form Component
function EditDonationForm({ donation, onSave, onCancel, getContrastClass }) {
  const [editedDonation, setEditedDonation] = useState({ ...donation });

  const handleChange = (field: string, value: any) => {
    setEditedDonation(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editedDonation.parentName.trim() || !editedDonation.studentName.trim()) {
      alert('Parent/Guardian name and Student name are required.');
      return;
    }
    onSave(editedDonation);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Parent/Guardian Name *
          </label>
          <input
            type="text"
            value={editedDonation.parentName}
            onChange={(e) => handleChange('parentName', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
            required
          />
        </div>

        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Student Name *
          </label>
          <input
            type="text"
            value={editedDonation.studentName}
            onChange={(e) => handleChange('studentName', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
            required
          />
        </div>

        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Donation Mode
          </label>
          <select
            value={editedDonation.donationMode}
            onChange={(e) => handleChange('donationMode', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
          >
            <option value="ewallet">E-wallet</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="inkind">In-kind</option>
          </select>
        </div>

        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Amount {editedDonation.donationMode !== 'inkind' ? '*' : ''}
          </label>
          <input
            type="number"
            value={editedDonation.amount || ''}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
            disabled={editedDonation.donationMode === 'inkind'}
          />
        </div>

        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Transaction Date
          </label>
          <input
            type="date"
            value={editedDonation.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
          />
        </div>

        <div>
          <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
            Transaction Time
          </label>
          <input
            type="time"
            value={editedDonation.time || ''}
            onChange={(e) => handleChange('time', e.target.value)}
            className={getContrastClass(
              "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
              "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
            )}
          />
        </div>

        {editedDonation.donationMode === 'cash' && (
          <div>
            <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
              Handed To
            </label>
            <input
              type="text"
              value={editedDonation.handedTo || ''}
              onChange={(e) => handleChange('handedTo', e.target.value)}
              className={getContrastClass(
                "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
                "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
              )}
            />
          </div>
        )}

        {editedDonation.donationMode === 'inkind' && (
          <div className="md:col-span-2">
            <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-200 mb-2")}>
              Items Description
            </label>
            <textarea
              value={editedDonation.items || ''}
              onChange={(e) => handleChange('items', e.target.value)}
              className={getContrastClass(
                "w-full p-3 border border-gray-300 rounded-lg text-gray-900",
                "w-full p-3 border border-gray-600 bg-gray-800 rounded-lg text-yellow-200"
              )}
              rows={3}
            />
          </div>
        )}
      </div>

      <div className={getContrastClass(
        "bg-blue-50 border border-blue-200 rounded-lg p-3",
        "bg-gray-800 border border-yellow-400 rounded-lg p-3"
      )}>
        <p className={getContrastClass("text-sm text-blue-800", "text-sm text-yellow-200")}>
          <strong>Note:</strong> File uploads (receipts/photos) cannot be edited through this interface. 
          Original files remain attached to this record.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className={getContrastClass(
            "flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors",
            "flex-1 bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 py-3 px-4 rounded-lg transition-colors"
          )}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
}