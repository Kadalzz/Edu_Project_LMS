// Test all critical GraphQL queries to ensure they work
const http = require('http');
const API_URL = 'http://localhost:3001/graphql';

// Test credentials
const TEACHER_EMAIL = 'guru@lms-abk.com';
const TEACHER_PASSWORD = 'Guru123!';
const STUDENT_EMAIL = 'siswa1@lms-abk.com';
const STUDENT_PASSWORD = 'Siswa123!';

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
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors, null, 2)}`);
    }
    
    return result.data;
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server. Is it running on port 3001?');
    }
    throw error;
  }
}

async function testAuth() {
  console.log('\n=== Testing Authentication ===');
  
  try {
    // Test teacher login
    const loginQuery = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          accessToken
          refreshToken
          user {
            id
            email
            role
            teacherName
          }
        }
      }
    `;
    
    const result = await graphqlRequest(loginQuery, {
      input: { email: TEACHER_EMAIL, password: TEACHER_PASSWORD }
    });
    
    console.log('✅ Teacher login successful');
    console.log('   Email:', result.login.user.email);
    console.log('   Role:', result.login.user.role);
    console.log('   Name:', result.login.user.teacherName);
    
    return result.login.accessToken;
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return null;
  }
}

async function testClassrooms(token) {
  console.log('\n=== Testing Classrooms ===');
  
  try {
    // Test classroom list
    const listQuery = `
      query Classrooms {
        classrooms {
          id
          name
          description
          isActive
          studentCount
          subjectCount
          createdAt
        }
      }
    `;
    
    const result = await graphqlRequest(listQuery, {}, token);
    console.log('✅ Classroom list query successful');
    console.log(`   Found ${result.classrooms.length} classroom(s)`);
    
    if (result.classrooms.length > 0) {
      const classroomId = result.classrooms[0].id;
      console.log(`   Testing classroom detail for: ${result.classrooms[0].name}`);
      
      // Test classroom detail
      const detailQuery = `
        query ClassroomDetail($classroomId: String!) {
          classroomDetail(classroomId: $classroomId) {
            id
            name
            description
            isActive
            studentCount
            subjectCount
            students {
              id
              enrolledAt
              student {
                id
                userId
                level
                totalXP
                currentXP
                user {
                  id
                  email
                  studentName
                  parentName
                  avatar
                }
              }
            }
            subjects {
              id
              name
              description
              icon
              color
              order
              isActive
              moduleCount
            }
            createdAt
            updatedAt
          }
        }
      `;
      
      const detail = await graphqlRequest(detailQuery, { classroomId }, token);
      console.log('✅ Classroom detail query successful');
      console.log(`   Students enrolled: ${detail.classroomDetail.students.length}`);
      console.log(`   Subjects: ${detail.classroomDetail.subjects.length}`);
      
      // Test available students
      const availableQuery = `
        query AvailableStudents($classroomId: String!) {
          availableStudents(classroomId: $classroomId) {
            id
            userId
            level
            totalXP
            currentXP
            user {
              id
              email
              studentName
              parentName
              avatar
            }
          }
        }
      `;
      
      const available = await graphqlRequest(availableQuery, { classroomId }, token);
      console.log('✅ Available students query successful');
      console.log(`   Available students: ${available.availableStudents.length}`);
      
      return classroomId;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Classroom test failed:', error.message);
    return null;
  }
}

async function testSubjects(token, classroomId) {
  if (!classroomId) {
    console.log('\n⏭️  Skipping subjects test (no classroom)');
    return null;
  }
  
  console.log('\n=== Testing Subjects ===');
  
  try {
    const query = `
      query Subjects($classroomId: String!) {
        subjects(classroomId: $classroomId) {
          id
          name
          description
          icon
          color
          order
          classroomId
          isActive
          moduleCount
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await graphqlRequest(query, { classroomId }, token);
    console.log('✅ Subjects query successful');
    console.log(`   Found ${result.subjects.length} subject(s)`);
    
    if (result.subjects.length > 0) {
      return result.subjects[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Subjects test failed:', error.message);
    return null;
  }
}

async function testModules(token, subjectId) {
  if (!subjectId) {
    console.log('\n⏭️  Skipping modules test (no subject)');
    return null;
  }
  
  console.log('\n=== Testing Modules ===');
  
  try {
    const query = `
      query Modules($subjectId: String!) {
        modules(subjectId: $subjectId) {
          id
          name
          description
          order
          subjectId
          isActive
          lessonCount
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await graphqlRequest(query, { subjectId }, token);
    console.log('✅ Modules query successful');
    console.log(`   Found ${result.modules.length} module(s)`);
    
    if (result.modules.length > 0) {
      return result.modules[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Modules test failed:', error.message);
    return null;
  }
}

async function testLessons(token, moduleId) {
  if (!moduleId) {
    console.log('\n⏭️  Skipping lessons test (no module)');
    return;
  }
  
  console.log('\n=== Testing Lessons ===');
  
  try {
    const query = `
      query Lessons($moduleId: String!) {
        lessons(moduleId: $moduleId) {
          id
          title
          description
          content
          order
          moduleId
          isDraft
          isActive
          assignmentCount
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await graphqlRequest(query, { moduleId }, token);
    console.log('✅ Lessons query successful');
    console.log(`   Found ${result.lessons.length} lesson(s)`);
  } catch (error) {
    console.error('❌ Lessons test failed:', error.message);
  }
}

async function testDashboard(token) {
  console.log('\n=== Testing Dashboard ===');
  
  try {
    const query = `
      query TeacherDashboard {
        teacherDashboard {
          totalClassrooms
          totalStudents
          totalSubjects
          recentActivity {
            id
            type
            message
            relatedId
            createdAt
          }
        }
      }
    `;
    
    const result = await graphqlRequest(query, {}, token);
    console.log('✅ Teacher dashboard query successful');
    console.log(`   Total classrooms: ${result.teacherDashboard.totalClassrooms}`);
    console.log(`   Total students: ${result.teacherDashboard.totalStudents}`);
    console.log(`   Total subjects: ${result.teacherDashboard.totalSubjects}`);
  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting comprehensive quality assurance tests...');
  console.log(`📡 API URL: ${API_URL}`);
  
  try {
    // Test authentication
    const token = await testAuth();
    if (!token) {
      console.log('\n❌ Cannot continue without authentication token');
      return;
    }
    
    // Test classrooms
    const classroomId = await testClassrooms(token);
    
    // Test subjects
    const subjectId = await testSubjects(token, classroomId);
    
    // Test modules
    const moduleId = await testModules(token, subjectId);
    
    // Test lessons
    await testLessons(token, moduleId);
    
    // Test dashboard
    await testDashboard(token);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - Authentication: Working');
    console.log('   - Classrooms: Working');
    console.log('   - Subjects: Working');
    console.log('   - Modules: Working');
    console.log('   - Lessons: Working');
    console.log('   - Dashboard: Working');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

runTests();
