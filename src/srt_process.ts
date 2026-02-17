interface LocusPoint {
  latitude: number;
  longitude: number;
  altitude: number;
}

// reduced sparse points locus
function reducedSparsePointsLocus(
  points: LocusPoint[],
  distance: number
): LocusPoint[] {
  const reducedPoints: LocusPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    const currentPoint = points[i];
    const nextPoint = points[i + 1];
    if (nextPoint) {
      const distanceBetweenPoints = Math.sqrt(
        Math.pow(nextPoint.latitude - currentPoint.latitude, 2) +
          Math.pow(nextPoint.longitude - currentPoint.longitude, 2)
      );

      if (distanceBetweenPoints > distance) {
        reducedPoints.push(currentPoint);
      }
    }
  }
  return reducedPoints;
}

/**
 * Parses SRT file content and extracts locus points.
 * @param srtContent The content of the SRT file as a string.
 * @returns Array of locus points with latitude, longitude, and altitude.
 */
function parseSrtLocus(srtContent: string): LocusPoint[] {
  const locusPoints: LocusPoint[] = [];
  // Regex to match [latitude: ...] [longitude: ...] [altitude: ...]
  const regex =
    /\[latitude: ([^\]]+)\] \[longitude: ([^\]]+)\] \[altitude: ([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(srtContent)) !== null) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    const altitude = parseFloat(match[3]);
    if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(altitude)) {
      locusPoints.push({ latitude, longitude, altitude });
    }
  }
  return reducedSparsePointsLocus(locusPoints, 0.000003);
}

export { LocusPoint, parseSrtLocus, reducedSparsePointsLocus };
