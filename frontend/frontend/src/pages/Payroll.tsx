import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, Globe, Calculator, Shield, Banknote, TrendingUp, PieChart, BarChart3, Activity, Users, Lock, Zap, Database, Cpu, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import EnterprisePageLayout from '@/components/layout/EnterprisePageLayout';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
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

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function PayrollPage() {
  return (
    <EnterprisePageLayout
      label="Global Payroll Network"
      title="Capital Flow Intelligence."
      subtitle="Zero-latency disbursements across international jurisdictions with autonomous tax governance and multi-currency precision."
      accentWord="Capital"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Monthly Payout', value: 14200000, suffix: '₹', icon: Banknote, color: 'text-blue-500', format: 'currency' },
            { label: 'Countries', value: 42, suffix: '+', icon: Globe, color: 'text-emerald-500' },
            { label: 'Tax Schemas', value: 120, suffix: '+', icon: Lock, color: 'text-orange-500' },
            { label: 'Accuracy Rate', value: 99.9, suffix: '%', icon: Shield, color: 'text-indigo-500' },
          ].map((stat, i) => (
            <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
              <GlassCard className="p-8 text-center space-y-4 group hover:-translate-y-2 transition-transform duration-500">
                <div className={cn("w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white">
                    {stat.suffix === '₹' && stat.format === 'currency' ? '₹' : ''}<Counter value={stat.value} />{stat.suffix !== '₹' && stat.suffix !== 'currency' ? stat.suffix : 'M'}
                  </h3>
                  <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                </div>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>

        {/* Global Payroll Orchestration */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">Global Payroll Orchestration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                  { title: 'Multi-Currency Processing', icon: Banknote, desc: '12+ currencies with real-time forex integration', count: '12+' },
                  { title: 'Tax Compliance', icon: Lock, desc: 'Auto-localized tax schemas for 120+ regions', count: '120+' },
                  { title: 'Bank Integration', icon: Database, desc: 'Direct API connections to 500+ banks', count: '500+' },
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
            <div className="absolute -inset-20 bg-blue-500/5 blur-[120px] rounded-full" />
          </GlassCard>
        </AnimatedContainer>

        {/* Payroll AI Forecasting */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              { title: 'Forecast Engine', icon: Cpu, value: '98.7%', metric: 'Prediction Accuracy', color: 'text-orange-500', items: ['AI-driven cost forecasting', 'Headcount planning', 'Budget optimization'] },
              { title: 'Anomaly Detection', icon: Zap, value: '0.1%', metric: 'Error Rate', color: 'text-emerald-500', items: ['Automated discrepancy flags', 'Variance prevention', 'Micro-audit systems'] },
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

        {/* Compensation Analytics */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Compensation Analytics</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Real-time salary benchmarking with market intelligence and equity optimization across global markets.</p>
                <div className="space-y-4">
                  {[{ label: 'Market Benchmarking', icon: BarChart3 }, { label: 'Equity Modeling', icon: PieChart }, { label: 'Pay Equity Analysis', icon: TrendingUp }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-blue-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                <div className="relative h-64 bg-white/[0.03] dark:bg-white/5 rounded-3xl border border-slate-200/50 dark:border-white/5 overflow-hidden">
                  <div className="h-full flex items-end justify-between p-6">
                    {[40, 65, 30, 85, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-8 bg-blue-500/20 rounded-t-lg" style={{ height: `${h}%` }}>
                        <div className="w-full h-1/3 bg-blue-500 rounded-t-lg" />
                      </div>
                    ))}
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
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready to automate your payroll?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy the world's most advanced global payroll intelligence platform.</p>
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