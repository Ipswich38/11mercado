import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import { sendEmailToPTA, formatContactEmail } from '../utils/emailService';

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

export default function ContactUs({ getContrastClass, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (data: ContactMessage): Promise<boolean> => {
    try {
      const emailData = formatContactEmail(data);
      const success = await sendEmailToPTA(emailData);
      
      if (success) {
        // Store locally for demo purposes
        const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        existingMessages.push(data);
        localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
      }
      
      return success;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const contactMessage: ContactMessage = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      const success = await sendEmail(contactMessage);
      
      if (success) {
        setShowSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      } else {
        alert('There was an error sending your message. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={getContrastClass(
        "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center",
        "fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
      )}>
        <div className="text-center p-8">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h2 className={getContrastClass(
            "text-2xl font-bold text-gray-900 mb-2",
            "text-2xl font-bold text-yellow-400 mb-2"
          )}>
            Message Sent Successfully!
          </h2>
          <p className={getContrastClass(
            "text-gray-600 mb-4",
            "text-yellow-200 mb-4"
          )}>
            Thank you for contacting us. We'll get back to you soon.
          </p>
          <p className={getContrastClass(
            "text-sm text-gray-500",
            "text-sm text-yellow-300"
          )}>
            Sent to: 11mercado.pta@gmail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      <div className={getContrastClass(
        "bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={getContrastClass(
              "p-2 rounded-lg hover:bg-white/20 transition-colors",
              "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
            )}
          >
            <ArrowLeft size={20} />
          </button>
          <Mail size={24} className={getContrastClass("text-white", "text-yellow-400")} />
          <div>
            <h1 className={getContrastClass(
              "text-xl font-bold text-white",
              "text-xl font-bold text-yellow-400"
            )}>
              Contact Us
            </h1>
            <p className={getContrastClass(
              "text-sm text-white/80",
              "text-sm text-yellow-200"
            )}>
              Send a message to 11Mercado PTA
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name Field */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Your Name *
          </label>
          <div className="relative">
            <User size={20} className={getContrastClass(
              "absolute left-3 top-3 text-gray-400",
              "absolute left-3 top-3 text-yellow-400"
            )} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full pl-10 p-3 rounded-xl border ${
                errors.name 
                  ? 'border-red-500' 
                  : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your full name"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Email Address *
          </label>
          <div className="relative">
            <Mail size={20} className={getContrastClass(
              "absolute left-3 top-3 text-gray-400",
              "absolute left-3 top-3 text-yellow-400"
            )} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full pl-10 p-3 rounded-xl border ${
                errors.email 
                  ? 'border-red-500' 
                  : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className={`w-full p-3 rounded-xl border ${
              errors.subject 
                ? 'border-red-500' 
                : getContrastClass('border-gray-300', 'border-gray-600')
            } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="What is this about?"
          />
          {errors.subject && (
            <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label className={getContrastClass(
            "block text-sm font-medium text-gray-700 mb-2",
            "block text-sm font-medium text-yellow-400 mb-2"
          )}>
            Message *
          </label>
          <div className="relative">
            <MessageSquare size={20} className={getContrastClass(
              "absolute left-3 top-3 text-gray-400",
              "absolute left-3 top-3 text-yellow-400"
            )} />
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className={`w-full pl-10 p-3 rounded-xl border ${
                errors.message 
                  ? 'border-red-500' 
                  : getContrastClass('border-gray-300', 'border-gray-600')
              } ${getContrastClass('bg-white text-gray-900', 'bg-gray-900 text-yellow-200')} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              rows={6}
              placeholder="Type your message here... (minimum 10 characters)"
            />
          </div>
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
          )}
          <p className={getContrastClass(
            "text-xs text-gray-500 mt-1",
            "text-xs text-yellow-300 mt-1"
          )}>
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Contact Info */}
        <div className={getContrastClass(
          "bg-blue-50 border border-blue-200 rounded-xl p-4",
          "bg-gray-900 border border-yellow-400 rounded-xl p-4"
        )}>
          <h3 className={getContrastClass(
            "font-semibold text-blue-800 mb-2",
            "font-semibold text-yellow-400 mb-2"
          )}>
            📧 Your message will be sent to:
          </h3>
          <p className={getContrastClass(
            "text-blue-700 font-medium",
            "text-yellow-200 font-medium"
          )}>
            11mercado.pta@gmail.com
          </p>
          <p className={getContrastClass(
            "text-blue-600 text-sm mt-1",
            "text-yellow-300 text-sm mt-1"
          )}>
            Official 11Mercado PTA email address
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Message
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={getContrastClass(
              "w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors",
              "w-full bg-gray-700 border border-yellow-400 hover:bg-gray-600 text-yellow-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            )}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}