import { useState } from 'react';
import { motion } from 'framer-motion';

interface GuarantorNode {
  id: string;
  name: string;
  type: 'borrower' | 'guarantor';
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  creditScore: number;
  city: string;
  linkedTo: string[];
  guarantorFor?: string[];
  chainRisk: number; // accumulated risk from chain
}

const mockNetwork: GuarantorNode[] = [
  { id: 'BRW-002', name: 'Priya Sharma', type: 'borrower', riskScore: 72, riskLevel: 'High', creditScore: 580, city: 'Mumbai', linkedTo: ['GRT-001'], chainRisk: 72 },
  { id: 'GRT-001', name: 'Ramesh Sharma', type: 'guarantor', riskScore: 35, riskLevel: 'Low', creditScore: 620, city: 'Mumbai', linkedTo: ['BRW-002'], guarantorFor: ['BRW-002'], chainRisk: 48 },
  { id: 'BRW-003', name: 'Vikram Patel', type: 'borrower', riskScore: 28, riskLevel: 'Low', creditScore: 760, city: 'Ahmedabad', linkedTo: ['GRT-002'], chainRisk: 28 },
  { id: 'GRT-002', name: 'Anand Patel', type: 'guarantor', riskScore: 15, riskLevel: 'Low', creditScore: 780, city: 'Ahmedabad', linkedTo: ['BRW-003', 'BRW-006'], guarantorFor: ['BRW-003', 'BRW-006'], chainRisk: 22 },
  { id: 'BRW-005', name: 'Rajesh Kumar', type: 'borrower', riskScore: 22, riskLevel: 'Low', creditScore: 720, city: 'Delhi', linkedTo: ['GRT-003'], chainRisk: 22 },
  { id: 'GRT-003', name: 'Sunil Kumar', type: 'guarantor', riskScore: 20, riskLevel: 'Low', creditScore: 750, city: 'Delhi', linkedTo: ['BRW-005'], guarantorFor: ['BRW-005'], chainRisk: 21 },
  { id: 'BRW-006', name: 'Meera Nair', type: 'borrower', riskScore: 58, riskLevel: 'Medium', creditScore: 640, city: 'Chennai', linkedTo: ['GRT-002', 'GRT-004'], chainRisk: 52 },
  { id: 'GRT-004', name: 'Deepak Nair', type: 'guarantor', riskScore: 42, riskLevel: 'Medium', creditScore: 650, city: 'Chennai', linkedTo: ['BRW-006'], guarantorFor: ['BRW-006'], chainRisk: 50 },
];

const chainAnalysis = [
  {
    chainId: 'CHAIN-001',
    title: 'Sharma Guarantee Chain',
    risk: 'High',
    description: 'Priya Sharma (High Risk, score 72) is solely guaranteed by Ramesh Sharma (credit score 620). Single-point failure — if Priya defaults, guarantor exposure is ₹18L with moderate credit standing.',
    contagion: 65,
    nodes: ['BRW-002', 'GRT-001'],
  },
  {
    chainId: 'CHAIN-002',
    title: 'Patel Multi-Guarantee Chain',
    risk: 'Medium',
    description: 'Anand Patel (credit score 780) guarantees both Vikram Patel and Meera Nair. Total exposure: ₹58L. If Meera defaults (Medium Risk), Anand\'s capacity to cover Vikram\'s loan may be impacted.',
    contagion: 38,
    nodes: ['BRW-003', 'GRT-002', 'BRW-006'],
  },
  {
    chainId: 'CHAIN-003',
    title: 'Kumar Isolated Chain',
    risk: 'Low',
    description: 'Rajesh Kumar (Low Risk) with strong guarantor Sunil Kumar (credit score 750). Isolated chain with no cross-dependencies. Minimal contagion risk.',
    contagion: 12,
    nodes: ['BRW-005', 'GRT-003'],
  },
  {
    chainId: 'CHAIN-004',
    title: 'Nair Dual-Guarantee Chain',
    risk: 'Medium',
    description: 'Meera Nair has dual guarantors: Anand Patel (shared with Vikram) and Deepak Nair (Medium Risk, credit 650). Overlapping guarantee creates contagion pathway between Patel and Nair families.',
    contagion: 45,
    nodes: ['BRW-006', 'GRT-002', 'GRT-004'],
  },
];

