import { Booking, TrendingData, DiscoverContent, SpecialsData } from '../types';

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
    trend: 'up',
    author: 'foodie_nz',
    likes: '1.2k',
    tags: ['vegan', 'sustainable', 'cafe'],
    readTime: '3 min'
  },
  {
    id: 2,
    title: 'Virtual Fitness Classes',
    category: 'Health & Fitness',
    growth: '+32%',
    description: 'Home workouts continue to grow',
    icon: '💪',
    color: '#f59e0b',
    trend: 'up',
    author: 'fitness_kiwi',
    likes: '856',
    tags: ['fitness', 'virtual', 'home'],
    readTime: '2 min'
  },
  {
    id: 3,
    title: 'Local Artisan Markets',
    category: 'Shopping',
    growth: '+28%',
    description: 'Supporting local creators',
    icon: '🎨',
    color: '#a855f7',
    trend: 'up',
    author: 'art_lover',
    likes: '2.1k',
    tags: ['artisan', 'local', 'handmade'],
    readTime: '4 min'
  },
  {
    id: 4,
    title: 'Eco-Friendly Services',
    category: 'Lifestyle',
    growth: '+52%',
    description: 'Green alternatives on the rise',
    icon: '♻️',
    color: '#10b981',
    trend: 'up',
    author: 'eco_warrior',
    likes: '1.8k',
    tags: ['eco', 'green', 'sustainable'],
    readTime: '3 min'
  },
  {
    id: 5,
    title: 'Remote Work Spaces',
    category: 'Business',
    growth: '+38%',
    description: 'Co-working and flexible office solutions',
    icon: '💻',
    color: '#3b82f6',
    trend: 'up',
    author: 'work_nomad',
    likes: '945',
    tags: ['coworking', 'remote', 'office'],
    readTime: '4 min'
  },
  {
    id: 6,
    title: 'Pet Care Services',
    category: 'Services',
    growth: '+41%',
    description: 'Growing demand for pet wellness',
    icon: '🐕',
    color: '#f97316',
    trend: 'up',
    author: 'pet_lover_nz',
    likes: '1.5k',
    tags: ['pets', 'wellness', 'care'],
    readTime: '3 min'
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
  "Best coffee shops for remote work?",
  "Family-friendly restaurants?",
  "Weekend activities in Auckland?",
  "Shopping centers and malls?",
  "Pet-friendly places?",
  "Hair salons near me?",
  "Gym and fitness centers?",
  "Beauty and spa services?",
  "Home improvement stores?",
  "Car repair shops?",
  "Best brunch spots?",
  "Date night restaurants?",
  "Kids' entertainment?",
  "Outdoor activities?",
  "Cultural attractions?"
];

