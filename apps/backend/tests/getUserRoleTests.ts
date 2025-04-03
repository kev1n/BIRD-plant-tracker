import getUserRole from '../utilities/getUserRole.js';

// Run these test functions by typing the following command in the terminal:
// (Make sure you are in the backend directory)

// node --loader ts-node/esm tests/getUserRoleTests.ts

(async () => {
  try {
    console.log('GET USER ROLE TEST: User');
    const SAMPLE_USER_ID = '76b5e01c-2b76-472a-b580-c2aafffb65a2';
    const role = await getUserRole(SAMPLE_USER_ID);
    if (role === 'user') {
      console.log('Test Passed');
    } else {
      console.log('Test Failed');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
})();

(async () => {
    try {
      console.log('GET USER ROLE TEST: Editor');
      const SAMPLE_USER_ID = 'f5cd495e-2f15-4951-a45b-5687564e38b8';
      const role = await getUserRole(SAMPLE_USER_ID);
      if (role === 'editor') {
        console.log('Test Passed');
      } else {
        console.log('Test Failed');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
})();

(async () => {
    try {
      console.log('GET USER ROLE TEST: Invalid user ID');
      const INVALID_USER_ID = 'id-does-not-exist';
      const role = await getUserRole(INVALID_USER_ID);
      console.log(role);
      if (role === '') {
        console.log(`Test Passed, got "${role}" as expected`);
      } else {
        console.log('Test Failed');
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
})();