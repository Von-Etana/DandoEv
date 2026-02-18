// ============================================================
// E-Bike BNPL Platform - Core TypeScript Types
// ============================================================

// ---- User & Auth ----
export type UserRole = 'customer' | 'guarantor' | 'super_admin' | 'finance_admin' | 'compliance_officer' | 'operations_admin';
export type CustomerStatus = 'guest' | 'registered' | 'bnpl_applicant' | 'active_bnpl' | 'defaulted' | 'suspended';
export type KYCStatus = 'pending' | 'verified' | 'failed' | 'expired';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: UserRole;
  customerStatus: CustomerStatus;
  kycStatus: KYCStatus;
  dateOfBirth?: string;
  address?: string;
  state?: string;
  city?: string;
  employmentStatus?: string;
  monthlyIncome?: number;
  employerName?: string;
  employerAddress?: string;
  bvn?: string;
  ninNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// ---- Guarantor ----
export type GuarantorStatus = 'invited' | 'registered' | 'accepted' | 'declined';

export interface Guarantor {
  id: string;
  loanApplicationId: string;
  applicantUserId: string;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  status: GuarantorStatus;
  idDocumentUrl?: string;
  signatureUrl?: string;
  acceptedAt?: string;
  createdAt: string;
}

// ---- Bikes ----
export type BikeAvailability = 'in_stock' | 'out_of_stock' | 'pre_order';

export interface Bike {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  motorPower: number;       // watts
  batteryCapacity: number;  // Wh
  range: number;            // km
  topSpeed: number;         // km/h
  weight: number;           // kg
  chargingTime: number;     // hours
  warranty: string;
  color: string[];
  availability: BikeAvailability;
  bnplEligible: boolean;
  bnplMinDownPayment: number; // percentage
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// ---- Orders ----
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'bnpl';

export interface Order {
  id: string;
  userId: string;
  bikeId: string;
  bikeName: string;
  bikeImage: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPhone: string;
  trackingNumber?: string;
  loanId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Loans / BNPL ----
export type LoanStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';

export interface LoanApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bikeId: string;
  bikeName: string;
  bikePrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  serviceFee: number;
  tenure: number;          // months
  monthlyRepayment: number;
  totalRepayable: number;
  status: LoanStatus;
  riskScore: number;
  kycVerified: boolean;
  guarantorId?: string;
  guarantorVerified: boolean;
  adminNotes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  documents: KYCDocument[];
  createdAt: string;
  updatedAt: string;
}

// ---- Repayments ----
export type RepaymentStatus = 'upcoming' | 'paid' | 'overdue' | 'failed' | 'partial';

export interface Repayment {
  id: string;
  loanId: string;
  userId: string;
  installmentNumber: number;
  amount: number;
  amountPaid: number;
  dueDate: string;
  paidDate?: string;
  status: RepaymentStatus;
  lateFee: number;
  paymentReference?: string;
  retryCount: number;
  createdAt: string;
}

// ---- KYC Documents ----
export type DocumentType = 'national_id' | 'passport' | 'drivers_license' | 'bvn_slip' | 'utility_bill' | 'bank_statement' | 'selfie' | 'signature';

export interface KYCDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: string;
  uploadedAt: string;
}

// ---- Audit Log ----
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalUsers: number;
  activeLoans: number;
  totalRevenue: number;
  bikesInStock: number;
  pendingApplications: number;
  defaultRate: number;
  monthlyRevenue: { month: string; revenue: number; loans: number }[];
  loansByStatus: { status: string; count: number }[];
  topBikes: { name: string; sales: number }[];
  recentActivity: AuditLog[];
}

// ---- Notifications ----
export type NotificationType = 'payment_reminder' | 'payment_success' | 'payment_failed' | 'loan_approved' | 'loan_rejected' | 'document_required' | 'guarantor_invite';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---- Filter Types ----
export interface BikeFilters {
  priceMin?: number;
  priceMax?: number;
  rangeMin?: number;
  batteryMin?: number;
  motorPowerMin?: number;
  availability?: BikeAvailability;
  category?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}
