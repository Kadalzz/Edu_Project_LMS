const GRAPHQL_URL = 'http://localhost:3001/graphql';

async function testAssignmentForStudent() {
  try {
    // Step 1: Login as student
    console.log('🔐 Logging in as student...\n');
    const loginResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(input: { email: $email, password: $password }) {
              accessToken
              user {
                id
                email
                role
              }
            }
          }
        `,
        variables: {
          email: 'siswa1@lms-abk.com',
          password: 'Siswa123!'
        }
      })
    });

    const loginData = await loginResponse.json();
    if (loginData.errors) {
      console.error('❌ Login failed:', loginData.errors);
      return;
    }

    const accessToken = loginData.data.login.accessToken;
    console.log('✅ Logged in as:', loginData.data.login.user.email);
    console.log('   Role:', loginData.data.login.user.role);

    // Step 2: Get assignment detail
    console.log('\n📋 Fetching assignment "video" for student...\n');
    const assignmentResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query: `
          query AssignmentForStudent($assignmentId: String!) {
            assignmentForStudent(assignmentId: $assignmentId) {
              id
              title
              description
              type
              xpReward
              questionCount
              taskSteps {
                id
                stepNumber
                instruction
                referenceImage
                isMandatory
              }
            }
          }
        `,
        variables: {
          assignmentId: 'cmlu5wk620009110wto7kb65o' // video assignment ID
        }
      })
    });

    const assignmentData = await assignmentResponse.json();
    if (assignmentData.errors) {
      console.error('❌ Query failed:', JSON.stringify(assignmentData.errors, null, 2));
      return;
    }

    const assignment = assignmentData.data.assignmentForStudent;
    console.log('📄 Assignment Details:');
    console.log(`   Title: ${assignment.title}`);
    console.log(`   Description: ${assignment.description || 'No description'}`);
    console.log(`   Type: ${assignment.type}`);
    console.log(`   XP Reward: ${assignment.xpReward}`);
    console.log(`   Question Count: ${assignment.questionCount}`);
    console.log(`\n📊 Task Steps (${assignment.taskSteps.length}):`)
    
    if (assignment.taskSteps.length === 0) {
      console.log('   ❌ NO STEPS RETURNED - This is the bug!');
    } else {
      assignment.taskSteps.forEach((step, index) => {
        console.log(`\n   Step ${step.stepNumber}:`);
        console.log(`     ID: ${step.id}`);
        console.log(`     Instruction: ${step.instruction}`);
        console.log(`     Mandatory: ${step.isMandatory}`);
        console.log(`     Reference: ${step.referenceImage || 'None'}`);
      });
      console.log('\n✅ Steps are being returned correctly!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAssignmentForStudent();
