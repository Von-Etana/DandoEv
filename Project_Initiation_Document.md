# Project Initiation Document (PID)

## 1. Project Overview
**Project Name:** DandoEv (formerly VoltRide)
**Description:** Nigeria's premier electric bike marketplace offering flexible Buy Now, Pay Later (BNPL) payment options.
**Platform:** Web Application

## 2. Business Objectives
- To drive the adoption of electric vehicles in Nigeria by significantly reducing the financial barrier to entry.
- To provide a fast, secure, and seamless marketplace for discovering, financing, and purchasing electric bikes.
- To offer an end-to-end digital BNPL experience, integrating identity verification (KYC), financial assessment, term configuration, and checkout.

## 3. Scope of Work
### In Scope
- **E-Bike Marketplace:** A dynamic product catalog displaying detailed bike specifications, pricing, and available payment choices (full payment or BNPL).
- **Buy Now, Pay Later (BNPL) Pipeline:** A complete multi-step application journey:
  - Personal Information
  - Identity Verification (KYC)
  - Financial Details
  - Guarantor Information 
  - Customizable Loan Terms & Final Submission
- **EMI Calculator:** Automated dynamic calculation of installments based on bike price, minimum down payments, interest rates, and loan tenure (e.g., up to 24 months).
- **Authentication & Authorization:** Secure user onboarding, session management, and access control.
- **Mobile-Responsive Interface:** A tailored UI/UX with dedicated mobile navigation and optimal performance across all device form factors.
- **Admin Dashboards:** To manage platform configurations, shipping rates, and oversee loan applications.

### Out of Scope
- Haulage services features (Halted explicitly based on previous project decisions).

## 4. Key Deliverables
- A fully functional, deployed web application handling user browsing and checkout.
- Comprehensive frontend interfaces incorporating modern UI styling principles and animations.
- Robust user authentication systems.
- Production-ready implementation of the complete BNPL application process.

## 5. Technology Stack
- **Core Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling System:** Tailwind CSS v4
- **Authentication / Security:** `bcryptjs`, `jsonwebtoken`
- **Data Visualization:** `recharts`
- **Utilities:** `uuid`, `lucide-react`

## 6. Assumptions and Constraints
- **Regulatory:** Full compliance with the Central Bank of Nigeria (CBN) regulations for financial/BNPL service providers and adherence to NDPR data privacy standards.
- **Connectivity:** The application must account for variable connectivity in emerging markets, gracefully handling interrupted KYC flows or data submissions.
- **Dependencies:** Relies on third-party API availability for identity verifications and payment gateways.

## 7. Key Stakeholders
- **End-users (Buyers):** Individuals seeking affordable e-bike transportation options.
- **System Administrators:** Staff managing rates, approvals, and content.
- **Financial/Credit Assessment Operations:** Teams reviewing BNPL approvals and managing active installments.
- **Project Sponsors:** Executive management overseeing strategic goals.

## 8. Success Criteria
- Deployment of a stable release allowing users to successfully browse bikes and complete the end-to-end digital BNPL application.
- Accurate and transparent EMI calculation functioning harmoniously with diverse tenure selections.
- Responsive, bug-free performance confirmed across mobile and desktop breakpoints.
