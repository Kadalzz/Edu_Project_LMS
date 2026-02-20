const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function checkSubmissionStatus() {
  try {
    console.log('🔍 Checking submission status for Andi Pratama...\n');
    
    // Get Andi's submission
    const submission = await prisma.submission.findFirst({
      where: {
        student: {
          user: {
            email: 'siswa1@lms-abk.com'
          }
        }
      },
      include: {
        assignment: {
          select: {
            title: true
          }
        },
        student: {
          include: {
            user: {
              select: {
                email: true,
                studentName: true
              }
            }
          }
        }
      }
    });

    if (submission) {
      console.log('📋 Submission Details:');
      console.log(`   Student: ${submission.student.user.studentName}`);
      console.log(`   Assignment: ${submission.assignment.title}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Score: ${submission.score || 'Not graded'}`);
      console.log(`   Submitted At: ${submission.submittedAt || 'Not submitted yet'}`);
      console.log(`   Created At: ${submission.createdAt}`);
      console.log(`   Updated At: ${submission.updatedAt}`);
      console.log(`\n   Submission ID: ${submission.id}`);
      console.log(`   Assignment ID: ${submission.assignmentId}`);
      console.log(`   Student ID: ${submission.studentId}`);
    } else {
      console.log('❌ No submission found');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSubmissionStatus();
