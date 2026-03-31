import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TermsScreen from './src/screens/TermsScreen';
import SplashScreen from './src/screens/SplashScreen';
import { usePushNotifications } from './src/lib/usePushNotifications';

export type ScreenType = 'SignIn' | 'SignUp' | 'Dashboard' | 'Terms';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('SignIn');
  const [token, setToken] = useState<string | null>(null);
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Initialize Push Notifications
  usePushNotifications();

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  if (isSplashVisible) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#2E3192" />
        <SplashScreen />
      </>
    );
  }

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
