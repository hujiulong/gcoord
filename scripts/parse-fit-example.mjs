/**
 * Parse an example FIT file and output all record data points.
 * Usage: node scripts/parse-fit-example.mjs [path-to-fit-file]
 */
import fs from 'fs';
import path from 'path';
import { Decoder, Stream } from '../fit-javascript-sdk/src/index.js';

const fitFilePath = process.argv[2] || 'test/Activities/2026-01-30-20-46-08.fit';
const buffer = fs.readFileSync(fitFilePath);
const stream = Stream.fromBuffer(buffer);

console.log('isFIT:', Decoder.isFIT(stream));

const decoder = new Decoder(stream);
console.log('checkIntegrity:', decoder.checkIntegrity());

const { messages, errors } = decoder.read({
  applyScaleAndOffset: true,
  expandSubFields: true,
  expandComponents: true,
  convertTypesToStrings: true,
  convertDateTimesToDates: true,
  includeUnknownData: false,
  mergeHeartRates: true,
});

if (errors.length > 0) {
  console.error('Decode errors:', errors);
}

// Print all message types and their counts
console.log('\n=== MESSAGE TYPES ===');
for (const [type, msgs] of Object.entries(messages)) {
  console.log(`${type}: ${msgs.length} messages`);
}

// Print session summary
if (messages.sessionMesgs && messages.sessionMesgs.length > 0) {
  console.log('\n=== SESSION SUMMARY ===');
  const session = messages.sessionMesgs[0];
  for (const [key, value] of Object.entries(session)) {
    console.log(`  ${key}: ${value}`);
  }
}

// Print ALL record messages with full precision
if (messages.recordMesgs && messages.recordMesgs.length > 0) {
  const records = messages.recordMesgs;
  console.log(`\n=== RECORD MESSAGES (${records.length} total) ===`);

  // Print field names from first record
  const fields = Object.keys(records[0]);
  console.log('Fields:', fields.join(', '));
  console.log('');

  // Print first 30 records with full data
  const printCount = Math.min(records.length, 30);
  console.log(`--- First ${printCount} records ---`);
  for (let i = 0; i < printCount; i++) {
    const r = records[i];
    const line = fields.map(f => {
      const v = r[f];
      if (v instanceof Date) return v.toISOString();
      if (typeof v === 'number') return v; // full precision, no rounding
      return v;
    }).join(' | ');
    console.log(`[${i}] ${line}`);
  }

  // Print last 5 records
  if (records.length > 30) {
    console.log(`\n--- Last 5 records ---`);
    for (let i = records.length - 5; i < records.length; i++) {
      const r = records[i];
      const line = fields.map(f => {
        const v = r[f];
        if (v instanceof Date) return v.toISOString();
        if (typeof v === 'number') return v;
        return v;
      }).join(' | ');
      console.log(`[${i}] ${line}`);
    }
  }

  // Compute time deltas between consecutive records
  console.log('\n=== SAMPLE FREQUENCY ANALYSIS ===');
  const timestamps = records
    .map(r => r.timestamp)
    .filter(t => t instanceof Date);

  if (timestamps.length > 1) {
    const deltas = [];
    for (let i = 1; i < timestamps.length; i++) {
      deltas.push((timestamps[i] - timestamps[i - 1]) / 1000); // seconds
    }
    const minDelta = Math.min(...deltas);
    const maxDelta = Math.max(...deltas);
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const totalDuration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;

    console.log(`Total records: ${records.length}`);
    console.log(`Time span: ${totalDuration.toFixed(1)}s (${(totalDuration / 60).toFixed(1)} min)`);
    console.log(`Sample interval - min: ${minDelta}s, max: ${maxDelta}s, avg: ${avgDelta.toFixed(2)}s`);
    console.log(`Effective frequency: ~${(1 / avgDelta).toFixed(2)} Hz`);

    // Distribution of deltas
    const deltaCounts = {};
    deltas.forEach(d => {
      const key = d.toFixed(0) + 's';
      deltaCounts[key] = (deltaCounts[key] || 0) + 1;
    });
    console.log('Delta distribution:', deltaCounts);
  }

  // Check for altitude/elevation data
  console.log('\n=== ALTITUDE/ELEVATION CHECK ===');
  const altFields = fields.filter(f => /alt|elev|height/i.test(f));
  console.log('Altitude-related fields:', altFields.length > 0 ? altFields.join(', ') : 'NONE');

  if (altFields.length > 0) {
    const sample = records[0];
    altFields.forEach(f => {
      console.log(`  ${f} sample value: ${sample[f]}`);
    });
    // Min/max altitude
    altFields.forEach(f => {
      const vals = records.map(r => r[f]).filter(v => typeof v === 'number');
      if (vals.length > 0) {
        console.log(`  ${f} range: ${Math.min(...vals)} to ${Math.max(...vals)} (${vals.length} values)`);
      }
    });
  }

  // Check for GPS coordinate fields
  console.log('\n=== GPS COORDINATE CHECK ===');
  const gpsFields = fields.filter(f => /lat|lon|pos/i.test(f));
  console.log('GPS-related fields:', gpsFields.join(', '));
  if (gpsFields.length > 0) {
    const sample = records[0];
    gpsFields.forEach(f => {
      console.log(`  ${f} sample value: ${sample[f]} (type: ${typeof sample[f]})`);
    });
  }
}

// Print lap messages if any
if (messages.lapMesgs && messages.lapMesgs.length > 0) {
  console.log(`\n=== LAP MESSAGES (${messages.lapMesgs.length}) ===`);
  messages.lapMesgs.forEach((lap, i) => {
    console.log(`\nLap ${i}:`);
    for (const [key, value] of Object.entries(lap)) {
      console.log(`  ${key}: ${value}`);
    }
  });
}
