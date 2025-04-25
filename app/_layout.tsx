'use client';

import React, { useEffect, useState } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/hooks/theme-context';
import { TouchableOpacity, Text, View } from 'react-native';
import { UserProvider, useUser } from '@/hooks/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // 🛠 ADD THIS

SplashScreen.preventAutoHideAsync();

function InnerLayout() {
  const { theme, mode, toggleTheme } = useThemeContext();
  const { userId } = useUser();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null; // Wait for fonts and splash

  return (
    <NavThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName={userId ? 'chat' : 'index'}>
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>

      {/* Floating Theme Toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          position: 'absolute',
          top: 40,
          right: 20,
          backgroundColor: mode === 'dark' ? '#333' : '#EEE',
          padding: 12,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        <Text style={{ color: mode === 'dark' ? '#FFF' : '#000' }}>
          {mode === 'dark' ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider>
          <InnerLayout />
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
