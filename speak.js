
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const { exec, ExecException } = require('child_process');
const url = 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM'; 
const { createHash } = require('crypto'); // Node.js built-in crypto module for hashing
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
async function playSpeech(text,debug) {
  // Generate a hash based on the text to use as a cache key
  const textHash = createHash('md5').update(text).digest('hex');
  let localName=textHash+'.mp3';
  const fmp3 = path.join(__dirname, "htdocs", "uploads", localName);
  const cachedSpeech = fs.existsSync(fmp3);
  try {
    if(cachedSpeech) {
      console.log('File '+fmp3+' exists');
    } else if (!debug){
      data.text=text;
      const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
      await writeFileAsync(fmp3, response.data);
      console.log('File '+fmp3+' Generated');
    } else {
      localName = "unknown.mp3";
    }
    return "uploads/" + localName;
  } catch (error) {
    console.error('Error generating speech:', error.message);
  }
}

module.exports = { playSpeech }