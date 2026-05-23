export type UserRole = "individual_donor" | "business_donor" | "ngo" | "delivery" | "admin" | "sponsor";

export interface NGO {
  id: string;
  name: string;
  distance: number;
  rating: number;
  responseTime: string;
  verified: boolean;
  capacity: number;
  activeToday: boolean;
  speciality: string;
  beneficiaries: number;
  location: { lat: number; lng: number };
  phone: string;
  address: string;
}

export interface Donation {
  id: string;
  foodName: string;
  quantity: number;
  unit: string;
  category: "veg" | "non-veg" | "beverage" | "bakery" | "dairy";
  status: "pending" | "matched" | "in_transit" | "delivered" | "cancelled";
  freshnessScore: number;
  urgency: "low" | "medium" | "high" | "critical";
  servingCapacity: number;
  preparedAt: string;
  expiryEstimate: string;
  ngoName?: string;
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  mealsServed?: number;
}

export interface AnalyticsData {
  totalDonations: number;
  mealsServed: number;
  co2Saved: number;
  waterSaved: number;
  activeDonors: number;
  activeNGOs: number;
  totalWeight: number;
  weeklyDonations: number[];
  monthlyImpact: { month: string; meals: number; weight: number }[];
}

export const MOCK_NGOS: NGO[] = [
  {
    id: "ngo_1",
    name: "Akshaya Patra Foundation",
    distance: 1.2,
    rating: 4.9,
    responseTime: "< 5 mins",
    verified: true,
    capacity: 500,
    activeToday: true,
    speciality: "Mid-day meals, Children",
    beneficiaries: 12000,
    location: { lat: 12.9716, lng: 77.5946 },
    phone: "+91 98765 43210",
    address: "Jayanagar, Bangalore - 560041",
  },
  {
    id: "ngo_2",
    name: "Robin Hood Army",
    distance: 2.4,
    rating: 4.8,
    responseTime: "< 10 mins",
    verified: true,
    capacity: 300,
    activeToday: true,
    speciality: "Urban poor, Homeless",
    beneficiaries: 8500,
    location: { lat: 12.9352, lng: 77.6245 },
    phone: "+91 87654 32109",
    address: "Koramangala, Bangalore - 560034",
  },
  {
    id: "ngo_3",
    name: "No Food Waste",
    distance: 3.1,
    rating: 4.7,
    responseTime: "< 15 mins",
    verified: true,
    capacity: 200,
    activeToday: true,
    speciality: "General food redistribution",
    beneficiaries: 5200,
    location: { lat: 12.9539, lng: 77.5802 },
    phone: "+91 76543 21098",
    address: "Indiranagar, Bangalore - 560038",
  },
  {
    id: "ngo_4",
    name: "Annamrita Foundation",
    distance: 4.2,
    rating: 4.6,
    responseTime: "< 20 mins",
    verified: true,
    capacity: 800,
    activeToday: false,
    speciality: "Temple prasad, Community kitchens",
    beneficiaries: 15000,
    location: { lat: 12.9858, lng: 77.6088 },
    phone: "+91 65432 10987",
    address: "Whitefield, Bangalore - 560066",
  },
  {
    id: "ngo_5",
    name: "Feed India",
    distance: 5.8,
    rating: 4.5,
    responseTime: "< 25 mins",
    verified: true,
    capacity: 400,
    activeToday: true,
    speciality: "Disaster relief, Migrants",
    beneficiaries: 9800,
    location: { lat: 12.9165, lng: 77.6018 },
    phone: "+91 54321 09876",
    address: "Electronic City, Bangalore - 560100",
  },
];

