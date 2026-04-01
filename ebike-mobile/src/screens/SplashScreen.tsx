import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.logoText}>Dando<Text style={styles.logoTextHighlight}>Ev</Text></Text>
        <Text style={styles.subtitle}>Empowering Electric Mobility</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3192', // Solid premium brand color
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 60,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    fontFamily: 'InterTight_900Black',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  logoTextHighlight: {
    color: '#10B981', // Premium green accent
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '500',
    fontFamily: 'InterTight_500Medium',
    letterSpacing: 0.5,
  },
});
