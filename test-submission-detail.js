const GRAPHQL_URL = 'http://localhost:3001/graphql';

async function testSubmissionDetail() {
  try {
    // Step 1: Login as teacher
    console.log('🔐 Logging in as teacher...\n');
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
          email: 'guru@lms-abk.com',
          password: 'Guru123!'
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
    console.log('   User ID:', loginData.data.login.user.id);

    // Step 2: Get submission detail
    console.log('\n📋 Fetching submission detail...\n');
    const submissionResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query: `
          query SubmissionDetail($submissionId: String!) {
            submissionDetail(submissionId: $submissionId) {
              id
              assignmentId
              studentId
              status
              score
              submittedAt
              gradedAt
              createdAt
              updatedAt
              student {
                id
                studentName
              }
              assignment {
                id
                title
                type
              }
            }
          }
        `,
        variables: {
          submissionId: 'cmlu1udo00000e1husu4vqd3d' // Andi's submission ID
        }
      })
    });

    const submissionData = await submissionResponse.json();
    if (submissionData.errors) {
      console.error('❌ Query failed:', JSON.stringify(submissionData.errors, null, 2));
      return;
    }

    const submission = submissionData.data.submissionDetail;
    console.log('📄 Submission Details:');
    console.log(`   ID: ${submission.id}`);
    console.log(`   Student: ${submission.student.studentName}`);
    console.log(`   Assignment: ${submission.assignment.title} (${submission.assignment.type})`);
    console.log(`   Status: ${submission.status}`);
    console.log(`   Score: ${submission.score || 'Not graded'}`);
    console.log(`   Submitted At: ${submission.submittedAt || 'Not submitted'}`);
    console.log(`   Graded At: ${submission.gradedAt || 'Not graded'}`);
    console.log(`   Created: ${submission.createdAt}`);
    console.log(`   Updated: ${submission.updatedAt}`);

    if (submission.status === 'SUBMITTED') {
      console.log('\n✅ Status is SUBMITTED - Data is correct!');
    } else if (submission.status === 'DRAFT') {
      console.log('\n⚠️  Status is still DRAFT - This is the bug!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSubmissionDetail();