export const MOCK_DONATIONS: Donation[] = [
  {
    id: "don_1",
    foodName: "Veg Biryani",
    quantity: 50,
    unit: "servings",
    category: "veg",
    status: "delivered",
    freshnessScore: 94,
    urgency: "high",
    servingCapacity: 50,
    preparedAt: "Today 1:00 PM",
    expiryEstimate: "Today 8:00 PM",
    ngoName: "Akshaya Patra Foundation",
    riderName: "Ravi Kumar",
    riderPhone: "+91 98765 43210",
    createdAt: "2024-05-15T13:00:00Z",
    mealsServed: 50,
  },
  {
    id: "don_2",
    foodName: "Bread & Pastries",
    quantity: 120,
    unit: "pieces",
    category: "bakery",
    status: "in_transit",
    freshnessScore: 88,
    urgency: "medium",
    servingCapacity: 80,
    preparedAt: "Today 9:00 AM",
    expiryEstimate: "Today 6:00 PM",
    ngoName: "Robin Hood Army",
    riderName: "Suresh M",
    riderPhone: "+91 87654 32109",
    createdAt: "2024-05-15T09:00:00Z",
  },
  {
    id: "don_3",
    foodName: "Dal Rice Combo",
    quantity: 75,
    unit: "meals",
    category: "veg",
    status: "matched",
    freshnessScore: 91,
    urgency: "medium",
    servingCapacity: 75,
    preparedAt: "Today 12:00 PM",
    expiryEstimate: "Today 7:00 PM",
    ngoName: "No Food Waste",
    createdAt: "2024-05-15T12:00:00Z",
  },
];

export const PLATFORM_ANALYTICS: AnalyticsData = {
  totalDonations: 24681,
  mealsServed: 892340,
  co2Saved: 187.4,
  waterSaved: 2843000,
  activeDonors: 3421,
  activeNGOs: 284,
  totalWeight: 521340,
  weeklyDonations: [142, 198, 167, 234, 189, 276, 312],
  monthlyImpact: [
    { month: "Nov", meals: 68200, weight: 34100 },
    { month: "Dec", meals: 74500, weight: 37250 },
    { month: "Jan", meals: 82300, weight: 41150 },
    { month: "Feb", meals: 79800, weight: 39900 },
    { month: "Mar", meals: 91200, weight: 45600 },
    { month: "Apr", meals: 98600, weight: 49300 },
    { month: "May", meals: 112400, weight: 56200 },
  ],
};

export const DONOR_ANALYTICS = {
  totalDonations: 23,
  mealsServed: 1840,
  co2Saved: 3.68,
  waterSaved: 55200,
  badgesEarned: ["Green Hero", "Zero Waste Warrior", "Community Champion"],
  rank: "Platinum Donor",
  weeklyGoal: 80,
  weeklyProgress: 65,
};

export const NGO_REQUESTS = [
  {
    id: "req_1",
    donorName: "Rahul Sharma",
    donorType: "Individual",
    foodName: "Home Cooked Meals - Rajma Rice",
    quantity: "40 portions",
    category: "veg",
    freshnessScore: 93,
    urgency: "high",
    distance: "1.4 km",
    eta: "18 mins",
    preparedAt: "12:30 PM",
    expiryAt: "7:00 PM",
    questionnaire: {
      refrigerated: true,
      untouched: true,
      vegetarian: true,
      servings: 40,
      urgentPickup: true,
      transportNeeded: true,
    },
    status: "pending",
    createdAt: "2 mins ago",
  },
  {
    id: "req_2",
    donorName: "Spice Garden Restaurant",
    donorType: "Business",
    foodName: "Mixed Veg Thali + Rotis",
    quantity: "120 portions",
    category: "veg",
    freshnessScore: 87,
    urgency: "medium",
    distance: "3.2 km",
    eta: "32 mins",
    preparedAt: "11:00 AM",
    expiryAt: "6:00 PM",
    questionnaire: {
      refrigerated: true,
      untouched: true,
      vegetarian: true,
      servings: 120,
      urgentPickup: false,
      transportNeeded: false,
    },
    status: "pending",
    createdAt: "15 mins ago",
  },
  {
    id: "req_3",
    donorName: "Grand Meridian Hotel",
    donorType: "Business",
    foodName: "Buffet Surplus - Multi-cuisine",
    quantity: "280 portions",
    category: "non-veg",
    freshnessScore: 79,
    urgency: "medium",
    distance: "6.1 km",
    eta: "45 mins",
    preparedAt: "1:00 PM",
    expiryAt: "8:00 PM",
    questionnaire: {
      refrigerated: true,
      untouched: false,
      vegetarian: false,
      servings: 280,
      urgentPickup: false,
      transportNeeded: false,
    },
    status: "pending",
    createdAt: "28 mins ago",
  },
];

