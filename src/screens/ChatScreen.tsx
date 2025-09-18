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
      padding: spacing.md,
    },
    messageContainer: {
      marginBottom: spacing.md,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      maxWidth: '80%',
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      maxWidth: '80%',
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.primary,
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
      backgroundColor: colors.primary,
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
      fontWeight: typography.fontWeight.medium,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    followUpQuestions: {
      gap: spacing.xs,
    },
    followUpQuestion: {
      backgroundColor: colors.surface,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    followUpQuestionText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
    },
    inputContainer: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
    },
    sendButtonText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
    },
    mainContent: {
      flex: 1,
      padding: spacing.md,
    },
    welcomeTitle: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    welcomeSubtitle: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    quickPromptsContainer: {
      marginBottom: spacing.xl,
    },
    quickPromptsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    quickPromptsGrid: {
      gap: spacing.sm,
    },
    quickPrompt: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickPromptText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      textAlign: 'center',
    },
    recentDiscoveriesContainer: {
      marginBottom: spacing.xl,
    },
    recentDiscoveriesTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: spacing.md,
    },
    recentDiscoveriesList: {
      gap: spacing.sm,
    },
    recentDiscovery: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentDiscoveryText: {
      fontSize: typography.fontSize.md,
      color: colors.text,
    },
  });

  if (isInConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBackToMain} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#a855f7" />
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
              <Ionicons name="notifications-outline" size={20} color="#a855f7" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="person-outline" size={20} color="#a855f7" />
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
            <TextInput
              style={styles.textInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask me anything about New Zealand..."
              placeholderTextColor="#9CA3AF"
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

      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Text style={styles.welcomeTitle}>Welcome to LifeX</Text>
        <Text style={styles.welcomeSubtitle}>Your AI companion for discovering New Zealand</Text>

        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsTitle}>Quick Prompts</Text>
          <View style={styles.quickPromptsGrid}>
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentDiscoveriesContainer}>
          <Text style={styles.recentDiscoveriesTitle}>Recent Discoveries</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatScreen;