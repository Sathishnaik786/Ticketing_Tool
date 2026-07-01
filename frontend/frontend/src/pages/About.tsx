import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Building2, Users, Globe2, Target, Award, Calendar, Cpu, Shield, Zap, ArrowRight } from 'lucide-react';
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

export default function AboutPage() {
  return (
    <EnterprisePageLayout
      label="Institutional Identity"
      title="Enterprise Vision."
      subtitle="Building the future of work with AI-native operating systems for global enterprises."
      accentWord="Vision"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Founded', value: 2022, suffix: '', icon: Calendar, color: 'text-orange-500' },
            { label: 'Employees', value: 300, suffix: '+', icon: Users, color: 'text-blue-500' },
            { label: 'Global Offices', value: 12, suffix: '', icon: Globe2, color: 'text-emerald-500' },
            { label: 'Enterprise Clients', value: 500, suffix: '+', icon: Building2, color: 'text-purple-500' },
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

        {/* Our Mission */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Our Mission</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  We envision a world where enterprise operations are seamlessly orchestrated by intelligent systems,
                  freeing human talent to focus on creative and strategic work. Our platform unifies workforce,
                  payroll, and governance into a single AI-native operating system.
                </p>
                <div className="space-y-4">
                  {[{ label: 'AI-First Architecture', icon: Cpu }, { label: 'Enterprise Grade Security', icon: Shield }, { label: 'Global Scale Operations', icon: Globe2 }].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon size={18} className="text-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64">
                <div className="absolute inset-0 bg-orange-500/10 blur-[80px] rounded-full" />
                <div className="relative h-full rounded-3xl bg-white/[0.03] dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center">
                  <Target size={64} className="text-orange-500/30" />
                </div>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Leadership Team */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="space-y-12">
            <AnimatedContainer direction="up">
              <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white">Leadership Team</h3>
            </AnimatedContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Alex Chen', role: 'CEO & Founder', icon: Award },
                { name: 'Sarah Kim', role: 'CTO', icon: Cpu },
                { name: 'Marcus Rivera', role: 'Head of Security', icon: Shield },
              ].map((leader, i) => (
                <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
                  <GlassCard className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 flex items-center justify-center mx-auto">
                      <leader.icon size={32} className="text-orange-500" />
                    </div>
                    <h4 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{leader.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{leader.role}</p>
                  </GlassCard>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* Global Infrastructure */}
        <AnimatedContainer direction="up" delay={0.4}>
          <GlassCard className="p-12">
            <div className="space-y-6">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Global Infrastructure</h3>
              <p className="text-slate-500 dark:text-slate-400">Multi-region deployment ensuring compliance and performance across 12 global data centers.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['North America', 'Europe', 'Asia Pacific', 'Middle East'].map((region, i) => (
                  <div key={region} className="text-center p-4 rounded-2xl bg-white/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                    <Globe2 size={24} className="text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-sans font-medium text-slate-700 dark:text-slate-300">{region}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Join the future of work</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Connect with our team to learn how Ticketra transforms enterprise operations.</p>
              <Link to="/contact-sales" className="inline-block">
                <PremiumButton className="px-12 py-4 text-lg">Contact Sales</PremiumButton>
              </Link>
            </GlassCard>
          </div>
        </AnimatedContainer>
      </div>
    </EnterprisePageLayout>
  );
}