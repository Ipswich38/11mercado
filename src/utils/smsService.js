// SMS Service for attendance notifications
// Integrates with Philippine SMS providers (Globe Labs, Semaphore, etc.)

// SMS Configuration
const SMS_CONFIG = {
  // Option 1: Semaphore (Most reliable for PH)
  semaphore: {
    apiUrl: 'https://semaphore.co/api/v4/messages',
    apiKey: import.meta.env?.VITE_SEMAPHORE_API_KEY || process.env.REACT_APP_SEMAPHORE_API_KEY || '',
    senderName: import.meta.env?.VITE_SMS_SENDER_NAME || process.env.REACT_APP_SMS_SENDER_NAME || '11Mercado PTA'
  },
  
  // Option 2: Globe Labs (Direct Globe integration)
  globeLabs: {
    apiUrl: 'https://devapi.globelabs.com.ph/sms/v1/outbound',
    accessToken: import.meta.env?.VITE_GLOBE_ACCESS_TOKEN || process.env.REACT_APP_GLOBE_ACCESS_TOKEN || ''
  },
  
  // Your Globe number (for sender ID)
  globeNumber: import.meta.env?.VITE_GLOBE_SENDER_NUMBER || process.env.REACT_APP_GLOBE_SENDER_NUMBER || ''
};

/**
 * Send SMS using Semaphore API
 */
