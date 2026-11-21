// scripts/export-training-data.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BASE_DIR = path.resolve(__dirname, '../assets/json/training');
const TRAINING_FILE = path.join(BASE_DIR, `chat_training_${new Date().toISOString().split('T')[0]}.json`);

async function exportTrainingData() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const query = `
      SELECT query_text, human_correction, context_references
      FROM chat_logs
      WHERE rating = 0 AND human_correction IS NOT NULL;
    `;

    const res = await client.query(query);
    
    // Convert DB rows into standard Fine-Tuning JSON format (Instruction/Input/Output)
    const trainingData = res.rows.map(row => ({
      instruction: "Act as an expert AI Assistant. Answer the question accurately using the provided context.",
      input: `Context: ${JSON.stringify(row.context_references)}\nQuestion: ${row.query_text}`,
      output: row.human_correction
    }));

    fs.writeFileSync(TRAINING_FILE, JSON.stringify(trainingData, null, 2));
    
    console.log(`Exported ${trainingData.length} records to ${TRAINING_FILE}`);
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    await client.end();
  }
}

exportTrainingData();