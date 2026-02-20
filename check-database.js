const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function checkDatabase() {
  console.log('\n🔍 Checking Database for Assignments and Submissions\n');

  try {
    // Check students
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: { email: true }
        }
      }
    });
    console.log(`📚 Found ${students.length} students:`);
    students.forEach(s => {
      console.log(`   - ${s.name} (${s.user.email}) [ID: ${s.id}]`);
    });

    // Check assignments
    const assignments = await prisma.assignment.findMany({
      include: {
        lesson: {
          select: { title: true }
        }
      }
    });
    console.log(`\n📝 Found ${assignments.length} assignments:`);
    assignments.forEach(a => {
      console.log(`   - ${a.title} (${a.type}) [ID: ${a.id}]`);
      console.log(`     Lesson: ${a.lesson.title}`);
      console.log(`     Draft: ${a.isDraft}, Active: ${a.isActive}`);
    });

    // Check submissions
    const submissions = await prisma.submission.findMany({
      include: {
        student: {
          include: {
            user: {
              select: { studentName: true, email: true }
            }
          }
        },
        assignment: {
          select: { title: true }
        }
      }
    });
    console.log(`\n✅ Found ${submissions.length} submissions:`);
    if (submissions.length === 0) {
      console.log('   ⚠️  NO SUBMISSIONS FOUND! This is the problem!');
    } else {
      submissions.forEach(s => {
        console.log(`   - ${s.student.user.studentName} → ${s.assignment.title} (Status: ${s.status})`);
      });
    }

    // Check student_id for first student
    const firstStudent = students[0];
    if (firstStudent) {
      console.log(`\n🔎 Checking submissions for ${firstStudent.user.email}:`);
      const studentSubmissions = await prisma.submission.findMany({
        where: { studentId: firstStudent.id },
        include: {
          assignment: {
            select: { title: true, type: true }
          }
        }
      });
      console.log(`   Found ${studentSubmissions.length} submissions`);
      studentSubmissions.forEach(s => {
        console.log(`   - ${s.assignment.title} (${s.assignment.type}) - Status: ${s.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
