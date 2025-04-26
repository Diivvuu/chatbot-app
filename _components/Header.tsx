'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '@/hooks/theme-context';
import { useUser } from '@/hooks/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface HeaderProps {
  onMenuPress?: () => void;
  showMenuButton?: boolean;
  title?: string;
  showTitle?: boolean;
  showDropdownMenu?: boolean;
}

export function Header({
  onMenuPress,
  showMenuButton = false,
  title = '',
  showTitle = false,
  showDropdownMenu = false,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, mode } = useThemeContext();
  const { setUserId } = useUser();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['userId', 'newUserCreated']);
      setUserId(null);
      router.replace('/');
    } catch (error) {
      console.error('Error clearing storage during logout:', error);
    }
  };

  const toggleDropdown = () => {
    if (showDropdownMenu) {
      setDropdownVisible((prev) => !prev);
    } else {
      toggleTheme();
    }
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <>
      {dropdownVisible && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdown} />
      )}

      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.card,
            paddingTop: insets.top,
            height: (Platform.OS === 'ios' ? 60 : 48) + insets.top,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 4,
              },
              android: { elevation: 3 },
            }),
          },
        ]}
      >
        {/* Left: Menu Button */}
        {showMenuButton ? (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            hitSlop={8}
          >
            <Ionicons name="menu" size={22} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}

        {/* Center: Title */}
        {showTitle ? (
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Right: Dropdown */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={toggleDropdown}
            style={[
              styles.themeButton,
              {
                backgroundColor: theme.background,
                borderColor: theme.inputBorder,
              },
            ]}
            hitSlop={8}
          >
            <Ionicons
              name={
                showDropdownMenu
                  ? 'ellipsis-vertical'
                  : mode === 'dark'
                  ? 'sunny-outline'
                  : 'moon-outline'
              }
              size={18}
              color={theme.text}
            />
          </TouchableOpacity>

          {dropdownVisible && (
            <View style={[styles.dropdown, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  toggleTheme();
                  closeDropdown();
                }}
              >
                <Ionicons
                  name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                  size={16}
                  color={theme.text}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: theme.text, fontSize: 14 }}>
                  Toggle Theme
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={16}
                  color="#EF4444"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: '#EF4444', fontSize: 14 }}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000022',
    zIndex: 10,
  },
  menuButton: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 150,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});
