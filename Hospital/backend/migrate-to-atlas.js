import mongoose from 'mongoose';
import Hospital from './models/Hospital.js';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/hospital-db';
const ATLAS_URI = process.env.MONGODB_URI;

async function migrateData() {
  try {
    console.log('🔄 Starting migration from local to Atlas...\n');

    // Connect to local database
    console.log('📥 Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB\n');

    // Get local Hospital model
    const LocalHospital = localConn.model('Hospital', Hospital.schema);

    // Fetch all hospitals from local
    const hospitals = await LocalHospital.find({});
    console.log(`📊 Found ${hospitals.length} hospitals in local database\n`);

    if (hospitals.length === 0) {
      console.log('⚠️  No data to migrate. Exiting...');
      await localConn.close();
      process.exit(0);
    }

    // Connect to Atlas
    console.log('📤 Connecting to Atlas...');
    await mongoose.connect(ATLAS_URI);
    console.log('✅ Connected to Atlas\n');

    // Check if data already exists in Atlas
    const existingCount = await Hospital.countDocuments({});
    console.log(`📊 Current hospitals in Atlas: ${existingCount}`);

    // Migrate each hospital
    console.log('\n🚀 Starting migration...\n');
    let successCount = 0;
    let skipCount = 0;

    for (const hospital of hospitals) {
      try {
        // Check if hospital already exists in Atlas
        const exists = await Hospital.findOne({
          $or: [
            { email: hospital.email },
            { registrationNumber: hospital.registrationNumber }
          ]
        });

        if (exists) {
          console.log(`⏭️  Skipped: ${hospital.hospitalName} (already exists)`);
          skipCount++;
          continue;
        }

        // Create new hospital in Atlas
        const hospitalData = hospital.toObject();
        delete hospitalData._id; // Let MongoDB generate new _id
        
        // Create hospital document (password is already hashed)
        const newHospital = new Hospital(hospitalData);
        await newHospital.save({ validateBeforeSave: false }); // Skip validation since password is already hashed
        
        console.log(`✅ Migrated: ${hospital.hospitalName}`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${hospital.hospitalName} - ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`📦 Total in Atlas now: ${await Hospital.countDocuments({})}`);
    console.log('='.repeat(50) + '\n');

    // Close connections
    await localConn.close();
    await mongoose.connection.close();
    
    console.log('✨ Migration complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateData();
