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
import { mockSpecialsData } from '../utils/mockData';
import { SpecialsData } from '../types';
import { SpecialsService } from '../services/specialsService';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2;

const SpecialsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMainCategory, setSelectedMainCategory] = useState('Featured');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [specials, setSpecials] = useState<any[]>([]);
  const [isLoadingSpecials, setIsLoadingSpecials] = useState(true);
  const { favoriteEventsList, toggleFavorite, isFavorite } = useFavorites();

  const handleSearchPress = () => {
    navigation.navigate('Search' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile' as never);
  };

  // 加载特惠数据
  const loadSpecials = async () => {
    try {
      setIsLoadingSpecials(true);
      const data = await SpecialsService.getActiveSpecials();
      
      if (data && data.length > 0) {
        // 转换数据库字段到UI格式
        const formattedData = data.map((special, index) => ({
          id: special.id,
          title: special.title,
          business: 'Business Name', // 需要关联business表
          category: special.category,
          discount: special.discount,
          originalPrice: special.original_price,
          newPrice: special.new_price,
          validUntil: special.valid_until,
          description: special.description,
          // 添加图片URL，优先使用数据库的image_url，否则使用默认图片
          image: special.image_url || specialImages[index % specialImages.length],
        }));
        setSpecials(formattedData);
        console.log('Loaded specials from database:', formattedData.length);
      } else {
        console.log('No specials in database, using mock data');
        setSpecials(mockSpecialsData);
      }
    } catch (error) {
      console.error('Error loading specials:', error);
      setSpecials(mockSpecialsData);
    } finally {
      setIsLoadingSpecials(false);
    }
  };

  useEffect(() => {
    loadSpecials();
  }, []);


  // Handle scroll events for dots indicator
  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentPage(roundIndex);
  };

  // Special images for different categories
  const specialImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Coffee
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Spa
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Gym
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Groceries
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Hair salon
    'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=300&h=200&fit=crop&crop=center&auto=format&q=60', // Car wash
  ];

  // Featured specials for hero banner (前6个用于轮播)
  const featuredSpecials = specials.slice(0, 6);

  // Waterfall heights for different cards - 统一高度确保一致性
  const waterfallHeights = [200, 200, 200, 200, 200, 200, 200, 200]; // Uniform height for consistency

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'food', name: 'Food' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'business', name: 'Business' },
    { id: 'health', name: 'Health' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'services', name: 'Services' },
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
      paddingBottom: spacing.xl,
    },
    
    // Hero Banner Styles
    heroBanner: {
      height: 200,
      marginBottom: spacing.lg,
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    heroBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#ff4444',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    heroBadgeText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    heroContent: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    heroTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    heroDiscount: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: '#ff4444',
      marginBottom: spacing.xs,
    },
    heroBusiness: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    heroTimer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroTimerText: {
      fontSize: typography.fontSize.sm,
      color: '#ff4444',
      marginLeft: spacing.xs,
      fontWeight: '600',
    },
    
    // Dots Indicator
    dotsIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: '#ff4444',
    },
    dotsText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginLeft: spacing.sm,
      fontWeight: '600',
    },
    
    // Hero Banner Favorite Button Styles
    heroTimerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    heroFavoriteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    heroFavoriteCount: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },

    // Main Categories
    mainCategories: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background,
      marginHorizontal: spacing.sm,
      marginBottom: spacing.sm,
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

    // Tags
    tagsContainer: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginHorizontal: spacing.sm,
      marginBottom: spacing.lg,
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
      fontWeight: '500',
      lineHeight: typography.fontSize.xs * 1.1,
      textAlign: 'center',
    },
    tagTextActive: {
      color: colors.text,
      fontWeight: '600',
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
    waterfallCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      shadowColor: '#ff4444',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.12,
      shadowRadius: 5,
      elevation: 4,
      width: '100%',
    },
    waterfallImageContainer: {
      position: 'relative',
      overflow: 'hidden',
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
      left: spacing.sm,
      backgroundColor: '#ff4444',
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    featuredBadgeText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '700',
      color: colors.text,
    },
    waterfallDiscountBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: '#ff4444',
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      alignItems: 'center',
      minWidth: 60,
    },
    waterfallDiscountText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '700',
      color: colors.text,
      lineHeight: typography.fontSize.sm * 1.1,
    },
    waterfallOffText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text,
    },
    waterfallContent: {
      padding: spacing.sm,
    },
    waterfallTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs / 2,
      lineHeight: typography.fontSize.sm * 1.3,
    },
    waterfallBusiness: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs / 2,
    },
    waterfallPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    waterfallOriginalPrice: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      textDecorationLine: 'line-through',
      marginRight: spacing.sm,
    },
    waterfallNewPrice: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: '#ff4444',
    },
    waterfallTimer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    waterfallTimerText: {
      fontSize: typography.fontSize.xs,
      color: '#ff4444',
      marginLeft: spacing.xs / 2,
      fontWeight: '600',
    },
    waterfallClaimButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    waterfallClaimButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    
    // New styles for timer container and favorite button
    waterfallTimerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 0,
    },
    waterfallFavoriteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    waterfallFavoriteCount: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.text,
      marginLeft: spacing.xs / 2,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Specials" 
        subtitle="Exclusive deals and offers"
        onSearchPress={handleSearchPress}
        onProfilePress={handleProfilePress}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner - Featured Specials */}
        <View style={styles.heroBanner}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.heroScrollView}
            snapToInterval={width * 0.85}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {featuredSpecials.map((special, index) => {
              const isFavorited = isFavorite(special.id);
              // Calculate days remaining
              const daysRemaining = Math.ceil((new Date(special.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <TouchableOpacity 
                  key={special.id} 
                  style={styles.heroCard}
                  onPress={() => navigation.navigate('SpecialDetail', { specialId: special.id })}
                >
                  <Image source={{ uri: special.image || specialImages[index % specialImages.length] }} style={styles.heroImage} />
                  <View style={styles.heroOverlay}>
                    <View style={styles.heroBadge}>
                      <Text style={styles.heroBadgeText}>
                        {index === 0 ? '🔥 HOT DEAL' : index === 1 ? '⚡ NEW' : '💎 SPECIAL'}
                      </Text>
                    </View>
                    <View style={styles.heroContent}>
                      <Text style={styles.heroTitle} numberOfLines={2}>{special.title}</Text>
                      <Text style={styles.heroDiscount}>{special.discount} OFF</Text>
                      <Text style={styles.heroBusiness}>{special.business}</Text>
                      <View style={styles.heroTimerContainer}>
                        <View style={styles.heroTimer}>
                          <Ionicons name="time-outline" size={14} color="#ff4444" />
                          <Text style={styles.heroTimerText}>
                            {daysRemaining > 0 ? `Ends in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}` : 'Expired'}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.heroFavoriteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite({ id: special.id, title: special.title });
                          }}
                        >
                          <Ionicons 
                            name={isFavorited ? "heart" : "heart-outline"} 
                            size={14} 
                            color="#ff4444" 
                          />
                          <Text style={styles.heroFavoriteCount}>
                            {isFavorite(special.id) ? '1' : '0'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          {/* Dots Indicator */}
          <View style={styles.dotsIndicator}>
            {featuredSpecials.map((_, index) => (
              <View key={index} style={[styles.dot, index === currentPage && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Main Category Buttons */}
        <View style={styles.mainCategories}>
          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Featured' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Featured')}
          >
            <Ionicons name="star-outline" size={16} color={selectedMainCategory === 'Featured' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Featured' && styles.mainCategoryTextActive]}>Featured</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'New' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('New')}
          >
            <Ionicons name="sparkles-outline" size={16} color={selectedMainCategory === 'New' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'New' && styles.mainCategoryTextActive]}>New</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCategoryButton, selectedMainCategory === 'Expiring' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Expiring')}
          >
            <Ionicons name="time-outline" size={16} color={selectedMainCategory === 'Expiring' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Expiring' && styles.mainCategoryTextActive]}>Expiring</Text>
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

        {/* Specials Content - Waterfall Layout */}
        <View style={styles.waterfallContainer}>
          <View style={styles.waterfallColumn}>
            {specials.filter((_, index) => index % 2 === 0).map((special, index) => (
              <TouchableOpacity 
                key={special.id} 
                style={[styles.waterfallCard, { marginBottom: spacing.xs }]}
                onPress={() => navigation.navigate('SpecialDetail', { specialId: special.id })}
              >
                <View style={[styles.waterfallImageContainer, { height: waterfallHeights[(index * 2) % waterfallHeights.length] }]}>
                  <Image source={{ uri: special.image || specialImages[index % specialImages.length] }} style={styles.waterfallImage} />
                  <View style={styles.waterfallDiscountBadge}>
                    <Text style={styles.waterfallDiscountText}>{special.discount}</Text>
                    <Text style={styles.waterfallOffText}>OFF</Text>
                  </View>
                  {index === 0 && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>🔥 HOT</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.waterfallContent}>
                  <Text style={styles.waterfallTitle} numberOfLines={2}>{special.title}</Text>
                  <Text style={styles.waterfallBusiness} numberOfLines={1}>{special.business}</Text>
                  
                  <View style={styles.waterfallPriceContainer}>
                    <Text style={styles.waterfallOriginalPrice}>{special.originalPrice}</Text>
                    <Text style={styles.waterfallNewPrice}>{special.newPrice}</Text>
                  </View>
                  
                  <View style={styles.waterfallTimerContainer}>
                    <View style={styles.waterfallTimer}>
                      <Ionicons name="time-outline" size={12} color="#ff4444" />
                      <Text style={styles.waterfallTimerText}>Ends in {index + 2} days</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.waterfallFavoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(special.id, special);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isFavorite(special.id) ? "heart" : "heart-outline"} 
                        size={14} 
                        color={isFavorite(special.id) ? "#FF6B6B" : "#ff4444"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.waterfallColumn}>
            {specials.filter((_, index) => index % 2 === 1).map((special, index) => (
              <TouchableOpacity 
                key={special.id} 
                style={[styles.waterfallCard, { marginBottom: spacing.xs }]}
                onPress={() => navigation.navigate('SpecialDetail', { specialId: special.id })}
              >
                <View style={[styles.waterfallImageContainer, { height: waterfallHeights[(index * 2 + 1) % waterfallHeights.length] }]}>
                  <Image source={{ uri: special.image || specialImages[index % specialImages.length] }} style={styles.waterfallImage} />
                  <View style={styles.waterfallDiscountBadge}>
                    <Text style={styles.waterfallDiscountText}>{special.discount}</Text>
                    <Text style={styles.waterfallOffText}>OFF</Text>
                  </View>
                  {index === 0 && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>⚡ NEW</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.waterfallContent}>
                  <Text style={styles.waterfallTitle} numberOfLines={2}>{special.title}</Text>
                  <Text style={styles.waterfallBusiness} numberOfLines={1}>{special.business}</Text>
                  
                  <View style={styles.waterfallPriceContainer}>
                    <Text style={styles.waterfallOriginalPrice}>{special.originalPrice}</Text>
                    <Text style={styles.waterfallNewPrice}>{special.newPrice}</Text>
                  </View>
                  
                  <View style={styles.waterfallTimerContainer}>
                    <View style={styles.waterfallTimer}>
                      <Ionicons name="time-outline" size={12} color="#ff4444" />
                      <Text style={styles.waterfallTimerText}>Ends in {index + 3} days</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.waterfallFavoriteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(special.id, special);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isFavorite(special.id) ? "heart" : "heart-outline"} 
                        size={14} 
                        color={isFavorite(special.id) ? "#FF6B6B" : "#ff4444"} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Share deal')} />
    </SafeAreaView>
  );
};

export default SpecialsScreen;