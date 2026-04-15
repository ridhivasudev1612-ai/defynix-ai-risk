import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: 'hsl(174, 72%, 46%)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-10 blur-[100px]" style={{ background: 'hsl(190, 80%, 42%)' }} />

        <div className="container mx-auto px-6 py-32 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary mb-8 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full gradient-primary animate-pulse-glow" />
              AI-Powered Default Risk Intelligence
            </div>

            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Beyond Credit Scores.{' '}
              <span className="text-gradient">Real Intelligence.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              DEFYNIX analyzes bank feeds, UPI behaviour, macroeconomic signals, and network risk to predict loan defaults before they happen.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link
                to="/assess"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg gradient-primary text-primary-foreground font-heading font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity"
              >
                Start Assessment →
              </Link>
              <Link
                to="/monitoring"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-border bg-card text-foreground font-heading font-semibold text-sm hover:bg-secondary transition-colors"
              >
                Live Monitoring
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {[
              { value: '5', label: 'Risk Layers' },
              { value: '< 2s', label: 'Assessment Time' },
              { value: '94%', label: 'Prediction Accuracy' },
              { value: 'Real-time', label: 'Monitoring' },
            ].map((stat, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 text-center shadow-card">
                <div className="font-heading text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Risk Layers */}
      <section className="container mx-auto px-6 py-24">
        <motion.h2
          className="font-heading text-3xl font-bold text-foreground text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Multi-Layer Risk Architecture
        </motion.h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Bank Feed Analysis', weight: '30%', desc: 'Salary credits, EMI debits, cash flow stability via Account Aggregator framework', icon: '🏦' },
            { title: 'UPI Behaviour', weight: '20%', desc: 'Gambling detection, crypto flags, late-night spending patterns', icon: '📱' },
            { title: 'Macro Signals', weight: '15%', desc: 'RBI indicators, NSE sector indices, inflation tracking', icon: '📈' },
            { title: 'Protection Score', weight: '15%', desc: 'Insurance coverage, guarantor strength, loan protection', icon: '🛡️' },
            { title: 'Network Risk', weight: '20%', desc: 'Peer comparison, default contagion, cohort analysis', icon: '🌐' },
          ].map((layer, i) => (
            <motion.div
              key={i}
              className="rounded-lg border border-border bg-card p-5 shadow-card hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-2xl mb-3">{layer.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-semibold text-sm text-foreground">{layer.title}</h3>
              </div>
              <span className="inline-block text-xs font-heading font-bold text-primary mb-2">{layer.weight}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{layer.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
