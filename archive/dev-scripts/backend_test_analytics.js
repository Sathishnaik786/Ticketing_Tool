const { supabase } = require('@lib/supabase');
const analyticsService = require('./analytics/analytics.service');

async function testAnalytics() {
  console.log('Testing analytics service functions...');
  
  try {
    // Test admin overview
    console.log('\n1. Testing Admin Overview...');
    const adminData = await analyticsService.getAdminOverview();
    console.log('Admin Overview Data:', JSON.stringify(adminData, null, 2));
    
    // Test HR workforce
    console.log('\n2. Testing HR Workforce...');
    const hrData = await analyticsService.getHRWorkforce();
    console.log('HR Workforce Data:', JSON.stringify(hrData, null, 2));
    
    // Note: Manager and Employee tests would require specific employee IDs
    console.log('\nAnalytics service tests completed successfully!');
    
  } catch (error) {
    console.error('Error during analytics tests:', error.message);
  }
}

// Run the test
testAnalytics();