const GuarantorChain = () => {
  const [selectedNode, setSelectedNode] = useState<GuarantorNode | null>(null);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  const riskColor = (level: string) =>
    level === 'Low' ? 'text-success' : level === 'Medium' ? 'text-warning' : 'text-destructive';
  const riskBg = (level: string) =>
    level === 'Low' ? 'border-success/30 bg-success/10' : level === 'Medium' ? 'border-warning/30 bg-warning/10' : 'border-destructive/30 bg-destructive/10';
  const riskDot = (level: string) =>
    level === 'Low' ? 'bg-success' : level === 'Medium' ? 'bg-warning' : 'bg-destructive';

  const highlightedNodes = selectedChain
    ? chainAnalysis.find(c => c.chainId === selectedChain)?.nodes || []
    : [];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Guarantor Chain Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">Network risk visualization & contagion mapping</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Network Nodes</div>
            <div className="font-heading text-2xl font-bold text-foreground">{mockNetwork.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Guarantee Chains</div>
            <div className="font-heading text-2xl font-bold text-primary">{chainAnalysis.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">High Risk Chains</div>
            <div className="font-heading text-2xl font-bold text-destructive">{chainAnalysis.filter(c => c.risk === 'High').length}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">Avg Contagion</div>
            <div className="font-heading text-2xl font-bold text-warning">
              {Math.round(chainAnalysis.reduce((s, c) => s + c.contagion, 0) / chainAnalysis.length)}%
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Network Graph (Visual representation) */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-heading font-semibold text-foreground mb-4">Guarantor Network Map</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mockNetwork.map((node, i) => {
                const isHighlighted = highlightedNodes.includes(node.id);
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: highlightedNodes.length === 0 || isHighlighted ? 1 : 0.3,
                      scale: 1,
                    }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedNode(node)}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedNode?.id === node.id
                        ? 'border-primary shadow-glow bg-primary/5'
                        : isHighlighted
                          ? riskBg(node.riskLevel)
                          : 'border-border bg-muted/50 hover:border-primary/30'
                    }`}
                  >
                    {/* Node type badge */}
                    <div className={`text-xs font-heading font-bold mb-2 ${node.type === 'guarantor' ? 'text-primary' : riskColor(node.riskLevel)}`}>
                      {node.type === 'guarantor' ? '🛡️ Guarantor' : '👤 Borrower'}
                    </div>
                    <div className="font-medium text-sm text-foreground truncate">{node.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{node.id} • {node.city}</div>

                    {/* Risk indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className={`w-2 h-2 rounded-full ${riskDot(node.riskLevel)}`} />
                      <span className={`text-xs font-heading font-bold ${riskColor(node.riskLevel)}`}>
                        Score: {node.riskScore}
                      </span>
                    </div>

                    {/* Connections indicator */}
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.linkedTo.length} connection{node.linkedTo.length > 1 ? 's' : ''}
                    </div>

                    {/* Chain risk bar */}
                    <div className="h-1 rounded-full bg-border mt-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: node.riskLevel === 'Low' ? 'hsl(152, 69%, 40%)' : node.riskLevel === 'Medium' ? 'hsl(38, 92%, 50%)' : 'hsl(0, 72%, 51%)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${node.chainRisk}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected node detail */}
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-lg border border-primary/20 bg-primary/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-foreground">{selectedNode.name}</h3>
                  <button onClick={() => setSelectedNode(null)} className="text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <div className="font-medium text-foreground capitalize mt-0.5">{selectedNode.type}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credit Score</span>
                    <div className="font-medium text-foreground mt-0.5">{selectedNode.creditScore}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score</span>
                    <div className={`font-medium mt-0.5 ${riskColor(selectedNode.riskLevel)}`}>{selectedNode.riskScore}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chain Risk</span>
                    <div className="font-medium text-foreground mt-0.5">{selectedNode.chainRisk}%</div>
                  </div>
                </div>
                {selectedNode.guarantorFor && (
                  <div className="mt-3 text-xs">
                    <span className="text-muted-foreground">Guarantor for: </span>
                    <span className="text-primary font-medium">{selectedNode.guarantorFor.join(', ')}</span>
                  </div>
                )}
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Connected to: </span>
                  <span className="text-foreground">{selectedNode.linkedTo.join(', ')}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chain Analysis List */}
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-foreground text-sm mb-3">Chain Risk Analysis</h2>
            {chainAnalysis.map((chain, i) => (
              <motion.div
                key={chain.chainId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedChain(selectedChain === chain.chainId ? null : chain.chainId)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedChain === chain.chainId
                    ? 'border-primary shadow-glow bg-primary/5'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-heading font-semibold text-sm text-foreground">{chain.title}</span>
                  <span className={`text-xs font-heading font-bold px-2 py-0.5 rounded-full ${riskBg(chain.risk)} ${riskColor(chain.risk)}`}>
                    {chain.risk}
                  </span>
                </div>

                {/* Contagion bar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground shrink-0">Contagion</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: chain.contagion > 50 ? 'hsl(0, 72%, 51%)' : chain.contagion > 30 ? 'hsl(38, 92%, 50%)' : 'hsl(152, 69%, 40%)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${chain.contagion}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-xs font-heading font-bold text-foreground">{chain.contagion}%</span>
                </div>

                <p className="text-xs text-secondary-foreground leading-relaxed">{chain.description}</p>

                {/* Chain nodes */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {chain.nodes.map(nodeId => {
                    const node = mockNetwork.find(n => n.id === nodeId);
                    return (
                      <span key={nodeId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full ${riskDot(node?.riskLevel || 'Low')}`} />
                        {nodeId}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {/* Risk contagion warning */}
            <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
              <h3 className="font-heading font-semibold text-sm text-warning mb-2">⚠️ Contagion Warning</h3>
              <p className="text-xs text-secondary-foreground leading-relaxed">
                Anand Patel (GRT-002) guarantees 2 borrowers with combined exposure of ₹58L. 
                If Meera Nair defaults, cascading guarantee activation could stress Vikram Patel's loan coverage.
                Cross-chain dependency detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuarantorChain;
