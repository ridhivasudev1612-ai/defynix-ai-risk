import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/assess', label: 'Risk Assessment' },
  { path: '/monitoring', label: 'Monitoring' },
  { path: '/guarantor-chain', label: 'Guarantor Chain' },
];

const AppHeader = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">D</span>
          </div>
          <span className="font-heading font-bold text-lg text-foreground tracking-tight">DEFYNIX</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className="relative px-4 py-2 text-sm font-medium transition-colors"
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
      </div>
    </header>
  );
};

export default AppHeader;
