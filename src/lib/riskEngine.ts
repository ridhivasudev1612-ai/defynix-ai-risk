// DEFYNIX Multi-Layer Risk Engine

export interface PersonalInfo {
  name: string;
  age: number;
  occupation: string;
  city: string;
}

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEMIs: number;
  loanAmount: number;
  loanTenure: number; // months
  savingsBalance: number;
  creditCardOutstanding: number;
}

export interface UPIData {
  monthlyTransactions: number;
  avgTransactionAmount: number;
  lateNightTransactions: number; // % of total
  gamblingAppUsage: boolean;
  cryptoTransactions: boolean;
  p2pLendingUsage: boolean;
}

export interface InsuranceData {
  hasLifeInsurance: boolean;
  hasHealthInsurance: boolean;
  hasLoanProtection: boolean;
  hasGuarantor: boolean;
  guarantorCreditScore: number; // 300-900
}

export interface AssessmentInput {
  personal: PersonalInfo;
  financial: FinancialData;
  upi: UPIData;
  insurance: InsuranceData;
}

export interface RiskFactor {
  name: string;
  score: number; // 0-100 (higher = riskier)
  weight: number;
  weightedScore: number;
  explanation: string;
  category: string;
}

export interface RiskResult {
  totalScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendation: 'Approve' | 'Review' | 'Reject';
  factors: RiskFactor[];
  insights: string[];
  trendData: { month: string; score: number }[];
}

// Layer 1: Bank Feed + Credit Behaviour (30%)
function computeBankFeedScore(fin: FinancialData): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];

  // EMI burden ratio
  const emiBurden = fin.existingEMIs / fin.monthlyIncome;
  const emiScore = Math.min(100, emiBurden * 200);
  factors.push({
    name: 'EMI Burden Ratio',
    score: Math.round(emiScore),
    weight: 0.3,
    weightedScore: 0,
    explanation: emiBurden > 0.5
      ? `High EMI burden (${(emiBurden * 100).toFixed(0)}% of income) increased risk by ${Math.round(emiScore * 0.3)}%`
      : `EMI burden at ${(emiBurden * 100).toFixed(0)}% of income is manageable`,
    category: 'Bank Feed',
  });

  // Cash flow stability
  const savingsRatio = fin.savingsBalance / (fin.monthlyIncome * 6);
  const cashFlowScore = Math.max(0, 100 - savingsRatio * 100);
  factors.push({
    name: 'Cash Flow Stability',
    score: Math.round(cashFlowScore),
    weight: 0.3,
    weightedScore: 0,
    explanation: savingsRatio < 0.5
      ? `Low savings buffer (${(savingsRatio * 6).toFixed(1)} months) signals financial stress`
      : `Healthy savings buffer of ${(savingsRatio * 6).toFixed(1)} months of expenses`,
    category: 'Bank Feed',
  });

  // Expense ratio
  const expenseRatio = fin.monthlyExpenses / fin.monthlyIncome;
  const expenseScore = Math.min(100, expenseRatio * 120);
  factors.push({
    name: 'Expense Ratio',
    score: Math.round(expenseScore),
    weight: 0.3,
    weightedScore: 0,
    explanation: `Monthly expenses consume ${(expenseRatio * 100).toFixed(0)}% of income`,
    category: 'Bank Feed',
  });

  // Credit card utilization
  const ccUtil = fin.creditCardOutstanding / Math.max(fin.monthlyIncome, 1);
  const ccScore = Math.min(100, ccUtil * 150);
  factors.push({
    name: 'Credit Card Utilization',
    score: Math.round(ccScore),
    weight: 0.3,
    weightedScore: 0,
    explanation: ccUtil > 0.5
      ? `High credit card outstanding (${(ccUtil * 100).toFixed(0)}% of monthly income)`
      : `Credit card usage within acceptable limits`,
    category: 'Bank Feed',
  });

  const avg = (emiScore + cashFlowScore + expenseScore + ccScore) / 4;
  return { score: Math.round(avg), factors };
}

// Layer 2: UPI Behaviour (20%)
function computeUPIScore(upi: UPIData): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  if (upi.gamblingAppUsage) {
    totalScore += 35;
    factors.push({
      name: 'Gambling App Detection',
      score: 90,
      weight: 0.2,
      weightedScore: 0,
      explanation: 'Gambling/betting app transactions detected — high behavioral risk flag',
      category: 'UPI Behaviour',
    });
  }

  if (upi.cryptoTransactions) {
    totalScore += 20;
    factors.push({
      name: 'Crypto Transactions',
      score: 65,
      weight: 0.2,
      weightedScore: 0,
      explanation: 'Cryptocurrency transactions detected — speculative investment risk',
      category: 'UPI Behaviour',
    });
  }

  const lateNightScore = Math.min(100, upi.lateNightTransactions * 3);
  totalScore += lateNightScore * 0.3;
  if (upi.lateNightTransactions > 15) {
    factors.push({
      name: 'Late-Night Spending',
      score: Math.round(lateNightScore),
      weight: 0.2,
      weightedScore: 0,
      explanation: `${upi.lateNightTransactions}% of UPI transactions occur between 11PM-5AM — behavioral risk indicator`,
      category: 'UPI Behaviour',
    });
  }

  const freqScore = Math.min(100, (upi.monthlyTransactions / 200) * 100);
  totalScore += freqScore * 0.15;

  const finalScore = Math.min(100, totalScore);
  if (factors.length === 0) {
    factors.push({
      name: 'UPI Behaviour',
      score: Math.round(finalScore),
      weight: 0.2,
      weightedScore: 0,
      explanation: 'UPI transaction patterns appear normal — no behavioral red flags',
      category: 'UPI Behaviour',
    });
  }

  return { score: Math.round(finalScore), factors };
}

