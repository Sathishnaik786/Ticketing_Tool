import { supabaseAdmin } from '@lib/supabase';

export class TreasuryForecastService {
  /**
   * Projects future payroll outflows based on current growth and historical data.
   */
  static async projectNextMonthOutflow() {
    // 1. Get current month totals
    const { data: current, error } = await supabaseAdmin
      .from('payroll_bulk_commitments')
      .select('gross_total, net_total, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !current) return { projectedGross: 0, projectedNet: 0, growthRate: 0 };

    // 2. Simple Growth Projection (e.g., 2% monthly increase)
    const growthRate = 0.02; 
    const projectedGross = Number(current.gross_total) * (1 + growthRate);
    const projectedNet = Number(current.net_total) * (1 + growthRate);

    // 3. Persist Forecast
    await supabaseAdmin.from('payroll_forecasts').insert({
        forecast_type: 'TREASURY_OUTFLOW',
        target_period: 'Next Month',
        projected_amount: projectedNet,
        confidence_score: 85,
        metadata: { baseGross: current.gross_total, growthRate }
    });

    return {
      projectedGross,
      projectedNet,
      growthRate: growthRate * 100,
      confidence: 85
    };
  }
}
