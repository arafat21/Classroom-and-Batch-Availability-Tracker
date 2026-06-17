const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate request format
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            console.log('invalid email');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password (assuming passwords are hashed with bcrypt)
        let hashpassword = user.password_hash;
        //hashpassword = await bcrypt.hash(password, 10);
        const isValidPassword = await bcrypt.compare(password, hashpassword);
        if (!isValidPassword) {
            console.log('invalid password '+ hashpassword + ' vs ' + password );
            return res.status(401).json({ error: 'Invalid email or password  '});
            
        }
        //console.log('valid password '+ hashpassword + '  vs  ' + password );


        // Get role-specific data
        let roleData = null;
        if (user.role === 'teacher') {
             roleData = await Teacher.findByUserId(user.user_id);
        } else if (user.role === 'student') {
            roleData = await Student.findByUserId(user.user_id);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response
        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                name: roleData?.student_name || roleData?.teacher_name || null,
                ...roleData
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { login };