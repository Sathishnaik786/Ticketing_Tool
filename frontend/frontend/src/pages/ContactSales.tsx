import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Shield, Clock, Users, CheckCircle2, ArrowRight, Mail, Phone, Globe } from 'lucide-react';
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

export default function ContactSalesPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    employees: '',
    message: '',
  });

  return (
    <EnterprisePageLayout
      label="Enterprise Onboarding"
      title="Connect with Sales."
      subtitle="Premium enterprise consultation with guided onboarding, SLA planning, and deployment timeline coordination."
      accentWord="Sales"
    >
      <div className="space-y-24">

        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { label: 'Avg Response', value: 2, suffix: ' hours', icon: Clock, color: 'text-blue-500' },
            { label: 'Enterprise Clients', value: 500, suffix: '+', icon: Users, color: 'text-emerald-500' },
            { label: 'Global Reach', value: 42, suffix: ' countries', icon: Globe, color: 'text-orange-500' },
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

        {/* Contact Form Section */}
        <AnimatedContainer direction="up" delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <GlassCard className="p-10 space-y-6">
              <h3 className="text-2xl font-display font-semibold text-slate-900 dark:text-white">Enterprise Consultation</h3>
              <p className="text-slate-500 dark:text-slate-400">Our team will guide you through platform architecture, security protocols, and deployment planning.</p>
              
              <div className="space-y-4">
                {[{ label: 'Platform Architecture Review', icon: Shield }, { label: 'Security & Compliance Planning', icon: CheckCircle2 }, { label: 'Deployment Timeline', icon: Clock }].map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <step.icon size={18} className="text-orange-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200/50 dark:border-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Contact directly:</p>
                <div className="space-y-2">
                  <a href="mailto:sales@yvi-people.com" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500">
                    <Mail size={14} /> sales@yvi-people.com
                  </a>
                  <a href="tel:+1-000-000-0000" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-orange-500">
                    <Phone size={14} /> +1 (000) 000-0000
                  </a>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-10">
              <form className="space-y-6">
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="Enterprise Corp"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="jane@enterprise.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Employee Count</label>
                  <select
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  >
                    <option value="">Select range</option>
                    <option value="1-100">1-100</option>
                    <option value="101-500">101-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-slate-600 dark:text-slate-400 uppercase mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>
                <button type="submit" className="w-full">
                  <PremiumButton className="w-full py-4">
                    Send Request <Send className="ml-2" size={16} />
                  </PremiumButton>
                </button>
              </form>
            </GlassCard>
          </div>
        </AnimatedContainer>

        {/* Trust Badges */}
        <AnimatedContainer direction="up" delay={0.4}>
          <div className="text-center">
            <p className="text-xs font-sans font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Trusted by Leading Enterprises</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['SOC2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'].map((badge, i) => (
                <GlassCard key={i} className="px-6 py-3">
                  <span className="text-xs font-sans font-semibold text-slate-600 dark:text-slate-300 uppercase">{badge}</span>
                </GlassCard>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* CTA Section */}
        <AnimatedContainer direction="up" delay={0.6}>
          <div className="text-center">
            <GlassCard className="p-16 border-2 border-orange-500/20">
              <h3 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mb-6">Ready to architect your enterprise?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Our team will prepare a custom platform architecture for your organization.</p>
              <Link to="/login" className="inline-block">
                <PremiumButton className="px-12 py-4 text-lg">Get Early Access</PremiumButton>
              </Link>
            </GlassCard>
          </div>
        </AnimatedContainer>
      </div>
    </EnterprisePageLayout>
  );
}