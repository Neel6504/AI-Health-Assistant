import mongoose from 'mongoose';
import Hospital from './models/Hospital.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAtlasData() {
  try {
    console.log('🔍 Checking Atlas database...\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Atlas\n');

    const hospitals = await Hospital.find({}).select('-password');
    
    console.log(`📊 Total hospitals in Atlas: ${hospitals.length}\n`);
    console.log('='.repeat(60));
    
    hospitals.forEach((hospital, index) => {
      console.log(`\n🏥 Hospital ${index + 1}:`);
      console.log(`   Name: ${hospital.hospitalName}`);
      console.log(`   Email: ${hospital.email}`);
      console.log(`   Phone: ${hospital.phone}`);
      console.log(`   Location: ${hospital.city}, ${hospital.state}`);
      console.log(`   Type: ${hospital.hospitalType}`);
      console.log(`   Beds: ${hospital.totalBeds}`);
      console.log(`   Emergency: ${hospital.emergencyAvailable ? '✅' : '❌'}`);
      console.log(`   Created: ${hospital.createdAt}`);
    });
    
    console.log('\n' + '='.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAtlasData();
