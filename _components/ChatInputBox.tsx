import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/hooks/theme-context';
import { Picker } from 'emoji-mart-native'; // ✅ Proper picker

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (value.trim()) {
      onSend();
      Keyboard.dismiss();
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    onChangeText(value + emoji.native); // emoji.native contains the actual emoji
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        {/* Emoji Button */}
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            setShowEmojiPicker(!showEmojiPicker);
          }}
          style={styles.iconButton}
        >
          <Ionicons name="happy-outline" size={24} color={theme.placeholder} />
        </TouchableOpacity>

        {/* Input Field */}
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        {/* Send Button */}
        <TouchableOpacity onPress={handleSend} style={styles.iconButton}>
          <Feather name="send" size={20} color={theme.button} />
        </TouchableOpacity>
      </View>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <View style={{ height: 300, backgroundColor: theme.background }}>
          <Picker
            onSelect={handleEmojiSelect}
            theme={theme.background === '#0F172A' ? 'dark' : 'light'}
            emojiSize={Platform.OS === 'android' ? 28 : 32}
            perLine={8}
            sheetSize={64}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  iconButton: {
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
});
