import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeContext } from '@/hooks/theme-context';

interface Props {
  /** optional extra styles forwarded from the parent */
  style?: ViewStyle;
}

export const EmptyState: React.FC<Props> = ({ style }) => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Welcome to NovaChat 💬
      </Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>
        Start a conversation with our assistant below.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // fills its parent
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
});
