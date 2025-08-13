import React, { useState } from 'react';
import { MessageCircle, Send, User, Heart, Share2, MoreHorizontal, Image, Hash, AtSign } from 'lucide-react';

export default function CommunityApp({ messages, setMessages, getContrastClass }) {
  const [newMessage, setNewMessage] = useState('');
  const [postType, setPostType] = useState('thought'); // thought, feedback, blog
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        author: "Current User",
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        replies: Math.floor(Math.random() * 5),
        likes: Math.floor(Math.random() * 10),
        type: postType,
        isLiked: false
      };
      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

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
    <div className="p-4 space-y-4 pb-24">
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-6 shadow-xl border-2 border-yellow-400"
      )}>
        <h2 className={getContrastClass(
          "text-2xl font-light text-slate-900 mb-2",
          "text-2xl font-light text-yellow-400 mb-2"
        )}>
          🌟 Community Hub
        </h2>
        <p className={getContrastClass(
          "text-slate-600",
          "text-yellow-200"
        )}>
          Share thoughts, feedback, and mini blog posts with the community
        </p>
      </div>

      {/* Post Creation Card */}
      <div className={getContrastClass(
        "bg-white/60 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-white/20",
        "bg-gray-900 rounded-3xl p-4 shadow-xl border-2 border-yellow-400"
      )}>
        {/* Post Type Selector */}
        <div className="flex gap-2 mb-4">
          {[
            { type: 'thought', label: '💭 Thought', desc: 'Quick thoughts' },
            { type: 'feedback', label: '💬 Feedback', desc: 'Share feedback' },
            { type: 'blog', label: '📝 Blog Post', desc: 'Write a story' }
          ].map((option) => (
            <button
              key={option.type}
              onClick={() => setPostType(option.type)}
              className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                postType === option.type
                  ? `bg-gradient-to-r ${getPostTypeColor(option.type)} text-white shadow-lg`
                  : getContrastClass(
                      'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-600'
                    )
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs opacity-80">{option.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="flex gap-3">
          <div className={getContrastClass(
            "w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0",
            "w-10 h-10 bg-gray-700 border border-yellow-400 rounded-full flex items-center justify-center flex-shrink-0"
          )}>
            <User size={20} className={getContrastClass("text-white", "text-yellow-400")} />
          </div>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                postType === 'thought' 
                  ? "What's on your mind? Share your thoughts..."
                  : postType === 'feedback'
                  ? "Share your feedback about school, events, or improvements..."
                  : "Write your mini blog post or story..."
              }
              className={getContrastClass(
                "w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none",
                "w-full p-3 rounded-xl border border-gray-600 bg-gray-800 text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              )}
              rows={postType === 'blog' ? 5 : 3}
            />
          </div>
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <button className={getContrastClass(
              "text-gray-500 hover:text-blue-500 transition-colors",
              "text-yellow-400 hover:text-yellow-300 transition-colors"
            )}>
              <Image size={20} />
            </button>
            <button className={getContrastClass(
              "text-gray-500 hover:text-blue-500 transition-colors",
              "text-yellow-400 hover:text-yellow-300 transition-colors"
            )}>
              <Hash size={20} />
            </button>
            <button className={getContrastClass(
              "text-gray-500 hover:text-blue-500 transition-colors",
              "text-yellow-400 hover:text-yellow-300 transition-colors"
            )}>
              <AtSign size={20} />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${getPostTypeColor(postType)} text-white hover:shadow-lg transform hover:scale-105 active:scale-95`}
          >
            <Send size={16} />
            {postType === 'blog' ? 'Publish' : 'Share'}
          </button>
        </div>
      </div>

      {/* Posts Feed */}
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
                Just now
              </span>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className={getContrastClass(
            "bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 text-center",
            "bg-gray-900 rounded-3xl p-8 shadow-xl border-2 border-yellow-400 text-center"
          )}>
            <div className="text-6xl mb-4">🌟</div>
            <h3 className={getContrastClass(
              "text-lg font-semibold text-slate-900 mb-2",
              "text-lg font-semibold text-yellow-400 mb-2"
            )}>
              Welcome to the Community Hub!
            </h3>
            <p className={getContrastClass(
              "text-slate-600",
              "text-yellow-200"
            )}>
              Be the first to share your thoughts, feedback, or write a mini blog post.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}