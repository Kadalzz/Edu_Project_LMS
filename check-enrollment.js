const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function checkEnrollment() {
  console.log('\n🔍 Checking Classroom Enrollment\n');

  try {
    // Get all classrooms with their students
    const classrooms = await prisma.classroom.findMany({
      include: {
        students: {
          include: {
            student: {
              include: {
                user: {
                  select: { studentName: true, email: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`📚 Found ${classrooms.length} classroom(s):\n`);

    classrooms.forEach(classroom => {
      console.log(`Classroom: ${classroom.name}`);
      console.log(`  Students enrolled: ${classroom.students.length}`);
      if (classroom.students.length > 0) {
        classroom.students.forEach(cs => {
          console.log(`    - ${cs.student.user.studentName || 'N/A'} (${cs.student.user.email})`);
        });
      } else {
        console.log(`    ⚠️  No students enrolled!`);
      }
      console.log('');
    });

    // Count total students
    const totalStudents = await prisma.student.count();
    console.log(`Total students in system: ${totalStudents}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollment();
