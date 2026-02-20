const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_0iTkjcsdhuV4@ep-soft-block-a1hhgzhl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function checkUserStatus() {
  console.log('\n🔍 Checking User Active Status\n');

  try {
    // Get all users with their active status
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        studentName: true,
        teacherName: true,
        isActive: true,
        isVerified: true,
      },
      orderBy: { email: 'asc' }
    });

    console.log(`📋 Found ${users.length} users:\n`);
    
    users.forEach(user => {
      const name = user.studentName || user.teacherName || 'N/A';
      const status = user.isActive ? '✅ Aktif' : '❌ Nonaktif';
      const verified = user.isVerified ? '✓ Verified' : '✗ Not Verified';
      console.log(`${name} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Status: ${status}`);
      console.log(`  Verified: ${verified}`);
      console.log('');
    });

    // Show inactive users
    const inactiveUsers = users.filter(u => !u.isActive);
    if (inactiveUsers.length > 0) {
      console.log(`\n⚠️  ${inactiveUsers.length} user(s) are INACTIVE\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
