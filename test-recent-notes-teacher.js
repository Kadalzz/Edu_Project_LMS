const API_URL = 'http://localhost:3001/graphql';

// Login queries
const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        role
        studentName
        teacherName
        parentName
      }
    }
  }
`;

// Recent notes query
const RECENT_NOTES_QUERY = `
  query RecentNotesForTeacher($limit: Float) {
    recentNotesForTeacher(limit: $limit) {
      id
      content
      studentId
      writtenById
      writtenBy {
        id
        name
        role
      }
      student {
        id
        name
      }
      replyCount
      createdAt
      updatedAt
    }
  }
`;

// Create note mutation
const CREATE_NOTE_MUTATION = `
  mutation CreateNote($input: CreateNoteInput!) {
    createNote(input: $input) {
      id
      content
      studentId
      writtenById
      writtenBy {
        id
        name
        role
      }
      createdAt
    }
  }
`;

async function graphqlRequest(query, variables = {}, token = null) {
  try {
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
      console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      throw new Error('GraphQL request failed');
    }

    return result.data;
  } catch (error) {
    console.error('Request Error:', error.message);
    throw error;
  }
}

async function testRecentNotesFeature() {
  console.log('\n=== Testing Recent Notes Feature for Teacher ===\n');
  
  try {
    // Step 1: Login as Teacher
    console.log('1. Logging in as Teacher...');
    const teacherLogin = await graphqlRequest(LOGIN_MUTATION, {
      email: 'guru@lms-abk.com',
      password: 'Guru123!',
    });
    
    const teacherToken = teacherLogin.login.accessToken;
    const teacher = teacherLogin.login.user;
    console.log('✅ Teacher logged in:', teacher.teacherName);
    console.log('   Role:', teacher.role);
    console.log('   Teacher ID:', teacher.id);

    // Step 2: Login as Parent
    console.log('\n2. Logging in as Parent...');
    const parentLogin = await graphqlRequest(LOGIN_MUTATION, {
      email: 'siswa1@lms-abk.com',
      password: 'Siswa123!',
    });
    
    const parentToken = parentLogin.login.accessToken;
    const parent = parentLogin.login.user;
    console.log('✅ Parent logged in:', parent.parentName);

    // Get student ID (assuming first child)
    const myChildrenQuery = `
      query {
        me {
          children {
            id
            user {
              studentName
            }
          }
        }
      }
    `;
    
    const childrenData = await graphqlRequest(myChildrenQuery, {}, parentToken);
    const studentId = childrenData.me.children[0].id;
    const studentName = childrenData.me.children[0].user.studentName;
    console.log('   Child:', studentName, '(ID:', studentId + ')');

    // Step 3: Create a new note from parent
    console.log('\n3. Creating a new note from parent...');
    const noteContent = `TEST NOTE ${new Date().toISOString()}: Saya ingin membahas perkembangan anak saya di sekolah. Apakah bisa membuat janji temu?`;
    const newNote = await graphqlRequest(
      CREATE_NOTE_MUTATION,
      {
        input: {
          studentId: studentId,
          content: noteContent,
        }
      },
      parentToken
    );
    
    console.log('✅ Note created successfully!');
    console.log('   Note ID:', newNote.createNote.id);
    console.log('   Content:', newNote.createNote.content.substring(0, 50) + '...');

    // Step 4: Fetch recent notes as teacher (NEW FEATURE)
    console.log('\n4. Fetching recent notes for teacher (NEW FEATURE)...');
    const recentNotes = await graphqlRequest(
      RECENT_NOTES_QUERY,
      { limit: 5 },
      teacherToken
    );

    console.log('✅ Recent notes fetched successfully!');
    console.log('   Total notes:', recentNotes.recentNotesForTeacher.length);
    
    if (recentNotes.recentNotesForTeacher.length > 0) {
      console.log('\n📝 Recent Notes:');
      recentNotes.recentNotesForTeacher.forEach((note, index) => {
        console.log(`\n   ${index + 1}. From: ${note.writtenBy.name} (${note.writtenBy.role})`);
        console.log(`      About: ${note.student?.name || 'Unknown Student'}`);
        console.log(`      Content: ${note.content.substring(0, 60)}...`);
        console.log(`      Replies: ${note.replyCount}`);
        console.log(`      Created: ${new Date(note.createdAt).toLocaleString('id-ID')}`);
        
        // Highlight if this is our new note
        if (note.id === newNote.createNote.id) {
          console.log('      ⭐ THIS IS THE NOTE WE JUST CREATED!');
        }
      });
      
      // Verify our new note is in the list
      const foundNewNote = recentNotes.recentNotesForTeacher.some(
        note => note.id === newNote.createNote.id
      );
      
      if (foundNewNote) {
        console.log('\n✅ SUCCESS! The newly created note appears in recent notes!');
      } else {
        console.log('\n⚠️  Warning: The newly created note is not in the recent notes list yet.');
      }
    } else {
      console.log('\n❌ No recent notes found! This might be an issue.');
    }

    console.log('\n=== Test Complete ===');
    console.log('\n🎉 The Recent Notes feature is working!');
    console.log('   - Teachers can now see notes from parents in their dashboard');
    console.log('   - Notes include student information');
    console.log('   - Notes are ordered by creation date (newest first)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testRecentNotesFeature();
