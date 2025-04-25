import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView, AnimatePresence, MotiText } from 'moti';
import { useThemeContext } from '@/hooks/theme-context';
import { loginUser } from '@/functions/firebase';
import { useUser } from '@/hooks/UserContext'; // Import the context to access setUserId

export default function UserInfoScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const { userId, setUserId } = useUser(); // Access setUserId from the context
  const darkMode =
    theme.background === '#0C0C0E' || theme.background === '#121212';
  useEffect(() => {
    // if (userId) router.push('/chat');
  }, [userId]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const handleSubmit = async () => {
    const emailValid = /\S+@\S+\.\S+/.test(email);
    const phoneValid = /^\d{10}$/.test(phone);
    const newErrors: typeof errors = {};

    if (!emailValid) newErrors.email = 'Enter a valid email';
    if (!phoneValid) newErrors.phone = 'Phone must be 10 digits';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      console.log('Checking if user exists in Firestore:', email, phone);
      // Simulate a call to login or register here
      // Replace with actual logic when integrating API calls
      const response = await loginUser(email, phone);
      if (response.status === 200) {
        setUserId(response?.userData?.uniqueId); // Set the user ID in context
        console.log('User logged in successfully!');
        router.push('/chat'); // Navigate to chat after successful login
      } else if (response.status === 400) {
        // Handle invalid combination
        setErrors({ email: response.message });
      } else if (response.status === 201) {
        // If new user created
        setUserId(response?.userData?.uniqueId); // Set the new user ID
        router.push('/chat'); // Navigate to chat after successful registration
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AnimatePresence>
          <MotiView
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <Text style={[styles.emoji]}>💬</Text>
            <Text style={[styles.title, { color: theme.text }]}>NovaChat</Text>
            <Text style={[styles.sub, { color: theme.subtext }]}>
              Your conversation assistant
            </Text>

            <View style={styles.inputWrapper}>
              {errors.email && (
                <MotiText
                  from={{ opacity: 0, translateY: -4 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -4 }}
                  transition={{ duration: 200 }}
                  style={[styles.errorText, { color: theme.error }]}
                >
                  {errors.email}
                </MotiText>
              )}
              <TextInput
                placeholder="Email address"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: errors.email ? theme.error : theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              {errors.phone && (
                <MotiText
                  from={{ opacity: 0, translateY: -4 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: -4 }}
                  transition={{ duration: 200 }}
                  style={[styles.errorText, { color: theme.error }]}
                >
                  {errors.phone}
                </MotiText>
              )}
              <TextInput
                placeholder="Phone number"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: errors.phone ? theme.error : theme.inputBorder,
                    color: theme.text,
                  },
                ]}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: loading ? 0.97 : 1 }}
              transition={{ type: 'timing', duration: 150 }}
              style={[
                styles.button,
                { backgroundColor: theme.button },
                loading && styles.buttonDisabled,
              ]}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                  {loading ? 'Please wait...' : 'Let’s Begin 🚀'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          </MotiView>
        </AnimatePresence>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1.3,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 4,
    marginLeft: 6,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
