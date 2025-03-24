import getUserRole from '../utilities/getUserRole.js';

// Run these test functions by typing the folloing command in the terminal:
// (Make sure you are in the backend directory)

// node --loader ts-node/esm tests/getUserRoleTests.ts

(async () => {
  try {
    console.log('GET USER ROLE TEST: User');
    const role = await getUserRole('76b5e01c-2b76-472a-b580-c2aafffb65a2');
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
      const role = await getUserRole('f5cd495e-2f15-4951-a45b-5687564e38b8');
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
      const role = await getUserRole('id-does-not-exist');
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