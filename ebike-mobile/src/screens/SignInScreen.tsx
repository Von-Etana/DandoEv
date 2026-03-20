import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const API_URL = 'http://localhost:3000/api/auth/signin';

export default function SignInScreen({ navigateTo }: { navigateTo: (screen: string) => void }) {
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
      // Typically you'd point to your local IP instead of localhost on physical devices.
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('Success', 'Logged in successfully');
        navigateTo('Dashboard');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not reach server. Are you running the Next.js app?');
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
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <Text style={styles.label}>Password</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
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
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1D5A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#2E3192', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  footerText: { color: '#6B7280', fontSize: 14 },
  link: { color: '#2E3192', fontSize: 14, fontWeight: '700' },
  demoButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  demoText: { color: '#374151', fontSize: 14, fontWeight: '600' }
});
