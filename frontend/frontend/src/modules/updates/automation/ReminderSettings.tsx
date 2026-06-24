import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, ShieldCheck, Clock, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { triggerReminders } from './automation.api';
import { useAuth } from '@/contexts/AuthContext';

const ReminderSettings: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
    const [loading, setLoading] = useState(false);


    const [settings, setSettings] = useState({
        daily: true,
        weekly: true,
        monthly: true,
        managerEscalation: false
    });

    const handleManualTrigger = async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            await triggerReminders();
            toast.success('System-wide reminders dispatched successfully.');
        } catch (e) {
            toast.error('Failed to trigger reminders.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
                <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <Bell className="h-6 w-6 text-amber-600" />
                        </div>
                        Automation & Notification Logic
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Configure how the system encourages reporting consistency and team visibility.</p>
                </CardHeader>

                <CardContent className="space-y-10">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Local Notification Preference</h3>

                        <div className="grid gap-6">
                            {[
                                { id: 'daily', label: 'Daily Standup Nudges', desc: 'Receive a reminder if daily log is missing by 11:00 AM', icon: Clock },
                                { id: 'weekly', label: 'Friday Recap Reminder', desc: 'Notification to finalize your weekly impact reports', icon: Clock },
                                { id: 'monthly', label: 'Strategic Alignment Alert', desc: 'Monthly review cycle notifications', icon: Bell }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/50 transition-all hover:bg-secondary/30">
                                    <div className="flex gap-4">
                                        <div className="p-2 bg-background rounded-lg shadow-sm h-fit">
                                            <item.icon className="h-4 w-4 text-primary/60" />
                                        </div>
                                        <div>
                                            <Label htmlFor={item.id} className="font-bold text-sm cursor-pointer">{item.label}</Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        id={item.id}
                                        checked={(settings as any)[item.id]}
                                        onCheckedChange={(val) => setSettings({ ...settings, [item.id]: val })}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <SeparatorWithText text="ENTERPRISE GOVERNANCE" />

                    <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <ShieldCheck className="h-5 w-5" />
                            <span className="text-sm font-black uppercase tracking-widest">Manager Oversight (Beta)</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Enabling escalation will notify your manager if updates are missing for more than 72 hours. This is designed for operational transparency, not surveillance.
                        </p>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold">Enable Manager Notifications</span>
                            <Switch
                                checked={settings.managerEscalation}
                                onCheckedChange={(val) => setSettings({ ...settings, managerEscalation: val })}
                            />
                        </div>
                    </div>
                </CardContent>

                {isAdmin && (
                    <CardFooter className="bg-secondary/10 border-t border-border/50 py-6 px-8 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">System Overrides</span>
                        </div>
                        <Button
                            onClick={handleManualTrigger}
                            disabled={loading}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 rounded-xl shadow-lg shadow-amber-500/20 text-xs uppercase"
                        >
                            Force Compliance Sync
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <p className="text-center text-[10px] font-bold text-muted-foreground opacity-30 uppercase tracking-[0.5em]">Phase-5: Automation Layer</p>
        </div>
    );
};

const SeparatorWithText = ({ text }: { text: string }) => (
    <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-border/30"></div>
        <span className="flex-shrink mx-4 text-[9px] font-black text-muted-foreground/30 tracking-[0.3em] uppercase">{text}</span>
        <div className="flex-grow border-t border-border/30"></div>
    </div>
);

export default ReminderSettings;
