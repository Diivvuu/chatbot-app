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
  ToastAndroid,
  TextInput,
} from 'react-native';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import {
  Chat,
  MessageType,
  defaultTheme as flyerTheme,
} from '@flyerhq/react-native-chat-ui';

import { useThemeContext } from '@/hooks/theme-context';
import { useChat } from '@/hooks/useChat';
import { Header } from '../_components/Header';
import { ChatHistoryList } from '@/_components/ChatHistoryList';
import { getChats, createChat, deleteChat } from '@/functions/firebase';
import { BotTypingIndicator } from '@/_components/BotTypingIndicator';
import { MessageInputBar } from '@/_components/MessageInputBar';
import dayjs from 'dayjs';
import { MotiView, MotiText } from 'moti';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.6;

const safeMs = (m?: number | { seconds: number }): number =>
  typeof m === 'number' ? m : m ? m.seconds * 1000 : Date.now();

const humanTime = (ms?: number) => (ms ? dayjs(ms).format('h:mm A') : '');

const TextBubble = ({
  message,
  isMine,
  onCopy,
}: {
  message: MessageType.Text;
  isMine: boolean;
  onCopy: () => void;
}) => {
  const { theme } = useThemeContext();

  const timestampColor = isMine ? '#E5E7EB' : '#64748B'; // lighter for user, darker for bot

  const isEmojiOnly =
    /^[\p{Emoji}\s]+$/u.test(message.text) && message.text.length <= 4;
  // 4 characters max and only emoji or spaces

  const bubbleBgColor = isEmojiOnly
    ? theme.card // use card color for emoji-only messages
    : isMine
    ? theme.button
    : theme.inputBg;

  const borderColor = isEmojiOnly
    ? isMine
      ? theme.button
      : theme.inputBorder
    : 'transparent';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', damping: 15 }}
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        paddingBottom: 10,
        paddingRight: isMine ? 10 : 0,
      }}
    >
      <View
        style={{
          backgroundColor: bubbleBgColor,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 12,
          // maxWidth: '100%',
          borderWidth: isEmojiOnly ? 1.5 : 0,
          borderColor: borderColor,
        }}
      >
        <Text
          selectable
          style={{
            color: isMine ? theme.buttonText : theme.text,
            fontSize: isEmojiOnly ? 36 : 16,
            textAlign: isEmojiOnly ? 'center' : 'left',
          }}
        >
          {message.text}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: isMine ? 'flex-end' : 'flex-start',
          marginTop: 4,
        }}
      >
        <Text style={{ fontSize: 11, color: timestampColor, marginRight: 4 }}>
          {humanTime(message.createdAt)}
        </Text>

        <TouchableOpacity onPress={onCopy}>
          <Ionicons name="copy-outline" size={14} color={timestampColor} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

export const ChatDrawerContent = ({
  chatList,
  chatId,
  setChatId,
  startNewChat,
  closeDrawer,
  refreshChats,
  handleDeleteChat,
}: {
  chatList: { id: string; heading: string }[];
  chatId: string | null;
  setChatId: (id: string) => void;
  startNewChat: () => void;
  closeDrawer: () => void;
  refreshChats: () => void;
  handleDeleteChat: (id: string) => void;
}) => {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatList;
    return chatList.filter((c) => c.heading.toLowerCase().includes(q));
  }, [chatList, query]);

  return (
    <View
      style={[
        styles.drawer,
        { backgroundColor: theme.card, paddingTop: insets.top + 20 },
      ]}
    >
      {/* Header */}
      <View style={styles.drawerHeader}>
        <Text style={[styles.drawerTitle, { color: theme.text }]}>
          Your Chats
        </Text>
        <TouchableOpacity onPress={closeDrawer} hitSlop={8}>
          <Ionicons name="close" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.subtext}
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          placeholder="Search chats…"
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={setQuery}
          style={[
            styles.searchInput,
            { backgroundColor: theme.inputBg, color: theme.text },
          ]}
        />
      </View>

      {/* New chat */}
      <TouchableOpacity
        style={[styles.newChatBtn, { borderColor: theme.text }]}
        onPress={startNewChat}
      >
        <Ionicons name="add" size={18} color={theme.text} />
        <Text style={[styles.newChatTxt, { color: theme.text }]}>
          Start new chat
        </Text>
      </TouchableOpacity>

      {/* List */}
      {filtered.length ? (
        <ChatHistoryList
          chats={filtered}
          selectedId={chatId}
          onSelect={(id) => {
            setChatId(id);
            closeDrawer();
          }}
          onRefreshChats={refreshChats}
          onDeleteChat={handleDeleteChat}
        />
      ) : (
        <View style={{ marginTop: 20, alignItems: 'center', opacity: 0.5 }}>
          <Text style={{ color: theme.subtext }}>No chats found</Text>
        </View>
      )}
    </View>
  );
};

