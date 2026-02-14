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

  // Create Classroom
  const classroom = await prisma.classroom.create({
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
    const user = await prisma.user.create({
      data: {
        email: `siswa${i + 1}@lms-abk.com`,
        passwordHash: await bcrypt.hash('Siswa123!', 10),
        role: 'STUDENT_PARENT',
        studentName: studentNames[i],
        parentName: parentNames[i],
        isActive: true,
        isVerified: true,
      },
    });

    // Create student profile
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        level: 1,
        totalXP: 0,
        currentXP: 0,
      },
    });

    // Enroll in classroom
    await prisma.classroomStudent.create({
      data: {
        classroomId: classroom.id,
        studentId: student.id,
      },
    });

    console.log(`✅ Student created: ${studentNames[i]} (${user.email})`);
  }

  // Create Sample Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Matematika',
      description: 'Belajar angka dan berhitung',
      icon: '🔢',
      color: '#3B82F6',
      order: 1,
      classroomId: classroom.id,
    },
  });

  const lifeSkills = await prisma.subject.create({
    data: {
      name: 'Life Skills',
      description: 'Keterampilan hidup sehari-hari',
      icon: '🏠',
      color: '#10B981',
      order: 2,
      classroomId: classroom.id,
    },
  });

  console.log('✅ Subjects created');

  // Create Sample Module
  const module = await prisma.module.create({
    data: {
      name: 'Kegiatan Makan',
      description: 'Belajar makan dengan benar',
      order: 1,
      subjectId: lifeSkills.id,
    },
  });

  console.log('✅ Module created:', module.name);

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
