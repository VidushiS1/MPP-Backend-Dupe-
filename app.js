require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/privacy-policy', (req, res) => {
    res.render('privacy_policy');
});

const mainRoute = require('./src/index');

app.use('/api', mainRoute);

// const translate = require('google-translate-api');
// const translate = require('translate-google');

// const sourceLang = 'en'; // English
// const targetLang = 'hi'; // Hindi

// const textToTranslate = 'How are you?';

// translate(textToTranslate, { from: sourceLang, to: targetLang })
//     .then((translation) => {
//         console.log(`Original text: ${textToTranslate}`);
//         console.log(`Translated text in Hindi: ${translation}`);
//     })
//     .catch((err) => {
//         console.error('Error during translation:', err);
//     });


// const { Translate } = require('@google-cloud/translate').v2;

// const projectId = 'mppdisha';
// const apiKey = 'AIzaSyCpl2lNLEagZBAzemjWs3_G2YNAfyTxMmE';

// const translate = new Translate({ projectId, key: apiKey });

// // Function to translate English text to Hindi
// async function translateText(text) {
//     try {
//         const [translation] = await translate.translate(text, 'hi');
//         console.log(`English: ${text}`);
//         console.log(`Hindi: ${translation}`);
//         return translation;
//     } catch (error) {
//         console.error('Error translating text:', error);
//         throw error;
//     }
// }

// // Example usage
// translateText('Hello, how are you?');




// const token = 'eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjQzZGNlMWUwLWM2MmYtNDk2Ni1iZDk1LThkMGY3NTJiZTRlMyJ9.eyJ2ZXIiOjksImF1aWQiOiI4ZjFlNDM0MjIyNmZlZDI2NjM2MjMxZjMzNTIxYTdiYSIsImNvZGUiOiJ5N094T0Z3djYzOXlKTEJjRzNGU3dtYWFBQTUtTk9pbXciLCJpc3MiOiJ6bTpjaWQ6WjdzOUdhQzNSRDJ5dlVmTmRBdHo1ZyIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJCdnZFbkdRZVFZeWVSb0Zmby0za1hnIiwibmJmIjoxNzA3NTQ0OTgzLCJleHAiOjE3MDc1NDg1ODMsImlhdCI6MTcwNzU0NDk4MywiYWlkIjoiMlJFNjBENXZUZi1mWVYyU2sybEctUSJ9.HKqk2-3b_UPGJV0BRMJnMZuxI8FY8b-w7Ht_jGOz2Re95tU1P1dQhJS2Wyi5dVxk8n88m6MaX5-hTcg2SB5DDQ'

// const ZOOM_API_URL = 'https://api.zoom.us/v2/users/me/meetings';

// async function fetchMeetings() {
//     try {
//         const response = await axios.get(ZOOM_API_URL, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching meetings:', error.response.data);
//         throw error;
//     }
// }

// // Example usage
// (async () => {
//     try {
//         const meetings = await fetchMeetings();
//         console.log('Meetings:', meetings);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// })();
console.log(new Date())

const port = process.env.Port || 4000
app.listen(port, (req, res) => {
    console.log('MPP_Disha Server listing On Port', port);
});