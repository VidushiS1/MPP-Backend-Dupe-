require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

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



// const { google } = require('googleapis');
// const { OAuth2Client } = require('google-auth-library');

// const CLIENT_ID = '817782746900-ma9vvu1fk8b643cgtslenao7i1uik3so.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:4000/';

// const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// // Generate the authentication URL
// const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/calendar.events'],
// });

// console.log('Authorize this app by visiting this URL:', authUrl);
// const readline = require('readline');

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// // console.log('rl', rl);
// // return false
// // let code = "4/0AfJohXn3i0bza14d3GC9AqN0NF2bJpJnzLQ8s4lEd3uzRq1ouj-MK4AWC4eb6PcPBs-LMw"

// rl.question('Enter the code from the authorization page here: ', (code) => {
//     rl.close();

//     oAuth2Client.getToken(code, (err, token) => {
//         if (err) return console.error('Error retrieving access token', err);
//         console.log('token', token)
//         // oAuth2Client.setCredentials(token);
//         oAuth2Client.setCredentials(
//             {
//                 access_token: token
//             }
//         );
//         // Continue with creating a Google Meet URL or scheduling an event
//     });
// });


// const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// calendar.events.insert({
//     calendarId: 'primary',
//     resource: {
//         summary: 'Meeting Title',
//         description: 'Meeting Description',
//         start: { dateTime: '2024-02-06T09:00:00', timeZone: 'asia/kolkata' },
//         end: { dateTime: '2024-02-06T10:00:00', timeZone: 'asia/kolkata' },
//         conferenceData: {
//             createRequest: {
//                 requestId: 'YOUR_UNIQUE_REQUEST_ID',
//             },
//         },
//     },
// }, (err, res) => {
//     if (err) return console.error('Error creating event:', err);

//     const meetingLink = res.data.hangoutLink;
//     console.log('Meeting Link:', meetingLink);
// });

const port = process.env.Port || 4000

app.listen(port, (req, res) => {
    console.log('MPP_Disha Server listing On Port', port);
});