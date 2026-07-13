import fs from 'fs';
const f = 'c:\\Users\\Balfaqih\\OneDrive - Bits Arabia\\General - CAREINN TO DO List\\Redesign Bedside Screen UI (Abdulrahman) (Copy)alnajjar\\src\\app\\components\\CallScreen.tsx';
let c = fs.readFileSync(f, 'utf8');
// Use useSipAvailable hook instead of inline derivation
c = c.replace(
  "const isSipAvailable = regState === 'Ok' && isAndroidApp();",
  "const isSipAvailable = useSipAvailable();"
);
fs.writeFileSync(f, c);
console.log('Updated isSipAvailable in CallScreen.tsx');
