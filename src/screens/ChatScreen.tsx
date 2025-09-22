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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { Message } from '../types';
import { chatService } from '../services/chatService';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "G'day! What can I help you find today?",
      assistant: 'lifex'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isInConversation, setIsInConversation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNavigateToPrivacy = () => {
    navigation.navigate('PrivacyPolicy' as never);
  };

  const handleNavigateToTerms = () => {
    navigation.navigate('TermsOfService' as never);
  };

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

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
    setChatInput('');

    try {
      const response = await chatService.sendMessage(query);
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.message,
        assistant: 'lifex'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setFollowUpQuestions(response.followUpQuestions || []);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        assistant: 'lifex'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleUserQuery(prompt);
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      handleUserQuery(chatInput.trim());
    }
  };

  const handleBackToMain = () => {
    setIsInConversation(false);
    setFollowUpQuestions([]);
  };

  // Updated quick prompts based on the image
  const quickPrompts = [
    "Best coffee shops in Ponsonby?",
    "Kid-friendly restaurants with play areas",
    "Plumber for blocked drains",
    "House cleaner for weekly visits",
    "Indoor activities for rainy Auckland days",
    "Beginner-friendly yoga studios",
    "Pet grooming services near me",
    "Weekend markets in Auckland",
    "Hair salon for men's cuts",
    "Car mechanic for oil change",
    "Dentist accepting new patients",
    "Gym with personal trainers"
  ];

  // Updated recent discoveries based on the image
  const recentDiscoveries = [
    { text: "Best brunch spots in Mt Eden with outdoor seating" },
    { text: "Affordable personal trainer near Albany for beginners" },
    { text: "Emergency vet open late nights in West Auckland" }
  ];

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
      fontWeight: '700',
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
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
      padding: spacing.sm,
      backgroundColor: colors.background,
    },
    messageContainer: {
      marginBottom: spacing.md,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.secondary,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      maxWidth: '80%',
      shadowColor: colors.secondary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      maxWidth: '80%',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    messageText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
    },
    userMessageText: {
      color: colors.text,
    },
    assistantMessageText: {
      color: colors.text,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: 'flex-start',
      maxWidth: '80%',
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.secondary,
      marginHorizontal: 2,
    },
    followUpContainer: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    assistantAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    assistantAvatarText: {
      fontSize: typography.fontSize.sm,
    },
    followUpContent: {
      flex: 1,
    },
    followUpTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    followUpQuestions: {
      gap: spacing.xs,
    },
    followUpQuestion: {
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    followUpQuestionText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
    },
    inputContainer: {
      padding: spacing.sm,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sendButtonText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
    },
    // Main landing page styles - based on the image design
    mainContent: {
      flex: 1,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.sm,
    },
    heroSection: {
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingTop: spacing.sm,
    },
    chatBubble: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing.xl * 2,
      paddingHorizontal: spacing.lg,
      marginHorizontal: 2,
      borderWidth: 1,
      borderColor: colors.border,
      maxWidth: width * 0.98,
      minHeight: 120,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    chatBubbleMessage: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      lineHeight: typography.fontSize.lg * 1.3,
    },
    inputSection: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      marginHorizontal: 0,
      marginBottom: 0,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textInput: {
      flex: 1,
      backgroundColor: 'transparent',
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: typography.fontSize.md,
      color: '#FFFFFF',
      height: 40,
      borderWidth: 1,
      borderColor: colors.secondary,
      textAlignVertical: 'center',
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickPromptsContainer: {
      marginBottom: spacing.md,
    },
    quickPromptsRow: {
      marginBottom: spacing.sm,
    },
    quickPromptsRowContent: {
      paddingHorizontal: spacing.xs,
      gap: spacing.xs,
    },
    quickPrompt: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 120,
      alignItems: 'center',
    },
    quickPromptText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      textAlign: 'center',
    },
    recentDiscoveriesContainer: {
      marginTop: spacing.xl * 2,
      marginBottom: spacing.md,
    },
    recentDiscoveriesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    recentDiscoveriesTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text,
    },
    seeAllLink: {
      fontSize: typography.fontSize.md,
      color: colors.primary,
      fontWeight: '500',
    },
    recentDiscoveriesList: {
      paddingHorizontal: spacing.xs,
    },
    recentDiscovery: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.sm,
    },
    recentDiscoveryText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      lineHeight: typography.fontSize.md * 1.4,
    },
    legalContainer: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      marginTop: spacing.xl,
    },
    legalText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: typography.fontSize.sm * 1.5,
    },
    legalLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    // Main container with background
    mainContainer: {
      backgroundColor: '#1A1625',
      borderRadius: borderRadius.xl,
      margin: spacing.sm,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    // Greeting container styles - matching the design
    greetingContainer: {
      paddingHorizontal: 0,
      paddingTop: 0,
      marginBottom: spacing.xl * 2,
    },
    greetingText: {
      fontSize: typography.fontSize.xl,
      fontWeight: 'normal',
      color: '#FFFFFF',
      textAlign: 'left',
      lineHeight: typography.fontSize.xl * 1.3,
    },
  });

  if (isInConversation) {
    return (
      <SafeAreaView style={styles.container}>
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
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          {messages.map((message, index) => (
            <View key={index} style={styles.messageContainer}>
              <View style={message.type === 'user' ? styles.userMessage : styles.assistantMessage}>
                <Text style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}>
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.messageContainer}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { opacity: 0.4 }]} />
                <View style={[styles.typingDot, { opacity: 0.7 }]} />
                <View style={[styles.typingDot, { opacity: 1 }]} />
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
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={colors.secondary} />
              </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask me anything about New Zealand..."
              placeholderTextColor={colors.secondary}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="LifeX" 
        subtitle="Explore Kiwi's hidden gems with AI"
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: spacing.sm }}>
        {/* Main container with background */}
        <View style={styles.mainContainer}>
          {/* Greeting in top left corner */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              G'day! What can I help you find today?
            </Text>
          </View>

          {/* Input Section - based on image */}
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color={colors.secondary} />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type your message..."
                placeholderTextColor={colors.secondary}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Prompts Section - based on image */}
        <View style={styles.quickPromptsContainer}>
          {/* First Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsRow}
            contentContainerStyle={styles.quickPromptsRowContent}
          >
            {quickPrompts.slice(0, 4).map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Second Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsRow}
            contentContainerStyle={styles.quickPromptsRowContent}
          >
            {quickPrompts.slice(4, 8).map((prompt, index) => (
              <TouchableOpacity
                key={index + 4}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Third Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsRow}
            contentContainerStyle={styles.quickPromptsRowContent}
          >
            {quickPrompts.slice(8, 12).map((prompt, index) => (
              <TouchableOpacity
                key={index + 8}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Discoveries Section - based on image */}
        <View style={styles.recentDiscoveriesContainer}>
          <View style={styles.recentDiscoveriesHeader}>
            <Text style={styles.recentDiscoveriesTitle}>Recent Discoveries</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recentDiscoveriesList}>
            {recentDiscoveries.map((discovery, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentDiscovery}
                onPress={() => handleQuickPrompt(discovery.text)}
              >
                <Text style={styles.recentDiscoveryText}>{discovery.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By using LifeX, you agree to our{' '}
            <Text style={styles.legalLink} onPress={handleNavigateToTerms}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={handleNavigateToPrivacy}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;