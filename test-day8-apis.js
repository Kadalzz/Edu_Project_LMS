const API_URL = 'http://localhost:3001';

async function login(email, password) {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user {
          id
          email
          role
          studentName
          teacherName
        }
      }
    }
  `;

  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        input: { email, password }
      }
    })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('Login error:', json.errors[0].message);
    return null;
  }
  return json.data.login;
}

async function testPendingGrading(token) {
  console.log('\n📋 Testing Pending Grading Queue (Teacher)...');
  
  const query = `
    query PendingGrading {
      pendingGrading {
        id
        status
        submittedAt
        student {
          studentName
        }
        assignment {
          title
          type
        }
        pendingStepsCount
      }
    }
  `;

  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('❌ Error:', json.errors[0].message);
    return;
  }

  const submissions = json.data.pendingGrading;
  console.log(`✅ Found ${submissions.length} pending submissions`);
  
  if (submissions.length > 0) {
    console.log('\n📝 Sample pending submission:');
    const sample = submissions[0];
    console.log({
      student: sample.student.studentName,
      assignment: sample.assignment.title,
      type: sample.assignment.type,
      status: sample.status,
      pendingSteps: sample.pendingStepsCount
    });
  }
}

async function testRecentGrades(token) {
  console.log('\n🏆 Testing Recent Grades (Student)...');
  
  const query = `
    query RecentGrades($limit: Float) {
      recentGrades(limit: $limit) {
        id
        score
        gradedAt
        assignment {
          title
          type
        }
      }
    }
  `;

  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables: { limit: 5 }
    })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('❌ Error:', json.errors[0].message);
    return;
  }

  const grades = json.data.recentGrades;
  console.log(`✅ Found ${grades.length} recent grades`);
  
  if (grades.length > 0) {
    console.log('\n📊 Recent grades:');
    grades.forEach((grade, idx) => {
      console.log(`${idx + 1}. ${grade.assignment.title} - Score: ${grade.score}`);
    });
  }
}

async function testMyChildren(token) {
  console.log('\n👨‍👩‍👧‍👦 Testing My Children Query (Parent)...');
  
  const query = `
    query {
      me {
        id
        email
        studentProfile {
          id
          level
          totalXP
          user {
            studentName
          }
        }
      }
    }
  `;

  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('❌ Error:', json.errors[0].message);
    return;
  }

  const user = json.data.me;
  console.log(`✅ User: ${user.email}`);
  if (user.studentProfile) {
    console.log(`   Student: ${user.studentProfile.user.studentName}`);
    console.log(`   Level: ${user.studentProfile.level}, XP: ${user.studentProfile.totalXP}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Day 8 APIs...\n');
  console.log('='.repeat(50));

  // Test 1: Login as teacher
  console.log('\n👨‍🏫 Test 1: Teacher Dashboard');
  const teacher = await login('guru@lms-abk.com', 'Guru123!');
  if (teacher) {
    console.log(`✅ Logged in as: ${teacher.user.teacherName}`);
    await testPendingGrading(teacher.accessToken);
  }

  // Test 2: Login as student
  console.log('\n' + '='.repeat(50));
  console.log('\n👨‍🎓 Test 2: Student Dashboard');
  const student = await login('siswa1@lms-abk.com', 'Siswa123!');
  if (student) {
    console.log(`✅ Logged in as: ${student.user.studentName}`);
    await testRecentGrades(student.accessToken);
    await testMyChildren(student.accessToken);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Day 8 API Tests Complete!\n');
}

runTests().catch(console.error);
