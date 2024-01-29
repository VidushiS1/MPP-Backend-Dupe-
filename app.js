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


const port = process.env.Port || 4000

app.listen(port, (req, res) => {
    console.log('MPP_Disha Server listing On Port', port);
});