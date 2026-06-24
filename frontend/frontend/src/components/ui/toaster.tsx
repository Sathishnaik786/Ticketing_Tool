import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  // Auto-dismiss success toasts after 3 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast) => {
      if (toast.variant === 'success' && toast.open) {
        const timer = setTimeout(() => {
          dismiss(toast.id);
        }, 3000);
        timers.push(timer);
      }
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  const getIcon = (variant?: string) => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 flex-shrink-0" />;
      case 'destructive':
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {getIcon(variant) && (
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(variant)}
              </div>
            )}
            <div className="grid gap-1 flex-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
