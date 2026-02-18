# VoltRide E-Bike BNPL - PostgreSQL Database Schema

## Entity Relationship Overview

```
Users ───< Orders ───> Bikes
  │          │
  │          └───> Loans ───< Repayments
  │                  │
  │                  └───> Guarantors
  │
  └───< KYC_Documents
  └───< Notifications
  └───< Audit_Logs
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| phone | VARCHAR(20) | UNIQUE NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM('customer','guarantor','super_admin','finance_admin','compliance_officer','operations_admin') | DEFAULT 'customer' |
| customer_status | ENUM('guest','registered','bnpl_applicant','active_bnpl','defaulted','suspended') | DEFAULT 'registered' |
| kyc_status | ENUM('pending','verified','failed','expired') | DEFAULT 'pending' |
| date_of_birth | DATE | |
| address | TEXT | |
| city | VARCHAR(100) | |
| state | VARCHAR(50) | |
| employment_status | VARCHAR(50) | |
| monthly_income | DECIMAL(15,2) | |
| employer_name | VARCHAR(200) | |
| employer_address | TEXT | |
| bvn | VARCHAR(11) | ENCRYPTED |
| nin_number | VARCHAR(11) | ENCRYPTED |
| bank_name | VARCHAR(100) | |
| bank_account_number | VARCHAR(10) | ENCRYPTED |
| bank_account_name | VARCHAR(200) | |
| profile_image_url | TEXT | |
| is_email_verified | BOOLEAN | DEFAULT false |
| is_phone_verified | BOOLEAN | DEFAULT false |
| two_factor_enabled | BOOLEAN | DEFAULT false |
| two_factor_secret | VARCHAR(255) | ENCRYPTED |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| last_login_at | TIMESTAMPTZ | |

**Indexes:** email, phone, role, customer_status, kyc_status

---

### bikes
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| brand | VARCHAR(100) | NOT NULL |
| model | VARCHAR(100) | |
| description | TEXT | |
| price | DECIMAL(15,2) | NOT NULL |
| images | TEXT[] | |
| category | VARCHAR(50) | |
| motor_power | INTEGER | — watts |
| battery_capacity | INTEGER | — Wh |
| range_km | INTEGER | |
| top_speed | INTEGER | |
| weight | DECIMAL(5,1) | |
| charging_time | DECIMAL(3,1) | |
| warranty | VARCHAR(50) | |
| colors | TEXT[] | |
| availability | ENUM('in_stock','out_of_stock','pre_order') | DEFAULT 'in_stock' |
| bnpl_eligible | BOOLEAN | DEFAULT true |
| bnpl_min_down_payment | INTEGER | DEFAULT 20 |
| stock_quantity | INTEGER | DEFAULT 0 |
| rating | DECIMAL(2,1) | |
| review_count | INTEGER | DEFAULT 0 |
| features | TEXT[] | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### orders
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) |
| bike_id | UUID | REFERENCES bikes(id) |
| quantity | INTEGER | DEFAULT 1 |
| unit_price | DECIMAL(15,2) | NOT NULL |
| total_amount | DECIMAL(15,2) | NOT NULL |
| payment_method | ENUM('card','bank_transfer','wallet','bnpl') | |
| status | ENUM('pending','confirmed','processing','shipped','delivered','cancelled') | DEFAULT 'pending' |
| delivery_address | TEXT | |
| delivery_city | VARCHAR(100) | |
| delivery_state | VARCHAR(50) | |
| delivery_phone | VARCHAR(20) | |
| tracking_number | VARCHAR(50) | |
| loan_id | UUID | REFERENCES loans(id) |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### loans
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) |
| bike_id | UUID | REFERENCES bikes(id) |
| down_payment | DECIMAL(15,2) | |
| loan_amount | DECIMAL(15,2) | NOT NULL |
| interest_rate | DECIMAL(5,2) | NOT NULL |
| service_fee | DECIMAL(15,2) | |
| tenure | INTEGER | NOT NULL — months |
| monthly_repayment | DECIMAL(15,2) | NOT NULL |
| total_repayable | DECIMAL(15,2) | NOT NULL |
| status | ENUM('pending','under_review','approved','rejected','active','completed','defaulted') | DEFAULT 'pending' |
| risk_score | INTEGER | |
| kyc_verified | BOOLEAN | DEFAULT false |
| guarantor_id | UUID | REFERENCES guarantors(id) |
| guarantor_verified | BOOLEAN | DEFAULT false |
| admin_notes | TEXT | |
| rejection_reason | TEXT | |
| approved_by | UUID | REFERENCES users(id) |
| approved_at | TIMESTAMPTZ | |
| disbursed_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### repayments
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| loan_id | UUID | REFERENCES loans(id) |
| user_id | UUID | REFERENCES users(id) |
| installment_number | INTEGER | NOT NULL |
| amount | DECIMAL(15,2) | NOT NULL |
| amount_paid | DECIMAL(15,2) | DEFAULT 0 |
| due_date | DATE | NOT NULL |
| paid_date | DATE | |
| status | ENUM('upcoming','paid','overdue','failed','partial') | DEFAULT 'upcoming' |
| late_fee | DECIMAL(15,2) | DEFAULT 0 |
| payment_reference | VARCHAR(100) | |
| retry_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** loan_id, user_id, due_date, status

---

### guarantors
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| loan_id | UUID | REFERENCES loans(id) |
| applicant_user_id | UUID | REFERENCES users(id) |
| full_name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| relationship | VARCHAR(50) | |
| status | ENUM('invited','registered','accepted','declined') | DEFAULT 'invited' |
| id_document_url | TEXT | |
| signature_url | TEXT | |
| accepted_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### kyc_documents
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) |
| type | ENUM('national_id','passport','drivers_license','bvn_slip','utility_bill','bank_statement','selfie','signature') | |
| file_url | TEXT | NOT NULL |
| file_name | VARCHAR(255) | |
| verification_status | ENUM('pending','verified','rejected') | DEFAULT 'pending' |
| verified_by | UUID | REFERENCES users(id) |
| verified_at | TIMESTAMPTZ | |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() |

---

### audit_logs
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) |
| action | VARCHAR(100) | NOT NULL |
| resource | VARCHAR(50) | |
| resource_id | UUID | |
| details | TEXT | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Indexes:** user_id, action, resource, created_at

---

### notifications
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | REFERENCES users(id) |
| type | VARCHAR(50) | |
| title | VARCHAR(200) | |
| message | TEXT | |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

---

## Security Notes

1. **Encryption at rest**: BVN, NIN, bank account numbers are stored encrypted using AES-256
2. **Row Level Security (RLS)**: Enabled on all tables — users can only access their own data
3. **Audit logging**: All admin actions are logged in audit_logs table
4. **NDPR Compliance**: Data retention policies enforced, right to deletion supported
5. **PCI-DSS**: Payment card data is never stored — handled by payment gateway
