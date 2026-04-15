import type { AssessmentInput } from './riskEngine';

export const mockBorrowers: (AssessmentInput & { id: string })[] = [
  {
    id: 'BRW-001',
    personal: { name: 'Arjun Mehta', age: 34, occupation: 'Software Engineer', city: 'Bangalore' },
    financial: { monthlyIncome: 180000, monthlyExpenses: 85000, existingEMIs: 25000, loanAmount: 2500000, loanTenure: 60, savingsBalance: 650000, creditCardOutstanding: 45000 },
    upi: { consentGiven: true, upiId: 'ar**n@oksbi', monthlyTransactions: 95, avgTransactionAmount: 1200, lateNightTransactions: 8, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
  },
  {
    id: 'BRW-002',
    personal: { name: 'Priya Sharma', age: 28, occupation: 'Marketing Manager', city: 'Mumbai' },
    financial: { monthlyIncome: 95000, monthlyExpenses: 72000, existingEMIs: 35000, loanAmount: 1800000, loanTenure: 48, savingsBalance: 120000, creditCardOutstanding: 85000 },
    upi: { consentGiven: true, upiId: 'pr***a@paytm', monthlyTransactions: 210, avgTransactionAmount: 800, lateNightTransactions: 28, gamblingAppUsage: true, cryptoTransactions: false, p2pLendingUsage: true },
    insurance: { hasLifeInsurance: false, hasHealthInsurance: true, hasLoanProtection: false, hasGuarantor: true, guarantorCreditScore: 620 },
  },
  {
    id: 'BRW-003',
    personal: { name: 'Vikram Patel', age: 42, occupation: 'Business Owner', city: 'Ahmedabad' },
    financial: { monthlyIncome: 320000, monthlyExpenses: 140000, existingEMIs: 55000, loanAmount: 5000000, loanTenure: 84, savingsBalance: 2200000, creditCardOutstanding: 20000 },
    upi: { consentGiven: true, upiId: 'vi***m@okaxis', monthlyTransactions: 45, avgTransactionAmount: 5500, lateNightTransactions: 5, gamblingAppUsage: false, cryptoTransactions: true, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: true, hasGuarantor: true, guarantorCreditScore: 780 },
  },
  {
    id: 'BRW-004',
    personal: { name: 'Sneha Reddy', age: 26, occupation: 'Freelance Designer', city: 'Hyderabad' },
    financial: { monthlyIncome: 55000, monthlyExpenses: 48000, existingEMIs: 18000, loanAmount: 800000, loanTenure: 36, savingsBalance: 35000, creditCardOutstanding: 62000 },
    upi: { consentGiven: true, upiId: 'sn***a@ybl', monthlyTransactions: 180, avgTransactionAmount: 450, lateNightTransactions: 35, gamblingAppUsage: false, cryptoTransactions: true, p2pLendingUsage: true },
    insurance: { hasLifeInsurance: false, hasHealthInsurance: false, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
  },
  {
    id: 'BRW-005',
    personal: { name: 'Rajesh Kumar', age: 38, occupation: 'Government Employee', city: 'Delhi' },
    financial: { monthlyIncome: 75000, monthlyExpenses: 42000, existingEMIs: 12000, loanAmount: 1200000, loanTenure: 60, savingsBalance: 450000, creditCardOutstanding: 15000 },
    upi: { consentGiven: true, upiId: 'ra***h@oksbi', monthlyTransactions: 60, avgTransactionAmount: 900, lateNightTransactions: 3, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
    insurance: { hasLifeInsurance: true, hasHealthInsurance: true, hasLoanProtection: true, hasGuarantor: true, guarantorCreditScore: 750 },
  },
];

export const defaultAssessmentInput: AssessmentInput = {
  personal: { name: '', age: 30, occupation: '', city: '' },
  financial: { monthlyIncome: 100000, monthlyExpenses: 50000, existingEMIs: 15000, loanAmount: 1500000, loanTenure: 60, savingsBalance: 300000, creditCardOutstanding: 30000 },
  upi: { consentGiven: false, monthlyTransactions: 80, avgTransactionAmount: 1000, lateNightTransactions: 10, gamblingAppUsage: false, cryptoTransactions: false, p2pLendingUsage: false },
  insurance: { hasLifeInsurance: false, hasHealthInsurance: false, hasLoanProtection: false, hasGuarantor: false, guarantorCreditScore: 0 },
};
