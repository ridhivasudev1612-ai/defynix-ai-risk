import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadCustomBorrowers, type StoredBorrower } from '@/lib/storage';
import { mockBorrowers } from '@/lib/mockData';
import { computeRisk } from '@/lib/riskEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface PeerProfile {
  id: string;
  name: string;
  city: string;
  occupation: string;
  income: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  emiBurden: number;
  savingsRatio: number;
  protectionScore: number;
  upiRisk: number;
  cohort: string;
}

const cohorts = [
  { name: 'IT Professionals (25-40, Metro)', avgScore: 32, defaultRate: 4.2, count: 1240 },
  { name: 'Marketing/Sales (25-35, Metro)', avgScore: 48, defaultRate: 8.7, count: 890 },
  { name: 'Business Owners (35-50, Tier 1)', avgScore: 35, defaultRate: 5.1, count: 650 },
  { name: 'Freelancers (22-30, All Cities)', avgScore: 62, defaultRate: 14.3, count: 420 },
  { name: 'Govt Employees (30-45, All Cities)', avgScore: 24, defaultRate: 2.8, count: 1580 },
];

const PeerComparison = () => {
  const [borrowerResults, setBorrowerResults] = useState<PeerProfile[]>([]);

  useEffect(() => {
    const customBorrowers = loadCustomBorrowers();
    const combined = [...mockBorrowers, ...customBorrowers].map(b => {
      const result = computeRisk(b as any);
      const emiBurden = Math.round((b.financial.existingEMIs / b.financial.monthlyIncome) * 100);
      const savingsRatio = Math.round((b.financial.savingsBalance / (b.financial.monthlyIncome * 6)) * 100);
      return {
        id: b.id,
        name: b.personal.name,
        city: b.personal.city,
        occupation: b.personal.occupation,
        income: b.financial.monthlyIncome,
        riskScore: result.totalScore,
        riskLevel: result.riskLevel,
        emiBurden,
        savingsRatio: Math.min(savingsRatio, 100),
        protectionScore: Math.round(100 - result.factors.filter(f => f.category === 'Protection').reduce((s, f) => s + f.score, 0) / Math.max(result.factors.filter(f => f.category === 'Protection').length, 1)),
        upiRisk: Math.round(result.factors.filter(f => f.category === 'UPI Behaviour').reduce((s, f) => s + f.score, 0) / Math.max(result.factors.filter(f => f.category === 'UPI Behaviour').length, 1)),
        cohort: b.personal.occupation.includes('Engineer') ? cohorts[0].name
          : b.personal.occupation.includes('Marketing') ? cohorts[1].name
          : b.personal.occupation.includes('Business') ? cohorts[2].name
          : b.personal.occupation.includes('Freelance') ? cohorts[3].name
          : cohorts[4].name,
      } as PeerProfile;
    });
    setBorrowerResults(combined);
    if (combined.length > 0) {
      setSelected(combined[0]);
    }
  }, []);

  const [selected, setSelected] = useState<PeerProfile | null>(null);

  const selectedCohort = selected ? cohorts.find(c => c.name === selected.cohort) || cohorts[0] : cohorts[0];

  if (!selected) return null;

  const riskColor = (level: string) =>
    level === 'Low' ? 'text-success' : level === 'Medium' ? 'text-warning' : 'text-destructive';
  const riskBg = (level: string) =>
    level === 'Low' ? 'border-success/30 bg-success/10' : level === 'Medium' ? 'border-warning/30 bg-warning/10' : 'border-destructive/30 bg-destructive/10';

  const radarData = selected ? [
    { metric: 'EMI Burden', borrower: selected.emiBurden, cohortAvg: Math.round(selectedCohort.avgScore * 0.8) },
    { metric: 'Savings', borrower: selected.savingsRatio, cohortAvg: 55 },
    { metric: 'Protection', borrower: selected.protectionScore, cohortAvg: 50 },
    { metric: 'UPI Risk', borrower: selected.upiRisk, cohortAvg: 25 },
    { metric: 'Overall Risk', borrower: selected.riskScore, cohortAvg: selectedCohort.avgScore },
  ] : [];

  const comparisonData = borrowerResults.map(b => ({
    name: b.name.split(' ')[0],
    score: b.riskScore,
    cohortAvg: cohorts.find(c => c.name === b.cohort)?.avgScore || 40,
  }));

  const percentile = selected ? Math.round(
    (borrowerResults.filter(b => b.riskScore > selected.riskScore).length / borrowerResults.length) * 100
  ) : 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Peer Comparison Intelligence</h1>
          <p className="text-muted-foreground text-sm mt-1">Compare borrower risk profiles against cohort benchmarks</p>
        </div>

        {/* Cohort overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {cohorts.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg border p-3 shadow-card ${selected && selected.cohort === c.name ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="text-xs text-muted-foreground mb-1 truncate">{c.name.split('(')[0].trim()}</div>
              <div className="font-heading text-lg font-bold text-foreground">{c.avgScore}</div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">{c.count} borrowers</span>
                <span className={c.defaultRate > 10 ? 'text-destructive' : c.defaultRate > 5 ? 'text-warning' : 'text-success'}>{c.defaultRate}% default</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Borrower selector */}
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm mb-3">Select Borrower</h2>
            {borrowerResults.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(b)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selected.id === b.id ? 'border-primary shadow-glow bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading font-semibold text-sm text-foreground">{b.name}</span>
                  <span className={`text-xs font-heading font-bold ${riskColor(b.riskLevel)}`}>{b.riskScore}</span>
                </div>
                <div className="text-xs text-muted-foreground">{b.occupation} • {b.city}</div>
                <div className="text-xs text-muted-foreground mt-1">Cohort: {b.cohort.split('(')[0].trim()}</div>
              </motion.div>
            ))}
          </div>

          {/* Comparison panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Percentile & summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-card p-5 shadow-card text-center">
                <div className="text-xs text-muted-foreground mb-1">Percentile Rank</div>
                <div className="font-heading text-3xl font-bold text-primary">{percentile}th</div>
                <div className="text-xs text-muted-foreground mt-1">Better than {percentile}% of peers</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-card text-center">
                <div className="text-xs text-muted-foreground mb-1">vs Cohort Average</div>
                <div className={`font-heading text-3xl font-bold ${selected.riskScore > selectedCohort.avgScore ? 'text-destructive' : 'text-success'}`}>
                  {selected.riskScore > selectedCohort.avgScore ? '+' : ''}{selected.riskScore - selectedCohort.avgScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selected.riskScore > selectedCohort.avgScore ? 'Above avg risk' : 'Below avg risk'}
                </div>
              </div>
              <div className={`rounded-lg border p-5 shadow-card text-center ${riskBg(selected.riskLevel)}`}>
                <div className="text-xs text-muted-foreground mb-1">Cohort Default Rate</div>
                <div className={`font-heading text-3xl font-bold ${selectedCohort.defaultRate > 10 ? 'text-destructive' : selectedCohort.defaultRate > 5 ? 'text-warning' : 'text-success'}`}>
                  {selectedCohort.defaultRate}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">{selectedCohort.count} similar profiles</div>
              </div>
            </div>

            {/* Radar chart */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-4">Risk Profile vs Cohort Average</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(200, 15%, 16%)" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(200, 10%, 50%)" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(200, 15%, 16%)" fontSize={10} />
                  <Radar name={selected.name} dataKey="borrower" stroke="hsl(174, 72%, 46%)" fill="hsl(174, 72%, 46%)" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Cohort Avg" dataKey="cohortAvg" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(200, 10%, 50%)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar comparison */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-4">All Borrowers vs Cohort Benchmarks</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 16%)" />
                  <XAxis dataKey="name" stroke="hsl(200, 10%, 50%)" fontSize={12} />
                  <YAxis stroke="hsl(200, 10%, 50%)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(200, 18%, 8%)', border: '1px solid hsl(200, 15%, 16%)', borderRadius: '8px', color: 'hsl(180, 10%, 92%)' }} />
                  <Bar dataKey="score" name="Borrower Score" fill="hsl(174, 72%, 46%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cohortAvg" name="Cohort Avg" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Peer insights */}
            <div className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading font-semibold text-foreground mb-3">⚡ Peer Intelligence Insights</h3>
              <div className="space-y-2.5">
                {[
                  selected.riskScore > selectedCohort.avgScore
                    ? `${selected.name} scores ${selected.riskScore - selectedCohort.avgScore} points above cohort average — higher risk than ${100 - percentile}% of similar ${selected.occupation.toLowerCase()}s.`
                    : `${selected.name} scores ${selectedCohort.avgScore - selected.riskScore} points below cohort average — lower risk than ${percentile}% of similar profiles.`,
                  `Cohort "${selectedCohort.name.split('(')[0].trim()}" has ${selectedCohort.defaultRate}% historical default rate across ${selectedCohort.count} borrowers.`,
                  selected.emiBurden > 30
                    ? `EMI burden (${selected.emiBurden}%) exceeds the recommended 30% threshold for this income bracket.`
                    : `EMI burden (${selected.emiBurden}%) is within healthy range for this cohort.`,
                  selected.protectionScore < 40
                    ? `Protection score (${selected.protectionScore}%) is significantly below peer median — insurance gap creates unhedged exposure.`
                    : `Protection coverage is in line with or above peer benchmarks.`,
                ].map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-2.5 items-start text-xs"
                  >
                    <span className="text-primary mt-0.5 shrink-0">⚡</span>
                    <span className="text-secondary-foreground leading-relaxed">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerComparison;
