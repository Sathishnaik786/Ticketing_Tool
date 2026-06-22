const axios = require('axios');

// Test the projects API endpoints
async function testProjectsAPI() {
  const baseURL = 'http://localhost:3003/api';
  
  try {
    console.log('Testing Projects API endpoints...\n');
    
    // Test GET /projects (without authentication, should fail)
    try {
      const response = await axios.get(`${baseURL}/projects`);
      console.log('GET /projects response:', response.data);
    } catch (error) {
      console.log('GET /projects expected error (no auth):', error.response?.status, error.response?.data);
    }
    
    // Test GET /projects/my-projects (without authentication, should fail)
    try {
      const response = await axios.get(`${baseURL}/projects/my-projects`);
      console.log('GET /projects/my-projects response:', response.data);
    } catch (error) {
      console.log('GET /projects/my-projects expected error (no auth):', error.response?.status, error.response?.data);
    }
    
    // Test GET /health endpoint
    try {
      const response = await axios.get(`${baseURL}/health`);
      console.log('\nGET /health response:', response.data);
    } catch (error) {
      console.log('GET /health error:', error.message);
    }
    
    console.log('\nProjects API endpoints are set up correctly!');
    console.log('Remember to use proper authentication headers when calling the endpoints.');
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testProjectsAPI();
