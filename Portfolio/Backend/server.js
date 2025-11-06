const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../')); // Serve static files from the parent directory

// Create transporter for Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test email configuration
transporter.verify((error) => {
    if (error) {
        console.error('Error with email configuration:', error);
    } else {
        console.log('Server is ready to send emails');
    }
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    if (token !== process.env.ADMIN_TOKEN) {
        console.log('Token received:', token); // For debugging
        console.log('Expected token:', process.env.ADMIN_TOKEN); // For debugging
        return res.status(403).json({ error: 'Invalid credentials' });
    }
    
    next();
};

// Database connection
const db = new sqlite3.Database(path.join(__dirname, 'contacts.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create contacts table if it doesn't exist
const createTable = `CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    mobileNumber TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

db.run(createTable, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Contacts table created successfully');
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { fullName, email, mobileNumber, subject, message } = req.body;

    // Basic validation
    if (!fullName || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    try {
        // Save to database first
        const stmt = db.prepare('INSERT INTO contacts (fullName, email, mobileNumber, subject, message) VALUES (?, ?, ?, ?, ?)');
        await new Promise((resolve, reject) => {
            stmt.run([fullName, email, mobileNumber, subject, message], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });

        // Send email
        const mailOptions = {
            from: `"${fullName}" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            replyTo: email,
            subject: `New Contact: ${subject || 'No Subject'}`,
            text: `
                You have a new contact form submission:
                
                Name: ${fullName}
                Email: ${email}
                Phone: ${mobileNumber || 'Not provided'}
                
                Message:
                ${message}
            `,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${mobileNumber || 'Not provided'}</p>
                <h3>Message:</h3>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        
        // Send success response
        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process your message. Please try again later.'
        });
    }
});

// Protected admin routes
app.get('/api/contacts', authMiddleware, (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            res.status(500).json({ error: 'Failed to fetch contacts' });
        } else {
            res.json(rows);
        }
    });
});

// Serve admin.html only to authenticated users
app.get('/admin.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('NODE_ENV:', process.env.NODE_ENV);
});
