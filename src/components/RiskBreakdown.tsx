import { motion } from 'framer-motion';
import type { RiskFactor } from '@/lib/riskEngine';

interface RiskBreakdownProps {
  factors: RiskFactor[];
  insights: string[];
}

const categoryColors: Record<string, string> = {
  'Bank Feed': 'hsl(174, 72%, 46%)',
  'UPI Behaviour': 'hsl(262, 70%, 60%)',
  'Macroeconomic': 'hsl(38, 92%, 50%)',
  'Protection': 'hsl(152, 69%, 40%)',
  'Network Risk': 'hsl(0, 72%, 51%)',
};

const RiskBreakdown = ({ factors, insights }: RiskBreakdownProps) => {
  return (
    <div className="space-y-6">
      {/* Explainable AI Insights */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full gradient-primary inline-block" />
          Explainable AI Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex gap-3 items-start text-sm"
            >
              <span className="text-primary mt-0.5 shrink-0">⚡</span>
              <span className="text-secondary-foreground">{insight}</span>
            </motion.div>
          ))}
          {insights.length === 0 && (
            <p className="text-muted-foreground text-sm">All risk factors within acceptable ranges.</p>
          )}
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-heading font-semibold text-foreground mb-4">Risk Factor Breakdown</h3>
        <div className="space-y-4">
          {factors.map((factor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: categoryColors[factor.category] || 'hsl(174, 72%, 46%)' }}
                  />
                  <span className="text-sm font-medium text-foreground">{factor.name}</span>
                </div>
                <span className="text-xs font-heading text-muted-foreground">{factor.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: categoryColors[factor.category] || 'hsl(174, 72%, 46%)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RiskBreakdown;
