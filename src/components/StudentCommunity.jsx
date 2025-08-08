import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  Users,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Award,
  Star,
  Clock,
  MapPin,
  Send,
  Heart,
  Share,
  MoreHorizontal,
  UserPlus,
  Bell,
  Search,
  Filter,
} from 'lucide-react';

const StudentCommunity = ({ officers }) => {
  const [activeTab, setActiveTab] = useState('officers');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced officers data
  const enhancedOfficers = officers.map((officer, index) => ({
    ...officer,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + index * 100000000}?w=100&h=100&fit=crop&crop=face`,
    department: ['Mathematics', 'Science', 'English', 'History'][index % 4],
    experience: `${5 + index * 2} years`,
    rating: (4.5 + index * 0.1).toFixed(1),
    specialties: [
      ['Algebra', 'Calculus', 'Statistics'],
      ['Physics', 'Chemistry', 'Biology'],
      ['Literature', 'Writing', 'Grammar'],
      ['World History', 'Government', 'Economics'],
    ][index % 4],
    availability: [
      'Available now',
      'Busy until 3 PM',
      'Available after 4 PM',
      'Available tomorrow',
    ][index % 4],
    status: ['online', 'busy', 'away', 'offline'][index % 4],
    students: Math.floor(Math.random() * 50) + 20,
    responseTime: ['< 1 hour', '< 2 hours', '< 30 mins', '< 3 hours'][
      index % 4
    ],
  }));

  // Mock community posts
  const communityPosts = [
    {
      id: 1,
      author: 'Sarah Chen',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face',
      time: '2 hours ago',
      content:
        'Just finished my chemistry project on renewable energy! The virtual lab tools were amazing. Thanks to Ms. Davis for the guidance! 🧪⚡',
      likes: 15,
      comments: 3,
      type: 'achievement',
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      time: '4 hours ago',
      content:
        "Study group for the upcoming math competition this Saturday at 2 PM in the library. Who's in? 📚",
      likes: 8,
      comments: 7,
      type: 'event',
    },
    {
      id: 3,
      author: 'Emma Wilson',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      time: '1 day ago',
      content:
        'Amazing presentation by Dr. Smith on quantum physics today! Mind blown 🤯 The interactive simulations made everything so clear.',
      likes: 23,
      comments: 5,
      type: 'feedback',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  const filteredOfficers = enhancedOfficers.filter(
    (officer) =>
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">👥 Community Hub</h1>
        <p className="text-white/90">
          Connect with teachers, mentors, and fellow students
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-lg">
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'officers' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('officers')}
            className="flex-1"
          >
            <Users size={16} className="mr-2" />
            Teachers & Mentors
          </Button>
          <Button
            variant={activeTab === 'community' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('community')}
            className="flex-1"
          >
            <MessageCircle size={16} className="mr-2" />
            Community Feed
          </Button>
        </div>
      </div>

      {activeTab === 'officers' && (
        <>
          {/* Search */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search teachers and mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Officers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOfficers.map((officer) => (
              <div
                key={officer.id}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Officer Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {officer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(officer.status)} rounded-full border-2 border-white`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {officer.name}
                    </h3>
                    <p className="text-sm text-gray-600">{officer.role}</p>
                    <p className="text-sm font-medium text-pink-600">
                      {officer.department}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className={`w-2 h-2 ${getStatusColor(officer.status)} rounded-full`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {getStatusText(officer.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="text-yellow-500" size={14} />
                      <span className="font-bold text-gray-900">
                        {officer.rating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="text-green-500" size={14} />
                      <span className="font-bold text-gray-900">
                        {officer.students}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Specialties:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {officer.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="text-gray-500" size={14} />
                    <span className="text-sm font-medium text-gray-700">
                      Availability
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {officer.availability}
                  </p>
                  <p className="text-xs text-gray-500">
                    Response time: {officer.responseTime}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <MessageCircle size={14} className="mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone size={14} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'community' && (
        <>
          {/* Post Creation */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Share your thoughts, achievements, or ask for help..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  rows="3"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Share with community</span>
                  </div>
                  <Button size="sm">
                    <Send size={14} className="mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Community Posts */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {post.author
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {post.author}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={12} />
                        <span>{post.time}</span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.type === 'achievement'
                              ? 'bg-yellow-100 text-yellow-800'
                              : post.type === 'event'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {post.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors">
                      <Heart size={16} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle size={16} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share size={16} />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bell size={14} className="mr-2" />
                    Follow
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load More Posts
            </Button>
          </div>
        </>
      )}

      {/* Quick Contact */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-start gap-3">
          <MessageCircle className="text-purple-600 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">💬 Need Help?</h3>
            <p className="text-sm text-gray-700 mb-3">
              Don't hesitate to reach out to your teachers and mentors. They're
              here to support your learning journey!
            </p>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <UserPlus size={14} className="mr-2" />
              Find a Mentor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCommunity;
