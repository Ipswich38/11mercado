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
  X,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import {
  getAllDonationsFromCentralDB,
  getDonationStatsFromCentralDB,
  centralizedDB,
  getAllExpensesFromCentralDB,
  getExpenseStatsFromCentralDB,
  getFinancialOverviewFromCentralDB,
  submitExpenseToCentralDB,
  updateExpenseInCentralDB,
  deleteExpenseFromCentralDB
} from '../utils/centralizedDatabase';
import SecureConfirmation from './SecureConfirmation';

export default function FinancialOfficerDashboard({ getContrastClass, onLogout, userInfo }) {
  const [donations, setDonations] = useState([]);
  const [donationStats, setDonationStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseStats, setExpenseStats] = useState(null);
  const [financialOverview, setFinancialOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // CRUD state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecureConfirm, setShowSecureConfirm] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editForm, setEditForm] = useState({
    parentName: '',
    studentName: '',
    donationMode: 'ewallet',
    amount: '',
    eSignature: '',
    allocation: { generalSPTA: 0, mercadoPTA: 0 }
  });

  // Expense CRUD state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    expenseName: '',
    category: 'office_supplies',
    amount: '',
    description: '',
    vendorName: '',
    receiptNumber: '',
    expenseDate: '',
    paymentMethod: 'cash',
    fundSource: 'general',
    notes: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      console.log('💰 Loading Finance Dashboard data...');

      const [donationsData, statsData, expensesData, expenseStatsData, overviewData] = await Promise.all([
        getAllDonationsFromCentralDB(),
        getDonationStatsFromCentralDB(),
        getAllExpensesFromCentralDB(),
        getExpenseStatsFromCentralDB(),
        getFinancialOverviewFromCentralDB()
      ]);

      // Ensure donations is always an array
      const safeDonations = Array.isArray(donationsData) ? donationsData : [];
      const safeStats = statsData || {
        totalDonations: 0,
        totalAmount: 0,
        totalGeneralSPTA: 0,
        totalMercadoPTA: 0
      };

      // Ensure expenses is always an array
      const safeExpenses = Array.isArray(expensesData) ? expensesData : [];
      const safeExpenseStats = expenseStatsData || {
        totalExpenses: 0,
        totalAmount: 0,
        approvedAmount: 0,
        pendingAmount: 0,
        generalFundExpenses: 0,
        mercadoFundExpenses: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        categoryBreakdown: {}
      };

      const safeOverview = overviewData || {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        generalFundBalance: 0,
        mercadoFundBalance: 0,
        pendingExpenses: 0,
        expenseCount: 0,
        donationCount: 0
      };

      setDonations(safeDonations);
      setDonationStats(safeStats);
      setExpenses(safeExpenses);
      setExpenseStats(safeExpenseStats);
      setFinancialOverview(safeOverview);
      setIsLoading(false);

      console.log(`✅ Finance Dashboard loaded ${safeDonations.length} donations and ${safeExpenses.length} expenses`);
      console.log(`💰 Net Balance: ₱${safeOverview.netBalance?.toLocaleString() || '0'}`);

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
      setExpenses([]);
      setExpenseStats({
        totalExpenses: 0,
        totalAmount: 0,
        approvedAmount: 0,
        pendingAmount: 0,
        generalFundExpenses: 0,
        mercadoFundExpenses: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        categoryBreakdown: {}
      });
      setFinancialOverview({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        generalFundBalance: 0,
        mercadoFundBalance: 0,
        pendingExpenses: 0,
        expenseCount: 0,
        donationCount: 0
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

  // CRUD Operations
  const handleEditDonation = (donation) => {
    setEditingDonation(donation);
    setEditForm({
      parentName: donation.parent_name || '',
      studentName: donation.student_name || '',
      donationMode: donation.donation_mode || 'ewallet',
      amount: donation.amount ? donation.amount.toString() : '',
      eSignature: donation.e_signature || '',
      allocation: donation.allocation || { generalSPTA: 0, mercadoPTA: 0 }
    });
    setShowEditModal(true);
  };

  const handleDeleteDonation = (donation) => {
    setConfirmAction({
      type: 'delete',
      donation,
      title: 'Delete Donation',
      message: `Are you sure you want to permanently delete the donation from ${donation.parent_name}? This action cannot be undone and will affect financial records.`
    });
    setShowSecureConfirm(true);
  };

  const handleUpdateDonation = () => {
    setConfirmAction({
      type: 'update',
      title: 'Update Donation',
      message: `You are about to modify financial records for ${editingDonation?.parent_name}. This will change official donation data. Please ensure all information is accurate.`
    });
    setShowSecureConfirm(true);
  };

  const executeSecureAction = async () => {
    try {
      if (confirmAction?.type === 'delete') {
        const result = await centralizedDB.deleteDonation(confirmAction.donation.reference_number);
        if (result.success) {
          alert('Donation deleted successfully');
          loadData(); // Refresh data
        } else {
          alert('Error deleting donation: ' + result.error);
        }
      } else if (confirmAction?.type === 'update') {
        const updatedData = {
          parentName: editForm.parentName,
          studentName: editForm.studentName,
          donationMode: editForm.donationMode,
          amount: editForm.amount,
          eSignature: editForm.eSignature,
          allocation: editForm.allocation
        };

        const result = await centralizedDB.updateDonation(editingDonation.reference_number, updatedData);
        if (result.success) {
          alert('Donation updated successfully');
          setShowEditModal(false);
          setEditingDonation(null);
          loadData(); // Refresh data
        } else {
          alert('Error updating donation: ' + result.error);
        }
      } else if (confirmAction?.type === 'delete_expense') {
        const result = await deleteExpenseFromCentralDB(confirmAction.expense.reference_number);
        if (result.success) {
          alert('Expense deleted successfully');
          loadData();
        } else {
          alert('Error deleting expense: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error executing secure action:', error);
      alert('An error occurred. Please try again.');
    }

    setConfirmAction(null);
    setShowSecureConfirm(false);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllocationChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setEditForm(prev => ({
      ...prev,
      allocation: {
        ...prev.allocation,
        [field]: numValue
      }
    }));
  };

  // EXPENSE CRUD FUNCTIONS
  const handleCreateExpense = () => {
    setExpenseForm({
      expenseName: '',
      category: 'office_supplies',
      amount: '',
      description: '',
      vendorName: '',
      receiptNumber: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      fundSource: 'general',
      notes: ''
    });
    setEditingExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      expenseName: expense.expense_name || '',
      category: expense.category || 'office_supplies',
      amount: expense.amount ? expense.amount.toString() : '',
      description: expense.description || '',
      vendorName: expense.vendor_name || '',
      receiptNumber: expense.receipt_number || '',
      expenseDate: expense.expense_date || '',
      paymentMethod: expense.payment_method || 'cash',
      fundSource: expense.fund_source || 'general',
      notes: expense.notes || ''
    });
    setShowEditExpenseModal(true);
  };

  const handleDeleteExpense = (expense) => {
    setConfirmAction({
      type: 'delete_expense',
      expense,
      title: 'Delete Expense',
      message: `Are you sure you want to permanently delete the expense "${expense.expense_name}"? This action cannot be undone and will affect financial records.`
    });
    setShowSecureConfirm(true);
  };

  const handleExpenseFormChange = (field, value) => {
    setExpenseForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitExpense = async () => {
    try {
      const expenseData = {
        ...expenseForm,
        expenseDate: expenseForm.expenseDate || new Date().toISOString().split('T')[0],
        createdBy: userInfo?.firstName || 'Finance Officer'
      };

      if (editingExpense) {
        const result = await updateExpenseInCentralDB(editingExpense.reference_number, expenseData);
        if (result.success) {
          alert('Expense updated successfully');
          setShowEditExpenseModal(false);
          setEditingExpense(null);
          loadData();
        } else {
          alert('Error updating expense: ' + result.error);
        }
      } else {
        const result = await submitExpenseToCentralDB(expenseData);
        if (result.success) {
          alert('Expense created successfully');
          setShowExpenseModal(false);
          loadData();
        } else {
          alert('Error creating expense: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const executeExpenseAction = async () => {
    try {
      if (confirmAction?.type === 'delete_expense') {
        const result = await deleteExpenseFromCentralDB(confirmAction.expense.reference_number);
        if (result.success) {
          alert('Expense deleted successfully');
          loadData();
        } else {
          alert('Error deleting expense: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error executing expense action:', error);
      alert('An error occurred. Please try again.');
    }

    setConfirmAction(null);
    setShowSecureConfirm(false);
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
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Financial Overview', icon: '📊' },
            { id: 'donations', label: 'Donations', icon: '💰' },
            { id: 'expenses', label: 'Expenses', icon: '🧾' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={getContrastClass(
                `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/60 text-slate-600 hover:bg-white/80'
                }`,
                `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-gray-800 text-yellow-400 border border-yellow-400/50 hover:bg-gray-700'
                }`
              )}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  Total Income
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{financialOverview?.totalIncome?.toLocaleString() || '0'}
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
                  Total Expenses
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-red-500")}>
                  ₱{financialOverview?.totalExpenses?.toLocaleString() || '0'}
                </p>
              </div>
              <Receipt className={getContrastClass("text-red-500", "text-red-400")} size={32} />
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  Net Balance
                </p>
                <p className={getContrastClass(
                  `text-2xl font-bold ${(financialOverview?.netBalance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`,
                  `text-2xl font-bold ${(financialOverview?.netBalance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`
                )}>
                  ₱{financialOverview?.netBalance?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingUp className={getContrastClass(
                (financialOverview?.netBalance || 0) >= 0 ? "text-green-500" : "text-red-500",
                (financialOverview?.netBalance || 0) >= 0 ? "text-green-400" : "text-red-400"
              )} size={32} />
            </div>
          </div>

          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
            "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className={getContrastClass("text-slate-600", "text-yellow-200")}>
                  General Fund Balance
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{financialOverview?.generalFundBalance?.toLocaleString() || '0'}
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
                  11Mercado Fund Balance
                </p>
                <p className={getContrastClass("text-2xl font-bold text-slate-900", "text-2xl font-bold text-yellow-400")}>
                  ₱{financialOverview?.mercadoFundBalance?.toLocaleString() || '0'}
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
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDonation(donation);
                          }}
                          className={getContrastClass(
                            "text-xs text-blue-600 hover:text-blue-800 p-1",
                            "text-xs text-yellow-400 hover:text-yellow-300 p-1"
                          )}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDonation(donation);
                          }}
                          className={getContrastClass(
                            "text-xs text-green-600 hover:text-green-800 p-1",
                            "text-xs text-green-400 hover:text-green-300 p-1"
                          )}
                          title="Edit Donation"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDonation(donation);
                          }}
                          className={getContrastClass(
                            "text-xs text-red-600 hover:text-red-800 p-1",
                            "text-xs text-red-400 hover:text-red-300 p-1"
                          )}
                          title="Delete Donation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {/* Edit Donation Modal */}
      {showEditModal && editingDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={getContrastClass(
            "bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto",
            "bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border-2 border-yellow-400 max-h-[90vh] overflow-y-auto"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={getContrastClass(
                "text-lg font-semibold text-slate-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Edit Donation
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDonation(null);
                }}
                className={getContrastClass(
                  "text-gray-500 hover:text-gray-700",
                  "text-gray-400 hover:text-gray-200"
                )}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  value={editForm.parentName}
                  onChange={(e) => handleEditFormChange('parentName', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  Student Name *
                </label>
                <input
                  type="text"
                  value={editForm.studentName}
                  onChange={(e) => handleEditFormChange('studentName', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  Donation Mode *
                </label>
                <select
                  value={editForm.donationMode}
                  onChange={(e) => handleEditFormChange('donationMode', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="ewallet">E-Wallet</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="inkind">In-Kind</option>
                </select>
              </div>

              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  Amount *
                </label>
                <div className="relative">
                  <span className={getContrastClass("absolute left-3 top-3 text-gray-500", "absolute left-3 top-3 text-yellow-300")}>₱</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => handleEditFormChange('amount', e.target.value)}
                    className={`w-full pl-8 p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  Allocation
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={getContrastClass("block text-xs text-gray-600 mb-1", "block text-xs text-yellow-300 mb-1")}>
                      General SPTA
                    </label>
                    <div className="relative">
                      <span className={getContrastClass("absolute left-2 top-2 text-gray-500 text-sm", "absolute left-2 top-2 text-yellow-300 text-sm")}>₱</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.allocation.generalSPTA}
                        onChange={(e) => handleAllocationChange('generalSPTA', e.target.value)}
                        className={`w-full pl-6 p-2 text-sm rounded border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={getContrastClass("block text-xs text-gray-600 mb-1", "block text-xs text-yellow-300 mb-1")}>
                      11Mercado PTA
                    </label>
                    <div className="relative">
                      <span className={getContrastClass("absolute left-2 top-2 text-gray-500 text-sm", "absolute left-2 top-2 text-yellow-300 text-sm")}>₱</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.allocation.mercadoPTA}
                        onChange={(e) => handleAllocationChange('mercadoPTA', e.target.value)}
                        className={`w-full pl-6 p-2 text-sm rounded border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className={getContrastClass("block text-sm font-medium text-gray-700 mb-2", "block text-sm font-medium text-yellow-400 mb-2")}>
                  E-Signature *
                </label>
                <input
                  type="text"
                  value={editForm.eSignature}
                  onChange={(e) => handleEditFormChange('eSignature', e.target.value)}
                  className={`w-full p-3 rounded-lg border ${getContrastClass('border-gray-300 bg-white text-gray-900', 'border-gray-600 bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500 font-cursive`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateDonation}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Update Donation
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDonation(null);
                  }}
                  className={getContrastClass(
                    "px-4 py-3 rounded-lg font-medium bg-gray-500 hover:bg-gray-600 text-white",
                    "px-4 py-3 rounded-lg font-medium bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400"
                  )}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Confirmation Modal */}
      <SecureConfirmation
        isOpen={showSecureConfirm}
        onClose={() => {
          setShowSecureConfirm(false);
          setConfirmAction(null);
        }}
        onConfirm={executeSecureAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        actionType={confirmAction?.type || 'update'}
        getContrastClass={getContrastClass}
      />
    </div>
  );
}