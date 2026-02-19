// Use built-in fetch (Node 18+)
const GRAPHQL_URL = 'http://localhost:3001/graphql';
const TEACHER_EMAIL = 'guru@lms-abk.com';
const TEACHER_PASSWORD = 'Guru123!';
const CLASSROOM_ID = 'cmlt42iy00000ehc0a7ctdroe'; // From the screenshot URL

async function testClassroom() {
  console.log('🔐 Logging in as teacher...');
  
  // Login
  const loginResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
          }
        }
      `,
      variables: {
        input: { email: TEACHER_EMAIL, password: TEACHER_PASSWORD }
      }
    })
  });

  const loginData = await loginResponse.json();
  if (loginData.errors) {
    console.error('❌ Login error:', loginData.errors);
    return;
  }

  const token = loginData.data.login.accessToken;
  console.log('✅ Logged in\n');

  // Test availableStudents for the specific classroom
  console.log(`🔍 Testing classroom: ${CLASSROOM_ID}\n`);
  const availableResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query AvailableStudents($classroomId: String!) {
          availableStudents(classroomId: $classroomId) {
            id
            userId
            user {
              id
              studentName
              email
            }
          }
        }
      `,
      variables: { classroomId: CLASSROOM_ID }
    })
  });

  const availableData = await availableResponse.json();
  
  console.log('Response:', JSON.stringify(availableData, null, 2));
  
  if (availableData.errors) {
    console.error('\n❌ GraphQL Errors:', availableData.errors);
  } else {
    const available = availableData.data.availableStudents;
    console.log(`\n✅ Available students: ${available.length}`);
    if (available.length > 0) {
      console.log('\nList:');
      available.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.user.studentName} (${student.user.email})`);
      });
    } else {
      console.log('   (no students available)');
    }
  }
}

testClassroom().catch(console.error);
