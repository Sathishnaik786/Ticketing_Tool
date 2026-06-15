import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sidebarCollapseVariants, slideInLeftVariants } from '@/animations/motionVariants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { OnlineIndicator } from '@/components/common/OnlineIndicator';
import { GlobalSearch } from '@/components/common/GlobalSearch';
import { NotificationBell } from '@/components/common/NotificationBell';
import { ChatDrawer } from '@/components/common/ChatDrawer';
import { CommandPalette } from '@/components/common/CommandPalette';
import { QuickActionLauncher } from '@/components/common/QuickActionLauncher';
import { useShortcuts } from '@/hooks/useShortcuts';
import { MegaMenu } from './MegaMenu';
import { FloatingOperationsPanel } from '@/components/common/FloatingOperationsPanel';
import { LayoutGrid, Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Calendar,
  FileText,
  BarChart3,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Briefcase,
  ClipboardList,
  Users2,
  FolderKanban,
  FolderOpen,
  MessageCircle,
  ChevronDown,
  Dot,
  HelpCircle,
  ShieldCheck,
  LayoutTemplate,
  BookOpenCheck,
  Cpu,
  CreditCard,
  Calculator,
  BookOpen,
  Database,
  FileUp
} from 'lucide-react';

import { ticketingNavGroups } from '@/modules/ticketing/ticketing.nav';


interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Executive Overview',
    items: [
      { title: 'Command Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
      { title: 'Global Meet-ups', href: '/app/meetups', icon: Users2 },
    ]
  },
  {
    label: 'Workforce Intelligence',
    items: [
      { title: 'Payroll Control', href: '/app/payroll', icon: LayoutDashboard, roles: ['ADMIN', 'HR'] },
      { title: 'Governance Core', href: '/app/payroll/governance', icon: ShieldCheck, roles: ['ADMIN', 'HR'] },
      { title: 'Pay Components', href: '/app/payroll/components', icon: LayoutTemplate, roles: ['ADMIN', 'HR'] },
      { title: 'Salary Matrix', href: '/app/payroll/structures', icon: CreditCard, roles: ['ADMIN', 'HR'] },
    ]
  },
  {
    label: 'Operational Cycles',
    items: [
      { title: 'Payroll Engine', href: '/app/payroll/cycles', icon: Calendar, roles: ['ADMIN', 'HR'] },
      { title: 'Bulk Ingestion', href: '/app/payroll/bulk', icon: FileUp, roles: ['ADMIN', 'HR'] },
      { title: 'Salary Assignments', href: '/app/payroll/assignments', icon: Users2, roles: ['ADMIN', 'HR'] },
      { title: 'Approval YVI People', href: '/app/payroll/approvals', icon: ClipboardList, roles: ['ADMIN', 'HR', 'MANAGER'] },
    ]
  },
  {
    label: 'Governance & Compliance',
    items: [
      { title: 'Statutory Ledger', href: '/app/payroll/compliance/pf', icon: ShieldCheck, roles: ['ADMIN', 'HR'] },
      { title: 'Compliance Audit', href: '/app/payroll/compliance', icon: ShieldCheck, roles: ['ADMIN', 'HR'] },
      { title: 'Tax Jurisdictions', href: '/app/payroll/tax-slabs', icon: Calculator, roles: ['ADMIN'] },
    ]
  },
  {
    label: 'Financial Orchestration',
    items: [
      { title: 'Capital Journals', href: '/app/payroll/finance/journals', icon: BookOpen, roles: ['ADMIN', 'FINANCE'] },
      { title: 'Unified Disbursements', href: '/app/payroll/finance/disbursements', icon: CreditCard, roles: ['ADMIN', 'FINANCE'] },
      { title: 'ERP Sync Center', href: '/app/payroll/finance/erp-export', icon: Database, roles: ['ADMIN', 'FINANCE'] },
    ]
  },
  {
    label: 'Predictive Analytics',
    items: [
      { title: 'Workforce Trends', href: '/app/payroll/analytics', icon: BarChart3, roles: ['ADMIN', 'HR', 'MANAGER'] },
      { title: 'Variance Matrix', href: '/app/payroll/variance', icon: ClipboardList, roles: ['ADMIN', 'HR'] },
    ]
  },
  {
    label: 'Personalized Portal',
    items: [
      { title: 'My Identity', href: '/app/profile', icon: User, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
      { title: 'Digital Payslips', href: '/app/payroll/my-payslips', icon: FileText, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
      { title: 'Benefits Matrix', href: '/app/payroll/deductions', icon: Calculator, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    ]
  },
  {
    label: 'Human Capital Management',
    items: [
      { title: 'Entity Directory', href: '/app/employees', icon: Users, roles: ['ADMIN', 'HR', 'MANAGER'] },
      { title: 'Org Architecture', href: '/app/departments', icon: Building2 },
      { title: 'Presence Logs', href: '/app/attendance', icon: Clock },
      { title: 'Lifecycle Leaves', href: '/app/leaves', icon: Calendar },
    ]
  },
  {
    label: 'Strategic Assets',
    items: [
      { title: 'Document Vault', href: '/app/documents', icon: FileText, roles: ['ADMIN', 'HR'] },
      { title: 'Insight Reports', href: '/app/reports', icon: BarChart3, roles: ['ADMIN', 'HR', 'MANAGER'] },
      { title: 'YVI People Settings', href: '/app/payroll/settings', icon: Settings, roles: ['ADMIN'] },
    ]
  },
  ...ticketingNavGroups,
];

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(2);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  useShortcuts();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('yvi_sidebar_sections');
    return saved ? JSON.parse(saved) : {
      'Executive Overview': true,
      'Workforce Intelligence': true,
      'Operational Cycles': true,
      'Governance & Compliance': true,
      'Financial Orchestration': true,
      'Predictive Analytics': true,
      'Personalized Portal': true,
      'Human Capital Management': true,
      'Strategic Assets': true,
      'Service Management': true
    };
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem('yvi_sidebar_sections', JSON.stringify(next));
      return next;
    });
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  const filterItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return user && item.roles.includes(user.role);
    });
  };

  return (
    <div className="h-screen flex w-full  dark:bg-[#020617] text-foreground overflow-hidden font-sans antialiased selection:bg-cyan-500/20 lg:p-3 lg:gap-3 relative z-0" style={{ background: "#c1e1ec" }}>
      {/* Premium Executive Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/15 dark:bg-blue-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-400/15 dark:bg-cyan-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-indigo-400/10 dark:bg-indigo-600/15 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <a
        href="#main-app-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-[250] focus:px-5 focus:py-3 focus:bg-white focus:text-slate-900 dark:focus:bg-slate-950 dark:focus:text-white focus:rounded-2xl focus:shadow-2xl focus:ring-2 focus:ring-blue-500 border border-slate-200 dark:border-white/10 font-bold text-sm tracking-tight transition-all"
      >
        Skip to main content
      </a>
      <CommandPalette />
      <QuickActionLauncher />
      <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
      <FloatingOperationsPanel />
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <TooltipProvider delayDuration={0}>
        <motion.aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-50 h-screen lg:h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden rounded-[2.5rem]",
            "bg-white/90 dark:bg-[#030B17]/90 backdrop-blur-3xl lg:backdrop-blur-md",
            "lg:liquid-recessed lg:!bg-black/5 dark:lg:!bg-white/5 lg:border-transparent lg:shadow-none lg:p-2",
            collapsed ? "w-[104px]" : "w-[280px]",
            mobileOpen ? "translate-x-0 m-0 h-screen rounded-none border-0 top-0 left-0" : "-translate-x-full lg:translate-x-0"
          )}
          animate={collapsed ? { width: 88 } : { width: 280 }}
          initial={false}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        >
          {/* Subtle Side Gradient */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />

          {/* Logo Section */}
          <div className={cn(
            "h-[72px] flex items-center shrink-0 relative mt-2",
            collapsed ? "justify-center" : "px-5 justify-between"
          )}>
            <Link to="/app/dashboard" className="flex items-center gap-3.5 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-[-4px] bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-10 h-10 relative rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[1px] shadow-2xl shadow-blue-500/20">
                  <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center overflow-hidden">
                    <img
                      src="/logo.png"
                      alt="Logo"
                      className="w-7 h-7 object-contain"
                    />
                  </div>
                </div>
              </motion.div>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col"
                >
                  <span className="font-display font-black text-xl tracking-[-0.03em] text-slate-900 dark:text-white leading-none">YVI <span className="text-cyan-600 dark:text-cyan-400">PEOPLE</span></span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1.5 uppercase">Enterprise OS</span>
                </motion.div>
              )}
            </Link>
          </div>

          {/* Navigation Area */}
          <ScrollArea className="flex-1 scrollbar-premium px-4">
            <div className="py-6 space-y-7">
              {navGroups.map((group) => {
                const groupItems = filterItems(group.items);
                if (groupItems.length === 0) return null;

                const isExpanded = expandedSections[group.label] !== false;

                return (
                  <div key={group.label} className="space-y-1.5">
                    {!collapsed && (
                      <button
                        onClick={() => toggleSection(group.label)}
                        className="flex items-center justify-between w-full px-3 py-1.5 mb-3 group liquid-metadata text-slate-500 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all hover:border-white/40 dark:hover:border-white/10"
                      >
                        <span className="text-[9px] font-sans font-black uppercase tracking-[0.25em] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{group.label}</span>
                        <ChevronDown
                          size={12}
                          className={cn("transition-transform duration-300 opacity-40 group-hover:opacity-70", !isExpanded && "-rotate-90")}
                        />
                      </button>
                    )}

                    <div className="space-y-1">
                      <AnimatePresence initial={false}>
                        {(isExpanded || collapsed) && (
                          <motion.div
                            initial={collapsed ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden space-y-1"
                          >
                            {groupItems.map((item) => {
                              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

                              return (
                                <Tooltip key={item.href}>
                                  <TooltipTrigger asChild>
                                    <Link
                                      to={item.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={cn(
                                        "relative flex items-center gap-3.5 px-4 py-3 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group focus-visible:outline-none border",
                                        collapsed ? "justify-center mx-0" : "mx-0",
                                        isActive
                                          ? "liquid-capsule-active"
                                          : "liquid-capsule-hover border-transparent text-slate-600 dark:text-slate-400 font-medium"
                                      )}
                                    >
                                      {isActive && (
                                        <motion.div
                                          layoutId="sidebar-active-bar"
                                          className="absolute left-[6px] top-1/4 bottom-1/4 w-[3px] bg-cyan-500 dark:bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                        />
                                      )}

                                      <item.icon className={cn(
                                        "h-5 w-5 shrink-0 transition-all duration-300",
                                        isActive
                                          ? "text-cyan-600 dark:text-cyan-400 opacity-100 scale-105 drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]"
                                          : "text-slate-500 dark:text-slate-400 opacity-70 group-hover:opacity-100 group-hover:text-cyan-700 dark:group-hover:text-white"
                                      )} />

                                      {!collapsed && (
                                        <motion.span
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className={cn(
                                            "text-[14px] tracking-tight transition-colors duration-200",
                                            isActive ? "font-bold" : "font-medium"
                                          )}
                                        >
                                          {item.title}
                                        </motion.span>
                                      )}
                                    </Link>
                                  </TooltipTrigger>
                                  {collapsed && (
                                    <TooltipContent side="right" className="bg-[#1a1c23] border-white/10 text-white font-bold rounded-lg px-3 py-1.5 ml-2 shadow-2xl">
                                      {item.title}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* User & Footer Area */}
          <div className="p-4 lg:p-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-3 w-full rounded-[1.75rem] p-2.5 transition-all duration-300 group outline-none",
                  "liquid-elevated active:scale-[0.98]",
                  collapsed && "justify-center p-2"
                )}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20 dark:ring-white/[0.06] group-hover:ring-cyan-500/40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="p"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-indigo-600/15 text-blue-500 dark:text-blue-300">
                          <span className="text-sm font-bold">{initials}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B1220] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>

                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate tracking-tight">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold truncate mt-0.5 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={10} /> {user?.role}
                      </p>
                    </motion.div>
                  )}
                  {!collapsed && (
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={collapsed ? "right" : "top"}
                align={collapsed ? "center" : "end"}
                className="w-64 glass-panel rounded-2xl p-2 ml-2"
              >
                <div className="px-3 py-4 mb-2 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-semibold text-blue-400 tracking-[0.2em] mb-1 uppercase">Logged in as</p>
                  <p className="text-sm font-semibold text-white">{user?.email}</p>
                  <p className="text-[10px] font-medium text-muted-foreground mt-1 tracking-wider italic">Enterprise Signature Verified</p>
                </div>

                <DropdownMenuItem asChild className="rounded-xl flex items-center gap-3 p-3 font-bold cursor-pointer group focus:bg-blue-500/20 focus:text-white">
                  <Link to="/app/profile">
                    <User className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    Identity Hub
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-bold cursor-pointer group focus:bg-blue-500/20 focus:text-white">
                  <HelpCircle className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  Support Core
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10 my-1" />

                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-xl flex items-center gap-3 p-3 font-bold text-rose-400 cursor-pointer focus:bg-rose-500/10 focus:text-rose-500"
                >
                  <LogOut className="h-4 w-4" />
                  Deauthorize Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!collapsed && (
              <div className="mt-4 px-2 flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.1em]">
                <span>v2.5.0-PF</span>
                <Dot className="text-blue-500 animate-pulse" />
                <span>YVI ENTERPRISE</span>
              </div>
            )}
          </div>
        </motion.aside>
      </TooltipProvider>

      {/* Right Column (Navbar + Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen lg:h-full gap-3 transition-all duration-500">

        {/* Top bar (Independent Track) */}
        <header className={cn(
          "sticky top-0 z-30 flex items-center transition-all duration-500",
          // Mobile base
          "h-[72px] px-4 bg-white/70 dark:bg-[#030B17]/55 backdrop-blur-3xl border-b border-slate-200/60 dark:border-white/10",
          // Desktop overrides - Unified Single Track
          "lg:h-14 lg:p-1.5 lg:px-2 lg:rounded-full lg:liquid-recessed lg:!bg-black/5 dark:lg:!bg-white/5 lg:border-transparent lg:shadow-none"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Left Track Group */}
          <div className="hidden lg:flex items-center gap-1 mr-4">
            {/* Collapse Button (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full liquid-capsule-hover flex items-center justify-center active:scale-95 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>

            {/* Date Capsule */}
            <div className="hidden xl:flex items-center gap-2.5 h-10 px-4 rounded-full liquid-capsule text-[10px] font-black uppercase tracking-[0.15em]">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>


          </div>

          {/* Logo - visible on mobile */}
          <Link to="/app/dashboard" className="flex lg:hidden items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-[-2px] bg-blue-500/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain rounded-lg shadow-lg relative z-10"
              />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">YVI</span>
          </Link>

          {/* Center: Global Search */}
          <div className="hidden lg:block flex-1 max-w-xl mx-auto px-10">
            <GlobalSearch />
          </div>

          {/* Mobile: Search Icon */}
          <div className="lg:hidden mx-2">
            <GlobalSearch isMobile={true} />
          </div>

          {/* Right side: Chat, Notification, Profile */}
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsChatOpen(true);
                setUnreadChatCount(0);
              }}
              className="relative h-10 w-10 rounded-full liquid-capsule-hover flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300"
            >
              <MessageCircle size={20} className="group-hover:text-blue-500 transition-colors" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 bg-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#0B1020] animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </Button>

            <NotificationBell />

            <div className="h-6 w-[1px] bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />

            {/* Profile with Quick Actions */}
            {user && (
              <OnlineIndicator
                firstName={user.firstName || ''}
                lastName={user.lastName || ''}
                email={user.email || ''}
                profileImage={user.profile_image}
                position={user.position || ''}
                role={user.role || ''}
                className="liquid-capsule-hover border-transparent"
              />
            )}
          </div>
        </header>

        {/* Chat Drawer */}
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Page content (Glass Panel Container) */}
        <main id="main-app-content" className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-premium relative liquid-recessed lg:rounded-[2.5rem] focus:outline-none">
          {/* Cinematic Background Engine (Mesh) */}
          <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(6,182,212,0.12)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(20,184,166,0.08)_0px,transparent_50%)] pointer-events-none z-0 opacity-40" />

          {/* Subtle background glow - Adaptive */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08] rounded-full blur-[140px] pointer-events-none animate-slow-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/[0.03] dark:bg-teal-500/[0.06] rounded-full blur-[120px] pointer-events-none animate-slow-pulse" style={{ animationDelay: '-6s' }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 relative z-10"
          >
            {children ?? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No content available</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                  The system core archive for this section appears to be empty or inaccessible.
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
