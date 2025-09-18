import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockSpecialsData } from '../utils/mockData';
import { SpecialsData } from '../types';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 2 - spacing.sm) / 2;

const SpecialsScreen: React.FC = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState('Featured');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Special images for different categories
  const specialImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Coffee
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Spa
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Gym
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Groceries
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Hair salon
    'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=200&h=100&fit=crop&crop=center&auto=format&q=60', // Car wash
  ];

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
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    contentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
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
    contentCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Specials" 
        subtitle="Exclusive deals and offers"
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

        {/* Specials Content - Two Column Grid */}
        <View style={styles.contentGrid}>
          {mockSpecialsData.map((special) => (
            <TouchableOpacity key={special.id} style={styles.contentCard}>
              {/* Image at the top */}
              <Image source={{ uri: specialImages[special.id - 1] }} style={styles.contentImage} />
              
              {/* Title below image - max 2 lines */}
              <Text style={styles.contentTitle} numberOfLines={2} ellipsizeMode="tail">
                {special.title}
              </Text>

              {/* Tags in one row */}
              <View style={styles.contentTagsContainer}>
                <View style={styles.contentTag}>
                  <Text style={styles.contentTagText}>#{special.category}</Text>
                </View>
                <Text style={styles.moreTagsText}>{special.discount} OFF</Text>
              </View>

              {/* Business name and price at the bottom */}
              <View style={styles.contentFooter}>
                <Text style={styles.contentAuthor}>{special.business}</Text>
                <View style={styles.contentStats}>
                  <Text style={styles.likesText}>{special.newPrice}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Share deal')} />
    </SafeAreaView>
  );
};

export default SpecialsScreen;