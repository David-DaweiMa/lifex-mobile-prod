import { Message, BusinessExtended, ChatServiceResponse } from '../types';

export class ChatService {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private userPreferences: string[] = [];
  private anonymousSessionId: string | null = null;

  constructor() {
    // Initialize with welcome message
    this.conversationHistory.push({
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    });
    
    // Initialize anonymous user session ID
    this.initializeAnonymousSession();
  }

  private initializeAnonymousSession() {
    // For React Native, we'll use AsyncStorage for persistence
    // For now, generate a simple session ID
    this.anonymousSessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `anon_${timestamp}_${random}`;
  }

  async sendMessage(userMessage: string, userId?: string): Promise<ChatServiceResponse> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Generate session ID for anonymous users
      const sessionId = userId ? `user-${userId}` : (this.anonymousSessionId || `anon-${Date.now()}`);
      const requestUserId = userId || 'anonymous';

      // For now, return a mock response
      // TODO: Implement actual API call to backend
      const mockResponse = this.generateMockResponse(userMessage);

      // Add AI response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: mockResponse.message
      });

      return mockResponse;

    } catch (error) {
      console.error('Chat service error:', error);
      
      // Fallback response
      const fallbackMessage = "I'm here to help you discover amazing places in New Zealand! What are you looking for today?";
      
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackMessage
      });

      return {
        message: fallbackMessage,
        followUpQuestions: [
          "Best coffee shops for remote work?",
          "Family-friendly restaurants?",
          "Weekend activities in Auckland?"
        ]
      };
    }
  }

  private generateMockResponse(userMessage: string): ChatServiceResponse {
    // Simple mock responses based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('coffee') || message.includes('cafe')) {
      return {
        message: "Great choice! I found some excellent coffee spots in Auckland. Here are my top recommendations:",
        recommendations: [
          {
            id: '1',
            name: 'Café Supreme',
            type: 'Coffee & Workspace',
            category: 'food',
            rating: 4.8,
            reviewCount: 234,
            distance: '0.3km',
            price: '$$',
            tags: ['Fast WiFi', 'Quiet', 'Great Coffee'],
            highlights: ['Fast WiFi', 'Quiet', 'Great Coffee'],
            aiReason: 'Perfect for remote work with excellent coffee and reliable WiFi.',
            phone: '09-555-0123',
            address: '118 Ponsonby Road, Auckland',
            image: 'from-amber-400 to-orange-500',
            isOpen: true,
            location: {
              latitude: -36.8485,
              longitude: 174.7633,
              address: '118 Ponsonby Road, Auckland'
            },
            contact: {
              phone: '09-555-0123',
              email: 'info@cafesupreme.co.nz',
              website: 'https://cafesupreme.co.nz'
            },
            images: ['https://example.com/image1.jpg'],
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ],
        followUpQuestions: [
          "Any coffee shops with outdoor seating?",
          "Best place for a business meeting?",
          "Coffee shops open late?"
        ]
      };
    } else if (message.includes('restaurant') || message.includes('food')) {
      return {
        message: "I'd love to help you find the perfect restaurant! What type of cuisine are you in the mood for?",
        followUpQuestions: [
          "Italian restaurants nearby?",
          "Best Asian food in Auckland?",
          "Fine dining recommendations?"
        ]
      };
    } else {
      return {
        message: "I'm here to help you discover amazing places in New Zealand! What specific type of service or location are you looking for?",
        followUpQuestions: [
          "Best coffee shops for remote work?",
          "Family-friendly restaurants?",
          "Weekend activities in Auckland?",
          "Shopping centers and malls?"
        ]
      };
    }
  }

  async getRecommendations(query: string, userId?: string): Promise<BusinessExtended[]> {
    try {
      const response = await this.sendMessage(query, userId);
      return response.recommendations || [];
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    }
  }

  getConversationHistory(): Array<{ role: 'user' | 'assistant'; content: string }> {
    return [...this.conversationHistory];
  }

  getUserPreferences(): string[] {
    return [...this.userPreferences];
  }

  clearHistory(): void {
    this.conversationHistory = [{
      role: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?"
    }];
    this.userPreferences = [];
  }

  getAnonymousSessionId(): string | null {
    return this.anonymousSessionId;
  }
}

// Create a singleton instance
export const chatService = new ChatService();
