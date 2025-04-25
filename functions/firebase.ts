import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import UUID from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDjxzX5H6oOgKll-rtyBGX_2uNtvlMvOsQ',
  authDomain: 'chatbot-demo-5158e.firebaseapp.com',
  projectId: 'chatbot-demo-5158e',
  storageBucket: 'chatbot-demo-5158e.appspot.com',
  messagingSenderId: '936562745026',
  appId: '1:936562745026:web:9a33541e32b8e93464e55b',
};

const app = initializeApp(firebaseConfig);

/* iOS-simulator & proxy safe */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

/* ───────── auth helpers ───────── */
export const loginUser = async (email: string, phone: string) => {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'users'),
        where('email', '==', email),
        where('phoneNumber', '==', phone)
      )
    );
    if (snap.empty)
      return { status: 400, message: 'Invalid email or phone number' };

    const id = snap.docs[0].id;
    await AsyncStorage.setItem('userId', id);
    return {
      status: 200,
      message: 'Login successful',
      userData: snap.docs[0].data(),
    };
  } catch (e) {
    console.error('login', e);
    return { status: 500, message: 'Internal error' };
  }
};

export const registerUser = async (email: string, phone: string) => {
  try {
    const clash =
      (await getDoc(doc(db, 'users', email))).exists() ||
      !(
        await getDocs(
          query(collection(db, 'users'), where('phoneNumber', '==', phone))
        )
      ).empty;
    if (clash)
      return { status: 400, message: 'User with this email or phone exists.' };

    const uid = UUID.v4();
    await setDoc(doc(db, 'users', uid), { email, phoneNumber: phone, uid });
    await AsyncStorage.setItem('userId', uid);
    return { status: 201, message: 'User created' };
  } catch (e) {
    console.error('register', e);
    return { status: 500, message: 'Internal error' };
  }
};

/* ───────── chat helpers ───────── */
export const createChat = async (userId: string, firstLine = '') =>
  (
    await addDoc(collection(db, 'users', userId, 'chats'), {
      heading: firstLine.slice(0, 32),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  ).id;

export const addMessage = async (
  userId: string,
  chatId: string,
  text: string,
  sender: 'user' | 'bot'
) => {
  const ref = await addDoc(
    collection(db, 'users', userId, 'chats', chatId, 'messages'),
    {
      text,
      sender,
      createdAt: serverTimestamp(),
    }
  );
  await setDoc(
    doc(db, 'users', userId, 'chats', chatId),
    { updatedAt: serverTimestamp() },
    { merge: true }
  );
  return ref.id;
};

export const getChats = async (userId: string) =>
  (
    await getDocs(
      query(
        collection(db, 'users', userId, 'chats'),
        orderBy('updatedAt', 'desc')
      )
    )
  ).docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

export const getMessages = async (userId: string, chatId: string) =>
  (
    await getDocs(
      query(
        collection(db, 'users', userId, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      )
    )
  ).docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
