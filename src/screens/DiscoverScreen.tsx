import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockDiscoverContent } from '../utils/mockData';

const DiscoverScreen: React.FC = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState('Recommended');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All', emoji: '🌟' },
    { id: 'food', name: 'Food & Drink', emoji: '🍽️' },
    { id: 'lifestyle', name: 'Lifestyle', emoji: '✨' },
    { id: 'environment', name: 'Environment', emoji: '🌱' },
    { id: 'culture', name: 'Culture', emoji: '🎭' },
    { id: 'adventure', name: 'Adventure', emoji: '🏔️' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Discover" 
        subtitle="Explore community content"
      />

      <View style={styles.container}>
        {/* Main Category Tabs */}
        <View style={styles.mainCategories}>
          <TouchableOpacity 
            style={[styles.mainCategoryButton, selectedMainCategory === 'Following' && styles.mainCategoryActive]}
            onPress={() => setSelectedMainCategory('Following')}
          >
            <Ionicons name="heart-outline" size={16} color={selectedMainCategory === 'Following' ? colors.text : colors.primary} />
            <Text style={[styles.mainCategoryText, selectedMainCategory === 'Following' && styles.mainCategoryTextActive]}>Following</Text>
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


        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Category Tags */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
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

          {/* Content Feed */}
          <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Featured Content</Text>
          
          {mockDiscoverContent.map((content) => (
            <TouchableOpacity key={content.id} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <View style={styles.contentImage}>
                  <Text style={styles.contentImageText}>📸</Text>
                </View>
                <View style={styles.contentInfo}>
                  <Text style={styles.contentTitle}>{content.title}</Text>
                  <Text style={styles.contentDescription}>{content.description}</Text>
                </View>
              </View>

              <View style={styles.contentMeta}>
                <View style={styles.contentAuthor}>
                  <Text style={styles.authorText}>👤 {content.author}</Text>
                  <Text style={styles.categoryText}>{content.category}</Text>
                </View>
                <Text style={styles.likesText}>❤️ {content.likes}</Text>
              </View>

              <View style={styles.tagsContainer}>
                {content.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.contentFooter}>
                <Text style={styles.readTimeText}>{content.readTime} read</Text>
                <TouchableOpacity style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>📤 Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Share Your Discovery</Text>
          <Text style={styles.ctaText}>
            Found something amazing? Share it with the LifeX community and help others discover hidden gems!
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>+ Create Post</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
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
  content: {
    padding: spacing.md,
  },
  mainCategories: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    marginHorizontal: spacing.md,
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
    justifyContent: 'center',
  },
  mainCategoryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mainCategoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  mainCategoryTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  tagsContainer: {
    marginBottom: spacing.sm,
  },
  tagsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tagTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  feedContainer: {
    marginBottom: spacing.lg,
  },
  feedTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  contentHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  contentImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contentImageText: {
    fontSize: typography.fontSize.xl,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  contentDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.md,
  },
  likesText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  shareButton: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  shareButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  ctaContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ctaTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  ctaText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ctaButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
});

export default DiscoverScreen;
