// Simple test endpoint to verify webhook is working
export default async function handler(req, res) {
  console.log('🔔 Test webhook called!', {
    method: req.method,
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Log everything we receive
  if (req.method === 'POST') {
    console.log('POST data received:', JSON.stringify(req.body, null, 2));
  }

  // Return success response
  return res.status(200).json({
    success: true,
    message: 'Webhook test successful!',
    timestamp: new Date().toISOString(),
    received: {
      method: req.method,
      body: req.body,
      query: req.query
    }
  });
}