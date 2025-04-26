import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMessage, createChat, getMessages } from '@/functions/firebase';
import Constants from 'expo-constants';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt?: number;
};

/* ------------------------------------------------------------------ */
/* Cohere setup                                                       */
/* ------------------------------------------------------------------ */

const COHERE_API_KEY = Constants.expoConfig?.extra?.cohereApiKey; // ← env via app.config

async function fetchBotReply(userText: string): Promise<string> {
  try {
    const res = await fetch('https://api.cohere.ai/v1/generate', {
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
    const data = await res.json();
    return (
      data.generations?.[0]?.text?.trim() || 'Sorry, I did not understand that.'
    );
  } catch (err) {
    console.error('Cohere error:', err);
    return 'Something went wrong!';
  }
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export const useChat = (
  chatId: string | null,
  setChatId: (id: string) => void
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  /* -------- load messages when chatId changes ---------------------- */
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

  /* -------- little helper to keep the array unique ----------------- */
  const uniqueById = <T extends { id: string }>(arr: T[]) =>
    Array.from(new Map(arr.map((i) => [i.id, i])).values());

  /* -------- send message ------------------------------------------ */
  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      const uid = await AsyncStorage.getItem('userId');
      if (!uid) return;

      let cid = chatId;
      const firstMessage = !cid;

      /* create new chat on the fly */
      if (firstMessage) {
        cid = await createChat(uid, clean);
        setChatId(cid);
      }

      /* capture timestamp once */
      const now = Date.now(); // 🛠 capture the time for user message immediately

      /* optimistic user message */
      const userMsgId = await addMessage(uid, cid!, clean, 'user', now); // 🛠 pass now
      setMessages((m) =>
        uniqueById([
          ...m,
          {
            id: userMsgId,
            text: clean,
            sender: 'user',
            createdAt: now, // 🛠 use captured time
          },
        ])
      );

      /* fetch + save bot reply */
      setIsBotTyping(true);
      const botReply = await fetchBotReply(clean);

      const botNow = Date.now(); // 🛠 capture separate timestamp for bot
      const botMsgId = await addMessage(uid, cid!, botReply, 'bot', botNow); // 🛠 pass botNow
      setMessages((m) =>
        uniqueById([
          ...m,
          {
            id: botMsgId,
            text: botReply,
            sender: 'bot',
            createdAt: botNow, // 🛠
          },
        ])
      );
      setIsBotTyping(false);
    },
    [chatId, setChatId]
  );

  /* -------- public API -------------------------------------------- */
  return { messages, sendMessage, isBotTyping };
};
