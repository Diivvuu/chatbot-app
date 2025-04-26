'use client';

import React, { useEffect, useState } from 'react';
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'; // ✅ Correct import
import { useThemeContext } from '@/hooks/theme-context';
import * as Clipboard from 'expo-clipboard';
import { Platform, ToastAndroid, SafeAreaView } from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt?: any;
};

export const ChatMessageList = ({ messages }: { messages: Message[] }) => {
  const { theme } = useThemeContext();
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    const converted = messages.map((m) => ({
      id: m.id,
      type: 'text',
      content: m.text,
      createdAt: m.createdAt
        ? new Date(
            typeof m.createdAt === 'number'
              ? m.createdAt
              : m.createdAt.seconds * 1000
          ).toISOString()
        : new Date().toISOString(),
      senderId: m.sender === 'user' ? 'user' : 'bot',
    }));
    setChatMessages(converted);
  }, [messages]);

  const copyText = async (text: string) => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
    }
  };

  const handleLongPress = (message: any) => {
    if (message.type === 'text') {
      copyText(message.content);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Chat
        messages={chatMessages}
        onSendPress={() => {}}
        user={{ id: 'user' }}
        // onPressMessage={handleLongPress}
        // disableComposer
      />
    </SafeAreaView>
  );
};
