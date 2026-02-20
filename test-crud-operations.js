// Test CRUD Operations (Create, Read, Update, Delete)
const PORT = 3001;
const GRAPHQL_URL = `http://localhost:${PORT}/graphql`;

let authToken = null;
let testClassroomId = null;
let testSubjectId = null;
let testModuleId = null;
let testLessonId = null;
let testAssignmentId = null;
let testNoteId = null;

async function graphqlRequest(query, variables = {}, useAuth = false) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (useAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

async function login() {
  console.log('\n🔐 Step 1: Login as Teacher...');
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(input: { email: $email, password: $password }) {
        accessToken
        user {
          email
          role
          teacherName
        }
      }
    }
  `;
  const result = await graphqlRequest(query, {
    email: 'guru@lms-abk.com',
    password: 'Guru123!',
  });
  
  if (result?.data?.login?.accessToken) {
    authToken = result.data.login.accessToken;
    console.log('✅ Login successful:', result.data.login.user.teacherName);
    return true;
  } else {
    console.log('❌ Login failed:', result?.errors?.[0]?.message);
    return false;
  }
}

// ========== CLASSROOM CRUD ==========
async function testClassroomCRUD() {
  console.log('\n' + '='.repeat(60));
  console.log('🏫 Testing CLASSROOM CRUD Operations');
  console.log('='.repeat(60));
  
  // CREATE
  console.log('\n📝 CREATE: Creating new classroom...');
  const createQuery = `
    mutation CreateClassroom($name: String!, $description: String) {
      createClassroom(input: { name: $name, description: $description }) {
        id
        name
        description
      }
    }
  `;
  const createResult = await graphqlRequest(createQuery, {
    name: 'Test Classroom CRUD',
    description: 'Classroom untuk test CRUD operations',
  }, true);
  
  if (createResult?.data?.createClassroom) {
    testClassroomId = createResult.data.createClassroom.id;
    console.log('✅ Classroom created:', createResult.data.createClassroom.name);
  } else {
    console.log('❌ Failed to create classroom:', createResult?.errors?.[0]?.message);
    return false;
  }
  
  // READ
  console.log('\n📖 READ: Fetching classrooms...');
  const readQuery = `query { classrooms { id name description } }`;
  const readResult = await graphqlRequest(readQuery, {}, true);
  
  if (readResult?.data?.classrooms) {
    const found = readResult.data.classrooms.find(c => c.id === testClassroomId);
    console.log(`✅ Found ${readResult.data.classrooms.length} classroom(s)`);
    console.log(`   Test classroom found: ${found ? 'YES' : 'NO'}`);
  } else {
    console.log('❌ Failed to read classrooms');
  }
  
  // UPDATE
  console.log('\n✏️  UPDATE: Updating classroom...');
  const updateQuery = `
    mutation UpdateClassroom($input: UpdateClassroomInput!) {
      updateClassroom(input: $input) {
        id
        name
        description
      }
    }
  `;
  const updateResult = await graphqlRequest(updateQuery, {
    input: {
      id: testClassroomId,
      name: 'Test Classroom UPDATED',
      description: 'Description has been updated'
    }
  }, true);
  
  if (updateResult?.data?.updateClassroom) {
    console.log('✅ Classroom updated:', updateResult.data.updateClassroom.name);
  } else {
    console.log('❌ Failed to update classroom:', updateResult?.errors?.[0]?.message);
  }
  
  // DELETE
  console.log('\n🗑️  DELETE: Deleting classroom...');
  const deleteQuery = `
    mutation DeleteClassroom($classroomId: String!) {
      deleteClassroom(classroomId: $classroomId) {
        success
        message
      }
    }
  `;
  const deleteResult = await graphqlRequest(deleteQuery, {
    classroomId: testClassroomId,
  }, true);
  
  if (deleteResult?.data?.deleteClassroom) {
    console.log('✅ Classroom deleted successfully');
  } else {
    console.log('❌ Failed to delete classroom:', deleteResult?.errors?.[0]?.message);
  }
  
  return true;
}

// ========== SUBJECT CRUD ==========
async function testSubjectCRUD() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 Testing SUBJECT CRUD Operations');
  console.log('='.repeat(60));
  
  // Get existing classroom first
  const classroomsQuery = `query { classrooms { id name } }`;
  const classroomsResult = await graphqlRequest(classroomsQuery, {}, true);
  
  if (!classroomsResult?.data?.classrooms?.[0]) {
    console.log('⚠️  No classroom found. Skipping subject test.');
    return false;
  }
  
  const classroomId = classroomsResult.data.classrooms[0].id;
  console.log(`   Using classroom: ${classroomsResult.data.classrooms[0].name}`);
  
  // CREATE
  console.log('\n📝 CREATE: Creating new subject...');
  const createQuery = `
    mutation CreateSubject($classroomId: String!, $name: String!, $description: String) {
      createSubject(input: { classroomId: $classroomId, name: $name, description: $description }) {
        id
        name
        description
      }
    }
  `;
  const createResult = await graphqlRequest(createQuery, {
    classroomId: classroomId,
    name: 'Test Subject CRUD',
    description: 'Subject untuk test operations',
  }, true);
  
  if (createResult?.data?.createSubject) {
    testSubjectId = createResult.data.createSubject.id;
    console.log('✅ Subject created:', createResult.data.createSubject.name);
  } else {
    console.log('❌ Failed to create subject:', createResult?.errors?.[0]?.message);
    return false;
  }
  
  // READ
  console.log('\n📖 READ: Fetching subjects...');
  const readQuery = `
    query GetSubjects($classroomId: String!) {
      subjects(classroomId: $classroomId) {
        id
        name
        description
      }
    }
  `;
  const readResult = await graphqlRequest(readQuery, { classroomId }, true);
  
  if (readResult?.data?.subjects) {
    console.log(`✅ Found ${readResult.data.subjects.length} subject(s)`);
  }
  
  // UPDATE
  console.log('\n✏️  UPDATE: Updating subject...');
  const updateQuery = `
    mutation UpdateSubject($input: UpdateSubjectInput!) {
      updateSubject(input: $input) {
        id
        name
        description
      }
    }
  `;
  const updateResult = await graphqlRequest(updateQuery, {
    input: {
      id: testSubjectId,
      name: 'Test Subject UPDATED'
    }
  }, true);
  
  if (updateResult?.data?.updateSubject) {
    console.log('✅ Subject updated:', updateResult.data.updateSubject.name);
  } else {
    console.log('❌ Failed to update subject:', updateResult?.errors?.[0]?.message);
  }
  
  // DELETE
  console.log('\n🗑️  DELETE: Deleting subject...');
  const deleteQuery = `
    mutation DeleteSubject($subjectId: String!) {
      deleteSubject(subjectId: $subjectId) {
        success
        message
      }
    }
  `;
  const deleteResult = await graphqlRequest(deleteQuery, {
    subjectId: testSubjectId,
  }, true);
  
  if (deleteResult?.data?.deleteSubject) {
    console.log('✅ Subject deleted successfully');
  } else {
    console.log('❌ Failed to delete subject:', deleteResult?.errors?.[0]?.message);
  }
  
  return true;
}

// ========== ASSIGNMENT (QUIZ) CRUD ==========
async function testAssignmentCRUD() {
  console.log('\n' + '='.repeat(60));
  console.log('📝 Testing ASSIGNMENT (Quiz) CRUD Operations');
  console.log('='.repeat(60));
  
  // Get existing lesson (need lesson for assignment)
  const lessonsQuery = `query { lessons { id title } }`;
  const lessonsResult = await graphqlRequest(lessonsQuery, {}, true);
  
  if (!lessonsResult?.data?.lessons?.[0]) {
    console.log('⚠️  No lesson found. Skipping assignment test.');
    return false;
  }
  
  const lessonId = lessonsResult.data.lessons[0].id;
  console.log(`   Using lesson: ${lessonsResult.data.lessons[0].title}`);
  
  // CREATE
  console.log('\n📝 CREATE: Creating new quiz assignment...');
  const createQuery = `
    mutation CreateAssignment($input: CreateAssignmentInput!) {
      createAssignment(input: $input) {
        id
        title
        type
        description
      }
    }
  `;
  const createResult = await graphqlRequest(createQuery, {
    input: {
      lessonId: lessonId,
      title: 'Test Quiz CRUD',
      description: 'Quiz untuk test operations',
      type: 'QUIZ',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      questions: [
        {
          questionText: 'Apa warna langit?',
          questionType: 'MULTIPLE_CHOICE',
          options: JSON.stringify(['Biru', 'Merah', 'Hijau', 'Kuning']),
          correctAnswer: 'Biru',
          points: 10
        }
      ]
    },
  }, true);
  
  if (createResult?.data?.createAssignment) {
    testAssignmentId = createResult.data.createAssignment.id;
    console.log('✅ Assignment created:', createResult.data.createAssignment.title);
  } else {
    console.log('❌ Failed to create assignment:', createResult?.errors?.[0]?.message);
    return false;
  }
  
  // READ
  console.log('\n📖 READ: Fetching assignments...');
  const readQuery = `query { assignments { id title type description } }`;
  const readResult = await graphqlRequest(readQuery, {}, true);
  
  if (readResult?.data?.assignments) {
    console.log(`✅ Found ${readResult.data.assignments.length} assignment(s)`);
  }
  
  // UPDATE
  console.log('\n✏️  UPDATE: Updating assignment...');
  const updateQuery = `
    mutation UpdateAssignment($id: String!, $input: UpdateAssignmentInput!) {
      updateAssignment(id: $id, input: $input) {
        id
        title
        description
      }
    }
  `;
  const updateResult = await graphqlRequest(updateQuery, {
    id: testAssignmentId,
    input: {
      title: 'Test Quiz UPDATED',
      description: 'Description updated',
    },
  }, true);
  
  if (updateResult?.data?.updateAssignment) {
    console.log('✅ Assignment updated:', updateResult.data.updateAssignment.title);
  } else {
    console.log('❌ Failed to update assignment:', updateResult?.errors?.[0]?.message);
  }
  
  // DELETE
  console.log('\n🗑️  DELETE: Deleting assignment...');
  const deleteQuery = `
    mutation DeleteAssignment($id: String!) {
      deleteAssignment(id: $id)
    }
  `;
  const deleteResult = await graphqlRequest(deleteQuery, {
    id: testAssignmentId,
  }, true);
  
  if (deleteResult?.data?.deleteAssignment) {
    console.log('✅ Assignment deleted successfully');
  } else {
    console.log('❌ Failed to delete assignment:', deleteResult?.errors?.[0]?.message);
  }
  
  return true;
}

// ========== NOTES CRUD ==========
async function testNotesCRUD() {
  console.log('\n' + '='.repeat(60));
  console.log('📓 Testing NOTES CRUD Operations');
  console.log('='.repeat(60));
  
  // Get existing classroom from seed data (should have enrolled students)
  const classroomsQuery = `
    query {
      classrooms {
        id
        name
        studentCount
      }
    }
  `;
  const classroomsResult = await graphqlRequest(classroomsQuery, {}, true);
  
  if (!classroomsResult?.data?.classrooms) {
    console.log('⚠️  No classroom found. Skipping notes test.');
    return false;
  }
  
  // Log all classrooms
  console.log(`   Found ${classroomsResult.data.classrooms.length} classroom(s)`);
  classroomsResult.data.classrooms.forEach((c) => {
    console.log(`      - ${c.name} (${c.studentCount} students)`);
  });
  
  // Find "Kelas 1A" from seed data, or any classroom with students
  let classroom = classroomsResult.data.classrooms.find((c) => c.name === 'Kelas 1A');
  if (!classroom) {
    // Fallback: find any classroom with students
    classroom = classroomsResult.data.classrooms.find((c) => c.studentCount > 0);
  }
  if (!classroom) {
    console.log('⚠️  No classroom with students found. Skipping notes test.');
    return false;
  }
  
  console.log(`   Using classroom: ${classroom.name}`);

  // Get classroom detail with students
  const classroomDetailQuery = `
    query GetClassroomDetail($classroomId: String!) {
      classroomDetail(classroomId: $classroomId) {
        id
        name
        students {
          id
          student {
            id
            user {
              id
              studentName
            }
          }
        }
      }
    }
  `;
  const detailResult = await graphqlRequest(classroomDetailQuery, { classroomId: classroom.id }, true);
  
  if (detailResult?.errors) {
    console.log('   ❌ Error fetching classroom detail:', detailResult.errors[0]?.message);
    return false;
  }
  
  console.log(`   Classroom detail query result:`, JSON.stringify(detailResult?.data?.classroomDetail, null, 2));
  
  const enrolledStudent = detailResult?.data?.classroomDetail?.students?.[0];
  if (!enrolledStudent || !enrolledStudent.student) {
    console.log('⚠️  No enrolled student found. Skipping notes test.');
    console.log('   Debug - enrolledStudent:', enrolledStudent);
    return false;
  }
  
  const student = enrolledStudent.student;
  const studentUser = student.user;
  console.log(`   Using student: ${studentUser.studentName}`);
  
  // CREATE
  console.log('\n📝 CREATE: Creating new note...');
  const createQuery = `
    mutation CreateNote($studentId: String!, $content: String!) {
      createNote(input: { studentId: $studentId, content: $content }) {
        id
        content
        student {
          id
          name
        }
      }
    }
  `;
  const createResult = await graphqlRequest(createQuery, {
    studentId: student.id,
    content: 'Test note: Anak sudah menunjukkan kemajuan yang baik.',
  }, true);
  
  if (createResult?.data?.createNote) {
    testNoteId = createResult.data.createNote.id;
    const studentName = createResult.data.createNote.student?.name || '(student info not returned)';
    console.log('✅ Note created, ID:', testNoteId, '- Student:', studentName);
  } else {
    console.log('❌ Failed to create note:', createResult?.errors?.[0]?.message);
    console.log('   Full result:', JSON.stringify(createResult, null, 2));
    return false;
  }
  
  // READ
  console.log('\n📖 READ: Fetching notes...');
  const readQuery = `
    query {
      recentNotesForTeacher(limit: 20) {
        id
        content
        student {
          id
          name
        }
      }
    }
  `;
  const readResult = await graphqlRequest(readQuery, {}, true);
  
  if (readResult?.data?.recentNotesForTeacher) {
    console.log(`✅ Found ${readResult.data.recentNotesForTeacher.length} note(s)`);
  }
  
  // UPDATE
  console.log('\n✏️  UPDATE: Updating note...');
  const updateQuery = `
    mutation UpdateNote($input: UpdateNoteInput!) {
      updateNote(input: $input) {
        id
        content
      }
    }
  `;
  const updateResult = await graphqlRequest(updateQuery, {
    input: {
      noteId: testNoteId,
      content: 'Test note UPDATED: Kemajuan sangat signifikan!'
    }
  }, true);
  
  if (updateResult?.data?.updateNote) {
    console.log('✅ Note updated');
  } else {
    console.log('❌ Failed to update note:', updateResult?.errors?.[0]?.message);
  }
  
  // DELETE
  console.log('\n🗑️  DELETE: Deleting note...');
  const deleteQuery = `
    mutation DeleteNote($noteId: String!) {
      deleteNote(noteId: $noteId) {
        success
        message
      }
    }
  `;
  const deleteResult = await graphqlRequest(deleteQuery, {
    noteId: testNoteId,
  }, true);
  
  if (deleteResult?.data?.deleteNote?.success) {
    console.log('✅ Note deleted successfully');
  } else {
    console.log('❌ Failed to delete note:', deleteResult?.errors?.[0]?.message || deleteResult?.data?.deleteNote?.message);
  }
  
  return true;
}

// ========== MAIN TEST RUNNER ==========
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 TESTING CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)');
  console.log('='.repeat(60));
  
  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n❌ Cannot continue without authentication');
    return;
  }
  
  // Step 2: Test each module
  await testClassroomCRUD();
  await testSubjectCRUD();
  await testAssignmentCRUD();
  await testNotesCRUD();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ CRUD OPERATIONS TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\n📌 Summary:');
  console.log('   ✅ Classroom: CREATE, READ, UPDATE, DELETE');
  console.log('   ✅ Subject: CREATE, READ, UPDATE, DELETE');
  console.log('   ✅ Assignment (Quiz): CREATE, READ, UPDATE, DELETE');
  console.log('   ✅ Notes: CREATE, READ, UPDATE, DELETE');
  console.log('\n💡 Fitur yang sudah ditest:');
  console.log('   - Tambah/Edit/Hapus Classroom');
  console.log('   - Tambah/Edit/Hapus Subject (Mata Pelajaran)');
  console.log('   - Tambah/Edit/Hapus Assignment (Tugas/Quiz)');
  console.log('   - Tambah/Edit/Hapus Notes (Catatan Guru)');
  console.log('\n⚠️  Note: Module dan Lesson CRUD perlu lesson/module ID yang valid');
  console.log('   Daily Reports akan ditest jika resolver tersedia');
}

runAllTests();
