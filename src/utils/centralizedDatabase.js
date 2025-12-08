import { supabase } from './supabaseClient';
import { loadAccurateDonationData } from './csvDataLoader';

// Centralized Donation Management System
// This replaces localStorage with a proper centralized database

class CentralizedDatabase {
  constructor() {
    try {
      this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      
      try {
        this.pendingSync = typeof localStorage !== 'undefined' 
          ? JSON.parse(localStorage.getItem('pendingSyncData') || '[]')
          : [];
      } catch (e) {
        console.warn('Error reading localStorage:', e);
        this.pendingSync = [];
      }
      
      // Listen for online/offline status (only in browser)
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
          this.isOnline = true;
          this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
          this.isOnline = false;
        });
      }
    } catch (error) {
      console.error('Error initializing CentralizedDatabase:', error);
      this.isOnline = true; // Default to online
      this.pendingSync = [];
    }
  }

  // Upload image to Supabase Storage
  async uploadDonationImage(referenceNumber, imageFile, imageType = 'receipt') {
    try {
      if (!imageFile) return null;

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${referenceNumber}_${imageType}.${fileExt}`;
      const filePath = `donations/${fileName}`;

      const { data, error } = await supabase.storage
        .from('donation-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('donation-images')
        .getPublicUrl(filePath);

      console.log(`✅ Image uploaded: ${fileName}`);
      return {
        path: filePath,
        url: urlData.publicUrl,
        filename: fileName
      };
    } catch (error) {
      console.error('Error in uploadDonationImage:', error);
      return null;
    }
  }

  // Check for duplicate receipt submissions
  async checkForDuplicateReceipt(attachmentFile, parentName) {
    try {
      if (!attachmentFile) return { isDuplicate: false };

      // Create a simple hash of the image data for comparison
      const imageHash = btoa(attachmentFile.slice(0, 1000)); // Hash first 1000 chars
      
      if (this.isOnline) {
        // Check database for similar receipts
        const { data, error } = await supabase
          .from('donations')
          .select('reference_number, parent_name, attachment_file, created_at')
          .not('attachment_file', 'is', null);

        if (error) {
          console.warn('Could not check for duplicates:', error);
          return { isDuplicate: false };
        }

        // Check for exact or similar matches
        for (const existingDonation of data || []) {
          if (existingDonation.attachment_file) {
            const existingHash = btoa(existingDonation.attachment_file.slice(0, 1000));
            
            // Check if hashes are very similar (90% match)
            const similarity = this.calculateStringSimilarity(imageHash, existingHash);
            
            if (similarity > 0.9) {
              return {
                isDuplicate: true,
                duplicateInfo: {
                  referenceNumber: existingDonation.reference_number,
                  parentName: existingDonation.parent_name,
                  submissionDate: existingDonation.created_at,
                  similarity: similarity
                }
              };
            }
          }
        }
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking for duplicate receipt:', error);
      return { isDuplicate: false };
    }
  }

  // Calculate string similarity for duplicate detection
  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    // Simple character match percentage
    let matches = 0;
    const minLen = Math.min(len1, len2);
    
    for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    return matches / maxLen;
  }

  // Submit donation to centralized database
  async submitDonation(donationData) {
    try {
      // Check for duplicate receipt first
      if (donationData.attachmentFile) {
        console.log('🔍 Checking for duplicate receipt...');
        const duplicateCheck = await this.checkForDuplicateReceipt(
          donationData.attachmentFile, 
          donationData.parentName
        );
        
        if (duplicateCheck.isDuplicate) {
          const dupInfo = duplicateCheck.duplicateInfo;
          console.error('🚫 DUPLICATE RECEIPT DETECTED:', dupInfo);
          
          return {
            success: false,
            error: 'duplicate_receipt',
            duplicateInfo: dupInfo,
            message: `⚠️ DUPLICATE RECEIPT DETECTED!\n\nThis receipt was already submitted by "${dupInfo.parentName}" on ${new Date(dupInfo.submissionDate).toLocaleDateString()}.\n\nReference: ${dupInfo.referenceNumber}\nSimilarity: ${(dupInfo.similarity * 100).toFixed(1)}%\n\nIf this is an error, please contact the Treasurer for assistance.`
          };
        }
      }

      // Handle image uploads first
      let receiptImageUrl = null;
      let receiptImagePath = null;
      
      if (donationData.attachmentFile && donationData.attachmentFile.startsWith('data:image/')) {
        // Convert base64 to file if needed
        try {
          const base64Response = await fetch(donationData.attachmentFile);
          const blob = await base64Response.blob();
          const file = new File([blob], donationData.attachmentFilename || 'receipt.jpg', { type: blob.type });
          
          const imageData = await this.uploadDonationImage(donationData.referenceNumber, file, 'receipt');
          if (imageData) {
            receiptImageUrl = imageData.url;
            receiptImagePath = imageData.path;
          }
        } catch (uploadError) {
          console.warn('Failed to upload image, storing as base64 fallback:', uploadError);
        }
      }

      const donation = {
        reference_number: donationData.referenceNumber,
        parent_name: donationData.parentName,
        student_name: donationData.studentName,
        donation_mode: donationData.donationMode,
        amount: parseFloat(donationData.amount) || null,
        e_signature: donationData.eSignature,
        submission_date: donationData.submissionDate,
        submission_time: donationData.submissionTime,
        submission_timestamp: donationData.submissionTimestamp,
        allocation: donationData.allocation || {},
        attachment_file: donationData.attachmentFile || null, // Base64 attachment data
        attachment_filename: donationData.attachmentFilename || null,
        has_receipt: !!(donationData.attachmentFile || receiptImageUrl),
        has_photo: false, // Can be expanded later
        created_at: new Date().toISOString()
      };
      
      // Note: attachment_url and attachment_path columns don't exist in current schema
      // For now, we'll store attachments as base64 in attachment_file
      if (receiptImageUrl) {
        console.log(`📎 Image uploaded to Supabase storage: ${receiptImageUrl}`);
        // Future: Add these columns to schema if needed
        // donation.attachment_url = receiptImageUrl;
        // donation.attachment_path = receiptImagePath;
      }

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donations')
          .insert([donation])
          .select();

        if (error) {
          console.error('🚨 SUPABASE ERROR DETAILS:');
          console.error('Raw error object:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
          console.error('Error hint:', error.hint);
          console.error('Full error JSON:', JSON.stringify(error, null, 2));
          console.error('📊 Data being submitted:', JSON.stringify(donation, null, 2));
          
          // Check for specific common errors
          if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            console.error('❌ COLUMN ERROR: Database schema mismatch detected');
          }
          if (error.message?.includes('timeout') || error.message?.includes('network')) {
            console.error('🌐 NETWORK ERROR: Connection or timeout issue');
          }
          if (error.message?.includes('payload') || error.message?.includes('size')) {
            console.error('📦 SIZE ERROR: Data payload too large');
          }
          
          // Store for later sync if database fails
          this.addToPendingSync('donation', donation);
          return { success: false, error: error.message, errorCode: error.code };
        }

        console.log('Donation submitted to centralized database:', data);
        
        // Also keep in localStorage as cache
        this.updateLocalCache('donations', data[0]);
        
        return { success: true, data: data[0] };
      } else {
        // Store for later sync when online
        this.addToPendingSync('donation', donation);
        this.updateLocalCache('donations', donation);
        return { success: true, data: donation, offline: true };
      }
    } catch (error) {
      console.error('Error submitting donation:', error);
      // Fallback to localStorage
      this.addToPendingSync('donation', donationData);
      this.updateLocalCache('donations', donationData);
      return { success: false, error: error.message };
    }
  }

  // Get all donations from centralized database
  async getAllDonations() {
    try {
      // First priority: Use accurate CSV data as source of truth
      console.log('🔄 CentralizedDB: Attempting to load accurate CSV data...');
      
      const csvDonations = await loadAccurateDonationData();
      if (csvDonations && csvDonations.length > 0) {
        console.log('✅ CentralizedDB: Using accurate CSV data as source of truth');
        return csvDonations;
      }
      
      // Second priority: Supabase data
      console.log('⚠️ CentralizedDB: CSV data not available, falling back to Supabase...');
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching donations from Supabase:', error);
          // Fallback to localStorage
          try {
            return typeof localStorage !== 'undefined' 
              ? JSON.parse(localStorage.getItem('donationEntries') || '[]')
              : [];
          } catch (e) {
            console.error('Error reading localStorage fallback:', e);
            return [];
          }
        }

        // Update local cache
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('donationEntries', JSON.stringify(data || []));
          }
        } catch (e) {
          console.warn('Cannot update localStorage cache:', e);
        }
        
        return data || [];
      } else {
        // Return cached data when offline
        try {
          return typeof localStorage !== 'undefined' 
            ? JSON.parse(localStorage.getItem('donationEntries') || '[]')
            : [];
        } catch (e) {
          console.error('Error reading offline cache:', e);
          return [];
        }
      }
    } catch (error) {
      console.error('Error getting donations:', error);
      try {
        return typeof localStorage !== 'undefined' 
          ? JSON.parse(localStorage.getItem('donationEntries') || '[]')
          : [];
      } catch (e) {
        console.error('Error reading localStorage in catch:', e);
        return [];
      }
    }
  }

  // Get donation by reference number
  async getDonationByReference(referenceNumber) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('reference_number', referenceNumber)
          .single();

        if (error) {
          console.error('Error fetching donation from Supabase:', error);
          // Fallback to localStorage
          const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
          return localDonations.find(d => d.referenceNumber === referenceNumber || d.reference_number === referenceNumber);
        }

        return data;
      } else {
        // Return from local cache when offline
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        return localDonations.find(d => d.referenceNumber === referenceNumber || d.reference_number === referenceNumber);
      }
    } catch (error) {
      console.error('Error getting donation by reference:', error);
      // Fallback to localStorage
      try {
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        return localDonations.find(d => d.referenceNumber === referenceNumber || d.reference_number === referenceNumber);
      } catch (e) {
        console.error('Error reading localStorage in getDonationByReference:', e);
        return null;
      }
    }
  }

  // Update donation
  async updateDonation(referenceNumber, updatedData) {
    try {
      const updatePayload = {
        parent_name: updatedData.parentName,
        student_name: updatedData.studentName,
        donation_mode: updatedData.donationMode,
        amount: updatedData.amount,
        e_signature: updatedData.eSignature,
        allocation: updatedData.allocation || {},
        attachment_file: updatedData.attachmentFile || null,
        attachment_filename: updatedData.attachmentFilename || null,
        has_receipt: !!updatedData.receipt,
        has_photo: !!updatedData.photo,
        updated_at: new Date().toISOString()
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donations')
          .update(updatePayload)
          .eq('reference_number', referenceNumber)
          .select();

        if (error) {
          console.error('Error updating donation in Supabase:', error);
          return { success: false, error: error.message };
        }

        // Update local cache
        this.updateLocalCache('donations', data[0]);
        return { success: true, data: data[0] };
      } else {
        // Store for later sync when online
        this.addToPendingSync('update_donation', { referenceNumber, data: updatePayload });
        
        // Update local cache
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        const index = localDonations.findIndex(d => d.referenceNumber === referenceNumber || d.reference_number === referenceNumber);
        if (index !== -1) {
          localDonations[index] = { ...localDonations[index], ...updatePayload };
          localStorage.setItem('donationEntries', JSON.stringify(localDonations));
        }
        
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete donation
  async deleteDonation(referenceNumber) {
    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from('donations')
          .delete()
          .eq('reference_number', referenceNumber);

        if (error) {
          console.error('Error deleting donation from Supabase:', error);
          return { success: false, error: error.message };
        }

        // Remove from local cache
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        const filteredDonations = localDonations.filter(d => 
          d.referenceNumber !== referenceNumber && d.reference_number !== referenceNumber
        );
        localStorage.setItem('donationEntries', JSON.stringify(filteredDonations));
        
        return { success: true };
      } else {
        // Store for later sync when online
        this.addToPendingSync('delete_donation', { referenceNumber });
        
        // Remove from local cache
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        const filteredDonations = localDonations.filter(d => 
          d.referenceNumber !== referenceNumber && d.reference_number !== referenceNumber
        );
        localStorage.setItem('donationEntries', JSON.stringify(filteredDonations));
        
        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get donation statistics
  async getDonationStats() {
    try {
      const donations = await this.getAllDonations();
      
      const stats = {
        totalDonations: donations.length,
        totalAmount: donations.reduce((sum, d) => {
          try {
            let amount = d?.amount;
            if (typeof amount === 'string') {
              amount = parseFloat(amount);
            } else if (typeof amount === 'number') {
              amount = amount;
            } else {
              amount = 0;
            }
            
            if (isNaN(amount) || !isFinite(amount)) {
              console.warn(`Invalid amount in stats calculation:`, d?.reference_number, amount);
              return sum;
            }
            
            return sum + amount;
          } catch (e) {
            console.warn(`Error in stats amount calculation:`, d?.reference_number, e);
            return sum;
          }
        }, 0),
        totalGeneralSPTA: donations.reduce((sum, d) => {
          const allocation = d.allocation || {};
          const amount = parseFloat(d?.amount) || 0;
          const allocationAmount = allocation.generalSPTA || allocation.general_spta || 0;
          
          // If donation amount is negative, make allocation negative too
          if (amount < 0 && allocationAmount > 0) {
            return sum - allocationAmount;
          }
          return sum + allocationAmount;
        }, 0),
        totalMercadoPTA: donations.reduce((sum, d) => {
          const allocation = d.allocation || {};
          const amount = parseFloat(d?.amount) || 0;
          const allocationAmount = allocation.mercadoPTA || allocation.mercado_pta || 0;
          
          // If donation amount is negative, make allocation negative too
          if (amount < 0 && allocationAmount > 0) {
            return sum - allocationAmount;
          }
          return sum + allocationAmount;
        }, 0),
        donationModes: {
          cash: donations.filter(d => d.donation_mode === 'cash').length,
          ewallet: donations.filter(d => d.donation_mode === 'e-wallet').length,
          inkind: donations.filter(d => d.donation_mode === 'in-kind').length
        },
        recentDonations: donations.slice(0, 10)
      };

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalDonations: 0,
        totalAmount: 0,
        totalGeneralSPTA: 0,
        totalMercadoPTA: 0,
        donationModes: { cash: 0, ewallet: 0, inkind: 0 },
        recentDonations: []
      };
    }
  }

  // Submit donation drive
  async submitDonationDrive(driveData) {
    try {
      const drive = {
        title: driveData.title,
        description: driveData.description,
        target_amount: parseFloat(driveData.targetAmount) || 0,
        current_amount: parseFloat(driveData.currentAmount) || 0,
        status: driveData.status || 'active',
        created_at: new Date().toISOString()
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donation_drives')
          .insert([drive])
          .select();

        if (error) {
          console.error('Error submitting drive:', error);
          this.addToPendingSync('drive', drive);
          return { success: false, error: error.message };
        }

        this.updateLocalCache('drives', data[0]);
        return { success: true, data: data[0] };
      } else {
        this.addToPendingSync('drive', drive);
        this.updateLocalCache('drives', drive);
        return { success: true, data: drive, offline: true };
      }
    } catch (error) {
      console.error('Error submitting drive:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all donation drives
  async getAllDonationDrives() {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donation_drives')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching drives:', error);
          return JSON.parse(localStorage.getItem('donationDrives') || '[]');
        }

        localStorage.setItem('donationDrives', JSON.stringify(data));
        return data;
      } else {
        return JSON.parse(localStorage.getItem('donationDrives') || '[]');
      }
    } catch (error) {
      console.error('Error getting drives:', error);
      return JSON.parse(localStorage.getItem('donationDrives') || '[]');
    }
  }

  // Search donations
  async searchDonations(searchTerm) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .or(`parent_name.ilike.%${searchTerm}%,student_name.ilike.%${searchTerm}%,reference_number.ilike.%${searchTerm}%,e_signature.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error searching donations:', error);
          // Fallback to local search
          const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
          return localDonations.filter(d => 
            d.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.eSignature?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        return data;
      } else {
        // Local search when offline
        const localDonations = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        return localDonations.filter(d => 
          d.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.eSignature?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }

  // Log admin activity
  async logAdminActivity(activityData) {
    try {
      const activity = {
        admin_name: activityData.adminName,
        ip_address: activityData.ipAddress,
        login_timestamp: activityData.loginTimestamp,
        last_activity: new Date().toISOString(),
        session_data: activityData.sessionData || {}
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('admin_sessions')
          .insert([activity])
          .select();

        if (error) {
          console.error('Error logging activity:', error);
          return { success: false, error: error.message };
        }

        return { success: true, data: data[0] };
      }
      
      return { success: true, offline: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync pending data when back online
  async syncPendingData() {
    if (!this.isOnline || this.pendingSync.length === 0) return;

    console.log(`Syncing ${this.pendingSync.length} pending items...`);

    for (const item of this.pendingSync) {
      try {
        if (item.type === 'donation') {
          await supabase.from('donations').insert([item.data]);
        } else if (item.type === 'drive') {
          await supabase.from('donation_drives').insert([item.data]);
        } else if (item.type === 'expense') {
          await supabase.from('expenses').insert([item.data]);
        } else if (item.type === 'update_expense') {
          await supabase.from('expenses').update(item.data.data).eq('reference_number', item.data.referenceNumber);
        } else if (item.type === 'delete_expense') {
          await supabase.from('expenses').delete().eq('reference_number', item.data.referenceNumber);
        }
      } catch (error) {
        console.error('Error syncing item:', error);
        continue; // Skip failed items but continue syncing others
      }
    }

    // Clear pending sync after successful sync
    this.pendingSync = [];
    localStorage.removeItem('pendingSyncData');
    console.log('Pending data sync completed');
  }

  // Helper methods
  addToPendingSync(type, data) {
    this.pendingSync.push({ type, data, timestamp: new Date().toISOString() });
    localStorage.setItem('pendingSyncData', JSON.stringify(this.pendingSync));
  }

  updateLocalCache(type, data) {
    try {
      if (type === 'donations') {
        const existing = JSON.parse(localStorage.getItem('donationEntries') || '[]');
        existing.push(data);
        localStorage.setItem('donationEntries', JSON.stringify(existing));
      } else if (type === 'drives') {
        const existing = JSON.parse(localStorage.getItem('donationDrives') || '[]');
        existing.push(data);
        localStorage.setItem('donationDrives', JSON.stringify(existing));
      } else if (type === 'expenses') {
        const existing = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        existing.push(data);
        localStorage.setItem('expenseEntries', JSON.stringify(existing));
      }
    } catch (error) {
      console.error('Error updating local cache:', error);
    }
  }

  // Force sync all data from database
  async forceSyncFromDatabase() {
    try {
      if (!this.isOnline) {
        throw new Error('Cannot sync while offline');
      }

      console.log('Force syncing all data from database...');

      // Get all donations
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;

      // Get all drives
      const { data: drives, error: drivesError } = await supabase
        .from('donation_drives')
        .select('*')
        .order('created_at', { ascending: false });

      if (drivesError) throw drivesError;

      // Get all expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Update local cache
      localStorage.setItem('donationEntries', JSON.stringify(donations || []));
      localStorage.setItem('donationDrives', JSON.stringify(drives || []));
      localStorage.setItem('expenseEntries', JSON.stringify(expenses || []));

      // Trigger UI update
      window.dispatchEvent(new CustomEvent('centralizedDataSync', {
        detail: {
          donations: donations || [],
          drives: drives || [],
          expenses: expenses || []
        }
      }));

      console.log(`Synced ${donations?.length || 0} donations, ${drives?.length || 0} drives, and ${expenses?.length || 0} expenses from database`);
      return {
        success: true,
        donations: donations || [],
        drives: drives || [],
        expenses: expenses || []
      };
    } catch (error) {
      console.error('Force sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  // EXPENSE MANAGEMENT METHODS

  // Generate expense reference number
  generateExpenseReference() {
    const timestamp = Date.now();
    return `EXP-${timestamp}`;
  }

  // Submit expense to centralized database
  async submitExpense(expenseData) {
    try {
      const expense = {
        reference_number: expenseData.referenceNumber || this.generateExpenseReference(),
        expense_name: expenseData.expenseName,
        category: expenseData.category,
        amount: parseFloat(expenseData.amount) || 0,
        description: expenseData.description || '',
        vendor_name: expenseData.vendorName || null,
        receipt_number: expenseData.receiptNumber || null,
        expense_date: expenseData.expenseDate,
        approval_status: expenseData.approvalStatus || 'pending',
        approved_by: expenseData.approvedBy || null,
        approval_date: expenseData.approvalDate || null,
        payment_method: expenseData.paymentMethod || null,
        fund_source: expenseData.fundSource || 'general',
        attachment_file: expenseData.attachmentFile || null,
        attachment_filename: expenseData.attachmentFilename || null,
        has_receipt: !!expenseData.attachmentFile,
        notes: expenseData.notes || null,
        created_by: expenseData.createdBy || 'System',
        created_at: new Date().toISOString()
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('expenses')
          .insert([expense])
          .select();

        if (error) {
          console.error('Error submitting expense:', error);
          this.addToPendingSync('expense', expense);
          return { success: false, error: error.message };
        }

        this.updateLocalCache('expenses', data[0]);
        return { success: true, data: data[0] };
      } else {
        this.addToPendingSync('expense', expense);
        this.updateLocalCache('expenses', expense);
        return { success: true, data: expense, offline: true };
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all expenses from centralized database
  async getAllExpenses() {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching expenses:', error);
          return JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        }

        localStorage.setItem('expenseEntries', JSON.stringify(data || []));
        return data || [];
      } else {
        return JSON.parse(localStorage.getItem('expenseEntries') || '[]');
      }
    } catch (error) {
      console.error('Error getting expenses:', error);
      return JSON.parse(localStorage.getItem('expenseEntries') || '[]');
    }
  }

  // Get expense by reference number
  async getExpenseByReference(referenceNumber) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('reference_number', referenceNumber)
          .single();

        if (error) {
          console.error('Error fetching expense:', error);
          const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          return localExpenses.find(e => e.reference_number === referenceNumber);
        }

        return data;
      } else {
        const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        return localExpenses.find(e => e.reference_number === referenceNumber);
      }
    } catch (error) {
      console.error('Error getting expense by reference:', error);
      return null;
    }
  }

  // Update expense
  async updateExpense(referenceNumber, updatedData) {
    try {
      const updatePayload = {
        expense_name: updatedData.expenseName,
        category: updatedData.category,
        amount: parseFloat(updatedData.amount) || 0,
        description: updatedData.description,
        vendor_name: updatedData.vendorName,
        receipt_number: updatedData.receiptNumber,
        expense_date: updatedData.expenseDate,
        approval_status: updatedData.approvalStatus,
        approved_by: updatedData.approvedBy,
        approval_date: updatedData.approvalDate,
        payment_method: updatedData.paymentMethod,
        fund_source: updatedData.fundSource,
        attachment_file: updatedData.attachmentFile,
        attachment_filename: updatedData.attachmentFilename,
        has_receipt: !!updatedData.attachmentFile,
        notes: updatedData.notes,
        updated_at: new Date().toISOString()
      };

      if (this.isOnline) {
        const { data, error } = await supabase
          .from('expenses')
          .update(updatePayload)
          .eq('reference_number', referenceNumber)
          .select();

        if (error) {
          console.error('Error updating expense:', error);
          return { success: false, error: error.message };
        }

        this.updateLocalCache('expenses', data[0]);
        return { success: true, data: data[0] };
      } else {
        this.addToPendingSync('update_expense', { referenceNumber, data: updatePayload });

        const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        const index = localExpenses.findIndex(e => e.reference_number === referenceNumber);
        if (index !== -1) {
          localExpenses[index] = { ...localExpenses[index], ...updatePayload };
          localStorage.setItem('expenseEntries', JSON.stringify(localExpenses));
        }

        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete expense
  async deleteExpense(referenceNumber) {
    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('reference_number', referenceNumber);

        if (error) {
          console.error('Error deleting expense:', error);
          return { success: false, error: error.message };
        }

        const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        const filteredExpenses = localExpenses.filter(e => e.reference_number !== referenceNumber);
        localStorage.setItem('expenseEntries', JSON.stringify(filteredExpenses));

        return { success: true };
      } else {
        this.addToPendingSync('delete_expense', { referenceNumber });

        const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        const filteredExpenses = localExpenses.filter(e => e.reference_number !== referenceNumber);
        localStorage.setItem('expenseEntries', JSON.stringify(filteredExpenses));

        return { success: true, offline: true };
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      return { success: false, error: error.message };
    }
  }

  // Get expense statistics
  async getExpenseStats() {
    try {
      const expenses = await this.getAllExpenses();

      const stats = {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        approvedAmount: expenses
          .filter(e => e.approval_status === 'approved')
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        pendingAmount: expenses
          .filter(e => e.approval_status === 'pending')
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        generalFundExpenses: expenses
          .filter(e => e.fund_source === 'general' && e.approval_status === 'approved')
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        mercadoFundExpenses: expenses
          .filter(e => e.fund_source === 'mercado' && e.approval_status === 'approved')
          .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
        approvedCount: expenses.filter(e => e.approval_status === 'approved').length,
        pendingCount: expenses.filter(e => e.approval_status === 'pending').length,
        rejectedCount: expenses.filter(e => e.approval_status === 'rejected').length,
        categoryBreakdown: expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + (parseFloat(e.amount) || 0);
          return acc;
        }, {}),
        recentExpenses: expenses.slice(0, 10)
      };

      return stats;
    } catch (error) {
      console.error('Error calculating expense stats:', error);
      return {
        totalExpenses: 0,
        totalAmount: 0,
        approvedAmount: 0,
        pendingAmount: 0,
        generalFundExpenses: 0,
        mercadoFundExpenses: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        categoryBreakdown: {},
        recentExpenses: []
      };
    }
  }

  // Get financial overview with automatic calculations
  async getFinancialOverview() {
    try {
      const donationStats = await this.getDonationStats();
      const expenseStats = await this.getExpenseStats();

      const overview = {
        totalIncome: donationStats.totalAmount,
        totalExpenses: expenseStats.approvedAmount,
        netBalance: donationStats.totalAmount - expenseStats.approvedAmount,
        generalFundBalance: donationStats.totalGeneralSPTA - expenseStats.generalFundExpenses,
        mercadoFundBalance: donationStats.totalMercadoPTA - expenseStats.mercadoFundExpenses,
        pendingExpenses: expenseStats.pendingAmount,
        expenseCount: expenseStats.totalExpenses,
        donationCount: donationStats.totalDonations,
        lastUpdated: new Date().toISOString()
      };

      return overview;
    } catch (error) {
      console.error('Error getting financial overview:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        generalFundBalance: 0,
        mercadoFundBalance: 0,
        pendingExpenses: 0,
        expenseCount: 0,
        donationCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Search expenses
  async searchExpenses(searchTerm) {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .or(`expense_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,vendor_name.ilike.%${searchTerm}%,reference_number.ilike.%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error searching expenses:', error);
          const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          return localExpenses.filter(e =>
            e.expense_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        return data;
      } else {
        const localExpenses = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        return localExpenses.filter(e =>
          e.expense_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    } catch (error) {
      console.error('Error searching expenses:', error);
      return [];
    }
  }

  // Export all data for debugging
  async exportAllData() {
    try {
      const donations = await this.getAllDonations();
      const drives = await this.getAllDonationDrives();
      const expenses = await this.getAllExpenses();
      const overview = await this.getFinancialOverview();

      const exportData = {
        donations,
        drives,
        expenses,
        financialOverview: overview,
        exportTimestamp: new Date().toISOString(),
        totalDonations: donations.length,
        totalExpenses: expenses.length,
        totalDonationAmount: donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
        totalExpenseAmount: expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pta-centralized-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return exportData;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const centralizedDB = new CentralizedDatabase();

// Helper functions for backward compatibility
export const submitDonationToCentralDB = (donationData) => centralizedDB.submitDonation(donationData);
export const getAllDonationsFromCentralDB = () => centralizedDB.getAllDonations();
export const getDonationStatsFromCentralDB = () => centralizedDB.getDonationStats();
export const searchDonationsInCentralDB = (searchTerm) => centralizedDB.searchDonations(searchTerm);
export const exportCentralDBData = () => centralizedDB.exportAllData();
export const forceSyncFromCentralDB = () => centralizedDB.forceSyncFromDatabase();

// Expense management helper functions
export const submitExpenseToCentralDB = (expenseData) => centralizedDB.submitExpense(expenseData);
export const getAllExpensesFromCentralDB = () => centralizedDB.getAllExpenses();
export const getExpenseStatsFromCentralDB = () => centralizedDB.getExpenseStats();
export const getFinancialOverviewFromCentralDB = () => centralizedDB.getFinancialOverview();
export const searchExpensesInCentralDB = (searchTerm) => centralizedDB.searchExpenses(searchTerm);
export const updateExpenseInCentralDB = (referenceNumber, updatedData) => centralizedDB.updateExpense(referenceNumber, updatedData);
export const deleteExpenseFromCentralDB = (referenceNumber) => centralizedDB.deleteExpense(referenceNumber);
export const getExpenseByReferenceFromCentralDB = (referenceNumber) => centralizedDB.getExpenseByReference(referenceNumber);