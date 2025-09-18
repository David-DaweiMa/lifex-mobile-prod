import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { Message, BusinessExtended } from '../types';
import { chatService } from '../services/chatService';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { quickPrompts, recentDiscoveries } from '../utils/mockData';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?",
      assistant: 'lifex'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isInConversation, setIsInConversation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUserQuery = async (query: string) => {
    const userMessage: Message = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setIsInConversation(true);
    setIsTyping(true);
    
    try {
      const response = await chatService.sendMessage(query);
      
      setIsTyping(false);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.message,
        assistant: 'lifex',
        recommendations: response.recommendations
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(response.followUpQuestions || []);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        assistant: 'lifex'
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    await handleUserQuery(chatInput);
    setChatInput('');
  };

  const handleQuickPrompt = async (prompt: string) => {
    await handleUserQuery(prompt);
  };

  const handleBackToMain = () => {
    setIsInConversation(false);
  };

  const renderMessage = (message: Message, index: number) => (
    <View key={index} style={styles.messageContainer}>
      {message.type === 'user' ? (
        <View style={styles.userMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{message.content}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.assistantMessageContainer}>
          <View style={styles.assistantAvatar}>
            <Text style={styles.assistantAvatarText}>⚡</Text>
          </View>
          <View style={styles.assistantMessage}>
            <Text style={styles.assistantMessageText}>{message.content}</Text>
            
            {message.recommendations && (
              <View style={styles.recommendationsContainer}>
                {message.recommendations.map((rec: BusinessExtended) => (
                  <View key={rec.id} style={styles.recommendationCard}>
                    <View style={styles.recommendationHeader}>
                      <View style={styles.recommendationInfo}>
                        <Text style={styles.recommendationName}>{rec.name}</Text>
                        <Text style={styles.recommendationType}>{rec.type}</Text>
                      </View>
                      <View style={styles.recommendationRating}>
                        <Text style={styles.recommendationRatingText}>⭐ {rec.rating}</Text>
                        <Text style={styles.recommendationPrice}>{rec.price}</Text>
                      </View>
                    </View>

                    <View style={styles.recommendationReason}>
                      <Text style={styles.recommendationReasonText}>{rec.aiReason}</Text>
                      <View style={styles.tagsContainer}>
                        {rec.tags.map((tag: string, tagIdx: number) => (
                          <View key={tagIdx} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.recommendationFooter}>
                      <TouchableOpacity style={styles.recommendationButton}>
                        <Text style={styles.recommendationButtonText}>📞 {rec.phone}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.recommendationButton}>
                        <Text style={styles.recommendationButtonText}>📍 {rec.distance}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );

  if (isInConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackToMain} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.logo}>
              <Text style={styles.logoText}>LX</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>LifeX AI</Text>
              <Text style={styles.headerSubtitle}>Your AI companion</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message: Message, index: number) => renderMessage(message, index))}
          
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.assistantAvatar}>
                <Text style={styles.assistantAvatarText}>⚡</Text>
              </View>
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>● ● ●</Text>
              </View>
            </View>
          )}
          
          {!isTyping && followUpQuestions.length > 0 && (
            <View style={styles.followUpContainer}>
              <View style={styles.assistantAvatar}>
                <Text style={styles.assistantAvatarText}>💡</Text>
              </View>
              <View style={styles.followUpContent}>
                <Text style={styles.followUpTitle}>You might also want to ask:</Text>
                <View style={styles.followUpQuestions}>
                  {followUpQuestions.map((question: string, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.followUpQuestion}
                      onPress={() => handleQuickPrompt(question)}
                    >
                      <Text style={styles.followUpQuestionText}>{question}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask me anything about New Zealand..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="LifeX" 
        subtitle="Explore Kiwi's hidden gems with AI"
      />

      <ScrollView style={styles.mainContainer} contentContainerStyle={styles.mainContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>G'day! What can I help you find today?</Text>
          
          <View style={styles.inputSection}>
            <TextInput
              style={styles.mainInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Prompts */}
        <View style={styles.quickPromptsContainer}>
          {quickPrompts.map((row: string[], rowIdx: number) => (
            <ScrollView 
              key={rowIdx} 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.promptRow}
            >
              {row.map((prompt: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickPrompt}
                  onPress={() => handleQuickPrompt(prompt)}
                >
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ))}
        </View>

        {/* Recent Discoveries */}
        <View style={styles.discoveriesContainer}>
          <View style={styles.discoveriesHeader}>
            <Text style={styles.discoveriesTitle}>Recent Discoveries</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {recentDiscoveries.map((discovery: any, idx: number) => (
            <View key={idx} style={styles.discoveryCard}>
              <Text style={styles.discoveryText}>{discovery.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  userMessage: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.sm,
    maxWidth: '80%',
  },
  userMessageText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
  },
  assistantMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  assistantAvatarText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  assistantMessage: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantMessageText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  recommendationsContainer: {
    marginTop: spacing.sm,
  },
  recommendationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  recommendationType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  recommendationRating: {
    alignItems: 'flex-end',
  },
  recommendationRatingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: 2,
  },
  recommendationPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  recommendationReason: {
    backgroundColor: `${colors.primary}20`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendationReasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: `${colors.primary}20`,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIndicator: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.sm,
  },
  typingText: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
  },
  followUpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
  },
  followUpContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  followUpTitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  followUpQuestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  followUpQuestion: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  followUpQuestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    color: colors.text,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  sendButtonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  mainContainer: {
    flex: 1,
  },
  mainContent: {
    padding: spacing.md,
  },
  welcomeContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  welcomeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  mainInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    color: colors.text,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
  },
  quickPromptsContainer: {
    marginBottom: spacing.xl,
  },
  promptRow: {
    marginBottom: spacing.sm,
  },
  quickPrompt: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  quickPromptText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  discoveriesContainer: {
    marginTop: spacing.xl,
  },
  discoveriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  discoveriesTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  discoveryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  discoveryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
});

export default ChatScreen;
