export const mockCourseData = {
  id: '1',
  title: 'Introduction to Web Development',
  description: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript. This comprehensive course will take you from beginner to intermediate level.',
  level: 'Beginner',
  category: 'Programming',
  duration: 40,
  price: 49.99,
  rating: 4.5,
  reviewCount: 128,
  instructor: {
    name: 'John Smith',
    title: 'Senior Web Developer',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'John has over 10 years of experience in web development and has taught thousands of students worldwide. He specializes in front-end development and user experience design.',
  },
  modules: [
    {
      id: '1',
      title: 'Getting Started with HTML',
      videos: [
        {
          id: '1',
          title: 'Introduction to HTML',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '10:00',
        },
        {
          id: '2',
          title: 'HTML Elements and Tags',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '15:00',
        },
        {
          id: '3',
          title: 'Forms and Input Elements',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '20:00',
        },
      ],
    },
    {
      id: '2',
      title: 'CSS Fundamentals',
      videos: [
        {
          id: '4',
          title: 'Introduction to CSS',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '12:00',
        },
        {
          id: '5',
          title: 'CSS Selectors and Properties',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '18:00',
        },
        {
          id: '6',
          title: 'CSS Layout and Positioning',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '25:00',
        },
      ],
    },
    {
      id: '3',
      title: 'JavaScript Basics',
      videos: [
        {
          id: '7',
          title: 'Introduction to JavaScript',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '15:00',
        },
        {
          id: '8',
          title: 'Variables and Data Types',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '20:00',
        },
        {
          id: '9',
          title: 'Functions and Control Flow',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          duration: '22:00',
        },
      ],
    },
  ],
  learningObjectives: [
    'Understand the basics of HTML structure and elements',
    'Master CSS styling and layout techniques',
    'Learn JavaScript fundamentals and DOM manipulation',
    'Build responsive and interactive web pages',
    'Develop a portfolio-worthy project',
  ],
  reviews: [
    {
      id: '1',
      userName: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent course! The instructor explains concepts clearly and provides practical examples. I learned a lot!',
    },
    {
      id: '2',
      userName: 'Michael Brown',
      rating: 4,
      comment: 'Great introduction to web development. The course structure is well-organized and easy to follow.',
    },
    {
      id: '3',
      userName: 'Emma Wilson',
      rating: 5,
      comment: 'Perfect for beginners! The instructor\'s teaching style is engaging and the content is comprehensive.',
    },
  ],
}; 