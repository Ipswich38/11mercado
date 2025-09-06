import React, { useState, useEffect } from 'react';
import { Phone, Check, X, Search, Users, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { getActiveSubscriptions } from '../utils/globeWebhook';

interface ParentPhoneManagerProps {
  students: any[];
  onUpdateStudent: (studentId: number, parentPhone: string) => void;
  onClose: () => void;
}

const ParentPhoneManager: React.FC<ParentPhoneManagerProps> = ({ 
  students, 
  onUpdateStudent, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    loadActiveSubscriptions();
  }, []);

  const loadActiveSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptions = await getActiveSubscriptions();
      setActiveSubscriptions(subscriptions);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneUpdate = (studentId: number, phone: string) => {
    // Validate Philippine phone number format
    const cleanPhone = phone.replace(/\s+/g, '');
    let standardPhone = cleanPhone;
    
    if (standardPhone.startsWith('09')) {
      standardPhone = '+63' + standardPhone.substring(1);
    } else if (standardPhone.startsWith('63') && !standardPhone.startsWith('+63')) {
      standardPhone = '+' + standardPhone;
    }
    
    if (!standardPhone.match(/^(\+63|63)9\d{9}$/)) {
      alert('Please enter a valid Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)');
      return;
    }
    
    onUpdateStudent(studentId, standardPhone);
    setSelectedStudent(null);
    setPhoneInput('');
  };

  const getSubscriptionStatus = (phoneNumber: string) => {
    return activeSubscriptions.find(sub => sub.phone_number === phoneNumber);
  };

  const handleQuickAssign = (phoneNumber: string) => {
    if (selectedStudent) {
      onUpdateStudent(selectedStudent, phoneNumber);
      setSelectedStudent(null);
    }
  };

  const studentsWithPhones = students.filter(s => s.parentPhone);
  const studentsWithoutPhones = students.filter(s => !s.parentPhone);
  const unlinkedSubscriptions = activeSubscriptions.filter(sub => 
    !students.some(student => student.parentPhone === sub.phone_number)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#017374]" />
              <h2 className="text-xl font-semibold">Parent Phone Manager</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 font-medium">Linked Students</div>
              <div className="text-2xl font-bold text-green-700">{studentsWithPhones.length}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-orange-600 font-medium">Missing Phones</div>
              <div className="text-2xl font-bold text-orange-700">{studentsWithoutPhones.length}</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-medium">Active SMS</div>
              <div className="text-2xl font-bold text-blue-700">{activeSubscriptions.length}</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-red-600 font-medium">Unlinked SMS</div>
              <div className="text-2xl font-bold text-red-700">{unlinkedSubscriptions.length}</div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Left Panel: Students */}
          <div className="w-1/2 border-r">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#017374]"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-full">
              {filteredStudents.map((student) => {
                const subscription = getSubscriptionStatus(student.parentPhone);
                const isSelected = selectedStudent === student.id;
                
                return (
                  <div 
                    key={student.id}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{student.name}</div>
                        <div className="text-xs text-gray-500">Passcode: {student.passcode}</div>
                        {student.parentPhone ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600">{student.parentPhone}</span>
                            {subscription ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-orange-500 mt-1">No phone number</div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex flex-col gap-1">
                          <input
                            type="tel"
                            placeholder="09XXXXXXXXX"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-200 rounded w-24"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhoneUpdate(student.id, phoneInput);
                              }}
                              className="p-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(null);
                                setPhoneInput('');
                              }}
                              className="p-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Subscriptions */}
          <div className="w-1/2">
            <div className="p-4 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#017374]" />
                Active SMS Subscriptions
              </h3>
              <p className="text-sm text-gray-600">Parents who texted the keyword</p>
            </div>
            
            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading subscriptions...</div>
              ) : activeSubscriptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <div>No SMS subscriptions yet</div>
                  <div className="text-xs">Parents need to text your keyword</div>
                </div>
              ) : (
                <div>
                  {activeSubscriptions.map((subscription) => {
                    const linkedStudent = students.find(s => s.parentPhone === subscription.phone_number);
                    
                    return (
                      <div 
                        key={subscription.id}
                        className={`p-3 border-b hover:bg-gray-50 ${!linkedStudent ? 'bg-red-50' : 'bg-green-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[#017374]" />
                              <span className="font-medium">{subscription.phone_number}</span>
                              {linkedStudent ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            {linkedStudent ? (
                              <div className="text-sm text-green-600 mt-1">
                                Linked to: {linkedStudent.name}
                              </div>
                            ) : (
                              <div className="text-sm text-red-600 mt-1">
                                Not linked to any student
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Subscribed: {new Date(subscription.subscribed_at).toLocaleDateString()}
                            </div>
                          </div>
                          {!linkedStudent && selectedStudent && (
                            <button
                              onClick={() => handleQuickAssign(subscription.phone_number)}
                              className="px-2 py-1 bg-[#017374] text-white rounded text-xs hover:bg-[#015454]"
                            >
                              Link
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              📱 Parents need to text <code className="bg-gray-200 px-1 rounded">JOIN 11MERCADO</code> to your short code to subscribe
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#017374] text-white rounded-lg hover:bg-[#015454]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPhoneManager;