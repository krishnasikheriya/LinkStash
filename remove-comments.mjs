import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import stripComments from 'strip-comments';

const srcDir = path.join(process.cwd(), 'src');
const files = globSync('**/*.{ts,tsx}', { cwd: srcDir, absolute: true });

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  if (file.includes('components/ui')) return;

  // 1. Remove JSX comments entirely
  content = content.replace(/\{\s*\/\*(?:.|[\n\r])*?\*\/\s*\}/g, '');

  // 2. Strip standard JS comments
  let stripped = stripComments(content);

  // Remove multiple empty lines
  stripped = stripped.replace(/\n\s*\n/g, '\n\n');

  if (content !== stripped) {
    fs.writeFileSync(file, stripped, 'utf-8');
    console.log(`Stripped comments from ${file}`);
  }
});
