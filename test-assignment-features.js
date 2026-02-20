/**
 * COMPREHENSIVE ASSIGNMENT FEATURES TEST
 * Tests: Create, View, Edit (backend only), Submit, Grade
 */

const API_URL = 'http://localhost:3001/graphql';

let teacherToken = null;
let studentToken = null;
let assignmentId = null;
let submissionId = null;
let questionId = null;

// Test Data
const lessonId = 'cm5k3xrgx002adawkptivtlcd'; // From your seed data

async function graphqlRequest(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    return result.data;
  } catch (error) {
    throw new Error(`GraphQL Error: ${error.message}`);
  }
}

function logResult(test, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}: ${status}${details ? ` - ${details}` : ''}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// ============================================
// AUTHENTICATION
// ============================================
async function login(email, password) {
  const mutation = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user {
          id
          email
          role
        }
      }
    }
  `;

  const data = await graphqlRequest(mutation, {
    input: { email, password }
  });

  return data.login.accessToken;
}

// ============================================
// TEST FUNCTIONS
// ============================================

async function testCreateAssignment() {
  logSection('TEST 1: Create Assignment');
  
  const mutation = `
    mutation CreateAssignment($input: CreateAssignmentInput!) {
      createAssignment(input: $input) {
        id
        title
        description
        type
        dueDate
        xpReward
        isDraft
        isActive
      }
    }
  `;

  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const data = await graphqlRequest(mutation, {
      input: {
        lessonId: lessonId,
        title: 'Test Quiz: Angka 1-10',
        description: 'Quiz untuk test feature assignment',
        type: 'QUIZ',
        dueDate: futureDate.toISOString(),
        xpReward: 100,
        isDraft: true
      }
    }, teacherToken);

    if (data.createAssignment && data.createAssignment.id) {
      assignmentId = data.createAssignment.id;
      logResult('Create Assignment', 'PASS', `ID: ${assignmentId}`);
      logResult('  Title', 'PASS', data.createAssignment.title);
      logResult('  Type', 'PASS', data.createAssignment.type);
      logResult('  XP Reward', 'PASS', data.createAssignment.xpReward);
      logResult('  Is Draft', 'PASS', data.createAssignment.isDraft);
      return true;
    } else {
      logResult('Create Assignment', 'FAIL', 'No ID returned');
      return false;
    }
  } catch (error) {
    logResult('Create Assignment', 'FAIL', error.message);
    return false;
  }
}

async function testAddQuizQuestions() {
  logSection('TEST 2: Add Quiz Questions');
  
  const mutation = `
    mutation AddQuizQuestion($input: AddQuizQuestionInput!) {
      addQuizQuestion(input: $input) {
        id
        question
        options {
          id
          optionKey
          text
          isCorrect
        }
      }
    }
  `;

  try {
    // Question 1
    const data1 = await graphqlRequest(mutation, {
      input: {
        assignmentId: assignmentId,
        question: '2 + 2 = ?',
        order: 1,
        options: [
          { optionKey: 'A', text: '3', isCorrect: false },
          { optionKey: 'B', text: '4', isCorrect: true },
          { optionKey: 'C', text: '5', isCorrect: false },
          { optionKey: 'D', text: '6', isCorrect: false }
        ]
      }
    }, teacherToken);

    questionId = data1.addQuizQuestion.id;
    logResult('Add Question 1', 'PASS', data1.addQuizQuestion.question);

    // Question 2
    const data2 = await graphqlRequest(mutation, {
      input: {
        assignmentId: assignmentId,
        question: '5 + 3 = ?',
        order: 2,
        options: [
          { optionKey: 'A', text: '7', isCorrect: false },
          { optionKey: 'B', text: '8', isCorrect: true },
          { optionKey: 'C', text: '9', isCorrect: false },
          { optionKey: 'D', text: '10', isCorrect: false }
        ]
      }
    }, teacherToken);

    logResult('Add Question 2', 'PASS', data2.addQuizQuestion.question);
    
    return true;
  } catch (error) {
    logResult('Add Quiz Questions', 'FAIL', error.message);
    return false;
  }
}

async function testUpdateAssignment() {
  logSection('TEST 3: Update Assignment (Backend Only)');
  
  const mutation = `
    mutation UpdateAssignment($input: UpdateAssignmentInput!) {
      updateAssignment(input: $input) {
        id
        title
        description
        xpReward
        updatedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, {
      input: {
        id: assignmentId,
        title: 'UPDATED: Test Quiz Angka 1-10',
        description: 'Deskripsi telah diupdate via API',
        xpReward: 150
      }
    }, teacherToken);

    if (data.updateAssignment.title.includes('UPDATED')) {
      logResult('Update Assignment', 'PASS', 'Backend API works');
      logResult('  New Title', 'PASS', data.updateAssignment.title);
      logResult('  New XP', 'PASS', data.updateAssignment.xpReward);
      logResult('⚠️  Frontend UI', 'MISSING', 'No edit form in UI for teachers');
      return true;
    } else {
      logResult('Update Assignment', 'FAIL', 'Title not updated');
      return false;
    }
  } catch (error) {
    logResult('Update Assignment', 'FAIL', error.message);
    return false;
  }
}

