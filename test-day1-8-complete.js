/**
 * Comprehensive Backend API Testing for Day 1-8
 * Tests all GraphQL resolvers and CRUD operations
 */

const API_URL = 'http://localhost:3001/graphql';
let accessToken = '';
let testData = {
  subjectId: null,
  moduleId: null,
  lessonId: null,
  assignmentId: null,
  userId: null,
  classroomId: null,
  noteId: null,
  reportId: null
};

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

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(JSON.stringify(result.errors, null, 2));
  }
  
  return result.data;
}

// Test counter
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;

function logTest(name, status, message = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} ${name}${message ? ': ' + message : ''}`);
  
  if (status === 'PASS') passedTests++;
  else if (status === 'FAIL') failedTests++;
  else skippedTests++;
}

console.log('\n🚀 Starting Day 1-8 Backend API Testing\n');
console.log('='.repeat(60));

// ============================================
// DAY 1: AUTHENTICATION
// ============================================
console.log('\n📋 DAY 1: Authentication Tests');
console.log('-'.repeat(60));

async function testAuthentication() {
  try {
    // Test 1: Login with valid credentials
    const loginQuery = `
      mutation Login($email: String!, $password: String!) {
        login(loginInput: { email: $email, password: $password }) {
          accessToken
          user {
            id
            email
            name
            role
          }
        }
      }
    `;

    const loginResult = await graphqlRequest(loginQuery, {
      email: 'admin@lms.com',
      password: 'admin123'
    });

    if (loginResult.login && loginResult.login.accessToken) {
      accessToken = loginResult.login.accessToken;
      logTest('Login with valid credentials', 'PASS', `Token received, User: ${loginResult.login.user.name}`);
    } else {
      logTest('Login with valid credentials', 'FAIL', 'No token received');
    }

    // Test 2: Login with invalid credentials
    try {
      await graphqlRequest(loginQuery, {
        email: 'admin@lms.com',
        password: 'wrongpassword'
      });
      logTest('Login with invalid password', 'FAIL', 'Should have thrown error');
    } catch (error) {
      logTest('Login with invalid password', 'PASS', 'Error handled correctly');
    }

    // Test 3: Get current user (me)
    const meQuery = `
      query Me {
        me {
          id
          email
          name
          role
        }
      }
    `;

    const meResult = await graphqlRequest(meQuery, {}, accessToken);
    if (meResult.me && meResult.me.email) {
      logTest('Get current user (me)', 'PASS', `Logged in as: ${meResult.me.name}`);
    } else {
      logTest('Get current user (me)', 'FAIL', 'No user data');
    }

  } catch (error) {
    logTest('Authentication Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 3: SUBJECTS
// ============================================
console.log('\n📋 DAY 3: Subjects CRUD Tests');
console.log('-'.repeat(60));

async function testSubjects() {
  try {
    // Create Subject
    const createSubjectMutation = `
      mutation CreateSubject($input: CreateSubjectInput!) {
        createSubject(createSubjectInput: $input) {
          id
          name
          code
          description
        }
      }
    `;

    const createResult = await graphqlRequest(createSubjectMutation, {
      input: {
        name: 'Test Subject API',
        code: 'TEST-API-001',
        description: 'Auto-generated test subject'
      }
    }, accessToken);

    if (createResult.createSubject && createResult.createSubject.id) {
      testData.subjectId = createResult.createSubject.id;
      logTest('Create Subject', 'PASS', `ID: ${testData.subjectId}`);
    } else {
      logTest('Create Subject', 'FAIL', 'No ID returned');
      return;
    }

    // Get All Subjects
    const getSubjectsQuery = `
      query GetSubjects {
        subjects {
          id
          name
          code
        }
      }
    `;

    const subjectsResult = await graphqlRequest(getSubjectsQuery, {}, accessToken);
    if (subjectsResult.subjects && subjectsResult.subjects.length > 0) {
      logTest('Get All Subjects', 'PASS', `Found ${subjectsResult.subjects.length} subjects`);
    } else {
      logTest('Get All Subjects', 'FAIL', 'No subjects found');
    }

    // Get Subject by ID
    const getSubjectQuery = `
      query GetSubject($id: Int!) {
        subject(id: $id) {
          id
          name
          code
          description
        }
      }
    `;

    const subjectResult = await graphqlRequest(getSubjectQuery, {
      id: parseInt(testData.subjectId)
    }, accessToken);

    if (subjectResult.subject && subjectResult.subject.id) {
      logTest('Get Subject by ID', 'PASS', `Name: ${subjectResult.subject.name}`);
    } else {
      logTest('Get Subject by ID', 'FAIL', 'Subject not found');
    }

    // Update Subject
    const updateSubjectMutation = `
      mutation UpdateSubject($id: Int!, $input: UpdateSubjectInput!) {
        updateSubject(id: $id, updateSubjectInput: $input) {
          id
          name
          description
        }
      }
    `;

    const updateResult = await graphqlRequest(updateSubjectMutation, {
      id: parseInt(testData.subjectId),
      input: {
        description: 'Updated description by test script'
      }
    }, accessToken);

    if (updateResult.updateSubject && updateResult.updateSubject.description.includes('Updated')) {
      logTest('Update Subject', 'PASS', 'Description updated');
    } else {
      logTest('Update Subject', 'FAIL', 'Update failed');
    }

    // Delete Subject (will do at the end to avoid cascade issues)

  } catch (error) {
    logTest('Subjects Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 4: MODULES
// ============================================
console.log('\n📋 DAY 4: Modules CRUD Tests');
console.log('-'.repeat(60));

async function testModules() {
  try {
    if (!testData.subjectId) {
      logTest('Modules Tests', 'SKIP', 'No subject ID available');
      return;
    }

    // Create Module
    const createModuleMutation = `
      mutation CreateModule($input: CreateModuleInput!) {
        createModule(createModuleInput: $input) {
          id
          title
          order
          subjectId
        }
      }
    `;

    const createResult = await graphqlRequest(createModuleMutation, {
      input: {
        title: 'Test Module API',
        description: 'Auto-generated test module',
        order: 1,
        subjectId: parseInt(testData.subjectId)
      }
    }, accessToken);

    if (createResult.createModule && createResult.createModule.id) {
      testData.moduleId = createResult.createModule.id;
      logTest('Create Module', 'PASS', `ID: ${testData.moduleId}`);
    } else {
      logTest('Create Module', 'FAIL', 'No ID returned');
      return;
    }

    // Get All Modules
    const getModulesQuery = `
      query GetModules {
        modules {
          id
          title
          subject {
            name
          }
        }
      }
    `;

    const modulesResult = await graphqlRequest(getModulesQuery, {}, accessToken);
    if (modulesResult.modules && modulesResult.modules.length > 0) {
      logTest('Get All Modules', 'PASS', `Found ${modulesResult.modules.length} modules`);
    } else {
      logTest('Get All Modules', 'FAIL', 'No modules found');
    }

    // Get Modules by Subject
    const getModulesBySubjectQuery = `
      query GetModulesBySubject($subjectId: Int!) {
        modulesBySubject(subjectId: $subjectId) {
          id
          title
        }
      }
    `;

    const modulesBySubjectResult = await graphqlRequest(getModulesBySubjectQuery, {
      subjectId: parseInt(testData.subjectId)
    }, accessToken);

    if (modulesBySubjectResult.modulesBySubject) {
      logTest('Get Modules by Subject', 'PASS', `Found ${modulesBySubjectResult.modulesBySubject.length} modules`);
    } else {
      logTest('Get Modules by Subject', 'FAIL');
    }

    // Update Module
    const updateModuleMutation = `
      mutation UpdateModule($id: Int!, $input: UpdateModuleInput!) {
        updateModule(id: $id, updateModuleInput: $input) {
          id
          title
          order
        }
      }
    `;

    const updateResult = await graphqlRequest(updateModuleMutation, {
      id: parseInt(testData.moduleId),
      input: {
        order: 2
      }
    }, accessToken);

    if (updateResult.updateModule && updateResult.updateModule.order === 2) {
      logTest('Update Module', 'PASS', 'Order updated to 2');
    } else {
      logTest('Update Module', 'FAIL', 'Update failed');
    }

  } catch (error) {
    logTest('Modules Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 5: LESSONS
// ============================================
console.log('\n📋 DAY 5: Lessons CRUD Tests');
console.log('-'.repeat(60));

async function testLessons() {
  try {
    if (!testData.moduleId) {
      logTest('Lessons Tests', 'SKIP', 'No module ID available');
      return;
    }

    // Create Lesson
    const createLessonMutation = `
      mutation CreateLesson($input: CreateLessonInput!) {
        createLesson(createLessonInput: $input) {
          id
          title
          content
          moduleId
        }
      }
    `;

    const createResult = await graphqlRequest(createLessonMutation, {
      input: {
        title: 'Test Lesson API',
        content: 'This is auto-generated test lesson content with **markdown** support.',
        order: 1,
        moduleId: parseInt(testData.moduleId)
      }
    }, accessToken);

    if (createResult.createLesson && createResult.createLesson.id) {
      testData.lessonId = createResult.createLesson.id;
      logTest('Create Lesson', 'PASS', `ID: ${testData.lessonId}`);
    } else {
      logTest('Create Lesson', 'FAIL', 'No ID returned');
      return;
    }

    // Get All Lessons
    const getLessonsQuery = `
      query GetLessons {
        lessons {
          id
          title
          module {
            title
          }
        }
      }
    `;

    const lessonsResult = await graphqlRequest(getLessonsQuery, {}, accessToken);
    if (lessonsResult.lessons && lessonsResult.lessons.length > 0) {
      logTest('Get All Lessons', 'PASS', `Found ${lessonsResult.lessons.length} lessons`);
    } else {
      logTest('Get All Lessons', 'FAIL', 'No lessons found');
    }

    // Get Lesson by ID
    const getLessonQuery = `
      query GetLesson($id: Int!) {
        lesson(id: $id) {
          id
          title
          content
          module {
            title
          }
        }
      }
    `;

    const lessonResult = await graphqlRequest(getLessonQuery, {
      id: parseInt(testData.lessonId)
    }, accessToken);

    if (lessonResult.lesson && lessonResult.lesson.content) {
      logTest('Get Lesson by ID', 'PASS', `Content length: ${lessonResult.lesson.content.length} chars`);
    } else {
      logTest('Get Lesson by ID', 'FAIL', 'Lesson not found');
    }

    // Update Lesson
    const updateLessonMutation = `
      mutation UpdateLesson($id: Int!, $input: UpdateLessonInput!) {
        updateLesson(id: $id, updateLessonInput: $input) {
          id
          content
        }
      }
    `;

    const updateResult = await graphqlRequest(updateLessonMutation, {
      id: parseInt(testData.lessonId),
      input: {
        content: 'Updated content by automated test'
      }
    }, accessToken);

    if (updateResult.updateLesson && updateResult.updateLesson.content.includes('Updated')) {
      logTest('Update Lesson', 'PASS', 'Content updated');
    } else {
      logTest('Update Lesson', 'FAIL', 'Update failed');
    }

  } catch (error) {
    logTest('Lessons Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 6: ASSIGNMENTS
// ============================================
console.log('\n📋 DAY 6: Assignments CRUD Tests');
console.log('-'.repeat(60));

async function testAssignments() {
  try {
    if (!testData.lessonId) {
      logTest('Assignments Tests', 'SKIP', 'No lesson ID available');
      return;
    }

    // Create Assignment
    const createAssignmentMutation = `
      mutation CreateAssignment($input: CreateAssignmentInput!) {
        createAssignment(createAssignmentInput: $input) {
          id
          title
          description
          dueDate
          lessonId
        }
      }
    `;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const createResult = await graphqlRequest(createAssignmentMutation, {
      input: {
        title: 'Test Assignment API',
        description: 'Auto-generated test assignment',
        dueDate: futureDate.toISOString(),
        lessonId: parseInt(testData.lessonId)
      }
    }, accessToken);

    if (createResult.createAssignment && createResult.createAssignment.id) {
      testData.assignmentId = createResult.createAssignment.id;
      logTest('Create Assignment', 'PASS', `ID: ${testData.assignmentId}`);
    } else {
      logTest('Create Assignment', 'FAIL', 'No ID returned');
      return;
    }

    // Get All Assignments
    const getAssignmentsQuery = `
      query GetAssignments {
        assignments {
          id
          title
          dueDate
          lesson {
            title
          }
        }
      }
    `;

    const assignmentsResult = await graphqlRequest(getAssignmentsQuery, {}, accessToken);
    if (assignmentsResult.assignments && assignmentsResult.assignments.length > 0) {
      logTest('Get All Assignments', 'PASS', `Found ${assignmentsResult.assignments.length} assignments`);
    } else {
      logTest('Get All Assignments', 'FAIL', 'No assignments found');
    }

    // Update Assignment
    const updateAssignmentMutation = `
      mutation UpdateAssignment($id: Int!, $input: UpdateAssignmentInput!) {
        updateAssignment(id: $id, updateAssignmentInput: $input) {
          id
          description
        }
      }
    `;

    const updateResult = await graphqlRequest(updateAssignmentMutation, {
      id: parseInt(testData.assignmentId),
      input: {
        description: 'Updated by automated test script'
      }
    }, accessToken);

    if (updateResult.updateAssignment && updateResult.updateAssignment.description.includes('Updated')) {
      logTest('Update Assignment', 'PASS', 'Description updated');
    } else {
      logTest('Update Assignment', 'FAIL', 'Update failed');
    }

  } catch (error) {
    logTest('Assignments Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 7: USERS
// ============================================
console.log('\n📋 DAY 7: Users Management Tests');
console.log('-'.repeat(60));

async function testUsers() {
  try {
    // Get All Users
    const getUsersQuery = `
      query GetUsers {
        users {
          id
          name
          email
          role
        }
      }
    `;

    const usersResult = await graphqlRequest(getUsersQuery, {}, accessToken);
    if (usersResult.users && usersResult.users.length > 0) {
      logTest('Get All Users', 'PASS', `Found ${usersResult.users.length} users`);
    } else {
      logTest('Get All Users', 'FAIL', 'No users found');
    }

    // Create User
    const createUserMutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
          id
          name
          email
          role
        }
      }
    `;

    const randomEmail = `testuser${Date.now()}@lms.com`;
    const createResult = await graphqlRequest(createUserMutation, {
      input: {
        name: 'Test User API',
        email: randomEmail,
        password: 'testpass123',
        role: 'STUDENT'
      }
    }, accessToken);

    if (createResult.createUser && createResult.createUser.id) {
      testData.userId = createResult.createUser.id;
      logTest('Create User', 'PASS', `ID: ${testData.userId}, Email: ${randomEmail}`);
    } else {
      logTest('Create User', 'FAIL', 'No ID returned');
      return;
    }

    // Get User by ID
    const getUserQuery = `
      query GetUser($id: Int!) {
        user(id: $id) {
          id
          name
          email
          role
        }
      }
    `;

    const userResult = await graphqlRequest(getUserQuery, {
      id: parseInt(testData.userId)
    }, accessToken);

    if (userResult.user && userResult.user.email === randomEmail) {
      logTest('Get User by ID', 'PASS', `Found: ${userResult.user.name}`);
    } else {
      logTest('Get User by ID', 'FAIL', 'User not found');
    }

    // Update User
    const updateUserMutation = `
      mutation UpdateUser($id: Int!, $input: UpdateUserInput!) {
        updateUser(id: $id, updateUserInput: $input) {
          id
          name
        }
      }
    `;

    const updateResult = await graphqlRequest(updateUserMutation, {
      id: parseInt(testData.userId),
      input: {
        name: 'Updated Test User'
      }
    }, accessToken);

    if (updateResult.updateUser && updateResult.updateUser.name === 'Updated Test User') {
      logTest('Update User', 'PASS', 'Name updated');
    } else {
      logTest('Update User', 'FAIL', 'Update failed');
    }

  } catch (error) {
    logTest('Users Tests', 'FAIL', error.message);
  }
}

