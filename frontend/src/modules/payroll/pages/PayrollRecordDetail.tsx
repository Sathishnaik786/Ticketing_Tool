import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Calendar, 
  Calculator, 
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { usePayrollRecord } from '../hooks/usePayroll';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

const PayrollRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading } = usePayrollRecord(id!);

  if (isLoading) return <div className="p-8 text-white">Loading payroll record...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Link to={`/app/payroll/cycles/${record?.payroll_cycle_id}`}>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                    <ArrowLeft size={20} />
                </Button>
            </Link>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Payroll Record</h1>
                <p className="text-muted-foreground mt-1">Detailed breakdown for {record?.employee?.first_name} {record?.employee?.last_name}.</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="border-white/10 bg-white/5 text-white">
                <Download size={14} className="mr-2" /> Download JSON
            </Button>
            {record?.is_locked && (
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-4 py-1.5 h-auto rounded-lg">
                    <ShieldCheck size={14} className="mr-2" /> Immutable Snapshot
                </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Employee Summary Card */}
        <Card className="bg-white/5 border-white/10 h-fit">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                        {record?.employee?.first_name[0]}{record?.employee?.last_name[0]}
                    </div>
                    <div>
                        <CardTitle className="text-white">{record?.employee?.first_name} {record?.employee?.last_name}</CardTitle>
                        <CardDescription>{record?.employee?.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Gross Pay</p>
                        <p className="text-xl font-bold text-white mt-1">₹{Number(record?.gross_salary).toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Net Pay</p>
                        <p className="text-xl font-bold text-emerald-400 mt-1">₹{Number(record?.net_salary).toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Payable Days</span>
                        <span className="text-white font-bold">{record?.payable_days}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><AlertCircle size={14} /> LOP Days</span>
                        <span className="text-rose-400 font-bold">{record?.lop_days}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><CreditCard size={14} /> Cycle</span>
                        <span className="text-white font-bold">{record?.cycle?.cycle_name}</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Component Breakdown */}
        <Card className="lg:col-span-2 bg-white/5 border-white/10">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="text-primary" size={20} />
                    Salary Components Breakdown
                </CardTitle>
                <CardDescription>Calculated values and formula snapshots used during processing.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Component</TableHead>
                            <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Formula Snapshot</TableHead>
                            <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Calculated Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {record?.components?.sort((a, b) => a.sequence_order - b.sequence_order).map((comp) => (
                            <TableRow key={comp.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell>
                                    <div>
                                        <p className="text-sm font-bold text-white">{comp.component_name}</p>
                                        <Badge className={`text-[9px] mt-1 ${
                                            comp.component_category === 'EARNING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {comp.component_category}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-[10px] bg-black/40 p-1 rounded border border-white/5 text-amber-400 font-mono">
                                        {comp.formula_snapshot}
                                    </code>
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-white">
                                    ₹{Number(comp.calculated_amount).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-white/5 border-t-2 border-white/10">
                            <TableCell colSpan={2} className="text-sm font-bold text-white">Total Net Salary</TableCell>
                            <TableCell className="text-right text-lg font-bold text-emerald-400">₹{Number(record?.net_salary).toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollRecordDetail;
