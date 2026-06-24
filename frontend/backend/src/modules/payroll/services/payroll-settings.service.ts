import { PayrollSettingsRepository } from '../repositories/settings.repository';
import { AuditRepository } from '../repositories/audit.repository';

export class PayrollSettingsService {
  static async getAll() {
    return await PayrollSettingsRepository.findAll();
  }

  static async update(key: string, value: any, userId: string) {
    const oldSetting = await PayrollSettingsRepository.findByKey(key);
    const setting = await PayrollSettingsRepository.update(key, value);

    await AuditRepository.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'PAYROLL_SETTING',
      entity_id: setting.id,
      old_value: oldSetting,
      new_value: setting
    });

    return setting;
  }
}
