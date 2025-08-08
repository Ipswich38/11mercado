import React, { useState } from 'react';
import { Button } from './ui/button';
import { Mail, MessageSquare, User, Phone, Send, CheckCircle, X } from 'lucide-react';

const ContactUsForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    priority: 'Normal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [messageId, setMessageId] = useState('');

  const subjects = [
    'General Inquiry',
    'Donation Support',
    'Project Proposal Question',
    'Technical Issue',
    'PTA Information',
    'Student Activities',
    'Complaint/Concern',
    'Suggestion/Feedback',
    'Other'
  ];

  const priorities = [
    { value: 'Low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'Normal', label: 'Normal Priority', color: 'text-blue-600' },
    { value: 'High', label: 'High Priority', color: 'text-orange-600' },
    { value: 'Urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateMessageId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    return `MSG-${year}${month}${day}-${time}`;
  };

  const submitToGoogleScript = async (messageData) => {
    // In a real implementation, this would be a Google Apps Script Web App URL
    // that forwards the message to 11mercado.pta@gmail.com
    const CONTACT_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_CONTACT_SCRIPT_ID/exec';
    
    try {
      const response = await fetch(CONTACT_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(messageData)
      });

      if (!response.ok) {
        throw new Error('Message submission failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Fallback: Store message locally and provide instructions for manual contact
      const messages = JSON.parse(localStorage.getItem('11m_contact_messages') || '[]');
      messages.push(messageData);
      localStorage.setItem('11m_contact_messages', JSON.stringify(messages));
      
      return { 
        success: true, 
        message: 'Message stored locally. Please send manually to 11mercado.pta@gmail.com',
        fallback: true 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const msgId = generateMessageId();
      const timestamp = new Date().toISOString();

      const messageData = {
        messageId: msgId,
        timestamp,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        priority: formData.priority,
        status: 'New',
        source: '11Mercado Platform'
      };

      const result = await submitToGoogleScript(messageData);

      if (result.success) {
        setMessageId(msgId);
        setSubmissionStatus(result.fallback ? 'fallback' : 'success');
      } else {
        throw new Error(result.message || 'Message submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
      priority: 'Normal'
    });
    setSubmissionStatus(null);
    setMessageId('');
  };

  const generateEmailTemplate = () => {
    return `Subject: [11Mercado] ${formData.subject} - ${messageId}

Dear 11Mercado PTA Team,

You have received a new message through the 11Mercado platform:

MESSAGE ID: ${messageId}
DATE & TIME: ${new Date().toLocaleString('en-PH')}
PRIORITY: ${formData.priority}

CONTACT INFORMATION:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

SUBJECT: ${formData.subject}

MESSAGE:
${formData.message}

---
This message was sent through the 11Mercado Contact Us form.
Please respond directly to the sender's email address: ${formData.email}

Best regards,
11Mercado Platform System`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} />
            <h2 className="text-2xl font-bold">Contact Us</h2>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Success State */}
        {submissionStatus === 'success' && (
          <div className="p-6 text-center">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Message Sent Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your message has been sent to 11mercado.pta@gmail.com. We'll respond within 24-48 hours.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Message ID:</div>
              <div className="text-lg font-mono font-bold text-green-700">
                {messageId}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Keep this ID for reference
              </div>
            </div>

            <Button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full"
            >
              Send Another Message
            </Button>
          </div>
        )}

        {/* Fallback State */}
        {submissionStatus === 'fallback' && (
          <div className="p-6 text-center">
            <Mail className="text-blue-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Message Ready to Send
            </h3>
            <p className="text-gray-600 mb-4">
              Please copy the message below and email it to 11mercado.pta@gmail.com
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <div className="text-sm text-gray-600 mb-2">Email Template:</div>
              <textarea
                value={generateEmailTemplate()}
                readOnly
                rows="12"
                className="w-full text-xs font-mono bg-white border border-gray-300 rounded p-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigator.clipboard.writeText(generateEmailTemplate())}
                className="flex-1"
              >
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {submissionStatus === 'error' && (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <X size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Submission Failed
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error sending your message. Please try again or email us directly at 11mercado.pta@gmail.com
            </p>
            <Button
              onClick={() => setSubmissionStatus(null)}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form State */}
        {!submissionStatus && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-800 font-medium mb-2">
                📧 Get in Touch with 11Mercado PTA
              </div>
              <div className="text-xs text-blue-700">
                We're here to help with questions, concerns, or suggestions about our school community platform.
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={16} className="inline mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={16} className="inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={16} className="inline mr-1" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09XX-XXX-XXXX"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your question, concern, or feedback in detail..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.message.length}/1000 characters
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-600">
                <strong>Privacy Notice:</strong> Your contact information will only be used to respond to your inquiry. 
                We do not share your information with third parties.
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Send size={16} className="mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactUsForm;