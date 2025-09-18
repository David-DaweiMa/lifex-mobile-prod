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

        {/* Trending Content - Two Column Grid */}
        <View style={styles.contentGrid}>
          {mockTrendingData.map((trend) => (
            <TouchableOpacity key={trend.id} style={styles.contentCard}>
              {/* Image at the top */}
              <Image source={{ uri: 'https://picsum.photos/200/100?random=' + trend.id }} style={styles.contentImage} />
              
              {/* Title below image - max 2 lines */}
              <Text style={styles.contentTitle} numberOfLines={2} ellipsizeMode="tail">
                {trend.title}
              </Text>

              {/* Tags in one row */}
              <View style={styles.contentTagsContainer}>
                {trend.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.contentTag}>
                    <Text style={styles.contentTagText}>#{tag}</Text>
                  </View>
                ))}
                {trend.tags.length > 2 && (
                  <Text style={styles.moreTagsText}>+{trend.tags.length - 2}</Text>
                )}
              </View>

              {/* Author and likes at the bottom */}
              <View style={styles.contentFooter}>
                <Text style={styles.contentAuthor}>@{trend.author}</Text>
                <View style={styles.contentStats}>
                  <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
                  <Text style={styles.likesText}>{trend.likes}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <FloatingActionButton onPress={() => console.log('Create post')} />
    </SafeAreaView>
  );
};

export default TrendingScreen;