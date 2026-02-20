const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function checkVideoAssignment() {
  try {
    console.log('🔍 Checking assignment "video"...\n');
    
    const assignment = await prisma.assignment.findFirst({
      where: {
        title: {
          contains: 'video',
          mode: 'insensitive'
        }
      },
      include: {
        taskSteps: {
          orderBy: { stepNumber: 'asc' }
        },
        quizQuestions: {
          include: {
            options: {
              orderBy: { optionKey: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        lesson: {
          select: {
            title: true,
            module: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      console.log('❌ Assignment "video" tidak ditemukan');
      await prisma.$disconnect();
      return;
    }

    console.log('📋 Assignment Details:');
    console.log(`   ID: ${assignment.id}`);
    console.log(`   Title: ${assignment.title}`);
    console.log(`   Type: ${assignment.type}`);
    console.log(`   XP Reward: ${assignment.xpReward}`);
    console.log(`   Description: ${assignment.description || 'No description'}`);
    console.log(`   Lesson: ${assignment.lesson.title} (Module: ${assignment.lesson.module.name})`);
    console.log(`   Due Date: ${assignment.dueDate || 'No due date'}`);
    console.log(`   Created: ${assignment.createdAt}`);

    console.log(`\n📊 Content:`);
    
    if (assignment.type === 'TASK_ANALYSIS') {
      console.log(`   Task Steps: ${assignment.taskSteps.length}`);
      if (assignment.taskSteps.length === 0) {
        console.log('   ❌ NO STEPS FOUND - This is the problem!');
      } else {
        assignment.taskSteps.forEach((step, index) => {
          console.log(`\n   Step ${step.stepNumber}:`);
          console.log(`     Instruction: ${step.instruction}`);
          console.log(`     Mandatory: ${step.isMandatory}`);
          console.log(`     Reference Image: ${step.referenceImage || 'None'}`);
        });
      }
    } else if (assignment.type === 'QUIZ') {
      console.log(`   Quiz Questions: ${assignment.quizQuestions.length}`);
      if (assignment.quizQuestions.length === 0) {
        console.log('   ❌ NO QUESTIONS FOUND - This is the problem!');
      } else {
        assignment.quizQuestions.forEach((question, index) => {
          console.log(`\n   Question ${question.order}:`);
          console.log(`     Text: ${question.questionText}`);
          console.log(`     Correct Answer: ${question.correctAnswer}`);
          console.log(`     Options: ${question.options.length}`);
          question.options.forEach(opt => {
            console.log(`       ${opt.optionKey}. ${opt.optionText}`);
          });
        });
      }
    }

    // Check submissions
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: assignment.id
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                studentName: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📝 Submissions: ${submissions.length}`);
    submissions.forEach(sub => {
      console.log(`   - ${sub.student.user.studentName}: ${sub.status}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkVideoAssignment();
