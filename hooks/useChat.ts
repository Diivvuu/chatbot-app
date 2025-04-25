import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMessage, createChat, getMessages } from '@/functions/firebase';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt?: number;
};

// 🔥 YOUR COHERE API KEY here
const COHERE_API_KEY = process.env.COHERE_API_KEY;
console.log(COHERE_API_KEY, 'COHERE_API_KEY');
async function fetchBotReply(userText: string): Promise<string> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-light',
        prompt: userText,
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    return (
      data.generations?.[0]?.text?.trim() || 'Sorry, I did not understand that.'
    );
  } catch (error) {
    console.error('Cohere error:', error);
    return 'Something went wrong!';
  }
}

export const useChat = (
  chatId: string | null,
  setChatId: (id: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    (async () => {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;
      setMessages(await getMessages(uid, chatId));
    })();
  }, [chatId]);

  const uniqueById = <T extends { id: string }>(arr: T[]) =>
    Array.from(new Map(arr.map((i) => [i.id, i])).values());

  const sendMessage = useCallback(async () => {
    if (!currentText.trim()) return;
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return;

    let cid = chatId;
    const firstMsg = !cid;
    if (firstMsg) {
      cid = await createChat(uid, currentText);
      setChatId(cid);
    }

    const userId = await addMessage(uid, cid!, currentText, 'user');
    if (!firstMsg) {
      setMessages((m) =>
        uniqueById([
          ...m,
          {
            id: userId,
            text: currentText,
            sender: 'user',
            createdAt: Date.now(),
          },
        ])
      );
    }
    setCurrentText('');

    setIsBotTyping(true);
    const botReply = await fetchBotReply(currentText);
    const botId = await addMessage(uid, cid!, botReply, 'bot');
    setMessages((m) =>
      uniqueById([
        ...m,
        { id: botId, text: botReply, sender: 'bot', createdAt: Date.now() },
      ])
    );
    setIsBotTyping(false);
  }, [currentText, chatId, setChatId]);

  return { messages, currentText, setCurrentText, sendMessage, isBotTyping };
};
