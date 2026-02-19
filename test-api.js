/**
 * LMS API Integration Test Suite
 * Tests Day 1-6 Features: Auth, Classrooms, Subjects, Modules, Lessons, Assignments, Notes, Daily Reports
 * 
 * Usage: node test-api.js
 */

const API_URL = 'http://localhost:3001/graphql';

// Test state
let teacherToken = null;
let parentToken = null;
let classroomId = null;
let studentId = null;
let subjectId = null;
let moduleId = null;
let lessonId = null;
let assignmentId = null;
let submissionId = null;
let noteId = null;
let reportId = null;

// Helper function for GraphQL requests
async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(`GraphQL Error: ${json.errors[0]?.message || 'Unknown error'}`);
  }

  return json.data;
}

// Test runner
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    process.stdout.write(`  ⏳ ${name}...`);
    try {
      await fn();
      console.log(`\r  ✅ ${name}`);
      this.passed++;
    } catch (error) {
      console.log(`\r  ❌ ${name}`);
      console.log(`     Error: ${error.message}`);
      this.failed++;
    }
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Summary:`);
    console.log(`   ✅ Passed: ${this.passed}`);
    console.log(`   ❌ Failed: ${this.failed}`);
    console.log(`   📈 Total:  ${this.passed + this.failed}`);
    console.log('='.repeat(60));
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// ============================================================================
// DAY 1-2: AUTH TESTS
// ============================================================================

async function testAuth(runner) {
  console.log('\n🔐 Testing Auth (Day 1-2)...');

  await runner.test('Login Teacher', async () => {
    const mutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user { id email role }
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        email: 'guru@lms-abk.com',
        password: 'Guru123!',
      }
    });

    if (!data.login.accessToken) throw new Error('No access token');
    teacherToken = data.login.accessToken;
  });

  await runner.test('Login Parent', async () => {
    const mutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          user { id email role }
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        email: 'siswa1@lms-abk.com',
        password: 'Siswa123!',
      }
    });

    if (!data.login.accessToken) throw new Error('No access token');
    parentToken = data.login.accessToken;
    studentId = data.login.user.id;
  });

  await runner.test('Get Current User (me)', async () => {
    const query = `
      query Me {
        me { id email role isActive }
      }
    `;

    const data = await graphqlRequest(query, {}, teacherToken);
    if (!data.me.id) throw new Error('No user data');
  });
}

// ============================================================================
// DAY 3: CLASSROOM & SUBJECT TESTS
// ============================================================================

async function testClassroomsAndSubjects(runner) {
  console.log('\n🏫 Testing Classrooms & Subjects (Day 3)...');

  await runner.test('Create Classroom', async () => {
    const mutation = `
      mutation CreateClassroom($input: CreateClassroomInput!) {
        createClassroom(input: $input) {
          id name description
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        name: 'Test Classroom ABK',
        description: 'Kelas untuk testing API',
      }
    }, teacherToken);

    if (!data.createClassroom.id) throw new Error('No classroom ID');
    classroomId = data.createClassroom.id;
  });

  await runner.test('Enroll Student to Classroom', async () => {
    const mutation = `
      mutation EnrollStudent($input: EnrollStudentInput!) {
        enrollStudent(input: $input) {
          success
          message
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        classroomId,
        studentUserId: studentId,
      }
    }, teacherToken);

    if (!data.enrollStudent.success) {
      throw new Error('Student not enrolled');
    }
  });

  await runner.test('Create Subject', async () => {
    const mutation = `
      mutation CreateSubject($input: CreateSubjectInput!) {
        createSubject(input: $input) {
          id name description
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        classroomId,
        name: 'Matematika ABK',
        description: 'Matematika untuk anak berkebutuhan khusus',
      }
    }, teacherToken);

    if (!data.createSubject.id) throw new Error('No subject ID');
    subjectId = data.createSubject.id;
  });

  await runner.test('Query My Classrooms', async () => {
    const query = `
      query MyClassrooms {
        myClassrooms {
          id name studentCount subjectCount
        }
      }
    `;

    const data = await graphqlRequest(query, {}, teacherToken);
    if (!data.myClassrooms || data.myClassrooms.length === 0) {
      throw new Error('No classrooms found');
    }
  });
}

