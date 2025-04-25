import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export const BotTypingIndicator = () => {
  return (
    <View style={styles.typingContainer}>
      <ActivityIndicator size="small" color="#aaa" />
    </View>
  );
};

const styles = StyleSheet.create({
  typingContainer: {
    padding: 12,
    alignItems: 'flex-start',
    marginLeft: 16,
  },
});
