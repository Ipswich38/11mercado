import React, { useState } from 'react';
import { MessageCircle, Send, User, Heart, Share2, MoreHorizontal, Image, Hash, AtSign, ArrowLeft } from 'lucide-react';

export default function CommunityHub({ onClose, getContrastClass, onShowTutorial }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      author: "Maria Santos",
      content: "So excited about the new AI tools in STEM! My daughter has been using the College Entrance Exam Quiz Generator and her confidence is growing. Thank you PTA for bringing these resources to our community!",
      timestamp: "2 hours ago",
      replies: 3,
      likes: 12,
      type: "feedback",
      isLiked: false
    },
    {
      id: 2,
      author: "Robert Cruz",
      content: "Just wanted to share my experience with the donation process. The new digital form made it so easy to contribute to our children's education. The receipt upload feature is brilliant!",
      timestamp: "5 hours ago",
      replies: 7,
      likes: 18,
      type: "thought",
      isLiked: false
    },
    {
      id: 3,
      author: "Anna Reyes",
      content: "Blog Post: Reflections on Digital Learning - As we embrace technology in education, I've been reflecting on how these AI tools are transforming the way our kids learn. The weather app might seem simple, but it's teaching them to stay informed about their environment. The community hub is bringing parents together like never before. What are your thoughts on balancing traditional and digital learning?",
      timestamp: "1 day ago",
      replies: 15,
      likes: 34,
      type: "blog",
      isLiked: false
    }
  ]);

  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleLike = (messageId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(messageId)) {
      newLikedPosts.delete(messageId);
    } else {
      newLikedPosts.add(messageId);
    }
    setLikedPosts(newLikedPosts);
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'feedback': return '💬';
      case 'blog': return '📝';
      default: return '💭';
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'feedback': return 'from-green-500 to-emerald-600';
      case 'blog': return 'from-purple-500 to-violet-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  return (
    <div className={getContrastClass(
      "min-h-screen bg-surface-50",
      "min-h-screen bg-surface-900"
    )}>
      {/* Header */}
      <header className={getContrastClass(
        "glass border-b border-surface-300 sticky top-0 z-40 shadow-material",
        "glass-dark border-b border-surface-700 sticky top-0 z-40 shadow-material"
      )}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={getContrastClass(
                "btn-text state-layer p-3 rounded-material text-surface-700",
                "btn-text state-layer p-3 rounded-material text-surface-300"
              )}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className={getContrastClass(
                "text-title-large text-surface-900",
                "text-title-large text-surface-100"
              )}>
                Community Hub
              </h1>
              <p className={getContrastClass("text-body-small text-surface-600", "text-body-small text-surface-400")}>
                Preview • Login for Full Access
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-24">
        <div className={getContrastClass(
          "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
        )}>
          <h2 className={getContrastClass(
            "text-2xl font-light text-slate-900 mb-2",
            "text-2xl font-light text-yellow-400 mb-2"
          )}>
            🌟 Community Hub Preview
          </h2>
          <p className={getContrastClass(
            "text-slate-600 mb-3",
            "text-yellow-200 mb-3"
          )}>
            See what our parent community is sharing • Login to participate and create posts
          </p>
          <div className={getContrastClass(
            "text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2",
            "text-sm text-yellow-300 bg-gray-800 border border-yellow-400 rounded-lg px-3 py-2"
          )}>
            💡 Login to share your thoughts, feedback, and mini blog posts with the community!
          </div>
        </div>

        {/* Sample Posts Feed */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={getContrastClass(
                "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
                "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
              )}
            >
              {/* Post Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getPostTypeColor(message.type || 'thought')} rounded-full flex items-center justify-center`}>
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={getContrastClass(
                      "font-semibold text-slate-900",
                      "font-semibold text-yellow-400"
                    )}>
                      {message.author}
                    </h4>
                    <span className="text-lg">{getPostTypeIcon(message.type || 'thought')}</span>
                    <span className={getContrastClass(
                      "text-xs text-slate-500",
                      "text-xs text-yellow-300"
                    )}>
                      {message.timestamp}
                    </span>
                  </div>
                  {/* Post Type Badge */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPostTypeColor(message.type || 'thought')} text-white mb-2`}>
                    {message.type === 'feedback' ? 'Feedback' : message.type === 'blog' ? 'Blog Post' : 'Thought'}
                  </div>
                </div>
                <button className={getContrastClass(
                  "text-gray-400 hover:text-gray-600",
                  "text-yellow-400 hover:text-yellow-300"
                )}>
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className={getContrastClass(
                  "text-slate-700 leading-relaxed",
                  "text-yellow-200 leading-relaxed"
                )}>
                  {message.content}
                </p>
              </div>
              
              {/* Social Actions */}
              <div className={`flex items-center justify-between pt-3 border-t ${getContrastClass('border-slate-200', 'border-gray-700')}`}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(message.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      likedPosts.has(message.id)
                        ? 'text-red-500'
                        : getContrastClass('text-slate-600 hover:text-red-500', 'text-yellow-300 hover:text-red-400')
                    }`}
                  >
                    <Heart size={16} className={likedPosts.has(message.id) ? 'fill-current' : ''} />
                    <span className="text-sm">{(message.likes || 0) + (likedPosts.has(message.id) ? 1 : 0)} likes</span>
                  </button>
                  
                  <button className={getContrastClass(
                    "flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors",
                    "flex items-center gap-2 text-yellow-300 hover:text-yellow-400 transition-colors"
                  )}>
                    <MessageCircle size={16} />
                    <span className="text-sm">{message.replies} replies</span>
                  </button>
                  
                  <button className={getContrastClass(
                    "flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors",
                    "flex items-center gap-2 text-yellow-300 hover:text-green-400 transition-colors"
                  )}>
                    <Share2 size={16} />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                
                {/* Time ago indicator */}
                <span className={getContrastClass(
                  "text-xs text-slate-400",
                  "text-xs text-yellow-400"
                )}>
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={getContrastClass(
          "bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-6 shadow-xl text-center",
          "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400 text-center"
        )}>
          <div className="text-5xl mb-3">🚀</div>
          <h3 className={getContrastClass(
            "text-xl font-semibold text-white mb-2",
            "text-xl font-semibold text-yellow-400 mb-2"
          )}>
            Join the Conversation!
          </h3>
          <p className={getContrastClass(
            "text-white/90 mb-4",
            "text-yellow-200 mb-4"
          )}>
            Login to share your thoughts, provide feedback, or write mini blog posts for the community.
          </p>
          <div className={getContrastClass(
            "text-sm text-white/80",
            "text-sm text-yellow-300"
          )}>
            Available features: Post thoughts • Share feedback • Write blog posts • Comment • Like • Share
          </div>
        </div>
      </div>
    </div>
  );
}