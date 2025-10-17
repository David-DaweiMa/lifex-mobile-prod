# 🚀 LifeX Mobile App

A React Native mobile application for discovering local businesses, events, and services in New Zealand, powered by AI recommendations with RAG (Retrieval-Augmented Generation) architecture.

## 📱 Platform Support

- ✅ iOS (TestFlight / App Store)
- 🔄 Android (Coming soon)
- 🌐 Web (Development only)

## ✨ Features

- 🤖 **AI-Powered Chat**: Chat with LifeX AI to get personalized recommendations (RAG architecture with real-time data)
- 🏪 **Places**: Discover local businesses, restaurants, cafes, and more
- 🎉 **Events**: Find upcoming events and activities
- 🏷️ **Special Deals**: Exclusive offers and discounts
- ❤️ **Favorites**: Save and organize your favorite places
- 👤 **User Profile**: Manage your account and preferences
- 🔐 **Authentication**: Secure login and registration with email verification

## 🛠️ Tech Stack

### Frontend
- **React Native** with Expo SDK 52
- **TypeScript** for type safety
- **React Navigation** v7 for navigation
- Custom UI Components with modern design

### Backend
- **Supabase** (PostgreSQL + Edge Functions)
- **OpenAI API** (GPT-4o-mini for chat)
- **RAG Architecture** (Retrieval-Augmented Generation)

### Services
- **Expo Application Services (EAS)** for builds
- **TestFlight** for beta distribution
- **Google Places API** (planned for data acquisition)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants and theme
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/            # Screen components
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # App constants and theme
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (for testing)
npm run web
```

## Database Schema

The app uses the same Supabase database as the web version with the following main tables:

- `user_profiles` - User account information
- `businesses` - Business listings and details
- `chat_messages` - AI conversation history
- `trending_posts` - Community content
- `user_quotas` - Usage limits and subscriptions

## Features Overview

### Chat Screen
- AI-powered conversations with LifeX
- Personalized business recommendations
- Quick prompts for common queries
- Recent discoveries from the community

### Trending Screen
- Real-time trending topics and businesses
- Growth indicators and insights
- Category-based filtering

### Discover Screen
- Community-generated content
- Search and filter functionality
- Content categories and tags
- Share your own discoveries

### Specials Screen
- Exclusive deals and offers
- Category-based filtering
- Deal validation and claiming
- How-to guide for users

### Subscription (Coly)
- Free plan with limited features
- Essential and Premium upgrade options
- Feature comparison and pricing
- FAQ and support information

### Profile Screen
- User account management
- Subscription status and upgrade options
- Usage statistics
- App settings and preferences

## Development

### Adding New Screens

1. Create a new screen component in `src/screens/`
2. Add navigation configuration in `src/navigation/AppNavigator.tsx`
3. Update the navigation types if needed

### Styling

The app uses a consistent design system defined in `src/constants/theme.ts`:

- **Colors**: Primary purple, secondary green, accent yellow
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized spacing values
- **Border Radius**: Consistent rounded corners

### API Integration

- Chat service: `src/services/chatService.ts`
- Supabase client: `src/services/supabase.ts`
- Type definitions: `src/types/index.ts`

## Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📦 Deployment

### EAS Build
```bash
# Build for iOS (production)
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

### Environment Variables (EAS Secrets)
```bash
# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value your_url

# Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_key
```

## 📚 Documentation

For detailed information about the project architecture and implementation strategies:

- **[Project Roadmap](PROJECT_ROADMAP.md)** - Current status and future plans
- **[System Architecture](SYSTEM_ARCHITECTURE_OVERVIEW.md)** - High-level system design
- **[Data Acquisition Strategy](DATA_ACQUISITION_STRATEGY.md)** - How we collect business data
- **[Data Update Strategy](DATA_UPDATE_STRATEGY.md)** - Keeping data fresh
- **[Data Retrieval Optimization](DATA_RETRIEVAL_OPTIMIZATION.md)** - Search and recommendation algorithms
- **[Advanced Recommendation System](ADVANCED_RECOMMENDATION_SYSTEM.md)** - Personalized recommendations
- **[Google API Compliance](GOOGLE_API_COMPLIANCE_GUIDE.md)** - Google Places API usage guidelines
- **[Git Branch Strategy](GIT_BRANCH_STRATEGY.md)** - Version control workflow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the LifeX ecosystem for discovering local businesses in New Zealand.
