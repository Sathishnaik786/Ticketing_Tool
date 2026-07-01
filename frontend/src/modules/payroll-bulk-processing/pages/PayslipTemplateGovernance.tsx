import React, { useState, useEffect } from 'react';
import { 
  Paintbrush, 
  Database, 
  FileText, 
  Settings, 
  Eye, 
  Save, 
  Check, 
  History,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ToggleLeft,
  Building,
  MapPin,
  Signature,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { BulkUploadService } from '../services/bulkUploadService';
import { cn } from '@/lib/utils';


export default function PayslipTemplateGovernance() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>({
    template_name: 'Standard Corporate Blueprint',
    organization_name: 'Ticketra',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    company_address: '123 Enterprise Corporate Boulevard, Tech Park, Suite 400',
    footer_text: 'This is a computer-generated document and does not require a physical signature.',
    watermark_text: 'CONFIDENTIAL',
    theme_colors: { primary: '#0f172a', secondary: '#475569', accent: '#10b981' },
    font_family: 'Inter',
    bank_section_enabled: true,
    statutory_section_enabled: true,
    signature_enabled: true,
    qr_verification_enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  const fetchTemplateData = async () => {
    setFetching(true);
    try {
      const data = await BulkUploadService.getTemplates();
      setTemplates(data);
      const active = data.find((t: any) => t.is_active);
      if (active) {
        setSelectedTemplate(active);
      }
    } catch (err: any) {
      console.error('[FETCH_TEMPLATES_FAILURE]', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTemplateData();
  }, []);

  const handleColorChange = (key: string, value: string) => {
    setSelectedTemplate((prev: any) => ({
      ...prev,
      theme_colors: {
        ...prev.theme_colors,
        [key]: value
      }
    }));
  };

  const handleToggle = (key: string) => {
    setSelectedTemplate((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedTemplate.id) {
        const updated = await BulkUploadService.updateTemplate(selectedTemplate.id, selectedTemplate);
        toast({
          title: 'Template Upgraded',
          description: `Template "${updated.template_name}" successfully upgraded to version ${updated.version_number}.`
        });
      } else {
        const created = await BulkUploadService.createTemplate(selectedTemplate);
        toast({
          title: 'Template Created',
          description: `New template "${created.template_name}" added to design pipeline.`
        });
      }
      fetchTemplateData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failure',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    setLoading(true);
    try {
      const activated = await BulkUploadService.activateTemplate(id);
      toast({
        title: 'Institutional Style Locked',
        description: `"${activated.template_name}" is now the active template for all salary statement PDF generations.`
      });
      fetchTemplateData();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Activation Failure',
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 md:p-12 space-y-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest text-[9px] font-black rounded-lg px-2.5 py-1">
            <Sparkles size={10} className="inline mr-1" /> Enterprise Branding
          </Badge>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <Building className="text-white" /> Payslip Governance
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure institutional identities, dynamic colors, watermark, and digital signatures. Locked templates serve as the immutable presentation layer for employees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form (7 Cols) */}
        <div className="xl:col-span-7 bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Settings className="text-amber-400" size={18} />
            <h2 className="text-lg font-black uppercase tracking-tight">Template settings</h2>
          </div>

          <div className="space-y-6">
            {/* Row 1: Name and Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Template Blueprint Name</label>
                <Input 
                  value={selectedTemplate.template_name || ''} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, template_name: e.target.value})}
                  className="bg-slate-950 border-white/10 rounded-xl text-xs py-5 text-white"
                  placeholder="e.g. Standard Corporate Blueprint"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Corporate Organization Name</label>
                <Input 
                  value={selectedTemplate.organization_name || ''} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, organization_name: e.target.value})}
                  className="bg-slate-950 border-white/10 rounded-xl text-xs py-5 text-white"
                  placeholder="e.g. Ticketra"
                />
              </div>
            </div>

            {/* Row 2: Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Company Address (PDF Header)</label>
              <Textarea 
                value={selectedTemplate.company_address || ''} 
                onChange={(e) => setSelectedTemplate({...selectedTemplate, company_address: e.target.value})}
                className="bg-slate-950 border-white/10 rounded-xl text-xs p-4 text-white min-h-[60px]"
                placeholder="e.g. 123 Enterprise Corporate Boulevard, Tech Park, Suite 400"
              />
            </div>

            {/* Row 3: Logo and Watermark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Logo URL (Image Link)</label>
                <Input 
                  value={selectedTemplate.logo_url || ''} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, logo_url: e.target.value})}
                  className="bg-slate-950 border-white/10 rounded-xl text-xs py-5 text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Watermark Text</label>
                <Input 
                  value={selectedTemplate.watermark_text || ''} 
                  onChange={(e) => setSelectedTemplate({...selectedTemplate, watermark_text: e.target.value})}
                  className="bg-slate-950 border-white/10 rounded-xl text-xs py-5 text-white"
                  placeholder="CONFIDENTIAL"
                />
              </div>
            </div>

            {/* Row 4: Colors & Fonts */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Paintbrush size={14} className="text-amber-400" />
                <h4 className="text-xs font-black uppercase text-slate-400">Institutional Color Scheme & Fonts</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Primary Color</label>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <input 
                      type="color" 
                      value={selectedTemplate.theme_colors?.primary || '#0f172a'} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[9px] text-slate-400 uppercase">{selectedTemplate.theme_colors?.primary || '#0f172a'}</span>
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Secondary Color</label>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <input 
                      type="color" 
                      value={selectedTemplate.theme_colors?.secondary || '#475569'} 
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[9px] text-slate-400 uppercase">{selectedTemplate.theme_colors?.secondary || '#475569'}</span>
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Accent Color</label>
                  <div className="flex items-center justify-center gap-2 mt-1.5">
                    <input 
                      type="color" 
                      value={selectedTemplate.theme_colors?.accent || '#10b981'} 
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-[9px] text-slate-400 uppercase">{selectedTemplate.theme_colors?.accent || '#10b981'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Section Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-2xl border border-white/5 items-center text-center justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Bank Details</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggle('bank_section_enabled')}
                  className={cn(
                    "h-8 px-4 rounded-xl text-[9px] font-black uppercase transition-all",
                    selectedTemplate.bank_section_enabled 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {selectedTemplate.bank_section_enabled ? 'Active' : 'Disabled'}
                </Button>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-2xl border border-white/5 items-center text-center justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Statutory Section</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggle('statutory_section_enabled')}
                  className={cn(
                    "h-8 px-4 rounded-xl text-[9px] font-black uppercase transition-all",
                    selectedTemplate.statutory_section_enabled 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {selectedTemplate.statutory_section_enabled ? 'Active' : 'Disabled'}
                </Button>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-2xl border border-white/5 items-center text-center justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">Signature Badge</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggle('signature_enabled')}
                  className={cn(
                    "h-8 px-4 rounded-xl text-[9px] font-black uppercase transition-all",
                    selectedTemplate.signature_enabled 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {selectedTemplate.signature_enabled ? 'Active' : 'Disabled'}
                </Button>
              </div>

              <div className="flex flex-col gap-2 p-4 bg-slate-950 rounded-2xl border border-white/5 items-center text-center justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">QR Security</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleToggle('qr_verification_enabled')}
                  className={cn(
                    "h-8 px-4 rounded-xl text-[9px] font-black uppercase transition-all",
                    selectedTemplate.qr_verification_enabled 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {selectedTemplate.qr_verification_enabled ? 'Active' : 'Disabled'}
                </Button>
              </div>
            </div>

            {/* Row 6: Footer Text */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Document Footer Note</label>
              <Input 
                value={selectedTemplate.footer_text || ''} 
                onChange={(e) => setSelectedTemplate({...selectedTemplate, footer_text: e.target.value})}
                className="bg-slate-950 border-white/10 rounded-xl text-xs py-5 text-white"
                placeholder="This is a computer generated document..."
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex justify-end gap-3">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-5 rounded-2xl text-xs font-black uppercase bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Upgrade Template Version
            </Button>
          </div>
        </div>

        {/* Right: Live A4 Preview Panel (5 Cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
              <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Eye size={16} className="text-amber-400" />
                Live Branded A4 Preview
              </h3>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[9px] font-bold rounded-lg px-2">
                Live Trace
              </Badge>
            </div>

            {/* Simulated PDF A4 Sheet */}
            <div 
              style={{ fontFamily: selectedTemplate.font_family === 'Inter' ? 'Inter, sans-serif' : 'Arial, sans-serif' }}
              className="w-full aspect-[1/1.4] bg-white rounded-3xl p-6 text-slate-800 shadow-inner relative overflow-hidden flex flex-col justify-between border border-white/10"
            >
              {/* Watermark layer */}
              {selectedTemplate.watermark_text && (
                <div 
                  style={{ color: 'rgba(0,0,0,0.03)' }}
                  className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold uppercase select-none pointer-events-none transform -rotate-[30deg] tracking-widest z-0"
                >
                  {selectedTemplate.watermark_text}
                </div>
              )}

              <div className="space-y-5 z-10">
                {/* Header */}
                <div 
                  style={{ borderBottom: `2.5px solid ${selectedTemplate.theme_colors?.primary || '#0f172a'}` }}
                  className="flex justify-between items-center pb-3"
                >
                  <div className="flex items-center gap-3">
                    {selectedTemplate.logo_url && (
                      <img 
                        src={selectedTemplate.logo_url} 
                        className="max-h-7 max-w-[60px] object-contain rounded" 
                        alt="Logo"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <h4 
                        style={{ color: selectedTemplate.theme_colors?.primary || '#0f172a' }}
                        className="text-[11px] font-extrabold uppercase leading-tight tracking-tight"
                      >
                        {selectedTemplate.organization_name || 'Organization'}
                      </h4>
                      <p className="text-[7px] text-slate-500 font-bold tracking-tight max-w-[150px] truncate">
                        {selectedTemplate.company_address || 'Address'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 
                      style={{ color: selectedTemplate.theme_colors?.primary || '#0f172a' }}
                      className="text-[10px] font-black uppercase leading-tight"
                    >
                      Salary Statement
                    </h4>
                    <p className="text-[8px] text-slate-500 font-extrabold">May / 2026</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h5 
                      style={{ color: selectedTemplate.theme_colors?.secondary || '#475569', borderBottom: '1px solid #e2e8f0' }}
                      className="text-[7px] font-black uppercase pb-1 tracking-wider"
                    >
                      Employee Details
                    </h5>
                    <div className="text-[7px] space-y-0.5 leading-tight">
                      <p className="flex justify-between"><span className="font-bold text-slate-500">Name:</span> <span className="font-semibold">Hari Charan</span></p>
                      <p className="flex justify-between"><span className="font-bold text-slate-500">Code:</span> <span className="font-semibold">TK0021</span></p>
                      <p className="flex justify-between"><span className="font-bold text-slate-500">Designation:</span> <span className="font-semibold">Lead Developer</span></p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 
                      style={{ color: selectedTemplate.theme_colors?.secondary || '#475569', borderBottom: '1px solid #e2e8f0' }}
                      className="text-[7px] font-black uppercase pb-1 tracking-wider"
                    >
                      Payment details
                    </h5>
                    <div className="text-[7px] space-y-0.5 leading-tight">
                      {selectedTemplate.bank_section_enabled ? (
                        <>
                          <p className="flex justify-between"><span className="font-bold text-slate-500">Bank:</span> <span className="font-semibold">Axis Bank</span></p>
                          <p className="flex justify-between"><span className="font-bold text-slate-500">A/C:</span> <span className="font-semibold">*****9834</span></p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic font-medium">[Bank Details Disabled]</p>
                      )}
                      {selectedTemplate.statutory_section_enabled ? (
                        <>
                          <p className="flex justify-between"><span className="font-bold text-slate-500">PAN:</span> <span className="font-semibold">BPWPB3492G</span></p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic font-medium">[Statutory Details Disabled]</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Simulation */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[6px] border-collapse mb-0 shadow-none">
                    <thead>
                      <tr className="bg-slate-50 text-[6px] text-slate-500 font-bold border-b border-slate-200 uppercase">
                        <th className="p-1 px-2 border-0 bg-slate-50 text-slate-500 font-black">Earnings</th>
                        <th className="p-1 px-2 text-right border-0 bg-slate-50 text-slate-500 font-black">Amount</th>
                        <th className="p-1 px-2 border-0 bg-slate-50 text-slate-500 font-black">Deductions</th>
                        <th className="p-1 px-2 text-right border-0 bg-slate-50 text-slate-500 font-black">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[6px] leading-tight">
                      <tr>
                        <td className="p-1 px-2">Basic Salary</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">12,500.00</td>
                        <td className="p-1 px-2">Provident Fund (PF)</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">1,800.00</td>
                      </tr>
                      <tr>
                        <td className="p-1 px-2">HRA</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">5,000.00</td>
                        <td className="p-1 px-2">ESI</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">250.00</td>
                      </tr>
                      <tr>
                        <td className="p-1 px-2">Special Allowance</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">1,917.00</td>
                        <td className="p-1 px-2">Income Tax (TDS)</td>
                        <td className="p-1 px-2 text-right font-mono font-bold">500.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Net Words */}
                <div 
                  style={{ color: selectedTemplate.theme_colors?.primary || '#0f172a' }}
                  className="text-[7px] font-extrabold uppercase tracking-tight"
                >
                  Net Salary: Sixteen Thousand Eight Hundred Sixty-Seven Rupees Only
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-[6px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-500">
                    <strong>Notes:</strong> Please verify details. Report discrepancies to HR within 5 working days.
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[7px] space-y-0.5 font-bold">
                    <p className="flex justify-between text-slate-500"><span>Gross:</span> <span>₹ 19,417.00</span></p>
                    <p className="flex justify-between text-slate-500"><span>Deductions:</span> <span>₹ 2,550.00</span></p>
                    <p 
                      style={{ color: selectedTemplate.theme_colors?.primary || '#0f172a', borderTop: '1px dashed #cbd5e1' }}
                      className="flex justify-between pt-1 font-extrabold text-[8px]"
                    >
                      <span>Net:</span> <span>₹ 16,867.00</span>
                    </p>
                  </div>
                </div>

                {selectedTemplate.signature_enabled && (
                  <div className="flex justify-end pr-2">
                    <div className="text-center border-t border-dashed border-slate-300 w-24 pt-1 text-[5px] text-slate-400 font-bold uppercase">
                      <div className="text-[5px] text-emerald-500 font-extrabold flex items-center justify-center gap-0.5">
                        <Signature size={6} /> ✓ Digitally Signed
                      </div>
                      Authorized HR
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 pt-2 text-center text-[5px] text-slate-400 space-y-0.5 leading-none font-bold">
                <p className="truncate max-w-full">{selectedTemplate.footer_text || 'Footer'}</p>
                <p className="text-[4px]">Immutable Verification Hash: fa637e9014bcf082d...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Template Governance Database Version History */}
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <History className="text-amber-400" size={18} />
              Branding Template Registry
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Historical configurations vault</p>
          </div>
        </div>

        <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-white/[0.02]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500">Template Blueprint</th>
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500">Organization</th>
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500">Active Status</th>
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500">Style Version</th>
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500">Watermark Text</th>
                <th className="p-4 px-6 text-[9px] font-black uppercase text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[10px] font-black uppercase text-slate-600 tracking-wider">
                    No records found in design catalog.
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 px-6 font-bold text-white uppercase">{t.template_name}</td>
                    <td className="p-4 px-6 text-slate-400 font-medium">{t.organization_name}</td>
                    <td className="p-4 px-6">
                      <Badge className={cn(
                        "rounded-lg font-black text-[8px] uppercase px-2 py-0.5 border",
                        t.is_active 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 px-6 font-mono text-[10px] font-bold text-amber-500">v{t.version_number}</td>
                    <td className="p-4 px-6 font-semibold text-slate-400 uppercase">{t.watermark_text || '---'}</td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTemplate(t)}
                          className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5"
                        >
                          <Eye size={12} />
                          Configure
                        </Button>
                        {!t.is_active && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleActivate(t.id)}
                            className="h-8 px-3 rounded-lg text-[9px] font-black uppercase border-white/10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 flex items-center gap-1.5"
                          >
                            <Check size={12} />
                            Lock Design
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
