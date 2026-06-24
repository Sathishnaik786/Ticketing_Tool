import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Target, Sparkles, Database, Cpu, LineChart, PieChart, Zap, Globe, Brain, Scan, RefreshCw } from 'lucide-react';
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

export default function IntelligencePage() {
  return (
    <EnterprisePageLayout
      label="AI Intelligence Layer"
      title="Predictive Analytics Core."
      subtitle="Deep-learning insights into organizational health, performance clusters, and strategic growth opportunities with autonomous AI decision systems."
      accentWord="Analytics"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Predictions Made', value: 1200000, suffix: '+', icon: Brain, color: 'text-purple-500' },
            { label: 'Data Sources', value: 87, suffix: '', icon: Database, color: 'text-blue-500' },
            { label: 'Model Accuracy', value: 96.4, suffix: '%', icon: Sparkles, color: 'text-teal-500' },
            { label: 'Insights Daily', value: 15420, suffix: '+', icon: LineChart, color: 'text-orange-500' },
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

        {/* Intelligence Ecosystem */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden">
            <div className="absolute -inset-20 bg-purple-500/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">AI Intelligence Ecosystem</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                  { title: 'Predictive Modeling', icon: Brain, desc: 'Churn, growth, and performance forecasting', count: '24' },
                  { title: 'Data Integration', icon: Database, desc: 'Unified data from 87 enterprise sources', count: '87' },
                  { title: 'Decision Engine', icon: Zap, desc: 'Automated insights and recommendations', count: '15K' },
                ].map((item) => (
                  <div key={item.title} className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 flex items-center justify-center mx-auto">
                      <item.icon size={36} className="text-purple-500" />
                    </div>
                    <h4 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    <p className="text-2xl font-display font-bold text-purple-500">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Analytics Clusters */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              { title: 'Growth Intelligence', icon: TrendingUp, value: '32%', metric: 'YoY Growth', color: 'text-emerald-500', items: ['Revenue forecasting', 'Market expansion analytics', 'Team scaling insights'] },
              { title: 'Performance Analytics', icon: BarChart3, value: '87%', metric: 'High Performers', color: 'text-blue-500', items: ['Contribution clustering', 'Productivity metrics', 'Skill gap analysis'] },
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

        {/* AI Command Center Visualization */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Neural Insight Dashboard</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Real-time AI-powered executive dashboards with predictive modeling and autonomous insights generation.</p>
                <div className="space-y-4">
                  {[{ label: 'Natural Language Queries', icon: Scan }, { label: 'Live Data Streams', icon: RefreshCw }, { label: 'Executive Reports', icon: PieChart }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-purple-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 bg-purple-500/10 blur-[80px] rounded-full" />
                <div className="relative h-full grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-purple-500/20 rounded-lg" style={{ height: `${20 + Math.random() * 80}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready to unlock intelligence?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy the world's most advanced AI-native analytics platform.</p>
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