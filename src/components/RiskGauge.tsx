import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  size?: number;
}

const RiskGauge = ({ score, riskLevel, size = 240 }: RiskGaugeProps) => {
  const radius = (size - 30) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  const color = riskLevel === 'Low'
    ? 'hsl(152, 69%, 40%)'
    : riskLevel === 'Medium'
      ? 'hsl(38, 92%, 50%)'
      : 'hsl(0, 72%, 51%)';

  const glowColor = riskLevel === 'Low'
    ? 'rgba(34, 197, 94, 0.3)'
    : riskLevel === 'Medium'
      ? 'rgba(245, 158, 11, 0.3)'
      : 'rgba(239, 68, 68, 0.3)';

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background arc */}
        <path
          d={`M ${15} ${center} A ${radius} ${radius} 0 0 1 ${size - 15} ${center}`}
          fill="none"
          stroke="hsl(200, 15%, 16%)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M ${15} ${center} A ${radius} ${radius} 0 0 1 ${size - 15} ${center}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#glow)"
        />
        {/* Score text */}
        <motion.text
          x={center}
          y={center - 10}
          textAnchor="middle"
          fill={color}
          fontSize="48"
          fontFamily="Space Grotesk"
          fontWeight="700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.text>
        <text
          x={center}
          y={center + 18}
          textAnchor="middle"
          fill="hsl(200, 10%, 50%)"
          fontSize="13"
          fontFamily="DM Sans"
        >
          RISK SCORE
        </text>
      </svg>
      <motion.div
        className="px-5 py-2 rounded-full font-heading font-semibold text-sm tracking-wider"
        style={{
          backgroundColor: `${glowColor}`,
          color: color,
          border: `1px solid ${color}`,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {riskLevel.toUpperCase()} RISK
      </motion.div>
    </div>
  );
};

export default RiskGauge;
