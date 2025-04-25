import React, { useEffect, useRef } from 'react';
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ToastAndroid,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/hooks/theme-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt?: any;
};

export const ChatMessageList = ({ messages }: { messages: Message[] }) => {
  const { theme } = useThemeContext();
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length)
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);
  }, [messages]);

  const copy = async (txt: string) => {
    await Clipboard.setStringAsync(txt);
    if (Platform.OS === 'android')
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = item.sender === 'user';
    return (
      <View
        style={[styles.row, { alignSelf: mine ? 'flex-end' : 'flex-start' }]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => copy(item.text)}
          style={[
            styles.bubble,
            { backgroundColor: mine ? theme.button : theme.inputBg },
          ]}
        >
          <Text style={{ color: theme.text }}>{item.text}</Text>
        </TouchableOpacity>

        <View
          style={[styles.meta, { alignSelf: mine ? 'flex-end' : 'flex-start' }]}
        >
          <Text style={[styles.time, { color: theme.subtext }]}>
            {time(item.createdAt)}
          </Text>
          <Ionicons
            name="copy-outline"
            size={14}
            color={theme.subtext}
            style={{ marginLeft: 6 }}
            onPress={() => copy(item.text)}
          />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(m) => m.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

const time = (ts: any) =>
  ts
    ? new Date(
        typeof ts === 'number' ? ts : ts?.seconds ? ts.seconds * 1000 : ts
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

const styles = StyleSheet.create({
  row: { maxWidth: '80%' },
  bubble: { padding: 12, borderRadius: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  time: { fontSize: 11 },
});
