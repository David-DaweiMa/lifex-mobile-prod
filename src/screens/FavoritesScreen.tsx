import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 2 - spacing.sm) / 2;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { favoriteEventsList, toggleFavorite, favoriteEvents } = useFavorites();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'events' | 'specials' | 'places'>('all');
  
  // 分类收藏项（根据数据类型判断）
  const categorizedFavorites = useMemo(() => {
    const events: any[] = [];
    const specials: any[] = [];
    const places: any[] = [];
    
    favoriteEventsList.forEach(item => {
      // 根据数据特征判断类型
      if (item.discount || item.originalPrice) {
        specials.push(item);
      } else if (item.rating !== undefined || item.address || item.highlights) {
        places.push(item);
      } else {
        events.push(item);
      }
    });
    
    return { events, specials, places };
  }, [favoriteEventsList]);
  
  // 当前显示的列表
  const displayList = useMemo(() => {
    switch (selectedCategory) {
      case 'events':
        return categorizedFavorites.events;
      case 'specials':
        return categorizedFavorites.specials;
      case 'places':
        return categorizedFavorites.places;
      default:
        return favoriteEventsList;
    }
  }, [selectedCategory, categorizedFavorites, favoriteEventsList]);
  
  const categories = [
    { id: 'all' as const, name: 'All', count: favoriteEventsList.length },
    { id: 'events' as const, name: 'Events', count: categorizedFavorites.events.length },
    { id: 'specials' as const, name: 'Specials', count: categorizedFavorites.specials.length },
    { id: 'places' as const, name: 'Places', count: categorizedFavorites.places.length },
  ];

  const handleEventPress = (eventId: string | number) => {
    navigation.navigate('EventDetail' as never, { eventId } as never);
  };

  const handleRemoveFavorite = (eventId: string | number, eventData: any) => {
    toggleFavorite(eventId, eventData);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.subtitle}>
              {favoriteEventsList.length > 0 
                ? `${favoriteEventsList.length} saved item${favoriteEventsList.length > 1 ? 's' : ''}`
                : 'Your saved items'}
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.categoryButtonTextActive,
                ]}
              >
                {category.name} {category.count > 0 && `(${category.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {displayList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {selectedCategory === 'all' ? 'No favorites yet' : `No ${selectedCategory} saved`}
            </Text>
          <Text style={styles.emptyDescription}>
              {selectedCategory === 'all' 
                ? 'Start exploring and save your favorites by tapping the heart icon'
                : `Save ${selectedCategory} by tapping the heart icon to see them here`}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {displayList.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                  {event.isHot && (
                    <View style={styles.hotBadge}>
                      <Text style={styles.hotBadgeText}>🔥 HOT</Text>
                    </View>
                  )}
                  {/* Remove Button */}
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(event.id, event);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="heart" 
                      size={20} 
                      color="#FF6B6B" 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  
                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {event.tags.slice(0, 2).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                      {event.tags.length > 2 && (
                        <Text style={styles.moreTagsText}>+{event.tags.length - 2}</Text>
                      )}
                    </View>
                  )}
                  
                  {/* Location */}
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                  
                  {/* Date */}
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.infoText}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
          </Text>
        </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  categoriesScroll: {
    marginBottom: spacing.md,
    maxHeight: 50,
  },
  categoriesContainer: {
    paddingVertical: spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: typography.fontSize.md * 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCard: {
    width: cardWidth,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  hotBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  hotBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.sm,
  },
  eventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.md * 1.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  moreTagsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
});

export default FavoritesScreen;
