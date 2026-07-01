import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Ticket,
  ShieldCheck,
  BarChart3,
  BookOpen,
  ArrowRight,
  Zap,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  Activity,
  Target,
  ClipboardList,
  Layers,
  Clock,
  Bell,
  CheckSquare,
  Users,
} from 'lucide-react';
import { TicketraLandingFooter } from '@/components/landing/TicketraLandingFooter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import SectionHeading from '@/components/landing/SectionHeading';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';
import ThemeToggle from '@/components/auth/ThemeToggle';
import { TicketraBrandMark, TicketraWordmark } from '@/components/common/TicketraBrandMark';

type NavEntry = { label: string; path?: string; hash?: string };

const NAV_LINKS: NavEntry[] = [
  { label: 'Features', hash: 'features' },
  { label: 'Solutions', hash: 'solutions' },
  { label: 'Security', path: '/security-standards' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact-sales' },
];

const Counter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

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
  }, [isInView, value, duration]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLinkActive = (entry: NavEntry) =>
    entry.path ? location.pathname === entry.path : false;

  const renderNavLink = (entry: NavEntry, className: string, onNavigate?: () => void) => {
    if (entry.hash) {
      return (
        <a
          href={`#${entry.hash}`}
          onClick={onNavigate}
          className={className}
        >
          {entry.label}
        </a>
      );
    }
    return (
      <Link to={entry.path!} onClick={onNavigate} className={className}>
        {entry.label}
      </Link>
    );
  };

  const linkClass = (active: boolean) =>
    cn(
      'relative inline-flex items-center text-[13px] xl:text-[14px] 2xl:text-[15px] font-semibold tracking-wide py-2 px-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded transition-all duration-300 ease-out',
      active
        ? 'text-blue-600 font-semibold after:absolute after:left-0 after:right-0 after:bottom-[-10px] after:h-[2px] after:bg-blue-600 after:rounded-full after:shadow-[0_0_8px_rgba(37,99,235,0.5)]'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:after:absolute hover:after:left-0 hover:after:right-0 hover:after:bottom-[-10px] hover:after:h-[2px] hover:after:bg-blue-600 hover:after:rounded-full'
    );

  const mobileLinkClass = (active: boolean) =>
    cn(
      'block w-full text-left text-2xl font-semibold tracking-tight transition-colors duration-200 py-3 px-2 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none',
      active
        ? 'text-blue-600 font-bold bg-blue-500/10'
        : 'text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-500/5'
    );

  return (
    <>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[150] w-[94%] max-w-[1700px] transition-all duration-500 ease-out">
        <nav
          aria-label="Main navigation"
          className={cn(
            'relative flex items-center rounded-full px-8 xl:px-10 overflow-hidden',
            'bg-white/[0.08] dark:bg-slate-950/[0.55] backdrop-blur-3xl',
            'border border-white/15 dark:border-white/10',
            isScrolled
              ? 'h-[72px] shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]'
              : 'h-[88px] shadow-[0_20px_80px_rgba(15,23,42,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.40)]',
            'transition-all duration-500 ease-out'
          )}
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-transparent to-blue-500/5 pointer-events-none" />
          <div aria-hidden="true" className="absolute inset-px rounded-full border border-white/10 pointer-events-none" />

          <div className="flex-shrink-0 relative z-10 lg:min-w-[200px] xl:min-w-[240px]">
            <Link
              to="/"
              className="relative inline-flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-full px-2 py-1"
            >
              <TicketraBrandMark size="lg" />
              <TicketraWordmark className="text-[26px] xl:text-[28px] font-semibold whitespace-nowrap" />
            </Link>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center lg:gap-4 xl:gap-8 2xl:gap-12 whitespace-nowrap">
            {NAV_LINKS.map((entry) => (
              <React.Fragment key={entry.label}>
                {renderNavLink(entry, linkClass(isLinkActive(entry)))}
              </React.Fragment>
            ))}
          </div>

          <div className="ml-auto flex-shrink-0 flex items-center gap-3 relative z-10">
            {location.pathname !== '/login' && (
              <Link
                to="/login"
                className="hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-full"
              >
                <PremiumButton className="h-12 px-8 rounded-full text-sm font-semibold min-w-[130px]">
                  Sign in
                </PremiumButton>
              </Link>
            )}
            <div className="flex items-center justify-center h-12 w-12 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/5 backdrop-blur-md">
              <ThemeToggle />
            </div>
            <button
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className={cn(
                'lg:hidden flex items-center justify-center w-12 h-12 rounded-full',
                'bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10',
                'border border-white/15 dark:border-white/10',
                'text-slate-700 dark:text-white transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none'
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[145] bg-black/30 backdrop-blur-xl lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 38, mass: 0.8 }}
              className="fixed top-0 left-0 h-full z-[149] lg:hidden w-[85%] max-w-[420px] bg-white/[0.75] dark:bg-slate-950/[0.80] backdrop-blur-3xl border-r border-white/20 dark:border-white/10 rounded-r-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.35)] flex flex-col"
            >
              <div className="flex items-center justify-between px-7 pt-8 pb-6">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-lg"
                >
                  <TicketraBrandMark size="md" />
                  <TicketraWordmark className="text-2xl font-semibold" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mx-7 h-px bg-slate-200/60 dark:bg-white/[0.08]" />
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-7 py-8">
                <ul className="flex flex-col gap-2" role="list">
                  {NAV_LINKS.map((entry) => (
                    <li key={entry.label}>
                      {renderNavLink(
                        entry,
                        mobileLinkClass(isLinkActive(entry)),
                        () => setMobileMenuOpen(false)
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="px-7 pb-10 pt-4 border-t border-slate-200/60 dark:border-white/[0.08]">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-2xl"
                >
                  <PremiumButton className="w-full h-14 rounded-2xl text-[16px]">Sign in</PremiumButton>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const OperationalPreview = () => (
  <div className="relative w-full h-[700px] group">
    <div className="absolute right-[-10%] top-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-slow-pulse" />
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
      className="absolute right-0 top-10 w-full max-w-[100%] h-[600px] bg-white/[0.12] dark:bg-slate-950/[0.4] border border-white/20 dark:border-white/5 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden"
    >
      <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-8 gap-3">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
        </div>
        <div className="mx-auto text-[8px] font-sans font-medium tracking-wide text-slate-400 dark:text-slate-600">
          Ticketra Command Center
        </div>
      </div>
      <div className="flex h-full">
        <div className="w-60 border-r border-white/5 p-8 space-y-6 bg-black/20">
          <div className="h-1 w-10 bg-blue-500/40 rounded" />
          {['Tickets', 'Assignments', 'Approvals', 'Knowledge', 'Analytics'].map((label) => (
            <div key={label} className="flex items-center gap-3 opacity-40">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 p-10 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/10 rounded-xl" />
              <div className="h-2 w-64 bg-white/5 rounded" />
            </div>
            <div className="h-10 w-32 bg-blue-500/20 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
            <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
          </div>
          <div className="h-48 bg-black/20 rounded-[2.5rem] border border-white/5" />
        </div>
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-[10%] top-[20%] z-20"
    >
      <GlassCard className="p-8 w-64 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-sans font-medium tracking-wide text-blue-400">Open tickets</span>
          <Ticket size={14} className="text-blue-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-3xl font-display font-semibold text-slate-900 dark:text-white leading-none">142</h4>
          <p className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400 tracking-wide">Across all queues</p>
        </div>
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[8px] font-sans font-medium text-emerald-400 tracking-wide bg-emerald-500/10 px-2 py-1 rounded">12 resolved today</span>
        </div>
      </GlassCard>
    </motion.div>

    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute left-[35%] bottom-[15%] z-20"
    >
      <GlassCard className="p-8 w-72 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-sans font-medium tracking-wide text-slate-400">SLA compliance</span>
          <Activity size={14} className="text-emerald-400" />
        </div>
        <div className="space-y-4">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} whileInView={{ width: '94%' }} className="h-full bg-emerald-500" />
          </div>
          <p className="text-sm font-sans font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
            94% of priority tickets resolved within SLA this week.
          </p>
        </div>
      </GlassCard>
    </motion.div>
  </div>
);

export const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/50 dark:border-white/5 py-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? 'true' : 'false'}
        className="w-full flex items-center justify-between text-left group focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-lg p-2"
      >
        <span className="text-xl font-display font-semibold tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors">
          {question}
        </span>
        <ChevronDown className={cn('text-slate-500 transition-transform duration-500', isOpen && 'rotate-180 text-blue-500')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-6 px-2 text-sm font-sans font-normal text-slate-650 dark:text-slate-400 leading-relaxed max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductShowcase = ({
  title,
  desc,
  features,
  img,
  reverse = false,
  badge,
  accentWord,
  animationsDisabled,
  ctaPath = '/contact-sales',
}: {
  title: string;
  desc: string;
  features: { title: string; desc: string }[];
  img: string;
  reverse?: boolean;
  badge: string;
  accentWord?: string;
  animationsDisabled?: boolean;
  ctaPath?: string;
}) => (
  <section className="py-[var(--section-spacing)] px-[var(--page-padding)] overflow-hidden">
    <div className={cn('max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16', reverse && 'lg:flex-row-reverse')}>
      <AnimatedContainer direction={reverse ? 'right' : 'left'} animationsDisabled={animationsDisabled} className="flex-1 space-y-12">
        <SectionHeading label={badge} title={title} subtitle={desc} accentWord={accentWord} align="left" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
          {features.map((f) => (
            <div key={f.title} className="space-y-2 group">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform" />
                <span className="text-sm font-sans font-medium text-slate-800 dark:text-slate-200">{f.title}</span>
              </div>
              <p className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <Link to={ctaPath} className="inline-block focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-2xl">
          <Button
            variant="ghost"
            className="h-12 px-8 rounded-2xl border border-slate-200/50 dark:border-white/5 hover:bg-blue-500/5 hover:border-blue-500/30 hover:text-blue-600 transition-all font-sans font-semibold tracking-wide text-sm group focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            Learn more <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform text-blue-600" />
          </Button>
        </Link>
      </AnimatedContainer>
      <AnimatedContainer direction={reverse ? 'left' : 'right'} animationsDisabled={animationsDisabled} className="flex-1 relative w-full">
        <div className="relative group">
          <div className="absolute -inset-20 bg-blue-500/10 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
          <div className="relative rounded-[3.5rem] border border-slate-200/50 dark:border-white/10 overflow-hidden shadow-[var(--shadow-premium)] bg-slate-100 dark:bg-slate-950">
            <img src={img} alt={title} loading="lazy" className="w-full h-[600px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90 pointer-events-none" />
          </div>
        </div>
      </AnimatedContainer>
    </div>
  </section>
);

const TICKET_MODULES = [
  { title: 'Ticket Management', icon: Ticket, color: 'text-blue-600 dark:text-blue-400', path: '/contact-sales' },
  { title: 'Assignments', icon: ClipboardList, color: 'text-indigo-500 dark:text-indigo-400', path: '/contact-sales' },
  { title: 'Approvals', icon: CheckSquare, color: 'text-violet-500 dark:text-violet-400', path: '/contact-sales' },
  { title: 'Knowledge Base', icon: BookOpen, color: 'text-emerald-500 dark:text-emerald-400', path: '/contact-sales' },
  { title: 'SLA Engine', icon: Clock, color: 'text-amber-500 dark:text-amber-400', path: '/enterprise-sla' },
  { title: 'Analytics', icon: BarChart3, color: 'text-rose-500 dark:text-rose-400', path: '/about' },
  { title: 'Notifications', icon: Bell, color: 'text-cyan-500 dark:text-cyan-400', path: '/contact-sales' },
  { title: 'Team Workload', icon: Users, color: 'text-blue-500 dark:text-blue-400', path: '/contact-sales' },
];

export default function Landing() {
  const [animationsDisabled] = useState(false);

  useEffect(() => {
    window.scrollTo?.({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen mesh-bg-light dark:mesh-bg-dark text-slate-900 dark:text-white transition-colors duration-500 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      <div className="grain-overlay" />
      <div className="absolute top-[-5%] left-[5%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 blur-[140px] rounded-full pointer-events-none animate-slow-pulse -z-20" />
      <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/8 blur-[120px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-blue-500/3 dark:bg-blue-500/6 blur-[150px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-8s' }} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content">
        <header className="relative pt-28 md:pt-36 lg:pt-40 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
          <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(37,99,235,0.08),transparent_60%)]" />
          <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.05),transparent_60%)]" />

          <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.35] dark:bg-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-sans font-medium tracking-wide text-slate-700 dark:text-slate-300">
                  Enterprise Ticket Management System
                </span>
              </div>

              <div className="space-y-8">
                <h1 className="font-display font-semibold tracking-[-0.05em] text-[length:var(--font-size-hero)] leading-[0.95] text-slate-900 dark:text-white">
                  Resolve requests <br />
                  <span className="text-blue-600">at enterprise scale.</span>
                </h1>
                <p className="max-w-xl text-2xl text-slate-500 dark:text-slate-400 font-sans font-bold leading-tight tracking-tight">
                  Ticketra unifies ticketing, assignments, approvals, knowledge base, and SLA tracking in one secure service desk platform.
                </p>
                <p className="max-w-xl text-lg text-slate-500 dark:text-slate-400 font-sans font-semibold tracking-tight">
                  Built for IT, HR, and operations teams.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <Link to="/login" className="focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-2xl">
                  <PremiumButton>Get started</PremiumButton>
                </Link>
                <Link to="/contact-sales" className="focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-2xl">
                  <Button variant="ghost" className="h-12 px-8 rounded-2xl border border-slate-200/50 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none">
                    Request a demo
                  </Button>
                </Link>
              </div>
              <p className="font-sans font-medium text-xs text-slate-500 dark:text-slate-400">SOC2 Type II · ISO 27001 · AES-256</p>
            </motion.div>
            <OperationalPreview />
          </div>
        </header>

        <section className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-white/40 dark:bg-black/40 border-y border-slate-200/50 dark:border-white/5 relative overflow-hidden">
          <div className="max-w-[1500px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { label: 'Tickets Resolved', value: 250000, suffix: '+', icon: Ticket },
                { label: 'SLA Compliance', value: 94, suffix: '%', icon: Zap },
                { label: 'Active Teams', value: 1200, suffix: '+', icon: Users },
                { label: 'System Uptime', value: 99.99, suffix: '%', icon: Activity },
              ].map((item, i) => (
                <div aria-live="polite" aria-atomic="true" key={i} className="space-y-2">
                  <p className="font-sans font-medium text-xs text-slate-500 dark:text-slate-600 uppercase tracking-wide">{item.label}</p>
                  <h2 className="font-display font-semibold text-4xl text-slate-900 dark:text-white tracking-tight">
                    <Counter value={item.value} />
                    <span className="text-blue-600">{item.suffix}</span>
                  </h2>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="features">
          <ProductShowcase
            badge="Service Desk"
            title="Centralized ticket operations."
            accentWord="ticket"
            desc="Capture, route, and resolve service requests with priority-based queues, rich context, and full audit history."
            img="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=2070"
            features={[
              { title: 'Smart routing', desc: 'Auto-assign tickets by category, priority, and team capacity.' },
              { title: 'Unified inbox', desc: 'One workspace for agents, managers, and requesters.' },
            ]}
            animationsDisabled={animationsDisabled}
          />
          <ProductShowcase
            badge="SLA & Assignments"
            title="Meet every deadline."
            accentWord="deadline"
            desc="Track response and resolution SLAs, escalate breaches automatically, and balance workload across teams."
            img="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2026"
            reverse
            features={[
              { title: 'SLA policies', desc: 'Configurable targets by priority, category, and business hours.' },
              { title: 'Workload views', desc: 'See team capacity and reassign before bottlenecks form.' },
            ]}
            ctaPath="/enterprise-sla"
            animationsDisabled={animationsDisabled}
          />
          <ProductShowcase
            badge="Knowledge & Approvals"
            title="Deflect tickets before they arrive."
            accentWord="Deflect"
            desc="Publish self-service articles, collect approvals in-line, and reduce repeat requests with searchable knowledge."
            img="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=2070"
            features={[
              { title: 'Knowledge base', desc: 'Articles linked to ticket categories and search suggestions.' },
              { title: 'Approval workflows', desc: 'Multi-step approvals without leaving the ticket context.' },
            ]}
            animationsDisabled={animationsDisabled}
          />
        </div>

        <section id="solutions" className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-slate-50/50 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-white/5">
          <div className="max-w-[1500px] mx-auto space-y-24">
            <SectionHeading
              label="Platform modules"
              title="Everything your service desk needs."
              subtitle="Modular capabilities that scale from a single team to enterprise-wide operations."
              accentWord="service desk"
              align="left"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TICKET_MODULES.map((mod, i) => (
                <AnimatedContainer key={mod.title} direction="up" delay={i * 0.05} animationsDisabled={animationsDisabled}>
                  <Link to={mod.path} className="block h-full focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-[var(--radius-card)]">
                    <GlassCard className="p-8 transition-all duration-500 group flex flex-col justify-between h-full border border-slate-200/50 dark:border-white/5 hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(37,99,235,0.08)]">
                      <div>
                        <div className={cn('w-12 h-12 rounded-2xl bg-slate-100/80 dark:bg-white/5 border flex items-center justify-center mb-6 group-hover:bg-blue-500/10 transition-all', mod.color)}>
                          <mod.icon size={22} />
                        </div>
                        <h4 className="font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white mb-2">{mod.title}</h4>
                        <p className="font-sans font-normal text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Enterprise-grade module with role-based access and audit trails.
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-white/50 dark:bg-black border-y border-slate-200/50 dark:border-white/5">
          <div className="max-w-4xl mx-auto space-y-24">
            <SectionHeading label="Support" title="Frequently asked questions" align="center" />
            <GlassCard className="p-8 md:p-12 border border-slate-200/50 dark:border-white/5">
              <div className="divide-y divide-slate-200/50 dark:divide-white/5 -my-8">
                {[
                  {
                    q: 'What types of requests can Ticketra handle?',
                    a: 'IT incidents, HR requests, facilities issues, access requests, and custom categories configured for your organization.',
                  },
                  {
                    q: 'How does SLA tracking work?',
                    a: 'Define response and resolution targets by priority and category. Ticketra monitors deadlines, sends alerts, and escalates breaches automatically.',
                  },
                  {
                    q: 'Can we integrate with existing tools?',
                    a: 'Yes. Ticketra exposes REST APIs and webhooks for identity providers, chat tools, monitoring systems, and HR platforms.',
                  },
                  {
                    q: 'Is role-based access supported?',
                    a: 'Agents, managers, and admins each see scoped queues and actions. All changes are logged for compliance and audit.',
                  },
                  {
                    q: 'What support options are available?',
                    a: 'Standard and enterprise support tiers with documented SLAs, onboarding assistance, and dedicated success managers.',
                  },
                ].map((item, i) => (
                  <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="py-[var(--section-spacing)] px-[var(--page-padding)]">
          <div className="max-w-[1300px] mx-auto rounded-[var(--radius-card)] bg-white/[0.22] dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-16 md:p-24 text-center border border-white/30 dark:border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-premium">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 space-y-12">
              <h2 className="font-display font-semibold tracking-[-0.05em] text-[length:var(--font-size-hero)] leading-[0.95] text-slate-900 dark:text-white">
                Ready to modernize <br />
                <span className="text-blue-600">your service desk?</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/login" className="focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-2xl focus-visible:outline-none">
                  <PremiumButton>Get started</PremiumButton>
                </Link>
                <Link to="/contact-sales" className="focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none rounded-2xl">
                  <Button variant="ghost" className="h-12 px-8 rounded-2xl border border-slate-200 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none">
                    Talk to sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <TicketraLandingFooter />
      </main>
    </div>
  );
}
