import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Calendar,
  BarChart3,
  FileText,
  CreditCard,
  Calculator,
  BookOpen,
  Database,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Cpu,
  ChevronDown,
  CheckCircle2,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  Trophy,
  LayoutDashboard,
  Clock,
  UserCheck,
  TrendingUp,
  Activity,
  Shield,
  ZapOff,
  MousePointer2,
  ShieldAlert,
  Search,
  Briefcase,
  Target,
  ClipboardList,
  Layers,
  Network,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import SectionHeading from '@/components/landing/SectionHeading';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';
import ThemeToggle from '@/components/auth/ThemeToggle';

const MegaMenu = React.lazy(() => import('@/components/layout/MegaMenu').then(m => ({ default: m.MegaMenu })));

// --- Animated Counter ---
const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

// --- Navbar (Enterprise Grade) ---
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Workforce', 'Payroll', 'Intelligence', 'Governance', 'Projects', 'Operations'];

  return (
    <>
      <nav
        onMouseLeave={() => setActiveCategory(null)}
        className={cn(
          "fixed top-0 left-0 right-0 z-[150] transition-all duration-700 px-6 py-4",
          isScrolled || activeCategory
            ? "bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 py-3"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link
              to="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg"
            >
              <img src="/logo.png" alt="YVI People logo" loading="lazy" className="w-10 h-10 object-contain rounded-xl brightness-110" />
              <span className="font-display font-semibold text-2xl tracking-tight text-slate-900 dark:text-white">
                YVI <span className="text-orange-500">People</span>
              </span>
            </Link>

            {/* Desktop Nav with Mega Menu Triggers */}
            <div className="hidden lg:flex items-center gap-8 font-sans">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onMouseEnter={() => setActiveCategory(link)}
                  className={cn(
                    "text-xs font-medium tracking-wide transition-all duration-300 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded",
                    activeCategory === link
                      ? "text-orange-500"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded"
            >
              <span className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors cursor-pointer">
                Sign in
              </span>
            </Link>
            <ThemeToggle />
            <Link to="/login" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-2xl">
              <PremiumButton>
                Get Started
              </PremiumButton>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden text-slate-700 dark:text-white focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[60px] left-0 right-0 z-[140] overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 lg:hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-sm font-medium tracking-wide text-slate-700 dark:text-slate-300 hover:text-orange-500 transition-colors py-2 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
                >
                  {link}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 flex flex-col gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none">
                  Sign in
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded-2xl">
                  <PremiumButton className="w-full focus-visible:ring-2 focus-visible:ring-orange-500/50">Get Started</PremiumButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <MegaMenu
          isOpen={!!activeCategory}
          onClose={() => setActiveCategory(null)}
          activeCategory={activeCategory}
        />
      </Suspense>
    </>
  );
};

// --- Operational Preview Engine ---
const OperationalPreview = () => {
  return (
    <div className="relative w-full h-[700px] group">
      {/* Ambient glow underneath the dashboard */}
      <div className="absolute right-[-10%] top-0 w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10 animate-slow-pulse" />

      {/* Main Dashboard Surface */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
        className="absolute right-0 top-10 w-full max-w-[100%] h-[600px] bg-white/[0.12] dark:bg-slate-950/[0.4] border border-white/20 dark:border-white/5 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-8 gap-3">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          <div className="mx-auto text-[8px] font-sans font-medium tracking-wide text-slate-400 dark:text-slate-600">Enterprise intelligence nexus</div>
        </div>

        <div className="flex h-full">
          <div className="w-60 border-r border-white/5 p-8 space-y-6 bg-black/20">
            <div className="h-1 w-10 bg-orange-500/40 rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 opacity-30">
                <div className="w-4 h-4 bg-white/10 rounded" />
                <div className="h-1 flex-1 bg-white/5 rounded" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-10 space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-white/10 rounded-xl" />
                <div className="h-2 w-64 bg-white/5 rounded" />
              </div>
              <div className="h-10 w-32 bg-orange-500/20 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
              <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
            </div>
            <div className="h-48 bg-black/20 rounded-[2.5rem] border border-white/5" />
          </div>
        </div>
      </motion.div>

      {/* Floating KPI Card 1 */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[10%] top-[20%] z-20"
      >
        <div className="bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] absolute inset-0 -z-10" />
        <GlassCard className="p-8 w-64 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-sans font-medium tracking-wide text-orange-400">Payroll cycle</span>
            <Activity size={14} className="text-orange-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-display font-semibold text-slate-900 dark:text-white leading-none">₹12.4M</h4>
            <p className="text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400 tracking-wide">Active disbursement</p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[8px] font-sans font-medium text-emerald-400 tracking-wide bg-emerald-500/10 px-2 py-1 rounded">99.9% accuracy</span>
            <span className="text-[8px] font-sans font-medium text-slate-500 tracking-wide">v8.4.2</span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Floating KPI Card 2 */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute left-[35%] bottom-[15%] z-20"
      >
        <GlassCard className="p-8 w-72 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-sans font-medium tracking-wide text-slate-400">AI forecasting</span>
            <Sparkles size={14} className="text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '74%' }}
                className="h-full bg-blue-500"
              />
            </div>
            <p className="text-sm font-sans font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
              High-velocity attrition signal detected in Engineering Hub.
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// --- FAQ Item Component ---
export const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/50 dark:border-white/5 py-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? "true" : "false"}
        className="w-full flex items-center justify-between text-left group focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded-lg p-2"
      >
        <span className="text-xl font-display font-semibold tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">{question}</span>
        <ChevronDown className={cn("text-slate-500 transition-transform duration-500", isOpen && "rotate-180 text-orange-400")} />
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

// --- Product Showcase Section ---
const ProductShowcase = ({ title, desc, features, img, reverse = false, badge, icon: Icon, accentWord, animationsDisabled }: any) => {
  return (
    <section className="py-[var(--section-spacing)] px-[var(--page-padding)] overflow-hidden">
      <div className={cn("max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16", reverse && "lg:flex-row-reverse")}>
        <AnimatedContainer
          direction={reverse ? "right" : "left"}
          animationsDisabled={animationsDisabled}
          className="flex-1 space-y-12"
        >
          <div className="space-y-6">
            <SectionHeading
              label={badge}
              title={title}
              subtitle={desc}
              accentWord={accentWord}
              align="left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            {features.map((f: any) => (
              <div key={f.title} className="space-y-2 group">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
                  <span className="text-sm font-sans font-medium text-slate-800 dark:text-slate-200">{f.title}</span>
                </div>
                <p className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Button
              variant="ghost"
              className="h-12 px-8 rounded-2xl border border-slate-200/50 dark:border-white/5 hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-500 transition-all font-sans font-semibold tracking-wide text-sm group focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
            >
              Explore Architecture <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform text-orange-500" />
            </Button>
          </div>
        </AnimatedContainer>

        <AnimatedContainer
          direction={reverse ? "left" : "right"}
          animationsDisabled={animationsDisabled}
          className="flex-1 relative w-full"
        >
          <div className="relative group">
            <div className="absolute -inset-20 bg-orange-500/10 dark:bg-orange-500/15 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-slow-pulse pointer-events-none" />
            <div className="relative rounded-[3.5rem] border border-slate-200/50 dark:border-white/10 overflow-hidden shadow-[var(--shadow-premium)] dark:shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] bg-slate-100 dark:bg-slate-950">
              <div className="bg-slate-150 dark:bg-slate-800 animate-pulse w-full h-[600px] absolute inset-0 -z-10" />
              <img
                src={img}
                alt={title}
                loading="lazy"
                className="w-full h-[600px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 dark:from-black via-transparent to-transparent opacity-90 pointer-events-none" />

              {/* Floating Dashboard Overlay */}
              <div className="absolute inset-10 flex flex-col justify-end pointer-events-none">
                <GlassCard className="p-8 w-80 space-y-4 pointer-events-auto hover:-translate-y-2 transition-transform duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                  <div className="h-1.5 w-12 bg-orange-500/40 rounded" />
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                  <div className="h-2 w-3/4 bg-white/5 rounded" />
                </GlassCard>
              </div>
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
};

export default function Landing() {
  const [animationsDisabled, setAnimationsDisabled] = useState(false);

  return (
    <div className="min-h-screen mesh-bg-light dark:mesh-bg-dark text-slate-900 dark:text-white transition-colors duration-500 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden relative">
      {/* Cinematic film grain noise texture layer */}
      <div className="grain-overlay" />

      {/* Layered Cinematic Breathing Ambient Lights */}
      <div className="absolute top-[-5%] left-[5%] w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 blur-[140px] rounded-full pointer-events-none animate-slow-pulse -z-20" />
      <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/8 blur-[120px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-orange-500/3 dark:bg-orange-500/6 blur-[150px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-8s' }} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/50"
      >
        Skip to main content
      </a>
      <Navbar />

      <main id="main-content">

        {/* Rebalanced Hero Section */}
        <header className="relative pt-28 md:pt-36 lg:pt-40 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
          <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(234,88,12,0.08),transparent_60%)]" />
          <div className="absolute pointer-events-none inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05),transparent_60%)]" />

          <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10 w-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
              className="space-y-12"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.35] dark:bg-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-sans font-medium tracking-wide text-slate-700 dark:text-slate-300">Unified enterprise workforce OS</span>
              </div>

              <div className="space-y-8">
                <h1 className="font-display font-semibold tracking-[-0.05em] md:tracking-[-0.06em] text-[length:var(--font-size-hero)] leading-[0.95] text-slate-900 dark:text-white">
                  Workforce <br />
                  <span className="text-orange-500">intelligence.</span>
                </h1>
                <p className="max-w-xl text-2xl text-slate-400 font-sans font-bold leading-tight tracking-tight">
                  Orchestrate global human capital with a premium, AI-native operating system. Built for institutional scale and operational precision.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <Link to="/login" className="focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded-2xl">
                  <PremiumButton className="focus-visible:ring-2 focus-visible:ring-orange-500/50">
                    Establish access
                  </PremiumButton>
                </Link>
                <p className="font-sans font-medium text-xs text-slate-500 dark:text-slate-400">SOC2 Type II · ISO 27001 · AES-256</p>
              </div>
            </motion.div>

            <OperationalPreview />
          </div>
        </header>

        {/* Live Operational Pulse (Data Strip) */}
        <section className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-white/40 dark:bg-black/40 border-y border-slate-200/50 dark:border-white/5 relative overflow-hidden">
          <div className="max-w-[1500px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { label: 'Workforce Managed', value: 50000, suffix: '+', icon: Users },
                { label: 'Payroll Accuracy', value: 99.9, suffix: '%', icon: Zap },
                { label: 'Governance Logs', value: 1200000, suffix: '+', icon: Database },
                { label: 'System Uptime', value: 99.99, suffix: '%', icon: Activity },
              ].map((item, i) => (
                <div aria-live="polite" aria-atomic="true" key={i} className="space-y-2">
                  <p className="font-sans font-medium text-xs text-slate-500 dark:text-slate-600 uppercase tracking-wide">{item.label}</p>
                  <div className="flex items-baseline gap-1 font-display">
                    <h2 className="font-display font-semibold text-4xl text-slate-900 dark:text-white tracking-tight">
                      <Counter value={item.value as any} />
                      <span className="text-orange-500">{item.suffix}</span>
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Alternating Feature Sections (Operational Storytelling) */}
        <ProductShowcase
          badge="Payroll Intelligence"
          icon={CreditCard}
          title="Unified Capital Flows."
          accentWord="Capital"
          desc="Zero-latency disbursements across international jurisdictions with autonomous tax governance."
          img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
          features={[
            { title: 'Statutory Core', desc: 'Auto-localized tax schemas for 120+ regions.' },
            { title: 'Nexus Disbursement', desc: 'Near-instant bank transfers via unified API.' }
          ]}
          animationsDisabled={animationsDisabled}
        />

        <ProductShowcase
          badge="Workforce Governance"
          icon={ShieldCheck}
          title="Institutional Security Core."
          accentWord="Security"
          desc="Operating at the apex of enterprise compliance with immutable audit trails and advanced RBAC."
          img="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070"
          reverse
          features={[
            { title: 'Audit Immortality', desc: 'Every operation timestamped on secure ledger.' },
            { title: 'Governance AI', desc: 'Autonomous risk detection and policy enforcement.' }
          ]}
          animationsDisabled={animationsDisabled}
        />

        <ProductShowcase
          badge="Predictive Analytics"
          icon={TrendingUp}
          title="Forecast Human Capital."
          accentWord="Human"
          desc="Deep-learning insights into organizational health, performance clusters, and strategic growth opportunities."
          img="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2026"
          features={[
            { title: 'Churn Prediction', desc: 'Identify high-risk attrition signals before they trigger.' },
            { title: 'Performance Matrix', desc: 'Visualise top-tier contribution clusters in real-time.' }
          ]}
          animationsDisabled={animationsDisabled}
        />

        {/* Enterprise Module Ecosystem (The Grid) */}
        <section id="solutions" className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-slate-50/50 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-white/5">
          <div className="max-w-[1500px] mx-auto space-y-24">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
              <SectionHeading
                label="Ecosystem Architecture"
                title="A Unified Enterprise Node."
                subtitle="One integrated operating system to manage the entire lifecycle of your global enterprise."
                accentWord="Enterprise"
                align="left"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Payroll Nexus', icon: CreditCard, color: 'text-blue-500 dark:text-blue-400' },
                { title: 'Workforce Core', icon: Users, color: 'text-orange-500 dark:text-orange-400' },
                { title: 'Intelligence Hub', icon: BarChart3, color: 'text-rose-500 dark:text-rose-400' },
                { title: 'Governance AI', icon: Sparkles, color: 'text-amber-500 dark:text-amber-400' },
                { title: 'Attendance Sync', icon: Clock, color: 'text-indigo-500 dark:text-indigo-400' },
                { title: 'Project Nexus', icon: Target, color: 'text-emerald-500 dark:text-emerald-400' },
                { title: 'Recruitment Intel', icon: Search, color: 'text-orange-500 dark:text-orange-400' },
                { title: 'Performance Matrix', icon: Activity, color: 'text-purple-500 dark:text-purple-400' },
              ].map((mod, i) => (
                <AnimatedContainer
                  key={i}
                  direction="up"
                  delay={i * 0.05}
                  animationsDisabled={animationsDisabled}
                >
                  <GlassCard className="p-8 transition-all duration-500 group flex flex-col justify-between h-full border border-slate-200/50 dark:border-white/5 shadow-soft hover:shadow-[0_20px_60px_rgba(234,88,12,0.06)] dark:hover:shadow-[0_20px_60px_rgba(234,88,12,0.12)] hover:border-orange-500/30 hover:-translate-y-3 hover:scale-[1.01] overflow-hidden relative">
                    {/* Ambient background glow inside the card on hover */}
                    <div className="absolute -inset-10 bg-orange-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10">
                      <div className={cn("w-12 h-12 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/20 group-hover:border-orange-500/20 transition-all duration-500", mod.color)}>
                        <mod.icon size={22} className="transition-transform duration-500 group-hover:rotate-3" />
                      </div>
                      <h4 className="font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white mb-2">{mod.title}</h4>
                      <p className="font-sans font-normal text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Operational enterprise grade module with AI-powered automation.
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 relative z-10">
                      <span className="text-xs font-sans font-medium text-orange-400/60 group-hover:text-orange-400 transition-colors">Operational active</span>
                    </div>
                  </GlassCard>
                </AnimatedContainer>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ & Support */}
        <section className="py-[var(--section-spacing)] px-[var(--page-padding)] bg-white/50 dark:bg-black border-y border-slate-200/50 dark:border-white/5 relative">
          <div className="max-w-4xl mx-auto space-y-24">
            <SectionHeading
              label="Operational Support"
              title="Common Protocols"
              align="center"
            />
            <GlassCard className="p-8 md:p-12 border border-slate-200/50 dark:border-white/5 shadow-soft dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <div className="divide-y divide-slate-200/50 dark:divide-white/5 -my-8">
                {[
                  { q: 'How does the EMS handle multi-region compliance?', a: 'The platform integrates a dynamic governance engine that automatically updates localized tax schemas and labor protocols based on the entity jurisdiction.' },
                  { q: 'What is the security standard for data transit?', a: 'All data is encrypted via TLS 1.3 in transit and AES-256 at rest, with SOC2 Type II and ISO 27001 certified data center infrastructure.' },
                  { q: 'How does the payroll automation engine work?', a: 'Our high-precision payroll nexus evaluates gross-to-net calculations dynamically, executes micro-audits, and dispatches direct deposits instantly.' },
                  { q: 'Can the platform integrate with existing HR systems?', a: 'Yes, YVI People offers extensive enterprise-grade REST APIs and webhooks that synchronize effortlessly with Workday, SAP, and other major platforms.' },
                  { q: 'What support and SLA guarantees are available?', a: 'We offer round-the-clock premium technical support with guaranteed 15-minute response times for critical incidents under our Enterprise SLA.' }
                ].map((item, i) => (
                  <FAQItem key={i} question={item.q} answer={item.a} />
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-[var(--section-spacing)] px-[var(--page-padding)]">
          <div className="max-w-[1300px] mx-auto rounded-[var(--radius-card)] bg-white/[0.22] dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-16 md:p-24 text-center border border-white/30 dark:border-white/10 backdrop-blur-2xl relative overflow-hidden shadow-premium before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/15 dark:before:from-white/5 before:to-transparent before:opacity-30 before:pointer-events-none after:absolute after:inset-px after:rounded-[var(--radius-card)] after:border after:border-white/10 dark:after:border-white/5 after:pointer-events-none group hover:shadow-[0_40px_120px_rgba(234,88,12,0.12)] transition-shadow duration-700">
            {/* Cinematic Ambient Glow inside the card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/15 blur-[120px] rounded-full pointer-events-none animate-slow-pulse" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(234,88,12,0.12),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 space-y-12">
              <h2 className="font-display font-semibold tracking-[-0.05em] md:tracking-[-0.06em] text-[length:var(--font-size-hero)] leading-[0.95] text-slate-900 dark:text-white">
                Architect your <br />
                <span className="text-orange-500">Enterprise Node.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 font-sans">
                <Link to="/login" className="focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-2xl focus-visible:outline-none">
                  <PremiumButton>
                    Establish access
                  </PremiumButton>
                </Link>
                <Button
                  variant="ghost"
                  className="h-12 px-8 rounded-2xl text-slate-700 dark:text-white font-sans font-semibold tracking-wide text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
                >
                  View documentation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-[var(--page-padding)] bg-white/30 dark:bg-black border-t border-slate-200/50 dark:border-white/5 font-sans relative z-10">
          <div className="max-w-[1500px] mx-auto space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-12 md:gap-20">
              <div className="md:col-span-2 space-y-6">
                <Link to="/" className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg max-w-max">
                  <img src="/logo.png" alt="YVI People enterprise logo" loading="lazy" className="w-10 h-10 object-contain brightness-110" />
                  <span className="font-display font-semibold text-2xl tracking-tight text-slate-900 dark:text-white">YVI <span className="text-orange-550 dark:text-orange-400">People</span></span>
                </Link>
                <p className="font-sans font-normal text-sm text-slate-500 leading-relaxed max-w-sm">
                  The world's most advanced autonomous enterprise operating system. Orchestrating global human capital with operational precision.
                </p>
                {/* Premium Trust Certification Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['SOC2 Type II', 'ISO 27001', 'AES-256', 'HIPAA'].map((t) => (
                    <span key={t} className="text-[9px] font-sans font-semibold px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {[
                {
                  title: 'Nexus',
                  links: ['Core Intelligence', 'Governance Hub', 'Audit Console', 'System Status']
                },
                {
                  title: 'Governance',
                  links: ['Compliance Engine', 'Risk Assessment', 'Regional Tax', 'RBAC Registry']
                },
                {
                  title: 'Company',
                  links: ['About Us', 'Enterprise SLA', 'Security Standards', 'Contact Sales']
                },
                {
                  title: 'Intelligence',
                  links: ['Attritions AI', 'Payroll Forecasts', 'Growth Analytics', 'Performance Core']
                }
              ].map((cat) => (
                <div key={cat.title}>
                  <h4 className="font-sans font-semibold text-xs tracking-wide text-slate-400 dark:text-slate-500 mb-6">{cat.title}</h4>
                  <ul className="space-y-4 font-sans font-normal text-sm">
                    {cat.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-6 font-sans font-normal text-sm text-slate-400">
                <a href="#" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Privacy policy</a>
                <a href="#" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Terms of service</a>
                <a href="#" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Security</a>
              </div>

              <div className="flex items-center gap-4">
                {[
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                  { icon: Twitter, label: 'Twitter/X', href: 'https://twitter.com' },
                  { icon: Github, label: 'GitHub', href: 'https://github.com' }
                ].map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    aria-label={soc.label}
                    className="text-slate-400 hover:text-orange-500 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                  >
                    <soc.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
