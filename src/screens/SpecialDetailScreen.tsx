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
import { SpecialsService } from '../services/specialsService';
import { Special } from '../types';
import { mockSpecialsData } from '../utils/mockData';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');

interface SpecialDetailScreenProps {
  route: {
    params: {
      specialId: string;
    };
  };
  navigation: any;
}

const SpecialDetailScreen: React.FC<SpecialDetailScreenProps> = ({ route, navigation }) => {
  const { specialId } = route.params;
  const [special, setSpecial] = useState<Special | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favoriteEventsList, toggleFavorite } = useFavorites();
  const isFavorited = favoriteEventsList.some(item => item.id === specialId);

  useEffect(() => {
    loadSpecialDetails();
  }, [specialId]);

  const loadSpecialDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from database first
      const { data, error: fetchError } = await SpecialsService.getSpecialById(specialId);

      if (data && !fetchError) {
        // Successfully fetched from database
        setSpecial(data);
      } else {
        // Failed to fetch from database, try mock data
        console.log('Trying to load from mock data, specialId:', specialId);
        const mockSpecial = mockSpecialsData.find(s => s.id.toString() === specialId || `mock-special-${s.id}` === specialId);
        
        if (mockSpecial) {
          // Convert mock data to Special format
          const convertedSpecial: Special = {
            id: `mock-special-${mockSpecial.id}`,
            business_id: 'mock-business',
            title: mockSpecial.title,
            description: mockSpecial.description || '',
            category: mockSpecial.category,
            discount: mockSpecial.discount,
            original_price: mockSpecial.originalPrice,
            new_price: mockSpecial.newPrice,
            valid_until: mockSpecial.validUntil,
            image_url: null,
            terms: null,
            is_featured: false,
            is_active: true,
            view_count: 0,
            claim_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setSpecial(convertedSpecial);
          console.log('Loaded special from mock data');
        } else {
          setError('Special not found');
          console.error('Special not found in database or mock data');
        }
      }
    } catch (err) {
      setError('Failed to load special details');
      console.error('Exception loading special:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!special) return;
    
    try {
      await Share.share({
        message: `Check out this special: ${special.title} - ${special.discount} off at LifeX!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleClaim = () => {
    console.log('Claim special:', specialId);
    // TODO: Implement claim logic
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !special) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Special not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSpecialDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const specialImages = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  ];

  const imageUrl = special.image_url || specialImages[0];

  // Calculate days remaining
  const daysRemaining = Math.ceil((new Date(special.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 3;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} bounces={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          
          {/* Discount Badge */}
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{special.discount}</Text>
            <Text style={styles.discountLabel}>OFF</Text>
          </View>

          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerRightButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => toggleFavorite({ id: specialId, title: special.title })}
              >
                <Ionicons 
                  name={isFavorited ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorited ? colors.error : colors.text} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Views */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{special.category}</Text>
            </View>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.viewsText}>{special.view_count} views</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{special.title}</Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>{special.original_price}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} style={styles.arrowIcon} />
              <Text style={styles.newPrice}>{special.new_price}</Text>
            </View>
            <Text style={styles.savingsText}>
              You save {special.discount}
            </Text>
          </View>

          {/* Valid Until */}
          <View style={[styles.validitySection, isExpiringSoon && styles.validitySectionUrgent]}>
            <Ionicons 
              name={isExpiringSoon ? "time" : "calendar-outline"} 
              size={20} 
              color={isExpiringSoon ? colors.error : colors.primary} 
            />
            <Text style={[styles.validityText, isExpiringSoon && styles.validityTextUrgent]}>
              Valid until {new Date(special.valid_until).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            {isExpiringSoon && (
              <Text style={styles.urgentBadge}>
                {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
              </Text>
            )}
          </View>

          {/* Description */}
          {special.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{special.description}</Text>
            </View>
          )}

          {/* Terms & Conditions */}
          {special.terms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{special.terms}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{special.claim_count}</Text>
              <Text style={styles.statLabel}>Claimed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{favoriteEventsList.filter(item => item.id === specialId).length > 0 ? '1' : '0'}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Claim Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
          <Text style={styles.claimButtonText}>Claim Special</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h3,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.background,
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  discountText: {
    ...typography.h2,
    color: colors.background,
    fontWeight: 'bold',
  },
  discountLabel: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  headerButtons: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  priceSection: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  originalPrice: {
    ...typography.h3,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  arrowIcon: {
    marginHorizontal: spacing.sm,
  },
  newPrice: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  savingsText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  validitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  validitySectionUrgent: {
    backgroundColor: `${colors.error}15`,
    borderWidth: 1,
    borderColor: colors.error,
  },
  validityText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  validityTextUrgent: {
    color: colors.error,
    fontWeight: '600',
  },
  urgentBadge: {
    ...typography.caption,
    color: colors.error,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statNumber: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  claimButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  claimButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: 'bold',
  },
});

export default SpecialDetailScreen;

