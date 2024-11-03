const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(express.json());

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// a. GET /hello/amjad
app.get('/hello/amjad', (req, res) => {
    res.status(200).send('Hello, Amjad');
});

const fs = require('fs');
const path = require('path');

// b. POST /profiles
app.post('/profiles', (req, res) => {
    const profile = req.body;

    // c. Validate the received profile object
    const requiredFields = ['Name', 'Title', 'TargetedKeywords', 'Education', 'Certification', 'Contact'];
    const missingFields = requiredFields.filter(field => !(field in profile));

    // Respond with an error if any fields are missing
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // d. Save the JSON object in profiles.json
    const filePath = path.join(__dirname, 'data', 'profiles.json');

    // Read and append to existing profiles in profiles.json
    fs.readFile(filePath, 'utf8', (err, data) => {
        let profiles = [];
        if (!err && data) {
            profiles = JSON.parse(data); // parse existing profiles
        }
        profiles.push(profile); // add new profile

        // Write updated profiles back to profiles.json
        fs.writeFile(filePath, JSON.stringify(profiles, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to save profile.' });
            }
            res.status(201).json({ message: 'Profile saved successfully.' });
        });
    });
});

const csv = require('csv-parser');

// e. GET /profiles/csv
app.get('/profiles/csv', (req, res) => {
    const csvFilePath = path.join(__dirname, 'data', 'profiles.csv');
    const profiles = [];

    fs.access(csvFilePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: 'CSV file not found.' });
        }
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                profiles.push(row);
            })
            .on('end', () => {
                res.status(200).json(profiles);
            })
            .on('error', (error) => {
                res.status(500).json({ error: 'Error reading CSV file.' });
            });
    });
});
