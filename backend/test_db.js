const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const test = async () => {
    try {
        await mongoose.connect('mongodb://root:possible@localhost:27019/clinic?authSource=admin');
        console.log('Connected to DB');
        const user = await User.findOne({ email: 'patient@clinic.com' }).select('+password');
        if (!user) {
            console.log('User not found!');
            process.exit(1);
        }
        console.log('User found:', user.email);
        console.log('Hashed password:', user.password);
        const match = await bcrypt.compare('password123', user.password);
        console.log('Does password123 match?', match);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

test();
