import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  LayoutDashboard,
  Calculator,
  Database,
  Lock,
  Globe,
  Settings,
  Briefcase,
  Target,
  Sparkles,
  TrendingUp,
  Activity,
  UserCheck,
  ShieldAlert,
  ClipboardList,
  FileText,
  Search,
  Cpu,
  Layers,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory?: string | null;
}

const menuData: Record<string, any> = {
  'Workforce': {
    left: [
      { title: 'Identity Directory', desc: 'Centralized employee records.', icon: Users },
      { title: 'Org Visualization', desc: 'Dynamic department mapping.', icon: Target },
      { title: 'Lifecycle Flow', desc: 'Onboarding to offboarding.', icon: Activity },
      { title: 'Presence Engine', desc: 'Real-time attendance tracking.', icon: UserCheck },
    ],
    center: [
      { title: 'AI Talent Search', desc: 'Semantic workforce querying.', icon: Sparkles },
      { title: 'Skills Gap Matrix', desc: 'Map organizational capabilities.', icon: LayoutDashboard },
      { title: 'Policy Governance', desc: 'Enforce HR compliance.', icon: ShieldCheck },
    ],
    right: {
      title: 'Active Workforce',
      value: '2,842',
      trend: '+12% this month',
      chart: [40, 70, 45, 90, 65, 80, 50, 60, 40, 85, 30, 95]
    }
  },
  'Payroll': {
    left: [
      { title: 'Payroll Nexus', desc: 'Unified disbursement core.', icon: CreditCard },
      { title: 'Tax Governance', desc: 'Localized tax compliance.', icon: Lock },
      { title: 'Salary Structures', desc: 'Flexible compensation models.', icon: Calculator },
      { title: 'Disbursements', desc: 'Bank integration & transfers.', icon: Globe },
    ],
    center: [
      { title: 'AI Anomaly Detection', desc: 'Prevent payroll variances.', icon: Zap },
      { title: 'Process Automation', desc: 'Batch processing engine.', icon: Settings },
      { title: 'Compliance Audit', desc: 'Ready for statutory review.', icon: ShieldCheck },
    ],
    right: {
      title: 'Monthly Payout',
      value: '₹14.2M',
      trend: '99.9% Accuracy',
      chart: [30, 50, 40, 60, 80, 70, 90, 85, 75, 95, 100, 98]
    }
  },
  'Intelligence': {
    left: [
      { title: 'Strategic Analytics', desc: 'High-level workforce intel.', icon: BarChart3 },
      { title: 'Predictive Churn', desc: 'AI-driven retention signals.', icon: TrendingUp },
      { title: 'Performance Clusters', desc: 'Identify top contributors.', icon: Users },
      { title: 'Cost Forecasting', desc: 'Projected human capital spend.', icon: FileText },
    ],
    center: [
      { title: 'Custom Reports', desc: 'Visual query builder.', icon: ClipboardList },
      { title: 'Live Dashboards', desc: 'Real-time executive metrics.', icon: LayoutDashboard },
      { title: 'AI Data Scientist', desc: 'Natural language insights.', icon: Sparkles },
    ],
    right: {
      title: 'System Health',
      value: '98.5',
      trend: 'Optimized',
      chart: [80, 85, 82, 88, 92, 90, 95, 94, 98, 97, 99, 98.5]
    }
  },
  'Governance': {
    left: [
      { title: 'Compliance Matrix', desc: 'Statutory regulation tracking.', icon: ShieldCheck },
      { title: 'Access Control', desc: 'RBAC & Identity management.', icon: Lock },
      { title: 'Security Logs', desc: 'Immutable operation trails.', icon: Database },
      { title: 'Policy Archive', desc: 'Governing documents vault.', icon: FileText },
    ],
    center: [
      { title: 'Risk Assessment', desc: 'Automated vulnerability scan.', icon: ShieldAlert },
      { title: 'Governance AI', desc: 'Autonomous compliance audit.', icon: Sparkles },
      { title: 'SSO Integration', desc: 'Enterprise authentication.', icon: Globe },
    ],
    right: {
      title: 'Security Posture',
      value: 'SOC2',
      trend: 'Type II Compliant',
      chart: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 100]
    }
  },
  'Projects': {
    left: [
      { title: 'Project Grid', desc: 'Consolidated initiative tracking.', icon: Briefcase },
      { title: 'Milestone Sync', desc: 'Real-time phase monitoring.', icon: Target },
      { title: 'Resource Matrix', desc: 'Map talent to deliverables.', icon: Users },
      { title: 'Productivity Logs', desc: 'High-velocity output tracking.', icon: Activity },
    ],
    center: [
      { title: 'AI Project Forecast', desc: 'Predict delivery timelines.', icon: Sparkles },
      { title: 'Auto-Allocation', desc: 'Optimize resource distribution.', icon: Zap },
      { title: 'Sprint Governance', desc: 'Enforce agile protocols.', icon: Layers },
    ],
    right: {
      title: 'Active Initiatives',
      value: '42',
      trend: '85% Efficiency',
      chart: [50, 60, 55, 70, 75, 80, 85, 82, 88, 90, 85, 84]
    }
  },
  'Operations': {
    left: [
      { title: 'System Logs', desc: 'Low-latency operation trails.', icon: FileText },
      { title: 'API Integration', desc: 'Connect enterprise nodes.', icon: Globe },
      { title: 'Data Flow Hub', desc: 'Orchestrate information.', icon: Database },
      { title: 'Queue Management', desc: 'High-volume process control.', icon: Layers },
    ],
    center: [
      { title: 'Node Monitoring', desc: 'Real-time system health.', icon: Activity },
      { title: 'Security Patches', desc: 'Autonomous system updates.', icon: ShieldCheck },
      { title: 'Traffic Analytics', desc: 'Identify operational bottlenecks.', icon: BarChart3 },
    ],
    right: {
      title: 'Node Status',
      value: 'Online',
      trend: '99.9% Uptime',
      chart: [100, 100, 99.9, 100, 100, 99.9, 100, 100, 100, 100, 100, 100]
    }
  },
  'Analytics': {
    left: [
      { title: 'Workforce Trends', desc: 'Macro-level talent shifts.', icon: TrendingUp },
      { title: 'Retention Signals', desc: 'Predictive churn modeling.', icon: Target },
      { title: 'Diversity Index', desc: 'Map organizational inclusion.', icon: Users },
      { title: 'Performance Hub', desc: 'Consolidated growth metrics.', icon: BarChart3 },
    ],
    center: [
      { title: 'AI Insights', desc: 'Automated executive summaries.', icon: Sparkles },
      { title: 'Visual Query', desc: 'Drag-and-drop data builder.', icon: LayoutDashboard },
      { title: 'Global Benchmarks', desc: 'Compare with industry standards.', icon: Globe },
    ],
    right: {
      title: 'Insights Gen',
      value: '1.2M',
      trend: 'Predictive Active',
      chart: [20, 40, 60, 50, 70, 90, 80, 100, 95, 110, 105, 120]
    }
  },
  'AI Systems': {
    left: [
      { title: 'Nexus Core AI', desc: 'Central intelligence engine.', icon: Cpu },
      { title: 'Natural Language', desc: 'Semantic data interaction.', icon: MessageSquare },
      { title: 'Pattern Recognition', desc: 'Identify hidden variances.', icon: Zap },
      { title: 'Autonomous Agents', desc: 'Self-executing workflows.', icon: Sparkles },
    ],
    center: [
      { title: 'Model Training', desc: 'Proprietary workforce LLMs.', icon: Layers },
      { title: 'Inference Logs', desc: 'Audit AI decision trails.', icon: ShieldCheck },
      { title: 'Cognitive Sync', desc: 'Unified AI memory layer.', icon: Database },
    ],
    right: {
      title: 'AI Processing',
      value: '24.5TB',
      trend: 'Optimized',
      chart: [10, 30, 20, 50, 40, 70, 60, 90, 80, 100, 95, 110]
    }
  }
};

