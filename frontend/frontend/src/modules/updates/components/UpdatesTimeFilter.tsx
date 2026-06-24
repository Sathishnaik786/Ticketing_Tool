import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UpdatesTimeFilterProps {
    mode: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    value: string;
    onChange: (value: string) => void;
}

const UpdatesTimeFilter: React.FC<UpdatesTimeFilterProps> = ({ mode, value, onChange }) => {
    const handleClear = () => onChange('');

    const getLabel = () => {
        switch (mode) {
            case 'DAILY': return 'Filter by Date';
            case 'WEEKLY': return 'Filter by Week';
            case 'MONTHLY': return 'Filter by Month';
            default: return 'Filter';
        }
    };

    const getType = () => {
        switch (mode) {
            case 'DAILY': return 'date';
            case 'WEEKLY': return 'date'; // Better to use date as start of week for backend simplicity
            case 'MONTHLY': return 'month';
            default: return 'date';
        }
    };

    return (
        <Card className="p-3 mb-6 bg-primary/5 border-primary/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Filter className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-foreground leading-none">{getLabel()}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {value ? `Viewing results for ${value}` : 'Showing all recent updates'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        type={getType()}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="pl-9 h-9 text-sm w-[180px] sm:w-[220px] bg-background border-primary/20 focus-visible:ring-primary"
                    />
                </div>
                {value && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-9 px-2 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </Card>
    );
};

export default UpdatesTimeFilter;
