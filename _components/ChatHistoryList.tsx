import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useThemeContext } from '@/hooks/theme-context';
import { MotiView } from 'moti';

interface ChatItem {
  id: string;
  heading: string;
}
interface Props {
  chats: ChatItem[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  onRefreshChats: () => void;
  onDeleteChat: (id: string) => void;
}

export const ChatHistoryList: React.FC<Props> = React.memo(
  ({ chats, onSelect, selectedId, onRefreshChats, onDeleteChat }: Props) => {
    const { theme } = useThemeContext();
    const [refreshing, setRefreshing] = useState(false);
    const [modalId, setModalId] = useState<string | null>(null);

    /* ------------ callbacks ------------ */
    const handleRefresh = useCallback(async () => {
      if (!onRefreshChats) return;
      setRefreshing(true);
      await onRefreshChats();
      setRefreshing(false);
    }, [onRefreshChats]);

    const renderItem = useCallback(
      ({ item }: { item: ChatItem }) => {
        const isSelected = item.id === selectedId;

        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12, // ✅ same spacing as chatItem
              backgroundColor: isSelected ? `${theme.button}22` : 'transparent',
              borderWidth: 1.5,
              borderColor: isSelected ? theme.button : `${theme.text}22`,
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => onSelect(item.id)}
              accessibilityRole="button"
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chatHeading,
                  { color: isSelected ? theme.button : theme.text + '99' },
                ]}
              >
                {item.heading || 'Untitled chat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalId(item.id)}
              style={{ padding: 8 }}
              hitSlop={10}
            >
              <Text style={{ fontSize: 16, color: '#EF4444' }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        );
      },
      [selectedId, onSelect, theme]
    );

    const keyExtractor = useCallback((item: ChatItem) => item.id, []);

    /* ------------ modal helpers ------------ */
    const executeDelete = () => {
      if (modalId) onDeleteChat?.(modalId);
      setModalId(null);
    };

    /* ------------ memoised empty state ------------ */
    const empty = useMemo(
      () => (
        <View style={styles.emptyContainer}>
          <Text style={[styles.noChats, { color: theme.subtext }]}>
            No chats yet
          </Text>
          <Text style={[styles.noChatsHint, { color: theme.subtext }]}>
            Start a conversation and it will appear here!
          </Text>
        </View>
      ),
      [theme.subtext]
    );

    return (
      <View style={{ flex: 1 }}>
        {chats.length ? (
          <FlatList
            data={chats}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.button}
                colors={[theme.button]} // android spinner
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          empty
        )}

        {/* ---------- delete confirmation modal ---------- */}
        <Modal
          transparent
          visible={!!modalId}
          animationType="fade"
          onRequestClose={() => setModalId(null)}
        >
          <View style={styles.modalOverlay}>
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 260 }}
              style={[styles.modalContent, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.modalText, { color: theme.text }]}>
                Delete this chat?
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setModalId(null)}
                  style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}
                >
                  <Text style={{ fontWeight: '600' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={executeDelete}
                  style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </MotiView>
          </View>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  /* list */
  chatItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: 12,
  },
  chatHeading: { fontSize: 16, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noChats: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  noChatsHint: { fontSize: 13 },
  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
