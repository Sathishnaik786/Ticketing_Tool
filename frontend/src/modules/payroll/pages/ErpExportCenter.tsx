import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Download, 
  Clock, 
  ChevronRight,
  FileCode,
  Table as TableIcon,
  HardDrive,
  CloudUpload,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ErpExportCenter = () => {
  const erpSystems = [
    { name: 'Tally Prime', icon: FileCode, description: 'XML-based journal voucher export.', color: 'text-orange-500' },
    { name: 'SAP S/4HANA', icon: Database, description: 'IDoc/CSV compatible posting file.', color: 'text-blue-500' },
    { name: 'Oracle ERP', icon: HardDrive, description: 'FBDI spreadsheet compatible format.', color: 'text-rose-500' },
    { name: 'Generic ERP', icon: TableIcon, description: 'Universal CSV/Excel ledger export.', color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">ERP Export Center</h1>
        <p className="text-muted-foreground mt-1">Generate and download financial data formatted for your accounting system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {erpSystems.map((erp, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/[0.08] transition-all group overflow-hidden">
                  <CardContent className="p-8">
                      <div className="flex items-start justify-between">
                          <div className="flex gap-6">
                              <div className={`p-4 rounded-2xl bg-white/5 ${erp.color}`}>
                                  <erp.icon size={32} />
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white">{erp.name}</h3>
                                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">{erp.description}</p>
                                  <div className="flex gap-2 mt-4">
                                      <Badge variant="outline" className="text-[10px] border-white/10 text-white">V12.0 Support</Badge>
                                      <Badge variant="outline" className="text-[10px] border-white/10 text-white">Double Entry</Badge>
                                  </div>
                              </div>
                          </div>
                          <Button className="bg-white/10 hover:bg-white/20 text-white border-none">
                              Generate
                          </Button>
                      </div>
                  </CardContent>
                  <div className="h-1 w-0 bg-primary group-hover:w-full transition-all duration-700" />
              </Card>
          ))}
      </div>

      <Card className="bg-white/5 border-white/10">
          <CardHeader>
              <CardTitle className="text-white">Recent Exports</CardTitle>
              <CardDescription>History of financial data packages generated.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {[
                      { name: 'Tally_Export_April2026.xml', date: '2 hours ago', size: '420 KB', status: 'COMPLETED' },
                      { name: 'SAP_Postings_April2026.csv', date: 'Yesterday', size: '1.2 MB', status: 'COMPLETED' },
                  ].map((exportItem, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  <CloudUpload size={18} />
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-white">{exportItem.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{exportItem.date} • {exportItem.size}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-none">{exportItem.status}</Badge>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                  <Download size={18} />
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    </div>
  );
};

export default ErpExportCenter;
