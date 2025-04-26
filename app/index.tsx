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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';

export default function UserInfoScreen() {
  const router = useRouter();
  const { userId, setUserId } = useUser(); // Access setUserId from the context
  const { theme, mode } = useThemeContext();

  useEffect(() => {
    if (userId) {
      setTimeout(() => {
        router.replace('/chat');
      }, 50);
    }
  }, [userId]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return 'Email address is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const validatePhone = (phone: string) => {
    const trimmed = phone.trim();
    if (!trimmed) {
      return 'Phone number is required.';
    }
    if (/\D/.test(trimmed)) {
      return 'Phone number must contain only digits.';
    }
    if (trimmed.length !== 10) {
      return 'Phone number must be exactly 10 digits.';
    }
    return null; // no error
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    const newErrors: typeof errors = {};

    const emailError = validateEmail(trimmedEmail);
    const phoneError = validatePhone(trimmedPhone);

    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await loginUser(trimmedEmail, trimmedPhone);

      if (response.status === 200) {
        setUserId(response?.userData?.uniqueId);
        Toast.success('Welcome back! 🚀', 'bottom');
        router.replace('/chat');
      } else if (response.status === 400) {
        setErrors({ email: response.message });
      } else if (response.status === 201) {
        setUserId(response?.userData?.uniqueId);
        Toast.show({
          type: 'success',
          text1: 'Account Created Successfully 🎉',
          text2: 'Thanks for sharing your information!',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
          backgroundColor: '#10B981',
          textColor: '#ffffff',
          icon: 'check-circle',
          iconFamily: 'MaterialIcons',
          progressBarColor: '#ffffff',
          theme: 'dark',
        });
        router.replace('/chat');
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Login failed:', error.message);
      setLoading(false);
      Toast.error('Something went wrong. Please try again.', 'bottom');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={mode ? 'light-content' : 'dark-content'}
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

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: loading ? 0.97 : 1 }}
                transition={{ type: 'timing', duration: 150 }}
                style={{ alignItems: 'center' }}
              >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                  {loading ? 'Please wait...' : 'Let’s Begin 🚀'}
                </Text>
              </MotiView>
            </TouchableOpacity>
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
