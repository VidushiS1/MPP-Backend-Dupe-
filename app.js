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

// // Replace 'YOUR_PROJECT_ID' and 'YOUR_API_KEY' with your project ID and API key
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





// Generate the authentication URL

// console.log('authUrl', authUrl);
// return false




// console.log('rl', rl);
// return false
// let code = "4/0AfJohXn3i0bza14d3GC9AqN0NF2bJpJnzLQ8s4lEd3uzRq1ouj-MK4AWC4eb6PcPBs-LMw"
// const { google } = require('googleapis');
// const { OAuth2Client } = require('google-auth-library');

// const CLIENT_ID = '817782746900-ma9vvu1fk8b643cgtslenao7i1uik3so.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:4000/';

// const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


// const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/calendar.events'],
// });
// console.log('Authorize this app by visiting this URL:', authUrl);




const axios = require('axios');

// Zoom API credentials
// const API_KEY = 'S1aesnp3TsGHsJHpVghzYA';
// const API_SECRET = 'HIMyf1uKQbC-zNBPLqMTXg';

const API_KEY = 'Z7s9GaC3RD2yvUfNdAtz5g';
const API_SECRET = 'mxIUDHRl4gWGvjJaxlFgSHXSwWCE67eo';

let url = "http://localhost:4000"
const { base64Encode } = require('base64-encode-decode');


// app.get('/', async (req, res) => {
//     const code = req.query.code;
//     try {
//         const response = await axios.post('https://zoom.us/oauth/token', {
//             params: {
//                 grant_type: 'authorization_code',
//                 code: code,
//                 redirect_uri: url,
//             },
//             headers: {
//                 'Authorization': `Basic ${base64Encode(`${API_KEY}:${API_SECRET}`)}`,
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             }
//         });
//         console.log('Token', response.data.access_token);
//         res.send(response.data);
//     } catch (error) {
//         console.log('Error fetching token:', error);
//         // res.status(error.response || 500).send(error.response);
//     }
// });


// const qs = require('qs'); // Import the qs library to handle URL-encoded form data

// app.get('/', async (req, res) => {
//     const code = req.query.code;
//     console.log('code', code)
//     try {
//         const requestBody = qs.stringify({
//             grant_type: 'authorization_code',
//             code: code,
//             redirect_uri: url,
//         });
//         console.log('requestBody', requestBody)

//         const response = await axios.post('https://zoom.us/oauth/token', requestBody, {
//             headers: {
//                 Authorization: `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`,
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             }
//         });

//         console.log('Token', response.data.access_token);
//         res.send(response.data.access_token);
//     } catch (error) {
//         console.log('Error fetching token:', error);
//         res.status(500).send('Error fetching token');
//     }
// });


// const token = 'eyJzdiI6IjAwMDAwMSIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6IjNiNTU0Y2E0LTU5ODQtNDM1Mi04OGJlLWE5N2RmNWNmZTU2MSJ9.eyJ2ZXIiOjksImF1aWQiOiI4ZjFlNDM0MjIyNmZlZDI2NjM2MjMxZjMzNTIxYTdiYSIsImNvZGUiOiJJdWpxZkFUaUNpU00tNmZiV3V6Unp5eW1UTFUybjhMSmciLCJpc3MiOiJ6bTpjaWQ6WjdzOUdhQzNSRDJ5dlVmTmRBdHo1ZyIsImdubyI6MCwidHlwZSI6MCwidGlkIjowLCJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJCdnZFbkdRZVFZeWVSb0Zmby0za1hnIiwibmJmIjoxNzA3NDg1OTY0LCJleHAiOjE3MDc0ODk1NjQsImlhdCI6MTcwNzQ4NTk2NCwiYWlkIjoiMlJFNjBENXZUZi1mWVYyU2sybEctUSJ9.1O-48AAKSFxgtmTi2p_uiAVOoiYiGlXWULVTc5HYh0p48CC3hT2MiUpTD3-7Rud1XoxtQ_FVYLs1plOurZP5Ig'

// const ZOOM_API_URL = 'https://api.zoom.us/v2/users/me/meetings';

// async function fetchMeetings() {
//     try {
//         const response = await axios.get(ZOOM_API_URL, {
//             headers: {
//                 'Authorization': `Bearer ${token}`, // Use the generated JWT token here
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

const port = process.env.Port || 4000
app.listen(port, (req, res) => {
    console.log('MPP_Disha Server listing On Port', port);
});