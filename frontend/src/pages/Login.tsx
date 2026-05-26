import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Cpu, 
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden relative">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
      
      {/* Left side - Institutional Storytelling */}
      <div className="hidden lg:flex lg:w-3/5 flex-col justify-between p-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex items-center gap-4 group"
        >
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain rounded-xl brightness-110" />
          <div className="flex flex-col -space-y-1">
            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">YVI <span className="text-teal-400">EMS</span></span>
            <span className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-teal-500/60 ml-0.5">Enterprise OS</span>
          </div>
        </motion.div>

        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20">
               <ShieldCheck size={14} />
               Institutional Access Required
            </div>
            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-display font-black leading-[0.85] tracking-tighter uppercase text-white">
              Authorize <br />
              <span className="text-gradient-teal">Nexus Hub.</span>
            </h1>
            <p className="text-2xl text-slate-400 max-w-xl font-bold leading-relaxed tracking-tight">
              Establish secure terminal access to the unified workforce intelligence operating system.
            </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="grid grid-cols-3 gap-16 pt-12 border-t border-white/5"
          >
            {[
              { label: 'Workforce', val: '50K+', color: 'text-white' },
              { label: 'Accuracy', val: '99.9%', color: 'text-teal-400' },
              { label: 'Security', val: 'SOC2', color: 'text-white' }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-4xl font-display font-black text-white tracking-tighter">{stat.val}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
           <span>v2.5.0-PF</span>
           <div className="h-1 w-1 bg-teal-500 rounded-full animate-pulse" />
           <span>Institutional Ledger Verified</span>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative z-10 bg-slate-950/40 backdrop-blur-3xl border-l border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-lg space-y-12"
        >
          <div className="space-y-4">
             <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-white">Authentication</h2>
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed">
               Please enter your corporate credentials to establish a secure session with the enterprise node.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Portal</Label>
                <div className="relative group">
                   <Input
                    id="email"
                    type="email"
                    placeholder="ENTER CORPORATE ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 font-display font-black tracking-widest text-white focus:bg-white/[0.06] focus:border-teal-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Access Key</Label>
                   <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-400 transition-colors">
                     Reset Key
                   </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 font-display font-black tracking-[0.5em] text-white focus:bg-white/[0.06] focus:border-teal-500/50 transition-all placeholder:text-slate-800"
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-20 rounded-2xl bg-teal-500 text-slate-950 hover:bg-teal-400 font-black uppercase tracking-[0.25em] text-xs shadow-[0_20px_50px_rgba(20,184,166,0.2)] group transition-all duration-500 overflow-hidden relative"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                 {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Authorizing Session...
                    </>
                 ) : (
                    <>
                      Establish Access <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                    </>
                 )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </form>

          <div className="pt-8 border-t border-white/5 space-y-6">
             <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                   <Lock size={18} />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white">Quantum Encryption Active</p>
                   <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Your connection is institutionally secured.</p>
                </div>
             </div>
             <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
               © 2026 YVI Enterprise Management Systems. All rights reserved.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
