export class PayslipTemplateService {
  static getTemplate(data: any) {
    const { 
      employee, 
      record, 
      components, 
      statutory, 
      cycle,
      company = { name: 'YVI People Corp', address: '123 Enterprise Hub, Tech City' } 
    } = data;

    const earnings = components.filter((c: any) => c.component_category === 'EARNING');
    const deductions = components.filter((c: any) => c.component_category === 'DEDUCTION');
    
    // Add statutory to deductions list for display
    const totalDeductions = deductions.concat(statutory.map((s: any) => ({
      component_name: s.deduction_type,
      calculated_amount: s.employee_amount
    })));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .company-info h1 { margin: 0; color: #0f172a; font-size: 24px; }
          .company-info p { margin: 5px 0; font-size: 12px; color: #64748b; }
          .payslip-title { text-align: right; }
          .payslip-title h2 { margin: 0; color: #3b82f6; }
          
          .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
          .info-item { font-size: 12px; }
          .info-label { font-weight: bold; color: #64748b; }
          
          .salary-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .salary-table th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 12px; }
          .salary-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          
          .summary { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 30px; }
          .net-salary { background: #0f172a; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .net-salary h3 { margin: 0; font-size: 28px; }
          .net-salary p { margin: 5px 0; font-size: 12px; opacity: 0.8; }
          
          .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .qr-code { float: right; width: 80px; height: 80px; background: #eee; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${company.name}</h1>
            <p>${company.address}</p>
          </div>
          <div class="payslip-title">
            <h2>PAYSLIP</h2>
            <p>${cycle.cycle_name}</p>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div><span class="info-label">Employee Name:</span> ${employee.first_name} ${employee.last_name}</div>
            <div><span class="info-label">Employee ID:</span> ${employee.id.slice(0,8)}</div>
            <div><span class="info-label">Designation:</span> ${employee.position || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div><span class="info-label">PAN:</span> ${employee.pan || 'N/A'}</div>
            <div><span class="info-label">Working Days:</span> ${record.working_days}</div>
            <div><span class="info-label">LOP Days:</span> ${record.lop_days}</div>
          </div>
        </div>

        <div class="summary">
          <div>
            <table class="salary-table">
              <thead><tr><th>Earnings</th><th style="text-align: right">Amount</th></tr></thead>
              <tbody>
                ${earnings.map((e: any) => `<tr><td>${e.component_name}</td><td style="text-align: right">${Number(e.calculated_amount).toLocaleString()}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div>
            <table class="salary-table">
              <thead><tr><th>Deductions</th><th style="text-align: right">Amount</th></tr></thead>
              <tbody>
                ${totalDeductions.map((d: any) => `<tr><td>${d.component_name}</td><td style="text-align: right">${Number(d.calculated_amount).toLocaleString()}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
          <div class="net-salary" style="flex: 1; max-width: 300px;">
            <p>NET TAKE HOME</p>
            <h3>₹${Number(record.net_salary).toLocaleString()}</h3>
          </div>
          <div style="font-size: 12px; color: #64748b; font-style: italic;">
            Amount in words: ${record.net_salary_words || 'N/A'}
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated document and does not require a physical signature.</p>
          <p>Verification Hash: ${record.id}</p>
        </div>
      </body>
      </html>
    `;
  }
}
