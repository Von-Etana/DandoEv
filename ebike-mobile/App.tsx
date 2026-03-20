import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';

export type ScreenType = 'SignIn' | 'SignUp' | 'Dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('SignIn');

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      {currentScreen === 'SignIn' && <SignInScreen navigateTo={navigateTo} />}
      {currentScreen === 'SignUp' && <SignUpScreen navigateTo={navigateTo} />}
      {currentScreen === 'Dashboard' && <DashboardScreen navigateTo={navigateTo} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
