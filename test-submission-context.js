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

async function getPendingSubmissions(token) {
  console.log('\n📋 Getting pending submissions...');
  
  const query = `
    query PendingGrading {
      pendingGrading {
        id
        status
        student {
          studentName
        }
        assignment {
          title
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
    return [];
  }

  return json.data.pendingGrading;
}

async function testSubmissionContext(token, submissionId) {
  console.log(`\n🔍 Testing submission context for ID: ${submissionId}...`);
  
  const query = `
    query GetSubmissionContext($submissionId: String!) {
      submission(id: $submissionId) {
        id
        assignment {
          id
          lesson {
            id
            module {
              id
              subject {
                id
                classroomId
              }
            }
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
    body: JSON.stringify({
      query,
      variables: { submissionId: submissionId }
    })
  });

  const json = await res.json();
  if (json.errors) {
    console.error('❌ Error:', json.errors[0].message);
    console.error('Full error:', JSON.stringify(json.errors, null, 2));
    return null;
  }

  return json.data.submission;
}

async function main() {
  console.log('🧪 Testing Submission Context Query...\n');
  console.log('==================================================');

  // Login as teacher
  console.log('\n👨‍🏫 Logging in as teacher...');
  const teacherLogin = await login('guru@lms-abk.com', 'Guru123!');
  if (!teacherLogin) {
    console.error('❌ Failed to login as teacher');
    return;
  }
  console.log(`✅ Logged in as: ${teacherLogin.user.teacherName}`);

  // Get pending submissions
  const pending = await getPendingSubmissions(teacherLogin.accessToken);
  if (pending.length === 0) {
    console.log('❌ No pending submissions found');
    return;
  }

  console.log(`✅ Found ${pending.length} pending submission(s):`);
  pending.forEach((s, i) => {
    console.log(`   ${i + 1}. ID: ${s.id} - ${s.student.studentName} - ${s.assignment.title}`);
  });

  // Test submission context query for first pending submission
  const firstSubmission = pending[0];
  const context = await testSubmissionContext(teacherLogin.accessToken, firstSubmission.id);
  
  if (context) {
    console.log('\n✅ Submission context retrieved successfully:');
    console.log(JSON.stringify(context, null, 2));
    
    const { assignment } = context;
    const classroomId = assignment.lesson.module.subject.classroomId;
    const subjectId = assignment.lesson.module.subject.id;
    const moduleId = assignment.lesson.module.id;
    const lessonId = assignment.lesson.id;
    const assignmentId = assignment.id;
    const submissionId = context.id;

    const fullPath = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}`;
    console.log('\n📍 Expected redirect path:');
    console.log(fullPath);
  } else {
    console.log('\n❌ Failed to retrieve submission context');
  }

  console.log('\n==================================================');
  console.log('✅ Test Complete!\n');
}

main().catch(console.error);
