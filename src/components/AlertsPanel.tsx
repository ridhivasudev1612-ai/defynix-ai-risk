import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadCustomBorrowers } from '@/lib/storage';

export interface RiskAlert {
  id: string;
  borrowerId: string;
  borrowerName: string;
  channel: 'whatsapp' | 'sms' | 'email';
  type: 'threshold_breach' | 'score_change' | 'behavioral_flag' | 'protection_gap';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  read: boolean;
  sentTo?: string;
}

const mockAlerts: RiskAlert[] = [
  {
    id: 'ALT-001', borrowerId: 'BRW-002', borrowerName: 'Priya Sharma',
    channel: 'whatsapp', type: 'threshold_breach', severity: 'critical',
    message: '🚨 Risk score crossed 70 threshold. EMI burden at 37% of income with gambling app activity detected. Immediate review recommended.',
    timestamp: new Date(Date.now() - 120000), read: false,
  },
  {
    id: 'ALT-002', borrowerId: 'BRW-004', borrowerName: 'Sneha Reddy',
    channel: 'sms', type: 'protection_gap', severity: 'critical',
    message: 'DEFYNIX ALERT: Sneha Reddy (BRW-004) has ZERO insurance coverage. No life, health, or loan protection insurance. Risk exposure: HIGH.',
    timestamp: new Date(Date.now() - 300000), read: false,
  },
  {
    id: 'ALT-003', borrowerId: 'BRW-001', borrowerName: 'Arjun Mehta',
    channel: 'email', type: 'score_change', severity: 'info',
    message: '✉️ Email sent to arjun.mehta@example.com with the latest risk summary and recommended next steps.',
    timestamp: new Date(Date.now() - 600000), read: true,
    sentTo: 'arjun.mehta@example.com',
  },
  {
    id: 'ALT-004', borrowerId: 'BRW-002', borrowerName: 'Priya Sharma',
    channel: 'whatsapp', type: 'behavioral_flag', severity: 'warning',
    message: '⚠️ Behavioral anomaly: 28% of UPI transactions between 11PM-5AM. P2P lending platform usage detected. Pattern consistent with financial stress.',
    timestamp: new Date(Date.now() - 900000), read: true,
  },
  {
    id: 'ALT-005', borrowerId: 'BRW-003', borrowerName: 'Vikram Patel',
    channel: 'sms', type: 'score_change', severity: 'info',
    message: 'DEFYNIX: Vikram Patel risk stable at LOW. Strong protection score with guarantor (780). Next review in 30 days.',
    timestamp: new Date(Date.now() - 1800000), read: true,
  },
  {
    id: 'ALT-006', borrowerId: 'BRW-004', borrowerName: 'Sneha Reddy',
    channel: 'email', type: 'behavioral_flag', severity: 'critical',
    message: '✉️ Email sent to sneha.reddy@example.com: crypto transactions + late-night spending flagged. Escalate to credit committee.',
    timestamp: new Date(Date.now() - 2400000), read: false,
    sentTo: 'sneha.reddy@example.com',
  },
];

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlertsPanel = ({ isOpen, onClose }: AlertsPanelProps) => {
  const [alerts, setAlerts] = useState<RiskAlert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'sms' | 'email'>('all');
  const [newAlert, setNewAlert] = useState<RiskAlert | null>(null);

  // Add alerts for verified custom borrowers when the panel opens
  useEffect(() => {
    if (!isOpen) return;
    const saved = loadCustomBorrowers();
    if (!saved.length) return;

    const customAlerts = saved.flatMap(latest => {
      const alerts: RiskAlert[] = [];
      if (latest.personal.emailVerified) {
        alerts.push({
          id: `ALT-CUST-EMAIL-${latest.id}`,
          borrowerId: latest.id,
          borrowerName: latest.personal.name,
          channel: 'email',
          type: 'score_change',
          severity: 'info',
          message: `✉️ Risk alert delivered to ${latest.personal.email} for ${latest.personal.name}.`,
          timestamp: new Date(),
          read: false,
          sentTo: latest.personal.email,
        });
      }
      if (latest.personal.phoneVerified) {
        alerts.push({
          id: `ALT-CUST-SMS-${latest.id}`,
          borrowerId: latest.id,
          borrowerName: latest.personal.name,
          channel: 'sms',
          type: 'threshold_breach',
          severity: 'warning',
          message: `📱 SMS sent to ${latest.personal.phone} for ${latest.personal.name}: urgent risk update from DEFYNIX.`,
          timestamp: new Date(),
          read: false,
        });
      }
      if (latest.personal.whatsappLinked) {
        alerts.push({
          id: `ALT-CUST-WHATSAPP-${latest.id}`,
          borrowerId: latest.id,
          borrowerName: latest.personal.name,
          channel: 'whatsapp',
          type: 'behavioral_flag',
          severity: 'critical',
          message: `💬 WhatsApp message delivered to ${latest.personal.phone} for ${latest.personal.name}: risky UPI behaviour detected.`,
          timestamp: new Date(),
          read: false,
        });
      }
      return alerts;
    });

    setAlerts(prev => [...customAlerts, ...prev.filter(alert => !alert.id.startsWith('ALT-CUST-'))]);
  }, [isOpen]);

  // Simulate incoming alerts
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const incoming: RiskAlert = {
        id: `ALT-${Date.now()}`,
        borrowerId: 'BRW-002',
        borrowerName: 'Priya Sharma',
        channel: Math.random() > 0.5 ? 'whatsapp' : 'sms',
        type: 'score_change',
        severity: 'warning',
        message: `⚠️ Live update: Risk score fluctuation detected for Priya Sharma. Current score: ${65 + Math.round(Math.random() * 10)}. Monitoring active.`,
        timestamp: new Date(),
        read: false,
      };
      setNewAlert(incoming);
      setAlerts(prev => [incoming, ...prev]);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const filtered = alerts.filter(a => filter === 'all' || a.channel === filter);
  const unreadCount = alerts.filter(a => !a.read).length;

  const markRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const severityColor = (s: string) =>
    s === 'critical' ? 'text-destructive' : s === 'warning' ? 'text-warning' : 'text-primary';
  const severityBg = (s: string) =>
    s === 'critical' ? 'bg-destructive/10 border-destructive/20' : s === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-primary/10 border-primary/20';

  const timeAgo = (d: Date) => {
    const mins = Math.round((Date.now() - d.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 border-l border-border bg-background overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Risk Alerts</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread alerts</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  ✕
                </button>
              </div>

              {/* New alert notification */}
              <AnimatePresence>
                {newAlert && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-4 p-3 rounded-lg border border-primary/30 bg-primary/5"
                  >
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      New alert received just now
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Channel filter */}
              <div className="flex gap-2 mb-5">
                {(['all', 'whatsapp', 'sms', 'email'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setFilter(ch)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === ch ? 'gradient-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border hover:text-foreground'}`}
                  >
                    {ch === 'whatsapp' ? '💬 WhatsApp' : ch === 'sms' ? '📱 SMS' : ch === 'email' ? '✉️ Email' : 'All'}
                  </button>
                ))}
              </div>

              {/* Alert list */}
              <div className="space-y-3">
                {filtered.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => markRead(alert.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${!alert.read ? severityBg(alert.severity) : 'bg-card border-border hover:border-primary/20'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{alert.channel === 'whatsapp' ? '💬' : alert.channel === 'sms' ? '📱' : '✉️'}</span>
                        <span className={`text-xs font-heading font-bold uppercase ${severityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{timeAgo(alert.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs font-medium text-foreground">{alert.borrowerName}</span>
                      <span className="text-xs text-muted-foreground">({alert.borrowerId})</span>
                    </div>
                    <p className="text-xs text-secondary-foreground leading-relaxed">{alert.message}</p>

                    {/* Simulated delivery status */}
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      {alert.channel === 'whatsapp' ? (
                        <span className="text-primary">✓✓ Delivered via WhatsApp Business API</span>
                      ) : alert.channel === 'sms' ? (
                        <span className="text-primary">✓ Sent via SMS Gateway</span>
                      ) : (
                        <span className="text-primary">✓ Sent via Email to {alert.sentTo ?? 'recipient'}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Privacy notice */}
              <div className="mt-6 p-3 rounded-lg border border-border bg-muted/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  🔒 Alerts sent via encrypted channels. WhatsApp messages use end-to-end encryption via Business API. 
                  SMS alerts contain masked identifiers only. Compliant with RBI data privacy guidelines.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertsPanel;
