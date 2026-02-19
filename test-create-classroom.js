// Test create classroom and verify relationship
const GRAPHQL_URL = 'http://localhost:3001/graphql';
const TEACHER_EMAIL = 'guru@lms-abk.com';
const TEACHER_PASSWORD = 'Guru123!';

async function testCreateClassroom() {
  console.log('🔐 Logging in...');
  
  const loginResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            accessToken
            user { id email teacherName }
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
  const teacher = loginData.data.login.user;
  console.log(`✅ Logged in as: ${teacher.teacherName} (${teacher.id})\n`);

  // Create classroom
  console.log('📚 Creating classroom...');
  const createResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        mutation CreateClassroom($input: CreateClassroomInput!) {
          createClassroom(input: $input) {
            id
            name
            description
            studentCount
            subjectCount
          }
        }
      `,
      variables: {
        input: {
          name: 'Test Classroom ' + Date.now(),
          description: 'Testing classroom creation'
        }
      }
    })
  });

  const createData = await createResponse.json();
  
  if (createData.errors) {
    console.error('❌ Create error:', createData.errors);
    return;
  }

  const classroom = createData.data.createClassroom;
  console.log(`✅ Created classroom: ${classroom.name}`);
  console.log(`   ID: ${classroom.id}\n`);

  // Try to get available students immediately
  console.log('🔍 Testing availableStudents query...');
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
            user { studentName email }
          }
        }
      `,
      variables: { classroomId: classroom.id }
    })
  });

  const availableData = await availableResponse.json();
  
  if (availableData.errors) {
    console.error('\n❌ ERROR when accessing availableStudents:');
    console.error(JSON.stringify(availableData.errors, null, 2));
    console.log('\n⚠️ This means the classroom-teacher relationship was NOT created!');
  } else {
    const available = availableData.data.availableStudents;
    console.log(`✅ SUCCESS! Available students: ${available.length}`);
    if (available.length > 0) {
      console.log('\nList:');
      available.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.user.studentName}`);
      });
    }
  }
}

testCreateClassroom().catch(console.error);
