import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample route
app.get('/', (req, res) => {
    //res.send('Hello, World!');
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit', (req, res) => {
    const data = req.body;
    console.log('Received data:', data);
    res.send('Form submitted successfully!');
});

app.post('/generate-qr', async (req, res) => {
    const text = req.body.data || req.body.text || '';
    if (!text) return res.status(400).send('No data provided for QR code');
    QRCode.toDataURL(text, (err, url) => {
        if (err) {
            res.status(500).send('Error generating QR code');
        } else {
            res.send(`<!doctype html><html><head><meta charset=\"utf-8\"><title>QR Code</title></head><body><h1>QR Code</h1><img src="${url}" alt="QR Code"><p><a href="/">Back</a></p></body></html>`);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});
