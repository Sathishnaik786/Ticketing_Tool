import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, FileText, Award, CheckCircle2, Key, Eye, AlertTriangle, ArrowRight } from 'lucide-react';
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

export default function SecurityStandardsPage() {
  return (
    <EnterprisePageLayout
      label="Enterprise Security"
      title="Zero-Trust Architecture."
      subtitle="Institutional-grade security infrastructure with end-to-end encryption, zero-trust verification, and compliance certifications."
      accentWord="Zero-Trust"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Encryption', value: 256, suffix: '-bit', icon: Lock, color: 'text-emerald-500' },
            { label: 'Audit Trails', value: 5000000, suffix: '+', icon: Database, color: 'text-blue-500' },
            { label: 'Security Checks', value: 10000, suffix: '+/d', icon: Shield, color: 'text-orange-500' },
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

        {/* Security Layers */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12">
            <div className="absolute -inset-20 bg-emerald-500/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">Security Infrastructure Layers</h3>
              <div className="space-y-8">
                {[
                  { layer: 'Network Security', icon: Shield, desc: 'Zero-trust network architecture with continuous verification', checks: 10000 },
                  { layer: 'Application Security', icon: Lock, desc: 'End-to-end encryption with RBAC and audit trails', checks: 5000 },
                  { layer: 'Data Security', icon: Database, desc: 'AES-256 encryption at rest, TLS 1.3 in transit', checks: 2500 },
                  { layer: 'Identity Security', icon: Key, desc: 'Multi-factor authentication and SSO integration', checks: 1500 },
                ].map((item, i) => (
                  <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                        <item.icon size={28} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{item.layer}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Daily Checks</p>
                        <p className="text-xl font-display font-bold text-emerald-500">{item.checks / 1000}K+</p>
                      </div>
                    </div>
                  </AnimatedContainer>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Compliance Certifications */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="space-y-12">
            <AnimatedContainer direction="up">
              <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white">Compliance Certifications</h3>
            </AnimatedContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'SOC2 Type II', icon: Shield },
                { label: 'ISO 27001', icon: Award },
                { label: 'GDPR', icon: CheckCircle2 },
                { label: 'HIPAA', icon: Lock },
              ].map((cert, i) => (
                <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
                  <GlassCard className="p-8 text-center space-y-3">
                    <cert.icon size={32} className="text-orange-500 mx-auto" />
                    <p className="font-sans font-semibold text-slate-900 dark:text-white">{cert.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Compliant</p>
                  </GlassCard>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* Security Architecture Diagram */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Encryption Pipeline</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  All data is protected with AES-256 encryption at rest and TLS 1.3 in transit.
                  Every operation is logged with cryptographic immutability and monitored 24/7.
                </p>
                <div className="space-y-4">
                  {[{ label: 'Data at Rest: AES-256', icon: Lock }, { label: 'Data in Transit: TLS 1.3', icon: Shield }, { label: 'Audit Immutability', icon: FileText }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
                    <Lock size={64} className="text-emerald-500/50" />
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
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Security at scale</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Deploy enterprise-grade security for your organization.</p>
              <Link to="/contact-sales" className="inline-block">
                <PremiumButton className="px-12 py-4 text-lg">Contact Security Team</PremiumButton>
              </Link>
            </GlassCard>
          </div>
        </AnimatedContainer>
      </div>
    </EnterprisePageLayout>
  );
}