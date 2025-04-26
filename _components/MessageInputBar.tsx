import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Picker } from 'emoji-mart-native';
import { useThemeContext } from '@/hooks/theme-context';

export const MessageInputBar = ({
  onSend,
}: {
  onSend: (text: string) => void;
}) => {
  const { theme } = useThemeContext();
  const [value, setValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const send = () => {
    const txt = value.trim();
    if (!txt) return;
    onSend(txt);
    setValue('');
    setShowPicker(false);
    Keyboard.dismiss();
  };

  return (
    <>
      <View
        style={[
          styles.wrapper,
          {
            backgroundColor: theme.card,
            borderColor: '#00000020',
            borderWidth: 2,
            borderRadius: 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            setShowPicker((p) => !p);
          }}
          style={styles.iconBtn}
        >
          <Ionicons name="happy-outline" size={24} color={theme.placeholder} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1.3,
            },
          ]}
          placeholder="Message"
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={setValue}
          returnKeyType="send"
          onSubmitEditing={send}
          multiline={false}
        />

        <TouchableOpacity onPress={send} style={styles.iconBtn}>
          <Ionicons name="send" size={22} color={theme.button} />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <View style={{ height: 260 }}>
          <Picker
            onSelect={(e: any) => setValue((v) => v + e.native)}
            theme={theme.background === '#0F172A' ? 'dark' : 'light'}
            emojiSize={Platform.OS === 'android' ? 28 : 32}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconBtn: { paddingHorizontal: 6 },
  input: { flex: 1, fontSize: 16, paddingVertical: 6 },
});
