// // scripts/adminSeeder.ts
// import mongoose from 'mongoose';
// import config from '../src/app/config';
// import dotenv from 'dotenv';
// import { Admin } from '../src/app/modules/Dashboard/admin/admin.model'; // admin model import

// dotenv.config();

// const seedAdmin = async () => {
//   try {
//     await mongoose.connect(config.database_url as string);

//     const email = 'admin@gmail.com';
//     const existing = await Admin.findOne({ email });
//     if (existing) {
//       console.log('⚠️ Admin already exists');
//     } else {
//       await Admin.create({
//         fullName: 'Alamin',
//         email,
//         password: 'admin123', // pre-save hook e hash hobe
//         phoneNumber: '01824040194',
//         role: 'admin',
//       });
//       console.log('✅ Admin seeded successfully');
//     }

//     await mongoose.disconnect();
//   } catch (err) {
//     console.error('❌ Error seeding admin:', err);
//   }
// };

// seedAdmin();
// scripts/adminSeeder.ts
import mongoose from 'mongoose';
import config from '../src/app/config';
import dotenv from 'dotenv';
import { Admin } from '../src/app/modules/Dashboard/admin/admin.model';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.database_url as string);

    const email = 'admin@gmail.com';
    const existing = await Admin.findOne({ email });

    if (existing) {
      let updated = false;

      if (!existing.phoneNumber || existing.phoneNumber !== '01824040194') {
        existing.phoneNumber = '01824040194';
        updated = true;
      }

      if (!existing.fullName || existing.fullName !== 'Alamin') {
        existing.fullName = 'Alamin';
        updated = true;
      }

      if (updated) {
        await existing.save();
        console.log('✅ Admin updated with missing fields');
      } else {
        console.log('⚠️ Admin already exists and is up to date');
      }
    } else {
      await Admin.create({
        fullName: 'Alamin',
        email,
        password: 'admin123', // pre-save hook will hash this
        phoneNumber: '01824040194',
        role: 'admin',
      });
      console.log('✅ Admin seeded successfully');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  }
};

seedAdmin();