// ============================================================================
// DAY 4: MODULE & LESSON TESTS
// ============================================================================

async function testModulesAndLessons(runner) {
  console.log('\n📚 Testing Modules & Lessons (Day 4)...');

  await runner.test('Create Module', async () => {
    const mutation = `
      mutation CreateModule($input: CreateModuleInput!) {
        createModule(input: $input) {
          id name order
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        subjectId,
        name: 'Pengenalan Angka',
        description: 'Modul pengenalan angka 1-10',
        order: 1,
      }
    }, teacherToken);

    if (!data.createModule.id) throw new Error('No module ID');
    moduleId = data.createModule.id;
  });

  await runner.test('Create Lesson', async () => {
    const mutation = `
      mutation CreateLesson($input: CreateLessonInput!) {
        createLesson(input: $input) {
          id title order
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        moduleId,
        title: 'Mengenal Angka 1-5',
        description: 'Pelajaran tentang angka 1 sampai 5',
        content: 'Konten pelajaran angka 1-5',
        order: 1,
      }
    }, teacherToken);

    if (!data.createLesson.id) throw new Error('No lesson ID');
    lessonId = data.createLesson.id;
  });

  await runner.test('Query Subjects', async () => {
    const query = `
      query Subjects($classroomId: String!) {
        subjects(classroomId: $classroomId) {
          id name
        }
      }
    `;

    const data = await graphqlRequest(query, { classroomId }, teacherToken);
    if (!data.subjects || data.subjects.length === 0) throw new Error('No subjects');
  });
}

// ============================================================================
// DAY 5: ASSIGNMENT TESTS (Quiz, Task, Submit, Grade, XP)
// ============================================================================

async function testAssignments(runner) {
  console.log('\n📝 Testing Assignments & Submissions (Day 5)...');

  await runner.test('Create Quiz Assignment', async () => {
    const mutation = `
      mutation CreateAssignment($input: CreateAssignmentInput!) {
        createAssignment(input: $input) {
          id title type xpReward
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        lessonId,
        title: 'Kuis Angka 1-5',
        description: 'Kuis pengenalan angka',
        type: 'QUIZ',
        xpReward: 50,
        isDraft: false,
      }
    }, teacherToken);

    if (!data.createAssignment.id) throw new Error('No assignment ID');
    assignmentId = data.createAssignment.id;
  });

  await runner.test('Add Quiz Questions', async () => {
    const mutation = `
      mutation AddQuestion($input: AddQuizQuestionInput!) {
        addQuizQuestion(input: $input) {
          id question
        }
      }
    `;

    await graphqlRequest(mutation, {
      input: {
        assignmentId,
        question: 'Berapa 1 + 1?',
        options: [
          { optionKey: 'A', text: '1', isCorrect: false },
          { optionKey: 'B', text: '2', isCorrect: true },
          { optionKey: 'C', text: '3', isCorrect: false },
        ],
        order: 1,
      }
    }, teacherToken);
  });

  await runner.test('Start Submission (Student)', async () => {
    const mutation = `
      mutation StartSubmission($assignmentId: String!) {
        startSubmission(assignmentId: $assignmentId) {
          id status
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      assignmentId,
    }, parentToken);

    if (!data.startSubmission.id) throw new Error('No submission ID');
    submissionId = data.startSubmission.id;
  });

  await runner.test('Check Student Profile', async () => {
    const query = `
      query Me {
        me {
          id email role
        }
      }
    `;

    const data = await graphqlRequest(query, {}, parentToken);
    if (!data.me.id) throw new Error('No user data');
  });
}

// ============================================================================
// DAY 6: NOTES & DAILY REPORTS TESTS
// ============================================================================

