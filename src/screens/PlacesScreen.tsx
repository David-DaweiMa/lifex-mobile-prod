import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockBusinessList, mockFeaturedPlaces } from '../utils/mockData';
import { BusinessExtended } from '../types';
import { BusinessesService } from '../services/businessesService';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 2 - spacing.sm) / 2;

const PlacesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMainCategory, setSelectedMainCategory] = useState('Nearby');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPlacePage, setCurrentPlacePage] = useState(0);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
  const { favoriteEventsList, toggleFavorite, isFavorite } = useFavorites();

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  // 加载商家数据
  const loadBusinesses = async () => {
    try {
      setIsLoadingBusinesses(true);
      const data = await BusinessesService.getActiveBusinesses();
      
      if (data && data.length > 0) {
        // 转换数据库字段到UI格式
        const formattedData = data.map(business => ({
          id: business.id,
          name: business.name,
          description: business.description || '',
          category: business.category,
          rating: business.rating,
          reviewCount: business.review_count,
          image: business.cover_image_url || business.logo_url || 'https://via.placeholder.com/80',
          location: business.address,
          isVerified: business.is_verified,
          isFeatured: business.is_verified && business.rating >= 4.5,
          // 添加UI需要的其他字段
          type: business.category,
          price: '$$',
          distance: '1.2 km',
          address: business.address ? 
            (typeof business.address === 'string' ? business.address : 
            (business.address as any).street || (business.address as any).address || 'Address not available') : 
            'Address not available',
          isOpen: true,
          openingHours: 'Open now',
          highlights: business.description ? [business.description.substring(0, 50)] : ['Great place to visit'],
        }));
        setBusinesses(formattedData);
        console.log('Loaded businesses from database:', formattedData.length);
      } else {
        console.log('No businesses in database, using mock data');
        setBusinesses(mockFeaturedPlaces);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      setBusinesses(mockFeaturedPlaces);
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);


  // Handle scroll events for places banner dots indicator
  const handlePlaceScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentPlacePage(roundIndex);
  };

  // Featured places for hero banner (前5个)
  const featuredPlaces = businesses.slice(0, 5);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'business', name: 'Business' },
    { id: 'travel', name: 'Travel' },
    { id: 'tech', name: 'Tech' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'sports', name: 'Sports' },
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
      paddingHorizontal: spacing.md,
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
      gap: spacing.sm,
    },
    heroPrice: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    },
    heroRating: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroFavoriteButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    mainCategories: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background,
      marginHorizontal: spacing.sm,
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
      marginHorizontal: spacing.sm,
      marginBottom: spacing.xs,
      borderRadius: borderRadius.lg,
    },
    tagsContent: {
      paddingHorizontal: spacing.md,
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
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      fontWeight: typography.fontWeight.medium,
      lineHeight: typography.fontSize.xs * 1.1,
      textAlign: 'center',
    },
    tagTextActive: {
      color: colors.text,
      fontWeight: typography.fontWeight.semibold,
    },
    feedContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    contentCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      width: cardWidth,
    },
    contentImage: {
      width: '100%',
      height: 100,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    contentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    contentTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
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
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    contentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    readTimeText: {
      fontSize: typography.fontSize.sm,
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
      fontWeight: typography.fontWeight.medium,
    },
    // Business listing styles
    businessCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      padding: spacing.sm,
    },
    businessLeft: {
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: spacing.sm,
    },
    businessImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
    },
    businessInfo: {
      flex: 1,
      paddingVertical: spacing.xs,
    },
    businessHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    businessName: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      marginRight: spacing.xs,
    },
    businessRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    reviewCount: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    businessMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    businessType: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
    },
    businessPrice: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    businessDistance: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
    businessAddress: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    businessHighlights: {
      marginBottom: spacing.xs,
    },
    highlightText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: 1,
    },
    businessFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    businessFavoriteButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      flex: 1,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontWeight: '500',
    },
    waitTime: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
      flex: 1,
      flexWrap: 'wrap',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      width: 80,
    },
    callButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.secondary + '20',
    },
    directionButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.secondary + '20',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Places" 
        subtitle="Find local businesses & venues"
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Featured Places Hero Banner */}
        <View style={styles.heroBanner}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handlePlaceScroll}
            scrollEventThrottle={16}
            style={styles.heroScrollView}
          >
            {featuredPlaces.map((place, index) => (
              <TouchableOpacity 
                key={place.id} 
                style={styles.heroCard}
                onPress={() => console.log('Place detail:', place.id)}
              >
                <Image source={{ uri: place.image }} style={styles.heroImage} />
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {index === 0 ? '⭐ TOP RATED' : index === 1 ? '🔥 POPULAR' : '💎 FEATURED'}
                  </Text>
                </View>
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{place.name}</Text>
                  <Text style={styles.heroSubtitle}>{place.type} • {place.distance}</Text>
                  <View style={styles.heroMeta}>
                    <Text style={styles.heroPrice}>{place.price}</Text>
                    <View style={styles.heroRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={{ color: '#FFFFFF', marginLeft: 4 }}>{place.rating}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.heroFavoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(place.id, place);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isFavorite(place.id) ? "heart" : "heart-outline"} 
                        size={16} 
                        color={isFavorite(place.id) ? "#FF6B6B" : "#FFFFFF"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {featuredPlaces.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPlacePage === index && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Category Buttons */}
        <View style={styles.mainCategories}>
          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Following' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Following')}
          >
            <Ionicons name="heart-outline" size={16} color={selectedMainCategory === 'Following' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Following' && styles.mainCategoryTextActive]}>Following</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Top Rated' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Top Rated')}
          >
            <Ionicons name="star-outline" size={16} color={selectedMainCategory === 'Top Rated' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Top Rated' && styles.mainCategoryTextActive]}>Top Rated</Text>
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

        {/* Business Listings */}
        {businesses.map((business) => (
          <TouchableOpacity key={business.id} style={styles.businessCard}>
            <View style={styles.businessLeft}>
              <Image source={{ uri: business.image }} style={styles.businessImage} />
              <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.directionButton}>
                    <Ionicons name="navigate-outline" size={18} color={colors.secondary} />
                  </TouchableOpacity>
              </View>
            </View>
            <View style={styles.businessInfo}>
              <View style={styles.businessHeader}>
                <Text style={styles.businessName} numberOfLines={1}>{business.name}</Text>
                <View style={styles.businessRating}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.ratingText}>{business.rating}</Text>
                </View>
              </View>
              
              <View style={styles.businessMeta}>
                <Text style={styles.businessType}>{business.type}</Text>
                <Text style={styles.businessPrice}>{business.price}</Text>
                <Text style={styles.businessDistance}>{business.distance}</Text>
              </View>
              
              <Text style={styles.businessAddress} numberOfLines={1}>{business.address}</Text>
              
              <View style={styles.businessHighlights}>
                {business.highlights?.slice(0, 1).map((highlight: string, index: number) => (
                  <Text key={index} style={styles.highlightText} numberOfLines={1}>• {highlight}</Text>
                ))}
              </View>
              
              <View style={styles.businessFooter}>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: business.isOpen ? '#10b981' : '#ef4444' }]} />
                  <Text style={styles.statusText}>{business.isOpen ? 'Open' : 'Closed'}</Text>
                  {business.openingHours && <Text style={styles.waitTime}>{business.openingHours}</Text>}
                </View>
                <TouchableOpacity 
                  style={styles.businessFavoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(business.id, business);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isFavorite(business.id) ? "heart" : "heart-outline"} 
                    size={14} 
                    color={isFavorite(business.id) ? "#FF6B6B" : colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Share discovery')} />
    </SafeAreaView>
  );
};

export default PlacesScreen;