// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

// OpenAI configuration
const key = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: key });
// OpenAI API
const openai = new OpenAIApi(configuration);
const preprompt = 'I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown"';

// Express-based app
const app = express();

// Debug mode not to call OpenAI API
let debug = true;

// Csv file to save image history
const log = "log.csv";

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from 'htdocs' directory
app.use(express.static('htdocs'));

// Function to save data to a file
function saveToFile(filePath, q, a) {
    fs.appendFile(filePath, '"' + q + '","' + a + '"\n', (error) => {
        if (error) {
            console.error('Failed to save file:', error);
        } else {
           // console.log('File saved successfully.');
        }
    });
}

// POST route to retrieve question and generate response
app.post('/', (req, res) => {
    const { data: question } = req.body;
    let answer = 'Failed to generate a response';
    if (!debug) {
        // Make the API request to OpenAI
        const completion = openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": preprompt
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            temperature: 0.19,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }).then((completion) => {
            answer = completion.data.choices[0].message.content;
            res.json({ question, answer });
        }).catch((error) => {
            console.error('OpenAI API request failed:', error.config);
            res.json({ question, answer });
        });
    } else {
        answer = "Deactivate debug mode";
        setTimeout(function() {
            res.json({ question, answer });
          }, 1000);
    }
});

// Get route to send image history
app.get('/history', (req, res) => {
    const csvData = [];
    fs.createReadStream(log)
        .pipe(csv())
        .on('data', (row) => {
            csvData.push(row);
        })
        .on('end', () => {
            res.json(csvData);
        });
});

// POST route to retrieve image descriptions and generate response
app.post('/image', (req, res) => {
    const { data: question } = req.body;
    let answer = 'Failed to generate a response';
    if (!debug) {
        console.log("generating " + question)
        // Make the API request to OpenAI
        const completion = openai.createImage({
            prompt: question,
            n: 1,
            size: "256x256",
        }).then((completion) => {
            answer = completion.data.data[0].url;
            saveToFile(log, question, answer);
            res.json({ question, answer });
        }).catch((error) => {
            console.error('OpenAI API request failed:', error);
            res.json({ question, answer });
        });
    } else {
        answer = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
        setTimeout(function() {
            res.json({ question, answer });
          }, 1000);
    }
});

// post root to manage the debug button: React when it changes
app.post('/debug', (req, res) => {
    const { debug:ddebug } = req.body;
    debug = ddebug === true;
    console.log("Retrieved Debug="+debug);
    res.sendStatus(200); // Respond with a success status code
  });

// get root to manage the debug button : Initialize it
app.get('/debug', (req, res) => {
    // Send the current value of the debug variable as the response
    console.log("Send Debug="+debug);
    res.json({ debug });
    // You can also set other response headers if needed, e.g., 'Content-Type'
});

// Start the server
const hostname = '127.0.0.1';
const port = 8080;

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