export const ADMIN_STATS = {
  totalDonors: 3421,
  activeNGOs: 284,
  pendingVerifications: 12,
  totalDonations: 24681,
  successRate: 97.3,
  flaggedItems: 3,
  newRegistrations: 47,
  monthlyRevenue: 0,
};

export const SPONSOR_STATS = {
  companyName: "TechCorp India",
  sponsorTier: "Platinum CSR Partner",
  deliveriesSponsored: 1842,
  mealsEnabled: 73680,
  totalInvestment: 184200,
  co2Offset: 38.7,
  esgScore: 94,
  visibilityReach: 2400000,
};

export const FOOD_CATEGORIES = [
  { id: "veg", label: "Vegetarian", icon: "leaf" },
  { id: "non-veg", label: "Non-Vegetarian", icon: "droplet" },
  { id: "vegan", label: "Vegan", icon: "sun" },
  { id: "bakery", label: "Bakery / Snacks", icon: "package" },
  { id: "beverage", label: "Beverage", icon: "coffee" },
  { id: "dairy", label: "Dairy", icon: "circle" },
];

export const RIDER_POSITIONS = [
  { lat: 12.9280, lng: 77.6270, eta: "22 mins", status: "Rider Assigned" },
  { lat: 12.9295, lng: 77.6255, eta: "20 mins", status: "Rider En Route" },
  { lat: 12.9315, lng: 77.6238, eta: "17 mins", status: "Rider Nearby" },
  { lat: 12.9338, lng: 77.6218, eta: "14 mins", status: "Almost There" },
  { lat: 12.9352, lng: 77.6198, eta: "10 mins", status: "Arrived at Pickup" },
  { lat: 12.9368, lng: 77.6178, eta: "8 mins", status: "Food Picked Up" },
  { lat: 12.9390, lng: 77.6155, eta: "5 mins", status: "In Transit" },
  { lat: 12.9416, lng: 77.6128, eta: "2 mins", status: "Almost Delivered" },
  { lat: 12.9439, lng: 77.6105, eta: "Arrived", status: "Delivered" },
];

export interface CommunityDonation {
  id: string;
  donorName: string;
  donorUsername: string;
  foodName: string;
  quantity: number;
  unit: string;
  category: "veg" | "non-veg" | "beverage" | "bakery" | "dairy";
  status: "pending" | "matched" | "in_transit" | "delivered" | "cancelled";
  freshnessScore: number;
  servingCapacity: number;
  ngoName: string;
  createdAt: string;
  city: string;
  mealsServed?: number;
}

