import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Flame, ArrowRight } from 'lucide-react';
import { authApi } from '@/services/api';
import { cn } from '@/lib/utils';
import BackgroundVisual from '@/components/auth/BackgroundVisual';
import LoginInput from '@/components/auth/LoginInput';
import ThemeToggle from '@/components/auth/ThemeToggle';
import TrustBadge from '@/components/auth/TrustBadge';
import { TicketraBrandMark } from '@/components/common/TicketraBrandMark';

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
      setEmailError('Invalid email format');
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
        setEmailError('Identity not found in database');
      }
    } catch (error: any) {
      setEmailError('Server connection error');
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
        title: 'Protocol initiated',
        description: 'Recovery instructions dispatched to your identity.',
      });
    } catch (error: any) {
      toast({
        title: 'Server Error',
        description: error.message || 'Failed to dispatch recovery link.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-900 dark:text-slate-100 font-sans overflow-y-auto relative selection:bg-orange-500/10 selection:text-orange-500 py-12 px-4 sm:px-6 md:px-8 w-full bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
      {/* 🌌 Cinematic Backdrop */}
      <BackgroundVisual />

      {/* Subtle, Vercel-style Theme Switcher */}
      <ThemeToggle />
      
      {/* Centered card frame */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-[440px] mx-auto my-auto space-y-6">
        
        {/* 🏢 Brand Header */}
        <div className="flex justify-center mb-2">
          <Link to="/" className="group select-none pointer-events-none">
            <TicketraBrandMark size="xl" className="h-10 sm:h-11" />
          </Link>
        </div>

        {/* Narrative / Header */}
        <div className="space-y-1 text-center w-full select-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-semibold tracking-wide border border-orange-500/10 mb-2">
            <ShieldCheck size={11} />
            <span>Security protocol 842</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-slate-800 dark:text-white leading-tight">
            {isSubmitted ? 'Instructions dispatched' : 'Recover access'}
          </h2>
          <p className="text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-balanced">
            {isSubmitted
              ? 'A secure recovery link has been synchronized with your corporate identity.'
              : 'Initiate a secure restoration by verifying your email address.'}
          </p>
        </div>

        {/* Glass Card Box wrapper */}
        <div className="w-[100%] p-5 sm:p-8 rounded-[2rem] bg-white/[0.22] dark:bg-slate-950/[0.22] border border-white/30 dark:border-white/10 hover:border-white/45 dark:hover:border-white/20 shadow-[0_24px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-500 relative overflow-hidden group text-slate-900 dark:text-white">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-orange-500/5 blur-[50px] pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center relative z-10"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-655 dark:text-orange-400 mx-auto shadow-sm">
                  <CheckCircle2 size={26} className="stroke-[2.5]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                  Check your inbox for your <br />
                  <span className="text-orange-600 dark:text-orange-400 font-bold">synchronization link</span>.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-450 text-white font-display font-bold tracking-wide text-sm shadow-[0_8px_20px_rgba(249,115,22,0.12)] border-none transition-all duration-300 w-full group/btn"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Return to Access Portal
                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform stroke-[2.5]" />
                    </span>
                  </Button>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200 transition-colors"
                  >
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
                className="space-y-5 relative z-10"
              >
                <LoginInput
                  id="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your professional mail"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className={cn(
                    emailError && "border-rose-500/40 focus:border-rose-500/40 focus-visible:ring-rose-500/10",
                    isEmailValid && "border-emerald-500/40 focus:border-emerald-500/40 focus-visible:ring-emerald-500/10"
                  )}
                  rightElement={
                    <div className="flex items-center mr-1">
                      {isCheckingEmail ? (
                        <Loader2 size={14} className="animate-spin text-orange-500" />
                      ) : isEmailValid ? (
                        <CheckCircle2 size={14} className="text-emerald-500 stroke-[2.5]" />
                      ) : emailError ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      ) : null}
                    </div>
                  }
                />
                {emailError && (
                  <p className="text-[11px] font-medium text-rose-500 ml-1 -mt-3.5 select-none">{emailError}</p>
                )}

                <div className="w-full relative group/btn">
                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailValid}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-450 text-white font-display font-bold tracking-wide text-sm shadow-[0_8px_20px_rgba(249,115,22,0.12)] hover:shadow-[0_12px_28px_rgba(249,115,22,0.22)] border-none disabled:opacity-40 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Shimmer sweep effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                    <span className="flex items-center justify-center gap-2 relative z-10">
                      {isLoading ? (
                        <><Loader2 size={14} className="animate-spin text-white stroke-[2.5]" /> Dispatching...</>
                      ) : (
                        <>Send Recovery Link <ArrowRight size={14} className="stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-705 dark:hover:text-slate-205 transition-colors">
                    <ArrowLeft size={13} className="stroke-[2.5]" /> Back to Access Portal
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <TrustBadge />
        </div>

      </div>

      {/* Global copyright footer */}
      <div className="w-full text-center pt-8 border-t border-slate-200/50 dark:border-white/5 max-w-[440px] mx-auto relative z-10 transition-colors duration-500">
        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 leading-normal select-none">
          © 2026 Ticketra. All rights reserved.
        </span>
      </div>
    </div>
  );
}