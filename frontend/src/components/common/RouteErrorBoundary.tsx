import React, { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { observability } from '@/services/observability';
import { 
  AlertCircle, 
  RefreshCcw, 
  Home, 
  ArrowLeft, 
  ShieldAlert,
  ChevronRight,
  ZapOff,
  CloudOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    observability.captureException(error, {
      tags: { source: 'route-error-boundary' },
      level: 'error',
    });
  }, [error]);

  let errorMessage = 'An unexpected architectural failure occurred while loading this module.';
  let errorStatus = 500;
  let isLazyFailure = false;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    if (errorMessage.includes('Failed to fetch dynamically imported module')) {
      isLazyFailure = true;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              className="p-6 rounded-3xl bg-rose-500/10 text-rose-500 mb-8 shadow-inner"
            >
              {isLazyFailure ? <CloudOff size={48} /> : <ZapOff size={48} />}
            </motion.div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
              Module Execution Error
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-md leading-relaxed">
              {isLazyFailure 
                ? 'The requested module could not be synchronized with the local environment. This is typically caused by a stale cache after a system update.' 
                : errorMessage}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              <Button 
                onClick={() => window.location.reload()}
                className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Synchronize Engine
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>

              <Button 
                variant="ghost" 
                asChild
                className="h-14 px-6 rounded-2xl font-bold text-primary"
              >
                <Link to="/app/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Terminal
                </Link>
              </Button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-12 p-6 bg-slate-950 rounded-2xl border border-white/5 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4 text-rose-400/70 font-black text-[10px] uppercase tracking-[0.2em]">
                <ShieldAlert size={14} />
                Technical Stack Trace
              </div>
              <pre className="text-[11px] text-slate-400 font-mono text-left overflow-auto max-h-[200px] scrollbar-hide">
                {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
              </pre>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RouteErrorBoundary;
