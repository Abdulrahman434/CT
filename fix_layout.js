const fs = require('fs');
const file = 'src/app/components/CallScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Adjust pb-10 to pb-24 and calc(100% - 200px) to calc(100% - 240px)
content = content.replace(
  'className="min-h-0 flex px-10 pb-10 relative z-10" style={{ flex: "1 1 0", maxHeight: "calc(100% - 200px)", gap: "40px" }}',
  'className="min-h-0 flex px-10 pb-24 relative z-10" style={{ flex: "1 1 0", maxHeight: "calc(100% - 240px)", gap: "40px" }}'
);

// 2. Extract Directory block
const dirStart = content.indexOf('{/* Column 1 — Directory */}');
const keypadStart = content.indexOf('{/* Column 2 — Keypad (center, takes remaining space) */}');
const historyStart = content.indexOf('{/* Column 3 — Call History */}');

// The end of the history block is the div right before `<style>{``
const styleStart = content.indexOf('<style>{`');
const historyEnd = content.lastIndexOf('</div>', content.lastIndexOf('</div>', styleStart) - 1) + 6; 
// Let's use substring manipulation carefully
const dirBlock = content.substring(dirStart, keypadStart);
const keypadBlock = content.substring(keypadStart, historyStart);

// To find historyEnd, it's the end of Column 3
const historyEndIndex = content.indexOf('      </div>\n\n      <style>{`\n        @keyframes callScreenIn');
const historyBlock = content.substring(historyStart, historyEndIndex);

if (dirStart > -1 && keypadStart > -1 && historyStart > -1 && historyEndIndex > -1) {
    let newDirBlock = dirBlock.replace('Column 1 — Directory', 'Column 3 — Directory');
    let newHistoryBlock = historyBlock.replace('Column 3 — Call History', 'Column 1 — Call History');

    const beforeColumns = content.substring(0, dirStart);
    const afterColumns = content.substring(historyEndIndex);

    fs.writeFileSync(file, beforeColumns + newHistoryBlock + keypadBlock + newDirBlock + afterColumns);
    console.log("File successfully updated via Node script.");
} else {
    console.log("Failed to find boundaries.", {dirStart, keypadStart, historyStart, historyEndIndex});
}
