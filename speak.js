
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const { exec, ExecException } = require('child_process');
const url = 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM'; 
const { createHash } = require('crypto'); // Node.js built-in crypto module for hashing
const NodeCache = require('node-cache'); // Install using: npm install node-cache
const cache = new NodeCache();
const writeFileAsync = util.promisify(fs.writeFile);
const path = require('path');

const headers = {
  Accept: 'audio/mpeg',
  'Content-Type': 'application/json',
  'xi-api-key': '329b106e9577bdaca4fe0a4de4219ef8', 
};

const data = {
  text: 'Hi! My name is Bella, nice to meet you!',
  model_id: 'eleven_multilingual_v1',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.5,
  },
};
async function playSpeech(text) {
  // Generate a hash based on the text to use as a cache key
  const textHash = createHash('md5').update(text).digest('hex');
  const cachedSpeech = cache.get(textHash);
  const fmp3 = path.join(__dirname, "htdocs", "uploads", textHash+'.mp3');
  try {
    if(cachedSpeech) {
      console.log('file '+fmp3+' exists');
    } else {
      data.text=text;
      const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
      await writeFileAsync(fmp3, response.data);
      cache.set(textHash, response.data, 3600);
      console.log('file '+fmp3+' generated');
    }
    // Play the audio using sox play
    exec('play -t mp3 '+fmp3, (error, stdout, stderr) => {
      if (error) {
        console.error('Error playing speech:', error.message);
      } else {
        console.log('Speech playback completed successfully');
      }
    })
    return "uploads/" + textHash+'.mp3';
    /*
    exec('play -t mp3 -', (error, stdout, stderr) => {
      if (error) {
        console.error('Error playing speech:', error.message);
      } else {
        console.log('Speech playback completed successfully');
      }
    }).stdin?.end(Buffer.from(response.data));
    */
  } catch (error) {
    console.error('Error generating speech:', error.message);
  }
}

async function generateSpeech(text) {
  try {
    data.text=text;
    const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
    await writeFileAsync('output.mp3', response.data);
    console.log('Speech playback generated successfully');
  } catch (error) {
    console.error('Error generating speech:', error.message);
  }
}
//playSpeech('hello everyone');

module.exports = { playSpeech }
