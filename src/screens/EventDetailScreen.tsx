import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import EventsService from '../services/eventsService';
import { Event } from '../types';
import { formatEventDate, formatAttendees } from '../utils/eventHelpers';
import { mockEventsData } from '../utils/mockData';

const { width } = Dimensions.get('window');

interface EventDetailScreenProps {
  route: {
    params: {
      eventId: string;
    };
  };
  navigation: any;
}

const EventDetailScreen: React.FC<EventDetailScreenProps> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 首先尝试从数据库获取
      const { data, error: fetchError } = await EventsService.getEventById(eventId);

      if (data && !fetchError) {
        // 成功从数据库获取
        setEvent(data);
        // 增加浏览次数
        EventsService.incrementViewCount(eventId);
      } else {
        // 数据库获取失败，尝试从mock数据中查找
        console.log('Trying to load from mock data, eventId:', eventId);
        const mockEvent = mockEventsData.find(e => e.id === eventId || e.id.toString() === eventId);
        
        if (mockEvent) {
          // 转换mock数据为Event格式
          const convertedEvent: Event = {
            id: mockEvent.id.toString(),
            title: mockEvent.title,
            description: mockEvent.description || '',
            date: mockEvent.date,
            time: mockEvent.time,
            location: mockEvent.location,
            category: mockEvent.category,
            price: mockEvent.price,
            attendees: typeof mockEvent.attendees === 'string' 
              ? parseInt(mockEvent.attendees.replace(/[^\d]/g, '')) || 0
              : mockEvent.attendees,
            image_url: mockEvent.image,
            tags: mockEvent.tags || [],
            is_hot: mockEvent.isHot || false,
            organizer_id: null,
            business_id: null,
            is_active: true,
            view_count: 0,
            like_count: 0,
            share_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setEvent(convertedEvent);
          console.log('Loaded event from mock data');
        } else {
          setError('Event not found');
          console.error('Event not found in database or mock data');
        }
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error('Exception loading event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;

    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n${event.description || ''}\nDate: ${event.date} at ${event.time}\nLocation: ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: 实现后端like功能
  };

  const handleRegister = () => {
    // TODO: 实现注册参加功能
    console.log('Register for event:', eventId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEventDetails}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLike} style={styles.iconButton}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? colors.error : colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.image_url && (
          <Image source={{ uri: event.image_url }} style={styles.eventImage} />
        )}

        {/* Event Content */}
        <View style={styles.content}>
          {/* Hot Badge */}
          {event.is_hot && (
            <View style={styles.hotBadge}>
              <Ionicons name="flame" size={16} color="#FF6B35" />
              <Text style={styles.hotBadgeText}>HOT EVENT</Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Category */}
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            {/* Date & Time */}
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{formatEventDate(event.date)}</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.infoCard}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>

            {/* Price & Attendees */}
            <View style={styles.infoRow}>
              <View style={[styles.infoCard, { flex: 1, marginRight: spacing.xs }]}>
                <Ionicons name="pricetag-outline" size={24} color={colors.primary} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Price</Text>
                  <Text style={styles.infoValue}>{event.price}</Text>
                </View>
              </View>

              <View style={[styles.infoCard, { flex: 1, marginLeft: spacing.xs }]}>
                <Ionicons name="people-outline" size={24} color={colors.primary} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Attendees</Text>
                  <Text style={styles.infoValue}>{formatAttendees(event.attendees)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {event.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{event.view_count} views</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{event.like_count} likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{event.share_count} shares</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Register Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register for Event</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  eventImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.md,
  },
  hotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  hotBadgeText: {
    color: '#FF6B35',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  categoryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  infoSection: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  tagText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default EventDetailScreen;