export default function ChatScreen() {
  const { theme } = useThemeContext();
  const insets = useSafeAreaInsets();

  /* chat logic */
  const [chatId, setChatId] = useState<string | null>(null);
  const { messages, sendMessage, isBotTyping } = useChat(chatId, setChatId);

  const chatMessages: MessageType.Text[] = useMemo(
    () =>
      messages
        .filter((m) => m && m.text)
        .sort((a, b) => safeMs(b.createdAt) - safeMs(a.createdAt))
        .map<MessageType.Text>((m) => ({
          id: m.id,
          author: { id: m.sender === 'user' ? 'user' : 'bot' },
          createdAt: safeMs(m.createdAt),
          text: m.text,
          type: 'text',
        })),
    [messages]
  );

  /* drawer helpers */
  const drawerRef = useRef<DrawerLayout>(null);
  const openDrawer = () => {
    drawerRef.current?.openDrawer();
    Vibration.vibrate(6);
  };
  const closeDrawer = () => {
    drawerRef.current?.closeDrawer();
    Vibration.vibrate(6);
  };

  /* chat list (sidebar) */
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

  const handleDeleteChat = useCallback(
    async (id: string) => {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      await deleteChat(uid, id);
      refreshChats();
    },
    [refreshChats]
  );

  /* copy util */
  const copyText = async (t: string) => {
    await Clipboard.setStringAsync(t);
    Platform.OS === 'android' &&
      ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
  };

  /* empty-state UI */
  const EmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
        backgroundColor: theme.background,
        transform: Platform.OS === 'android' ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 900 }}
        style={{
          backgroundColor: theme.card,
          padding: 24,
          borderRadius: 100,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 50 }}>🤖</Text>
      </MotiView>

      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 250 }}
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: theme.text,
          textAlign: 'center',
          marginBottom: 10,
        }}
      >
        Nova is ready to chat!
      </MotiText>

      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 450 }}
        style={{
          fontSize: 16,
          color: theme.subtext,
          textAlign: 'center',
          marginBottom: 30,
        }}
      >
        Ask anything or tap a quick topic to begin.
      </MotiText>

      {[
        '🛒 Latest Offers',
        '🛠️ Technical Help',
        '🤝 Partner Programs',
        '💬 Talk to a Human',
      ].map((q, i) => (
        <MotiView
          key={q}
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 650 + i * 100 }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: theme.card,
              borderWidth: 1.4,
              borderColor: theme.button,
              borderRadius: 14,
              paddingVertical: 14,
              paddingHorizontal: 24,
              marginBottom: 12,
            }}
            onPress={() => sendMessage(`I have a ${q} inquiry.`)}
          >
            <Text
              style={{ color: theme.text, textAlign: 'center', fontSize: 16 }}
            >
              {q}
            </Text>
          </TouchableOpacity>
        </MotiView>
      ))}
    </View>
  );

  /* chat-ui theme bridge */
  const chatTheme = useMemo(
    () => ({
      ...flyerTheme,
      colors: {
        ...flyerTheme.colors,
        primary: theme.button,
        secondary: theme.inputBg,
        inputBackground: theme.inputBg,
        inputBorderColor: theme.inputBorder,
        inputTextColor: theme.text,
        inputPlaceholderColor: theme.placeholder,
        userMessageTextColor: theme.buttonText,
        botMessageTextColor: theme.text,
        background: theme.background,
      },
    }),
    [theme]
  );

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <DrawerLayout
        ref={drawerRef}
        drawerWidth={DRAWER_WIDTH}
        drawerType="front"
        overlayColor="rgba(0,0,0,0.45)"
        renderNavigationView={() => (
          <ChatDrawerContent
            chatList={chatList}
            chatId={chatId}
            setChatId={setChatId}
            startNewChat={startNewChat}
            closeDrawer={closeDrawer}
            refreshChats={refreshChats}
            handleDeleteChat={handleDeleteChat}
          />
        )}
      >
        <View
          style={{
            flex: 1,
            marginTop: Platform.OS === 'android' ? 0 : -insets.top - 10,
          }}
        >
          <Header showDropdownMenu showMenuButton onMenuPress={openDrawer} />

          <View style={styles.chatArea}>
            <Chat
              messages={chatMessages}
              onSendPress={(p) => p.text.trim() && sendMessage(p.text.trim())}
              emptyState={EmptyState}
              customBottomComponent={() => null}
              user={{ id: 'user' }}
              locale="en"
              renderTextMessage={(m) =>
                m?.type === 'text' ? (
                  <TextBubble
                    message={m}
                    isMine={m.author.id === 'user'}
                    onCopy={() => copyText(m.text)}
                  />
                ) : null
              }
              theme={chatTheme}
            />

            {isBotTyping && (
              <View style={styles.typingWrapper}>
                <BotTypingIndicator />
              </View>
            )}

            <MessageInputBar onSend={sendMessage} />
          </View>
        </View>
      </DrawerLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatArea: { flex: 1, paddingBottom: 8 },
  typingWrapper: {
    position: 'absolute',
    bottom: 62,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  /* Drawer */
  drawer: { flex: 1, paddingHorizontal: 16 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  drawerTitle: { fontSize: 18, fontWeight: '700' },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 20,
  },
  newChatTxt: { marginLeft: 6, fontSize: 14, fontWeight: '500' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 6,
  },
});