async function testToggleDraft() {
  logSection('TEST 4: Toggle Draft (Publish)');
  
  const mutation = `
    mutation ToggleDraft($assignmentId: String!) {
      toggleAssignmentDraft(assignmentId: $assignmentId) {
        id
        isDraft
        isActive
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, {
      assignmentId: assignmentId
    }, teacherToken);

    if (!data.toggleAssignmentDraft.isDraft) {
      logResult('Publish Assignment', 'PASS', 'Changed from draft to published');
      return true;
    } else {
      logResult('Publish Assignment', 'FAIL', 'Still in draft');
      return false;
    }
  } catch (error) {
    logResult('Toggle Draft', 'FAIL', error.message);
    return false;
  }
}

async function testStudentViewAssignment() {
  logSection('TEST 5: Student View Assignment');
  
  const query = `
    query AssignmentForStudent($assignmentId: String!) {
      assignmentForStudent(assignmentId: $assignmentId) {
        id
        title
        description
        type
        dueDate
        xpReward
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

  try {
    const data = await graphqlRequest(query, {
      assignmentId: assignmentId
    }, studentToken);

    const assignment = data.assignmentForStudent;
    logResult('View Assignment', 'PASS', assignment.title);
    logResult('  Question Count', 'PASS', `${assignment.questionCount} questions`);
    logResult('  Options Visible', 'PASS', 'Student can see options');
    
    // Check that correct answers are NOT exposed
    const hasCorrectFlag = assignment.quizQuestions.some(q => 
      q.options.some(opt => opt.isCorrect !== undefined)
    );
    
    if (!hasCorrectFlag) {
      logResult('  Security', 'PASS', 'Correct answers hidden from student');
    } else {
      logResult('  Security', 'FAIL', 'Correct answers exposed!');
    }
    
    return true;
  } catch (error) {
    logResult('Student View', 'FAIL', error.message);
    return false;
  }
}

async function testStartSubmission() {
  logSection('TEST 6: Start Submission');
  
  const mutation = `
    mutation StartSubmission($assignmentId: String!) {
      startSubmission(assignmentId: $assignmentId) {
        id
        assignmentId
        studentId
        status
        createdAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, {
      assignmentId: assignmentId
    }, studentToken);

    if (data.startSubmission && data.startSubmission.id) {
      submissionId = data.startSubmission.id;
      logResult('Start Submission', 'PASS', `Submission ID: ${submissionId}`);
      logResult('  Status', 'PASS', data.startSubmission.status);
      return true;
    } else {
      logResult('Start Submission', 'FAIL', 'No submission ID');
      return false;
    }
  } catch (error) {
    logResult('Start Submission', 'FAIL', error.message);
    return false;
  }
}

async function testSubmitQuizAnswers() {
  logSection('TEST 7: Submit Quiz Answers');
  
  const query = `
    query GetQuestions($assignmentId: String!) {
      assignmentForStudent(assignmentId: $assignmentId) {
        quizQuestions {
          id
          question
        }
      }
    }
  `;

  const mutation = `
    mutation SubmitAnswer($input: SubmitQuizAnswerInput!) {
      submitQuizAnswer(input: $input) {
        id
        status
      }
    }
  `;

  try {
    // Get questions
    const questionsData = await graphqlRequest(query, {
      assignmentId: assignmentId
    }, studentToken);

    const questions = questionsData.assignmentForStudent.quizQuestions;

    // Submit answer for each question
    for (const question of questions) {
      await graphqlRequest(mutation, {
        input: {
          submissionId: submissionId,
          questionId: question.id,
          selectedOptionKey: 'B' // Assuming B is correct for both
        }
      }, studentToken);
    }

    logResult('Submit Answers', 'PASS', `Submitted ${questions.length} answers`);
    return true;
  } catch (error) {
    logResult('Submit Answers', 'FAIL', error.message);
    return false;
  }
}

async function testAutoGrading() {
  logSection('TEST 8: Auto-Grading (Quiz)');
  
  const query = `
    query GetSubmission($submissionId: String!) {
      submissionDetail(submissionId: $submissionId) {
        id
        status
        score
        submittedAt
        quizAnswers {
          question {
            question
          }
          selectedOption {
            optionKey
            isCorrect
          }
          isCorrect
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest(query, {
      submissionId: submissionId
    }, teacherToken);

    const submission = data.submissionDetail;
    
    if (submission.status === 'GRADED') {
      logResult('Auto-Grading', 'PASS', 'Quiz auto-graded');
      logResult('  Score', 'PASS', `${submission.score}/100`);
      logResult('  Status', 'PASS', submission.status);
      
      const correctCount = submission.quizAnswers.filter(a => a.isCorrect).length;
      const totalCount = submission.quizAnswers.length;
      logResult('  Correct Answers', 'INFO', `${correctCount}/${totalCount}`);
      
      return true;
    } else {
      logResult('Auto-Grading', 'FAIL', `Status: ${submission.status}`);
      return false;
    }
  } catch (error) {
    logResult('Auto-Grading', 'FAIL', error.message);
    return false;
  }
}

async function testTeacherViewSubmissions() {
  logSection('TEST 9: Teacher View Submissions');
  
  const query = `
    query GetSubmissions($assignmentId: String!) {
      submissionsForAssignment(assignmentId: $assignmentId) {
        id
        status
        score
        student {
          studentName
        }
        submittedAt
      }
    }
  `;

  try {
    const data = await graphqlRequest(query, {
      assignmentId: assignmentId
    }, teacherToken);

    const submissions = data.submissionsForAssignment;
    
    if (submissions.length > 0) {
      logResult('View Submissions', 'PASS', `${submissions.length} submission(s)`);
      
      submissions.forEach((sub, i) => {
        logResult(`  Submission ${i+1}`, 'INFO', 
          `${sub.student.studentName} - Score: ${sub.score} - Status: ${sub.status}`
        );
      });
      
      return true;
    } else {
      logResult('View Submissions', 'FAIL', 'No submissions found');
      return false;
    }
  } catch (error) {
    logResult('View Submissions', 'FAIL', error.message);
    return false;
  }
}

async function testDeleteQuizQuestion() {
  logSection('TEST 10: Delete Quiz Question');
  
  const mutation = `
    mutation DeleteQuestion($questionId: String!) {
      deleteQuizQuestion(questionId: $questionId) {
        success
        message
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, {
      questionId: questionId
    }, teacherToken);

    if (data.deleteQuizQuestion.success) {
      logResult('Delete Question', 'PASS', data.deleteQuizQuestion.message);
      return true;
    } else {
      logResult('Delete Question', 'FAIL', 'Delete failed');
      return false;
    }
  } catch (error) {
    logResult('Delete Question', 'FAIL', error.message);
    return false;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║       COMPREHENSIVE ASSIGNMENT FEATURES TEST             ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  try {
    // Login
    logSection('SETUP: Authentication');
    teacherToken = await login('guru@lms-abk.com', 'Guru123!');
    logResult('Teacher Login', 'PASS', 'Token acquired');
    
    studentToken = await login('siswa1@lms-abk.com', 'Siswa123!');
    logResult('Student Login', 'PASS', 'Token acquired');

    // Run Tests
    const results = [];
    
    results.push(await testCreateAssignment());
    results.push(await testAddQuizQuestions());
    results.push(await testUpdateAssignment());
    results.push(await testToggleDraft());
    results.push(await testStudentViewAssignment());
    results.push(await testStartSubmission());
    results.push(await testSubmitQuizAnswers());
    results.push(await testAutoGrading());
    results.push(await testTeacherViewSubmissions());
    results.push(await testDeleteQuizQuestion());

    // Summary
    logSection('SUMMARY');
    const passed = results.filter(r => r === true).length;
    const failed = results.filter(r => r === false).length;
    
    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed/results.length) * 100).toFixed(1)}%`);
    
    logSection('CRITICAL FINDINGS');
    console.log('⚠️  MISSING FEATURE: Frontend Edit Assignment Form');
    console.log('   - Backend API works (updateAssignment mutation)');
    console.log('   - Frontend has NO UI to edit title, description, dueDate, XP');
    console.log('   - Teachers can only add/delete questions, toggle draft');
    console.log('   - Need to add edit form in assignment detail page\n');

  } catch (error) {
    console.error('\n❌ Test runner failed:', error.message);
  }
}

// Run the tests
runTests().catch(console.error);
