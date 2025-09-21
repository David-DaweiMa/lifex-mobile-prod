import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { mockBusinessList, mockTrendingData, mockSpecialsData } from '../utils/mockData';
import { BusinessExtended, TrendingData, SpecialsData } from '../types';

// 统一搜索结果类型
interface SearchResult {
  id: string;
  type: 'business' | 'trending' | 'special';
  title: string;
  subtitle: string;
  category: string;
  data: BusinessExtended | TrendingData | SpecialsData;
}

const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      // 搜索商家
      const businessResults = mockBusinessList
        .filter(business =>
          business.name.toLowerCase().includes(lowerQuery) ||
          business.type.toLowerCase().includes(lowerQuery) ||
          business.category.toLowerCase().includes(lowerQuery) ||
          business.highlights.some(highlight => 
            highlight.toLowerCase().includes(lowerQuery)
          )
        )
        .map(business => ({
          id: `business-${business.id}`,
          type: 'business' as const,
          title: business.name,
          subtitle: business.type,
          category: business.category,
          data: business
        }));

      // 搜索热门内容
      const trendingResults = mockTrendingData
        .filter(trending =>
          trending.title.toLowerCase().includes(lowerQuery) ||
          trending.category.toLowerCase().includes(lowerQuery) ||
          trending.description.toLowerCase().includes(lowerQuery) ||
          trending.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
        .map(trending => ({
          id: `trending-${trending.id}`,
          type: 'trending' as const,
          title: trending.title,
          subtitle: trending.category,
          category: 'Trending',
          data: trending
        }));

      // 搜索特价优惠
      const specialsResults = mockSpecialsData
        .filter(special =>
          special.title.toLowerCase().includes(lowerQuery) ||
          special.business.toLowerCase().includes(lowerQuery) ||
          special.category.toLowerCase().includes(lowerQuery) ||
          special.description.toLowerCase().includes(lowerQuery)
        )
        .map(special => ({
          id: `special-${special.id}`,
          type: 'special' as const,
          title: special.title,
          subtitle: special.business,
          category: 'Special Offer',
          data: special
        }));

      // 合并所有结果
      results.push(...businessResults, ...trendingResults, ...specialsResults);
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    handleSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const renderSearchResult = (result: SearchResult, index: number) => {
    if (result.type === 'business') {
      const business = result.data as BusinessExtended;
      return (
        <TouchableOpacity key={result.id} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultInfo}>
              <View style={styles.resultTitleContainer}>
                <Text style={styles.resultName}>{result.title}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Business</Text>
                </View>
              </View>
              <Text style={styles.resultType}>{result.subtitle}</Text>
            </View>
            <View style={styles.resultMeta}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text style={styles.ratingText}>{business.rating}</Text>
              </View>
              <Text style={styles.distanceText}>{business.distance}</Text>
            </View>
          </View>
          
          <View style={styles.resultHighlights}>
            {business.highlights.slice(0, 2).map((highlight, idx) => (
              <Text key={idx} style={styles.highlightText}>• {highlight}</Text>
            ))}
          </View>
          
          <View style={styles.resultFooter}>
            <Text style={styles.priceText}>{business.price}</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: business.isOpen ? colors.success : colors.error }
              ]} />
              <Text style={styles.statusText}>
                {business.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (result.type === 'trending') {
      const trending = result.data as TrendingData;
      return (
        <TouchableOpacity key={result.id} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultInfo}>
              <View style={styles.resultTitleContainer}>
                <Text style={styles.resultName}>{result.title}</Text>
                <View style={[styles.typeBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.typeBadgeText}>Trending</Text>
                </View>
              </View>
              <Text style={styles.resultType}>{result.subtitle}</Text>
            </View>
            <View style={styles.resultMeta}>
              <View style={styles.trendContainer}>
                <Ionicons name="trending-up" size={14} color={colors.success} />
                <Text style={styles.trendText}>{trending.growth}</Text>
              </View>
              <Text style={styles.likesText}>{trending.likes} likes</Text>
            </View>
          </View>
          
          <Text style={styles.resultDescription} numberOfLines={2}>
            {trending.description}
          </Text>
          
          <View style={styles.resultFooter}>
            <View style={styles.tagsContainer}>
              {trending.tags.slice(0, 2).map((tag, idx) => (
                <Text key={idx} style={styles.tagText}>#{tag}</Text>
              ))}
            </View>
            <Text style={styles.readTimeText}>{trending.readTime}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (result.type === 'special') {
      const special = result.data as SpecialsData;
      return (
        <TouchableOpacity key={result.id} style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultInfo}>
              <View style={styles.resultTitleContainer}>
                <Text style={styles.resultName}>{result.title}</Text>
                <View style={[styles.typeBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.typeBadgeText}>Special</Text>
                </View>
              </View>
              <Text style={styles.resultType}>{result.subtitle}</Text>
            </View>
            <View style={styles.resultMeta}>
              <Text style={styles.discountText}>{special.discount}</Text>
            </View>
          </View>
          
          <Text style={styles.resultDescription} numberOfLines={2}>
            {special.description}
          </Text>
          
          <View style={styles.resultFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>{special.originalPrice}</Text>
              <Text style={styles.newPrice}>{special.newPrice}</Text>
            </View>
            <Text style={styles.validUntilText}>Valid until {special.validUntil}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No results found' : 'Search everything'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? `Try searching for something else`
          : `Find businesses, special offers, trending topics, and more`
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Search"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search businesses, specials, trending..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleQueryChange}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <ScrollView 
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.resultsList}>
              <Text style={styles.resultsCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              {searchResults.map((business, index) => renderSearchResult(business, index))}
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  resultsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  resultsList: {
    gap: spacing.md,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultType: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  resultMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  distanceText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  resultHighlights: {
    marginBottom: spacing.sm,
  },
  highlightText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  resultDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  trendText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  likesText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  readTimeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  discountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },
  newPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
  validUntilText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
  },
});

export default SearchScreen;
