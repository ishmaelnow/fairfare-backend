const DEFAULT_FARE_CONFIG = {
  baseFare: 2.5,
  perMile: 1.75,
  perMinute: 0.35,
  minimumFare: 5.0,
  surgeMultiplier: 1.0,
};

export function calculateFare(distanceMiles, durationMinutes, config = {}) {
  const fullConfig = { ...DEFAULT_FARE_CONFIG, ...config };

  const distanceCost = distanceMiles * fullConfig.perMile;
  const timeCost = durationMinutes * fullConfig.perMinute;
  const subtotal = fullConfig.baseFare + distanceCost + timeCost;

  const withSurge = subtotal * fullConfig.surgeMultiplier;

  return Math.max(withSurge, fullConfig.minimumFare);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

