import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { hashPassword } from '@/lib/auth';

async function manageAdmin() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const targetEmail = args[1]?.toLowerCase()?.trim();

  if (!command || !['promote', 'demote', 'create', 'list'].includes(command)) {
    console.log(`
======================================================
  DEMONSTORE ADMIN MANAGEMENT CLI TOOL
======================================================
Usage:
  npx tsx src/scripts/manage-admin.ts <command> [arguments]

Commands:
  promote <email>         Promote an existing user to admin
  demote <email>          Demote an admin to user
  create <email> <name> <password>
                          Create a new administrator account directly
  list                    List all existing administrators
======================================================
`);
    process.exit(0);
  }

  const mongoose = await connectToDatabase();
  console.log(`✓ Connected to MongoDB database: "${mongoose.connection.name}"\n`);

  if (command === 'list') {
    const admins = await UserModel.find({ role: 'admin' }, { passwordHash: 0 }).lean();
    console.log(`Found ${admins.length} administrator(s):`);
    admins.forEach((admin, i) => {
      console.log(`  ${i + 1}. [${admin.status}] ${admin.name} (${admin.email}) - ID: ${admin._id}`);
    });
  } else if (command === 'promote') {
    if (!targetEmail) {
      console.error('❌ Error: Please provide the email address of the user to promote.');
      process.exit(1);
    }
    const user = await UserModel.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ Error: User with email "${targetEmail}" was not found.`);
      process.exit(1);
    }
    user.role = 'admin';
    user.status = 'active';
    await user.save();
    console.log(`✓ Successfully promoted "${user.name}" (${user.email}) to role: "admin"`);
  } else if (command === 'demote') {
    if (!targetEmail) {
      console.error('❌ Error: Please provide the email address of the user to demote.');
      process.exit(1);
    }
    const activeAdminCount = await UserModel.countDocuments({
      role: 'admin',
      status: 'active',
    });
    const user = await UserModel.findOne({ email: targetEmail });
    if (!user) {
      console.error(`❌ Error: User with email "${targetEmail}" was not found.`);
      process.exit(1);
    }
    if (user.role === 'admin' && activeAdminCount <= 1) {
      console.error('❌ Error: Cannot demote the last remaining active administrator.');
      process.exit(1);
    }
    user.role = 'user';
    await user.save();
    console.log(`✓ Successfully demoted "${user.name}" (${user.email}) to role: "user"`);
  } else if (command === 'create') {
    const name = args[2]?.trim();
    const password = args[3]?.trim();
    if (!targetEmail || !name || !password) {
      console.error('❌ Error: Usage: npx tsx src/scripts/manage-admin.ts create <email> <name> <password>');
      process.exit(1);
    }

    const existing = await UserModel.findOne({ email: targetEmail });
    const passwordHash = await hashPassword(password);
    if (existing) {
      existing.role = 'admin';
      existing.status = 'active';
      existing.passwordHash = passwordHash;
      if (name) existing.name = name;
      await existing.save();
      console.log(`✓ Administrator "${targetEmail}" updated with new password and role: "admin".`);
    } else {
      const newAdmin = await UserModel.create({
        name,
        email: targetEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
        lastSeen: new Date(),
      });
      console.log(`✓ Created new administrator account: "${newAdmin.name}" (${newAdmin.email})`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✓ MongoDB disconnected.');
}

manageAdmin().catch((err) => {
  console.error('❌ Error executing admin CLI tool:', err);
  process.exit(1);
});
