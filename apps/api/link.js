const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Locating student 'Test Student Edited'...");
  const student = await prisma.student.findFirst({
    where: { firstName: "Test Student", lastName: "Edited" }
  });
  
  console.log("Locating parent 'Test Parent'...");
  const parent = await prisma.parent.findFirst({
    where: { fatherName: "Test Parent" }
  });
  
  if (!student || !parent) {
    console.error("Error: Could not find student or parent record!");
    console.error("Student found:", student);
    console.error("Parent found:", parent);
    process.exit(1);
  }
  
  console.log(`Linking Student ID ${student.id} to Parent ID ${parent.id}...`);
  
  const mapping = await prisma.studentParentMap.upsert({
    where: {
      studentId_parentId: {
        studentId: student.id,
        parentId: parent.id
      }
    },
    update: {},
    create: {
      studentId: student.id,
      parentId: parent.id,
      relationship: 'FATHER',
      isPrimary: true
    }
  });
  
  console.log("Prisma Link Succeeded:", mapping);
}

main()
  .catch(err => {
    console.error("Prisma error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
