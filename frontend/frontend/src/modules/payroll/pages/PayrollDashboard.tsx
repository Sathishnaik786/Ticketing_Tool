import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Users, 
  Settings, 
  LayoutGrid, 
  ArrowUpRight, 
  Clock, 
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  ClipboardList,
  ChevronRight,
  Calculator,
  Database,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const PayrollDashboard = () => {
  const stats = [
    { title: 'Total Components', value: '12', icon: LayoutGrid, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { title: 'Active Structures', value: '08', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { title: 'Employees Assigned', value: '156', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { title: 'PF Compliance', value: '98%', icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-panel-teal rounded-[3rem] overflow-hidden relative group">
          <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[65px] pointer-events-none" />
          
          <CardContent className="p-10 lg:p-14 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/25 dark:border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300 backdrop-blur-md shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.5),inset_0_-1px_1px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Payroll Cycle: May 2024
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                  Enterprise Payroll <br /> 
                  <span className="text-cyan-600 dark:text-cyan-400">Management</span>
                </h1>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-md leading-relaxed">
                  Precision-engineered salary engine with automated PF, ESI, and tax compliance logic for the modern workforce.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-full h-14 px-8 border border-cyan-400/20 shadow-[inset_0_2.5px_3px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.15),0_12px_24px_-4px_rgba(6,182,212,0.15)] hover:scale-[1.02] duration-300 active:scale-[0.98]">
                    Process Payroll
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" className="bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-full h-14 px-8 shadow-[inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-1.5px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(148,210,230,0.06)] hover:scale-[1.01] duration-300 active:scale-[0.98]">
                    <Clock className="mr-2 h-5 w-5" />
                    Audit Reports
                  </Button>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-2 gap-6">
                <div className="enterprise-card space-y-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Payout</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">₹48.2L</p>
                  <div className="h-1.5 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[78%]" />
                  </div>
                </div>
                <div className="enterprise-card space-y-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">PF Liability</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">₹5.4L</p>
                  <div className="h-1.5 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[62%]" />
                  </div>
                </div>
                <div className="enterprise-card space-y-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Pending Approvals</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">12</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/20 border border-white/30 dark:border-white/10 shadow-sm" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-white/60">Managers</span>
                  </div>
                </div>
                <div className="enterprise-card space-y-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compliance Health</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">99.8%</p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                    <TrendingUp size={10} /> +1.2% this month
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
          >
            <div className="enterprise-card hover:-translate-y-2 group/stat">
              <div className="p-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {stat.value}
                    </h2>
                  </div>
                  <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("w-7 h-7", stat.color)} />
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <div className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <TrendingUp size={10} className="mr-1" />
                    +12%
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">vs last month</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Operational Core</h2>
              <p className="text-sm text-slate-500 font-medium">Configure and manage your primary payroll engine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Salary Components', desc: 'Earnings, deductions & formulas.', icon: LayoutGrid, href: '/app/payroll/components', color: 'blue' },
              { title: 'Salary Structures', desc: 'Structure templates & CTC slabs.', icon: CreditCard, href: '/app/payroll/structures', color: 'indigo' },
              { title: 'Salary Assignments', desc: 'Assign structures to employees.', icon: Users, href: '/app/payroll/assignments', color: 'emerald' },
              { title: 'Payroll Cycles', desc: 'Run and track monthly cycles.', icon: Calendar, href: '/app/payroll/cycles', color: 'amber' },
              { title: 'Compliance Rules', desc: 'PF, ESI & Statutory definitions.', icon: ShieldCheck, href: '/app/payroll/compliance', color: 'cyan' },
              { title: 'Tax Slabs', desc: 'Manage IT slabs & declarations.', icon: Calculator, href: '/app/payroll/tax-slabs', color: 'rose' },
            ].map((item, i) => (
              <Link key={i} to={item.href}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="enterprise-card group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/[0.02] rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
                  
                  <div className="relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                      `bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400`
                    )}>
                      <item.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    
                    <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage Now <ArrowUpRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Finance & ERP</h2>
            <p className="text-sm text-slate-500 font-medium">Ledgers, disbursements & exports.</p>
          </div>

          <div className="space-y-6">
            {[
              { title: 'Accounting Journals', icon: ClipboardList, href: '/app/payroll/finance/journals', status: 'In Sync' },
              { title: 'Disbursements', icon: DollarSign, href: '/app/payroll/finance/disbursements', status: 'Pending' },
              { title: 'ERP Export Center', icon: Database, href: '/app/payroll/finance/erp-export', status: 'Ready' },
            ].map((item, i) => (
              <Link key={i} to={item.href}>
                <div className="liquid-elevated p-6 rounded-[1.5rem] flex items-center justify-between group hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">Enterprise Gateway</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.status}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            <Card className="rounded-[2rem] border-0 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <ShieldCheck size={120} />
              </div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-xl font-bold mb-2">Compliance Vault</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  All your statutory filings and audit logs are encrypted and ready for regulatory review.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12">
                  Access Vault
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
