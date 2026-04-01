import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

import { ScreenType } from '../../App';

export default function SignUpScreen({ navigateTo, setToken }: { navigateTo: (screen: ScreenType) => void, setToken: (t: string) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (!acceptedTerms) {
      Alert.alert('Terms & Conditions', 'Please accept the terms and conditions to continue.');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
          }
        }
      });
      
      if (error) {
        Alert.alert('Failed', error.message);
        return;
      }

      if (data.session) {
        setToken(data.session.access_token);
        Alert.alert('Success', 'Account created successfully!');
        navigateTo('Dashboard');
      } else {
        Alert.alert('Almost there!', 'Please check your email for a confirmation link.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join DandoEv and start your journey.</Text>
      
      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} placeholder="John" value={firstName} onChangeText={setFirstName} placeholderTextColor="#9CA3AF" />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} placeholder="Doe" value={lastName} onChangeText={setLastName} placeholderTextColor="#9CA3AF" />
          </View>
        </View>

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
          placeholder="Min. 8 characters"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.termsContainer}>
            <TouchableOpacity 
                style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]} 
                onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
                {acceptedTerms && <Text style={styles.checkboxIcon}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.termsText}>
                I agree to the 
                <Text style={styles.termsLink} onPress={() => navigateTo('Terms')}> Terms & Conditions</Text>
            </Text>
        </View>
        
        <TouchableOpacity 
            style={[styles.button, (!acceptedTerms || loading) && { opacity: 0.7 }]} 
            onPress={handleSignUp} 
            disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
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
  container: { flexGrow: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F9FAFB' },
  title: { fontSize: 32, fontWeight: '900', fontFamily: 'InterTight_900Black', color: '#1A1D5A', marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, fontFamily: 'InterTight_400Regular', color: '#6B7280', marginBottom: 32 },
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 0.48 },
  label: { fontSize: 13, fontWeight: '700', fontFamily: 'InterTight_700Bold', color: '#1F2937', marginBottom: 8, marginTop: 4 },
  input: { 
    backgroundColor: '#F9FAFB',
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16, 
    fontSize: 16,
    fontFamily: 'InterTight_400Regular',
    color: '#111827'
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#2E3192',
    borderColor: '#2E3192',
  },
  checkboxIcon: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'InterTight_900Black',
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'InterTight_400Regular',
    color: '#6B7280',
    flex: 1,
  },
  termsLink: {
    color: '#2E3192',
    fontWeight: '700',
    fontFamily: 'InterTight_700Bold',
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
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800', fontFamily: 'InterTight_800ExtraBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 14, fontFamily: 'InterTight_400Regular' },
  link: { color: '#2E3192', fontSize: 14, fontWeight: '700', fontFamily: 'InterTight_700Bold' }
});
