// School feed service to fetch posts from school website and social media
const SCHOOL_WEBSITE = 'https://depedcsjdmnshs.weebly.com/';
const SCHOOL_FACEBOOK = 'https://www.facebook.com/csjdmnshs';

export const fetchSchoolFeed = async () => {
  try {
    // In a real implementation, you would:
    // 1. Use a backend service to scrape the school website
    // 2. Use Facebook Graph API to fetch posts
    // 3. Process and format the data

    // For demo purposes, return mock data that simulates real school posts
    return getMockSchoolFeed();
  } catch (error) {
    console.error('Error fetching school feed:', error);
    return getMockSchoolFeed();
  }
};

const getMockSchoolFeed = () => {
  return [
    {
      id: 1,
      source: 'website',
      title: 'Enrollment for SY 2024-2025 Now Open',
      content:
        'We are now accepting enrollments for the upcoming school year 2024-2025. Visit our office from 8:00 AM to 4:00 PM, Monday to Friday.',
      link: SCHOOL_WEBSITE,
      timestamp: '2 hours ago',
      type: 'announcement',
      image: null,
    },
    {
      id: 2,
      source: 'facebook',
      title: 'Congratulations to our STEM Students!',
      content:
        '🎉 Proud of our Grade 11 STEM students who won 1st place in the Regional Science Fair! Their project on sustainable energy solutions impressed all the judges.',
      link: SCHOOL_FACEBOOK,
      timestamp: '1 day ago',
      type: 'achievement',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    },
    {
      id: 3,
      source: 'website',
      title: 'Parent-Teacher Conference Schedule',
      content:
        "Parent-Teacher Conference will be held on February 15-16, 2024. Please check your child's class schedule for specific time slots.",
      link: SCHOOL_WEBSITE,
      timestamp: '2 days ago',
      type: 'event',
      image: null,
    },
    {
      id: 4,
      source: 'facebook',
      title: 'New Laboratory Equipment Arrival',
      content:
        '🔬 Exciting news! Our new state-of-the-art laboratory equipment has arrived! Students will now have access to advanced microscopes and scientific apparatus.',
      link: SCHOOL_FACEBOOK,
      timestamp: '3 days ago',
      type: 'update',
      image:
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop',
    },
    {
      id: 5,
      source: 'website',
      title: 'Academic Calendar Update',
      content:
        'Please note the updated academic calendar for the 3rd quarter. Classes will resume on February 19, 2024 after the mid-term break.',
      link: SCHOOL_WEBSITE,
      timestamp: '4 days ago',
      type: 'announcement',
      image: null,
    },
  ];
};

export const getPostTypeIcon = (type) => {
  const iconMap = {
    announcement: '📢',
    achievement: '🏆',
    event: '📅',
    update: '📰',
  };
  return iconMap[type] || '📝';
};

export const getSourceIcon = (source) => {
  const iconMap = {
    website: '🌐',
    facebook: '📘',
  };
  return iconMap[source] || '📄';
};
