export interface NearbyNGO {
  id: string;
  name: string;
  distance: number;
  distanceStr: string;
  rating: number;
  responseTime: string;
  verified: boolean;
  speciality: string;
  beneficiaries: number;
  location: { lat: number; lng: number };
  phone: string;
  address: string;
  activeToday: boolean;
  capacity: number;
  accepted?: boolean;
  declined?: boolean;
  notified?: boolean;
}

const NGO_TEMPLATES = [
  { name: "Akshaya Patra Foundation", speciality: "Mid-day meals, Children", phone: "+91 98765 43210", rating: 4.9, capacity: 500, beneficiaries: 12000 },
  { name: "Robin Hood Army", speciality: "Urban poor, Homeless", phone: "+91 87654 32109", rating: 4.8, capacity: 300, beneficiaries: 8500 },
  { name: "No Food Waste", speciality: "General redistribution", phone: "+91 76543 21098", rating: 4.7, capacity: 200, beneficiaries: 5200 },
  { name: "Annamrita Foundation", speciality: "Temple prasad, Community kitchens", phone: "+91 65432 10987", rating: 4.6, capacity: 800, beneficiaries: 15000 },
  { name: "Feed India", speciality: "Disaster relief, Migrants", phone: "+91 54321 09876", rating: 4.5, capacity: 400, beneficiaries: 9800 },
  { name: "Roti Bank Chennai", speciality: "Night shelters, Daily labourers", phone: "+91 44321 09876", rating: 4.7, capacity: 250, beneficiaries: 6400 },
  { name: "Hunger Free India", speciality: "School children, Slum communities", phone: "+91 33221 09876", rating: 4.4, capacity: 180, beneficiaries: 4200 },
  { name: "Food for All Foundation", speciality: "Old age homes, Orphanages", phone: "+91 22111 09876", rating: 4.6, capacity: 350, beneficiaries: 7100 },
  { name: "Sewa Bharati", speciality: "Tribal communities, Rural poor", phone: "+91 11987 09876", rating: 4.5, capacity: 600, beneficiaries: 11000 },
  { name: "Care & Share Society", speciality: "HIV patients, Differently abled", phone: "+91 99876 54321", rating: 4.8, capacity: 150, beneficiaries: 3200 },
];

const STREET_NAMES = [
  "MG Road", "Anna Salai", "Pondy Bazaar", "T. Nagar", "Nungambakkam",
  "Mylapore", "Adyar", "Velachery", "Tambaram", "Chromepet",
];

export function generateNearbyNGOs(userLat: number, userLng: number): NearbyNGO[] {
  return NGO_TEMPLATES.map((template, i) => {
    // Distances from 0.4km to 8km, sorted
    const baseDistance = 0.4 + i * 0.85;
    const jitter = (Math.random() - 0.5) * 0.3;
    const distanceKm = Math.max(0.3, baseDistance + jitter);

    // Spread NGOs in different directions
    const angleDeg = (i * 38 + 15) % 360;
    const angleRad = angleDeg * (Math.PI / 180);

    // 1 degree latitude ≈ 111 km
    const latOffset = (distanceKm / 111) * Math.cos(angleRad);
    const lngOffset = (distanceKm / (111 * Math.cos(userLat * (Math.PI / 180)))) * Math.sin(angleRad);

    const responseTimes = ["< 3 mins", "< 5 mins", "< 8 mins", "< 10 mins", "< 15 mins"];
    const responseTime = responseTimes[Math.min(i, responseTimes.length - 1)];

    return {
      id: `nearby_ngo_${i + 1}`,
      name: template.name,
      speciality: template.speciality,
      phone: template.phone,
      rating: template.rating,
      capacity: template.capacity,
      beneficiaries: template.beneficiaries,
      distance: Math.round(distanceKm * 10) / 10,
      distanceStr: `${(Math.round(distanceKm * 10) / 10).toFixed(1)} km`,
      responseTime,
      verified: true,
      activeToday: i < 8,
      location: {
        lat: userLat + latOffset,
        lng: userLng + lngOffset,
      },
      address: `${STREET_NAMES[i % STREET_NAMES.length]}, ${Math.floor(Math.random() * 900 + 100)}`,
    };
  }).sort((a, b) => a.distance - b.distance);
}

export function getRouteWaypoints(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  steps: number = 20
): { latitude: number; longitude: number }[] {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Add slight curve to simulate road path
    const curveOffset = Math.sin(t * Math.PI) * 0.003;
    points.push({
      latitude: fromLat + (toLat - fromLat) * t + curveOffset,
      longitude: fromLng + (toLng - fromLng) * t + curveOffset * 0.5,
    });
  }
  return points;
}
