import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, Activity, Database, Globe, ShieldCheck, Zap, Cpu, BarChart3, LineChart, PieChart, CheckCircle2, ArrowRight, Sparkles, Clock, Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const isInView = true;

  useEffect(() => {
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

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function OperationsPage() {
  return (
    <EnterprisePageLayout
      label="Operational Command Center"
      title="System Orchestration."
      subtitle="Global enterprise operations nerve center with real-time system health, workflow automation, and incident response intelligence."
      accentWord="Orchestration"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'System Uptime', value: 99.99, suffix: '%', icon: Activity, color: 'text-emerald-500' },
            { label: 'Active Nodes', value: 96, suffix: '', icon: Cpu, color: 'text-blue-500' },
            { label: 'Processing', value: 2.4, suffix: 'M/s', icon: Zap, color: 'text-purple-500' },
            { label: 'Incidents', value: 0, suffix: '', icon: AlertTriangle, color: 'text-orange-500' },
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

        {/* Operations Architecture */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden">
            <div className="absolute -inset-20 bg-blue-500/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">Enterprise Infrastructure Layer</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                  { title: 'Node Monitoring', icon: Activity, desc: 'Real-time system health across all regions', count: '96' },
                  { title: 'Workflow Automation', icon: Settings, desc: 'Automated process orchestration', count: '1.2K' },
                  { title: 'API Gateway', icon: Globe, desc: 'Unified integration layer for systems', count: '500+' },
                ].map((item) => (
                  <div key={item.title} className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center mx-auto">
                      <item.icon size={36} className="text-blue-500" />
                    </div>
                    <h4 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    <p className="text-2xl font-display font-bold text-blue-500">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Operations Clusters */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              { title: 'Incident Response', icon: AlertTriangle, value: '2m', metric: 'SLA Response', color: 'text-orange-500', items: ['Automated detection', 'Instant escalation', 'Resolution tracking', 'Post-mortem analysis'] },
              { title: 'Performance Monitoring', icon: BarChart3, value: '100%', metric: 'Availability', color: 'text-emerald-500', items: ['Real-time metrics', 'Degradation alerts', 'Capacity planning', 'Optimized routing'] },
            ].map((cluster, i) => (
              <GlassCard key={i} className="p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center">
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
                      <CheckCircle2 size={16} className="text-emerald-500" />
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

        {/* System Health Dashboard */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Command Center</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Centralized operational intelligence with real-time system metrics and automated workflow orchestration.</p>
                <div className="space-y-4">
                  {[{ label: 'System Metrics', icon: LineChart }, { label: 'Traffic Analytics', icon: PieChart }, { label: 'Health Indicators', icon: Activity }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-blue-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                <div className="relative h-full space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/30 dark:bg-white/5 rounded-xl">
                    <span className="text-xs font-sans font-medium text-slate-500">API Gateway</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/30 dark:bg-white/5 rounded-xl">
                    <span className="text-xs font-sans font-medium text-slate-500">Database Cluster</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/30 dark:bg-white/5 rounded-xl">
                    <span className="text-xs font-sans font-medium text-slate-500">Auth Service</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready for operations excellence?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy enterprise-grade operational command infrastructure.</p>
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