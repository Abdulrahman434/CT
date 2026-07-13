import fs from 'fs';

const filePath = 'c:\\Users\\Balfaqih\\OneDrive - Bits Arabia\\General - CAREINN TO DO List\\Redesign Bedside Screen UI (Abdulrahman) (Copy)alnajjar\\src\\app\\components\\CallScreen.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the EXTENSIONS.map block
content = content.replace(
  /\{\s*EXTENSIONS\.map\(\(ext\)\s*=>\s*\(\s*<ExtensionCard\s*key=\{ext\.id\}\s*ext=\{ext\}\s*onDial=\{\(\)\s*=>\s*handleDial\(ext\)\}\s*\/>\s*\)\)\}/,
  `{displayContacts.map((c) => (
                 <ExtensionCard key={c.extension} contact={c} onDial={() => handleDial(c)} />
               ))}`
);

fs.writeFileSync(filePath, content);
console.log('Successfully updated CallScreen.tsx');
