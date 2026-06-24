const { PayrollPreviewService } = require('./backend/src/modules/payroll-bulk-processing/services/payroll-preview.service');

async function testPreview() {
  try {
    const uploadId = '21027e4e-faaa-41da-93c2-507ad6d91c69'; // From logs
    const userId = '854a1f79-9b88-4e8c-8885-4a444abfe3c5'; // From logs
    
    console.log('Testing generatePreview...');
    const result = await PayrollPreviewService.generatePreview(uploadId, userId);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPreview();
