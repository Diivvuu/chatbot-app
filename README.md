# Nova Chatbot App

A modern chatbot mobile app built with **React Native**, **Firebase**, and **Cohere AI**.

This project was developed as part of a technical task to build a chatbot system that collects user information and allows dynamic interaction with a bot, with clean UI/UX, proper code quality, and feature-rich design.

---

## ✨ Features

- User onboarding with **Email** and **Phone Number**
- Input validation for email and phone fields
- Chat interface built using **@flyerhq/react-native-chat-ui**
- Bot replies powered by **Cohere AI** (trial API integration)
- Fully responsive and polished UI for Android and iOS
- Persistent **chat history** using Firebase Firestore
- Persistent **user session** using AsyncStorage
- **Create**, **View**, **Delete** chats with smooth UX
- **Quick Inquiry Buttons** to start conversations faster
- Theme switching (light/dark mode)
- Modern animations with **Moti** library

---

## 🔹 Tech Stack

- **Frontend:** React Native, Expo
- **Backend:** Firebase Firestore (DB), Firebase Functions
- **Chat UI:** @flyerhq/react-native-chat-ui
- **Bot AI:** Cohere Command-Light Model (API)
- **Storage:** AsyncStorage for persistence

---

## 📂 Project Structure

```
app/
 |_ components/     # Reusable UI components (Header, ChatList, Typing Indicator)
 |_ screens/        # ChatScreen (main chat experience)
 |_ hooks/          # useChat, theme context
 |_ functions/      # Firebase functions (for server side if needed)
 |_ assets/         # Images, icons, assets

functions/           # Cloud Functions (optional)
package.json         # Dependencies
firebase.json        # Firebase config
```

---

## ⚙️ Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/your-username/nova-chatbot.git
cd nova-chatbot
```

2. Install dependencies

```bash
npm install
```

3. Setup Firebase:

- Create a Firebase project
- Enable Firestore Database
- Update the `firebaseConfig` inside `/functions/firebase.ts`

4. Setup Cohere API Key:

- Create a free Cohere account
- Get your API key
- Add it to your Expo config (`app.config.js`) under `extra`

```js
extra: {
  cohereApiKey: "YOUR-COHERE-API-KEY",
}
```

5. Run the app:

```bash
npm start
```

Use Expo Go to scan and open the app!

---

## 💪 Key Functionalities

- **Login/Register:**

  - If the user email and phone exists → Login
  - If new → Create new Firebase document

- **Chat Handling:**

  - Create a new chat on first message
  - Fetch chat messages from Firestore
  - Delete chat via a delete icon beside each chat

- **Bot Response:**

  - Sent through Cohere AI model based on user query
  - Optimistic updates for a smoother UX

- **Local Persistence:**

  - User session saved in AsyncStorage
  - Chat history fetched automatically

- **Animations:**

  - Entry animations on message bubbles
  - Typing indicator when bot is replying

- **Theme Switching:**
  - Toggle between Light and Dark mode from the header dropdown

---


## 💪 Credits

- [React Native](https://reactnative.dev/)
- [Firebase](https://firebase.google.com/)
- [Cohere AI](https://cohere.ai/)
- [Flyer Chat UI](https://github.com/flyerhq/react-native-chat-ui)
- [Moti Animations](https://moti.fyi/)

---

## 📊 Status

> ✅ Fully functional, cleanly coded, production-ready demo app.

---

## 🔗 License

This project is licensed under the [MIT License](LICENSE).

---

### If you find this useful, don't forget to ✨ star the repo and support the project!
