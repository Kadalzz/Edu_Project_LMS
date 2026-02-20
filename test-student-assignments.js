const API_URL = 'http://localhost:3001/graphql';

// Login as student
async function loginStudent() {
  const loginMutation = `
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
        accessToken
        user {
          id
          email
          role
          studentName
        }
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: loginMutation,
      variables: {
        email: 'siswa1@lms-abk.com',
        password: 'Siswa123!'
      }
    })
  });

  const result = await response.json();
  if (result.errors) {
    console.error('❌ Login failed:', result.errors);
    return null;
  }

  console.log('✅ Login successful as:', result.data.login.user.studentName || result.data.login.user.email);
  return result.data.login.accessToken;
}

// Get assignments for student
async function getAssignments(token) {
  const query = `
    query RecentGrades($limit: Float) {
      recentGrades(limit: $limit) {
        id
        assignmentId
        status
        score
        submittedAt
        gradedAt
        assignment {
          id
          title
          type
          dueDate
          xpReward
        }
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables: { limit: 100 }
    })
  });

  const result = await response.json();
  if (result.errors) {
    console.error('❌ Query failed:', result.errors);
    return [];
  }

  return result.data.recentGrades;
}

// Main test
async function test() {
  console.log('\n🧪 Testing Student Assignments\n');
  
  const token = await loginStudent();
  if (!token) return;

  console.log('\n📋 Fetching assignments...\n');
  const assignments = await getAssignments(token);

  if (assignments.length === 0) {
    console.log('❌ No assignments found for student!\n');
    return;
  }

  console.log(`✅ Found ${assignments.length} assignment(s):\n`);
  assignments.forEach((submission, index) => {
    console.log(`${index + 1}. ${submission.assignment.title}`);
    console.log(`   Type: ${submission.assignment.type}`);
    console.log(`   Status: ${submission.status}`);
    console.log(`   XP Reward: ${submission.assignment.xpReward}`);
    console.log(`   Due Date: ${submission.assignment.dueDate || 'No deadline'}`);
    console.log(`   Score: ${submission.score || 'Not graded yet'}`);
    console.log('');
  });

  console.log('✅ Test completed successfully!\n');
}

test().catch(console.error);
