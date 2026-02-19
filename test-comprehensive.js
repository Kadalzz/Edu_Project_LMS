// Comprehensive Test Script - Day 1-9
// LMS ABK Project Testing

const API_URL = 'http://localhost:3001/graphql';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function request(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data;
}

const results = { passed: 0, failed: 0, tests: [] };

async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    log(colors.green, `✓ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    log(colors.red, `✗ ${name}: ${error.message}`);
  }
}

async function runAllTests() {
  console.clear();
  log(colors.yellow, '╔══════════════════════════════════════════════════════╗');
  log(colors.yellow, '║   LMS ABK - COMPREHENSIVE TEST SUITE (Day 1-9)     ║');
  log(colors.yellow, '╚══════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  let teacherToken, studentToken, classroomId, subjectId, moduleId, lessonId;

  try {
    // DAY 1-3: Authentication & Content Structure
    log(colors.blue, '\n=== DAY 1-3: Authentication & Content Structure ===\n');
    
    await test('Day 1: Teacher login', async () => {
      const data = await request(`
        mutation { login(input: { email: "guru@lms-abk.com", password: "Guru123!" }) {
          accessToken user { role teacherName }
        }}
      `);
      if (data.login.user.role !== 'TEACHER') throw new Error('Wrong role');
      teacherToken = data.login.accessToken;
    });

    await test('Day 1: Student login', async () => {
      const data = await request(`
        mutation { login(input: { email: "siswa1@lms-abk.com", password: "Siswa123!" }) {
          accessToken user { role studentName }
        }}
      `);
      if (data.login.user.role !== 'STUDENT_PARENT') throw new Error('Wrong role');
      studentToken = data.login.accessToken;
    });

    await test('Day 1: Get me query', async () => {
      const data = await request(`query { me { id email role teacherName }}`, {}, teacherToken);
      if (!data.me.email) throw new Error('No user data');
    });

    await test('Day 3: Get classrooms', async () => {
      const data = await request(`query { classrooms { id name isActive }}`, {}, teacherToken);
      if (!data.classrooms || data.classrooms.length === 0) throw new Error('No classrooms');
      classroomId = data.classrooms[0].id;
    });

    await test('Day 3: Get classroom detail', async () => {
      const data = await request(`
        query($id: String!) { classroomDetail(classroomId: $id) {
          id name students { id } subjects { id name }
        }}
      `, { id: classroomId }, teacherToken);
      if (!data.classroomDetail) throw new Error('Classroom not found');
      if (data.classroomDetail.subjects?.length > 0) {
        subjectId = data.classroomDetail.subjects[0].id;
      }
    });

    // DAY 4-5: Lessons & Assignments
    log(colors.blue, '\n=== DAY 4-5: Lessons & Assignments ===\n');

    await test('Day 4: Get modules', async () => {
      if (!subjectId) throw new Error('No subject available');
      const data = await request(`
        query($id: String!) { modules(subjectId: $id) { id name order }}
      `, { id: subjectId }, teacherToken);
      if (!data.modules || data.modules.length === 0) throw new Error('No modules');
      moduleId = data.modules[0].id;
    });

    await test('Day 4: Get module detail', async () => {
      if (!moduleId) throw new Error('No module available');
      const data = await request(`
        query($id: String!) { moduleDetail(moduleId: $id) {
          id name lessons { id title description }
        }}
      `, { id: moduleId }, teacherToken);
      if (!data.moduleDetail) throw new Error('Module not found');
      if (data.moduleDetail.lessons?.length > 0) {
        lessonId = data.moduleDetail.lessons[0].id;
      }
    });

    await test('Day 4: Get lesson detail', async () => {
      if (!lessonId) throw new Error('No lesson available');
      const data = await request(`
        query($id: String!) { lessonDetail(lessonId: $id) {
          id title description content isDraft
        }}
      `, { id: lessonId }, teacherToken);
      if (!data.lessonDetail) throw new Error('Lesson not found');
    });

    await test('Day 5: Get assignments', async () => {
      if (!lessonId) throw new Error('No lesson available');
      const data = await request(`
        query($id: String!) { assignments(lessonId: $id) {
          id title type description
        }}
      `, { id: lessonId }, teacherToken);
      // Assignments can be empty
    });

    // DAY 6-7: Submissions & Progress
    log(colors.blue, '\n=== DAY 6-7: Submissions & Progress ===\n');

    let studentId;
    await test('Day 7: Get student XP info', async () => {
      const data = await request(`
        query { me { id studentProfile { id level totalXP currentXP }}}
      `, {}, studentToken);
      if (!data.me.studentProfile) throw new Error('No student profile');
      studentId = data.me.studentProfile.id;
    });

    await test('Day 7: Get student progress', async () => {
      const data = await request(`
        query($id: String!) { studentStats(studentId: $id) {
          totalAssignmentsCompleted averageScore level totalXP
        }}
      `, { id: studentId }, studentToken);
      if (!data.studentStats) throw new Error('Invalid stats');
    });

    await test('Day 8: Get pending grading (teacher)', async () => {
      const data = await request(`
        query { pendingGrading { id status submittedAt assignment { title } student { id }}}
      `, {}, teacherToken);
      if (!Array.isArray(data.pendingGrading)) throw new Error('Invalid data');
    });

    await test('Day 8: Get recent grades (student)', async () => {
      const data = await request(`
        query { recentGrades(limit: 5) { id score gradedAt assignment { title }}}
      `, {}, studentToken);
      if (!Array.isArray(data.recentGrades)) throw new Error('Invalid data');
    });

    await test('Day 8: Get parent children', async () => {
      const data = await request(`
        query { me { id children { id level totalXP user { studentName }}}}
      `, {}, studentToken);
      if (!Array.isArray(data.me.children)) throw new Error('Invalid data');
    });

    // DAY 9: Media Upload
    log(colors.blue, '\n=== DAY 9: Media Upload & Management ===\n');

    await test('Day 9: Get media library', async () => {
      const data = await request(`
        query { media(limit: 50) { id filename originalName type size url createdAt }}
      `, {}, teacherToken);
      if (!Array.isArray(data.media)) throw new Error('Invalid data');
    });

    await test('Day 9: Get media by type', async () => {
      const data = await request(`
        query { media(type: IMAGE, limit: 10) { id type }}
      `, {}, teacherToken);
      if (!Array.isArray(data.media)) throw new Error('Invalid data');
    });

    await test('Day 9: Get my media', async () => {
      const data = await request(`
        query { myMedia { id originalName type uploadedById }}
      `, {}, teacherToken);
      if (!Array.isArray(data.myMedia)) throw new Error('Invalid data');
    });

    // Additional Features
    log(colors.blue, '\n=== Additional Features ===\n');

    await test('Notes: Get student notes', async () => {
      const data = await request(`
        query($id: String!) { notesByStudent(studentId: $id) { id content createdAt }}
      `, { id: studentId }, teacherToken);
      if (!Array.isArray(data.notesByStudent)) throw new Error('Invalid data');
    });

    await test('Daily Reports: Get reports', async () => {
      const data = await request(`
        query($id: String!) { dailyReportsByStudent(studentId: $id) {
          id mood activities challenges date
        }}
      `, { id: studentId }, studentToken);
      if (!Array.isArray(data.dailyReportsByStudent)) throw new Error('Invalid data');
    });

  } catch (error) {
    log(colors.red, `\nFatal error: ${error.message}`);
  }

  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  log(colors.yellow, '\nTEST SUMMARY');
  console.log('='.repeat(60));
  
  log(colors.green, `✓ Passed: ${results.passed}`);
  if (results.failed > 0) log(colors.red, `✗ Failed: ${results.failed}`);
  
  console.log(`\nTotal Tests: ${results.passed + results.failed}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n' + '='.repeat(60));
    log(colors.red, 'FAILED TESTS:');
    console.log('='.repeat(60));
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        log(colors.red, `\n✗ ${t.name}`);
        console.log(`  Error: ${t.error}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(colors.red, `\nUnexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