export const sendSMSViaSemaphore = async (phoneNumber, message) => {
  try {
    console.log('📱 Sending SMS via Semaphore to:', phoneNumber);
    
    if (!SMS_CONFIG.semaphore.apiKey) {
      throw new Error('Semaphore API key not configured');
    }
    
    const response = await fetch(SMS_CONFIG.semaphore.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SMS_CONFIG.semaphore.apiKey
      },
      body: JSON.stringify({
        message: message,
        number: phoneNumber,
        sendername: SMS_CONFIG.semaphore.senderName
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS sent successfully via Semaphore:', result);
      return { success: true, provider: 'semaphore', data: result };
    } else {
      console.error('❌ Semaphore SMS failed:', result);
      return { success: false, provider: 'semaphore', error: result };
    }
  } catch (error) {
    console.error('❌ Semaphore SMS error:', error);
    return { success: false, provider: 'semaphore', error: error.message };
  }
};

/**
 * Send SMS using Globe Labs API
 */
export const sendSMSViaGlobeLabs = async (phoneNumber, message) => {
  try {
    console.log('📱 Sending SMS via Globe Labs to:', phoneNumber);
    
    // Get access token for this specific phone number from database
    const { getAccessTokenForNumber } = await import('./globeWebhook.js');
    const accessToken = await getAccessTokenForNumber(phoneNumber);
    
    if (!accessToken) {
      console.log('⚠️ No active subscription found for:', phoneNumber);
      return { 
        success: false, 
        provider: 'globe-labs', 
        error: 'Parent has not subscribed to SMS notifications yet. They need to text the keyword to subscribe.' 
      };
    }
    
    // Globe Labs SMS API endpoint with access token as query parameter
    const apiUrl = `https://devapi.globelabs.com.ph/sms/v1/outbound/messages?access_token=${accessToken}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          clientCorrelator: Date.now().toString(),
          senderAddress: "21581234", // Globe Labs sender address
          outboundSMSTextMessage: {
            message: message
          },
          address: phoneNumber
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS sent successfully via Globe Labs:', result);
      return { success: true, provider: 'globe-labs', data: result };
    } else {
      console.error('❌ Globe Labs SMS failed:', result);
      return { success: false, provider: 'globe-labs', error: result };
    }
  } catch (error) {
    console.error('❌ Globe Labs SMS error:', error);
    return { success: false, provider: 'globe-labs', error: error.message };
  }
};

/**
 * Send SMS with automatic fallback between providers
 */
export const sendSMS = async (phoneNumber, message, preferredProvider = 'semaphore') => {
  try {
    // Validate phone number format (Philippine mobile numbers)
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone.match(/^(\+63|63|09)\d{9}$/)) {
      return { 
        success: false, 
        error: 'Invalid Philippine phone number format. Use +639XXXXXXXXX, 639XXXXXXXXX, or 09XXXXXXXXX' 
      };
    }
    
    // Convert to standard format (+639XXXXXXXXX)
    let standardPhone = cleanPhone;
    if (standardPhone.startsWith('09')) {
      standardPhone = '+63' + standardPhone.substring(1);
    } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
      standardPhone = '+' + standardPhone;
    }
    
    console.log('📱 Sending SMS to:', standardPhone);
    console.log('💬 Message:', message);
    
    // Try preferred provider first
    let result;
    if (preferredProvider === 'globe-labs') {
      result = await sendSMSViaGlobeLabs(standardPhone, message);
    } else {
      result = await sendSMSViaSemaphore(standardPhone, message);
    }
    
    // If primary provider fails, try fallback
    if (!result.success) {
      console.log('⚠️ Primary SMS provider failed, trying fallback...');
      
      if (preferredProvider === 'globe-labs') {
        result = await sendSMSViaSemaphore(standardPhone, message);
      } else {
        result = await sendSMSViaGlobeLabs(standardPhone, message);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ SMS service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send attendance notification SMS
 */
export const sendAttendanceNotification = async (studentName, status, parentPhone, reason = '') => {
  try {
    if (!parentPhone) {
      console.log('⚠️ No parent phone number provided for:', studentName);
      return { success: false, error: 'No parent phone number' };
    }
    
    const currentDate = new Date().toLocaleDateString('en-PH');
    const currentTime = new Date().toLocaleTimeString('en-PH');
    
    let message = '';
    
    if (status === 'present') {
      message = `11Mercado PTA Alert: ${studentName} marked PRESENT today (${currentDate} at ${currentTime}). Safe learning environment confirmed. ✅`;
    } else if (status === 'absent') {
      const reasonText = reason ? ` Reason: ${reason}` : '';
      message = `11Mercado PTA Alert: ${studentName} marked ABSENT today (${currentDate} at ${currentTime}).${reasonText} Please ensure student safety. ⚠️`;
    } else if (status === 'late') {
      message = `11Mercado PTA Alert: ${studentName} marked LATE today (${currentDate} at ${currentTime}). Student has arrived safely. 🕐`;
    }
    
    if (!message) {
      return { success: false, error: 'Invalid attendance status' };
    }
    
    // Send SMS using your Globe unlimited plan via preferred provider
    const result = await sendSMS(parentPhone, message, 'semaphore');
    
    if (result.success) {
      console.log(`✅ Attendance notification sent for ${studentName}`);
      return { 
        success: true, 
        studentName, 
        parentPhone, 
        message,
        provider: result.provider 
      };
    } else {
      console.error(`❌ Failed to send attendance notification for ${studentName}:`, result.error);
      return { 
        success: false, 
        studentName, 
        parentPhone, 
        error: result.error 
      };
    }
    
  } catch (error) {
    console.error('❌ Attendance notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send bulk attendance notifications
 */
export const sendBulkAttendanceNotifications = async (attendanceList) => {
  try {
    console.log(`📱 Sending bulk attendance notifications for ${attendanceList.length} students...`);
    
    const results = [];
    const successCount = { present: 0, absent: 0, late: 0 };
    const failureCount = 0;
    
    // Send notifications with small delays to avoid rate limiting
    for (const attendance of attendanceList) {
      const result = await sendAttendanceNotification(
        attendance.studentName,
        attendance.status,
        attendance.parentPhone,
        attendance.reason
      );
      
      results.push(result);
      
      if (result.success) {
        successCount[attendance.status]++;
      }
      
      // Add small delay between messages (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const totalSuccess = successCount.present + successCount.absent + successCount.late;
    const totalFailures = results.length - totalSuccess;
    
    console.log(`✅ Bulk SMS completed: ${totalSuccess} sent, ${totalFailures} failed`);
    
    return {
      success: true,
      totalSent: totalSuccess,
      totalFailed: totalFailures,
      breakdown: successCount,
      results: results
    };
    
  } catch (error) {
    console.error('❌ Bulk SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test SMS configuration
 */
export const testSMSConfiguration = async (testPhone = '') => {
  try {
    const testNumber = testPhone || SMS_CONFIG.globeNumber;
    if (!testNumber) {
      return { success: false, error: 'No test phone number provided' };
    }
    
    const testMessage = `11Mercado PTA Test: SMS service is working correctly. Sent at ${new Date().toLocaleString('en-PH')}`;
    
    const result = await sendSMS(testNumber, testMessage);
    
    return {
      success: result.success,
      provider: result.provider,
      message: testMessage,
      error: result.error
    };
    
  } catch (error) {
    console.error('❌ SMS test error:', error);
    return { success: false, error: error.message };
  }
};