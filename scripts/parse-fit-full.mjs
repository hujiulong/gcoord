/**
 * Full-resolution FIT file dump for review.
 * Outputs every record with GPS coordinates converted from semicircles to degrees,
 * altitude, speed, distance - NEVER drops resolution.
 *
 * Usage: node scripts/parse-fit-full.mjs [path-to-fit-file]
 */
import fs from 'fs';
import { Decoder, Stream } from '../fit-javascript-sdk/src/index.js';

const SEMICIRCLES_TO_DEGREES = 180 / Math.pow(2, 31);

function semicirclesToDegrees(semicircles) {
  if (semicircles == null) return null;
  return semicircles * SEMICIRCLES_TO_DEGREES;
}

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

const records = messages.recordMesgs || [];
const session = messages.sessionMesgs?.[0];

// Session summary
console.log('=== FILE INFO ===');
const fileId = messages.fileIdMesgs?.[0];
if (fileId) {
  console.log(`Device: ${fileId.manufacturer} product ${fileId.garminProduct || fileId.product}`);
  console.log(`Serial: ${fileId.serialNumber}`);
  console.log(`Type: ${fileId.type}`);
}

console.log('\n=== SESSION SUMMARY ===');
if (session) {
  const startLat = semicirclesToDegrees(session.startPositionLat);
  const startLon = semicirclesToDegrees(session.startPositionLong);
  const endLat = semicirclesToDegrees(session.endPositionLat);
  const endLon = semicirclesToDegrees(session.endPositionLong);
  console.log(`Start: ${session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime}`);
  console.log(`Start pos: ${startLat}, ${startLon}`);
  console.log(`End pos: ${endLat}, ${endLon}`);
  console.log(`Duration: ${(session.totalElapsedTime / 3600).toFixed(2)} hours (elapsed), ${(session.totalTimerTime / 3600).toFixed(2)} hours (timer)`);
  console.log(`Distance: ${(session.totalDistance / 1000).toFixed(2)} km`);
  console.log(`Speed avg/max: ${(session.enhancedAvgSpeed * 3.6).toFixed(1)} / ${(session.enhancedMaxSpeed * 3.6).toFixed(1)} km/h`);
  console.log(`Altitude min/max: ${session.enhancedMinAltitude} / ${session.enhancedMaxAltitude} m`);
  console.log(`Ascent/Descent: ${session.totalAscent} / ${session.totalDescent} m`);

  // Bounding box
  const neLat = semicirclesToDegrees(session.necLat);
  const neLon = semicirclesToDegrees(session.necLong);
  const swLat = semicirclesToDegrees(session.swcLat);
  const swLon = semicirclesToDegrees(session.swcLong);
  console.log(`Bounding box: SW(${swLat}, ${swLon}) NE(${neLat}, ${neLon})`);
}

// Filter records with GPS data
const gpsRecords = records.filter(r => r.positionLat != null && r.positionLong != null);
console.log(`\n=== RECORD STATS ===`);
console.log(`Total records: ${records.length}`);
console.log(`Records with GPS: ${gpsRecords.length}`);
console.log(`Records without GPS: ${records.length - gpsRecords.length}`);

// Sample frequency analysis on GPS records
if (gpsRecords.length > 1) {
  const timestamps = gpsRecords.map(r => r.timestamp).filter(t => t instanceof Date);
  const deltas = [];
  for (let i = 1; i < timestamps.length; i++) {
    deltas.push((timestamps[i] - timestamps[i - 1]) / 1000);
  }
  const totalDuration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
  console.log(`\nGPS time span: ${(totalDuration / 60).toFixed(1)} min (${(totalDuration / 3600).toFixed(2)} hours)`);
  console.log(`Sample interval - min: ${Math.min(...deltas)}s, max: ${Math.max(...deltas)}s, avg: ${(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(2)}s`);

  // Histogram
  const buckets = {};
  deltas.forEach(d => {
    let key;
    if (d <= 1) key = '<=1s';
    else if (d <= 5) key = '2-5s';
    else if (d <= 10) key = '6-10s';
    else if (d <= 30) key = '11-30s';
    else if (d <= 60) key = '31-60s';
    else if (d <= 300) key = '1-5min';
    else key = '>5min';
    buckets[key] = (buckets[key] || 0) + 1;
  });
  console.log('Interval distribution:', buckets);
}

// Detect all available fields across records
const allFields = new Set();
records.forEach(r => Object.keys(r).forEach(k => allFields.add(k)));
console.log(`\nAll record fields across dataset: ${[...allFields].join(', ')}`);

// Output header
console.log(`\n=== ALL GPS RECORDS (${gpsRecords.length} points, FULL RESOLUTION) ===`);
console.log('index | timestamp | latitude | longitude | altitude_m | speed_m/s | distance_m | heart_rate | cadence | power | temperature');
console.log('---');

// Print ALL GPS records with full precision
gpsRecords.forEach((r, i) => {
  const lat = semicirclesToDegrees(r.positionLat);
  const lon = semicirclesToDegrees(r.positionLong);
  const alt = r.enhancedAltitude ?? r.altitude ?? '';
  const speed = r.enhancedSpeed ?? r.speed ?? '';
  const dist = r.distance ?? '';
  const hr = r.heartRate ?? '';
  const cad = r.cadence ?? '';
  const power = r.power ?? '';
  const temp = r.temperature ?? '';
  const ts = r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp;

  console.log(`${i} | ${ts} | ${lat} | ${lon} | ${alt} | ${speed} | ${dist} | ${hr} | ${cad} | ${power} | ${temp}`);
});
