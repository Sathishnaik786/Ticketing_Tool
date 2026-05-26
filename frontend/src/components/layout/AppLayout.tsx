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
      { title: 'Approval Nexus', href: '/app/payroll/approvals', icon: ClipboardList, roles: ['ADMIN', 'HR', 'MANAGER'] },
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
      { title: 'Nexus Settings', href: '/app/payroll/settings', icon: Settings, roles: ['ADMIN'] },
    ]
  }
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
    return saved ? JSON.parse(saved) : { Overview: true, 'Payroll Core': true, Processing: true, Resources: true };
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
    <div className="h-screen flex w-full bg-slate-50 dark:bg-slate-950 text-foreground overflow-hidden font-sans antialiased selection:bg-primary/10">
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
            "fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col border-r border-white/10 overflow-hidden",
            "bg-[#090E1A] transition-all duration-300 shadow-2xl shadow-black/40",
            collapsed ? "w-[88px]" : "w-[280px]",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          animate={collapsed ? { width: 88 } : { width: 280 }}
          initial={false}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        >
          {/* Subtle Side Gradient */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />

          {/* Logo Section */}
          <div className={cn(
            "h-[72px] flex items-center shrink-0 border-b border-white/5 relative",
            collapsed ? "justify-center" : "px-7 justify-between"
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
                  <span className="font-display font-black text-xl tracking-[-0.03em] text-white leading-none">YVI <span className="text-blue-500">PEOPLE</span></span>
                  <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mt-1.5 uppercase">Enterprise OS</span>
                </motion.div>
              )}
            </Link>
          </div>

          {/* Navigation Area */}
          <ScrollArea className="flex-1 scrollbar-premium px-4">
            <div className="py-8 space-y-10">
              {navGroups.map((group) => {
                const groupItems = filterItems(group.items);
                if (groupItems.length === 0) return null;

                const isExpanded = expandedSections[group.label] !== false;

                return (
                  <div key={group.label} className="space-y-2">
                    {!collapsed && (
                      <button
                        onClick={() => toggleSection(group.label)}
                        className="flex items-center justify-between w-full px-4 mb-3 group text-slate-400 hover:text-white transition-colors"
                      >
                        <span className="text-[10px] font-sans font-black uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">{group.label}</span>
                        <ChevronDown
                          size={12}
                          className={cn("transition-transform duration-300 opacity-30 group-hover:opacity-100", !isExpanded && "-rotate-90")}
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
                                        "relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                                        collapsed ? "justify-center mx-0" : "mx-0",
                                        isActive
                                          ? "bg-white/[0.12] text-white shadow-lg"
                                          : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                                      )}
                                    >
                                      {/* Premium Active Indicator Bar */}
                                      {isActive && (
                                        <motion.div
                                          layoutId="sidebar-active-bar"
                                          className="absolute left-[-4px] top-1/4 bottom-1/4 w-[4px] bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.3 }}
                                        />
                                      )}

                                      <item.icon className={cn(
                                        "h-5 w-5 shrink-0 transition-all duration-300",
                                        isActive ? "text-blue-400 opacity-100 scale-110" : "opacity-60 group-hover:opacity-100 group-hover:text-white"
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
          <div className="p-6 bg-white/[0.02] border-t border-white/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-3 w-full rounded-2xl p-2.5 transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none",
                  "bg-white/[0.04] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.1] active:scale-[0.98]",
                  collapsed && "justify-center p-2"
                )}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/5 group-hover:ring-blue-500/40 transition-all shadow-xl shadow-black/40">
                      {user?.profile_image ? (
                        <img
                          src={user.profile_image}
                          alt="p"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400">
                          <span className="text-sm font-bold">{initials}</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0B1220] shadow-glow" />
                  </div>

                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-sm font-semibold text-white truncate tracking-tight">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[10px] text-blue-400 font-medium truncate mt-0.5 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck size={10} /> {user?.role}
                      </p>
                    </motion.div>
                  )}
                  {!collapsed && (
                    <ChevronRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
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
              <div className="mt-4 px-2 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.1em]">
                <span>v2.5.0-PF</span>
                <Dot className="text-blue-500 animate-pulse" />
                <span>YVI ENTERPRISE</span>
              </div>
            )}
          </div>
        </motion.aside>
      </TooltipProvider>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white/95 dark:bg-[#090E1A]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center px-4 lg:px-8 transition-colors duration-500">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Collapse Button (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex mr-4 h-10 w-10 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-500 hover:text-blue-500 active:scale-95 shadow-sm"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>

          {/* Logo - visible on mobile */}
          <Link to="/app/dashboard" className="flex items-center gap-2.5 group">
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


          {/* Page Details Shadow */}
          <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Mega Menu Trigger */}
          <Button
            onClick={() => setIsMegaMenuOpen(true)}
            className="ml-4 h-10 px-6 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 hover:bg-teal-500 hover:text-slate-950 font-black uppercase tracking-widest text-[10px] transition-all duration-500 group"
          >
             <LayoutGrid size={14} className="mr-2 group-hover:rotate-90 transition-transform" />
             Nexus Modules
          </Button>

          {/* Center: Global Search */}
          <div className="hidden lg:block flex-1 max-w-xl mx-auto px-10">
            <GlobalSearch />
          </div>

          {/* Mobile: Search Icon */}
          <div className="lg:hidden mx-2">
            <GlobalSearch isMobile={true} />
          </div>

          {/* Right side: Chat, Notification, Profile */}
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsChatOpen(true);
                  setUnreadChatCount(0);
                }}
                className="relative h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all group"
              >
                <MessageCircle size={20} className="group-hover:text-blue-500 transition-colors" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4.5 w-4.5 bg-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#0B1020] animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </Button>

              <NotificationBell />
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

            {/* Profile with Quick Actions */}
            {user && (
              <OnlineIndicator
                firstName={user.firstName || ''}
                lastName={user.lastName || ''}
                email={user.email || ''}
                profileImage={user.profile_image}
                position={user.position || ''}
                role={user.role || ''}
              />
            )}
          </div>
        </header>

        {/* Chat Drawer */}
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-premium relative bg-slate-50 dark:bg-slate-950">
          {/* Cinematic Background Engine (Mesh) */}
          <div className="absolute inset-0 mesh-bg dark:mesh-bg-dark opacity-30 pointer-events-none" />
          
          {/* Subtle background glow - Adaptive */}
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-teal-500/5 dark:bg-teal-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

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
