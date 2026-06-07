import { PrismaClient, UserRole, TenantPlan, Gender, StudentStatus, TargetExam, BatchStudentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---- Create Tenant ----
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'the-prime-classes' },
    update: {},
    create: {
      name: 'The Prime Classes',
      slug: 'the-prime-classes',
      plan: TenantPlan.FREE,
      settings: {
        branding: {
          primaryColor: '#1a365d',
          secondaryColor: '#e53e3e',
          tagline: 'Building Future Military Leaders',
        },
        features: {
          omrUpload: true,
          smsNotifications: false,
          whatsappIntegration: false,
        },
      },
    },
  });

  console.log(`✅ Tenant created: ${tenant.name}`);

  // ---- Hash password ----
  const defaultPassword = await bcrypt.hash('Prime@2025', 12);

  // ---- Create Super Admin ----
  const superAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'superadmin@primeclasses.in' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'superadmin@primeclasses.in',
      phone: '9999999999',
      passwordHash: defaultPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin: superadmin@primeclasses.in`);

  // ---- Create Institute Admin ----
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@primeclasses.in' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@primeclasses.in',
      phone: '9888888888',
      passwordHash: defaultPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin: admin@primeclasses.in`);

  // ---- Create Faculty ----
  const facultyUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'faculty@primeclasses.in' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'faculty@primeclasses.in',
      phone: '9777777777',
      passwordHash: defaultPassword,
      role: UserRole.FACULTY,
      isActive: true,
    },
  });

  const faculty = await prisma.faculty.upsert({
    where: { tenantId_employeeId: { tenantId: tenant.id, employeeId: 'FAC-001' } },
    update: {},
    create: {
      userId: facultyUser.id,
      tenantId: tenant.id,
      employeeId: 'FAC-001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      specialization: ['Mathematics', 'Reasoning'],
      qualification: 'M.Sc Mathematics',
      joiningDate: new Date('2024-01-15'),
    },
  });

  console.log(`✅ Faculty: faculty@primeclasses.in (Rajesh Kumar)`);

  // ---- Create Accountant ----
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'accountant@primeclasses.in' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'accountant@primeclasses.in',
      phone: '9666666666',
      passwordHash: defaultPassword,
      role: UserRole.ACCOUNTANT,
      isActive: true,
    },
  });

  console.log(`✅ Accountant: accountant@primeclasses.in`);

  // ---- Create Subjects ----
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'MATH' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Mathematics', code: 'MATH', targetExam: [TargetExam.SAINIK, TargetExam.RMS, TargetExam.RIMC] },
    }),
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'ENG' } },
      update: {},
      create: { tenantId: tenant.id, name: 'English', code: 'ENG', targetExam: [TargetExam.SAINIK, TargetExam.RMS, TargetExam.RIMC] },
    }),
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'GK' } },
      update: {},
      create: { tenantId: tenant.id, name: 'General Knowledge', code: 'GK', targetExam: [TargetExam.SAINIK, TargetExam.RMS, TargetExam.RIMC] },
    }),
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'SCI' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Science', code: 'SCI', targetExam: [TargetExam.SAINIK, TargetExam.RMS] },
    }),
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'RSN' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Reasoning & Mental Ability', code: 'RSN', targetExam: [TargetExam.SAINIK, TargetExam.RMS, TargetExam.RIMC] },
    }),
    prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: 'SST' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Social Studies', code: 'SST', targetExam: [TargetExam.SAINIK] },
    }),
  ]);

  console.log(`✅ ${subjects.length} subjects created`);

  // ---- Create Batches ----
  const sainikBatch = await prisma.batch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'SSB-2025' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Sainik School Batch 2025-26',
      code: 'SSB-2025',
      targetExam: TargetExam.SAINIK,
      academicYear: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      maxStrength: 60,
      timing: { days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], startTime: '08:00', endTime: '14:00' },
      classTeacherId: faculty.id,
      isActive: true,
    },
  });

  const rmsBatch = await prisma.batch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'RMS-2025' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'RMS Batch 2025-26',
      code: 'RMS-2025',
      targetExam: TargetExam.RMS,
      academicYear: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      maxStrength: 40,
      timing: { days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], startTime: '14:30', endTime: '18:30' },
      isActive: true,
    },
  });

  const rimcBatch = await prisma.batch.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'RIMC-2025' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'RIMC Batch 2025-26',
      code: 'RIMC-2025',
      targetExam: TargetExam.RIMC,
      academicYear: '2025-26',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      maxStrength: 30,
      timing: { days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], startTime: '08:00', endTime: '12:00' },
      isActive: true,
    },
  });

  console.log(`✅ 3 batches created: Sainik, RMS, RIMC`);

  // ---- Create Sample Students + Parents ----
  const sampleStudents = [
    { firstName: 'Arjun', lastName: 'Sharma', parentName: 'Vikram Sharma' },
    { firstName: 'Priya', lastName: 'Singh', parentName: 'Mahendra Singh' },
    { firstName: 'Rahul', lastName: 'Verma', parentName: 'Suresh Verma' },
    { firstName: 'Ananya', lastName: 'Patel', parentName: 'Rajesh Patel' },
    { firstName: 'Karan', lastName: 'Gupta', parentName: 'Anil Gupta' },
  ];

  for (let i = 0; i < sampleStudents.length; i++) {
    const s = sampleStudents[i];
    const studentEmail = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@student.primeclasses.in`;
    const parentEmail = `${s.parentName.toLowerCase().replace(' ', '.')}@parent.primeclasses.in`;

    // Student user
    const studentUser = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: studentEmail } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: studentEmail,
        phone: `98${(10000000 + i).toString()}`,
        passwordHash: defaultPassword,
        role: UserRole.STUDENT,
        isActive: true,
      },
    });

    // Student profile
    const student = await prisma.student.upsert({
      where: { tenantId_rollNumber: { tenantId: tenant.id, rollNumber: `SSB/2025/${(i + 1).toString().padStart(3, '0')}` } },
      update: {},
      create: {
        userId: studentUser.id,
        tenantId: tenant.id,
        rollNumber: `SSB/2025/${(i + 1).toString().padStart(3, '0')}`,
        firstName: s.firstName,
        lastName: s.lastName,
        dob: new Date(`2013-${(i + 1).toString().padStart(2, '0')}-15`),
        gender: i === 1 || i === 3 ? Gender.FEMALE : Gender.MALE,
        schoolName: `Delhi Public School Branch ${i + 1}`,
        classStudying: '5',
        address: { street: `${100 + i} Main Road`, city: 'Jaipur', state: 'Rajasthan', pincode: `30200${i}` },
        admissionDate: new Date('2025-04-01'),
        status: StudentStatus.ACTIVE,
        targetExam: [TargetExam.SAINIK],
      },
    });

    // Enroll in Sainik batch
    await prisma.batchStudent.upsert({
      where: { batchId_studentId: { batchId: sainikBatch.id, studentId: student.id } },
      update: {},
      create: {
        batchId: sainikBatch.id,
        studentId: student.id,
        joinedAt: new Date('2025-04-01'),
        status: BatchStudentStatus.ACTIVE,
      },
    });

    // Parent user + profile
    const parentUser = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: parentEmail } },
      update: {},
      create: {
        tenantId: tenant.id,
        email: parentEmail,
        phone: `97${(10000000 + i).toString()}`,
        passwordHash: defaultPassword,
        role: UserRole.PARENT,
        isActive: true,
      },
    });

    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: {
        userId: parentUser.id,
        tenantId: tenant.id,
        fatherName: s.parentName,
        fatherPhone: `97${(10000000 + i).toString()}`,
        address: { street: `${100 + i} Main Road`, city: 'Jaipur', state: 'Rajasthan', pincode: `30200${i}` },
      },
    });

    // Map student to parent
    await prisma.studentParentMap.upsert({
      where: { studentId_parentId: { studentId: student.id, parentId: parent.id } },
      update: {},
      create: {
        studentId: student.id,
        parentId: parent.id,
        relationship: 'FATHER',
        isPrimary: true,
      },
    });
  }

  console.log(`✅ ${sampleStudents.length} students + parents created and enrolled`);

  // ---- Summary ----
  console.log('\n📊 Seed Summary:');
  console.log(`   Tenant: ${tenant.name}`);
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Students: ${await prisma.student.count()}`);
  console.log(`   Parents: ${await prisma.parent.count()}`);
  console.log(`   Faculty: ${await prisma.faculty.count()}`);
  console.log(`   Subjects: ${await prisma.subject.count()}`);
  console.log(`   Batches: ${await prisma.batch.count()}`);
  console.log('\n🔑 Default Credentials:');
  console.log('   All accounts: Password = Prime@2025');
  console.log('   Super Admin:  superadmin@primeclasses.in');
  console.log('   Admin:        admin@primeclasses.in');
  console.log('   Faculty:      faculty@primeclasses.in');
  console.log('   Accountant:   accountant@primeclasses.in');
  console.log('   Student:      arjun.sharma@student.primeclasses.in');
  console.log('   Parent:       vikram.sharma@parent.primeclasses.in');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Seeding complete!');
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
