import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockTrendingData, mockEventsData } from '../utils/mockData';
import { TrendingData, EventDisplay } from '../types';
import EventsService from '../services/eventsService';
import { eventsToDisplay } from '../utils/eventHelpers';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 2 - spacing.sm) / 2;

const EventsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { favoriteEvents, toggleFavorite: toggleFavoriteContext } = useFavorites();
  const [selectedMainCategory, setSelectedMainCategory] = useState('Hot');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentEventPage, setCurrentEventPage] = useState(0);
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Load events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoadingEvents(true);
      setEventsError(null);

      // 获取热门events
      const { data, error } = await EventsService.getUpcomingEvents(20);

      if (error) {
        console.error('Error loading events:', error);
        setEventsError('Failed to load events');
        // Fallback to mock data
        setEvents(mockEventsData);
      } else if (data && data.length > 0) {
        // 使用真实数据
        setEvents(eventsToDisplay(data));
      } else {
        // 如果数据库为空，使用mock数据
        console.log('No events in database, using mock data');
        setEvents(mockEventsData);
      }
    } catch (error) {
      console.error('Exception loading events:', error);
      setEventsError('Failed to load events');
      // Fallback to mock data
      setEvents(mockEventsData);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  const toggleFavorite = (eventId: string | number, eventData?: EventDisplay) => {
    toggleFavoriteContext(eventId, eventData);
  };

  // Handle scroll events for event banner dots indicator
  const handleEventScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentEventPage(roundIndex);
  };

  // Featured events for hero banner - use real data or fallback to mock
  const featuredEvents = events.filter(event => event.isHot).slice(0, 3);
  
  // If no hot events, use first 3 events
  const displayEvents = featuredEvents.length > 0 ? featuredEvents : events.slice(0, 3);

  // Different heights for waterfall layout
  const waterfallHeights = [140, 120, 160, 130, 150, 110];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'business', name: 'Business' },
    { id: 'health', name: 'Health' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'services', name: 'Services' },
    { id: 'travel', name: 'Travel' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    
    // Hero Banner Styles
    heroBanner: {
      height: 200,
      marginBottom: spacing.sm,
    },
    heroScrollView: {
      flex: 1,
    },
    heroCard: {
      width: width,
      height: 200,
      position: 'relative',
    },
    heroImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: spacing.md,
    },
    heroTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    heroSubtitle: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    heroMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    heroFavoriteButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroPrice: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    },
    heroAttendees: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroBadge: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    heroBadgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    // Waterfall Layout
    waterfallContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xs,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    waterfallColumn: {
      flex: 1,
      marginHorizontal: 2,
      maxWidth: '48%',
    },
    mainCategories: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background,
      marginHorizontal: spacing.xs,
      marginTop: spacing.xs,
      marginBottom: 0,
      borderRadius: borderRadius.lg,
    },
    mainCategoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      marginHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 90,
      height: 36,
      justifyContent: 'center',
    },
    mainCategoryActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    mainCategoryText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: '500',
      marginLeft: spacing.xs,
    },
    mainCategoryTextActive: {
      color: colors.text,
      fontWeight: '600',
    },
    tagsContainer: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginHorizontal: spacing.xs,
      marginBottom: spacing.xs,
      borderRadius: borderRadius.lg,
    },
    tagsContent: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      alignItems: 'center',
    },
    tag: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      marginRight: spacing.xs,
      height: 24,
      minWidth: 45,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tagActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
      lineHeight: typography.fontSize.xs * 1.1,
      textAlign: 'center',
    },
    tagTextActive: {
      color: colors.text,
      fontWeight: '600',
    },
    feedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    // Waterfall Card Styles
    waterfallCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      width: '100%',
    },
    waterfallImageContainer: {
      position: 'relative',
      // Height will be set dynamically in JSX
    },
    waterfallImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    featuredBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    featuredBadgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    waterfallFavoriteButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 32,  // 确保按钮有足够的点击区域
      alignItems: 'center',
      justifyContent: 'center',
    },
    waterfallContent: {
      padding: spacing.xs,
      paddingBottom: spacing.sm,  // 增加底部padding确保内容完全显示
    },
    waterfallTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.text,
      marginBottom: spacing.xs * 0.5,
      lineHeight: typography.fontSize.sm * 1.3,
    },
    waterfallTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.xs * 0.5,
    },
    waterfallTag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    waterfallTagText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: '500',
    },
    waterfallMoreTagsText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    waterfallFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    waterfallMetaContainer: {
      marginTop: spacing.xs,
    },
    waterfallLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs / 2,
    },
    waterfallDateFavoriteRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 2,
    },
    waterfallAuthor: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    waterfallStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    waterfallLikes: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    contentImage: {
      width: '100%',
      height: 100,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    } as const,
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    contentTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: 'normal',
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    contentMeta: {
      alignItems: 'flex-end',
    },
    contentAuthor: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    contentStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    likesText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    contentTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    contentTag: {
      backgroundColor: colors.primary + '20',
      borderWidth: 1,
      borderColor: colors.primary + '40',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    contentTagText: {
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    },
    contentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    readTimeText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
    },
    shareButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    shareButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontWeight: '500',
    },
    moreTagsText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Events" 
        subtitle="Discover local events & activities"
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Featured Events Hero Banner */}
        <View style={styles.heroBanner}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleEventScroll}
            scrollEventThrottle={16}
            style={styles.heroScrollView}
          >
            {displayEvents.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.heroCard}
                onPress={() => navigation.navigate('EventDetail' as never, { eventId: event.id } as never)}
              >
                <Image source={{ uri: event.image }} style={styles.heroImage} />
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>🔥 HOT EVENT</Text>
                </View>
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{event.title}</Text>
                  <Text style={styles.heroSubtitle}>{event.location} • {event.date}</Text>
                  <View style={styles.heroMeta}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <Text style={styles.heroPrice}>{event.price}</Text>
                      <View style={styles.heroAttendees}>
                        <Ionicons name="people-outline" size={14} color="#FFFFFF" />
                        <Text style={{ marginLeft: 4 }}>{event.attendees}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.heroFavoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id, event);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={favoriteEvents.has(event.id) ? "heart" : "heart-outline"} 
                        size={14} 
                        color={favoriteEvents.has(event.id) ? "#FF6B6B" : "#FFFFFF"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {displayEvents.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentEventPage === index && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Category Buttons */}
        <View style={styles.mainCategories}>
          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Hot' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Hot')}
          >
            <Ionicons name="flame-outline" size={16} color={selectedMainCategory === 'Hot' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Hot' && styles.mainCategoryTextActive]}>Hot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Recommended' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Recommended')}
          >
            <Ionicons name="star-outline" size={16} color={selectedMainCategory === 'Recommended' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Recommended' && styles.mainCategoryTextActive]}>Recommended</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Nearby' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Nearby')}
          >
            <Ionicons name="location-outline" size={16} color={selectedMainCategory === 'Nearby' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Nearby' && styles.mainCategoryTextActive]}>Nearby</Text>
          </TouchableOpacity>
        </View>

        {/* Category Tags */}
        <View style={styles.tagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.tag,
                  selectedCategory === category.id && styles.tagActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.tagText,
                  selectedCategory === category.id && styles.tagTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events Content - Waterfall Layout */}
        {isLoadingEvents ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Loading events...</Text>
          </View>
        ) : (
          <View style={styles.waterfallContainer}>
            {/* Left Column */}
            <View style={styles.waterfallColumn}>
              {events.filter((_, index) => index % 2 === 0).map((event, index) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={[styles.waterfallCard, { marginBottom: spacing.xs * 0.5 }]}
                  onPress={() => navigation.navigate('EventDetail' as never, { eventId: event.id } as never)}
                >
                  <View style={[styles.waterfallImageContainer, { height: waterfallHeights[index * 2 % waterfallHeights.length] }]}>
                    <Image source={{ uri: event.image }} style={styles.waterfallImage} />
                    {event.isHot && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>🔥 HOT</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.waterfallContent}>
                    <Text style={styles.waterfallTitle} numberOfLines={2} ellipsizeMode="tail">
                      {event.title}
                    </Text>

                    <View style={styles.waterfallTagsContainer}>
                      {event.tags.slice(0, 2).map((tag, tagIndex) => (
                        <View key={tagIndex} style={styles.waterfallTag}>
                          <Text style={styles.waterfallTagText}>#{tag}</Text>
                        </View>
                      ))}
                      {event.tags.length > 2 && (
                        <Text style={styles.waterfallMoreTagsText}>+{event.tags.length - 2}</Text>
                      )}
                    </View>

                    <View style={styles.waterfallMetaContainer}>
                      {/* Location */}
                      <View style={styles.waterfallLocationRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.waterfallAuthor, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                      {/* Date and Favorite */}
                      <View style={styles.waterfallDateFavoriteRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.waterfallLikes, { marginLeft: 4 }]}>
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.waterfallFavoriteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite(event.id, event);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={favoriteEvents.has(event.id) ? "heart" : "heart-outline"} 
                            size={14} 
                            color={favoriteEvents.has(event.id) ? "#FF6B6B" : colors.textSecondary} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Right Column */}
            <View style={styles.waterfallColumn}>
              {events.filter((_, index) => index % 2 === 1).map((event, index) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={[styles.waterfallCard, { marginBottom: spacing.xs * 0.5 }]}
                  onPress={() => navigation.navigate('EventDetail' as never, { eventId: event.id } as never)}
                >
                  <View style={[styles.waterfallImageContainer, { height: waterfallHeights[(index * 2 + 1) % waterfallHeights.length] }]}>
                    <Image source={{ uri: event.image }} style={styles.waterfallImage} />
                    {event.isHot && (
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>⚡ HOT</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.waterfallContent}>
                    <Text style={styles.waterfallTitle} numberOfLines={2} ellipsizeMode="tail">
                      {event.title}
                    </Text>

                    <View style={styles.waterfallTagsContainer}>
                      {event.tags.slice(0, 2).map((tag, tagIndex) => (
                        <View key={tagIndex} style={styles.waterfallTag}>
                          <Text style={styles.waterfallTagText}>#{tag}</Text>
                        </View>
                      ))}
                      {event.tags.length > 2 && (
                        <Text style={styles.waterfallMoreTagsText}>+{event.tags.length - 2}</Text>
                      )}
                    </View>

                    <View style={styles.waterfallMetaContainer}>
                      {/* Location */}
                      <View style={styles.waterfallLocationRow}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.waterfallAuthor, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                      {/* Date and Favorite */}
                      <View style={styles.waterfallDateFavoriteRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                          <Text style={[styles.waterfallLikes, { marginLeft: 4 }]}>
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.waterfallFavoriteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite(event.id, event);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons 
                            name={favoriteEvents.has(event.id) ? "heart" : "heart-outline"} 
                            size={14} 
                            color={favoriteEvents.has(event.id) ? "#FF6B6B" : colors.textSecondary} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Create post')} />
    </SafeAreaView>
  );
};

export default EventsScreen;