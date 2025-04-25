import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useThemeContext } from '@/hooks/theme-context';

interface ChatItem {
  id: string;
  heading: string;
}

interface ChatHistoryListProps {
  chats: ChatItem[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export const ChatHistoryList: React.FC<ChatHistoryListProps> = ({
  chats,
  onSelect,
  selectedId,
}) => {
  const { theme } = useThemeContext();

  const renderItem = ({ item }: { item: ChatItem }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => onSelect(item.id)}
        style={[
          styles.chatItem,
          {
            backgroundColor: isSelected ? `${theme.button}22` : 'transparent',
            borderColor: isSelected ? theme.button : `${theme.text}22`,
          },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.chatHeading,
            { color: isSelected ? theme.button : theme.text + '99' },
          ]}
          numberOfLines={1}
        >
          {item.heading || 'Untitled Chat'}
        </Text>

        {/* You can add last message here if needed */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {chats.length === 0 ? (
        <Text style={[styles.noChats, { color: theme.subtext }]}>
          No chats yet
        </Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  noChats: {
    fontSize: 14,
    marginTop: 20,
    alignSelf: 'center',
  },
  chatItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  chatHeading: {
    fontSize: 16,
    fontWeight: '600',
  },
});
