import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Database, FileText, Activity, Users, Globe, Cpu, Award, CheckCircle2, BarChart3, Zap } from 'lucide-react';
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

export default function GovernancePage() {
  return (
    <EnterprisePageLayout
      label="Enterprise Governance"
      title="Institutional Trust Core."
      subtitle="Operating at the apex of enterprise compliance with immutable audit trails, advanced RBAC, and zero-trust security infrastructure."
      accentWord="Trust"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Compliance Score', value: 98.7, suffix: '%', icon: ShieldCheck, color: 'text-emerald-500' },
            { label: 'Audit Trails', value: 5000000, suffix: '+', icon: Database, color: 'text-blue-500' },
            { label: 'Security Events', value: 0, suffix: '', icon: Zap, color: 'text-orange-500' },
            { label: 'Certifications', value: 12, suffix: '', icon: Award, color: 'text-purple-500' },
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

        {/* Compliance Architecture */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden">
            <div className="absolute -inset-20 bg-emerald-500/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">Compliance Architecture</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                  { title: 'Zero-Trust Security', icon: Lock, desc: 'Continuous verification at every layer', count: '∞' },
                  { title: 'RBAC Registry', icon: Users, desc: 'Granular role-based access control', count: '24' },
                  { title: 'Audit Immutability', icon: Database, desc: 'Immutable operation ledger', count: '5M+' },
                ].map((item) => (
                  <div key={item.title} className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto">
                      <item.icon size={36} className="text-emerald-500" />
                    </div>
                    <h4 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    <p className="text-2xl font-display font-bold text-emerald-500">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Security & Compliance Clusters */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {[
              { title: 'Compliance Engine', icon: ShieldCheck, value: '98.7%', metric: 'Audit Score', color: 'text-emerald-500', items: ['SOC2 Type II', 'ISO 27001', 'GDPR Compliance', 'HIPAA Ready'] },
              { title: 'Risk Assessment', icon: Activity, value: '24/7', metric: 'Continuous Monitoring', color: 'text-blue-500', items: ['Threat modeling', 'Vulnerability scanning', 'Policy automation', 'Event correlation'] },
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

        {/* Audit Console Visualization */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Immutable Audit Ledger</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Every operation timestamped and recorded on secure ledger with cryptographic immutability and real-time compliance monitoring.</p>
                <div className="space-y-4">
                  {[{ label: 'Operation Trails', icon: FileText }, { label: 'Event Timestamps', icon: Activity }, { label: 'Compliance Checks', icon: ShieldCheck }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="relative h-full space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/30 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="w-16 h-2 bg-slate-300 dark:bg-slate-600 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Certifications */}
        <AnimatedContainer direction="up" delay={0.5}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['SOC2 Type II', 'ISO 27001', 'AES-256', 'HIPAA'].map((cert, i) => (
              <GlassCard key={i} className="p-6 text-center">
                <Award size={32} className="text-orange-500 mx-auto mb-3" />
                <p className="text-sm font-sans font-semibold text-slate-900 dark:text-white uppercase tracking-wide">{cert}</p>
              </GlassCard>
            ))}
          </div>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready for compliance?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy institutional-grade security and compliance infrastructure.</p>
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