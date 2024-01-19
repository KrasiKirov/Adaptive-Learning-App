const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'Questions',
    options: {
        trustedConnection: true
    }
}

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log("Connected to the database.");
    } catch (err) {
        console.error("Could not connect to the database:", err);
    }
}

connectToDatabase();

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("Username received:", username);
    console.log(password)

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const result = await sql.query`SELECT Username, Password, Score FROM Users WHERE Username = ${username}`;
        if (!result.recordset.length) {
            return res.status(401).send('Invalid username or password');
        }

        const user = result.recordset[0];
        console.log(user.Password)
        const validPassword = (password == user.Password);

        if (!validPassword) {
            return res.status(401).send('Invalid username or password');
        }

        res.json({ name: user.Name, username: user.Username, elo: user.Score });
    } catch (err) {
        console.error('Database query error: ', err);
        res.status(500).send('Internal Server Error');
    }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).send('Name, username, and password are required');
    }

    try {
        // Check if the user already exists
        const userCheck = await sql.query`SELECT Username FROM Users WHERE Username = ${username}`;
        if (userCheck.recordset.length > 0) {
            return res.status(400).send('User already exists');
        }

        // Insert the new user into the database
        await sql.query`INSERT INTO Users (Name, Username, Password) VALUES (${name}, ${username}, ${password})`;

        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error during user registration:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to fetch questions
app.get('/question2', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Calculus`;
        
        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('No questions found');
        }
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).send('Internal Server Error');
    }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});