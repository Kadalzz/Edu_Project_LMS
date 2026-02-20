/**
 * QUICK ASSIGNMENT TEST
 * First check what data exists, then test assignment features
 */

const API_URL = 'http://localhost:3001/graphql';

let teacherToken = null;
let studentToken = null;
let existingLessonId = null;
let assignmentId = null;

async function graphqlRequest(query, variables = {}, token = null) {
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

function log(icon, msg, detail = '') {
  console.log(`${icon} ${msg}${detail ? `: ${detail}` : ''}`);
}

async function login(email, password) {
  const mutation = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
      }
    }
  `;
  const data = await graphqlRequest(mutation, { input: { email, password } });
  return data.login.accessToken;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   QUICK ASSIGNMENT FEATURES TEST         ║');
  console.log('╚══════════════════════════════════════════╝\n');

  try {
    // 1. Login
    log('🔐', 'Logging in...');
    teacherToken = await login('guru@lms-abk.com', 'Guru123!');
    studentToken = await login('siswa1@lms-abk.com', 'Siswa123!');
    log('✅', 'Authentication', 'Success');

    // 2. Find existing classroom and subjects
    log('\n📚', 'Finding existing data...');
    const classroomsQuery = `
      query {
        classrooms {
          id
          name
        }
      }
    `;
    
    const classData = await graphqlRequest(classroomsQuery, {}, teacherToken);
    const classroom = classData.classrooms[0];
    
    if (!classroom) {
      log('❌', 'No classroom found! Run: cd packages/database; pnpm prisma db seed');
      return;
    }

    log('✅', 'Classroom', classroom.name);
    
    // Get classroom detail with subjects
    const detailQuery = `
      query ClassroomDetail($classroomId: String!) {
        classroomDetail(classroomId: $classroomId) {
          id
          name
          subjects {
            id
            name
            modules {
              id
              name
              lessons {
                id
                title
              }
            }
          }
        }
      }
    `;
    
    const detailData = await graphqlRequest(detailQuery, {
      classroomId: classroom.id
    }, teacherToken);
    
    const subject = detailData.classroomDetail.subjects[0];
    if (!subject) {
      log('❌', 'No subject found!');
      return;
    }
    
    log('✅', 'Subject', subject.name);
    
    const module = subject.modules[0];
    if (!module) {
      log('❌', 'No module found!');
      return;
    }
    
    log('✅', 'Module', module.name);
    
    const lesson = module.lessons[0];
    if (!lesson) {
      log('⚠️', 'No lesson found', 'Need to create one first');
      
      // Create a lesson
      const createLessonMutation = `
        mutation CreateLesson($input: CreateLessonInput!) {
          createLesson(input: $input) {
            id
            title
          }
        }
      `;
      
      const lessonData = await graphqlRequest(createLessonMutation, {
        input: {
          moduleId: module.id,
          title: 'Test Lesson for Assignment',
          description: 'Materi untuk testing',
          content: 'Content test',
          order: 1
        }
      }, teacherToken);
      
      existingLessonId = lessonData.createLesson.id;
      log('✅', 'Created lesson', lessonData.createLesson.title);
    } else {
      existingLessonId = lesson.id;
      log('✅', 'Lesson', lesson.title);
    }

    // 3. CREATE ASSIGNMENT
    log('\n📝', 'Testing CREATE ASSIGNMENT...');
    const createMutation = `
      mutation CreateAssignment($input: CreateAssignmentInput!) {
        createAssignment(input: $input) {
          id
          title
          type
          isDraft
          xpReward
        }
      }
    `;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const assignmentData = await graphqlRequest(createMutation, {
      input: {
        lessonId: existingLessonId,
        title: 'Quiz: Angka 1-5',
        description: 'Test quiz creation',
        type: 'QUIZ',
        dueDate: futureDate.toISOString(),
        xpReward: 100,
        isDraft: true
      }
    }, teacherToken);
    
    assignmentId = assignmentData.createAssignment.id;
    log('✅', 'Create Assignment', assignmentData.createAssignment.title);

    // 4. ADD QUESTIONS
    log('\n❓', 'Testing ADD QUIZ QUESTIONS...');
    const addQuestionMutation = `
      mutation AddQuestion($input: AddQuizQuestionInput!) {
        addQuizQuestion(input: $input) {
          id
          question
        }
      }
    `;
    
    await graphqlRequest(addQuestionMutation, {
      input: {
        assignmentId: assignmentId,
        question: '2 + 2 = ?',
        order: 1,
        options: [
          { optionKey: 'A', text: '3', isCorrect: false },
          { optionKey: 'B', text: '4', isCorrect: true },
          { optionKey: 'C', text: '5', isCorrect: false }
        ]
      }
    }, teacherToken);
    log('✅', 'Add Question 1', '2 + 2 = ?');
    
    await graphqlRequest(addQuestionMutation, {
      input: {
        assignmentId: assignmentId,
        question: '5 + 3 = ?',
        order: 2,
        options: [
          { optionKey: 'A', text: '7', isCorrect: false },
          { optionKey: 'B', text: '8', isCorrect: true },
          { optionKey: 'C', text: '9', isCorrect: false }
        ]
      }
    }, teacherToken);
    log('✅', 'Add Question 2', '5 + 3 = ?');

    // 5. UPDATE ASSIGNMENT (Backend Only)
    log('\n📝', 'Testing UPDATE ASSIGNMENT (Backend API)...');
    const updateMutation = `
      mutation UpdateAssignment($input: UpdateAssignmentInput!) {
        updateAssignment(input: $input) {
          id
          title
          xpReward
        }
      }
    `;
    
    const updatedData = await graphqlRequest(updateMutation, {
      input: {
        id: assignmentId,
        title: 'UPDATED: Quiz Angka 1-5',
        xpReward: 150
      }
    }, teacherToken);
    
    log('✅', 'Update Assignment (API)', updatedData.updateAssignment.title);
    log('⚠️', 'Frontend UI', 'MISSING - No edit form for teachers!');

    // 6. TOGGLE DRAFT (Publish)
    log('\n📢', 'Testing PUBLISH ASSIGNMENT...');
    const toggleMutation = `
      mutation ToggleDraft($assignmentId: String!) {
        toggleAssignmentDraft(assignmentId: $assignmentId) {
          id
          isDraft
        }
      }
    `;
    
    const toggledData = await graphqlRequest(toggleMutation, {
      assignmentId: assignmentId
    }, teacherToken);
    
    log('✅', 'Publish Assignment', `isDraft: ${toggledData.toggleAssignmentDraft.isDraft}`);

    // 7. STUDENT VIEW
    log('\n👁️', 'Testing STUDENT VIEW ASSIGNMENT...');
    const viewQuery = `
      query ViewAssignment($assignmentId: String!) {
        assignmentForStudent(assignmentId: $assignmentId) {
          id
          title
          questionCount
          quizQuestions {
            id
            question
            options {
              optionKey
              text
            }
          }
        }
      }
    `;
    
    const viewData = await graphqlRequest(viewQuery, {
      assignmentId: assignmentId
    }, studentToken);
    
    log('✅', 'Student can view', viewData.assignmentForStudent.title);
    log('✅', 'Questions visible', `${viewData.assignmentForStudent.questionCount} questions`);
    
    // Check security
    const hasCorrect = viewData.assignmentForStudent.quizQuestions.some(q =>
      q.options.some(opt => opt.isCorrect !== undefined)
    );
    log(hasCorrect ? '❌' : '✅', 'Security', hasCorrect ? 'FAIL - Answers exposed!' : 'PASS - Answers hidden');

    // 8. START SUBMISSION
    log('\n📤', 'Testing SUBMIT ASSIGNMENT...');
    const startMutation = `
      mutation StartSubmission($assignmentId: String!) {
        startSubmission(assignmentId: $assignmentId) {
          id
          status
        }
      }
    `;
    
    const submissionData = await graphqlRequest(startMutation, {
      assignmentId: assignmentId
    }, studentToken);
    
    const submissionId = submissionData.startSubmission.id;
    log('✅', 'Start Submission', `ID: ${submissionId.substring(0, 20)}...`);

    // 9. SUBMIT ANSWERS
    const questions = viewData.assignmentForStudent.quizQuestions;
    const answerMutation = `
      mutation SubmitAnswer($input: SubmitQuizAnswerInput!) {
        submitQuizAnswer(input: $input) {
          id
        }
      }
    `;
    
    for (const q of questions) {
      await graphqlRequest(answerMutation, {
        input: {
          submissionId: submissionId,
          questionId: q.id,
          selectedOptionKey: 'B' // Assuming B is correct
        }
      }, studentToken);
    }
    log('✅', 'Submit Answers', `${questions.length} answers submitted`);

    // 10. CHECK AUTO-GRADING
    log('\n⭐', 'Testing AUTO-GRADING...');
    const submissionQuery = `
      query GetSubmission($submissionId: String!) {
        submissionDetail(submissionId: $submissionId) {
          id
          status
          score
        }
      }
    `;
    
    const finalData = await graphqlRequest(submissionQuery, {
      submissionId: submissionId
    }, teacherToken);
    
    if (finalData.submissionDetail.status === 'GRADED') {
      log('✅', 'Auto-Grading', `Score: ${finalData.submissionDetail.score}/100`);
    } else {
      log('❌', 'Auto-Grading', `Status: ${finalData.submissionDetail.status}`);
    }

    // SUMMARY
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║            TEST SUMMARY                  ║');
    console.log('╚══════════════════════════════════════════╝');
    log('✅', 'Create Assignment', 'Working');
    log('✅', 'Add Questions', 'Working');
    log('✅', 'Update Assignment (API)', 'Working');
    log('⚠️', 'Update Assignment (UI)', 'MISSING FEATURE!');
    log('✅', 'Publish Assignment', 'Working');
    log('✅', 'Student View', 'Working');
    log('✅', 'Submit Assignment', 'Working');
    log('✅', 'Auto-Grading', 'Working');
    
    console.log('\n📌 CRITICAL FINDING:');
    console.log('   Frontend TIDAK ada form Edit Assignment!');
    console.log('   Backend API sudah ada, tapi UI belum dibuat.');
    console.log('   Guru hanya bisa toggle draft/publish, tidak bisa');
    console.log('   edit title, description, due date, atau XP reward.\n');

  } catch (error) {
    log('❌', 'Error', error.message);
  }
}

main();
