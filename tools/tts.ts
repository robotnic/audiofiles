import * as fs from "fs";
import * as path from "path";

// Fix for Zscaler / SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const API_KEY =
  process.env.GEMINI_API_KEY ||
  "APY0t3535kiTN9ToMaddDXGROwpguSorKjZk1nRDyBtl1Ns8O6Z9MprforQD2YKgcdgvPra1SSfgmk";
//const OUTPUT_DIR = path.join(__dirname, '../audio2');
const OUTPUT_DIR = path.join(process.cwd(), "audio2");

async function synthesize() {
  if (!API_KEY) throw new Error("Missing GEMINI_API_KEY");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

//  const URL = `https://generativelanguage.googleapis.com{API_KEY}`;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-tts:predict?key=${API_KEY}`;
/*
  const payload = {
    input: {
      text: "ໃສ ໃຜ",
      prompt: "Warm, clear, and welcoming tone",
    },
    voice: {
      languageCode: "lo-LA",
      name: "Charon",
    },
    audioConfig: {
      audioEncoding: "MP3",
    },
  };
  */
/*
    const payload = {
    instances: [
      {
        text: "ໃສ ໃຜ",
        // The Gemini TTS specific options go here
        voice_config: {
          voice_name: "Charon",
          language_code: "lo-LA"
        },
        // Optional: you can add the prompt here for tone
        prompt: "Warm and friendly"
      }
    ]
  };
  */
/*
  const payload = {
  contents: [
    {
      parts: [
        { text: "ໃສ ໃຜ" }
      ]
    }
  ],
  generationConfig: {
    response_mime_type: "audio/mp3",
  }
};
*/
/*
  const payload = {
    model: "models/gemini-2.5-flash-tts",
    input: {
      text: "ໃສ ໃຜ"
    },
    voice: {
      // Charon is the warm male voice for Lao
      name: "Charon" 
    }
  };
  */

  const payload = {
  text: "ໃສ ໃຜ",
  model: "models/gemini-2.5-flash-tts",
  voice_config: {
    prebuilt_voice_config: {
      voice_name: "Charon"
    }
  }
};

  console.log("Requesting TTS from Gemini...");

  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as any;

  if (data.audioContent) {
    const fileName = "lao_example.mp3";
    fs.writeFileSync(
      path.join(OUTPUT_DIR, fileName),
      Buffer.from(data.audioContent, "base64"),
    );
    console.log(`✅ Success: Saved ${fileName} to /audio`);
  } else {
    console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
    process.exit(1);
  }
}

synthesize();
