import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Brain, 
  Sparkles,
  Copy,
  Check,
  Send,
  List,
  CheckSquare,
  Hash,
  Type,
  Settings,
  Zap
} from 'lucide-react';
import groq, { isGroqConfigured } from '../utils/groqClient';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'meeting';
  createdAt: Date;
  updatedAt: Date;
  meetingDate?: Date;
  attendees?: string[];
  tags: string[];
  color: string;
  isRecording?: boolean;
  audioBlob?: Blob;
  transcript?: string;
}

interface PTASecretaryDashboardProps {
  getContrastClass: (baseClass: string, contrastClass: string) => string;
  onClose: () => void;
}

const NOTE_COLORS = [
  '#ffffff', // White
  '#f8f9fa', // Light gray
  '#fff3cd', // Light yellow
  '#d4edda', // Light green
  '#d1ecf1', // Light blue
  '#f8d7da', // Light red
  '#e2e3e5', // Gray
  '#fce4ec', // Light pink
  '#e1f5fe', // Light cyan
  '#f3e5f5'  // Light purple
];

export default function PTASecretaryDashboard({ getContrastClass, onClose }: PTASecretaryDashboardProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'voice' | 'meeting'>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingMinutes, setIsGeneratingMinutes] = useState(false);
  const [generatedMinutes, setGeneratedMinutes] = useState('');
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // New AI Input Features
  const [currentInput, setCurrentInput] = useState('');
  const [listFormat, setListFormat] = useState<'bullets' | 'numbers' | 'letters' | 'checkboxes'>('bullets');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showAIChoiceModal, setShowAIChoiceModal] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiResultType, setAiResultType] = useState<'summary' | 'minutes'>('summary');

  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('pta_secretary_notes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          meetingDate: note.meetingDate ? new Date(note.meetingDate) : undefined
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (notesToSave: Note[]) => {
    localStorage.setItem('pta_secretary_notes', JSON.stringify(notesToSave));
  };

  // Create new note
  const createNote = (type: 'text' | 'voice' | 'meeting' = 'text') => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: type === 'meeting' ? 'Meeting Notes' : 'New Note',
      content: '',
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      color: NOTE_COLORS[0],
      ...(type === 'meeting' && { 
        meetingDate: new Date(), 
        attendees: [] 
      })
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setIsCreating(true);
  };

  // Update note
  const updateNote = (noteId: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote({ ...selectedNote, ...updates, updatedAt: new Date() });
    }
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsCreating(false);
    }
  };

  // Start voice recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (selectedNote) {
          updateNote(selectedNote.id, { audioBlob });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript + interimTranscript;
          if (selectedNote) {
            updateNote(selectedNote.id, { 
              transcript: fullTranscript,
              content: selectedNote.content + '\n\n[Voice Transcript]\n' + fullTranscript
            });
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Generate meeting minutes using Groq AI
  const generateMeetingMinutes = async () => {
    if (!selectedNote || !selectedNote.content.trim()) {
      alert('Please add some notes before generating minutes.');
      return;
    }

    setIsGeneratingMinutes(true);
    
    const prompt = `As a professional PTA Secretary, analyze these meeting notes and create formal meeting minutes:

MEETING NOTES:
${selectedNote.content}

Please format the output as proper meeting minutes with:
1. Meeting header (date, attendees if available)
2. Agenda items discussed
3. Key decisions made
4. Action items with responsible parties
5. Next meeting date/items

Make it professional, organized, and suitable for official PTA records. Focus on clarity and completeness.`;

    try {
      if (!groq || !isGroqConfigured) {
        throw new Error('KreativLoops AI not configured');
      }

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert PTA Secretary assistant. Create professional, well-structured meeting minutes from informal notes. Focus on clarity, organization, and official documentation standards.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1000
      });

      const minutes = response.choices[0]?.message?.content || 'Unable to generate minutes.';
      setGeneratedMinutes(minutes);
      setShowMinutesModal(true);
    } catch (error) {
      console.error('Error generating minutes:', error);
      alert('Error generating minutes. Please try again.');
    } finally {
      setIsGeneratingMinutes(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Format text with selected list style
  const formatTextWithList = (text: string, format: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return line;
      
      switch (format) {
        case 'bullets':
          return `• ${trimmedLine}`;
        case 'numbers':
          return `${index + 1}. ${trimmedLine}`;
        case 'letters':
          return `${String.fromCharCode(97 + index)}. ${trimmedLine}`;
        case 'checkboxes':
          return `☐ ${trimmedLine}`;
        default:
          return trimmedLine;
      }
    }).join('\n');
  };

  // Handle AI processing choice
  const handleAIChoice = async (type: 'summary' | 'minutes') => {
    if (!currentInput.trim()) {
      alert('Please enter some notes first.');
      return;
    }

    setIsProcessingAI(true);
    setAiResultType(type);
    setShowAIChoiceModal(false);
    
    const systemPrompt = type === 'summary' 
      ? 'You are an expert assistant that creates clear, concise summaries from notes. Focus on key points, main ideas, and important details. Organize the content logically and professionally.'
      : 'You are a professional PTA Secretary assistant. Create formal meeting minutes from notes. Include proper structure with agenda items, discussions, decisions made, action items, and next steps. Format professionally for official PTA records.';

    const userPrompt = type === 'summary'
      ? `Please create a clear and organized summary from these notes:\n\n${currentInput}\n\nOrganize the content logically and highlight the most important points.`
      : `Please create formal PTA meeting minutes from these notes:\n\n${currentInput}\n\nFormat as proper meeting minutes with:\n1. Meeting details\n2. Agenda items discussed\n3. Key decisions made\n4. Action items with responsible parties\n5. Next meeting information`;

    try {
      if (!groq || !isGroqConfigured) {
        throw new Error('KreativLoops AI not configured');
      }

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1000
      });

      const result = response.choices[0]?.message?.content || `Unable to generate ${type}.`;
      setAiResult(result);
      setShowMinutesModal(true);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      alert(`Error generating ${type}. Please try again.`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Handle Send button click
  const handleSendToAI = () => {
    if (!currentInput.trim()) {
      alert('Please enter some notes first.');
      return;
    }
    setShowAIChoiceModal(true);
  };

  // Apply formatting to current input
  const applyFormatting = (format: string) => {
    if (currentInput.trim()) {
      const formatted = formatTextWithList(currentInput, format);
      setCurrentInput(formatted);
    }
    setListFormat(format as any);
    setShowFormatMenu(false);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || note.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={getContrastClass(
      "fixed inset-0 bg-white z-50 flex flex-col",
      "fixed inset-0 bg-black z-50 flex flex-col"
    )}>
      {/* Header */}
      <div className={getContrastClass(
        "bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white",
        "bg-gray-900 border-b-2 border-yellow-400 p-4"
      )}>
        <div className="flex items-center justify-between">
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
            <FileText size={24} className={getContrastClass("text-white", "text-yellow-400")} />
            <div>
              <h1 className={getContrastClass(
                "text-xl font-bold text-white",
                "text-xl font-bold text-yellow-400"
              )}>
                PTA Secretary Dashboard
              </h1>
              <p className={getContrastClass(
                "text-sm text-white/80",
                "text-sm text-yellow-200"
              )}>
                Notes, Voice Recording & Meeting Minutes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => createNote('text')}
              className={getContrastClass(
                "p-2 rounded-lg hover:bg-white/20 transition-colors",
                "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
              )}
              title="New Text Note"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => createNote('voice')}
              className={getContrastClass(
                "p-2 rounded-lg hover:bg-white/20 transition-colors",
                "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
              )}
              title="New Voice Note"
            >
              <Mic size={20} />
            </button>
            <button
              onClick={() => createNote('meeting')}
              className={getContrastClass(
                "p-2 rounded-lg hover:bg-white/20 transition-colors",
                "p-2 rounded-lg hover:bg-gray-800 transition-colors text-yellow-400"
              )}
              title="New Meeting Notes"
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main AI Input Interface */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-6">
        
        {/* AI Input Section */}
        <div className={getContrastClass(
          "bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 mb-6",
          "bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-yellow-400/50 mb-6"
        )}>
          {/* Input Header */}
          <div className={getContrastClass(
            "bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-3xl",
            "bg-gradient-to-r from-gray-800 to-gray-700 border-b-2 border-yellow-400/30 p-6 rounded-t-3xl"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={28} className={getContrastClass("text-white", "text-yellow-400")} />
                <div>
                  <h2 className={getContrastClass(
                    "text-xl font-bold text-white",
                    "text-xl font-bold text-yellow-400"
                  )}>
                    KreativLoops AI Note Assistant
                  </h2>
                  <p className={getContrastClass(
                    "text-sm text-white/80",
                    "text-sm text-yellow-200"
                  )}>
                    Type your notes and let AI create summaries or meeting minutes
                  </p>
                </div>
              </div>
              
              {/* Formatting Tools */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowFormatMenu(!showFormatMenu)}
                    className={getContrastClass(
                      "p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white",
                      "p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-yellow-400 border border-yellow-400/50"
                    )}
                    title="Formatting Options"
                  >
                    <Settings size={18} />
                  </button>
                  
                  {showFormatMenu && (
                    <div className={getContrastClass(
                      "absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-xl p-2 min-w-48 z-10",
                      "absolute right-0 top-12 bg-gray-800 border border-yellow-400 rounded-lg shadow-xl p-2 min-w-48 z-10"
                    )}>
                      <div className={getContrastClass(
                        "text-xs font-medium text-gray-600 mb-2 px-2",
                        "text-xs font-medium text-yellow-400 mb-2 px-2"
                      )}>
                        List Formatting
                      </div>
                      
                      {[
                        { key: 'bullets', icon: List, label: 'Bullet Points', example: '• Item' },
                        { key: 'numbers', icon: Hash, label: 'Numbers', example: '1. Item' },
                        { key: 'letters', icon: Type, label: 'Letters', example: 'a. Item' },
                        { key: 'checkboxes', icon: CheckSquare, label: 'Checkboxes', example: '☐ Item' }
                      ].map(format => (
                        <button
                          key={format.key}
                          onClick={() => applyFormatting(format.key)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            listFormat === format.key
                              ? getContrastClass('bg-blue-100 text-blue-800', 'bg-yellow-400/20 text-yellow-300')
                              : getContrastClass('hover:bg-gray-100 text-gray-700', 'hover:bg-gray-700 text-yellow-200')
                          }`}
                        >
                          <format.icon size={16} />
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium">{format.label}</div>
                            <div className="text-xs opacity-60">{format.example}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => createNote('voice')}
                  className={getContrastClass(
                    "p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white",
                    "p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-yellow-400 border border-yellow-400/50"
                  )}
                  title="Voice Recording"
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6">
            <div className="relative">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Start typing your notes here... 

Examples:
• Meeting agenda items
• Discussion points
• Action items and decisions
• Important observations

Use the formatting tools above to organize your notes, then click Send to generate a summary or meeting minutes!"
                className={getContrastClass(
                  "w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900 bg-gray-50",
                  "w-full h-64 p-4 border-2 border-yellow-400/50 rounded-xl focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 resize-none text-yellow-100 bg-gray-800/50"
                )}
                style={{ fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.6' }}
              />
              
              {/* Send Button */}
              <button
                onClick={handleSendToAI}
                disabled={!currentInput.trim() || isProcessingAI}
                className={`absolute bottom-4 right-4 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  getContrastClass(
                    "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl",
                    "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg hover:shadow-xl"
                  )
                }`}
              >
                {isProcessingAI ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send to AI
                  </>
                )}
              </button>
            </div>
            
            {/* Character Count */}
            <div className={getContrastClass(
              "text-xs text-gray-500 mt-2 text-right",
              "text-xs text-yellow-400/60 mt-2 text-right"
            )}>
              {currentInput.length} characters
            </div>
          </div>
        </div>

        {/* Saved Notes Section */}
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/30",
          "bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-yellow-400/30"
        )}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className={getContrastClass(
                "text-lg font-semibold text-gray-900",
                "text-lg font-semibold text-yellow-400"
              )}>
                Saved Notes & Results
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => createNote('text')}
                  className={getContrastClass(
                    "p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors",
                    "p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
                  )}
                  title="Save Current Input as Note"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved notes..."
                className={getContrastClass(
                  "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  "w-full pl-10 pr-4 py-2 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-400"
                )}
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div className="p-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className={getContrastClass("text-gray-300 mx-auto mb-4", "text-gray-600 mx-auto mb-4")} />
                <p className={getContrastClass("text-gray-500", "text-gray-400")}>
                  {searchQuery ? 'No notes found matching your search' : 'No saved notes yet. Create your first note above!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setCurrentInput(note.content)}
                    className={getContrastClass(
                      "p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md",
                      "p-4 bg-gray-800 rounded-lg border border-gray-600 hover:bg-gray-700 cursor-pointer transition-all hover:shadow-md"
                    )}
                    style={{ backgroundColor: note.color !== '#ffffff' ? note.color : undefined }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={getContrastClass(
                        "font-medium text-gray-900 text-sm truncate",
                        "font-medium text-yellow-400 text-sm truncate"
                      )}>
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {note.type === 'voice' && <Mic size={12} className="text-blue-500" />}
                        {note.type === 'meeting' && <Users size={12} className="text-green-500" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <p className={getContrastClass(
                      "text-xs text-gray-600 line-clamp-3",
                      "text-xs text-yellow-200 line-clamp-3"
                    )}>
                      {note.content || 'No content...'}
                    </p>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      {note.updatedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Choice Modal */}
      {showAIChoiceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className={getContrastClass(
            "bg-white rounded-2xl shadow-xl max-w-md w-full mx-4",
            "bg-gray-900 border-2 border-yellow-400 rounded-2xl shadow-xl max-w-md w-full mx-4"
          )}>
            <div className={getContrastClass(
              "bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl",
              "bg-gradient-to-r from-gray-800 to-gray-700 border-b-2 border-yellow-400/30 p-6 rounded-t-2xl"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain size={24} className={getContrastClass("text-white", "text-yellow-400")} />
                  <h3 className={getContrastClass(
                    "text-lg font-semibold text-white",
                    "text-lg font-semibold text-yellow-400"
                  )}>
                    Choose AI Analysis Type
                  </h3>
                </div>
                <button
                  onClick={() => setShowAIChoiceModal(false)}
                  className={getContrastClass(
                    "p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors",
                    "p-2 text-yellow-400/70 hover:text-yellow-400 hover:bg-gray-600 rounded-lg transition-colors"
                  )}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className={getContrastClass(
                "text-gray-600 mb-6 text-center",
                "text-yellow-200 mb-6 text-center"
              )}>
                What would you like KreativLoops AI to create from your notes?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleAIChoice('summary')}
                  disabled={isProcessingAI}
                  className={getContrastClass(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group",
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-yellow-400/50 hover:border-yellow-400 hover:bg-gray-800/50 transition-all group"
                  )}
                >
                  <div className={getContrastClass(
                    "p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors",
                    "p-3 bg-yellow-400/20 rounded-xl group-hover:bg-yellow-400/30 transition-colors"
                  )}>
                    <FileText size={20} className={getContrastClass("text-blue-600", "text-yellow-400")} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={getContrastClass(
                      "font-semibold text-gray-900 mb-1",
                      "font-semibold text-yellow-400 mb-1"
                    )}>
                      Create Summary
                    </h4>
                    <p className={getContrastClass(
                      "text-sm text-gray-600",
                      "text-sm text-yellow-200"
                    )}>
                      Organize and summarize your notes with key points highlighted
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleAIChoice('minutes')}
                  disabled={isProcessingAI}
                  className={getContrastClass(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all group",
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 border-yellow-400/50 hover:border-yellow-400 hover:bg-gray-800/50 transition-all group"
                  )}
                >
                  <div className={getContrastClass(
                    "p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors",
                    "p-3 bg-yellow-400/20 rounded-xl group-hover:bg-yellow-400/30 transition-colors"
                  )}>
                    <Users size={20} className={getContrastClass("text-green-600", "text-yellow-400")} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={getContrastClass(
                      "font-semibold text-gray-900 mb-1",
                      "font-semibold text-yellow-400 mb-1"
                    )}>
                      Generate Meeting Minutes
                    </h4>
                    <p className={getContrastClass(
                      "text-sm text-gray-600",
                      "text-sm text-yellow-200"
                    )}>
                      Create formal PTA meeting minutes with proper structure and format
                    </p>
                  </div>
                </button>
              </div>
              
              {isProcessingAI && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className={getContrastClass("text-gray-600", "text-yellow-400")}>
                    Processing with KreativLoops AI...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Minutes Modal */}
      {showMinutesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
          <div className={getContrastClass(
            "bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden",
            "bg-gray-900 border-2 border-yellow-400 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
          )}>
            <div className={getContrastClass(
              "bg-gray-50 px-6 py-4 border-b border-gray-200",
              "bg-gray-800 px-6 py-4 border-b border-yellow-400/20"
            )}>
              <div className="flex items-center justify-between">
                <h3 className={getContrastClass(
                  "text-lg font-medium text-gray-900",
                  "text-lg font-medium text-yellow-400"
                )}>
                  {aiResultType === 'summary' ? 'Generated Summary' : 'Generated Meeting Minutes'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(aiResult || generatedMinutes)}
                    className={getContrastClass(
                      "p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
                      "p-2 text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                    )}
                    title="Copy to clipboard"
                  >
                    {copiedToClipboard ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => setShowMinutesModal(false)}
                    className={getContrastClass(
                      "p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors",
                      "p-2 text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                    )}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className={getContrastClass(
                "prose prose-sm max-w-none text-gray-900",
                "prose prose-sm max-w-none text-yellow-100"
              )}>
                <pre className="whitespace-pre-wrap font-sans">{aiResult || generatedMinutes}</pre>
              </div>
            </div>
            
            <div className={getContrastClass(
              "bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3",
              "bg-gray-800 px-6 py-4 border-t border-yellow-400/20 flex justify-end gap-3"
            )}>
              <button
                onClick={() => {
                  const result = aiResult || generatedMinutes;
                  const resultType = aiResultType === 'summary' ? 'SUMMARY' : 'MEETING MINUTES';
                  
                  // Create a new note with the AI result
                  const newNote: Note = {
                    id: `note_${Date.now()}`,
                    title: `AI ${resultType} - ${new Date().toLocaleDateString()}`,
                    content: result,
                    type: aiResultType === 'minutes' ? 'meeting' : 'text',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    tags: [`AI ${resultType}`],
                    color: NOTE_COLORS[0],
                    ...(aiResultType === 'minutes' && { 
                      meetingDate: new Date(), 
                      attendees: [] 
                    })
                  };
                  
                  const updatedNotes = [newNote, ...notes];
                  setNotes(updatedNotes);
                  saveNotes(updatedNotes);
                  
                  setShowMinutesModal(false);
                  
                  // Clear the current input after saving
                  setCurrentInput('');
                }}
                className={getContrastClass(
                  "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                  "px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
                )}
              >
                Save as New Note
              </button>
              <button
                onClick={() => setShowMinutesModal(false)}
                className={getContrastClass(
                  "px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors",
                  "px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                )}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Credit Footer */}
      <div className={getContrastClass(
        "fixed bottom-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200",
        "fixed bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-t border-yellow-400/20"
      )}>
        <div className={getContrastClass(
          "text-center text-xs text-gray-400 py-2",
          "text-center text-xs text-yellow-500/60 py-2"
        )}>
          Designed and developed by Cherwin Fernandez / KreativLoops • v1.1
        </div>
      </div>
    </div>
  );
}