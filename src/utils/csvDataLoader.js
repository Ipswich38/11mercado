// CSV Data Loader - Source of truth for donation data
// This loader reads the accurate CSV data instead of relying on potentially inaccurate Supabase data

export const loadAccurateDonationData = async () => {
  try {
    console.log('📊 Loading accurate donation data from CSV...');
    
    // Import the CSV data from the public folder (accessible at runtime)
    const response = await fetch('/donations_2025-09-06.csv');
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const donations = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line handling quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= headers.length) {
        const donation = {
          reference_number: values[0],
          date: values[1],
          parent_name: values[2],
          student_name: values[3],
          donation_mode: values[4],
          amount: parseFloat(values[5]) || 0,
          allocation: {
            generalSPTA: parseFloat(values[6]) || 0,
            mercadoPTA: parseFloat(values[7]) || 0
          },
          e_signature: values[8],
          created_at: values[9]
        };
        donations.push(donation);
      }
    }
    
    console.log('✅ CSV data loaded successfully:', {
      totalDonations: donations.length,
      sample: donations[0]
    });
    
    return donations;
  } catch (error) {
    console.error('❌ Error loading CSV data:', error);
    return [];
  }
};

export const calculateAccurateTotals = (donations) => {
  if (!donations || !Array.isArray(donations)) {
    return {
      totalAmount: 0,
      totalGeneralSPTA: 0,
      totalMercadoPTA: 0
    };
  }
  
  const totalAmount = donations.reduce((sum, d) => {
    const amount = parseFloat(d.amount) || 0;
    return sum + amount;
  }, 0);
  
  const totalGeneralSPTA = donations.reduce((sum, d) => {
    const amount = parseFloat(d.amount) || 0;
    const allocation = d.allocation?.generalSPTA || 0;
    
    // If donation amount is negative, make allocation negative too
    if (amount < 0) {
      return sum - Math.abs(allocation); // Always subtract the absolute allocation value
    }
    return sum + allocation;
  }, 0);
  
  const totalMercadoPTA = donations.reduce((sum, d) => {
    const amount = parseFloat(d.amount) || 0;
    const allocation = d.allocation?.mercadoPTA || 0;
    
    // If donation amount is negative, make allocation negative too  
    if (amount < 0) {
      return sum - Math.abs(allocation); // Always subtract the absolute allocation value
    }
    return sum + allocation;
  }, 0);
  
  return {
    totalAmount,
    totalGeneralSPTA,
    totalMercadoPTA
  };
};