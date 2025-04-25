import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeContext } from '@/hooks/theme-context';

export const ChatInputBox = ({
  value,
  onChangeText,
  onSend,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
}) => {
  const { theme } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder="Type a message…"
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        returnKeyType="send"
      />
      <TouchableOpacity onPress={onSend} style={styles.sendButton}>
        <Feather name="send" size={20} color={theme.button} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sendButton: { marginLeft: 8 },
});
