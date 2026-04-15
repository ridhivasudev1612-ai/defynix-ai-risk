import type { AssessmentInput } from './riskEngine';

export const mockBorrowers: (AssessmentInput & { id: string })[] = [
  {
    id: 'BRW-001',
    personal: { name: 'Arjun Mehta', dob: '1990-05-22', phone: '+91 98765 43210', email: 'arjun.mehta@example.com', gender: 'Male', nationality: 'Indian', panNumber: 'ABCPM1234L', panName: 'Arjun Mehta', age: 34, occupation: 'Software Engineer', city: 'Bangalore', whatsappLinked: true, whatsappVerified: true, emailVerified: true, phoneVerified: true },
    financial: { monthlyIncome: 180000, monthlyExpenses: 85000, existingEMIs: 25000, loanAmount: 2500000, loanTenure: 60, savingsBalance: 650000, creditCardOutstanding: 45000 },
    upi: { consentGiven: true, upiId: 'ar**n@oksbi', monthlyTransactions: 95, avgTransactionAmount: 1200, lateNightTransactions: 8, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
  },
  {
    id: 'BRW-002',
    personal: { name: 'Priya Sharma', dob: '1995-02-14', phone: '+91 91234 56780', email: 'priya.sharma@example.com', gender: 'Female', nationality: 'Indian', panNumber: 'ASDPS6789M', panName: 'Priya Sharma', age: 28, occupation: 'Marketing Manager', city: 'Mumbai', whatsappLinked: true, whatsappVerified: true, emailVerified: true, phoneVerified: true },
    financial: { monthlyIncome: 95000, monthlyExpenses: 72000, existingEMIs: 35000, loanAmount: 1800000, loanTenure: 48, savingsBalance: 120000, creditCardOutstanding: 85000 },
    upi: { consentGiven: true, upiId: 'pr***a@paytm', monthlyTransactions: 210, avgTransactionAmount: 800, lateNightTransactions: 28, gamblingAppUsage: true, cryptoTransactions: false, p2pLendingUsage: true },
    insurance: { hasLifeInsurance: false, hasHealthInsurance: true, hasLoanProtection: false, hasGuarantor: true, guarantorCreditScore: 620 },
  },
  {
    id: 'BRW-003',
    personal: { name: 'Vikram Patel', dob: '1982-11-08', phone: '+91 99876 54321', email: 'vikram.patel@example.com', gender: 'Male', nationality: 'Indian', panNumber: 'QWERT1234Y', panName: 'Vikram Patel', age: 42, occupation: 'Business Owner', city: 'Ahmedabad', whatsappLinked: false, whatsappVerified: false, emailVerified: true, phoneVerified: true },
    financial: { monthlyIncome: 320000, monthlyExpenses: 140000, existingEMIs: 55000, loanAmount: 5000000, loanTenure: 84, savingsBalance: 2200000, creditCardOutstanding: 20000 },
    upi: { consentGiven: true, upiId: 'vi***m@okaxis', monthlyTransactions: 45, avgTransactionAmount: 5500, lateNightTransactions: 5, gamblingAppUsage: false, cryptoTransactions: true, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: true, hasGuarantor: true, guarantorCreditScore: 780 },
  },
  {
    id: 'BRW-004',
    personal: { name: 'Sneha Reddy', dob: '1998-07-30', phone: '+91 90123 45678', email: 'sneha.reddy@example.com', gender: 'Female', nationality: 'Indian', panNumber: 'ZXCVB1234L', panName: 'Sneha Reddy', age: 26, occupation: 'Freelance Designer', city: 'Hyderabad', whatsappLinked: false, whatsappVerified: false, emailVerified: true, phoneVerified: true },
    financial: { monthlyIncome: 55000, monthlyExpenses: 48000, existingEMIs: 18000, loanAmount: 800000, loanTenure: 36, savingsBalance: 35000, creditCardOutstanding: 62000 },
    upi: { consentGiven: true, upiId: 'sn***a@ybl', monthlyTransactions: 180, avgTransactionAmount: 450, lateNightTransactions: 35, gamblingAppUsage: false, cryptoTransactions: true, p2pLendingUsage: true },
    insurance: { hasLifeInsurance: false, hasHealthInsurance: false, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
  },
  {
    id: 'BRW-005',
    personal: { name: 'Rajesh Kumar', dob: '1986-09-17', phone: '+91 97654 32109', email: 'rajesh.kumar@example.com', gender: 'Male', nationality: 'Indian', panNumber: 'LMNOP1234R', panName: 'Rajesh Kumar', age: 38, occupation: 'Government Employee', city: 'Delhi', whatsappLinked: false, whatsappVerified: false, emailVerified: true, phoneVerified: true },
    financial: { monthlyIncome: 75000, monthlyExpenses: 42000, existingEMIs: 12000, loanAmount: 1200000, loanTenure: 60, savingsBalance: 450000, creditCardOutstanding: 15000 },
    upi: { consentGiven: true, upiId: 'ra***h@oksbi', monthlyTransactions: 60, avgTransactionAmount: 900, lateNightTransactions: 3, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: true, hasGuarantor: true, guarantorCreditScore: 750 },
  },
];

export const defaultAssessmentInput: AssessmentInput = {
  personal: { name: '', dob: '', phone: '', email: '', gender: '', nationality: '', panNumber: '', panName: '', age: 30, occupation: '', city: '', whatsappLinked: false, whatsappVerified: false, emailVerified: false, phoneVerified: false },
  financial: { monthlyIncome: 100000, monthlyExpenses: 50000, existingEMIs: 15000, loanAmount: 1500000, loanTenure: 60, savingsBalance: 0, creditCardOutstanding: 0 },
  upi: { consentGiven: false, monthlyTransactions: 80, avgTransactionAmount: 1000, lateNightTransactions: 10, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
  insurance: { hasLifeInsurance: false, hasHealthInsurance: false, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
};
