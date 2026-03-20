import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function DashboardScreen({ navigateTo }: { navigateTo: (screen: string) => void }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Buyer 👋</Text>
          <Text style={styles.balanceTitle}>Available Credit Balance</Text>
          <Text style={styles.balance}>₦1,500,000</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigateTo('SignIn')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active BNPL Loans</Text>
        <Text style={styles.subtext}>You have no active loans right now.</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Apply for a Bike</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured E-Bikes</Text>
      
      <View style={styles.bikeCard}>
        <View style={styles.bikeImagePlaceholder}>
            <Text style={{fontSize: 40}}>🏍️</Text>
        </View>
        <View style={styles.bikeInfo}>
          <Text style={styles.bikeName}>Dando S-Series</Text>
          <Text style={styles.bikePrice}>₦850,000</Text>
          <Text style={styles.bikeMonthly}>or ₦1,200/day</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, backgroundColor: '#2E3192', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#D1D5DB', fontSize: 14, marginBottom: 8 },
  balanceTitle: { color: '#E5E7EB', fontSize: 12 },
  balance: { color: '#fff', fontSize: 32, fontWeight: '800' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  card: { backgroundColor: '#fff', margin: 24, padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#1A1D5A' },
  subtext: { color: '#6B7280', fontSize: 14, marginBottom: 16 },
  actionBtn: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#2E3192', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 24, marginBottom: 12, color: '#374151' },
  bikeCard: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', flexDirection: 'row', marginBottom: 16 },
  bikeImagePlaceholder: { width: 100, height: 100, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  bikeInfo: { padding: 16, flex: 1 },
  bikeName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  bikePrice: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  bikeMonthly: { fontSize: 12, color: '#10B981', fontWeight: '700', marginTop: 4 }
});
