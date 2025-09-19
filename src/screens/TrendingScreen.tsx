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
import { mockTrendingData } from '../utils/mockData';
import { TrendingData } from '../types';

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 2 - spacing.sm) / 2;

const TrendingScreen: React.FC = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState('Hot');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    // Waterfall Layout
    waterfallContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    waterfallColumn: {
      flex: 1,
      marginHorizontal: spacing.xs,
      maxWidth: '48%',
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
    waterfallContent: {
      padding: spacing.sm,
    },
    waterfallTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.text,
      marginBottom: spacing.xs,
      lineHeight: typography.fontSize.sm * 1.4,
    },
    waterfallTagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.xs,
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
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    },
    waterfallMoreTagsText: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    waterfallFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    waterfallAuthor: {
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    waterfallStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    waterfallLikes: {
      fontSize: typography.fontSize.xs,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Trending" 
        subtitle="What's hot right now"
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

        {/* Trending Content - Waterfall Layout */}
        <View style={styles.waterfallContainer}>
          <View style={styles.waterfallColumn}>
            {mockTrendingData.filter((_, index) => index % 2 === 0).map((trend, index) => (
              <TouchableOpacity key={trend.id} style={[styles.waterfallCard, { marginBottom: spacing.xs }]}>
                <View style={[styles.waterfallImageContainer, { height: waterfallHeights[index * 2] }]}>
                  <Image source={{ uri: 'https://picsum.photos/200/100?random=' + trend.id }} style={styles.waterfallImage} />
                  {index === 0 && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>🔥 TRENDING</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.waterfallContent}>
                  <Text style={styles.waterfallTitle} numberOfLines={2} ellipsizeMode="tail">
                    {trend.title}
                  </Text>

                  <View style={styles.waterfallTagsContainer}>
                    {trend.tags.slice(0, 2).map((tag, tagIndex) => (
                      <View key={tagIndex} style={styles.waterfallTag}>
                        <Text style={styles.waterfallTagText}>#{tag}</Text>
                      </View>
                    ))}
                    {trend.tags.length > 2 && (
                      <Text style={styles.waterfallMoreTagsText}>+{trend.tags.length - 2}</Text>
                    )}
                  </View>

                  <View style={styles.waterfallFooter}>
                    <Text style={styles.waterfallAuthor}>@{trend.author}</Text>
                    <View style={styles.waterfallStats}>
                      <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.waterfallLikes}>{trend.likes}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.waterfallColumn}>
            {mockTrendingData.filter((_, index) => index % 2 === 1).map((trend, index) => (
              <TouchableOpacity key={trend.id} style={[styles.waterfallCard, { marginBottom: spacing.xs }]}>
                <View style={[styles.waterfallImageContainer, { height: waterfallHeights[index * 2 + 1] }]}>
                  <Image source={{ uri: 'https://picsum.photos/200/100?random=' + trend.id }} style={styles.waterfallImage} />
                  {index === 0 && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>⚡ POPULAR</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.waterfallContent}>
                  <Text style={styles.waterfallTitle} numberOfLines={2} ellipsizeMode="tail">
                    {trend.title}
                  </Text>

                  <View style={styles.waterfallTagsContainer}>
                    {trend.tags.slice(0, 2).map((tag, tagIndex) => (
                      <View key={tagIndex} style={styles.waterfallTag}>
                        <Text style={styles.waterfallTagText}>#{tag}</Text>
                      </View>
                    ))}
                    {trend.tags.length > 2 && (
                      <Text style={styles.waterfallMoreTagsText}>+{trend.tags.length - 2}</Text>
                    )}
                  </View>

                  <View style={styles.waterfallFooter}>
                    <Text style={styles.waterfallAuthor}>@{trend.author}</Text>
                    <View style={styles.waterfallStats}>
                      <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.waterfallLikes}>{trend.likes}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Create post')} />
    </SafeAreaView>
  );
};

export default TrendingScreen;