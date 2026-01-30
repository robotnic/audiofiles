import * as fs from 'fs';
import * as path from 'path';

// Fix for Zscaler / SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_KEY = process.env.GEMINI_API_KEY || 'APY0t3535kiTN9ToMaddDXGROwpguSorKjZk1nRDyBtl1Ns8O6Z9MprforQD2YKgcdgvPra1SSfgmk';
const OUTPUT_DIR = path.join(__dirname, '../audio2');

async function synthesize() {
  if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const URL = `https://generativelanguage.googleapis.com{API_KEY}`;

  const payload = {
    input: { 
      text: "ໃສ ໃຜ", 
      prompt: "Warm, clear, and welcoming tone" 
    },
    voice: { 
      languageCode: "lo-LA", 
      name: "Charon" 
    },
    audioConfig: { 
      audioEncoding: "MP3" 
    }
  };

  console.log("Requesting TTS from Gemini...");

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json() as any;

  if (data.audioContent) {
    const fileName = "lao_example.mp3";
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), Buffer.from(data.audioContent, 'base64'));
    console.log(`✅ Success: Saved ${fileName} to /audio`);
  } else {
    console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
    process.exit(1);
  }
}

synthesize();
