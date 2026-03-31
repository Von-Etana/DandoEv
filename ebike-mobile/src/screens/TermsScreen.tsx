import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function TermsScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updatedDate}>Last Updated: March 29, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. INTRODUCTION</Text>
          <Text style={styles.paragraph}>
            These Terms and Conditions (the "Terms") and our Privacy Policy govern your access to and use of the DandoEv Platform (the "Platform"), including the mobile application, web-based administrative systems, and any related services (the "Services") made available by DandoEv Limited ("DandoEv", "We", "Us" or "Our").
          </Text>
          <Text style={styles.paragraph}>
            By accessing or using the Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must immediately discontinue use of the Platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. ACCOUNT & REGISTRATION</Text>
          <Text style={styles.paragraph}>
            In order to access certain features, you may be required to create an account using your mobile number and complete identity verification procedures. You agree that all information provided shall be accurate and complete.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. OWNERSHIP & USER RESPONSIBILITIES</Text>
          <Text style={styles.paragraph}>
            Where an Asset is acquired through a financing arrangement, legal ownership remains with DandoEv until full payment. You bear full responsibility for the possession, operation, and maintenance of the Asset from delivery.
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              DandoEv shall not be liable for any injury, loss, damage, or accidents arising from your use of the Asset.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. FINANCING & PAYMENTS</Text>
          <Text style={styles.paragraph}>
            You agree to make all payments when due, including down payments and installments. You authorize DandoEv to initiate recurring debits from your designated payment method.
          </Text>
          <Text style={styles.paragraph}>
            Failure to pay may result in penalties, repossession of the Asset, or referral to debt recovery agencies.
          </Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. RESTRICTIONS</Text>
            <Text style={styles.paragraph}>
                You shall not sell, transfer, or dispose of the Asset to any third party until all payment obligations have been fully discharged.
            </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 24,
  },
  updatedDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E3192',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 20,
    fontWeight: '500',
  },
});
