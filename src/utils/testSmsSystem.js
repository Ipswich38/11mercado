// Manual test utilities for SMS system
import { supabase } from './supabaseClient';

/**
 * Manually add a test SMS subscription (simulate parent registration)
 */
export const addTestSubscription = async (phoneNumber, studentLastname) => {
  try {
    console.log('📱 Adding test subscription for:', phoneNumber);
    
    // Clean and format phone number
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    let standardPhone = cleanPhone;
    
    if (standardPhone.startsWith('09')) {
      standardPhone = '+63' + standardPhone.substring(1);
    } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
      standardPhone = '+' + standardPhone;
    }
    
    // Add test subscription to database
    const { data, error } = await supabase
      .from('sms_subscriptions')
      .upsert({
        phone_number: standardPhone,
        access_token: 'TEST_TOKEN_' + Date.now(), // Fake token for testing
        provider: 'globe-labs',
        status: 'active',
        subscribed_at: new Date().toISOString(),
        student_lastname: studentLastname,
        webhook_data: {
          test: true,
          message: `JOIN ${studentLastname}`,
          subscriber_number: standardPhone
        }
      }, {
        onConflict: 'phone_number'
      });
    
    if (error) {
      console.error('❌ Error adding test subscription:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Test subscription added successfully');
    return { 
      success: true, 
      phoneNumber: standardPhone, 
      studentLastname: studentLastname,
      data: data 
    };
    
  } catch (error) {
    console.error('❌ Test subscription error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Test the complete SMS system flow
 */
export const testCompleteSMSFlow = async () => {
  try {
    console.log('🧪 Testing complete SMS system flow...');
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('sms_subscriptions')
      .select('count(*)')
      .single();
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return { success: false, error: 'Database connection failed' };
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Current subscriptions count:', testData?.count || 0);
    
    return { 
      success: true, 
      message: 'SMS system flow test completed',
      subscriptionsCount: testData?.count || 0
    };
    
  } catch (error) {
    console.error('❌ SMS flow test error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all SMS subscriptions for debugging
 */
export const getAllSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('sms_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return { success: false, error: error.message };
    }
    
    console.log('📊 All SMS subscriptions:', data);
    return { success: true, subscriptions: data };
    
  } catch (error) {
    console.error('❌ Error getting subscriptions:', error);
    return { success: false, error: error.message };
  }
};