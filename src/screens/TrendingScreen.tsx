import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockTrendingData } from '../utils/mockData';

const TrendingScreen: React.FC = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState('Recommended');
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth - spacing.md * 3) / 2; // 2 columns with spacing

  const renderTrendCard = ({ item: trend }: { item: any }) => (
    <TouchableOpacity style={[styles.trendCard, { width: cardWidth }]}>
      <View style={styles.trendHeader}>
        <View style={styles.trendIcon}>
          <Text style={styles.trendIconText}>{trend.icon}</Text>
        </View>
        <View style={[styles.growthBadge, { backgroundColor: trend.color + '20' }]}>
          <Text style={[styles.growthText, { color: trend.color }]}>
            {trend.growth}
          </Text>
        </View>
      </View>
      
      <Text style={styles.trendTitle} numberOfLines={2}>{trend.title}</Text>
      <Text style={styles.trendCategory}>{trend.category}</Text>
      
      <Text style={styles.trendDescription} numberOfLines={3}>{trend.description}</Text>
      
      <View style={styles.trendFooter}>
        <View style={styles.trendIndicator}>
          <View style={[styles.trendArrow, { backgroundColor: trend.color }]}>
            <Text style={styles.trendArrowText}>↗</Text>
          </View>
          <Text style={styles.trendLabel}>Trending</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Trending Now" 
        subtitle="What's hot in New Zealand"
      />
      <View style={styles.container}>
        {/* Main Category Tabs */}
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

        {/* Two Column Grid */}
        <FlatList
          data={mockTrendingData}
          renderItem={renderTrendCard}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gridContent: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
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
  trendsContainer: {
    marginBottom: spacing.lg,
  },
  trendCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  trendIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIconText: {
    fontSize: typography.fontSize.lg,
  },
  trendTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  trendCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  growthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  growthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  trendDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.md,
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendArrow: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  trendArrowText: {
    color: colors.text,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  trendLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});

export default TrendingScreen;
