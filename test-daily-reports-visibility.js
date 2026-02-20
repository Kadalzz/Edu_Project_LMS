// Test script to verify daily reports are accessible by parent
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
    console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(JSON.stringify(json.errors, null, 2));
  }
  return json.data;
}

async function main() {
  console.log('🔍 Testing Daily Reports Visibility\n');

  // 1. Login as teacher
  console.log('1️⃣ Logging in as teacher...');
  const teacherLogin = await graphqlRequest(`
    mutation {
      login(input: { email: "guru@lms-abk.com", password: "Guru123!" }) {
        accessToken
        user { id teacherName }
      }
    }
  `);
  const teacherToken = teacherLogin.login.accessToken;
  console.log(`✅ Logged in as: ${teacherLogin.login.user.teacherName}\n`);

  // 2. Login as parent
  console.log('2️⃣ Logging in as parent (siswa1)...');
  const parentLogin = await graphqlRequest(`
    mutation {
      login(input: { email: "siswa1@lms-abk.com", password: "Siswa123!" }) {
        accessToken
        user { id parentName }
      }
    }
  `);
  const parentToken = parentLogin.login.accessToken;
  console.log(`✅ Logged in as: ${parentLogin.login.user.parentName}`);

  // 2b. Get full user info with children
  console.log('   Fetching children info...');
  const meData = await graphqlRequest(`
    query {
      me {
        id
        email
        parentName
        children {
          id
          userId
          parentId
          user {
            id
            studentName
          }
        }
      }
    }
  `, {}, parentToken);

  console.log(`   Children found: ${meData.me.children ? meData.me.children.length : 0}`);
  if (!meData.me.children || meData.me.children.length === 0) {
    console.log('\n   ❌ NO CHILDREN FOUND!');
    console.log('   The parent-child relationship is not properly set up.');
    throw new Error('No children found for parent');
  }

  const child = meData.me.children[0];
  console.log(`   Child: ${child.user.studentName} (Student ID: ${child.id}, Parent ID: ${child.parentId})\n`);

  // 3. Create a daily report as teacher
  console.log('3️⃣ Creating daily report for student...');
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const reportData = await graphqlRequest(`
      mutation CreateDailyReport($input: CreateDailyReportInput!) {
        createDailyReport(input: $input) {
          id
          date
          mood
          activities
          achievements
          createdAt
        }
      }
    `, {
      input: {
        studentId: child.id,
        date: today,
        mood: 'HAPPY',
        activities: ['Belajar mengenal angka 1-10', 'Bermain balok warna', 'Makan siang dengan baik'],
        achievements: 'Anak sudah bisa menghitung sampai 10 dengan lancar',
        challenges: 'Masih perlu latihan menulis angka',
        notes: 'Perkembangan sangat baik hari ini!',
      }
    }, teacherToken);

    console.log(`✅ Daily report created successfully!`);
    console.log(`   Report ID: ${reportData.createDailyReport.id}`);
    console.log(`   Date: ${reportData.createDailyReport.date}`);
    console.log(`   Mood: ${reportData.createDailyReport.mood}`);
  } catch (error) {
    console.log(`⚠️  Report might already exist for today: ${error.message}`);
  }

  // 4. Fetch reports as parent
  console.log('\n4️⃣ Fetching daily reports as parent...');
  const reportsAsParent = await graphqlRequest(`
    query DailyReportsByStudent($studentId: String!) {
      dailyReportsByStudent(studentId: $studentId) {
        id
        date
        mood
        activities
        achievements
        challenges
        notes
        createdBy {
          id
          name
          role
        }
        createdAt
      }
    }
  `, { studentId: child.id }, parentToken);

  const reports = reportsAsParent.dailyReportsByStudent;
  console.log(`✅ Found ${reports.length} report(s) as parent:`);
  reports.forEach((report, index) => {
    console.log(`\n   Report ${index + 1}:`);
    console.log(`   - Date: ${report.date}`);
    console.log(`   - Mood: ${report.mood}`);
    console.log(`   - Activities: ${report.activities.join(', ')}`);
    console.log(`   - Created by: ${report.createdBy.name} (${report.createdBy.role})`);
  });

  if (reports.length === 0) {
    console.log('\n   ❌ NO REPORTS FOUND! This is the issue.');
    console.log('   The parent cannot see the daily reports.');
  } else {
    console.log('\n   ✅ SUCCESS! Parent can see the daily reports!');
  }

  // 5. Fetch reports as teacher to compare
  console.log('\n5️⃣ Fetching same reports as teacher for comparison...');
  const reportsAsTeacher = await graphqlRequest(`
    query DailyReportsByStudent($studentId: String!) {
      dailyReportsByStudent(studentId: $studentId) {
        id
        date
        mood
      }
    }
  `, { studentId: child.id }, teacherToken);

  console.log(`✅ Teacher can see ${reportsAsTeacher.dailyReportsByStudent.length} report(s)`);

  console.log('\n🎉 Test completed!');
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
