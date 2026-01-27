// Simple geocoding using OpenStreetMap Nominatim API (free, no API key needed)

export async function searchAddress(query) {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'FairFareTransportation/1.0',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item) => ({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'FairFareTransportation/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}


