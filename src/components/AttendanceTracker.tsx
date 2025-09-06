import React, { useState, useEffect } from 'react';
import { Check, X, Search, Download, Calendar, Users, MessageSquare, Phone, Settings } from 'lucide-react';
import { sendAttendanceNotification, sendBulkAttendanceNotifications, testSMSConfiguration } from '../utils/smsService';

const AttendanceTracker = () => {
  const [students, setStudents] = useState([
    { id: 1, name: "ACAIN, VINCE JERALD S.", parentPhone: "", passcode: "4945", status: null, reason: "" },
    { id: 2, name: "AGANAN, CLARK DAVEN C.", parentPhone: "", passcode: "7366", status: null, reason: "" },
    { id: 3, name: "AMARO, HANNZ JIBRIEL C.", parentPhone: "", passcode: "3172", status: null, reason: "" },
    { id: 4, name: "ARRANCHADO, MARK LAURENCE O.", parentPhone: "", passcode: "2308", status: null, reason: "" },
    { id: 5, name: "BALDOS, LUIS III L.", parentPhone: "", passcode: "2618", status: null, reason: "" },
    { id: 6, name: "DAYAO, HEAVEN ZAIJAN A.", parentPhone: "", passcode: "5106", status: null, reason: "" },
    { id: 7, name: "DELA CRUZ, ARYEL M.", parentPhone: "", passcode: "9778", status: null, reason: "" },
    { id: 8, name: "ELSISURA, JAY LORD L.", parentPhone: "", passcode: "1990", status: null, reason: "" },
    { id: 9, name: "ESTORES, EINFORD JOREL B.", parentPhone: "", passcode: "2067", status: null, reason: "" },
    { id: 10, name: "FERNANDEZ, CHARLES BENEDICT V.", parentPhone: "", passcode: "3076", status: null, reason: "" },
    { id: 11, name: "GILLES, DEXTER H.", parentPhone: "", passcode: "2898", status: null, reason: "" },
    { id: 12, name: "LAVILLA, JERARD PAUL O.", parentPhone: "", passcode: "9114", status: null, reason: "" },
    { id: 13, name: "METILLA, KRISTOPHER O.", parentPhone: "", passcode: "3680", status: null, reason: "" },
    { id: 14, name: "MILAGROSO, KEVIN T.", parentPhone: "", passcode: "8090", status: null, reason: "" },
    { id: 15, name: "MORATO, JAN KARL YOUEL G.", parentPhone: "", passcode: "1957", status: null, reason: "" },
    { id: 16, name: "PACHECO, DANIEL JAMES B.", parentPhone: "", passcode: "3914", status: null, reason: "" },
    { id: 17, name: "ROY, KHYLIE GIFFORD B.", parentPhone: "", passcode: "5444", status: null, reason: "" },
    { id: 18, name: "SORIA, KENT ANDREI L.", parentPhone: "", passcode: "8652", status: null, reason: "" },
    { id: 19, name: "TOPACIO, NASH P.", parentPhone: "", passcode: "4266", status: null, reason: "" },
    { id: 20, name: "VILLANUEVA, JOEDRIELLE D.", parentPhone: "", passcode: "6687", status: null, reason: "" },
    { id: 21, name: "AGODOLO, TRISHA MAY P.", parentPhone: "", passcode: "1896", status: null, reason: "" },
    { id: 22, name: "ALVAREZ, REINE NOLEEN A.", parentPhone: "", passcode: "3700", status: null, reason: "" },
    { id: 23, name: "BARCELONA, ZOE MIKAELA T.", parentPhone: "", passcode: "9927", status: null, reason: "" },
    { id: 24, name: "BASSIG, MARESFEL GRACE C.", parentPhone: "", passcode: "4350", status: null, reason: "" },
    { id: 25, name: "CALIP, LEIGH OSHLEY A.", parentPhone: "", passcode: "5084", status: null, reason: "" },
    { id: 26, name: "CHUA, TONIE JANNAH CLAUDINE B.", parentPhone: "", passcode: "8211", status: null, reason: "" },
    { id: 27, name: "DELA DINGCO, ANDREA GWYNETH Y.", parentPhone: "", passcode: "3529", status: null, reason: "" },
    { id: 28, name: "DELMENDO, PRINCESS CANDIZE NORILLE C.", parentPhone: "", passcode: "2413", status: null, reason: "" },
    { id: 29, name: "DIGANG, KATHLEEN MAE B", parentPhone: "", passcode: "3543", status: null, reason: "" },
    { id: 30, name: "EMATA, NAFISHA LOUISSE S.", parentPhone: "", passcode: "6735", status: null, reason: "" },
    { id: 31, name: "EUGENIO, MALKHA YAELIE A.", parentPhone: "", passcode: "3626", status: null, reason: "" },
    { id: 32, name: "GENIDO, REHANNA ALEXIS T.", parentPhone: "", passcode: "8718", status: null, reason: "" },
    { id: 33, name: "LAMPITAO, YASMINE MAE B.", parentPhone: "", passcode: "5409", status: null, reason: "" },
    { id: 34, name: "MARIANO, KAIRELLE ALGENE DC.", parentPhone: "", passcode: "5552", status: null, reason: "" },
    { id: 35, name: "MORAL, DIANA TWAINE R.", parentPhone: "", passcode: "7677", status: null, reason: "" },
    { id: 36, name: "NAVARRO, ANGELA KAYE T.", parentPhone: "", passcode: "8170", status: null, reason: "" },
    { id: 37, name: "OLACAO, RANNA NOREEN J.", parentPhone: "", passcode: "4850", status: null, reason: "" },
    { id: 38, name: "PARAMI, CHELSEE M.", parentPhone: "", passcode: "6468", status: null, reason: "" },
    { id: 39, name: "PARRENAS, NOELLE P.", parentPhone: "", passcode: "8350", status: null, reason: "" },
    { id: 40, name: "RAMONES, MYIESHA FATIMAH S.", parentPhone: "", passcode: "8830", status: null, reason: "" },
    { id: 41, name: "SAMERA, RIANNE CAITLYN F.", parentPhone: "", passcode: "2332", status: null, reason: "" },
    { id: 42, name: "TORRES, CHLOE HEAVYNNE E.", parentPhone: "", passcode: "8881", status: null, reason: "" },
    { id: 43, name: "URBODA, MARY ANDRIA P.", parentPhone: "", passcode: "3693", status: null, reason: "" }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [absentReason, setAbsentReason] = useState("");
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [smsLog, setSmsLog] = useState([]);
  const [showPhoneManager, setShowPhoneManager] = useState(false);
  const [showSMSSettings, setShowSMSSettings] = useState(false);
  const [editingPhone, setEditingPhone] = useState({ studentId: null, phone: '' });
  const [smsConfig, setSmsConfig] = useState({
    isEnabled: true,
    autoSendPresent: true,
    autoSendAbsent: true
  });

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPasscodeModal = (student, action) => {
    setSelectedStudent(student);
    setSelectedAction(action);
    setShowPasscodeModal(true);
    setEnteredPasscode("");
    setPasscodeError("");
  };

  const verifyPasscode = () => {
    if (enteredPasscode === selectedStudent.passcode) {
      setShowPasscodeModal(false);
      if (selectedAction === 'present') {
        markPresent(selectedStudent.id);
      } else if (selectedAction === 'absent') {
        setShowAbsentModal(true);
      }
    } else {
      setPasscodeError("Incorrect passcode. Please try again.");
      setEnteredPasscode("");
    }
  };

  const markPresent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    
    setStudents(students.map(s =>
      s.id === studentId 
        ? { ...s, status: 'present', reason: "" }
        : s
    ));

    // Send SMS notification for present status
    const smsMessage = {
      id: Date.now(),
      studentName: student.name,
      parentPhone: student.parentPhone,
      status: 'present',
      reason: '',
      timestamp: new Date().toLocaleTimeString()
    };
    setSmsLog([smsMessage, ...smsLog]);
  };

  const markAbsent = () => {
    if (!absentReason.trim()) {
      alert("Please enter a reason for absence");
      return;
    }

    setStudents(students.map(student =>
      student.id === selectedStudent.id 
        ? { ...student, status: 'absent', reason: absentReason }
        : student
    ));

    // Simulate SMS sending
    const smsMessage = {
      id: Date.now(),
      studentName: selectedStudent.name,
      parentPhone: selectedStudent.parentPhone,
      status: 'absent',
      reason: absentReason,
      timestamp: new Date().toLocaleTimeString()
    };
    setSmsLog([smsMessage, ...smsLog]);

    setShowAbsentModal(false);
    setSelectedStudent(null);
    setAbsentReason("");
  };

  const resetAttendance = () => {
    if (window.confirm("Are you sure you want to reset all attendance? This will clear all records for today.")) {
      setStudents(students.map(student => ({
        ...student,
        status: null,
        reason: ""
      })));
      setSmsLog([]);
    }
  };

  const getStats = () => {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const pending = students.filter(s => s.status === null).length;
    return { present, absent, pending };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-600" />
                PTA Attendance Tracker
              </h1>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <Calendar size={16} />
                {currentDate}
              </p>
            </div>
            <button
              onClick={resetAttendance}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-green-700">Present</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-red-700">Absent</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Fixed Header */}
          <div className="bg-gray-50 border-b">
            <div className="px-4 py-3 grid grid-cols-12 gap-4">
              <div className="col-span-5 text-left text-sm font-semibold text-gray-700">Student Name</div>
              <div className="col-span-3 text-left text-sm font-semibold text-gray-700">Parent Phone</div>
              <div className="col-span-2 text-center text-sm font-semibold text-gray-700">Present</div>
              <div className="col-span-2 text-center text-sm font-semibold text-gray-700">Absent</div>
            </div>
          </div>
          {/* Scrollable Student List */}
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <div key={student.id} className={`
                  px-4 py-3 grid grid-cols-12 gap-4 items-center transition-colors
                  ${student.status === 'present' ? 'bg-green-50' : ''}
                  ${student.status === 'absent' ? 'bg-red-50' : ''}
                  hover:bg-gray-50
                `}>
                  <div className="col-span-5">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    {student.status === 'absent' && student.reason && (
                      <div className="text-sm text-red-600 mt-1">Reason: {student.reason}</div>
                    )}
                  </div>
                  <div className="col-span-3 text-gray-700">{student.parentPhone || "Not provided"}</div>
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => openPasscodeModal(student, 'present')}
                      disabled={student.status !== null}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all mx-auto
                        ${student.status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : student.status === 'absent'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-green-100 text-gray-600 hover:text-green-600'
                        }
                      `}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                  <div className="col-span-2 text-center">
                    <button
                      onClick={() => openPasscodeModal(student, 'absent')}
                      disabled={student.status !== null}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all mx-auto
                        ${student.status === 'absent' 
                          ? 'bg-red-500 text-white' 
                          : student.status === 'present'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600'
                        }
                      `}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SMS Log */}
        {smsLog.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="text-blue-600" />
              SMS Notifications Sent
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {smsLog.map((sms) => (
                <div key={sms.id} className={`p-3 rounded-lg ${sms.status === 'present' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <div className="font-medium text-gray-800">
                    SMS sent to {sms.parentPhone || "Parent phone not provided"} at {sms.timestamp}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {sms.status === 'present' 
                      ? `"${sms.studentName} is present at school today."`
                      : `"${sms.studentName} is absent today. Reason: ${sms.reason}"`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enter Passcode for {selectedStudent?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Please enter your 4-digit passcode to mark attendance
            </p>
            <div className="mb-4">
              <input
                type="password"
                value={enteredPasscode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setEnteredPasscode(value);
                  setPasscodeError("");
                }}
                placeholder="••••"
                className="w-full p-4 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4}
                autoFocus
              />
              {passcodeError && (
                <p className="text-red-500 text-sm mt-2">{passcodeError}</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, ''].map((num, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (num !== '' && enteredPasscode.length < 4) {
                      setEnteredPasscode(enteredPasscode + num);
                      setPasscodeError("");
                    }
                  }}
                  disabled={num === '' || enteredPasscode.length >= 4}
                  className={`
                    h-12 rounded-lg font-semibold text-lg transition-colors
                    ${num === '' 
                      ? 'invisible' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasscodeModal(false);
                  setEnteredPasscode("");
                  setPasscodeError("");
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEnteredPasscode("")}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={verifyPasscode}
                disabled={enteredPasscode.length !== 4}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Absent Modal */}
      {showAbsentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Mark {selectedStudent?.name} as Absent
            </h3>
            <p className="text-gray-600 mb-4">
              Please enter the reason for absence. An SMS will be sent to {selectedStudent?.parentPhone || "the parent's phone"}
            </p>
            <textarea
              value={absentReason}
              onChange={(e) => setAbsentReason(e.target.value)}
              placeholder="Enter reason for absence..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAbsentModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={markAbsent}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Mark Absent & Send SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;