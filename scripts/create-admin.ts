import { prisma } from "../db/prisma";
import { hashPassword } from "better-auth/crypto";
import { RoleName } from "@prisma/client";

async function main() {
  const email = process.argv[2] || "admin@example.com";
  const password = process.argv[3] || "Admin123456!";
  const name = process.argv[4] || "Admin User";

  const normalised = email.trim().toLowerCase();
  const hashedPassword = await hashPassword(password);

  // 1. Ensure SUPER_ADMIN and ADMIN roles exist
  const superAdminRole = await prisma.role.upsert({
    where: { name: RoleName.SUPER_ADMIN },
    update: {},
    create: {
      name: RoleName.SUPER_ADMIN,
      description: "Super Administrator with full access"
    }
  });

  // 2. Upsert user
  const user = await prisma.user.upsert({
    where: { email: normalised },
    update: {
      emailVerified: true
    },
    create: {
      name,
      email: normalised,
      emailVerified: true
    }
  });

  // 3. Upsert Better Auth credentials account
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: user.id
      }
    },
    update: {
      password: hashedPassword
    },
    create: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hashedPassword
    }
  });

  // 4. Assign SUPER_ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: superAdminRole.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: superAdminRole.id
    }
  });

  console.log(`\nAdmin account ready:`);
  console.log(`  Email:    ${normalised}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role:     SUPER_ADMIN\n`);
}

main()
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