export const MegaMenu = ({ isOpen, onClose, activeCategory: initialCategory }: MegaMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('Workforce');

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const data = menuData[activeCategory] || menuData['Workforce'];

  const categoryIcons: Record<string, any> = {
    'Workforce': Users,
    'Payroll': CreditCard,
    'Intelligence': BarChart3,
    'Governance': ShieldCheck,
    'Projects': Briefcase,
    'Operations': Settings,
    'Analytics': TrendingUp,
    'AI Systems': Cpu
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[210] rounded-[3rem] border border-white/10 bg-slate-950/90 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl font-sans"
          >
            <div className="flex h-full min-h-[550px]">
              {/* Category Sidebar (Internal Navigation) */}
              <div className="w-20 border-r border-white/5 bg-black/40 flex flex-col items-center py-8 gap-6">
                 {Object.keys(menuData).map((cat) => {
                   const Icon = categoryIcons[cat];
                   return (
                     <button
                        key={cat}
                        onMouseEnter={() => setActiveCategory(cat)}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                          activeCategory === cat ? "bg-teal-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.4)]" : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                     >
                        <Icon size={20} />
                     </button>
                   );
                 })}
              </div>

              {/* Left Column: Module Categories */}
              <div className="w-[28%] border-r border-white/5 p-10 bg-black/20">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">{activeCategory} Modules</p>
                <div className="space-y-4">
                  {data.left.map((item: any) => (
                    <Link
                      key={item.title}
                      to="#"
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:scale-110 transition-all">
                        <item.icon size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-display font-black uppercase tracking-tight text-slate-200 group-hover:text-white">{item.title}</p>
                         <p className="text-[10px] font-bold text-slate-500">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Center Column: Workflows & AI */}
              <div className="flex-1 p-10 space-y-10">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-500">Intelligent Workflows</p>
                    <h3 className="text-3xl font-display font-black uppercase tracking-tighter text-white">
                       Core <span className="text-teal-500">Automation</span>
                    </h3>
                 </div>

                 <div className="grid grid-cols-1 gap-6">
                    {data.center.map((item: any) => (
                      <Link 
                        key={item.title} 
                        to="#" 
                        onClick={onClose}
                        className="group flex items-center gap-6 p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all"
                      >
                         <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                            <item.icon size={24} />
                         </div>
                         <div className="flex-1">
                            <span className="text-sm font-display font-black uppercase tracking-tight text-slate-200 group-hover:text-white block">{item.title}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.desc}</span>
                         </div>
                         <ArrowRight size={16} className="text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                 </div>
              </div>

              {/* Right Column: Visual Previews */}
              <div className="w-[30%] border-l border-white/5 p-10 bg-black/20 flex flex-col justify-between">
                 <div className="space-y-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Operational Pulse</p>
                    <div className="p-8 rounded-[3rem] border border-white/10 bg-gradient-to-br from-slate-900 to-black space-y-6 shadow-2xl">
                       <div className="space-y-2">
                          <p className="text-[9px] font-sans font-black uppercase tracking-widest text-teal-400/60">{data.right.title}</p>
                          <h2 className="text-6xl font-display font-black text-white tracking-tighter leading-none">{data.right.value}</h2>
                          <div className="flex items-center gap-2 text-emerald-400 mt-2">
                             <TrendingUp size={12} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{data.right.trend}</span>
                          </div>
                       </div>
                       
                       {/* Mini Chart Mockup */}
                       <div className="h-28 flex items-end gap-1.5 pt-4">
                          {data.right.chart.map((h: number, i: number) => (
                             <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group/bar overflow-hidden">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  transition={{ duration: 1, delay: i * 0.05 }}
                                  className="absolute bottom-0 left-0 right-0 bg-teal-500/40 group-hover/bar:bg-teal-400 transition-colors"
                                />
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                       <Sparkles size={18} />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white">AI Insight Active</p>
                       <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Real-time governance audit in progress.</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
