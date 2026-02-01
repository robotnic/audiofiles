
import * as fs from "fs";
import * as path from "path";

// Fix for Zscaler / SSL issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export class TTS {
  static API_KEY =
    process.env.GEMINI_API_KEY ||
    "APY0t3535kiTN9ToMaddDXGROwpguSorKjZk1nRDyBtl1Ns8O6Z9MprforQD2YKgcdgvPra1SSfgmk";
  static OUTPUT_DIR = path.join(process.cwd(), "audio2");

  static async synthesize(text: string, id: string, gender: string) {
    await new Promise((resolve) => setTimeout(resolve, 60000));

    if (!TTS.API_KEY) throw new Error("Missing GEMINI_API_KEY");
    if (!fs.existsSync(TTS.OUTPUT_DIR)) fs.mkdirSync(TTS.OUTPUT_DIR);

    let voice = "Puck";
    if (gender === "female") {
      voice = "Sulafat";
    }

    const URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent";

    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Please read the following Lao words clearly: " + text,
            },
          ],
        },
      ],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
      generation_config: {
        responseModalities: ["AUDIO"],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: voice,
            },
          },
        },
      },
    };

    console.log("Requesting TTS from Gemini...");

    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": TTS.API_KEY,
      },
      body: JSON.stringify(payload),
    });
    const dataSting = (await response.text()) as any;
    
    let data: any;
    try {
      data = JSON.parse(dataSting);
    } catch (error: any) {
      console.error("❌ Failed to parse JSON response:", error.message);
      console.log("Raw response:", dataSting.substring(0, 1000));
      throw error;
    }

    const audioBase64Data =
      data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (audioBase64Data) {
      const fileName = `${id}_${gender}.raw`;
      fs.writeFileSync(
        path.join(TTS.OUTPUT_DIR, fileName),
        Buffer.from(audioBase64Data, "base64"),
      );
      console.log(`✅ Success: Saved raw PCM data to /audio/${fileName}`);
      console.log(
        "NOTE: This is raw PCM data. You might need to add a WAV header to play it easily.",
      );
    } else if (data.error) {
      console.error("❌ API Error:", JSON.stringify(data.error, null, 2));
      process.exit(1);
    } else {
      console.error("❌ API Error: Did not find expected audio data path.");
    }
  }

  static async go() {
//    await TTS.synthesize("ໃສ", "sai_where_01", "female");
//    await TTS.synthesize("ໃສ", "sai_where_01", "male");
//    await TTS.synthesize("ໃຜ", "phai_01", "female");
//    await TTS.synthesize("ໃຜ", "phai_01", "male");
  }
}

//TTS.go();
