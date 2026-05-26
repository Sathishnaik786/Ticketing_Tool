import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { cn } from '@/lib/utils';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmailFormat = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const checkEmailExists = async (email: string) => {
    if (!validateEmailFormat(email)) {
      setEmailError('Invalid identity format');
      setIsEmailValid(false);
      return;
    }

    setIsCheckingEmail(true);
    setEmailError('');
    try {
      const response = await authApi.checkEmailExists(email);
      if (response.success && response.data.exists) {
        setIsEmailValid(true);
        setEmailError('');
      } else {
        setIsEmailValid(false);
        setEmailError('Identity not found in nexus');
      }
    } catch (error: any) {
      setEmailError('Nexus connection error');
      setIsEmailValid(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) setEmailError('');
    if ((handleEmailChange as any).timeoutId) clearTimeout((handleEmailChange as any).timeoutId);
    if (value) {
      (handleEmailChange as any).timeoutId = setTimeout(() => {
        checkEmailExists(value);
      }, 600);
    } else {
      setIsEmailValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !isEmailValid) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: 'Protocol Initiated',
        description: 'Recovery instructions dispatched to your secure identity.',
      });
    } catch (error: any) {
      toast({
        title: 'Nexus Error',
        description: error.message || 'Failed to dispatch recovery link.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-teal-500 selection:text-slate-950">
      {/* Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />
      
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
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20 mb-4">
                <ShieldCheck size={14} />
                Security Protocol 842
             </div>
             <h2 className="text-5xl font-display font-black uppercase tracking-tighter text-white">
               {isSubmitted ? 'Protocol Dispatched' : 'Identity Recovery'}
             </h2>
             <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
               {isSubmitted 
                 ? 'A secure recovery link has been synchronized with your corporate identity.' 
                 : 'Initiate a secure session restoration by verifying your institutional identity.'}
             </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <AnimatePresence mode="wait">
               {isSubmitted ? (
                 <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-10 text-center relative z-10"
                 >
                    <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mx-auto shadow-[0_0_50px_rgba(20,184,166,0.1)]">
                       <CheckCircle2 size={48} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      Check your institutional inbox for the <br /> 
                      <span className="text-white">Nexus Synchronization Key</span>.
                    </p>
                    <div className="flex flex-col gap-4">
                       <Button onClick={() => navigate('/login')} className="h-16 rounded-2xl bg-white text-slate-950 hover:bg-teal-400 font-black uppercase tracking-widest text-[10px] shadow-2xl">
                          Return to Terminal
                       </Button>
                       <button onClick={() => setIsSubmitted(false)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">
                          Resend Dispatch
                       </button>
                    </div>
                 </motion.div>
               ) : (
                 <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit} 
                    className="space-y-10 relative z-10"
                 >
                    <div className="space-y-4">
                       <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Identity Portal</Label>
                       <div className="relative group">
                          <Input
                             id="email"
                             type="email"
                             placeholder="ENTER CORPORATE ID"
                             value={email}
                             onChange={handleEmailChange}
                             disabled={isLoading}
                             className={cn(
                               "h-16 bg-white/[0.03] border-white/10 rounded-2xl px-6 font-display font-black tracking-widest text-white focus:bg-white/[0.06] focus:border-teal-500/50 transition-all placeholder:text-slate-700",
                               emailError && "border-rose-500/50 focus:border-rose-500/50",
                               isEmailValid && "border-teal-500/50 focus:border-teal-500/50"
                             )}
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2">
                             {isCheckingEmail ? (
                                <Loader2 size={16} className="animate-spin text-teal-500" />
                             ) : isEmailValid ? (
                                <CheckCircle2 size={16} className="text-teal-500" />
                             ) : emailError ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                             ) : null}
                          </div>
                       </div>
                       {emailError && (
                         <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 ml-2">{emailError}</p>
                       )}
                    </div>

                    <Button 
                       type="submit" 
                       disabled={isLoading || !isEmailValid}
                       className="w-full h-20 rounded-2xl bg-teal-500 text-slate-950 hover:bg-teal-400 font-black uppercase tracking-[0.25em] text-xs shadow-2xl disabled:opacity-30 group transition-all duration-500"
                    >
                       <span className="relative z-10 flex items-center justify-center gap-3">
                          {isLoading ? (
                             <><Loader2 size={18} className="animate-spin" /> DISPATCHING...</>
                          ) : (
                             <>RESTORE ACCESS <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" /></>
                          )}
                       </span>
                    </Button>

                    <div className="text-center">
                       <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                          <ArrowLeft size={14} /> Back to Terminal Access
                       </Link>
                    </div>
                 </motion.form>
               )}
             </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-6 opacity-40">
             <div className="flex items-center gap-8 grayscale">
                <span className="text-[9px] font-black uppercase tracking-widest">SOC2 Type II</span>
                <span className="text-[9px] font-black uppercase tracking-widest">ISO 27001</span>
                <span className="text-[9px] font-black uppercase tracking-widest">v2.5.0-PF</span>
             </div>
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                © 2026 YVI Enterprise Management Systems. Institutional Grade.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}