import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, Mail, ExternalLink, ShieldAlert, CreditCard, Clock, MessageCircle, MoreHorizontal, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from '@/hooks/useNotifications';
import { notificationService, Notification as NotificationInterface } from '@/services/notificationService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message';
}

interface NotificationBellProps {
  className?: string;
}

type NotificationTab = 'all' | 'payroll' | 'approvals' | 'system';

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const { data: apiNotifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Initialize notification service
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        notificationService.connect(user.id, token);
      }
      
      const handleNewNotification = (notification: NotificationInterface) => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      };
      
      notificationService.subscribeToNotifications(handleNewNotification);
      
      return () => {
        notificationService.unsubscribeFromNotifications();
      };
    }
  }, [user?.id, queryClient]);

  // Sync API notifications to local state
  useEffect(() => {
    if (apiNotifications && user) {
      const mapped = apiNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt).toLocaleString(),
        read: n.read,
        link: n.link,
        userId: user.id,
        type: (n.type?.toLowerCase() || 'info') as any
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n: any) => !n.read).length);
    }
  }, [apiNotifications, user]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'payroll') return notifications.filter(n => n.title.toLowerCase().includes('payroll') || n.title.toLowerCase().includes('salary'));
    if (activeTab === 'approvals') return notifications.filter(n => n.title.toLowerCase().includes('approval') || n.title.toLowerCase().includes('request'));
    if (activeTab === 'system') return notifications.filter(n => n.type === 'warning' || n.type === 'error' || n.title.toLowerCase().includes('system'));
    return notifications;
  }, [notifications, activeTab]);

  const markAsRead = (id: string) => markReadMutation.mutate(id);
  const markAllAsRead = () => markAllReadMutation.mutate();

  const getIcon = (type: string, title: string) => {
    const t = title.toLowerCase();
    if (t.includes('payroll')) return <CreditCard className="h-4 w-4 text-indigo-400" />;
    if (t.includes('approval') || t.includes('leave')) return <Clock className="h-4 w-4 text-amber-400" />;
    if (t.includes('system') || type === 'error') return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    return <MessageCircle className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 rounded-xl transition-all",
          isOpen ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-100 dark:hover:bg-white/5"
        )}
      >
        <Bell className={cn("h-5 w-5 transition-transform", isOpen && "scale-110")} />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-[10px] font-black rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#0B1020]"
          >
            {unreadCount}
          </motion.span>
        )}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="absolute right-0 mt-3 w-[420px] bg-white dark:bg-[#0B1220]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl z-[100] overflow-hidden border border-white/10 flex flex-col h-[520px]"
          >
            {/* Header */}
            <div className="p-6 pb-2">
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Center Hub</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Alerts & Activity</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Clear All
                    </button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl mb-4">
                {(['all', 'payroll', 'approvals', 'system'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                      activeTab === tab ? "bg-white dark:bg-white/10 text-primary shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content Area */}
            <ScrollArea className="flex-1 px-2">
              <div className="p-4 pt-0 space-y-1">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-2xl transition-all duration-300 group/notification relative overflow-hidden",
                        !notification.read ? "bg-primary/5" : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      )}
                    >
                      {!notification.read && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-full" />}
                      
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                          {getIcon(notification.type, notification.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover/notification:text-primary transition-colors truncate pr-2">
                              {notification.title}
                            </h4>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight whitespace-nowrap pt-1">
                              {notification.timestamp.split(',')[1]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            {notification.link && (
                              <a 
                                href={notification.link}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                              >
                                View <ExternalLink size={10} />
                              </a>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
                      <Bell size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">Clean Slate</p>
                      <p className="text-xs text-slate-500">No {activeTab !== 'all' ? activeTab : ''} alerts at this moment.</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-white/5 text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">YVI Intelligence Feed • Verified Secure</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}