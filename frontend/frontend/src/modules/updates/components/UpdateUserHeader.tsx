import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Zap, Target, Trophy, Shield, User as UserIcon, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpdateUserHeaderProps {
    userProfile: {
        id: string;
        name: string;
        role: string;
        position: string;
        profile_image: string;
    };
    createdAt: string;
    updateTypeLabel?: string;
    isOwner?: boolean;
}

const roleColors: Record<string, string> = {
    'ADMIN': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    'HR': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'MANAGER': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'EMPLOYEE': 'bg-blue-500/10 text-blue-600 border-blue-500/20'
};

const roleLabels: Record<string, string> = {
    'ADMIN': 'Administrator',
    'HR': 'HR Specialist',
    'MANAGER': 'Manager',
    'EMPLOYEE': 'Team Member'
};

const typeStyles: Record<string, { color: string; icon: React.ElementType }> = {
    'Daily Standup': { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Zap },
    'Weekly Stand-out': { color: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Target },
    'Monthly Update': { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Trophy }
};

const UpdateUserHeader: React.FC<UpdateUserHeaderProps> = ({
    userProfile,
    createdAt,
    updateTypeLabel,
    isOwner
}) => {
    const displayRole = roleLabels[userProfile.role] || userProfile.role;
    const roleStyle = roleColors[userProfile.role] || roleColors.EMPLOYEE;
    const typeStyle = updateTypeLabel ? typeStyles[updateTypeLabel] : null;

    return (
        <div className="flex flex-row items-center gap-4 w-full group/header">
            <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-background shadow-xl transition-transform group-hover/header:scale-105 duration-300">
                    <AvatarImage src={userProfile.profile_image} alt={userProfile.name} className="object-cover" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-bold">
                        {userProfile.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {isOwner && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-lg">
                        <UserIcon className="h-2.5 w-2.5 text-white" />
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base leading-none tracking-tight">
                            {userProfile.name}
                        </h3>
                        <Badge variant="outline" className={cn("text-[9px] h-4 px-2 uppercase tracking-widest font-medium border-none", roleStyle)}>
                            {displayRole}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 opacity-50" />
                            <span>{userProfile.position}</span>
                        </div>
                        <span className="opacity-20">•</span>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 opacity-50" />
                            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>

                {updateTypeLabel && typeStyle && (
                    <Badge variant="outline" className={cn(
                        "w-fit text-[10px] font-medium uppercase tracking-widest py-1 px-3 h-7 flex items-center gap-1.5 transition-all duration-300 border shadow-sm",
                        typeStyle.color
                    )}>
                        <typeStyle.icon className="h-3 w-3" />
                        {updateTypeLabel === 'Daily Standup' ? 'DAILY' : updateTypeLabel === 'Weekly Stand-out' ? 'WEEKLY' : 'MONTHLY'}
                    </Badge>
                )}
            </div>
        </div>
    );
};

export default UpdateUserHeader;
