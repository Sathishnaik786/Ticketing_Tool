import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Shield, Users, Zap, Activity, Award, CheckCircle2, ArrowRight, Timer, AlertCircle } from 'lucide-react';
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

export default function EnterpriseSLAPage() {
  return (
    <EnterprisePageLayout
      label="Enterprise Support"
      title="SLA Guarantees."
      subtitle="Enterprise-grade service level agreements with guaranteed uptime, response times, and dedicated support infrastructure."
      accentWord="SLA"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Uptime', value: 99.99, suffix: '%', icon: Activity, color: 'text-emerald-500' },
            { label: 'Response Time', value: 15, suffix: ' min', icon: Timer, color: 'text-blue-500' },
            { label: 'Support Hours', value: 24, suffix: '/7', icon: Clock, color: 'text-orange-500' },
            { label: 'Enterprise Clients', value: 500, suffix: '+', icon: Users, color: 'text-purple-500' },
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

        {/* SLA Matrix */}
        <AnimatedContainer direction="up" delay={0.2}>
          <GlassCard className="p-12 overflow-hidden">
            <div className="absolute -inset-20 bg-blue-500/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-3xl font-display font-semibold text-slate-900 dark:text-white mb-8">Support Tier Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200/50 dark:border-white/5">
                      <th className="text-left py-4 font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wide">Tier</th>
                      <th className="text-left py-4 font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wide">Response Time</th>
                      <th className="text-left py-4 font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wide">Availability</th>
                      <th className="text-left py-4 font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-wide">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tier: 'Critical', response: '15 minutes', uptime: '99.99%', coverage: '24/7/365' },
                      { tier: 'High', response: '1 hour', uptime: '99.95%', coverage: '24/7/365' },
                      { tier: 'Standard', response: '4 hours', uptime: '99.9%', coverage: 'Business Hours' },
                      { tier: 'Low', response: '24 hours', uptime: '99%', coverage: 'Business Hours' },
                    ].map((row, i) => (
                      <tr key={row.tier} className="border-b border-slate-200/50 dark:border-white/5 last:border-0">
                        <td className="py-4 font-display font-semibold text-slate-900 dark:text-white">{row.tier}</td>
                        <td className="py-4 font-sans text-slate-600 dark:text-slate-300">{row.response}</td>
                        <td className="py-4 font-sans text-emerald-500 font-semibold">{row.uptime}</td>
                        <td className="py-4 font-sans text-slate-600 dark:text-slate-300">{row.coverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Support Infrastructure */}
        <AnimatedContainer direction="up" delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              { title: 'Global Support Centers', icon: Users, count: '12', desc: 'Regional support hubs' },
              { title: 'Dedicated Engineers', icon: Shield, count: '200', desc: 'Enterprise support specialists' },
              { title: 'Avg Resolution', icon: Zap, count: '2.4h', desc: 'Mean time to resolution' },
            ].map((item, i) => (
              <AnimatedContainer key={i} direction="up" delay={i * 0.05}>
                <GlassCard className="p-8 text-center space-y-4">
                  <item.icon size={32} className="text-blue-500 mx-auto" />
                  <h4 className="font-display font-semibold text-xl text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-3xl font-display font-bold text-blue-500">{item.count}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </GlassCard>
              </AnimatedContainer>
            ))}
          </div>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Enterprise support ready</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Connect with our team to discuss enterprise SLA options.</p>
              <Link to="/contact-sales" className="inline-block">
                <PremiumButton className="px-12 py-4 text-lg">Discuss SLA Options</PremiumButton>
              </Link>
            </GlassCard>
          </div>
        </AnimatedContainer>
      </div>
    </EnterprisePageLayout>
  );
}