import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  FileText, 
  History, 
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { usePayrollCycle, useProcessingLogs } from '../hooks/usePayroll';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';

const PayrollCycleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: cycle, isLoading: cycleLoading } = usePayrollCycle(id!);
  const { data: logs } = useProcessingLogs(id!);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = cycle?.records?.filter(r => 
    `${r.employee?.first_name} ${r.employee?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employee?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: 'Total Employees', value: cycle?.records?.length || 0, icon: Users, color: 'text-blue-500' },
    { title: 'Processed', value: cycle?.records?.filter(r => r.status === 'PROCESSED' || r.status === 'LOCKED').length || 0, icon: CheckCircle2, color: 'text-emerald-500' },
    { title: 'Failed', value: cycle?.records?.filter(r => r.status === 'FAILED').length || 0, icon: XCircle, color: 'text-rose-500' },
    { title: 'Total Net Payout', value: `₹${(cycle?.records?.reduce((acc, r) => acc + Number(r.net_salary), 0) || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-500' },
  ];

  if (cycleLoading) return <div className="p-8 text-white">Loading cycle details...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/app/payroll/cycles">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{cycle?.cycle_name}</h1>
          <p className="text-muted-foreground mt-1">Processing summary and employee records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="records" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Employee Records
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Processing Logs
          </TabsTrigger>
          <TabsTrigger value="summary" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search employees..." 
                        className="pl-10 bg-white/5 border-white/10 text-white focus-visible:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Employee</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Gross</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Net Salary</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Working Days</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords?.map((record) => (
                            <TableRow key={record.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {record.employee?.first_name[0]}{record.employee?.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{record.employee?.first_name} {record.employee?.last_name}</p>
                                            <p className="text-[10px] text-muted-foreground">{record.employee?.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-white font-mono text-sm">₹{Number(record.gross_salary).toLocaleString()}</TableCell>
                                <TableCell className="text-emerald-400 font-bold font-mono">₹{Number(record.net_salary).toLocaleString()}</TableCell>
                                <TableCell className="text-muted-foreground text-xs">{record.payable_days} / {record.working_days}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        record.status === 'PROCESSED' || record.status === 'LOCKED' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }>
                                        {record.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link to={`/app/payroll/records/${record.id}`}>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                            <ChevronRight size={18} />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </TabsContent>

        <TabsContent value="logs">
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Processing History</CardTitle>
                    <CardDescription>Chronological sequence of engine execution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs?.map((log) => (
                            <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                    log.log_level === 'ERROR' ? 'bg-rose-500' : log.log_level === 'WARN' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                <div className="flex-1">
                                    <p className="text-sm text-white">{log.message}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        {log.employee_id && <Badge className="text-[9px] bg-white/5 text-muted-foreground">EMP: {log.employee_id.slice(0,8)}</Badge>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollCycleDetail;