// ============================================
// DAY 8: CLASSROOMS
// ============================================
console.log('\n📋 DAY 8: Classrooms Management Tests');
console.log('-'.repeat(60));

async function testClassrooms() {
  try {
    if (!testData.subjectId) {
      logTest('Classrooms Tests', 'SKIP', 'No subject ID available');
      return;
    }

    // Get teacher ID from existing users
    const getUsersQuery = `
      query GetUsers {
        users {
          id
          role
        }
      }
    `;

    const usersResult = await graphqlRequest(getUsersQuery, {}, accessToken);
    const teacher = usersResult.users.find(u => u.role === 'TEACHER');
    
    if (!teacher) {
      logTest('Classrooms Tests', 'SKIP', 'No teacher found in database');
      return;
    }

    // Create Classroom
    const createClassroomMutation = `
      mutation CreateClassroom($input: CreateClassroomInput!) {
        createClassroom(createClassroomInput: $input) {
          id
          name
          subjectId
          teacherId
        }
      }
    `;

    const createResult = await graphqlRequest(createClassroomMutation, {
      input: {
        name: 'Test Classroom API',
        subjectId: parseInt(testData.subjectId),
        teacherId: parseInt(teacher.id),
        schedule: 'Monday, Wednesday 10:00-12:00'
      }
    }, accessToken);

    if (createResult.createClassroom && createResult.createClassroom.id) {
      testData.classroomId = createResult.createClassroom.id;
      logTest('Create Classroom', 'PASS', `ID: ${testData.classroomId}`);
    } else {
      logTest('Create Classroom', 'FAIL', 'No ID returned');
      return;
    }

    // Get All Classrooms
    const getClassroomsQuery = `
      query GetClassrooms {
        classrooms {
          id
          name
          subject {
            name
          }
          teacher {
            name
          }
        }
      }
    `;

    const classroomsResult = await graphqlRequest(getClassroomsQuery, {}, accessToken);
    if (classroomsResult.classrooms && classroomsResult.classrooms.length > 0) {
      logTest('Get All Classrooms', 'PASS', `Found ${classroomsResult.classrooms.length} classrooms`);
    } else {
      logTest('Get All Classrooms', 'FAIL', 'No classrooms found');
    }

    // Update Classroom
    const updateClassroomMutation = `
      mutation UpdateClassroom($id: Int!, $input: UpdateClassroomInput!) {
        updateClassroom(id: $id, updateClassroomInput: $input) {
          id
          name
        }
      }
    `;

    const updateResult = await graphqlRequest(updateClassroomMutation, {
      id: parseInt(testData.classroomId),
      input: {
        name: 'Updated Test Classroom'
      }
    }, accessToken);

    if (updateResult.updateClassroom && updateResult.updateClassroom.name === 'Updated Test Classroom') {
      logTest('Update Classroom', 'PASS', 'Name updated');
    } else {
      logTest('Update Classroom', 'FAIL', 'Update failed');
    }

  } catch (error) {
    logTest('Classrooms Tests', 'FAIL', error.message);
  }
}

