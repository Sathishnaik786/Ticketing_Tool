import React from 'react';
import { 
  Settings, 
  Calendar, 
  DollarSign, 
  RefreshCcw, 
  ShieldCheck,
  Save,
  Globe,
  Coins
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const PayrollSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Payroll Settings</h1>
          <p className="text-muted-foreground mt-1">Configure global payroll rules, cycles, and currency.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payroll Cycle */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Payroll Cycle
            </CardTitle>
            <CardDescription>Define when your payroll starts and ends each month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cycle Start Day</Label>
                <Input defaultValue="1" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cycle End Day</Label>
                <Input defaultValue="31" className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Default Payout Day</Label>
              <Input defaultValue="5" className="bg-white/5 border-white/10 text-white" />
            </div>
          </CardContent>
        </Card>

        {/* Currency & Rounding */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="text-amber-500" size={20} />
              Currency & Rounding
            </CardTitle>
            <CardDescription>Configure currency display and calculation rounding.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Default Currency</Label>
              <Select defaultValue="INR">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1c23] border-white/10 text-white">
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Rounding Method</Label>
              <Select defaultValue="HALF_UP">
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1c23] border-white/10 text-white">
                  <SelectItem value="HALF_UP">Round Half Up (Standard)</SelectItem>
                  <SelectItem value="FLOOR">Floor (Always Down)</SelectItem>
                  <SelectItem value="CEIL">Ceil (Always Up)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Security */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} />
              Compliance & Audit
            </CardTitle>
            <CardDescription>Security and audit log configurations.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-white">Detailed Audit Logging</Label>
                <p className="text-xs text-muted-foreground">Log every change in salary components and assignments.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-white">Formula Validation</Label>
                <p className="text-xs text-muted-foreground">Prevent saving invalid formulas in components.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-white">MFA for Salary Changes</Label>
                <p className="text-xs text-muted-foreground">Require two-factor authentication to modify CTC.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <Label className="text-white">Auto-Calculate Net Salary</Label>
                <p className="text-xs text-muted-foreground">Recalculate Net pay automatically on EARNING change.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PayrollSettings;
