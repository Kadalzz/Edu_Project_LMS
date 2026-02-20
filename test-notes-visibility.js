// Test script to verify notes from parent are visible to teacher
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
  console.log('🔍 Testing Notes Visibility Between Parent and Teacher\n');

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

  // 2b. Get children info
  const meData = await graphqlRequest(`
    query {
      me {
        children {
          id
          user { studentName }
        }
      }
    }
  `, {}, parentToken);

  const child = meData.me.children[0];
  console.log(`   Child: ${child.user.studentName} (ID: ${child.id})\n`);

  // 3. Create a note as parent
  console.log('3️⃣ Creating note as parent...');
  try {
    const noteData = await graphqlRequest(`
      mutation CreateNote($input: CreateNoteInput!) {
        createNote(input: $input) {
          id
          content
          writtenBy {
            id
            name
            role
          }
          createdAt
        }
      }
    `, {
      input: {
        studentId: child.id,
        content: 'Saya ingin bertanya tentang perkembangan anak saya. Terima kasih.',
      }
    }, parentToken);

    console.log(`✅ Note created successfully!`);
    console.log(`   Note ID: ${noteData.createNote.id}`);
    console.log(`   Content: ${noteData.createNote.content}`);
    console.log(`   Written by: ${noteData.createNote.writtenBy.name} (${noteData.createNote.writtenBy.role})\n`);
  } catch (error) {
    console.log(`⚠️  Could not create note: ${error.message}\n`);
  }

  // 4. Fetch notes as teacher
  console.log('4️⃣ Fetching notes as teacher...');
  const notesAsTeacher = await graphqlRequest(`
    query NotesByStudent($studentId: String!) {
      notesByStudent(studentId: $studentId) {
        id
        content
        writtenBy {
          id
          name
          role
        }
        replies {
          id
          content
          writtenBy {
            name
            role
          }
        }
        createdAt
      }
    }
  `, { studentId: child.id }, teacherToken);

  const notes = notesAsTeacher.notesByStudent;
  console.log(`✅ Teacher found ${notes.length} note(s):`);
  
  let parentNoteCount = 0;
  let teacherNoteCount = 0;
  
  notes.forEach((note, index) => {
    console.log(`\n   Note ${index + 1}:`);
    console.log(`   - Content: ${note.content.substring(0, 50)}...`);
    console.log(`   - Written by: ${note.writtenBy.name} (${note.writtenBy.role})`);
    console.log(`   - Replies: ${note.replies.length}`);
    
    if (note.writtenBy.role === 'STUDENT_PARENT') {
      parentNoteCount++;
    } else if (note.writtenBy.role === 'TEACHER') {
      teacherNoteCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   - Notes from PARENT: ${parentNoteCount}`);
  console.log(`   - Notes from TEACHER: ${teacherNoteCount}`);
  console.log(`   - Total notes: ${notes.length}`);

  if (parentNoteCount === 0) {
    console.log('\n   ❌ NO NOTES FROM PARENT FOUND!');
    console.log('   The teacher cannot see notes created by parents.');
  } else {
    console.log('\n   ✅ SUCCESS! Teacher can see notes from parents!');
  }

  // 5. Fetch notes as parent for comparison
  console.log('\n5️⃣ Fetching notes as parent...');
  const notesAsParent = await graphqlRequest(`
    query NotesByStudent($studentId: String!) {
      notesByStudent(studentId: $studentId) {
        id
        content
        writtenBy {
          name
          role
        }
      }
    }
  `, { studentId: child.id }, parentToken);

  console.log(`✅ Parent can see ${notesAsParent.notesByStudent.length} note(s)`);

  console.log('\n🎉 Test completed!');
}

main().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