// ============================================
// CLEANUP: Delete Test Data
// ============================================
console.log('\n📋 CLEANUP: Deleting Test Data');
console.log('-'.repeat(60));

async function cleanup() {
  try {
    // Delete in reverse order to avoid foreign key constraints

    // Delete Classroom
    if (testData.classroomId) {
      const deleteClassroomMutation = `
        mutation DeleteClassroom($id: Int!) {
          removeClassroom(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteClassroomMutation, { id: parseInt(testData.classroomId) }, accessToken);
      logTest('Delete Classroom', 'PASS', `ID: ${testData.classroomId}`);
    }

    // Delete User
    if (testData.userId) {
      const deleteUserMutation = `
        mutation DeleteUser($id: Int!) {
          removeUser(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteUserMutation, { id: parseInt(testData.userId) }, accessToken);
      logTest('Delete User', 'PASS', `ID: ${testData.userId}`);
    }

    // Delete Assignment
    if (testData.assignmentId) {
      const deleteAssignmentMutation = `
        mutation DeleteAssignment($id: Int!) {
          removeAssignment(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteAssignmentMutation, { id: parseInt(testData.assignmentId) }, accessToken);
      logTest('Delete Assignment', 'PASS', `ID: ${testData.assignmentId}`);
    }

    // Delete Lesson
    if (testData.lessonId) {
      const deleteLessonMutation = `
        mutation DeleteLesson($id: Int!) {
          removeLesson(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteLessonMutation, { id: parseInt(testData.lessonId) }, accessToken);
      logTest('Delete Lesson', 'PASS', `ID: ${testData.lessonId}`);
    }

    // Delete Module
    if (testData.moduleId) {
      const deleteModuleMutation = `
        mutation DeleteModule($id: Int!) {
          removeModule(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteModuleMutation, { id: parseInt(testData.moduleId) }, accessToken);
      logTest('Delete Module', 'PASS', `ID: ${testData.moduleId}`);
    }

    // Delete Subject
    if (testData.subjectId) {
      const deleteSubjectMutation = `
        mutation DeleteSubject($id: Int!) {
          removeSubject(id: $id) {
            id
          }
        }
      `;
      await graphqlRequest(deleteSubjectMutation, { id: parseInt(testData.subjectId) }, accessToken);
      logTest('Delete Subject', 'PASS', `ID: ${testData.subjectId}`);
    }

  } catch (error) {
    logTest('Cleanup', 'FAIL', error.message);
  }
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  try {
    await testAuthentication();
    await testSubjects();
    await testModules();
    await testLessons();
    await testAssignments();
    await testUsers();
    await testClassrooms();
    await cleanup();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏭️  Skipped: ${skippedTests}`);
    console.log(`📈 Total: ${passedTests + failedTests + skippedTests}`);
    console.log(`🎯 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Backend API is fully functional.');
    } else {
      console.log(`\n⚠️  ${failedTests} test(s) failed. Please check the errors above.`);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests();
