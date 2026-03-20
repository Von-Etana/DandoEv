import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';

const API_URL = 'http://localhost:3000/api/auth/signup';

export default function SignUpScreen({ navigateTo }: { navigateTo: (screen: string) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('Success', 'Account created successfully!');
        navigateTo('Dashboard');
      } else {
        Alert.alert('Failed', data.error || 'Registration failed');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start your electric journey today.</Text>
      
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} placeholder="John" value={firstName} onChangeText={setFirstName} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} placeholder="Doe" value={lastName} onChangeText={setLastName} />
          </View>
        </View>

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
          placeholder="Create a strong password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigateTo('SignIn')}>
            <Text style={styles.link}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#1A1D5A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 32 },
  form: { backgroundColor: '#fff', padding: 24, borderRadius: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 0.48 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#2E3192', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 14 },
  link: { color: '#2E3192', fontSize: 14, fontWeight: '700' }
});