export const mockSpecialsData: SpecialsData[] = [
  {
    id: 1,
    title: '50% Off Coffee & Pastry Combo',
    business: 'Cafe Mornings',
    category: 'Food & Drink',
    discount: '50%',
    originalPrice: '$15',
    newPrice: '$7.50',
    validUntil: '2024-02-15',
    description: 'Perfect morning combo with our signature blend'
  },
  {
    id: 2,
    title: 'Free Consultation + 20% Off',
    business: 'Spa Relax',
    category: 'Beauty & Spa',
    discount: '20%',
    originalPrice: '$120',
    newPrice: '$96',
    validUntil: '2024-02-20',
    description: 'Deep tissue massage with free wellness consultation'
  },
  {
    id: 3,
    title: 'Buy 1 Get 1 Free Gym Pass',
    business: 'FitZone',
    category: 'Fitness',
    discount: '50%',
    originalPrice: '$40',
    newPrice: '$20',
    validUntil: '2024-02-25',
    description: 'Bring a friend and both get full access'
  },
  {
    id: 4,
    title: '30% Off Organic Groceries',
    business: 'Green Market',
    category: 'Shopping',
    discount: '30%',
    originalPrice: '$50',
    newPrice: '$35',
    validUntil: '2024-02-18',
    description: 'Stock up on organic groceries and household items'
  },
  {
    id: 5,
    title: 'Hair Cut & Style - 40% Off',
    business: 'Style Studio',
    category: 'Beauty',
    discount: '40%',
    originalPrice: '$80',
    newPrice: '$48',
    validUntil: '2024-02-22',
    description: 'Professional haircut and styling with experienced stylists'
  },
  {
    id: 6,
    title: 'Car Wash & Wax Package',
    business: 'Auto Shine',
    category: 'Services',
    discount: '25%',
    originalPrice: '$60',
    newPrice: '$45',
    validUntil: '2024-02-28',
    description: 'Complete car wash, wax, and interior cleaning'
  }
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

// Business listing data for Discover page
export const mockEventsData: any[] = [
  {
    id: 1,
    title: 'Auckland Food & Wine Festival',
    date: '2024-02-15',
    time: '12:00 PM - 8:00 PM',
    location: 'Viaduct Harbour',
    category: 'Food & Drink',
    price: '$25',
    attendees: '2.3k',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    description: 'Celebrate local cuisine and premium wines',
    tags: ['food', 'wine', 'festival'],
    isHot: true
  },
  {
    id: 2,
    title: 'Auckland Marathon 2024',
    date: '2024-03-10',
    time: '6:30 AM - 12:00 PM',
    location: 'Auckland Domain',
    category: 'Sports & Fitness',
    price: 'Free',
    attendees: '8.5k',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    description: 'Join thousands of runners in this iconic race',
    tags: ['marathon', 'fitness', 'community'],
    isHot: true
  },
  {
    id: 3,
    title: 'NZ Art Week Exhibition',
    date: '2024-02-20',
    time: '10:00 AM - 6:00 PM',
    location: 'Auckland Art Gallery',
    category: 'Arts & Culture',
    price: '$15',
    attendees: '1.8k',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    description: 'Contemporary New Zealand artists showcase',
    tags: ['art', 'exhibition', 'culture'],
    isHot: false
  },
  {
    id: 4,
    title: 'Tech Innovation Summit',
    date: '2024-02-28',
    time: '9:00 AM - 5:00 PM',
    location: 'Aotea Centre',
    category: 'Business & Technology',
    price: '$120',
    attendees: '950',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    description: 'Leading tech companies and startups',
    tags: ['tech', 'innovation', 'networking'],
    isHot: false
  },
  {
    id: 5,
    title: 'Summer Music Festival',
    date: '2024-03-15',
    time: '2:00 PM - 11:00 PM',
    location: 'Western Springs',
    category: 'Music & Entertainment',
    price: '$85',
    attendees: '12k',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    description: 'Local and international artists perform',
    tags: ['music', 'festival', 'summer'],
    isHot: true
  }
];

export const mockFeaturedPlaces: any[] = [
  {
    id: 1,
    name: 'The French Cafe',
    type: 'Fine Dining',
    category: 'Food & Drink',
    rating: 4.8,
    reviewCount: '342',
    price: '$$$',
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    address: '210 Symonds Street, Auckland',
    highlights: ['Michelin Guide', 'Wine Pairing', 'Romantic Dining'],
    isFeatured: true
  },
  {
    id: 2,
    name: 'Ponsonby Central',
    type: 'Food Hall',
    category: 'Food & Drink',
    rating: 4.6,
    reviewCount: '1.2k',
    price: '$$',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    address: '136 Ponsonby Road, Ponsonby',
    highlights: ['Multiple Vendors', 'Local Artisans', 'Outdoor Seating'],
    isFeatured: true
  },
  {
    id: 3,
    name: 'Auckland Art Gallery',
    type: 'Museum & Gallery',
    category: 'Arts & Culture',
    rating: 4.7,
    reviewCount: '856',
    price: 'Free',
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    address: 'Corner Kitchener and Wellesley Streets',
    highlights: ['NZ Art Collection', 'Temporary Exhibitions', 'Cafe'],
    isFeatured: true
  },
  {
    id: 4,
    name: 'Britomart Precinct',
    type: 'Shopping & Dining',
    category: 'Shopping',
    rating: 4.5,
    reviewCount: '2.1k',
    price: '$$',
    distance: '0.3 km',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    address: 'Tyler Street, Britomart',
    highlights: ['Boutique Shops', 'Restaurants', 'Historic Buildings'],
    isFeatured: false
  },
  {
    id: 5,
    name: 'Viaduct Harbour',
    type: 'Marina & Entertainment',
    category: 'Entertainment',
    rating: 4.4,
    reviewCount: '1.8k',
    price: '$$',
    distance: '0.7 km',
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400&h=200&fit=crop&crop=center&auto=format&q=60',
    address: 'Viaduct Harbour, Auckland',
    highlights: ['Waterfront Dining', 'Yacht Watching', 'Bars & Clubs'],
    isFeatured: false
  }
];

export const mockBusinessList: any[] = [
  {
    id: 1,
    name: "Orphan's Kitchen",
    type: "Restaurant",
    category: "Food & Drink",
    rating: 4.5,
    reviewCount: 128,
    price: "$$",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "118 Ponsonby Road, Ponsonby, Auckland",
    highlights: ["Modern NZ cuisine", "Great cocktails", "Outdoor seating"],
    isOpen: true,
    aiReason: "Trending local favorite with innovative menu",
    openingHours: "Mon-Sun: 5:30 PM - 10:00 PM",
    confidence: 0.92,
    opening_hours: "Mon-Sun: 5:30 PM - 10:00 PM"
  },
  {
    id: 2,
    name: "Amano Restaurant",
    type: "Restaurant", 
    category: "Food & Drink",
    rating: 4.7,
    reviewCount: 89,
    price: "$$$",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "68-86 Tyler Street, Britomart, Auckland",
    highlights: ["Italian cuisine", "Fresh pasta", "Wine selection"],
    isOpen: true,
    aiReason: "Highly rated Italian restaurant with authentic flavors",
    openingHours: "Mon-Sun: 7:00 AM - 11:00 PM",
    confidence: 0.89,
    opening_hours: "Mon-Sun: 7:00 AM - 11:00 PM"
  },
  {
    id: 3,
    name: "The Barber Shop",
    type: "Beauty & Personal Care",
    category: "Services",
    rating: 4.3,
    reviewCount: 67,
    price: "$",
    distance: "0.5 km",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "45 High Street, Auckland CBD",
    highlights: ["Traditional barbering", "Beard styling", "Walk-ins welcome"],
    isOpen: true,
    aiReason: "Classic barber experience with skilled stylists",
    openingHours: "Mon-Sat: 9:00 AM - 6:00 PM",
    confidence: 0.85,
    opening_hours: "Mon-Sat: 9:00 AM - 6:00 PM"
  },
  {
    id: 4,
    name: "Les Mills Newmarket",
    type: "Gym & Fitness",
    category: "Health & Fitness",
    rating: 4.4,
    reviewCount: 156,
    price: "$$",
    distance: "2.1 km",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "277 Broadway, Newmarket, Auckland",
    highlights: ["Group classes", "Personal training", "Modern equipment"],
    isOpen: true,
    aiReason: "Premium fitness center with excellent facilities",
    openingHours: "Mon-Fri: 5:30 AM - 10:00 PM, Sat-Sun: 7:00 AM - 8:00 PM",
    confidence: 0.91,
    opening_hours: "Mon-Fri: 5:30 AM - 10:00 PM, Sat-Sun: 7:00 AM - 8:00 PM"
  },
  {
    id: 5,
    name: "Spa Relax",
    type: "Beauty & Personal Care",
    category: "Services",
    rating: 4.6,
    reviewCount: 94,
    price: "$$$",
    distance: "1.8 km",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "12 Shortland Street, Auckland CBD",
    highlights: ["Deep tissue massage", "Facial treatments", "Relaxation therapy"],
    isOpen: true,
    aiReason: "Luxury spa with professional therapists",
    openingHours: "Mon-Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 6:00 PM",
    confidence: 0.88,
    opening_hours: "Mon-Sat: 9:00 AM - 9:00 PM, Sun: 10:00 AM - 6:00 PM"
  },
  {
    id: 6,
    name: "Green Market",
    type: "Grocery Store",
    category: "Shopping",
    rating: 4.2,
    reviewCount: 43,
    price: "$$",
    distance: "1.5 km",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&crop=center&auto=format&q=60",
    address: "89 Queen Street, Auckland CBD",
    highlights: ["Organic produce", "Local suppliers", "Fresh daily"],
    isOpen: true,
    aiReason: "Organic and sustainable grocery shopping",
    openingHours: "Mon-Sun: 7:00 AM - 9:00 PM",
    confidence: 0.82,
    opening_hours: "Mon-Sun: 7:00 AM - 9:00 PM"
  }
];
