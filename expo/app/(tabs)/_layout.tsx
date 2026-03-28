import { Tabs } from "expo-router";
import { Trophy, BarChart3, Settings } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopColor: "#374151",
          borderTopWidth: 1,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Матчи",
          tabBarIcon: ({ color }) => <Trophy color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Статистика",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Настройки",
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
