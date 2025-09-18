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

const SpecialsScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const filters = [
    { id: 'all', name: 'All Deals' },
    { id: 'food', name: 'Food & Drink' },
    { id: 'beauty', name: 'Beauty & Wellness' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'shopping', name: 'Shopping' },
  ];

  const specials = [
    {
      id: 1,
      title: '50% Off Coffee & Pastries',
      business: 'Café Supreme',
      category: 'food',
      discount: '50%',
      originalPrice: '$15',
      newPrice: '$7.50',
      validUntil: '2024-02-15',
      description: 'Perfect morning combo with our signature blend',
      image: '☕',
    },
    {
      id: 2,
      title: 'Free Consultation + 20% Off',
      business: 'Spa Relax',
      category: 'beauty',
      discount: '20%',
      originalPrice: '$120',
      newPrice: '$96',
      validUntil: '2024-02-20',
      description: 'Deep tissue massage with free wellness consultation',
      image: '🧘',
    },
    {
      id: 3,
      title: 'Buy 1 Get 1 Free Gym Pass',
      business: 'FitZone',
      category: 'fitness',
      discount: '50%',
      originalPrice: '$40',
      newPrice: '$20',
      validUntil: '2024-02-25',
      description: 'Bring a friend and both get full access',
      image: '💪',
    },
    {
      id: 4,
      title: '25% Off All Organic Products',
      business: 'Green Market',
      category: 'shopping',
      discount: '25%',
      originalPrice: '$80',
      newPrice: '$60',
      validUntil: '2024-02-18',
      description: 'Stock up on organic groceries and household items',
      image: '🌱',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header 
        title="Special Deals" 
        subtitle="Exclusive offers just for you"
      />
      <View style={styles.container}>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Specials Grid */}
        <View style={styles.specialsContainer}>
          {specials
            .filter(special => selectedFilter === 'all' || special.category === selectedFilter)
            .map((special) => (
              <TouchableOpacity key={special.id} style={styles.specialCard}>
                <View style={styles.specialHeader}>
                  <View style={styles.specialImage}>
                    <Text style={styles.specialImageText}>{special.image}</Text>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{special.discount} OFF</Text>
                  </View>
                </View>

                <View style={styles.specialContent}>
                  <Text style={styles.specialTitle}>{special.title}</Text>
                  <Text style={styles.specialBusiness}>{special.business}</Text>
                  <Text style={styles.specialDescription}>{special.description}</Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>{special.originalPrice}</Text>
                    <Text style={styles.newPrice}>{special.newPrice}</Text>
                  </View>

                  <View style={styles.validUntilContainer}>
                    <Text style={styles.validUntilLabel}>Valid until:</Text>
                    <Text style={styles.validUntilText}>{special.validUntil}</Text>
                  </View>

                  <TouchableOpacity style={styles.claimButton}>
                    <Text style={styles.claimButtonText}>Claim Deal</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
        </View>

        {/* How it works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Browse amazing deals</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Tap to claim your deal</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Show code at business</Text>
            </View>
          </View>
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
  filtersContainer: {
    marginBottom: spacing.xl,
  },
  filtersContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextActive: {
    color: colors.text,
  },
  specialsContainer: {
    marginBottom: spacing.xl,
  },
  specialCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: 0,
  },
  specialImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialImageText: {
    fontSize: typography.fontSize.xl,
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  specialContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  specialTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  specialBusiness: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  specialDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  originalPrice: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },
  newPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary,
  },
  validUntilContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  validUntilLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  validUntilText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  howItWorksContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  howItWorksTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  stepContainer: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  stepText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
});

export default SpecialsScreen;
