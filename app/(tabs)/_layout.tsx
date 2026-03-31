import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Tabs navigation shell:
// - Defines mobile tab bar visuals and behavior.
// - Keeps Home as the single tab entry for current scope.

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#18224A',
        tabBarInactiveTintColor: '#6C7596',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          height: 68,
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 8, default: 10 }),
          borderTopWidth: 0,
          borderRadius: 18,
          backgroundColor: 'rgba(247, 250, 255, 0.95)',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={22} name="house.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}