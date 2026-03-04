import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JSON_FILE_PATH = path.join(__dirname, 'formData.json');

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static HTML and JS files
app.use(express.static(__dirname));

app.post('/submit-form', (req, res) => {
    const newData = req.body;

    // 1. Read existing data from the file
    fs.readFile(JSON_FILE_PATH, 'utf8', (err, data) => {
        let jsonData = [];

        if (!err && data) {
            try {
                jsonData = JSON.parse(data);
            } catch (e) {
                console.error('Error parsing JSON:', e);
            }
        }

        // 2. Add the new data
        jsonData.push(newData);

        // 3. Write the updated data back to the file
        fs.writeFile(JSON_FILE_PATH, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ message: 'Failed to save data' });
            }
            res.status(200).json({ message: 'Data successfully saved to JSON file' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on [http://localhost:${PORT}](http://localhost:3000)`);
});
