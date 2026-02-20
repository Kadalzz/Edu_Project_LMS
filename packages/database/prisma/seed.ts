import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Teacher Account
  const teacher = await prisma.user.upsert({
    where: { email: 'guru@lms-abk.com' },
    update: {},
    create: {
      email: 'guru@lms-abk.com',
      passwordHash: await bcrypt.hash('Guru123!', 10),
      role: 'TEACHER',
      teacherName: 'Bu Ani Susanti',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Teacher created:', teacher.email);

  // Find or Create Classroom
  let classroom = await prisma.classroom.findFirst({
    where: { name: 'Kelas 1A' },
  });

  if (!classroom) {
    classroom = await prisma.classroom.create({
      data: {
        name: 'Kelas 1A',
        description: 'Kelas untuk anak dengan hambatan intelektual',
        isActive: true,
        teachers: {
          create: {
            teacherId: teacher.id,
          },
        },
      },
    });
    console.log('✅ Classroom created:', classroom.name);
  } else {
    console.log('✅ Classroom exists:', classroom.name);
  }

  // Create 4 Student-Parent Accounts
  const studentNames = [
    'Andi Pratama',
    'Budi Santoso',
    'Citra Dewi',
    'Deni Kurniawan',
  ];

  const parentNames = [
    'Ibu Susi',
    'Bapak Ahmad',
    'Ibu Rina',
    'Ibu Dewi',
  ];

  for (let i = 0; i < 4; i++) {
    const user = await prisma.user.upsert({
      where: { email: `siswa${i + 1}@lms-abk.com` },
      update: {},
      create: {
        email: `siswa${i + 1}@lms-abk.com`,
        passwordHash: await bcrypt.hash('Siswa123!', 10),
        role: 'STUDENT_PARENT',
        studentName: studentNames[i],
        parentName: parentNames[i],
        isActive: true,
        isVerified: true,
      },
    });

    // Find or Create student profile
    let student = await prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          userId: user.id,
          parentId: user.id, // Link parent to student profile
          level: 1,
          totalXP: 0,
          currentXP: 0,
        },
      });
    }

    // Find or Create enrollment in classroom
    const existingEnrollment = await prisma.classroomStudent.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId: student.id,
        },
      },
    });

    if (!existingEnrollment) {
      await prisma.classroomStudent.create({
        data: {
          classroomId: classroom.id,
          studentId: student.id,
          userId: user.id,
        },
      });
    }

    console.log(`✅ Student created: ${studentNames[i]} (${user.email})`);
  }

  // Find or Create Sample Subjects
  let lifeSkills = await prisma.subject.findFirst({
    where: { name: 'Life Skills', classroomId: classroom.id },
  });

  if (!lifeSkills) {
    lifeSkills = await prisma.subject.create({
      data: {
        name: 'Life Skills',
        description: 'Keterampilan hidup sehari-hari',
        icon: '🏠',
        color: '#10B981',
        order: 2,
        classroomId: classroom.id,
      },
    });
    console.log('✅ Subject created: Life Skills');
  } else {
    console.log('✅ Subject exists: Life Skills');
  }

  // Find or Create Sample Module
  let module = await prisma.module.findFirst({
    where: { name: 'Kegiatan Makan', subjectId: lifeSkills.id },
  });

  if (!module) {
    module = await prisma.module.create({
      data: {
        name: 'Kegiatan Makan',
        description: 'Belajar makan dengan benar',
        order: 1,
        subjectId: lifeSkills.id,
      },
    });
    console.log('✅ Module created:', module.name);
  } else {
    console.log('✅ Module exists:', module.name);
  }

  // Find or Create Sample Lesson
  let lesson = await prisma.lesson.findFirst({
    where: { title: 'Cara Makan yang Baik', moduleId: module.id },
  });

  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        title: 'Cara Makan yang Baik',
        content: 'Pelajaran tentang tata cara makan yang benar dan sopan',
        order: 1,
        moduleId: module.id,
        createdById: teacher.id,
        isDraft: false,
        isActive: true,
      },
    });
    console.log('✅ Lesson created:', lesson.title);
  } else {
    console.log('✅ Lesson exists:', lesson.title);
  }

  // Delete existing assignments for this lesson to avoid duplicates
  await prisma.assignment.deleteMany({
    where: { lessonId: lesson.id },
  });

  // Create Sample Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Latihan Makan Sendiri',
      description: 'Praktik makan menggunakan sendok dengan benar',
      type: 'TASK_ANALYSIS',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      xpReward: 50,
      isDraft: false,
      isActive: true,
      lessonId: lesson.id,
      createdById: teacher.id,
      taskSteps: {
        create: [
          { stepNumber: 1, instruction: 'Cuci tangan sebelum makan', isMandatory: true },
          { stepNumber: 2, instruction: 'Duduk dengan posisi yang benar', isMandatory: true },
          { stepNumber: 3, instruction: 'Pegang sendok dengan benar', isMandatory: true },
          { stepNumber: 4, instruction: 'Ambil makanan sedikit demi sedikit', isMandatory: true },
        ],
      },
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Kuis Tata Cara Makan',
      description: 'Kuis tentang etika makan yang baik',
      type: 'QUIZ',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      xpReward: 30,
      isDraft: false,
      isActive: true,
      lessonId: lesson.id,
      createdById: teacher.id,
      quizQuestions: {
        create: [
          {
            order: 1,
            question: 'Apa yang harus dilakukan sebelum makan?',
            options: {
              create: [
                { optionKey: 'A', text: 'Cuci tangan', isCorrect: true },
                { optionKey: 'B', text: 'Main handphone', isCorrect: false },
                { optionKey: 'C', text: 'Tidur', isCorrect: false },
              ],
            },
          },
          {
            order: 2,
            question: 'Bagaimana cara duduk yang baik saat makan?',
            options: {
              create: [
                { optionKey: 'A', text: 'Duduk sambil tiduran', isCorrect: false },
                { optionKey: 'B', text: 'Duduk dengan tegak', isCorrect: true },
                { optionKey: 'C', text: 'Berdiri', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Assignments created');

  // Get all students in the classroom
  const allStudents = await prisma.student.findMany({
    where: {
      classrooms: {
        some: {
          classroomId: classroom.id,
        },
      },
    },
  });

  // Create submissions for all students for both assignments
  for (const student of allStudents) {
    await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment1.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        assignmentId: assignment1.id,
        studentId: student.id,
        status: 'DRAFT',
      },
    });

    await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment2.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        assignmentId: assignment2.id,
        studentId: student.id,
        status: 'DRAFT',
      },
    });
  }

  console.log('✅ Submissions created for all students');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📝 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('GURU:');
  console.log('  Email: guru@lms-abk.com');
  console.log('  Password: Guru123!');
  console.log('');
  console.log('SISWA (4 accounts):');
  for (let i = 1; i <= 4; i++) {
    console.log(`  ${i}. Email: siswa${i}@lms-abk.com`);
    console.log(`     Password: Siswa123!`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
