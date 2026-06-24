const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003/api';
const TEST_TOKEN = process.env.TEST_TOKEN; // You'll need to set this to a valid JWT token

if (!TEST_TOKEN) {
  console.log('⚠️  Please set TEST_TOKEN environment variable with a valid JWT token');
  console.log('You can get this from a successful login response');
  process.exit(1);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testMeetupsAPI() {
  console.log('🧪 Testing Meetups API...\n');

  try {
    // Test 1: Get all meetups (should return empty array initially)
    console.log('1. Testing GET /meetups');
    let response = await api.get('/meetups');
    console.log('✅ GET /meetups:', response.data);
    
    // Test 2: Request a meetup (as a regular user)
    console.log('\n2. Testing POST /meetups/request');
    const requestPayload = {
      title: 'Team Standup',
      description: 'Daily team sync meeting',
      type: 'STANDUP',
      platform: 'TEAMS',
      link: 'https://teams.microsoft.com/standup',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: '10:00',
      endTime: '10:30'
    };
    
    try {
      response = await api.post('/meetups/request', requestPayload);
      console.log('✅ POST /meetups/request:', response.data);
      const meetupId = response.data.data.id;
      
      // Test 3: Get the specific meetup
      console.log('\n3. Testing GET /meetups/:id');
      response = await api.get(`/meetups/${meetupId}`);
      console.log('✅ GET /meetups/:id:', response.data);
      
      // Test 4: Get all meetups again (should now include the requested one)
      console.log('\n4. Testing GET /meetups (after request)');
      response = await api.get('/meetups');
      console.log('✅ GET /meetups:', response.data);
      
      // Test 5: Try to get calendar events
      console.log('\n5. Testing GET /calendar-events');
      response = await api.get('/calendar-events');
      console.log('✅ GET /calendar-events:', response.data);
      
    } catch (error) {
      console.log('⚠️  POST /meetups/request failed (expected if not authorized):', error.response?.data || error.message);
    }

    console.log('\n✅ Meetups API tests completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.response?.data || error.message);
  }
}

// Run the test
testMeetupsAPI().then(() => {
  console.log('\n🏁 Testing complete!');
}).catch(console.error);
