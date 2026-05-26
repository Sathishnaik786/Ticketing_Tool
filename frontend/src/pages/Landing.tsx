import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
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
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EnterpriseCard, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';
import { MegaMenu } from '@/components/layout/MegaMenu';

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
const Navbar = () => {
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
          isScrolled || activeCategory ? "bg-slate-950/90 backdrop-blur-2xl border-b border-white/5 py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-xl brightness-110" />
              <div className="flex flex-col -space-y-1">
                <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">YVI <span className="text-teal-400">EMS</span></span>
                <span className="text-[8px] font-sans font-black uppercase tracking-[0.4em] text-teal-500/60 ml-0.5">Enterprise OS</span>
              </div>
            </Link>

            {/* Desktop Nav with Mega Menu Triggers */}
            <div className="hidden lg:flex items-center gap-8 font-sans">
              {navLinks.map((link) => (
                <button 
                  key={link} 
                  onMouseEnter={() => setActiveCategory(link)}
                  className={cn(
                    "text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-300 py-4",
                    activeCategory === link ? "text-teal-400" : "text-slate-400 hover:text-slate-200"
                  )}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden sm:block">
              <span className="text-[10px] font-sans font-black uppercase tracking-[0.25em] text-slate-400 hover:text-white transition-colors cursor-pointer">Terminal Access</span>
            </Link>
            <Link to="/login">
              <Button className="h-12 px-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-sans font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(20,184,166,0.2)] transition-all duration-500 group">
                Enter Platform <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </nav>

      <MegaMenu 
        isOpen={!!activeCategory} 
        onClose={() => setActiveCategory(null)} 
        activeCategory={activeCategory} 
      />
    </>
  );
};

// --- Operational Preview Engine ---
const OperationalPreview = () => {
  return (
    <div className="relative w-full h-[700px] group">
       {/* Main Dashboard Surface */}
       <motion.div 
         initial={{ opacity: 0, x: 40 }}
         whileInView={{ opacity: 1, x: 0 }}
         transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
         className="absolute right-0 top-10 w-[110%] h-[600px] bg-slate-900/40 rounded-[3.5rem] border border-white/10 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] backdrop-blur-3xl overflow-hidden"
       >
          <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-8 gap-3">
             <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500/20 border border-teal-500/40" />
             </div>
             <div className="mx-auto text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">Enterprise Intelligence Nexus</div>
          </div>
          
          <div className="flex h-full">
             <div className="w-60 border-r border-white/5 p-8 space-y-6 bg-black/20">
                <div className="h-1 w-10 bg-teal-500/40 rounded" />
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
                   <div className="h-10 w-32 bg-teal-500/20 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
                   <div className="h-32 bg-white/[0.03] rounded-3xl border border-white/5" />
                </div>
                <div className="h-48 bg-black/20 rounded-[2.5rem] border border-white/5" />
             </div>
          </div>
       </motion.div>

       {/* Floating KPI Cards */}
       <motion.div 
         animate={{ y: [0, -20, 0] }}
         transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
         className="absolute left-[10%] top-[20%] z-20"
       >
          <div className="glass-panel-teal p-8 w-64 space-y-4 shadow-2xl">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400">Payroll Cycle</span>
                <Activity size={14} className="text-teal-500" />
             </div>
             <div className="space-y-1">
                <h4 className="text-3xl font-display font-black text-white leading-none">₹12.4M</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Disbursement</p>
             </div>
             <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">99.9% Accuracy</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">v8.4.2</span>
             </div>
          </div>
       </motion.div>

       <motion.div 
         animate={{ y: [0, 20, 0] }}
         transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
         className="absolute left-[35%] bottom-[15%] z-20"
       >
          <div className="glass-panel p-8 w-72 space-y-6 bg-slate-900/90 border-white/10 shadow-2xl">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">AI Forecasting</span>
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
                <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-tight">
                  High-velocity attrition signal detected in Engineering Hub.
                </p>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

// --- FAQ Item Component ---
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-xl font-display font-black uppercase tracking-tight text-slate-200 group-hover:text-teal-400 transition-colors">{question}</span>
        <ChevronDown className={cn("text-slate-500 transition-transform duration-500", isOpen && "rotate-180 text-teal-400")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-6 text-[13px] font-sans font-bold text-slate-500 leading-relaxed uppercase tracking-wider max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Product Showcase Section ---
const ProductShowcase = ({ title, desc, features, img, reverse = false, badge, icon: Icon }: any) => {
  return (
    <section className="py-40 px-6 overflow-hidden">
       <div className={cn("max-w-[1500px] mx-auto flex flex-col lg:flex-row items-center gap-32", reverse && "lg:flex-row-reverse")}>
          <motion.div 
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
            className="flex-1 space-y-12"
          >
             <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-sans font-black uppercase tracking-[0.4em] border border-teal-500/20">
                   <Icon size={14} />
                   {badge}
                </div>
                <h2 className="text-7xl font-display font-black tracking-tighter uppercase leading-[0.85] text-white">
                   {title}
                </h2>
                <p className="text-2xl text-slate-400 font-sans font-bold leading-relaxed tracking-tight max-w-xl">
                   {desc}
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                {features.map((f: any) => (
                  <div key={f.title} className="space-y-2 group">
                     <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 group-hover:scale-150 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-200">{f.title}</span>
                     </div>
                     <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">{f.desc}</p>
                  </div>
                ))}
             </div>

             <div className="pt-6">
                <Button variant="ghost" className="h-16 px-10 rounded-2xl border border-white/5 hover:bg-white/5 font-sans font-black uppercase tracking-widest text-[10px] group text-white">
                   Explore Architecture <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.2, 0, 0, 1] }}
            className="flex-1 relative w-full"
          >
             <div className="relative group">
                <div className="absolute -inset-20 bg-teal-500/10 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative rounded-[3.5rem] border border-white/10 overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] bg-slate-950">
                   <img src={img} alt={title} className="w-full h-[600px] object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                   
                   {/* Floating Dashboard Overlay */}
                   <div className="absolute inset-10 flex flex-col justify-end pointer-events-none">
                      <div className="glass-panel p-8 w-80 space-y-4">
                         <div className="h-1.5 w-12 bg-teal-500/40 rounded" />
                         <div className="h-10 w-full bg-white/10 rounded-xl" />
                         <div className="h-2 w-3/4 bg-white/5 rounded" />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
       </div>
    </section>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen mesh-bg-dark text-white font-sans selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      <Navbar />

      {/* Rebalanced Hero Section */}
      <header className="relative pt-60 pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_-20%,rgba(20,184,166,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 text-teal-400 text-[10px] font-sans font-black uppercase tracking-[0.4em] border border-white/10 backdrop-blur-md shadow-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Unified Enterprise Workforce OS
            </div>
            
            <div className="space-y-8">
               <h1 className="font-display font-black tracking-tighter text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.85] uppercase text-white">
                  Workforce <br />
                  <span className="text-gradient-teal">Intelligence.</span>
               </h1>
               <p className="max-w-xl text-2xl text-slate-400 font-sans font-bold leading-tight tracking-tight">
                  Orchestrate global human capital with a premium, AI-native operating system. Built for institutional scale and operational precision.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <Link to="/login">
                <Button size="lg" className="h-20 px-14 rounded-2xl bg-white text-slate-950 hover:bg-teal-400 hover:text-slate-950 font-sans font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(255,255,255,0.1)] group transition-all duration-700">
                  Enter Nexus <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-500" />
                </Button>
              </Link>
              <div className="flex flex-col items-start gap-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Standard</p>
                 <div className="flex items-center gap-4 grayscale opacity-40">
                    <span className="text-[10px] font-black uppercase">SOC2 TYPE II</span>
                    <span className="text-[10px] font-black uppercase">ISO 27001</span>
                 </div>
              </div>
            </div>
          </motion.div>

          <OperationalPreview />
        </div>
      </header>

      {/* Live Operational Pulse (Data Strip) */}
      <section className="py-20 border-y border-white/5 bg-black/40 relative overflow-hidden">
         <div className="max-w-[1500px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                 { label: 'Workforce Managed', value: 50000, suffix: '+', icon: Users },
                 { label: 'Payroll Accuracy', value: 99.9, suffix: '%', icon: Zap },
                 { label: 'Governance Logs', value: 1200000, suffix: '+', icon: Database },
                 { label: 'System Uptime', value: 99.99, suffix: '%', icon: Activity },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">{item.label}</p>
                    <div className="flex items-baseline gap-1 font-display">
                       <h2 className="text-4xl font-black text-white tracking-tighter">
                          <Counter value={item.value as any} />
                          <span className="text-teal-500">{item.suffix}</span>
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
        title={<>Unified <span className="text-teal-500">Capital</span> Flows.</>}
        desc="Zero-latency disbursements across international jurisdictions with autonomous tax governance."
        img="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
        features={[
          { title: 'Statutory Core', desc: 'Auto-localized tax schemas for 120+ regions.' },
          { title: 'Nexus Disbursement', desc: 'Near-instant bank transfers via unified API.' }
        ]}
      />

      <ProductShowcase 
        badge="Workforce Governance"
        icon={ShieldCheck}
        title={<>Institutional <span className="text-teal-500">Security</span> Core.</>}
        desc="Operating at the apex of enterprise compliance with immutable audit trails and advanced RBAC."
        img="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=2070"
        reverse
        features={[
          { title: 'Audit Immortality', desc: 'Every operation timestamped on secure ledger.' },
          { title: 'Governance AI', desc: 'Autonomous risk detection and policy enforcement.' }
        ]}
      />

      <ProductShowcase 
        badge="Predictive Analytics"
        icon={TrendingUp}
        title={<>Forecast <span className="text-teal-500">Human</span> Capital.</>}
        desc="Deep-learning insights into organizational health, performance clusters, and strategic growth opportunities."
        img="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2026"
        features={[
          { title: 'Churn Prediction', desc: 'Identify high-risk attrition signals before they trigger.' },
          { title: 'Performance Matrix', desc: 'Visualise top-tier contribution clusters in real-time.' }
        ]}
      />

      {/* Enterprise Module Ecosystem (The Grid) */}
      <section id="solutions" className="py-40 px-6 bg-slate-950/50">
         <div className="max-w-[1500px] mx-auto space-y-32">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
               <div className="space-y-6">
                  <span className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-teal-500">Ecosystem Architecture</span>
                  <h2 className="text-7xl font-display font-black tracking-tighter uppercase leading-[0.85] text-white">
                     A Unified <br />
                     <span className="text-teal-500">Enterprise Node.</span>
                  </h2>
               </div>
               <p className="max-w-xl text-xl text-slate-500 font-bold leading-relaxed uppercase tracking-tight">
                  One integrated operating system to manage the entire lifecycle of your global enterprise.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: 'Payroll Nexus', icon: CreditCard, color: 'text-blue-400' },
                 { title: 'Workforce Core', icon: Users, color: 'text-teal-400' },
                 { title: 'Intelligence Hub', icon: BarChart3, color: 'text-rose-400' },
                 { title: 'Governance AI', icon: Sparkles, color: 'text-amber-400' },
                 { title: 'Attendance Sync', icon: Clock, color: 'text-indigo-400' },
                 { title: 'Project Nexus', icon: Target, color: 'text-emerald-400' },
                 { title: 'Recruitment Intel', icon: Search, color: 'text-orange-400' },
                 { title: 'Performance Matrix', icon: Activity, color: 'text-purple-400' },
               ].map((mod, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="p-10 rounded-[3rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                 >
                    <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", mod.color)}>
                       <mod.icon size={28} />
                    </div>
                    <h4 className="text-xl font-display font-black uppercase tracking-tighter text-white mb-2">{mod.title}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                       Operational enterprise grade module with AI-powered automation.
                    </p>
                    <div className="mt-8 pt-6 border-t border-white/5">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-400/60 group-hover:text-teal-400 transition-colors">Operational Active</span>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ & Support */}
      <section className="py-40 px-6 bg-black relative">
         <div className="max-w-4xl mx-auto space-y-24">
            <div className="text-center space-y-4">
               <span className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-teal-500">Operational Support</span>
               <h2 className="text-6xl font-display font-black tracking-tighter uppercase text-white">Common Protocols</h2>
            </div>
            <div className="space-y-6">
               {[
                 { q: 'How does the EMS handle multi-region compliance?', a: 'The platform integrates a dynamic governance engine that automatically updates localized tax schemas and labor protocols based on the entity jurisdiction.' },
                 { q: 'What is the security standard for data transit?', a: 'All data is encrypted via TLS 1.3 in transit and AES-256 at rest, with SOC2 Type II and ISO 27001 certified data center infrastructure.' },
               ].map((item, i) => (
                 <FAQItem key={i} question={item.q} answer={item.a} />
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-slate-950">
         <div className="max-w-[1300px] mx-auto rounded-[5rem] bg-gradient-to-br from-slate-900 to-black p-24 md:p-40 text-center border border-white/10 relative overflow-hidden">
            <div className="relative z-10 space-y-12">
               <h2 className="text-7xl md:text-9xl font-display font-black tracking-tighter uppercase leading-[0.85] text-white">
                  Architect your <br />
                  <span className="text-teal-500">Enterprise Node.</span>
               </h2>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-10 font-sans">
                  <Link to="/login">
                    <Button size="lg" className="h-20 px-16 rounded-2xl bg-teal-500 text-slate-950 hover:bg-teal-400 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-teal-500/20">
                      Establish Access
                    </Button>
                  </Link>
                  <Button size="lg" variant="ghost" className="h-20 px-16 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-xs border border-white/10 hover:bg-white/5 transition-all">
                    Executive Documentation
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 bg-black border-t border-white/5 font-sans">
         <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-6 gap-20">
            <div className="md:col-span-2 space-y-10">
               <Link to="/" className="flex items-center gap-3">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain brightness-110" />
                  <span className="font-display font-black text-2xl tracking-tighter uppercase text-white">YVI <span className="text-teal-400">EMS</span></span>
               </Link>
               <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-sm uppercase tracking-wider">
                  The world's most advanced autonomous enterprise operating system. Orchestrating global human capital with operational precision.
               </p>
            </div>
            {['Nexus', 'Governance', 'Company', 'Intelligence'].map((cat) => (
              <div key={cat}>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-10">{cat}</h4>
                 <ul className="space-y-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <li><a href="#" className="hover:text-teal-400 transition-colors">Core Intelligence</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors">Governance Hub</a></li>
                    <li><a href="#" className="hover:text-teal-400 transition-colors">Audit Console</a></li>
                 </ul>
              </div>
            ))}
         </div>
      </footer>
    </div>
  );
}
