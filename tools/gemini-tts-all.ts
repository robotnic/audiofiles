import pkg from "@andresaya/edge-tts";
const { EdgeTTS, Constants } = pkg;
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TTS } from "./tts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "../knowledge_base.json");
const targetDir = process.argv[3] || "audio";
const AUDIO_DIR = path.join(__dirname, `../${targetDir}`);

// Microsoft Edge TTS Voice Names for Lao (lo-LA)
const voiceMap: Record<string, string> = {
  female: "lo-LA-KeomanyNeural",
  male: "lo-LA-ChanthavongNeural",
};

interface ProcessResult {
  success: boolean;
  size: number;
}

interface ProcessStats {
  created: number;
  skipped: number;
  failed: number;
}

interface KnowledgeBaseItem {
  id: string;
  lao?: string;
  character?: string;
  name_lao?: string;
}

interface KnowledgeBase {
  vocabulary?: KnowledgeBaseItem[];
  alphabet?: KnowledgeBaseItem[];
  phrases?: KnowledgeBaseItem[];
}

async function generateLaoAudio(
  text: string,
  id: string,
  gender: string,
): Promise<ProcessResult> {
  const voiceName = voiceMap[gender];
  const fileName = `${id}_${gender}.mp3`;
  const outputPath = path.join(AUDIO_DIR, fileName);

  try {
    const tts = new EdgeTTS();
    await tts.synthesize(text, voiceName, {
      outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
    });

    const buffer = await tts.toBuffer();
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);

    const stats = await fs.stat(outputPath);
    return { success: true, size: stats.size };
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, size: 0 };
  }
}

async function processItems(
  items: KnowledgeBaseItem[] | undefined,
  type: string,
): Promise<ProcessStats> {
  if (!items || items.length === 0) {
    console.log(`ℹ️  No ${type} found, skipping.\n`);
    return { created: 0, skipped: 0, failed: 0 };
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🎯 Generating TTS for ${type} (${items.length} items)`);
  console.log(`${"=".repeat(60)}\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    for (const gender of ["male", "female"]) {
      const fileName = `${item.id}_${gender}.mp3`;
      const filePath = path.join(AUDIO_DIR, fileName);

      try {
        await fs.stat(filePath);
        skipped++;
        continue;
      } catch {
        // File doesn't exist, proceed
      }

      // For alphabet, use name_lao; for others use lao or character
      let text = "";
      if (type === "ALPHABET") {
        text = item.name_lao || item.lao || "";
      } else {
        text = item.lao || item.character || "";
      }

      if (!text) {
        console.log(
          `⏭️  [${i + 1}/${items.length}] Skipped: ${item.id} (empty text)`,
        );
        skipped++;
        continue;
      }

      console.log(
        `🎤 [${i + 1}/${items.length}] ${gender.toUpperCase()}: ${item.id}`,
      );

      await TTS.synthesize(targetDir, text, item.id, gender);
      /*
      const result = await generateLaoAudio(text, item.id, gender);

      if (result.success) {
        console.log(`   ✅ Success (${result.size} bytes)`);
        created++;
      } else {
        failed++;
      }
*/
      // Rate limiting: 2-second delay between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n📊 ${type} Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}\n`);

  return { created, skipped, failed };
}

async function main(): Promise<void> {
  console.log("\n🚀 Starting comprehensive TTS generation\n");

  let kb: KnowledgeBase;
  try {
    const data = await fs.readFile(KB_PATH, "utf-8");
    kb = JSON.parse(data);
  } catch (error: any) {
    console.error(`❌ Failed to load knowledge base: ${error.message}`);
    process.exit(1);
  }

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Priority 3: Vocabulary
  const vocabStats = await processItems(kb.vocabulary, "VOCABULARY");
  totalCreated += vocabStats.created;
  totalSkipped += vocabStats.skipped;
  totalFailed += vocabStats.failed;

  // Priority 1: Alphabet
  const alphabetStats = await processItems(kb.alphabet, "ALPHABET");
  totalCreated += alphabetStats.created;
  totalSkipped += alphabetStats.skipped;
  totalFailed += alphabetStats.failed;

  // Priority 2: Phrases
  const phraseStats = await processItems(kb.phrases, "PHRASES");
  totalCreated += phraseStats.created;
  totalSkipped += phraseStats.skipped;
  totalFailed += phraseStats.failed;

  // Grand summary
  console.log(`${"=".repeat(60)}`);
  console.log(`📈 GRAND SUMMARY`);
  console.log(`${"=".repeat(60)}`);
  console.log(`   ✅ Total Created: ${totalCreated}`);
  console.log(`   ⏭️  Total Skipped: ${totalSkipped}`);
  console.log(`   ❌ Total Failed: ${totalFailed}`);
  console.log(`\n✨ Complete TTS generation finished!\n`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
