import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultAssessmentInput } from '@/lib/mockData';
import { addCustomBorrower } from '@/lib/storage';
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

  const OTP_API_URL = import.meta.env.VITE_OTP_API_URL ?? '';
  const isOtpBackendConfigured = Boolean(OTP_API_URL);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [enteredEmailOtp, setEnteredEmailOtp] = useState('');
  const [enteredPhoneOtp, setEnteredPhoneOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const calculateAgeFromDob = (dob: string) => {
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getUTCFullYear() - birth.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())) {
      age -= 1;
    }
    return Math.max(age, 0);
  };

  const updatePersonal = (key: string, value: string | number | boolean) =>
    setData(d => ({
      ...d,
      personal: {
        ...d.personal,
        [key]: value,
        ...(key === 'email' ? { emailVerified: false } : {}),
        ...(key === 'phone' ? { phoneVerified: false } : {}),
      },
    }));
  const updateFinancial = (key: string, value: number) =>
    setData(d => ({ ...d, financial: { ...d.financial, [key]: value } }));
  const updateUPI = (key: string, value: number | boolean | string) =>
    setData(d => ({ ...d, upi: { ...d.upi, [key]: value } }));
  const updateInsurance = (key: string, value: boolean | number) =>
    setData(d => ({ ...d, insurance: { ...d.insurance, [key]: value } }));

  const handleDobChange = (value: string) => {
    const newAge = calculateAgeFromDob(value);
    setData(d => ({ ...d, personal: { ...d.personal, dob: value, age: newAge } }));
  };

  const otpChannelLabel = (channel: 'email' | 'phone') => channel === 'email' ? 'Email' : 'Phone';

  const validateOtpContact = (channel: 'email' | 'phone') => {
    if (channel === 'email') {
      if (!data.personal.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
        return 'Enter a valid email to send OTP.';
      }
    } else {
      if (!data.personal.phone.trim() || data.personal.phone.trim().length < 10) {
        return 'Enter a valid phone number to send OTP.';
      }
    }
    return null;
  };

  const sendOtp = async (channel: 'email' | 'phone') => {
    const validation = validateOtpContact(channel);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setIsSendingOtp(true);
    setValidationError(null);
    setOtpRequestId(null);

    const value = channel === 'email' ? data.personal.email : data.personal.phone;
    const label = otpChannelLabel(channel);

    if (OTP_API_URL) {
      try {
        const response = await fetch(`${OTP_API_URL}/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, value, whatsappLinked: data.personal.whatsappLinked }),
        });

        if (!response.ok) {
          throw new Error(await response.text() || 'OTP service responded with an error.');
        }

        const result = await response.json();
        setOtpRequestId(result.requestId || null);
        setOtpMessage(`${label} OTP sent to ${value}. Check your inbox/messages.`);
      } catch (error) {
        console.error(error);
        const code = String(Math.floor(1000 + Math.random() * 9000));
        if (channel === 'email') {
          setEmailOtpCode(code);
        } else {
          setPhoneOtpCode(code);
        }
        setOtpMessage(`Unable to reach OTP service, generated fallback ${label} OTP locally.`);
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    const fallbackCode = String(Math.floor(1000 + Math.random() * 9000));
    if (channel === 'email') {
      setEmailOtpCode(fallbackCode);
    } else {
      setPhoneOtpCode(fallbackCode);
    }
    setOtpMessage(`Simulated ${label} OTP generated. Use the code shown below or configure VITE_OTP_API_URL for a real backend provider.`);
    setIsSendingOtp(false);
  };

  const verifyOtp = async (channel: 'email' | 'phone') => {
    const enteredCode = channel === 'email' ? enteredEmailOtp.trim() : enteredPhoneOtp.trim();
    if (!enteredCode) {
      setValidationError(`Enter the ${channel} OTP to verify.`);
      return;
    }

    setIsSendingOtp(true);
    setValidationError(null);

    if (OTP_API_URL && otpRequestId) {
      try {
        const response = await fetch(`${OTP_API_URL}/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: otpRequestId, channel, value: channel === 'email' ? data.personal.email : data.personal.phone, code: enteredCode }),
        });

        if (!response.ok) {
          throw new Error(await response.text() || 'OTP verification failed.');
        }

        const result = await response.json();
        if (!result.verified) {
          throw new Error(result.message || 'Invalid OTP entered.');
        }

        updatePersonal(channel === 'email' ? 'emailVerified' : 'phoneVerified', true);
        setOtpMessage(`${otpChannelLabel(channel)} verified successfully.`);
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : 'OTP verification failed.');
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    const expectedCode = channel === 'email' ? emailOtpCode : phoneOtpCode;
    if (!expectedCode) {
      setValidationError(`Please send the ${channel} OTP first.`);
      setIsSendingOtp(false);
      return;
    }
    if (enteredCode !== expectedCode) {
      setValidationError(`Incorrect ${channel} OTP.`);
      setIsSendingOtp(false);
      return;
    }

    updatePersonal(channel === 'email' ? 'emailVerified' : 'phoneVerified', true);
    setOtpMessage(`${otpChannelLabel(channel)} verified successfully.`);
    setIsSendingOtp(false);
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      if (!data.personal.name.trim()) return 'Full name is required.';
      if (!data.personal.dob.trim()) return 'Date of birth is required.';
      if (!data.personal.phone.trim()) return 'Phone number is required.';
      if (!data.personal.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) return 'Valid email is required.';
      if (!data.personal.gender.trim()) return 'Gender is required.';
      if (!data.personal.nationality.trim()) return 'Nationality is required.';
      if (!data.personal.panNumber.trim()) return 'PAN number is required.';
      if (!data.personal.panName.trim()) return 'PAN card name is required.';
      if (data.personal.name.trim().toLowerCase() !== data.personal.panName.trim().toLowerCase()) {
        return 'Full name does not match the name on the PAN card.';
      }
      if (!data.personal.age || data.personal.age <= 0) return 'Valid calculated age is required.';
      if (!data.personal.occupation.trim()) return 'Occupation is required.';
      if (!data.personal.city.trim()) return 'City is required.';
      if (!data.personal.emailVerified || !data.personal.phoneVerified) return 'Verify your email and phone via OTP before continuing.';
      return null;
    }

    if (currentStep === 1) {
      if (data.financial.monthlyIncome <= 0) return 'Monthly income is required.';
      if (data.financial.monthlyExpenses < 0) return 'Monthly expenses must be zero or more.';
      if (data.financial.existingEMIs < 0) return 'Existing EMIs must be zero or more.';
      if (data.financial.loanAmount <= 0) return 'Loan amount is required.';
      if (data.financial.loanTenure <= 0) return 'Loan tenure is required.';
      return null;
    }

    if (currentStep === 2) {
      if (!data.upi.consentGiven) return 'Please grant UPI consent to continue.';
      if (!data.upi.upiId?.trim()) return 'UPI ID is required.';
      if (data.upi.monthlyTransactions <= 0) return 'Monthly transactions are required.';
      if (data.upi.avgTransactionAmount <= 0) return 'Average transaction amount is required.';
      if (data.upi.lateNightTransactions < 0) return 'Late-night transaction percentage must be zero or more.';
      return null;
    }

    if (currentStep === 3) {
      if (data.insurance.hasGuarantor && data.insurance.guarantorCreditScore <= 0) return 'Guarantor credit score is required when a guarantor is provided.';
      return null;
    }

    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStep(s => Math.min(s + 1, steps.length - 1));
  };

  const handleSubmit = () => {
    const error = validateStep(step);
    if (error) {
      setValidationError(error);
      return;
    }

    const r = computeRisk(data);
    setResult(r);
    setValidationError(null);

    addCustomBorrower({ id: `BRW-${Date.now()}`, ...data });
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input className={inputClass} type="date" value={data.personal.dob} onChange={e => handleDobChange(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input className={inputClass} placeholder="e.g. +91 98765 43210" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email ID</label>
                    <input className={inputClass} type="email" placeholder="Enter email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select className={inputClass} value={data.personal.gender} onChange={e => updatePersonal('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Nationality</label>
                    <select className={inputClass} value={data.personal.nationality} onChange={e => updatePersonal('nationality', e.target.value)}>
                      <option value="">Select nationality</option>
                      <option value="Indian">Indian</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Canadian">Canadian</option>
                      <option value="Australian">Australian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>PAN Number</label>
                    <input className={inputClass} placeholder="PAN number" value={data.personal.panNumber} onChange={e => updatePersonal('panNumber', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>PAN Card Name</label>
                  <input className={inputClass} placeholder="Name on PAN card" value={data.personal.panName} onChange={e => updatePersonal('panName', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Age (auto-calculated)</label>
                    <input className={inputClass} type="number" value={data.personal.age} readOnly />
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

                <div className="rounded-lg border border-border bg-muted p-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelClass}>Email Verification</label>
                      <button onClick={() => sendOtp('email')} disabled={isSendingOtp} className="text-xs text-primary hover:underline disabled:opacity-40">Send OTP</button>
                    </div>
                    <input className={inputClass} type="text" placeholder="Enter email OTP" value={enteredEmailOtp} onChange={e => setEnteredEmailOtp(e.target.value)} />
                    <button onClick={() => verifyOtp('email')} disabled={isSendingOtp} className="mt-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-40">Verify</button>
                    {!isOtpBackendConfigured && emailOtpCode && !data.personal.emailVerified && <p className="text-xs text-muted-foreground mt-2">Simulated OTP: {emailOtpCode}</p>}
                    {data.personal.emailVerified && <p className="text-xs text-success mt-2">Email verified</p>}
                  </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelClass}>Phone Verification</label>
                        <button onClick={() => sendOtp('phone')} disabled={isSendingOtp} className="text-xs text-primary hover:underline disabled:opacity-40">Send OTP</button>
                      </div>
                      <input className={inputClass} type="text" placeholder="Enter phone OTP" value={enteredPhoneOtp} onChange={e => setEnteredPhoneOtp(e.target.value)} />
                      <button onClick={() => verifyOtp('phone')} disabled={isSendingOtp} className="mt-2 w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-40">Verify</button>
                      {!isOtpBackendConfigured && phoneOtpCode && !data.personal.phoneVerified && <p className="text-xs text-muted-foreground mt-2">Simulated OTP: {phoneOtpCode}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>WhatsApp Linked</label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={data.personal.whatsappLinked} onChange={e => updatePersonal('whatsappLinked', e.target.checked)} className="h-4 w-4" />
                        <span className="text-sm text-secondary-foreground">This phone number is linked to WhatsApp</span>
                      </label>
                    </div>
                  </div>
                  {otpMessage && <p className="text-xs text-muted-foreground mt-3">{otpMessage}</p>}
                  {!isOtpBackendConfigured && (
                    <p className="text-xs text-muted-foreground mt-2">Real OTP delivery is not configured. Use VITE_OTP_API_URL with a backend provider to enable email/SMS OTP sending.</p>
                  )}
                </div>

                {data.personal.name.trim() && data.personal.panName.trim() && data.personal.name.trim().toLowerCase() !== data.personal.panName.trim().toLowerCase() && (
                  <div className="text-sm text-destructive">Warning: entered name does not match name on PAN card.</div>
                )}
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

        {validationError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {validationError}
          </div>
        )}

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
              onClick={handleNext}
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
