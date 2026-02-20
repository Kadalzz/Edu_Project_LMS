// Test script to verify parent can see children after parentId fix
const API_URL = 'http://localhost:3001/graphql';

async function graphqlRequest(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function main() {
  console.log('🧪 Testing Parent-Children Relationship Fix\n');

  // 1. Login as parent (siswa1)
  console.log('1️⃣ Logging in as parent (siswa1@lms-abk.com)...');
  const loginData = await graphqlRequest(`
    mutation {
      login(input: { email: "siswa1@lms-abk.com", password: "Siswa123!" }) {
        accessToken
        user {
          id
          email
          role
          studentName
          parentName
        }
      }
    }
  `);

  const token = loginData.login.accessToken;
  const user = loginData.login.user;
  console.log(`✅ Logged in as: ${user.studentName} (Parent: ${user.parentName})\n`);

  // 2. Fetch children
  console.log('2️⃣ Fetching children list...');
  const childrenData = await graphqlRequest(`
    query {
      me {
        id
        email
        parentName
        children {
          id
          userId
          parentId
          level
          totalXP
          user {
            id
            studentName
          }
        }
      }
    }
  `, {}, token);

  const children = childrenData.me.children || [];
  console.log(`✅ Found ${children.length} child(ren):`);
  children.forEach(child => {
    console.log(`   - ${child.user.studentName} (ID: ${child.id}, Level: ${child.level})`);
    console.log(`     userId: ${child.userId}`);
    console.log(`     parentId: ${child.parentId} ${child.parentId ? '✅' : '❌ MISSING'}`);
  });

  if (children.length === 0) {
    console.log('   ❌ NO CHILDREN FOUND - parentId might still be null');
  } else {
    console.log('\n✨ SUCCESS! Parent can now see their children!');
  }

  // 3. Test fetching daily reports for the child
  if (children.length > 0) {
    const childId = children[0].id;
    console.log(`\n3️⃣ Fetching daily reports for ${children[0].user.studentName}...`);
    
    try {
      const reportsData = await graphqlRequest(`
        query DailyReportsByStudent($studentId: String!) {
          dailyReportsByStudent(studentId: $studentId) {
            id
            date
            mood
            activities
            achievements
            createdAt
          }
        }
      `, { studentId: childId }, token);

      const reports = reportsData.dailyReportsByStudent || [];
      console.log(`✅ Found ${reports.length} daily report(s)`);
      reports.forEach(report => {
        console.log(`   - Date: ${report.date}, Mood: ${report.mood}`);
        console.log(`     Activities: ${report.activities}`);
      });
    } catch (error) {
      console.log(`❌ Error fetching reports: ${error.message}`);
    }
  }

  console.log('\n✅ Test completed!');
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
