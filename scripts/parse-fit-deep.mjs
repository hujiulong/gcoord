/**
 * Deep-dive parse of FIT file - check ALL message types for GPS/altitude data.
 * Usage: node scripts/parse-fit-deep.mjs [path-to-fit-file]
 */
import fs from 'fs';
import { Decoder, Stream } from '../fit-javascript-sdk/src/index.js';

const fitFilePath = process.argv[2] || 'test/Activities/2026-01-30-20-46-08.fit';
const buffer = fs.readFileSync(fitFilePath);
const stream = Stream.fromBuffer(buffer);
const decoder = new Decoder(stream);

const { messages, errors } = decoder.read({
  applyScaleAndOffset: true,
  expandSubFields: true,
  expandComponents: true,
  convertTypesToStrings: true,
  convertDateTimesToDates: true,
  includeUnknownData: true,
  mergeHeartRates: true,
});

if (errors.length > 0) console.error('Errors:', errors);

// Check every message type for lat/lon/alt fields
console.log('=== SCANNING ALL MESSAGE TYPES FOR GPS/ALT DATA ===\n');
for (const [type, msgs] of Object.entries(messages)) {
  if (msgs.length === 0) continue;
  const fields = Object.keys(msgs[0]);
  const gpsFields = fields.filter(f => /lat|lon|pos|alt|elev|height|enhanced/i.test(f));
  if (gpsFields.length > 0) {
    console.log(`\n>>> ${type} (${msgs.length} msgs) has GPS/alt fields: ${gpsFields.join(', ')}`);
    // Print first 3 samples
    const printCount = Math.min(msgs.length, 3);
    for (let i = 0; i < printCount; i++) {
      console.log(`  [${i}]`, Object.fromEntries(gpsFields.map(f => [f, msgs[i][f]])));
    }
  }
}

// Dump timestampCorrelationMesgs fully
console.log('\n\n=== timestampCorrelationMesgs (first 10) ===');
const tcMesgs = messages.timestampCorrelationMesgs || [];
for (let i = 0; i < Math.min(tcMesgs.length, 10); i++) {
  console.log(`\n[${i}]:`);
  for (const [k, v] of Object.entries(tcMesgs[i])) {
    console.log(`  ${k}: ${v instanceof Date ? v.toISOString() : v}`);
  }
}

// Also try reading with expandComponents and includeUnknownData
// to see if record messages have hidden position data
console.log('\n\n=== RECORD MESSAGES: ALL FIELDS (first 5) ===');
const recs = messages.recordMesgs || [];
for (let i = 0; i < Math.min(recs.length, 5); i++) {
  console.log(`\n[${i}]:`);
  for (const [k, v] of Object.entries(recs[i])) {
    console.log(`  ${k}: ${v instanceof Date ? v.toISOString() : v}`);
  }
}

// Check device info for device type
console.log('\n\n=== DEVICE INFO ===');
const devMesgs = messages.deviceInfoMesgs || [];
for (let i = 0; i < Math.min(devMesgs.length, 3); i++) {
  console.log(`\n[${i}]:`);
  for (const [k, v] of Object.entries(devMesgs[i])) {
    console.log(`  ${k}: ${v instanceof Date ? v.toISOString() : v}`);
  }
}

// Check fileId
console.log('\n\n=== FILE ID ===');
const fileId = messages.fileIdMesgs?.[0];
if (fileId) {
  for (const [k, v] of Object.entries(fileId)) {
    console.log(`  ${k}: ${v instanceof Date ? v.toISOString() : v}`);
  }
}

// Check sport
console.log('\n\n=== SPORT ===');
const sport = messages.sportMesgs?.[0];
if (sport) {
  for (const [k, v] of Object.entries(sport)) {
    console.log(`  ${k}: ${v}`);
  }
}
