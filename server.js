const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const folderPath = path.join(__dirname, 'uploads');
const filePath = path.join(folderPath, 'users.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Client')));

function createFolderIfNotExists(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`Folder '${folder}' created.`);
    } else {
        console.log(`Folder '${folder}' already exists.`);
    }
}

function createFileIfNotExists(file) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([]));
        console.log(`File '${file}' created.`);
    } else {
        console.log(`File '${file}' already exists.`);
    }
}
// Route to serve HTML files without the .html extension
/*app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'LoginUser.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'RegisterUser.html'));
});
app.get('/todos', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'todosUser.html'));
});*/
app.post('/register', async (req, res) => {
    const { email, password, userName } = req.body;

    try {
        const users = JSON.parse(fs.readFileSync(filePath));
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }
    } catch (error) {
        console.error('Error checking existing user:', error);
        return res.status(500).send('Internal Server Error');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { email, password: hashedPassword, userName, todos: [] };
        const users = JSON.parse(fs.readFileSync(filePath));
        users.push(userData);
        fs.writeFileSync(filePath, JSON.stringify(users));
        res.sendStatus(200);
    } catch (error) {
        console.error('Error saving user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("79")
        const users = JSON.parse(fs.readFileSync(filePath));
        const user = users.find(user => user.email === email);

        if (!user) {
            return res.status(404).send('User not found.');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).send('Internal Server Error');
            }
            if (result) {
                const userData = {
                    email: user.email,
                    userName: user.userName
                };
                return res.json(userData);
            } else {
                return res.status(401).send('Invalid password.');
            }
        });
    } catch (error) {
        console.error('Error authenticating user:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/todos', (req, res) => {
    const userEmail = req.query.email;
    try {
        const users = JSON.parse(fs.readFileSync(filePath));
        const user = users.find(user => user.email === userEmail);
        if (!user) {
            return res.status(404).send('User not found.');
        }
        return res.json(user.todos || []);
    } catch (error) {
        console.error('Error fetching todo data:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.put('/todos/:email', (req, res) => {
    const userEmail = req.params.email;
    const todoArr = req.body;
    try {
        const users = JSON.parse(fs.readFileSync(filePath));
        const userIndex = users.findIndex(user => user.email === userEmail);
        if (userIndex === -1) {
            return res.status(404).send('User not found.');
        }
        users[userIndex].todos = todoArr;
        fs.writeFileSync(filePath, JSON.stringify(users));
        return res.sendStatus(200);
    } catch (error) {
        console.error('Error updating todo data:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    createFolderIfNotExists(folderPath);
    createFileIfNotExists(filePath);
});
