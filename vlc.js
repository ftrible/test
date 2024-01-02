
const express = require('express');
const app = express();
const Stream = require('node-rtsp-stream');

app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
// Serve static files from 'htdocs' directory
app.use(express.static('htdocs', {index: false}));

app.get('/', function (req, res) {
    console.log('home');
    res.sendFile(path.join(__dirname, 'htdocs', 'vlc.html'));
});

//server info
const hostname = '127.0.0.1';
const port = 8079;

app.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const fs = require('fs');
const path = require('path');
const filePath = path.join(process.env.HOME, 'Documents', 'free.m3u');

const M3U8Parser = require('m3u8-parser');
const parser = new M3U8Parser.Parser();

// post root to manage the debug button: React when it changes
app.get('/playlist', (req, res) => {
    console.log("playlist");
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file: ${err}`);
          res.sendStatus(300);
          return;
        }
        parser.push(data);
        parser.end();
        console.log(parser.manifest);
        res.json({ segments:parser.manifest.segments });
      });
});
var tstream = null;
app.post('/stream', async (req, res) => {
  const selectedUri = req.body.data;
  console.log("URI="+selectedUri);
  try {
    if (tstream != null ) {
      tstream.stop();
      tstream=null;
    }
    tstream = new Stream({
      name: 'name',
      streamUrl: selectedUri,
      wsPort: 9999,
      ffmpegOptions: { // options ffmpeg flags
        '-stats': '', // an option with no neccessary value uses a blank string
        '-r': 30 // options with required values specify the value after the key
      }
    })
      res.json({ message: 'OK' });
  } catch (error) {
      console.error('Error playing video:', error);
      res.status(500).json({ error: 'Error playing video' });
  }
});
