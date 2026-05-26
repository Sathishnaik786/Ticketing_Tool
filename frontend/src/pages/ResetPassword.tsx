import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { authApi } from '@/services/api';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token') || searchParams.get('access_token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast({
        title: 'Security Exception',
        description: 'Access token missing or invalid for synchronization.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!password || !confirmPassword) {
      toast({ title: 'Validation Error', description: 'Institutional keys must be fully defined.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Mismatch Detected', description: 'Provided keys do not synchronize.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Entropy Low', description: 'Key length must meet institutional standards.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setIsSuccess(true);
      toast({
        title: 'Identity Synced',
        description: 'New access key established successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Nexus Error',
        description: error.message || 'Failed to update access key.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-teal-500 selection:text-slate-950">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-lg space-y-12"
        >
          <div className="flex justify-center mb-16">
            <Link to="/" className="flex items-center gap-4 group">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain rounded-xl brightness-110" />
              <div className="flex flex-col -space-y-1 text-left">
                <span className="font-display font-black text-2xl tracking-tighter text-white uppercase">YVI <span className="text-teal-400">EMS</span></span>
                <span className="text-[9px] font-sans font-black uppercase tracking-[0.4em] text-teal-500/60 ml-0.5">Enterprise OS</span>
              </div>
            </Link>
          </div>

          <div className="space-y-4 text-center">
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] border border-blue-500/20 mb-4">
                <Lock size={14} />
                Secure Key Generation
             </div>
             <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white">
               {isSuccess ? 'Access Restored' : 'Key Exchange'}
             </h2>
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
               {isSuccess 
                 ? 'Your identity synchronization is complete. Proceed to terminal access.' 
                 : 'Establish a new institutional access key to restore your session terminal.'}
             </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <AnimatePresence mode="wait">
               {isSuccess ? (
                 <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-10 text-center relative z-10"
                 >
                    <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                       <CheckCircle2 size={48} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Institutional key established. <br /> 
                      <span className="text-white">Session Ready for Authorization</span>.
                    </p>
                    <Button onClick={() => navigate('/login')} className="w-full h-16 rounded-2xl bg-white text-slate-950 hover:bg-blue-400 font-black uppercase tracking-widest text-[10px] shadow-2xl group transition-all duration-500">
                       <span className="flex items-center justify-center gap-3">
                          Establish Access <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
                       </span>
                    </Button>
                 </motion.div>
               ) : (
                 <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit} 
                    className="space-y-10 relative z-10"
                 >
                    <div className="space-y-8">
                       <div className="space-y-4">
                          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">New Access Key</Label>
                          <div className="relative group">
                             <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 font-display font-black tracking-[0.5em] text-white focus:bg-white/[0.06] focus:border-blue-500/50 transition-all placeholder:text-slate-800"
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

                       <div className="space-y-4">
                          <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Verify Key</Label>
                          <div className="relative group">
                             <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                className="h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 font-display font-black tracking-[0.5em] text-white focus:bg-white/[0.06] focus:border-blue-500/50 transition-all placeholder:text-slate-800"
                             />
                             <button
                                type="button"
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                             >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                          </div>
                       </div>
                    </div>

                    <Button 
                       type="submit" 
                       disabled={isLoading}
                       className="w-full h-20 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 font-black uppercase tracking-[0.25em] text-xs shadow-2xl group transition-all duration-500"
                    >
                       <span className="relative z-10 flex items-center justify-center gap-3">
                          {isLoading ? (
                             <><Loader2 size={18} className="animate-spin" /> SYNCHRONIZING...</>
                          ) : (
                             <>FINALIZE KEY EXCHANGE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" /></>
                          )}
                       </span>
                    </Button>
                 </motion.form>
               )}
             </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-6 opacity-40">
             <div className="flex items-center gap-8 grayscale">
                <span className="text-[9px] font-black uppercase tracking-widest">TLS 1.3 Active</span>
                <span className="text-[9px] font-black uppercase tracking-widest">AES-256 Auth</span>
                <span className="text-[9px] font-black uppercase tracking-widest">v2.5.0-PF</span>
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                © 2026 YVI Enterprise Management Systems. All rights reserved.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}