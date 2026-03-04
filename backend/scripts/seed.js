require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const connectDB = require('../config/db');

const seedUsers = [
    {
        name: 'Admin User',
        email: 'admin@clinic.com',
        password: 'password123',
        role: 'admin',
        phone: '+1234567890',
    },
    {
        name: 'Dr. John Doe',
        email: 'doctor@clinic.com',
        password: 'password123',
        role: 'doctor',
        phone: '+1234567891',
        specialization: 'General Medicine',
        licenseNumber: 'MED12345',
    },
    {
        name: 'Jane Receptionist',
        email: 'receptionist@clinic.com',
        password: 'password123',
        role: 'receptionist',
        phone: '+1234567892',
    },
    {
        name: 'Bob Patient',
        email: 'patient@clinic.com',
        password: 'password123',
        role: 'patient',
        phone: '+1234567893',
    },
];

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing users (optional - comment out if you want to keep existing users)
        // await User.deleteMany({});
        // await PatientProfile.deleteMany({});

        console.log('🌱 Seeding database with initial users...\n');

        for (const userData of seedUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`⏭️  User already exists: ${userData.email}`);
                continue;
            }

            const user = await User.create(userData);
            console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);

            // Create patient profile if role is patient
            if (userData.role === 'patient') {
                await PatientProfile.create({ userId: user._id });
                console.log(`   └─ Created patient profile for ${user.name}`);
            }
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📋 Test Credentials:');
        console.log('   Admin:        admin@clinic.com / password123');
        console.log('   Doctor:       doctor@clinic.com / password123');
        console.log('   Receptionist: receptionist@clinic.com / password123');
        console.log('   Patient:      patient@clinic.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
