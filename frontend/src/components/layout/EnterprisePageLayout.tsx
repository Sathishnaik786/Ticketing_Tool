import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/auth/ThemeToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import PremiumButton from '@/components/ui/PremiumButton';
import SectionHeading from '@/components/landing/SectionHeading';
import { AnimatedContainer } from '@/components/landing/AnimatedContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Linkedin, Twitter, Github } from 'lucide-react';

interface EnterprisePageLayoutProps {
  children: React.ReactNode;
  title: string;
  label: string;
  subtitle?: string;
  accentWord?: string;
}

const getRouteForMenuItem = (title: string, category: string): string => {
  const normalizedTitle = title.toLowerCase().trim();
  
  if (normalizedTitle.includes('core intelligence') || normalizedTitle.includes('intelligence core')) return '/intelligence';
  if (normalizedTitle.includes('governance hub')) return '/governance';
  if (normalizedTitle.includes('audit console')) return '/governance';
  if (normalizedTitle.includes('system status')) return '/operations';
  
  if (normalizedTitle.includes('compliance engine') || normalizedTitle.includes('compliance matrix')) return '/governance';
  if (normalizedTitle.includes('risk assessment')) return '/governance';
  if (normalizedTitle.includes('regional tax') || normalizedTitle.includes('tax governance')) return '/payroll';
  if (normalizedTitle.includes('rbac registry') || normalizedTitle.includes('access control') || normalizedTitle.includes('security layer') || normalizedTitle.includes('sso integration')) return '/security-standards';
  
  if (normalizedTitle.includes('about us')) return '/about';
  if (normalizedTitle.includes('enterprise sla')) return '/enterprise-sla';
  if (normalizedTitle.includes('security standards')) return '/security-standards';
  if (normalizedTitle.includes('contact sales')) return '/contact-sales';
  
  if (normalizedTitle.includes('attritions ai') || normalizedTitle.includes('predictive churn')) return '/intelligence';
  if (normalizedTitle.includes('payroll forecasts') || normalizedTitle.includes('cost forecasting')) return '/payroll';
  if (normalizedTitle.includes('growth analytics')) return '/intelligence';
  if (normalizedTitle.includes('performance core') || normalizedTitle.includes('performance hub')) return '/workforce';

  const cat = category.toLowerCase().trim();
  if (cat === 'workforce') return '/workforce';
  if (cat === 'payroll') return '/payroll';
  if (cat === 'intelligence' || cat === 'analytics' || cat === 'ai systems') return '/intelligence';
  if (cat === 'governance') return '/governance';
  if (cat === 'projects') return '/projects';
  if (cat === 'operations') return '/operations';
  
  return '/';
};

