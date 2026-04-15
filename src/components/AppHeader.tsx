import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/assess', label: 'Assessment' },
  { path: '/monitoring', label: 'Monitoring' },
  { path: '/guarantor-chain', label: 'Guarantor Chain' },
  { path: '/peer-comparison', label: 'Peer Intel' },
];

interface AppHeaderProps {
  onOpenAlerts?: () => void;
}

const AppHeader = ({ onOpenAlerts }: AppHeaderProps) => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">D</span>
          </div>
          <span className="font-heading font-bold text-lg text-foreground tracking-tight">DEFYNIX</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-2.5 py-2 text-xs font-medium transition-colors"
              >
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-secondary"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className={`relative z-10 ${location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Alerts button */}
          <button
            onClick={onOpenAlerts}
            className="relative ml-2 w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shrink-0"
          >
            🔔
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-destructive flex items-center justify-center">
              <span className="text-[8px] font-bold text-destructive-foreground">3</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
