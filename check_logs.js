import fs from 'fs';

const path = 'C:\\Users\\Nomi-007\\.gemini\\antigravity-ide\\brain\\be6574d8-696d-478e-b933-38d1cfafd349\\.system_generated\\logs\\transcript_full.jsonl';
if (!fs.existsSync(path)) {
  console.log('Transcript file does not exist');
  process.exit(1);
}

const lines = fs.readFileSync(path, 'utf8').split('\n');
lines.forEach((line) => {
  if (line.trim()) {
    const obj = JSON.parse(line);
    if (obj.type === 'BROWSER_SUBAGENT') {
      console.log('SUBAGENT REPORT:');
      console.log(obj.content);
    }
  }
});
