'use client';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useThemeContext } from '@/hooks/theme-context';
import { useChat } from '@/hooks/useChat';
import { ChatMessageList } from '@/app/_components/ChatMessageList';
import { ChatInputBox } from '@/app/_components/ChatInputBox';
import { BotTypingIndicator } from '@/app/_components/BotTypingIndicator';
import { EmptyState } from '@/app/_components/EmptyState';
import { ChatHistoryList } from '@/app/_components/ChatHistoryList';
import { getChats, createChat } from '@/functions/firebase';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.6;

export default function ChatScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  const [chatId, setChatId] = useState<string | null>(null);
  const { messages, currentText, setCurrentText, sendMessage, isBotTyping } =
    useChat(chatId, setChatId);

  const drawerRef = useRef<DrawerLayout>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => {
    drawerRef.current?.openDrawer();
    Vibration.vibrate(6);
  };
  const closeDrawer = () => {
    drawerRef.current?.closeDrawer();
    Vibration.vibrate(6);
  };

  const [chatList, setChatList] = useState<{ id: string; heading: string }[]>(
    []
  );
  const refreshChats = useCallback(async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (uid) setChatList(await getChats(uid));
  }, []);
  useEffect(() => {
    refreshChats();
  }, [chatId, refreshChats]);

  const startNewChat = useCallback(async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return;
    const id = await createChat(uid);
    setChatId(id);
    closeDrawer();
  }, []);

  const drawerContent = useMemo(
    () => (
      <SafeAreaView style={[styles.drawer, { backgroundColor: theme.card }]}>
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, { color: theme.text }]}>
            Your Chats
          </Text>
          <TouchableOpacity onPress={closeDrawer} hitSlop={8}>
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.newChatBtn, { borderColor: theme.text }]}
          onPress={startNewChat}
        >
          <Ionicons name="add" size={18} color={theme.text} />
          <Text style={[styles.newChatTxt, { color: theme.text }]}>
            Start new chat
          </Text>
        </TouchableOpacity>
        <ChatHistoryList
          chats={chatList}
          selectedId={chatId}
          onSelect={(id) => {
            setChatId(id);
            closeDrawer();
          }}
        />
      </SafeAreaView>
    ),
    [theme, chatList, chatId, startNewChat]
  );

  return (
    <DrawerLayout
      ref={drawerRef}
      drawerWidth={DRAWER_WIDTH}
      drawerPosition="left"
      drawerType="front"
      overlayColor="rgba(0,0,0,0.45)"
      renderNavigationView={() => drawerContent}
      onDrawerOpen={() => setDrawerOpen(true)}
      onDrawerClose={() => setDrawerOpen(false)}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.card,
              paddingTop: insets.top,
              height: (Platform.OS === 'ios' ? 60 : 48) + insets.top,
              ...(drawerOpen
                ? null
                : Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                    },
                    android: { elevation: 3 },
                  })),
            },
          ]}
        >
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            hitSlop={8}
          >
            <Ionicons name="menu" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>NovaChat</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.chatArea}>
          {messages.length ? (
            <>
              <ChatMessageList messages={messages} />
              {isBotTyping && <BotTypingIndicator />}
            </>
          ) : (
            <EmptyState style={{ paddingTop: 32 }} />
          )}
        </View>

        <ChatInputBox
          value={currentText}
          onChangeText={setCurrentText}
          onSend={sendMessage}
        />
      </SafeAreaView>
    </DrawerLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000022',
  },
  menuButton: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '600' },
  chatArea: { flex: 1, paddingHorizontal: 16, paddingBottom: 8 },
  drawer: { flex: 1, paddingHorizontal: 16 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: { fontSize: 18, fontWeight: '700' },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 18,
  },
  newChatTxt: { marginLeft: 6, fontSize: 14, fontWeight: '500' },
});
