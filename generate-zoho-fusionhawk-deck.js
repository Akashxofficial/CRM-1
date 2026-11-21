const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlFilePath = path.join(__dirname, 'deck_fusionhawk.html');
const pdfFilePath = path.join(__dirname, 'UrbanGaon_Customer_Enquiry_Form_Technical_Deck.pdf');

const msedgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const browserPath = fs.existsSync(chromePath) ? chromePath : msedgePath;

console.log(`Using browser engine: ${browserPath}`);
const cmd = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfFilePath}" "${htmlFilePath}"`;

console.log('Compiling 10-slide PDF via headless browser...');
execSync(cmd);

console.log(`\n======================================================`);
console.log(`✓ PDF GENERATED SUCCESSFULLY!`);
console.log(`File Location: ${pdfFilePath}`);
const stats = fs.statSync(pdfFilePath);
console.log(`File Size: ${(stats.size / 1024).toFixed(1)} KB`);
console.log(`======================================================\n`);
