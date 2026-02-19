// Use built-in fetch (Node 18+)
const GRAPHQL_URL = 'http://localhost:3001/graphql';
const TEACHER_EMAIL = 'guru@lms-abk.com';
const TEACHER_PASSWORD = 'Guru123!';

async function checkStudents() {
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
            user { id email role }
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
  console.log('✅ Logged in successfully\n');

  // Get all classrooms (basic info only)
  console.log('📚 Fetching classrooms...');
  const classroomsResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query MyClassrooms {
          myClassrooms {
            id
            name
            studentCount
          }
        }
      `
    })
  });

  const classroomsData = await classroomsResponse.json();
  if (classroomsData.errors) {
    console.error('❌ Error:', classroomsData.errors);
    return;
  }

  const classrooms = classroomsData.data.myClassrooms;
  console.log(`Found ${classrooms.length} classrooms:\n`);

  classrooms.forEach(classroom => {
    console.log(`📖 ${classroom.name} (${classroom.studentCount} siswa) - ID: ${classroom.id}`);
  });
  console.log('');

  // Get all students
  console.log('👥 Fetching all students in system...');
  const studentsResponse = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query MyStudents {
          myStudents {
            id
            userId
            user {
              studentName
              email
              isActive
            }
          }
        }
      `
    })
  });

  const studentsData = await studentsResponse.json();
  if (studentsData.errors) {
    console.error('❌ Error:', studentsData.errors);
    return;
  }

  const students = studentsData.data.myStudents;
  console.log(`Total ${students.length} students in system:\n`);
  students.forEach(student => {
    console.log(`   - ${student.user.studentName} (${student.user.email}) - ${student.user.isActive ? 'Active' : 'Inactive'}`);
  });

  // Test availableStudents for each classroom
  console.log('\n\n🔍 Checking available students for each classroom...');
  for (const classroom of classrooms) {
    console.log(`\n📖 ${classroom.name}:`);
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
              user {
                studentName
                email
              }
            }
          }
        `,
        variables: { classroomId: classroom.id }
      })
    });

    const availableData = await availableResponse.json();
    if (availableData.errors) {
      console.error('   ❌ Error:', availableData.errors);
    } else {
      const available = availableData.data.availableStudents;
      console.log(`   Available students: ${available.length}`);
      if (available.length > 0) {
        available.forEach(student => {
          console.log(`      - ${student.user.studentName} (${student.user.email})`);
        });
      } else {
        console.log('   (semua siswa sudah terdaftar)');
      }
    }
  }
}

checkStudents().catch(console.error);
