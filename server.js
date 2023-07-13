// Import required modules
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const gpt = require("openai");
const fs = require('fs');
const path = require('path');
//const https = require('https');

// OpenAI configuration
const key = process.env.OPENAI_API_KEY;
const configuration = new gpt.Configuration({ apiKey: key });

// OpenAI API
const openai = new gpt.OpenAIApi(configuration);
const preprompt = 'I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown"';

// Express-based app
const app = express();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'htdocs/uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) ;
    }
  });

//const upload = multer({ dest: 'htdocs/uploads/' });
const upload = multer({ storage: storage });

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'htdocs' directory
app.use(express.static('htdocs'));

//server info
const hostname = '127.0.0.1';
const port = 8080;

// Debug mode not to call OpenAI API
let debug = true;

// Csv files to save history 
const logImageFile = "log.csv";
const logVariationFile = "vlog.csv";
const logQuestionFile = "qlog.csv";

// save base 64 data into a local png file
function saveToImage(fn, base64) {
    // remove spaces from name
    const localName = fn.replace(/\s+/g, '') + ".png";
    // build full name
    const fileName = path.join(__dirname, "htdocs", localName);
    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(fileName, buffer);
    return localName;
}

// Function to save key/value data to a csv file
function saveToFile(filePath,f, q, a) {
    if (!fs.existsSync(filePath)) {
        fs.appendFile(filePath, f, (error) => {
            if (error) {
                console.error('Failed to create file:', error);
            }
        });
    }
    fs.appendFile(filePath, '"' + q + '","' + a + '"\n', (error) => {
        if (error) {
            console.error('Failed to save file:', error);
        }
    });
}

// POST route to retrieve question and generate response
app.post('/', (req, res) => {
    const { data: question } = req.body;
//    const question = req.body.data;
    console.log(req.body);
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
            saveToFile(logQuestionFile, '"question","answer"\n', question, answer);
            res.json({ question, answer });
        }).catch((error) => {
            console.error('OpenAI API request failed:', error.config);
            res.json({ question, answer });
        });
    } else {
        answer = "No OPENAPI Call (debug mode)";
        // wait 1 sec to answer
        setTimeout(function () {
            console.log({ question, answer });
            res.json({ question, answer });
        }, 1000);
    }
});

// Get route to send question history
app.get('/history', (req, res) => {
    const csvData = [];
    fs.createReadStream(logQuestionFile)
        .pipe(csv())
        .on('data', (row) => {
            csvData.push(row);
        })
        .on('end', () => {
            res.json(csvData);
        });
});

// Get route to send image history
app.get('/imagehistory', (req, res) => {
    const csvData = [];
    fs.createReadStream(logImageFile)
        .pipe(csv())
        .on('data', (row) => {
            csvData.push(row);
        })
        .on('end', () => {
            res.json(csvData);
        });
});

// Get route to send variation history
app.get('/variationhistory', (req, res) => {
    const csvData = [];
    fs.createReadStream(logVariationFile)
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
    console.dir(req.body);
    const { data: question } = req.body;
    let answer = 'error.png';
    if (!debug) {
        console.log("generating " + question)
        // Make the API request to OpenAI
        const completion = openai.createImage({
            prompt: question,
            n: 1,
            size: req.body.size,
            response_format: "b64_json"
        }).then((completion) => {
            answer = completion.data.data[0].b64_json;
            const name = saveToImage(question, answer);
            saveToFile(logImageFile, '"description","url"\n', question, "uploads/"+name);
            answer = name;
            res.json({ question, answer });
        }).catch((error) => {
            console.error('OpenAI API request failed:', error);
            res.json({ question, answer });
        });
    } else {
        // debug mode - return random image
        answer = 'debug.png';
        // wait 1 sec to answer
        setTimeout(function () {
            res.json({ question, answer });
        }, 1000);
    }
});

// POST route to retrieve image descriptions and generate response
app.post('/variation',  upload.single('data'),(req, res) => {
    let answer = 'error.png';
    const question= "uploads/"+req.file.filename;
    
    console.log("uploaded "+question);
    if (!debug) {
        // Make the API request to OpenAI
        const completion = openai.createImageVariation(
            fs.createReadStream(path.join(__dirname,"htdocs",question)),
            1,
            req.body.size,
            "b64_json"
        ).then((completion) => {
            answer = completion.data.data[0].b64_json;
            const name = saveToImage(question, answer);
            saveToFile(logVariationFile, '"question","answer"\n', question, name);
            answer = name;
            res.json({ question, answer });
        }).catch((error) => {
            console.error('OpenAI API request failed:', error);
            res.json({ question, answer });
        });
    } else {
        // debug mode - return random image
        answer = 'debug.png';
        // wait 1 sec to answer
        setTimeout(function () {
            res.json({ question, answer });
        }, 1000);
    }
});
// post root to manage the debug button: React when it changes
app.post('/debug', (req, res) => {
    const { debug: ddebug } = req.body;
    debug = ddebug === true;
    res.sendStatus(200); // Respond with a success status code
});

// get root to manage the debug button : Send the current value of the debug variable
app.get('/debug', (req, res) => {
    res.json({ debug });
});


// Start the server
// for production app.set('env','production');

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
/* to start a https server
const options = {
    key: fs.readFileSync('client-key.pem'),
    cert: fs.readFileSync('client-cert.pem')
};
   
https.createServer(options, app).listen(port);*/