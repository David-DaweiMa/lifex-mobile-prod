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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { Message } from '../types';
import { chatService } from '../services/chatService';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

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
  const [showRecentChats, setShowRecentChats] = useState(false);
  const [recentChats] = useState([
    { id: 1, title: "Coffee shops in Ponsonby", preview: "Best coffee shops in Ponsonby?" },
    { id: 2, title: "Kid-friendly restaurants", preview: "Kid-friendly restaurants with play areas" },
    { id: 3, title: "Plumber services", preview: "Plumber for blocked drains" },
    { id: 4, title: "House cleaning", preview: "House cleaner for weekly visits" },
  ]);
  
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
    setShowRecentChats(false);

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

  const handleNewChat = () => {
    setMessages([{
      type: 'assistant',
      content: "G'day! What can I help you find today?",
      assistant: 'lifex'
    }]);
    setIsInConversation(false);
    setFollowUpQuestions([]);
    setShowRecentChats(false);
  };

  const handleRecentChatSelect = (chat: any) => {
    // Simulate loading a previous chat
    setMessages([
      { type: 'user', content: chat.preview },
      { type: 'assistant', content: "I remember helping you with that! Here's what I found..." }
    ]);
    setIsInConversation(true);
    setShowRecentChats(false);
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
      backgroundColor: 'transparent',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      maxWidth: '80%',
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
      textAlign: 'left',
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
      paddingVertical: 10,
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      height: 40,
      borderWidth: 1,
      borderColor: colors.secondary,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Main page styles - simplified like Claude
    mainContent: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    greetingSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    greetingText: {
      fontSize: typography.fontSize.xl,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: typography.fontSize.xl * 1.4,
    },
    quickPromptsContainer: {
      marginTop: spacing.xs,
      paddingBottom: spacing.xs,
    },
    quickPromptsScrollView: {
      maxHeight: 140,
    },
    quickPromptsScrollContent: {
      paddingHorizontal: spacing.md,
    },
    quickPromptsRowsContainer: {
      flexDirection: 'column',
      gap: spacing.xs,
    },
    quickPromptsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    quickPrompt: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      height: 60,
      minWidth: 120,
      maxWidth: 180,
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quickPromptText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      textAlign: 'left',
      lineHeight: typography.fontSize.sm * 1.3,
      flexWrap: 'wrap',
    },
    inputSection: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    // Recent chats modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      paddingTop: 100,
    },
    modalContent: {
      backgroundColor: colors.surface,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      marginTop: spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
    },
    modalCloseButton: {
      padding: spacing.sm,
    },
    recentChatItem: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    recentChatTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    recentChatPreview: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      lineHeight: typography.fontSize.sm * 1.3,
    },
    newChatModalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      marginHorizontal: 0,
      marginVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      minHeight: 60,
    },
    newChatContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    newChatIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.secondary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    newChatText: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text,
    },
    recentChatsSection: {
      marginTop: spacing.sm,
    },
    recentChatsSectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.textSecondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // Recent chats button styles
    recentChatsButtonContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background,
      alignItems: 'flex-start',
    },
    recentChatsButton: {
      width: 32,
      height: 32,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  });

  // Render recent chats modal
  const renderRecentChatsModal = () => {
    return (
      <Modal
        visible={showRecentChats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRecentChats(false)}
      >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowRecentChats(false)}
      >
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          
          {/* New Chat Option - At the top */}
          <View style={styles.newChatModalItem}>
            <TouchableOpacity
              style={styles.newChatContent}
              onPress={() => {
                handleNewChat();
                setShowRecentChats(false);
              }}
            >
              <View style={styles.newChatIcon}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </View>
              <Text style={styles.newChatText}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowRecentChats(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Recent Chats Section */}
          <View style={styles.recentChatsSection}>
            <Text style={styles.recentChatsSectionTitle}>Recent Chats</Text>
            {recentChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={styles.recentChatItem}
                onPress={() => handleRecentChatSelect(chat)}
              >
                <Text style={styles.recentChatTitle}>{chat.title}</Text>
                <Text style={styles.recentChatPreview}>{chat.preview}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
    );
  };

  if (isInConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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

        {/* Recent Chats Button - Below Header */}
        <View style={styles.recentChatsButtonContainer}>
          <TouchableOpacity 
            onPress={() => setShowRecentChats(true)} 
            style={styles.recentChatsButton}
          >
            <Ionicons name="menu" size={20} color={colors.primary} />
          </TouchableOpacity>
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
              placeholder=""
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {renderRecentChatsModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>LX</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>LifeX</Text>
            <Text style={styles.headerSubtitle}>Your AI companion</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
            <Ionicons name="search-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleProfilePress}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Chats Button - Below Header */}
      <View style={styles.recentChatsButtonContainer}>
        <TouchableOpacity 
          onPress={() => setShowRecentChats(true)} 
          style={styles.recentChatsButton}
        >
          <Ionicons name="menu" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            G'day! What can I help you find today?
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color={colors.secondary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Ask me anything about New Zealand..."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Prompts - Two Rows Layout */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsScrollContent}
            style={styles.quickPromptsScrollView}
          >
            {/* Container for both rows */}
            <View style={styles.quickPromptsRowsContainer}>
              {/* First Row */}
              <View style={styles.quickPromptsRow}>
                {quickPrompts.slice(0, 4).map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPrompt}
                    onPress={() => handleQuickPrompt(prompt)}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Second Row */}
              <View style={styles.quickPromptsRow}>
                {quickPrompts.slice(4, 8).map((prompt, index) => (
                  <TouchableOpacity
                    key={index + 4}
                    style={styles.quickPrompt}
                    onPress={() => handleQuickPrompt(prompt)}
                  >
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {renderRecentChatsModal()}
    </SafeAreaView>
  );
}

export default ChatScreen;