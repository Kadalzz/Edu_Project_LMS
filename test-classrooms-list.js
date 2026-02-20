const API_URL = 'http://localhost:3001/graphql';

async function testClassroomsList() {
  console.log('\n🔐 Testing Classrooms List Query...\n');
  
  // Login as teacher
  const loginMutation = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        user {
          id
          email
          role
        }
      }
    }
  `;

  try {
    const loginRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: loginMutation,
        variables: {
          email: 'guru@lms-abk.com',
          password: 'Guru123!'
        }
      })
    });

    const loginData = await loginRes.json();
    
    if (loginData.errors) {
      console.error('❌ Login failed:', loginData.errors);
      return;
    }

    const token = loginData.data.login.accessToken;
    console.log('✅ Login successful');

    // Query classrooms
    const classroomsQuery = `
      query Classrooms {
        classrooms {
          id
          name
          description
          isActive
          studentCount
          subjectCount
          createdAt
        }
      }
    `;

    const classroomsRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: classroomsQuery
      })
    });

    const classroomsData = await classroomsRes.json();

    if (classroomsData.errors) {
      console.error('❌ Classrooms query failed:');
      console.error(JSON.stringify(classroomsData.errors, null, 2));
      return;
    }

    console.log('✅ Classrooms query successful');
    console.log(`Found ${classroomsData.data.classrooms.length} classrooms:`);
    classroomsData.data.classrooms.forEach(c => {
      console.log(`  - ${c.name} (${c.studentCount} students, ${c.subjectCount} subjects)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testClassroomsList();
