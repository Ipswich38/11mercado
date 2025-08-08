// Funding service to track donations
const GOOGLE_FORMS_URL = 'https://forms.gle/MDj8jhiZpMjyGZKL8';
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // To be updated with actual script URL

// Enhanced funding data that includes local donations
// In real implementation, this would connect to your Google Sheets backend
export const fetchFundingData = async () => {
  try {
    // Get local donations from localStorage
    const localDonations = JSON.parse(localStorage.getItem('11m_donations') || '[]');
    const localAmount = localDonations.reduce((sum, donation) => sum + (donation.totalAmount || 0), 0);
    
    // In a real implementation, you'd fetch from Google Sheets API
    // For now, combine mock data with local donations
    const baseAmount = generateRealisticAmount();
    const totalAmount = baseAmount + localAmount;
    
    // Create recent donations list including local ones
    const mockRecentDonations = [
      { amount: 500, donor: 'Maria Santos', time: '5 hours ago' },
      { amount: 2000, donor: 'Juan Dela Cruz', time: '1 day ago' },
      { amount: 750, donor: 'Anonymous', time: '2 days ago' },
    ];
    
    // Add recent local donations
    const recentLocalDonations = localDonations
      .slice(-2)
      .map(donation => ({
        amount: donation.totalAmount || 0,
        donor: donation.parentFirstName || 'Anonymous',
        time: getTimeAgo(new Date(donation.timestamp))
      }));
    
    const allRecentDonations = [...recentLocalDonations, ...mockRecentDonations]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 5);

    const mockData = {
      currentAmount: totalAmount,
      targetAmount: 50000,
      donorCount: Math.floor(Math.random() * 50) + 25 + localDonations.length,
      recentDonations: allRecentDonations,
      dailyGoal: 2000,
      todaysProgress: Math.floor(Math.random() * 1500) + 500,
      lastUpdated: new Date().toLocaleTimeString(),
    };

    return mockData;
  } catch (error) {
    console.error('Error fetching funding data:', error);
    return {
      currentAmount: 15000,
      targetAmount: 50000,
      donorCount: 25,
      recentDonations: [],
      dailyGoal: 2000,
      todaysProgress: 800,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }
};

const generateRealisticAmount = () => {
  // Generate amount that increases over time to simulate real fundraising
  const baseAmount = 15000;
  const randomIncrease = Math.floor(Math.random() * 10000);
  return baseAmount + randomIncrease;
};

export const getDonationLink = () => GOOGLE_FORMS_URL;

export const calculateProgress = (current, target) => {
  return Math.min((current / target) * 100, 100);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

// Export Google Sheets URL for form integration
export const getGoogleSheetsUrl = () => GOOGLE_SHEETS_URL;
