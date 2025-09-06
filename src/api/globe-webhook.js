// API endpoint to handle Globe Labs webhooks
// This endpoint receives webhook notifications when parents subscribe/unsubscribe

import { handleGlobeSubscription, handleGlobeUnsubscribe } from '../utils/globeWebhook';

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

    // Validate webhook data
    if (!webhookData) {
      return res.status(400).json({
        success: false,
        error: 'No webhook data received'
      });
    }

    // Handle different types of webhook events
    let result;
    
    // Check if this is a subscription webhook (when parent texts keyword)
    if (webhookData.subscriber_number && webhookData.access_token) {
      console.log('📱 Processing subscription webhook');
      result = await handleGlobeSubscription(webhookData);
    }
    // Check if this is an unsubscribe webhook (when parent replies STOP)
    else if (webhookData.subscriber_number && webhookData.message && 
             webhookData.message.toLowerCase().includes('stop')) {
      console.log('🛑 Processing unsubscribe webhook');
      result = await handleGlobeUnsubscribe(webhookData);
    }
    // Handle incoming SMS messages (for future features)
    else if (webhookData.inboundSMSMessageList) {
      console.log('📨 Received inbound SMS message');
      
      // For now, just log the message
      const messages = webhookData.inboundSMSMessageList.inboundSMSMessage || [];
      messages.forEach(msg => {
        console.log(`SMS from ${msg.senderAddress}: ${msg.message}`);
      });
      
      result = { success: true, type: 'inbound_sms', messages: messages };
    }
    else {
      console.log('⚠️ Unknown webhook type received');
      result = { 
        success: false, 
        error: 'Unknown webhook type',
        data: webhookData 
      };
    }

    // Log the result
    if (result.success) {
      console.log('✅ Webhook processed successfully:', result);
    } else {
      console.error('❌ Webhook processing failed:', result);
    }

    // Return appropriate response to Globe Labs
    return res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('❌ Globe webhook handler error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing webhook',
      details: error.message
    });
  }
}

// Export configuration for Next.js API routes (if using Next.js)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};