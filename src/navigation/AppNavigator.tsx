import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../constants/theme';

// Import screens
import ChatScreen from '../screens/ChatScreen';
import TrendingScreen from '../screens/TrendingScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import SpecialsScreen from '../screens/SpecialsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MembershipScreen from '../screens/MembershipScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab icon component
const TabIcon = ({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) => (
  <Ionicons 
    name={name} 
    size={20} 
    color={focused ? colors.primary : colors.textSecondary} 
  />
);

// Subscription Stack Navigator
function SubscriptionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubscriptionMain" component={SubscriptionScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
    </Stack.Navigator>
  );
}

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
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
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
              tabBarIcon: ({ focused }) => <TabIcon name="chatbubble-outline" focused={focused} />,
              tabBarLabel: 'Chat',
            }}
          />
          <Tab.Screen
            name="Trending"
            component={TrendingScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="trending-up-outline" focused={focused} />,
              tabBarLabel: 'Trending',
            }}
          />
          <Tab.Screen
            name="Specials"
            component={SpecialsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="pricetag-outline" focused={focused} />,
              tabBarLabel: 'Specials',
            }}
          />
          <Tab.Screen
            name="Discover"
            component={DiscoverScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="camera-outline" focused={focused} />,
              tabBarLabel: 'Discover',
            }}
          />
          <Tab.Screen
            name="Coly"
            component={SubscriptionStack}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name="heart-outline" focused={focused} />,
              tabBarLabel: 'Coly',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
