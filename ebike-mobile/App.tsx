import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TermsScreen from './src/screens/TermsScreen';
import { usePushNotifications } from './src/lib/usePushNotifications';

export type ScreenType = 'SignIn' | 'SignUp' | 'Dashboard' | 'Terms';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('SignIn');
  const [token, setToken] = useState<string | null>(null);

  // Initialize Push Notifications
  usePushNotifications();

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      {currentScreen === 'SignIn' && <SignInScreen navigateTo={navigateTo} setToken={setToken} />}
      {currentScreen === 'SignUp' && <SignUpScreen navigateTo={navigateTo} setToken={setToken} />}
      {currentScreen === 'Dashboard' && <DashboardScreen navigateTo={navigateTo} token={token} setToken={setToken} />}
      {currentScreen === 'Terms' && <TermsScreen onBack={() => navigateTo('SignUp')} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
