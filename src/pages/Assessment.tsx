import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultAssessmentInput } from '@/lib/mockData';
import { computeRisk, maskUpiId, hashUpiId, type AssessmentInput } from '@/lib/riskEngine';
import RiskGauge from '@/components/RiskGauge';
import RiskBreakdown from '@/components/RiskBreakdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const steps = ['Personal Info', 'Financial Data', 'UPI Analysis', 'Insurance & Protection'];

const Assessment = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentInput>({ ...defaultAssessmentInput });
  const [result, setResult] = useState<ReturnType<typeof computeRisk> | null>(null);
  const navigate = useNavigate();

  const updatePersonal = (key: string, value: string | number) =>
    setData(d => ({ ...d, personal: { ...d.personal, [key]: value } }));
  const updateFinancial = (key: string, value: number) =>
    setData(d => ({ ...d, financial: { ...d.financial, [key]: value } }));
  const updateUPI = (key: string, value: number | boolean | string) =>
    setData(d => ({ ...d, upi: { ...d.upi, [key]: value } }));
  const updateInsurance = (key: string, value: boolean | number) =>
    setData(d => ({ ...d, insurance: { ...d.insurance, [key]: value } }));

  const handleSubmit = () => {
    const r = computeRisk(data);
    setResult(r);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground font-body text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition";
  const labelClass = "text-sm font-medium text-secondary-foreground mb-1.5 block";
  const toggleClass = (active: boolean) =>
    `px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${active ? 'gradient-primary text-primary-foreground border-transparent shadow-glow' : 'bg-muted text-muted-foreground border-border hover:text-foreground'}`;

  if (result) {
    const barData = result.factors.map(f => ({ name: f.name.slice(0, 18), score: f.score, weighted: f.weightedScore }));

    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Risk Assessment Result</h1>
                <p className="text-muted-foreground text-sm mt-1">{data.personal.name || 'Applicant'} • {data.personal.city || 'India'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setResult(null); setStep(0); }} className="px-5 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                  New Assessment
                </button>
                <button onClick={() => navigate('/monitoring')} className="px-5 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
                  Monitoring →
                </button>
              </div>
            </div>

            {/* Recommendation banner */}
            <div className={`rounded-lg p-4 mb-8 border ${result.recommendation === 'Approve' ? 'border-success/30 bg-success/10' : result.recommendation === 'Review' ? 'border-warning/30 bg-warning/10' : 'border-destructive/30 bg-destructive/10'}`}>
              <span className={`font-heading font-bold text-sm ${result.recommendation === 'Approve' ? 'text-success' : result.recommendation === 'Review' ? 'text-warning' : 'text-destructive'}`}>
                RECOMMENDATION: {result.recommendation.toUpperCase()}
              </span>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Gauge */}
              <div className="rounded-lg border border-border bg-card p-8 shadow-card flex flex-col items-center justify-center">
                <RiskGauge score={result.totalScore} riskLevel={result.riskLevel} />
              </div>

              {/* Trend chart */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h3 className="font-heading font-semibold text-foreground mb-4">Risk Trend (6 Months)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={result.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 16%)" />
                    <XAxis dataKey="month" stroke="hsl(200, 10%, 50%)" fontSize={12} />
                    <YAxis stroke="hsl(200, 10%, 50%)" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 18%, 8%)', border: '1px solid hsl(200, 15%, 16%)', borderRadius: '8px', color: 'hsl(180, 10%, 92%)' }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(174, 72%, 46%)" strokeWidth={2} dot={{ fill: 'hsl(174, 72%, 46%)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h3 className="font-heading font-semibold text-foreground mb-4">Risk Factor Scores</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 16%)" />
                    <XAxis type="number" stroke="hsl(200, 10%, 50%)" fontSize={11} domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="hsl(200, 10%, 50%)" fontSize={10} width={120} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 18%, 8%)', border: '1px solid hsl(200, 15%, 16%)', borderRadius: '8px', color: 'hsl(180, 10%, 92%)' }} />
                    <Bar dataKey="score" fill="hsl(174, 72%, 46%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Breakdown */}
              <RiskBreakdown factors={result.factors} insights={result.insights} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Risk Assessment</h1>
        <p className="text-muted-foreground text-sm mb-8">Multi-layer default risk analysis</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0 transition-all ${i <= step ? 'gradient-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium hidden md:block ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-border bg-card p-6 shadow-card"
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Personal Information</h2>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input className={inputClass} placeholder="Enter full name" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Age</label>
                    <input className={inputClass} type="number" value={data.personal.age} onChange={e => updatePersonal('age', +e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={inputClass} placeholder="City" value={data.personal.city} onChange={e => updatePersonal('city', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Occupation</label>
                  <input className={inputClass} placeholder="Occupation" value={data.personal.occupation} onChange={e => updatePersonal('occupation', e.target.value)} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Financial Data</h2>
                {([
                  ['monthlyIncome', 'Monthly Income (₹)'],
                  ['monthlyExpenses', 'Monthly Expenses (₹)'],
                  ['existingEMIs', 'Existing EMIs (₹)'],
                  ['loanAmount', 'Loan Amount (₹)'],
                  ['loanTenure', 'Loan Tenure (months)'],
                  ['savingsBalance', 'Savings Balance (₹)'],
                  ['creditCardOutstanding', 'Credit Card Outstanding (₹)'],
                ] as [string, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input className={inputClass} type="number" value={(data.financial as any)[key]} onChange={e => updateFinancial(key, +e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">UPI Behaviour Analysis</h2>

                {/* Privacy consent banner */}
                <div className={`p-4 rounded-lg border ${data.upi.consentGiven ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">{data.upi.consentGiven ? '✅' : '🔒'}</span>
                    <div className="flex-1">
                      <h4 className="font-heading font-semibold text-sm text-foreground mb-1">
                        {data.upi.consentGiven ? 'Consent Granted — Account Aggregator Framework' : 'UPI Data Consent Required'}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        Per RBI Account Aggregator (AA) framework guidelines, explicit user consent is required before accessing UPI transaction data. 
                        Data is processed in encrypted form — <strong>raw UPI IDs are never stored</strong>. Only hashed identifiers and aggregated behavioral patterns are retained.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={`w-10 h-6 rounded-full transition-colors relative ${data.upi.consentGiven ? 'bg-success' : 'bg-muted'}`}
                          onClick={() => updateUPI('consentGiven', !data.upi.consentGiven)}
                        >
                          <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${data.upi.consentGiven ? 'left-5 bg-success-foreground' : 'left-1 bg-muted-foreground'}`} />
                        </div>
                        <span className="text-sm font-medium text-secondary-foreground">I consent to UPI transaction analysis under AA framework</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* UPI ID with masking */}
                <div>
                  <label className={labelClass}>UPI ID (auto-masked for privacy)</label>
                  <div className="relative">
                    <input
                      className={inputClass}
                      placeholder="yourname@upi"
                      value={data.upi.upiId || ''}
                      onChange={e => updateUPI('upiId', e.target.value)}
                      disabled={!data.upi.consentGiven}
                    />
                    {data.upi.upiId && (
                      <div className="mt-2 flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">Masked: <span className="font-mono text-primary">{maskUpiId(data.upi.upiId as string)}</span></span>
                        <span className="text-muted-foreground">Hash: <span className="font-mono text-primary">{hashUpiId(data.upi.upiId as string)}</span></span>
                      </div>
                    )}
                  </div>
                </div>

                {!data.upi.consentGiven && (
                  <div className="p-3 rounded-lg border border-border bg-muted/50 text-xs text-muted-foreground">
                    ⚠️ UPI analysis fields are disabled until consent is granted. Risk assessment will use limited data without UPI behavioral signals.
                  </div>
                )}

                <div className={`space-y-4 ${!data.upi.consentGiven ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Monthly Transactions</label>
                      <input className={inputClass} type="number" value={data.upi.monthlyTransactions} onChange={e => updateUPI('monthlyTransactions', +e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Avg Transaction (₹)</label>
                      <input className={inputClass} type="number" value={data.upi.avgTransactionAmount} onChange={e => updateUPI('avgTransactionAmount', +e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Late-Night Transactions (%)</label>
                    <input className={inputClass} type="number" value={data.upi.lateNightTransactions} onChange={e => updateUPI('lateNightTransactions', +e.target.value)} />
                  </div>
                  <div className="space-y-3 pt-2">
                    {([
                      ['gamblingAppUsage', 'Gambling / Betting App Usage Detected'],
                      ['cryptoTransactions', 'Cryptocurrency Transactions Detected'],
                      ['p2pLendingUsage', 'P2P Lending Platform Usage'],
                    ] as [string, string][]).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={`w-10 h-6 rounded-full transition-colors relative ${(data.upi as any)[key] ? 'bg-primary' : 'bg-muted'}`}
                          onClick={() => updateUPI(key, !(data.upi as any)[key])}
                        >
                          <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${(data.upi as any)[key] ? 'left-5 bg-primary-foreground' : 'left-1 bg-muted-foreground'}`} />
                        </div>
                        <span className="text-sm text-secondary-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data handling notice */}
                <div className="p-3 rounded-lg border border-border bg-card text-xs text-muted-foreground space-y-1.5">
                  <div className="font-heading font-semibold text-secondary-foreground">🔐 Data Privacy Notice</div>
                  <p>• UPI IDs are hashed using SHA-256 before storage — plaintext IDs are never persisted</p>
                  <p>• Transaction data is aggregated into behavioral patterns only</p>
                  <p>• Individual transaction details are not stored or visible to risk analysts</p>
                  <p>• Compliant with RBI Account Aggregator framework & DPDP Act 2023</p>
                  <p>• Consent can be revoked at any time — data will be purged within 48 hours</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Insurance & Protection</h2>
                <div className="space-y-3">
                  {([
                    ['hasLifeInsurance', 'Life Insurance'],
                    ['hasHealthInsurance', 'Health Insurance'],
                    ['hasLoanProtection', 'Loan Protection Insurance'],
                    ['hasGuarantor', 'Has Guarantor'],
                  ] as [string, string][]).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        className={`w-10 h-6 rounded-full transition-colors relative ${(data.insurance as any)[key] ? 'bg-primary' : 'bg-muted'}`}
                        onClick={() => updateInsurance(key, !(data.insurance as any)[key])}
                      >
                        <div className={`w-4 h-4 rounded-full absolute top-1 transition-all ${(data.insurance as any)[key] ? 'left-5 bg-primary-foreground' : 'left-1 bg-muted-foreground'}`} />
                      </div>
                      <span className="text-sm text-secondary-foreground">{label}</span>
                    </label>
                  ))}
                </div>
                {data.insurance.hasGuarantor && (
                  <div>
                    <label className={labelClass}>Guarantor Credit Score</label>
                    <input className={inputClass} type="number" min={300} max={900} value={data.insurance.guarantorCreditScore} onChange={e => updateInsurance('guarantorCreditScore', +e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-6 py-2.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground disabled:opacity-30 hover:bg-secondary transition-colors"
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-heading font-semibold shadow-glow hover:opacity-90 transition-opacity"
            >
              Analyze Risk →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;
