import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Employee, Role } from '@/types';

interface EmployeeUpdateCardProps {
    employee: Employee;
    hasDaily?: boolean;
    hasWeekly?: boolean;
    hasMonthly?: boolean;
    className?: string;
}

const roleColors: Record<Role, string> = {
    ADMIN: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    HR: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    MANAGER: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    EMPLOYEE: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

export const EmployeeUpdateCard: React.FC<EmployeeUpdateCardProps> = ({
    employee,
    hasDaily = false,
    hasWeekly = false,
    hasMonthly = false,
    className
}) => {
    const navigate = useNavigate();
    const fullName = `${employee.firstName} ${employee.lastName}`;
    const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

    const handleClick = () => {
        navigate(`/app/updates/employee/${employee.userId || employee.id}`);
    };

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-primary/5 bg-card/50 backdrop-blur-sm",
                className
            )}
            onClick={handleClick}
        >
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <AvatarImage src={employee.profile_image || employee.avatar} alt={fullName} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">{initials}</AvatarFallback>
                        </Avatar>

                        {/* Indicators Container */}
                        <div className="absolute -bottom-2 right-0 left-0 flex justify-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-md rounded-full shadow-sm border border-border/50 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <Indicator dot="D" active={hasDaily} label="Daily Update" color="bg-blue-500" />
                            <Indicator dot="W" active={hasWeekly} label="Weekly Update" color="bg-purple-500" />
                            <Indicator dot="M" active={hasMonthly} label="Monthly Update" color="bg-amber-500" />
                        </div>
                    </div>

                    <div className="space-y-1 w-full">
                        <h3 className="font-bold text-lg tracking-tight truncate">{fullName}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest truncate">
                            {employee.position}
                        </p>
                    </div>

                    <Badge
                        variant="outline"
                        className={cn("mt-2 rounded-full px-4 py-0.5 text-[10px] font-black uppercase tracking-tighter border-none", roleColors[employee.role])}
                    >
                        {employee.role}
                    </Badge>

                    {/* Quick Info Summary */}
                    <div className="w-full pt-4 border-t border-border/10 flex items-center justify-center gap-4 text-muted-foreground/40 font-black text-[9px] uppercase tracking-[0.2em]">
                        <span className={cn(hasDaily && "text-blue-500")}>Daily</span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className={cn(hasWeekly && "text-purple-500")}>Weekly</span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className={cn(hasMonthly && "text-amber-500")}>Monthly</span>
                    </div>
                </div>
            </CardContent>

            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 bg-primary/10 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Card>
    );
};

interface IndicatorProps {
    dot: string;
    active: boolean;
    label: string;
    color: string;
}

const Indicator: React.FC<IndicatorProps> = ({ dot, active, label, color }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all",
                    active ? `${color} text-white` : "bg-muted text-muted-foreground/40"
                )}>
                    {dot}
                </div>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="text-[10px] font-bold uppercase tracking-widest">{label}: {active ? 'Available' : 'Pending'}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