// Layer 3: Macroeconomic Risk (15%)
function computeMacroScore(): { score: number; factors: RiskFactor[] } {
  // Simulated macro indicators
  const rbiRepoRate = 6.5;
  const sectorIndex = 42; // 0-100, simulated
  const inflationRate = 5.2;

  const macroScore = Math.min(100, (rbiRepoRate * 5) + (100 - sectorIndex) * 0.3 + inflationRate * 3);

  return {
    score: Math.round(macroScore),
    factors: [{
      name: 'Sector Risk Index',
      score: Math.round(macroScore),
      weight: 0.15,
      weightedScore: 0,
      explanation: `RBI repo rate at ${rbiRepoRate}%, inflation ${inflationRate}%, sector index ${sectorIndex}/100 — moderate macroeconomic headwinds`,
      category: 'Macroeconomic',
    }],
  };
}

// Layer 4: Protection Score (15%)
function computeProtectionScore(ins: InsuranceData): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];
  let riskReduction = 0;

  if (!ins.hasLifeInsurance) {
    factors.push({
      name: 'No Life Insurance',
      score: 70,
      weight: 0.15,
      weightedScore: 0,
      explanation: 'Absence of life insurance increases default risk in event of borrower incapacity',
      category: 'Protection',
    });
  } else riskReduction += 20;

  if (!ins.hasHealthInsurance) {
    factors.push({
      name: 'No Health Insurance',
      score: 60,
      weight: 0.15,
      weightedScore: 0,
      explanation: 'No health insurance — medical emergency could trigger loan default',
      category: 'Protection',
    });
  } else riskReduction += 15;

  if (!ins.hasLoanProtection) {
    factors.push({
      name: 'No Loan Protection',
      score: 80,
      weight: 0.15,
      weightedScore: 0,
      explanation: 'No loan protection insurance — no safety net for EMI coverage',
      category: 'Protection',
    });
  } else riskReduction += 25;

  if (ins.hasGuarantor) {
    const guarantorEffect = ins.guarantorCreditScore > 700 ? 30 : ins.guarantorCreditScore > 600 ? 15 : 5;
    riskReduction += guarantorEffect;
    factors.push({
      name: 'Guarantor Strength',
      score: Math.max(0, 100 - guarantorEffect * 2),
      weight: 0.15,
      weightedScore: 0,
      explanation: `Guarantor with score ${ins.guarantorCreditScore} provides ${guarantorEffect > 20 ? 'strong' : 'moderate'} risk mitigation`,
      category: 'Protection',
    });
  } else {
    factors.push({
      name: 'No Guarantor',
      score: 50,
      weight: 0.15,
      weightedScore: 0,
      explanation: 'No guarantor — sole borrower liability increases exposure',
      category: 'Protection',
    });
  }

  const protectionScore = Math.max(0, 80 - riskReduction);
  return { score: protectionScore, factors };
}

// Layer 5: Systemic/Network Risk (20%)
function computeNetworkRisk(fin: FinancialData): { score: number; factors: RiskFactor[] } {
  // Simulated peer comparison
  const loanToIncome = fin.loanAmount / (fin.monthlyIncome * 12);
  const peerDefault = loanToIncome > 3 ? 45 : loanToIncome > 2 ? 30 : 15;

  return {
    score: peerDefault,
    factors: [{
      name: 'Peer Default Contagion',
      score: peerDefault,
      weight: 0.2,
      weightedScore: 0,
      explanation: `Borrowers with similar loan-to-income ratio (${loanToIncome.toFixed(1)}x) show ${peerDefault}% default correlation in peer cohort`,
      category: 'Network Risk',
    }],
  };
}

export function computeRisk(input: AssessmentInput): RiskResult {
  const bank = computeBankFeedScore(input.financial);
  const upi = computeUPIScore(input.upi);
  const macro = computeMacroScore();
  const protection = computeProtectionScore(input.insurance);
  const network = computeNetworkRisk(input.financial);

  const weights = { bank: 0.30, upi: 0.20, macro: 0.15, protection: 0.15, network: 0.20 };

  const totalScore = Math.round(
    bank.score * weights.bank +
    upi.score * weights.upi +
    macro.score * weights.macro +
    protection.score * weights.protection +
    network.score * weights.network
  );

  const allFactors = [...bank.factors, ...upi.factors, ...macro.factors, ...protection.factors, ...network.factors]
    .map(f => ({ ...f, weightedScore: Math.round(f.score * f.weight) }));

  const riskLevel: RiskResult['riskLevel'] = totalScore <= 35 ? 'Low' : totalScore <= 65 ? 'Medium' : 'High';
  const recommendation: RiskResult['recommendation'] = totalScore <= 35 ? 'Approve' : totalScore <= 65 ? 'Review' : 'Reject';

  const insights = allFactors
    .filter(f => f.score > 50)
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 5)
    .map(f => f.explanation);

  // Simulated trend
  const trendData = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    score: Math.max(5, Math.min(95, totalScore + Math.round((Math.random() - 0.5) * 20 - (5 - i) * 3))),
  }));

  return { totalScore, riskLevel, recommendation, factors: allFactors, insights, trendData };
}

// What-if simulation
export function simulateWhatIf(
  base: AssessmentInput,
  overrides: Partial<FinancialData>
): RiskResult {
  return computeRisk({
    ...base,
    financial: { ...base.financial, ...overrides },
  });
}
