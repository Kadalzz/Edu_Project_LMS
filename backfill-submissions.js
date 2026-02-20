const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function backfillSubmissions() {
  console.log('\n🔧 Backfilling Submissions for Existing Assignments\n');

  try {
    // Get all assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        isActive: true,
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                subject: {
                  include: {
                    classroom: {
                      include: {
                        students: {
                          select: {
                            studentId: true,
student: {
                              select: {
                                userId: true,
                                user: {
                                  select: { studentName: true, email: true }
                                }
                              }
                            }
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`📝 Found ${assignments.length} active assignment(s)\n`);

    let totalCreated = 0;

    for (const assignment of assignments) {
      const classroom = assignment.lesson.module.subject.classroom;
      
      if (!classroom || classroom.students.length === 0) {
        console.log(`⚠️  Assignment "${assignment.title}" has no classroom or students`);
        continue;
      }

      console.log(`Processing: ${assignment.title}`);
      console.log(`  Classroom: ${classroom.name}`);
      console.log(`  Students: ${classroom.students.length}`);

      // Check existing submissions for this assignment
      const existingSubmissions = await prisma.submission.findMany({
        where: { assignmentId: assignment.id },
      });

      const existingStudentIds = new Set(existingSubmissions.map(s => s.studentId));
      
      // Create submissions for students who don't have one yet
      const studentsNeedingSubmissions = classroom.students.filter(
        cs => !existingStudentIds.has(cs.studentId)
      );

      if (studentsNeedingSubmissions.length === 0) {
        console.log(`  ✓ All students already have submissions\n`);
        continue;
      }

      const submissionData = studentsNeedingSubmissions.map((cs) => ({
        assignmentId: assignment.id,
        studentId: cs.studentId,
        status: 'DRAFT',
      }));

      await prisma.submission.createMany({
        data: submissionData,
        skipDuplicates: true,
      });

      console.log(`  ✅ Created ${submissionData.length} new submission(s)`);
      studentsNeedingSubmissions.forEach(cs => {
        console.log(`     - ${cs.student.user.studentName || cs.student.user.email}`);
      });
      console.log('');

      totalCreated += submissionData.length;
    }

    console.log(`\n🎉 Done! Created ${totalCreated} submission record(s)\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

backfillSubmissions();
