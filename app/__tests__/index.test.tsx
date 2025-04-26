// __tests__/UserInfoScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
// import UserInfoScreen from '@/app/UserInfoScreen';
import { useUser } from '@/hooks/UserContext';
import { useThemeContext } from '@/hooks/theme-context';
import UserInfoScreen from '..';

// Mock hooks and modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@/hooks/UserContext', () => ({
  useUser: () => ({
    userId: null,
    setUserId: jest.fn(),
  }),
}));

jest.mock('@/hooks/theme-context', () => ({
  useThemeContext: () => ({
    theme: {
      background: '#fff',
      text: '#000',
      subtext: '#666',
      inputBg: '#eee',
      inputBorder: '#ccc',
      button: '#000',
      buttonText: '#fff',
      placeholder: '#999',
      error: 'red',
    },
    mode: false,
  }),
}));

jest.mock('@/functions/firebase', () => ({
  loginUser: jest.fn(() =>
    Promise.resolve({ status: 200, userData: { uniqueId: '12345' } })
  ),
}));

jest.mock('toastify-react-native', () => ({
  Toast: {
    success: jest.fn(),
    error: jest.fn(),
    show: jest.fn(),
  },
}));

describe('UserInfoScreen', () => {
  it('renders inputs and allows typing', async () => {
    const { getByPlaceholderText, getByText } = render(<UserInfoScreen />);

    const emailInput = getByPlaceholderText('Email address');
    const phoneInput = getByPlaceholderText('Phone number');
    const submitButton = getByText('Let’s Begin 🚀');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '1234567890');

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(emailInput.props.value).toBe('test@example.com');
      expect(phoneInput.props.value).toBe('1234567890');
    });
  });
});
