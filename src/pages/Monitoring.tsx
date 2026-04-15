import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { mockBorrowers } from '@/lib/mockData';
import { loadCustomBorrowers, removeCustomBorrower } from '@/lib/storage';
import { computeRisk, simulateWhatIf, type RiskResult, type AssessmentInput } from '@/lib/riskEngine';
import RiskGauge from '@/components/RiskGauge';
import RiskBreakdown from '@/components/RiskBreakdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Monitoring = () => {
  const [borrowerResults, setBorrowerResults] = useState<{ id: string; input: AssessmentInput; result: RiskResult }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [whatIfIncome, setWhatIfIncome] = useState<number>(0);
  const [whatIfResult, setWhatIfResult] = useState<RiskResult | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const saved = loadCustomBorrowers();
    const combined = [...mockBorrowers, ...saved].map(b => ({
      id: b.id,
      input: b,
      result: computeRisk(b),
    }));
    setBorrowerResults(combined);
  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBorrowerResults(prev =>
        prev.map(b => ({
          ...b,
          result: {
            ...b.result,
            totalScore: Math.max(5, Math.min(95, b.result.totalScore + Math.round((Math.random() - 0.5) * 4))),
          },
        }))
      );
      setLastUpdate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedBorrower = borrowerResults.find(b => b.id === selected);
  const selectedInput = selectedBorrower?.input;

  const handleWhatIf = () => {
    if (!selectedInput || !whatIfIncome) return;
    const r = simulateWhatIf(selectedInput, { monthlyIncome: whatIfIncome });
    setWhatIfResult(r);
  };

  const handleDelete = (id: string) => {
    setBorrowerResults(prev => prev.filter(b => b.id !== id));
    removeCustomBorrower(id);
    if (selected === id) setSelected(null);
  };

  const riskColor = (level: string) =>
    level === 'Low' ? 'text-success' : level === 'Medium' ? 'text-warning' : 'text-destructive';

  const riskBg = (level: string) =>
    level === 'Low' ? 'bg-success/10 border-success/20' : level === 'Medium' ? 'bg-warning/10 border-warning/20' : 'bg-destructive/10 border-destructive/20';

  const highRiskCount = borrowerResults.filter(b => b.result.riskLevel === 'High').length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Dynamic Risk Monitoring</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time borrower risk surveillance</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live — Updated {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Total Borrowers</div>
            <div className="font-heading text-2xl font-bold text-foreground">{borrowerResults.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">High Risk</div>
            <div className="font-heading text-2xl font-bold text-destructive">{highRiskCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Avg Score</div>
            <div className="font-heading text-2xl font-bold text-primary">
              {borrowerResults.length ? Math.round(borrowerResults.reduce((s, b) => s + b.result.totalScore, 0) / borrowerResults.length) : 0}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Risk Engine</div>
            <div className="font-heading text-2xl font-bold text-success">Active</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Borrower list */}
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm mb-3">Borrower Portfolio</h2>
            {borrowerResults.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-lg border p-4 transition-all ${selected === b.id ? 'border-primary bg-primary/5 shadow-glow' : 'border-border bg-card hover:border-primary/30'}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => { setSelected(b.id); setWhatIfResult(null); setWhatIfIncome(0); }}
                    className="text-left flex-1"
                  >
                    <div className="font-heading font-semibold text-sm text-foreground">{b.input.personal.name}</div>
                    <div className="text-xs text-muted-foreground">{b.id} • {b.input.personal.city}</div>
                    <div className="text-xs text-muted-foreground mt-1">{b.input.personal.email}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-foreground">{b.input.personal.occupation}</div>
                  <div className="text-right">
                    <div className="font-heading font-bold text-lg text-foreground">{b.result.totalScore}</div>
                    <div className={`text-xs font-semibold ${riskColor(b.result.riskLevel)}`}>{b.result.riskLevel}</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: b.result.riskLevel === 'Low' ? 'hsl(152, 69%, 40%)' : b.result.riskLevel === 'Medium' ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)' }}
                    animate={{ width: `${b.result.totalScore}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selectedBorrower ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">{selectedBorrower.input.personal.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedBorrower.input.personal.occupation} • {selectedBorrower.input.personal.city}</p>
                    <p className="text-sm text-muted-foreground mt-2">{selectedBorrower.input.personal.email} • {selectedBorrower.input.personal.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedBorrower.input.personal.gender} • {selectedBorrower.input.personal.nationality}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedBorrower.id)}
                      className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Delete Borrower
                    </button>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold border ${riskBg(selectedBorrower.result.riskLevel)} ${riskColor(selectedBorrower.result.riskLevel)}`}>
                      {selectedBorrower.result.recommendation}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">PAN: {selectedBorrower.input.personal.panNumber} • PAN name: {selectedBorrower.input.personal.panName}</div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-lg border border-border bg-card p-6 shadow-card flex justify-center">
                    <RiskGauge score={selectedBorrower.result.totalScore} riskLevel={selectedBorrower.result.riskLevel} size={200} />
                  </div>

                  {/* What-If */}
                  <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                    <h3 className="font-heading font-semibold text-foreground mb-3">What-If Simulation</h3>
                    <p className="text-xs text-muted-foreground mb-4">Change income to see risk impact</p>
                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder="New monthly income (₹)"
                        className="w-full px-4 py-3 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        value={whatIfIncome || ''}
                        onChange={e => setWhatIfIncome(+e.target.value)}
                      />
                      <button onClick={handleWhatIf} className="w-full px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-glow hover:opacity-90 transition-opacity">
                        Simulate
                      </button>
                      {whatIfResult && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Original Score</span>
                            <span className="font-heading font-bold text-foreground">{selectedBorrower.result.totalScore}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Simulated Score</span>
                            <span className={`font-heading font-bold ${riskColor(whatIfResult.riskLevel)}`}>{whatIfResult.totalScore}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Change</span>
                            <span className={`font-heading font-bold ${whatIfResult.totalScore < selectedBorrower.result.totalScore ? 'text-success' : 'text-destructive'}`}>
                              {whatIfResult.totalScore - selectedBorrower.result.totalScore > 0 ? '+' : ''}{whatIfResult.totalScore - selectedBorrower.result.totalScore}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <RiskBreakdown factors={selectedBorrower.result.factors} insights={selectedBorrower.result.insights} />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-card">
                <p className="text-muted-foreground text-sm">Select a borrower to view detailed risk analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
