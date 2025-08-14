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
  Check
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

      <div className="flex-1 flex overflow-hidden">
        {/* Notes List Sidebar */}
        <div className={getContrastClass(
          "w-80 bg-gray-50 border-r border-gray-200 flex flex-col",
          "w-80 bg-gray-900 border-r border-yellow-400/20 flex flex-col"
        )}>
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className={getContrastClass(
                  "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                  "w-full pl-10 pr-4 py-2 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-400"
                )}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={getContrastClass(
                "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                "w-full p-2 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-400"
              )}
            >
              <option value="all">All Notes</option>
              <option value="text">Text Notes</option>
              <option value="voice">Voice Notes</option>
              <option value="meeting">Meeting Notes</option>
            </select>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setIsCreating(false);
                }}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  selectedNote?.id === note.id
                    ? getContrastClass('bg-blue-100 border-blue-300', 'bg-gray-800 border-yellow-400')
                    : getContrastClass('bg-white border-gray-200 hover:bg-gray-50', 'bg-gray-800 border-gray-600 hover:bg-gray-700')
                }`}
                style={{ backgroundColor: selectedNote?.id !== note.id ? note.color : undefined }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={getContrastClass(
                    "font-medium text-gray-900 text-sm line-clamp-1",
                    "font-medium text-yellow-400 text-sm line-clamp-1"
                  )}>
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    {note.type === 'voice' && <Mic size={12} className="text-blue-500" />}
                    {note.type === 'meeting' && <Users size={12} className="text-green-500" />}
                    {note.isRecording && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  </div>
                </div>
                
                <p className={getContrastClass(
                  "text-xs text-gray-600 line-clamp-3",
                  "text-xs text-yellow-200 line-clamp-3"
                )}>
                  {note.content || 'No content...'}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={getContrastClass(
                    "text-xs text-gray-500",
                    "text-xs text-yellow-300"
                  )}>
                    {note.updatedAt.toLocaleDateString()}
                  </span>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="text-center py-8">
                <FileText size={48} className={getContrastClass("text-gray-300 mx-auto mb-4", "text-gray-600 mx-auto mb-4")} />
                <p className={getContrastClass("text-gray-500", "text-gray-400")}>
                  {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className={getContrastClass(
                "bg-white border-b border-gray-200 p-4",
                "bg-gray-900 border-b border-yellow-400/20 p-4"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                    className={getContrastClass(
                      "text-xl font-bold bg-transparent border-none focus:outline-none text-gray-900",
                      "text-xl font-bold bg-transparent border-none focus:outline-none text-yellow-400"
                    )}
                    placeholder="Note title..."
                  />
                  
                  <div className="flex items-center gap-2">
                    {selectedNote.type === 'voice' && (
                      <button
                        onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                        className={`p-2 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : getContrastClass(
                                'bg-blue-500 text-white hover:bg-blue-600',
                                'bg-yellow-400 text-black hover:bg-yellow-300'
                              )
                        }`}
                        title={isRecording ? 'Stop Recording' : 'Start Recording'}
                      >
                        {isRecording ? <Square size={16} /> : <Mic size={16} />}
                      </button>
                    )}
                    
                    {selectedNote.type === 'meeting' && (
                      <button
                        onClick={generateMeetingMinutes}
                        disabled={isGeneratingMinutes}
                        className={getContrastClass(
                          "p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50",
                          "p-2 bg-green-400 text-black rounded-lg hover:bg-green-300 disabled:opacity-50"
                        )}
                        title="Generate Meeting Minutes"
                      >
                        {isGeneratingMinutes ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Sparkles size={16} />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className={getContrastClass(
                        "p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors",
                        "p-2 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                      )}
                      title="Delete Note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Meeting Details */}
                {selectedNote.type === 'meeting' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={getContrastClass(
                        "block text-sm font-medium text-gray-700 mb-1",
                        "block text-sm font-medium text-yellow-400 mb-1"
                      )}>
                        Meeting Date
                      </label>
                      <input
                        type="datetime-local"
                        value={selectedNote.meetingDate?.toISOString().slice(0, 16) || ''}
                        onChange={(e) => updateNote(selectedNote.id, { 
                          meetingDate: e.target.value ? new Date(e.target.value) : undefined 
                        })}
                        className={getContrastClass(
                          "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                          "w-full p-2 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-400"
                        )}
                      />
                    </div>
                    <div>
                      <label className={getContrastClass(
                        "block text-sm font-medium text-gray-700 mb-1",
                        "block text-sm font-medium text-yellow-400 mb-1"
                      )}>
                        Attendees (comma separated)
                      </label>
                      <input
                        type="text"
                        value={selectedNote.attendees?.join(', ') || ''}
                        onChange={(e) => updateNote(selectedNote.id, { 
                          attendees: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                        })}
                        placeholder="John Doe, Jane Smith..."
                        className={getContrastClass(
                          "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                          "w-full p-2 bg-gray-800 border border-yellow-400 text-yellow-100 rounded-lg focus:ring-2 focus:ring-yellow-400"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Recording Status */}
                {isRecording && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-700 text-sm font-medium">Recording in progress...</span>
                    <Volume2 size={16} className="text-red-500" />
                  </div>
                )}
              </div>

              {/* Note Content */}
              <div className="flex-1 p-4">
                <textarea
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  placeholder={
                    selectedNote.type === 'meeting' 
                      ? "• Agenda item 1\n• Discussion points\n• Decisions made\n• Action items\n• Next steps..."
                      : selectedNote.type === 'voice'
                      ? "Start recording to capture voice notes automatically, or type additional notes here..."
                      : "Start typing your notes here..."
                  }
                  className={getContrastClass(
                    "w-full h-full resize-none border-none focus:outline-none text-gray-900 bg-transparent",
                    "w-full h-full resize-none border-none focus:outline-none text-yellow-100 bg-transparent"
                  )}
                  style={{ fontFamily: 'inherit', fontSize: '14px', lineHeight: '1.5' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText size={64} className={getContrastClass("text-gray-300 mx-auto mb-4", "text-gray-600 mx-auto mb-4")} />
                <h2 className={getContrastClass("text-xl font-medium text-gray-600 mb-2", "text-xl font-medium text-gray-400 mb-2")}>
                  Select a note to start editing
                </h2>
                <p className={getContrastClass("text-gray-500", "text-gray-500")}>
                  Choose from the sidebar or create a new note
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  Generated Meeting Minutes
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedMinutes)}
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
                <pre className="whitespace-pre-wrap font-sans">{generatedMinutes}</pre>
              </div>
            </div>
            
            <div className={getContrastClass(
              "bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3",
              "bg-gray-800 px-6 py-4 border-t border-yellow-400/20 flex justify-end gap-3"
            )}>
              <button
                onClick={() => {
                  if (selectedNote) {
                    updateNote(selectedNote.id, { 
                      content: selectedNote.content + '\n\n=== GENERATED MEETING MINUTES ===\n\n' + generatedMinutes 
                    });
                  }
                  setShowMinutesModal(false);
                }}
                className={getContrastClass(
                  "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                  "px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition-colors"
                )}
              >
                Add to Note
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