export function EnterprisePageLayout({ children, title, label, subtitle, accentWord }: EnterprisePageLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const navLinks = [
    { label: 'Workforce', path: '/workforce' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Intelligence', path: '/intelligence' },
    { label: 'Governance', path: '/governance' },
    { label: 'Operations', path: '/operations' },
    { label: 'Company', path: '/about' }
  ];

  return (
    <div className="min-h-screen mesh-bg-light dark:mesh-bg-dark text-slate-900 dark:text-white transition-colors duration-500 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden relative">
      <div className="grain-overlay" />

      <div className="absolute top-[-5%] left-[5%] w-[600px] h-[600px] bg-orange-500/5 dark:bg-orange-500/10 blur-[140px] rounded-full pointer-events-none animate-slow-pulse -z-20" />
      <div className="absolute top-[35%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/8 blur-[120px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] bg-orange-500/3 dark:bg-orange-500/6 blur-[150px] rounded-full pointer-events-none animate-slow-pulse -z-20" style={{ animationDelay: '-8s' }} />

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-orange-500">
        Skip to main content
      </a>

      <div className={cn("fixed top-5 left-1/2 -translate-x-1/2 z-[150] w-[94%] max-w-[1700px] transition-all duration-500 ease-out")}>
        <nav
          aria-label="Main navigation"
          className={cn(
            "relative flex items-center rounded-full px-8 xl:px-10 overflow-hidden",
            "bg-white/[0.08] dark:bg-slate-950/[0.55]",
            "backdrop-blur-3xl",
            "border border-white/15 dark:border-white/10",
            isScrolled
              ? "h-[72px] shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
              : "h-[88px] shadow-[0_20px_80px_rgba(15,23,42,0.10)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.40)]",
            "transition-all duration-500 ease-out"
          )}
        >
          <div aria-hidden="true" className="absolute inset-0 rounded-full bg-gradient-to-r from-white/10 via-transparent to-orange-500/5 pointer-events-none" />
          <div aria-hidden="true" className="absolute inset-px rounded-full border border-white/10 pointer-events-none" />

          {/* LEFT: Logo */}
          <div className="flex-shrink-0 relative z-10 lg:min-w-[200px] xl:min-w-[240px]">
            <Link to="/" className="relative inline-flex items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-full px-2 py-1">
              <img src="/logo.png" alt="YVI People logo" loading="lazy" className="w-11 h-11 object-contain rounded-xl brightness-110 drop-shadow-sm" />
              <span className="font-display font-semibold text-[26px] xl:text-[28px] tracking-tight text-slate-900 dark:text-white whitespace-nowrap">YVI <span className="text-orange-500">People</span></span>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <div className="absolute left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center lg:gap-4 xl:gap-8 2xl:gap-12 whitespace-nowrap">
            {navLinks.map((nav) => (
              <NavLink
                key={nav.label}
                to={nav.path}
                className={({ isActive }) => cn(
                  "relative inline-flex items-center text-[13px] xl:text-[14px] 2xl:text-[15px] font-semibold tracking-wide py-2 px-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded transition-all duration-300 ease-out",
                  isActive
                    ? "text-orange-500 font-semibold after:absolute after:left-0 after:right-0 after:bottom-[-10px] after:h-[2px] after:bg-orange-500 after:rounded-full after:shadow-[0_0_8px_rgba(234,88,12,0.5)]"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:after:absolute hover:after:left-0 hover:after:right-0 hover:after:bottom-[-10px] hover:after:h-[2px] hover:after:bg-orange-500 hover:after:rounded-full"
                )}
              >
                {nav.label}
              </NavLink>
            ))}
          </div>

          {/* RIGHT: Actions */}
          <div className="ml-auto flex-shrink-0 flex items-center gap-3 relative z-10">
            {location.pathname !== '/login' && (
              <Link to="/login" className="hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-full">
                <PremiumButton className="h-12 px-8 rounded-full text-sm font-semibold min-w-[130px] flex-shrink-0">
                  Login
                </PremiumButton>
              </Link>
            )}
            
            {/* ThemeToggle */}
            <div className="flex items-center justify-center h-12 w-12 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/5 backdrop-blur-md">
              <ThemeToggle />
            </div>

            {/* Mobile hamburger */}
            <button
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className={cn(
                "lg:hidden flex items-center justify-center w-12 h-12 rounded-full",
                "bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10",
                "border border-white/15 dark:border-white/10",
                "text-slate-700 dark:text-white transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span
                    key="close-icon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center"
                  >
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open-icon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="flex items-center"
                  >
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Fullscreen Glass Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-[145] bg-black/30 backdrop-blur-xl lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-nav-drawer"
              key="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 38, mass: 0.8 }}
              className={cn(
                "fixed top-0 left-0 h-full z-[149] lg:hidden",
                "w-[85%] max-w-[420px]",
                "bg-white/[0.75] dark:bg-slate-950/[0.80]",
                "backdrop-blur-3xl",
                "border-r border-white/20 dark:border-white/10",
                "rounded-r-[2rem]",
                "shadow-[0_30px_100px_rgba(0,0,0,0.35)]",
                "flex flex-col"
              )}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-7 pt-8 pb-6">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg"
                >
                  <img
                    src="/logo.png"
                    alt="YVI People logo"
                    loading="lazy"
                    className="w-10 h-10 object-contain rounded-xl brightness-110"
                  />
                  <span className="font-display font-semibold text-2xl tracking-tight text-slate-900 dark:text-white">
                    YVI <span className="text-orange-500">People</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-7 h-px bg-slate-200/60 dark:bg-white/[0.08]" aria-hidden="true" />

              {/* Nav items */}
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-7 py-8">
                <ul className="flex flex-col gap-2" role="list">
                  {navLinks.map((nav, i) => {
                    const active = location.pathname === nav.path;
                    return (
                      <motion.li
                        key={nav.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.3, ease: "easeOut" }}
                      >
                        <Link
                          to={nav.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "block w-full text-left text-2xl font-semibold tracking-tight",
                            active
                              ? "text-orange-500 font-bold"
                              : "text-slate-800 dark:text-slate-100 hover:text-orange-500 dark:hover:text-orange-400",
                            "transition-colors duration-200 py-3 px-2 rounded-xl",
                            active
                              ? "bg-orange-500/10"
                              : "hover:bg-orange-50/60 dark:hover:bg-orange-500/5",
                            "focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none"
                          )}
                        >
                          {nav.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Drawer footer */}
              <div className="px-7 pb-10 pt-4 border-t border-slate-200/60 dark:border-white/[0.08]">
                <div className="flex items-center justify-end mb-5">
                  <ThemeToggle />
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded-2xl"
                >
                  <PremiumButton className="w-full h-14 rounded-2xl text-[16px]">
                    Login
                  </PremiumButton>
                </Link>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main id="main-content" className="pt-32">
        <section className="py-20 px-6">
          <div className="max-w-[1500px] mx-auto space-y-24">
            <AnimatedContainer direction="up">
              <SectionHeading label={label} title={title} subtitle={subtitle} accentWord={accentWord} />
            </AnimatedContainer>
            {children}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 sm:px-10 bg-white/30 dark:bg-black border-t border-slate-200/50 dark:border-white/5 font-sans relative z-10">
          <div className="max-w-[1500px] mx-auto space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-12 md:gap-20">
              <div className="md:col-span-2 space-y-6">
                <Link to="/" className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-lg max-w-max">
                  <img src="/logo.png" alt="YVI People enterprise logo" loading="lazy" className="w-10 h-10 object-contain brightness-110" />
                  <span className="font-display font-semibold text-2xl tracking-tight text-slate-900 dark:text-white">YVI <span className="text-orange-555 dark:text-orange-400">People</span></span>
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
                  title: 'YVI People',
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
                        <Link
                          to={getRouteForMenuItem(link, cat.title)}
                          className="text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-6 font-sans font-normal text-sm text-slate-400">
                <Link to="/enterprise-sla" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Privacy policy</Link>
                <Link to="/enterprise-sla" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Terms of service</Link>
                <Link to="/security-standards" className="hover:text-orange-500 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:outline-none rounded px-1 py-0.5">Security</Link>
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

export default EnterprisePageLayout;