export const MOCK_COMMUNITY_DONATIONS: CommunityDonation[] = [
  { id: "cd_1", donorName: "Priya Nair", donorUsername: "@priya_n", foodName: "Sambar Rice", quantity: 80, unit: "servings", category: "veg", status: "delivered", freshnessScore: 96, servingCapacity: 80, ngoName: "Akshaya Patra Foundation", createdAt: "2026-05-21T07:30:00Z", city: "Chennai", mealsServed: 80 },
  { id: "cd_2", donorName: "Spice Garden Restaurant", donorUsername: "@spicegarden", foodName: "Chicken Biryani", quantity: 45, unit: "kg", category: "non-veg", status: "delivered", freshnessScore: 91, servingCapacity: 90, ngoName: "Robin Hood Army", createdAt: "2026-05-21T08:00:00Z", city: "Chennai", mealsServed: 90 },
  { id: "cd_3", donorName: "Anand Kumar", donorUsername: "@anand_k", foodName: "Idli & Chutney", quantity: 200, unit: "pieces", category: "veg", status: "in_transit", freshnessScore: 89, servingCapacity: 100, ngoName: "Feed India", createdAt: "2026-05-21T08:45:00Z", city: "Bengaluru" },
  { id: "cd_4", donorName: "Hotel Saravana Bhavan", donorUsername: "@saravana_hotel", foodName: "Mixed Veg Curry", quantity: 60, unit: "litres", category: "veg", status: "delivered", freshnessScore: 93, servingCapacity: 120, ngoName: "Annamrita Foundation", createdAt: "2026-05-21T09:10:00Z", city: "Chennai", mealsServed: 120 },
  { id: "cd_5", donorName: "Meera Krishnan", donorUsername: "@meera_k", foodName: "Dal Makhani", quantity: 30, unit: "kg", category: "veg", status: "matched", freshnessScore: 87, servingCapacity: 60, ngoName: "No Food Waste", createdAt: "2026-05-21T09:30:00Z", city: "Hyderabad" },
  { id: "cd_6", donorName: "Bakers Inn", donorUsername: "@bakers_inn", foodName: "Assorted Pastries", quantity: 300, unit: "pieces", category: "bakery", status: "delivered", freshnessScore: 94, servingCapacity: 150, ngoName: "Hunger Free India", createdAt: "2026-05-21T10:00:00Z", city: "Chennai", mealsServed: 150 },
  { id: "cd_7", donorName: "Vijay Sharma", donorUsername: "@vijay_s", foodName: "Pongal", quantity: 40, unit: "servings", category: "veg", status: "pending", freshnessScore: 82, servingCapacity: 40, ngoName: "Roti Bank Chennai", createdAt: "2026-05-21T10:20:00Z", city: "Chennai" },
  { id: "cd_8", donorName: "Raj Catering Co.", donorUsername: "@raj_cater", foodName: "Pulao & Raita", quantity: 150, unit: "servings", category: "veg", status: "delivered", freshnessScore: 97, servingCapacity: 150, ngoName: "Sewa Bharati", createdAt: "2026-05-21T10:45:00Z", city: "Mumbai", mealsServed: 150 },
  { id: "cd_9", donorName: "Sunita Reddy", donorUsername: "@sunita_r", foodName: "Vada Pav", quantity: 80, unit: "pieces", category: "veg", status: "in_transit", freshnessScore: 88, servingCapacity: 80, ngoName: "Care & Share Society", createdAt: "2026-05-21T11:00:00Z", city: "Pune" },
  { id: "cd_10", donorName: "Green Bowl Café", donorUsername: "@greenbowl", foodName: "Veg Sandwiches", quantity: 120, unit: "pieces", category: "veg", status: "delivered", freshnessScore: 92, servingCapacity: 120, ngoName: "Food for All Foundation", createdAt: "2026-05-21T11:30:00Z", city: "Delhi", mealsServed: 120 },
  { id: "cd_11", donorName: "Ramu Iyer", donorUsername: "@ramu_iyer", foodName: "Curd Rice", quantity: 35, unit: "kg", category: "dairy", status: "delivered", freshnessScore: 86, servingCapacity: 70, ngoName: "Akshaya Patra Foundation", createdAt: "2026-05-21T12:00:00Z", city: "Chennai", mealsServed: 70 },
  { id: "cd_12", donorName: "Corporate Events Co.", donorUsername: "@corp_events", foodName: "Buffet Spread", quantity: 200, unit: "servings", category: "veg", status: "delivered", freshnessScore: 95, servingCapacity: 200, ngoName: "Robin Hood Army", createdAt: "2026-05-20T18:00:00Z", city: "Bengaluru", mealsServed: 200 },
  { id: "cd_13", donorName: "Deepa Menon", donorUsername: "@deepa_m", foodName: "Kerala Sadhya", quantity: 50, unit: "meals", category: "veg", status: "cancelled", freshnessScore: 78, servingCapacity: 50, ngoName: "Feed India", createdAt: "2026-05-20T14:00:00Z", city: "Kochi" },
  { id: "cd_14", donorName: "Tandoor Palace", donorUsername: "@tandoor_p", foodName: "Naan & Paneer", quantity: 70, unit: "servings", category: "veg", status: "delivered", freshnessScore: 90, servingCapacity: 70, ngoName: "Annamrita Foundation", createdAt: "2026-05-20T19:30:00Z", city: "Delhi", mealsServed: 70 },
  { id: "cd_15", donorName: "Kavitha S", donorUsername: "@kavitha_s", foodName: "Upma & Chutney", quantity: 100, unit: "servings", category: "veg", status: "delivered", freshnessScore: 93, servingCapacity: 100, ngoName: "No Food Waste", createdAt: "2026-05-20T07:00:00Z", city: "Chennai", mealsServed: 100 },
];
