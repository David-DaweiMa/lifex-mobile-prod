import { Booking, TrendingData, DiscoverContent } from '../types';

export const mockBookings: Booking[] = [
  {
    id: 1,
    service: 'Haircut & Style',
    provider: 'The Barber Shop',
    date: '2024-01-15',
    time: '2:00 PM',
    status: 'confirmed',
    category: 'Beauty',
    price: '$45',
    reminder: true
  },
  {
    id: 2,
    service: 'Deep Tissue Massage',
    provider: 'Spa Relax',
    date: '2024-01-18',
    time: '10:00 AM',
    status: 'pending',
    category: 'Wellness',
    price: '$120',
    reminder: false
  },
  {
    id: 3,
    service: 'Car Service',
    provider: 'AutoCare Plus',
    date: '2024-01-20',
    time: '9:00 AM',
    status: 'confirmed',
    category: 'Automotive',
    price: '$180',
    reminder: true
  }
];

export const mockTrendingData: TrendingData[] = [
  {
    id: 1,
    title: 'Plant-Based Cafes',
    category: 'Food & Drink',
    growth: '+45%',
    description: 'Sustainable dining is trending up',
    icon: '🌱',
    color: '#10b981',
    trend: 'up'
  },
  {
    id: 2,
    title: 'Virtual Fitness Classes',
    category: 'Health & Fitness',
    growth: '+32%',
    description: 'Home workouts continue to grow',
    icon: '💪',
    color: '#f59e0b',
    trend: 'up'
  },
  {
    id: 3,
    title: 'Local Artisan Markets',
    category: 'Shopping',
    growth: '+28%',
    description: 'Supporting local creators',
    icon: '🎨',
    color: '#a855f7',
    trend: 'up'
  },
  {
    id: 4,
    title: 'Eco-Friendly Services',
    category: 'Lifestyle',
    growth: '+52%',
    description: 'Green alternatives on the rise',
    icon: '♻️',
    color: '#10b981',
    trend: 'up'
  }
];

export const mockDiscoverContent: DiscoverContent[] = [
  {
    id: 1,
    title: 'Hidden Gems: Auckland\'s Best Kept Secrets',
    description: 'Discover the local spots that only Aucklanders know about',
    category: 'Lifestyle',
    author: 'Sarah Chen',
    likes: '1.2k',
    image: 'https://example.com/image1.jpg',
    tags: ['Local', 'Hidden Gems', 'Auckland'],
    readTime: '5 min'
  },
  {
    id: 2,
    title: 'The Ultimate Guide to NZ Coffee Culture',
    description: 'From flat whites to cold brew, explore New Zealand\'s coffee scene',
    category: 'Food & Drink',
    author: 'Mike Johnson',
    likes: '856',
    image: 'https://example.com/image2.jpg',
    tags: ['Coffee', 'Culture', 'Guide'],
    readTime: '8 min'
  },
  {
    id: 3,
    title: 'Sustainable Living in Auckland',
    description: 'Eco-friendly businesses making a difference in our city',
    category: 'Environment',
    author: 'Emma Wilson',
    likes: '2.1k',
    image: 'https://example.com/image3.jpg',
    tags: ['Sustainability', 'Eco-friendly', 'Local Business'],
    readTime: '6 min'
  }
];

export const quickPrompts = [
  [
    "Best coffee shops for remote work?",
    "Family-friendly restaurants?",
    "Weekend activities in Auckland?",
    "Shopping centers and malls?",
    "Pet-friendly places?"
  ],
  [
    "Hair salons near me?",
    "Gym and fitness centers?",
    "Beauty and spa services?",
    "Home improvement stores?",
    "Car repair shops?"
  ],
  [
    "Best brunch spots?",
    "Date night restaurants?",
    "Kids' entertainment?",
    "Outdoor activities?",
    "Cultural attractions?"
  ]
];

export const recentDiscoveries = [
  {
    text: "Found an amazing vegan cafe in Ponsonby with the best oat milk lattes ☕️"
  },
  {
    text: "Discovered a hidden bookshop with rare NZ literature 📚"
  },
  {
    text: "Stumbled upon a local pottery workshop - perfect for date night! 🏺"
  },
  {
    text: "Found the best fish and chips in Mission Bay 🐟"
  },
  {
    text: "Local farmer's market has incredible organic produce 🌱"
  }
];
