// Test script to verify authentication flow
const fs = require('fs');
const path = require('path');

// Check if users.json exists and has valid data
const usersFile = path.join(__dirname, 'client/data/users.json');

console.log('=== Authentication Flow Test ===');

if (fs.existsSync(usersFile)) {
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    console.log('✅ Users data file exists');
    console.log('Users found:', Object.keys(usersData).length);
    
    Object.entries(usersData).forEach(([userId, userData]) => {
      console.log(`\nUser: ${userId}`);
      console.log(`  - Onboarding completed: ${userData.onboardingCompleted}`);
      console.log(`  - Onboarding step: ${userData.onboardingStep}`);
      console.log(`  - Interests: ${userData.interests?.length || 0} items`);
      console.log(`  - Gmail connected: ${userData.gmailConnected}`);
      console.log(`  - Calendar connected: ${userData.calendarConnected}`);
    });
  } catch (error) {
    console.error('❌ Error reading users data:', error.message);
  }
} else {
  console.log('❌ Users data file not found');
}

console.log('\n=== Middleware Analysis ===');
console.log('The middleware should:');
console.log('1. Check if user is authenticated');
console.log('2. Call /api/user/onboarding-status');
console.log('3. Redirect to /onboarding if not completed');
console.log('4. Redirect to /dashboard if completed');

console.log('\n=== Potential Issues ===');
console.log('1. Race condition between onboarding completion and middleware check');
console.log('2. API call failures in middleware');
console.log('3. Incorrect user ID format');
console.log('4. File system permissions for data storage');

console.log('\n=== Debug Steps ===');
console.log('1. Check browser console for middleware logs');
console.log('2. Check server logs for API call errors');
console.log('3. Verify user data is being saved correctly');
console.log('4. Test with a fresh user account'); 