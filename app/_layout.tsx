'use client';

import React, { useEffect, useState } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/hooks/theme-context';
import { UserProvider, useUser } from '@/hooks/UserContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Header } from '../_components/Header';
import ToastManager from 'toastify-react-native'; // ✅ new import!
import { Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

const toastConfig = {
  success: (props: any) => (
    <View style={{ backgroundColor: '#4CAF50', padding: 16, borderRadius: 10 }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{props.text1}</Text>
      {props.text2 && <Text style={{ color: 'white' }}>{props.text2}</Text>}
    </View>
  ),
  // Override other toast types as needed
};

function InnerLayout() {
  const { theme, mode } = useThemeContext();
  const { userId } = useUser();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loaded, setLoaded] = useState(false);

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setLoaded(true);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (userId) {
      const currentScreen = '/' + segments.join('/');
      console.log('Current Screen:', currentScreen);

      if (!currentScreen.startsWith('/chat')) {
        router.replace('/chat');
      }
    }
  }, [userId, segments]);

  if (!fontsLoaded) return null;

  return (
    <NavThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="index"
        // screenOptions={{
        //   header: () => <Header showMenuButton={false} showTitle={false} />,
        // }}
      >
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            header: () => <Header showMenuButton={false} showTitle={false} />,
          }}
        />
      </Stack>

      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastManager config={toastConfig} />
      <UserProvider>
        <ThemeProvider>
          <InnerLayout />
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
