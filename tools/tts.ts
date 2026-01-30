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
  //  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-tts:predict?key=${API_KEY}`;
//    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-tts:predict`;

//  const URL = `https://texttospeech.googleapis.com/v1beta1/text:synthesize`;
//  const URL = "https://generativelanguage.googleapis.com"
  const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent";

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
  /*
  const payload = {
  text: "ໃສ ໃຜ",
  model: "models/gemini-2.5-flash-tts",
  voice_config: {
    prebuilt_voice_config: {
      voice_name: "Charon"
    }
  }
};
*/
  /*
  const payload = {
    // The standard Cloud TTS schema
    input: {
      text: "ໃສ ໃຜ"
    },
    voice: {
      languageCode: "lo-LA",
      name: "lo-LA-Wavenet-A" // Swapping to a standard Lao voice to verify connection
    },
    audioConfig: {
      audioEncoding: "MP3"
    }
  };
  */
  /*
    const payload = {
    model: "models/gemini-2.5-flash-tts",
    content: {
      text: "ໃສ ໃຜ"
    },
    voice_config: {
      prebuilt_voice_config: {
        voice_name: "Charon"
      }
    }
  };
  */
  /*
    const payload = {
    model: "models/gemini-2.5-flash-tts",
    // This is the specific structure for the beta TTS endpoint
    content: {
      parts: [{ text: "ໃສ ໃຜ" }]
    },
    voiceConfig: { // CamelCase is often preferred over snake_case in beta
      prebuiltVoiceConfig: {
        voiceName: "Charon"
      }
    }
  };
  */
/*
  const payload = {
    audioConfig: {
      audioEncoding: "LINEAR16",
      pitch: 0,
      speakingRate: 1,
    },
    input: {
      prompt: "Read aloud in a warm, welcoming tone.",
      text: "ໃສ ໃຜ",
    },
    voice: {
      languageCode: "lo-la",
      modelName: "gemini-2.5-flash-tts",
      name: "Orus",
    },
  };
  */

  /*
  const payload =
  {
  "input": {
    "text": "Hello world"
  },
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Wavenet-D"
  },
  "audioConfig": {
    "audioEncoding": "MP3"
  }
}
*/

const payload = {
  "contents": [{
    "parts": [{
      "text": "Say 'Hello world' clearly and naturally."
    }]
  }],
  "generation_config": {
    "response_mime_type": "audio/mp3",
    "speech_config": {
      "voice_config": {
        "prebuilt_voice_config": {
          "voice_name": "Puck" // Options include Puck, Charon, Kore, etc.
        }
      }
    }
  }
};

  console.log("Requesting TTS from Gemini...");

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });
  const text = (await response.text()) as any;
  console.log(text.substring(0,1000))
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
