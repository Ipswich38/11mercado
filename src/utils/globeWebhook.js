// Globe Labs Webhook Handler for SMS Subscriptions
// Handles incoming webhooks when parents subscribe via SMS keyword

import { supabase } from './supabaseClient';

/**
 * Handle Globe Labs subscription webhook
 * Called when a parent texts the keyword to subscribe
 */
export const handleGlobeSubscription = async (webhookData) => {
  try {
    console.log('📨 Received Globe Labs subscription webhook:', webhookData);
    
    // Extract subscription data from Globe Labs webhook
    const {
      subscriber_number,
      access_token,
      app_id,
      app_secret,
      timestamp
    } = webhookData;
    
    if (!subscriber_number || !access_token) {
      throw new Error('Invalid webhook data: missing subscriber_number or access_token');
    }
    
    // Clean and format phone number
    const cleanPhone = subscriber_number.replace(/\s+/g, '');
    let standardPhone = cleanPhone;
    
    // Convert to standard format (+639XXXXXXXXX)
    if (standardPhone.startsWith('09')) {
      standardPhone = '+63' + standardPhone.substring(1);
    } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
      standardPhone = '+' + standardPhone;
    }
    
    console.log('📱 Processing subscription for:', standardPhone);
    
    // Store access token in Supabase
    const { data, error } = await supabase
      .from('sms_subscriptions')
      .upsert({
        phone_number: standardPhone,
        access_token: access_token,
        provider: 'globe-labs',
        status: 'active',
        subscribed_at: new Date().toISOString(),
        app_id: app_id,
        webhook_data: webhookData
      }, {
        onConflict: 'phone_number'
      });
    
    if (error) {
      console.error('❌ Error storing subscription:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Subscription stored successfully for:', standardPhone);
    
    // Send welcome SMS to confirm subscription
    const welcomeResult = await sendWelcomeSMS(standardPhone, access_token);
    
    return {
      success: true,
      phoneNumber: standardPhone,
      accessToken: access_token,
      welcomeSent: welcomeResult.success
    };
    
  } catch (error) {
    console.error('❌ Globe subscription webhook error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome SMS after successful subscription
 */
const sendWelcomeSMS = async (phoneNumber, accessToken) => {
  try {
    const welcomeMessage = `Welcome to 11Mercado PTA! 🏫 You'll now receive attendance alerts for your child. Reply STOP anytime to unsubscribe. Thank you for staying connected! ✅`;
    
    const apiUrl = `https://devapi.globelabs.com.ph/sms/v1/outbound/messages?access_token=${accessToken}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          clientCorrelator: Date.now().toString(),
          senderAddress: "21581234",
          outboundSMSTextMessage: {
            message: welcomeMessage
          },
          address: phoneNumber
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Welcome SMS sent to:', phoneNumber);
      return { success: true, data: result };
    } else {
      console.error('❌ Welcome SMS failed:', result);
      return { success: false, error: result };
    }
    
  } catch (error) {
    console.error('❌ Welcome SMS error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle Globe Labs unsubscribe webhook
 * Called when a parent replies STOP
 */
export const handleGlobeUnsubscribe = async (webhookData) => {
  try {
    console.log('📨 Received Globe Labs unsubscribe webhook:', webhookData);
    
    const { subscriber_number } = webhookData;
    
    if (!subscriber_number) {
      throw new Error('Invalid unsubscribe data: missing subscriber_number');
    }
    
    // Clean phone number
    const cleanPhone = subscriber_number.replace(/\s+/g, '');
    let standardPhone = cleanPhone;
    
    if (standardPhone.startsWith('09')) {
      standardPhone = '+63' + standardPhone.substring(1);
    } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
      standardPhone = '+' + standardPhone;
    }
    
    // Update subscription status in database
    const { error } = await supabase
      .from('sms_subscriptions')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('phone_number', standardPhone);
    
    if (error) {
      console.error('❌ Error updating unsubscribe status:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Unsubscription processed for:', standardPhone);
    
    return {
      success: true,
      phoneNumber: standardPhone,
      status: 'unsubscribed'
    };
    
  } catch (error) {
    console.error('❌ Globe unsubscribe webhook error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get active access token for a phone number
 */
export const getAccessTokenForNumber = async (phoneNumber) => {
  try {
    const { data, error } = await supabase
      .from('sms_subscriptions')
      .select('access_token, status')
      .eq('phone_number', phoneNumber)
      .eq('status', 'active')
      .single();
    
    if (error || !data) {
      console.log('⚠️ No active subscription found for:', phoneNumber);
      return null;
    }
    
    return data.access_token;
    
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    return null;
  }
};

/**
 * Get all active subscriptions
 */
export const getActiveSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('sms_subscriptions')
      .select('*')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error getting subscriptions:', error);
      return [];
    }
    
    return data || [];
    
  } catch (error) {
    console.error('❌ Error fetching subscriptions:', error);
    return [];
  }
};