import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../constants/theme';

// Import screens
import TrendingScreen from '../screens/TrendingScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SpecialsScreen from '../screens/SpecialsScreen';
import ChatScreen from '../screens/ChatScreen';
import MembershipScreen from '../screens/MembershipScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ColyScreen from '../screens/ColyScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab icon component
const TabIcon = ({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) => {
  return (
    <Ionicons 
      name={name} 
      size={20} 
      color={focused ? colors.primary : colors.textSecondary} 
    />
  );
};


// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 2,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="chatbubbles-outline" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="trending-up-outline" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Specials"
        component={SpecialsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="gift-outline" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="search-outline" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Coly"
        component={ColyScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Membership" component={MembershipScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}