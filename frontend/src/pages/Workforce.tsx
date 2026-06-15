import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Target, Activity, Calendar, BarChart3, ShieldCheck, TrendingUp, Globe, Database, Zap, Clock, UserCheck, Briefcase, Map, Network, ArrowRight, Sparkles, FileText, PieChart, LineChart, Cpu, Lock, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';
import SectionHeading from '@/components/landing/SectionHeading';

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = React.useRef(null);
  const isInView = true;

  React.useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setDisplayValue(Math.floor(ease * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [value, duration]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};

export default function WorkforcePage() {
  return (
    <EnterprisePageLayout
      label="Enterprise Workforce"
      title="Orchestrated Human Capital."
      subtitle="AI-native workforce intelligence platform managing the complete employee lifecycle with predictive analytics and autonomous governance."
      accentWord="Human"
    >
      <div className="space-y-24">

        {/* Hero Metrics - Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Active Workforce', value: 2842, suffix: '+', icon: Users, color: 'text-orange-500' },
            { label: 'Retention Rate', value: 94.2, suffix: '%', icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'AI Accuracy', value: 98.7, suffix: '%', icon: Sparkles, color: 'text-blue-500' },
            { label: 'Global Regions', value: 42, suffix: '', icon: Globe, color: 'text-indigo-500' },
          ].map((stat, i) => (
            <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
              <GlassCard className="p-8 text-center space-y-4 group hover:-translate-y-2 transition-transform duration-500">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white">
                    <Counter value={stat.value} />{stat.suffix}
                  </h3>
                  <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                </div>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>

        {/* Workforce Lifecycle Visualization */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden relative">
            <div className="absolute -inset-20 bg-orange-500/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Activity size={20} className="text-orange-500" />
                <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white">Employee Lifecycle Orchestration</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {[
                  { title: 'Talent Acquisition', icon: Target, desc: 'AI-powered recruitment engine with semantic matching', step: '01' },
                  { title: 'Onboarding Workflows', icon: Users, desc: 'Automated provisioning and document workflows', step: '02' },
                  { title: 'Performance Loop', icon: BarChart3, desc: 'Continuous feedback and growth tracking', step: '03' },
                  { title: 'Development Engine', icon: TrendingUp, desc: 'Skills mapping and career pathing', step: '04' },
                  { title: 'Transition Flow', icon: Activity, desc: 'Graceful departure and knowledge transfer', step: '05' },
                ].map((phase) => (
                  <div key={phase.title} className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center mx-auto">
                      <phase.icon size={28} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-sans font-bold text-orange-500 uppercase tracking-widest mb-1">{phase.step}</p>
                      <h4 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{phase.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Intelligence Clusters */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              { title: 'Attrition Intelligence', icon: TrendingUp, value: '94.2%', metric: 'Retention Rate', color: 'text-emerald-500', items: ['Predictive churn models', 'Flight-risk scoring', 'Retention recommendations'] },
              { title: 'Hiring Intelligence', icon: Target, value: '12d', metric: 'Avg Time-to-Hire', color: 'text-blue-500', items: ['Semantic candidate matching', 'Skills gap analysis', 'Diversity optimization'] },
            ].map((cluster, i) => (
              <GlassCard key={i} className="p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 flex items-center justify-center">
                    <cluster.icon size={24} className={cluster.color} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-white">{cluster.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{cluster.metric}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {cluster.items.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-200/50 dark:border-white/5">
                  <span className="text-2xl font-display font-semibold text-slate-900 dark:text-white">{cluster.value}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </AnimatedContainer>

        {/* Department Ecosystem */}
        <AnimatedContainer direction="up" delay={0.4}>
          <div className="space-y-12">
            <SectionHeading label="Enterprise Architecture" title="Department Ecosystem" align="left" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Engineering Core', count: '412', icon: Cpu, color: 'text-purple-500' },
                { title: 'Product Engineering', count: '87', icon: Target, color: 'text-blue-500' },
                { title: 'Security Ops', count: '24', icon: ShieldCheck, color: 'text-emerald-500' },
                { title: 'Infrastructure', count: '67', icon: Database, color: 'text-orange-500' },
                { title: 'Growth Division', count: '156', icon: TrendingUp, color: 'text-rose-500' },
                { title: 'Operations Hub', count: '93', icon: Activity, color: 'text-indigo-500' },
              ].map((dept, i) => (
                <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
                  <GlassCard className="p-8 flex items-center gap-6 group hover:-translate-y-2 transition-transform duration-500">
                    <div className={cn("w-14 h-14 rounded-3xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", dept.color)}>
                      <dept.icon size={28} />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{dept.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dept.count} members</p>
                    </div>
                  </GlassCard>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* Attendance & Presence Intelligence */}
        <AnimatedContainer direction="up" delay={0.5}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Presence Engine</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Real-time attendance tracking powered by AI-driven anomaly detection and predictive workforce planning.</p>
                <div className="space-y-4">
                  {[{ label: 'Automated Time Tracking', icon: Clock }, { label: 'Anomaly Detection', icon: Zap }, { label: 'Compliance Automation', icon: ShieldCheck }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/10 blur-[80px] rounded-full" />
                <div className="relative h-64 bg-white/[0.03] dark:bg-white/5 rounded-3xl border border-slate-200/50 dark:border-white/5 flex items-center justify-center">
                  <UserCheck size={64} className="text-orange-500/30" />
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready to orchestrate your workforce?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy the world's most advanced AI-native workforce operating system.</p>
              <Link to="/login" className="inline-block">
                <PremiumButton className="px-12 py-4 text-lg">Establish Access</PremiumButton>
              </Link>
            </GlassCard>
          </div>
        </AnimatedContainer>
      </div>
    </EnterprisePageLayout>
  );
}