// Globe Labs Webhook API Route for Vercel
// Handles parent SMS subscriptions when they text the keyword

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Only POST requests are accepted.' 
    });
  }

  try {
    const webhookData = req.body;
    
    console.log('🔔 Globe Labs webhook received:', {
      timestamp: new Date().toISOString(),
      data: webhookData
    });

    // Handle subscription webhook (when parent texts keyword)
    if (webhookData.subscriber_number && webhookData.access_token) {
      console.log('📱 Processing subscription webhook');
      
      // Clean and format phone number
      const cleanPhone = webhookData.subscriber_number.replace(/\s+/g, '');
      let standardPhone = cleanPhone;
      
      if (standardPhone.startsWith('09')) {
        standardPhone = '+63' + standardPhone.substring(1);
      } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
        standardPhone = '+' + standardPhone;
      }
      
      // Extract student lastname from message (if provided)
      let studentLastname = null;
      let registrationMessage = 'Registration successful! Contact PTA to link your child.';
      
      if (webhookData.message) {
        // Expected format: "JOIN DELA CRUZ" or "JOIN DELGADO"
        const messageParts = webhookData.message.trim().toUpperCase().split(' ');
        if (messageParts.length >= 2 && messageParts[0] === 'JOIN') {
          studentLastname = messageParts.slice(1).join(' '); // Handle multi-word surnames
          registrationMessage = `Registration for ${studentLastname} family successful! PTA will link your child's attendance notifications.`;
        }
      }
      
      // Store subscription in database
      const { data, error } = await supabase
        .from('sms_subscriptions')
        .upsert({
          phone_number: standardPhone,
          access_token: webhookData.access_token,
          provider: 'globe-labs',
          status: 'active',
          subscribed_at: new Date().toISOString(),
          app_id: webhookData.app_id || '',
          webhook_data: webhookData,
          student_lastname: studentLastname
        }, {
          onConflict: 'phone_number'
        });
      
      if (error) {
        console.error('❌ Error storing subscription:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error: ' + error.message
        });
      }
      
      console.log('✅ Subscription stored successfully for:', standardPhone);
      
      // Send welcome SMS
      try {
        const welcomeMessage = `Welcome to 11Mercado PTA! 🏫 You'll receive attendance alerts for your child. Text STOP anytime to unsubscribe. Thank you!`;
        
        const smsResponse = await fetch(`https://devapi.globelabs.com.ph/sms/v1/outbound/messages?access_token=${webhookData.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            outboundSMSMessageRequest: {
              clientCorrelator: Date.now().toString(),
              senderAddress: "21666946",
              outboundSMSTextMessage: {
                message: welcomeMessage
              },
              address: standardPhone
            }
          })
        });
        
        if (smsResponse.ok) {
          console.log('✅ Welcome SMS sent to:', standardPhone);
        }
      } catch (smsError) {
        console.error('⚠️ Welcome SMS failed:', smsError);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Subscription processed successfully',
        phoneNumber: standardPhone
      });
    }
    
    // Handle unsubscribe (when parent texts STOP)
    else if (webhookData.subscriber_number && 
             webhookData.message && 
             webhookData.message.toLowerCase().includes('stop')) {
      
      console.log('🛑 Processing unsubscribe webhook');
      
      const cleanPhone = webhookData.subscriber_number.replace(/\s+/g, '');
      let standardPhone = cleanPhone;
      
      if (standardPhone.startsWith('09')) {
        standardPhone = '+63' + standardPhone.substring(1);
      } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
        standardPhone = '+' + standardPhone;
      }
      
      // Update subscription status
      const { error } = await supabase
        .from('sms_subscriptions')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString()
        })
        .eq('phone_number', standardPhone);
      
      if (error) {
        console.error('❌ Error updating unsubscribe:', error);
        return res.status(500).json({
          success: false,
          error: 'Database error: ' + error.message
        });
      }
      
      console.log('✅ Unsubscription processed for:', standardPhone);
      
      return res.status(200).json({
        success: true,
        message: 'Unsubscription processed',
        phoneNumber: standardPhone
      });
    }
    
    // Unknown webhook type
    else {
      console.log('⚠️ Unknown webhook type received:', webhookData);
      return res.status(200).json({
        success: true,
        message: 'Webhook received but not processed',
        data: webhookData
      });
    }

  } catch (error) {
    console.error('❌ Globe webhook handler error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}