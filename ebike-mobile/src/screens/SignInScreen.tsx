import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

import { ScreenType } from '../../App';

export default function SignInScreen({ navigateTo, setToken }: { navigateTo: (screen: ScreenType) => void, setToken: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (data.session) {
        setToken(data.session.access_token);
        Alert.alert('Success', 'Logged in successfully');
        navigateTo('Dashboard');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Sign in to your DandoEv account</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          placeholder="you@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <TouchableOpacity onPress={() => navigateTo('SignUp')}>
            <Text style={styles.link}> Create Account</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.demoButton]} onPress={() => navigateTo('Dashboard')}>
          <Text style={styles.demoText}>Skip to Dashboard (Demo)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 32, fontWeight: '900', color: '#1A1D5A', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { 
    backgroundColor: '#fff', 
    padding: 24, 
    borderRadius: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  input: { 
    backgroundColor: '#F9FAFB',
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16, 
    fontSize: 16,
    color: '#111827'
  },
  button: { 
    backgroundColor: '#2E3192', 
    padding: 18, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 8,
    shadowColor: '#2E3192',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  footerText: { color: '#6B7280', fontSize: 14 },
  link: { color: '#2E3192', fontSize: 14, fontWeight: '700' },
  demoButton: { 
    backgroundColor: 'transparent', 
    borderWidth: 0, 
    shadowOpacity: 0, 
    elevation: 0, 
    marginTop: 4 
  },
  demoText: { color: '#6B7280', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' }
});