async function testNotesAndReports(runner) {
  console.log('\n💬 Testing Notes & Daily Reports (Day 6)...');

  // First, get the actual student ID (not user ID)
  let actualStudentId = null;
  
  await runner.test('Get Student ID from enrolled students', async () => {
    const query = `
      query MyStudents {
        myStudents {
          id
          userId
        }
      }
    `;

    const data = await graphqlRequest(query, {}, teacherToken);
    if (!data.myStudents || data.myStudents.length === 0) {
      throw new Error('No students found');
    }
    
    // Find the student we enrolled earlier (where userId matches studentId from login)
    const student = data.myStudents.find(s => s.userId === studentId);
    if (!student) {
      // If not found, just use the first student
      actualStudentId = data.myStudents[0].id;
    } else {
      actualStudentId = student.id;
    }
  });

  await runner.test('Create Note (Teacher → Student)', async () => {
    const mutation = `
      mutation CreateNote($input: CreateNoteInput!) {
        createNote(input: $input) {
          id content writtenBy { role }
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        studentId: actualStudentId,
        content: 'Perkembangan anak sangat baik hari ini!',
      }
    }, teacherToken);

    if (!data.createNote.id) throw new Error('No note ID');
    noteId = data.createNote.id;
  });

  await runner.test('Reply to Note (Parent)', async () => {
    const mutation = `
      mutation CreateNote($input: CreateNoteInput!) {
        createNote(input: $input) {
          id parentNoteId
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        studentId: actualStudentId,
        content: 'Terima kasih atas perhatiannya!',
        parentNoteId: noteId,
      }
    }, parentToken);

    if (!data.createNote.parentNoteId) throw new Error('Not a reply');
  });

  await runner.test('Query Notes by Student', async () => {
    const query = `
      query NotesByStudent($studentId: String!) {
        notesByStudent(studentId: $studentId) {
          id content
          replies { id content }
        }
      }
    `;

    const data = await graphqlRequest(query, { studentId: actualStudentId }, teacherToken);
    if (!data.notesByStudent || data.notesByStudent.length === 0) throw new Error('No notes');
  });

  await runner.test('Create Daily Report with Mood', async () => {
    const mutation = `
      mutation CreateDailyReport($input: CreateDailyReportInput!) {
        createDailyReport(input: $input) {
          id mood activities
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        studentId: actualStudentId,
        date: new Date().toISOString().split('T')[0],
        mood: 'HAPPY',
        activities: ['Belajar menghitung', 'Bermain puzzle'],
        achievements: 'Bisa menghitung 1-10',
        challenges: 'Masih kesulitan dengan angka 6-7',
      }
    }, teacherToken);

    if (!data.createDailyReport.id) throw new Error('No report ID');
    if (data.createDailyReport.mood !== 'HAPPY') throw new Error('Mood mismatch');
    reportId = data.createDailyReport.id;
  });

  await runner.test('Add Comment to Daily Report (Parent)', async () => {
    const mutation = `
      mutation AddComment($input: AddCommentInput!) {
        addDailyReportComment(input: $input) {
          id content
        }
      }
    `;

    const data = await graphqlRequest(mutation, {
      input: {
        reportId,
        content: 'Terima kasih laporannya! Di rumah juga akan kami bantu latihan angka 6-7.',
      }
    }, parentToken);

    if (!data.addDailyReportComment.id) {
      throw new Error('Comment not added');
    }
  });
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 LMS API Test Suite - Day 1-6 Integration Tests');
  console.log('='.repeat(60));

  const runner = new TestRunner();

  try {
    // Check if server is running
    try {
      await fetch(API_URL, { method: 'POST', body: '{}' });
    } catch (error) {
      console.log('\n❌ Backend server not running on http://localhost:3001');
      console.log('   Start the server first: cd apps/backend && pnpm nest start\n');
      process.exit(1);
    }

    await testAuth(runner);
    await testClassroomsAndSubjects(runner);
    await testModulesAndLessons(runner);
    await testAssignments(runner);
    await testNotesAndReports(runner);

    runner.summary();
  } catch (error) {
    console.log('\n💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

// Run tests
main().catch(console.error);
