import {
  Plane, BedDouble, Utensils, Camera, Car, ShoppingBag, MapPin, Heart, Coffee,
  Landmark, TreePine, Drama, Ticket, Bookmark, MoreHorizontal, Tag,
} from 'lucide-react';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export const ACTIVITY_CATEGORIES = [
  { id: 'Flight', icon: Plane, color: '#7F93A8' },
  { id: 'Hotel', icon: BedDouble, color: '#7C8F7A' },
  { id: 'Food', icon: Utensils, color: '#C29A7A' },
  { id: 'Activity', icon: Camera, color: '#9A8AA6' },
  { id: 'Transportation', icon: Car, color: '#6F8F93' },
  { id: 'Shopping', icon: ShoppingBag, color: '#C4969A' },
  { id: 'Other', icon: MapPin, color: '#A39E93' },
];
export const activityMeta = (id) => ACTIVITY_CATEGORIES.find((c) => c.id === id) || ACTIVITY_CATEGORIES[6];

export const BOOKING_TYPES = [
  { id: 'Flight', icon: Plane },
  { id: 'Hotel', icon: BedDouble },
  { id: 'Rental Car', icon: Car },
  { id: 'Restaurant', icon: Utensils },
  { id: 'Activity', icon: Ticket },
  { id: 'Other', icon: Bookmark },
];
export const bookingMeta = (id) => BOOKING_TYPES.find((c) => c.id === id) || BOOKING_TYPES[5];

export const PLACE_CATEGORIES = [
  { id: 'Favorites', icon: Heart },
  { id: 'Restaurants', icon: Utensils },
  { id: 'Cafés', icon: Coffee },
  { id: 'Photo Spots', icon: Camera },
  { id: 'Attractions', icon: Landmark },
  { id: 'Nature', icon: TreePine },
  { id: 'Shopping', icon: ShoppingBag },
  { id: 'Entertainment', icon: Drama },
];
export const placeMeta = (id) => PLACE_CATEGORIES.find((c) => c.id === id) || PLACE_CATEGORIES[4];

export const DOC_TYPES = [
  { id: 'Passport', sensitive: true },
  { id: 'Confirmation number', sensitive: false },
  { id: 'Travel insurance', sensitive: true },
  { id: 'Emergency contact', sensitive: false },
  { id: 'Important address', sensitive: false },
  { id: 'Other', sensitive: false },
];

export const EMERGENCY_FIELDS = [
  { key: 'localNumber', label: 'Local emergency number', tel: true },
  { key: 'police', label: 'Police', tel: true },
  { key: 'fire', label: 'Fire', tel: true },
  { key: 'ambulance', label: 'Ambulance', tel: true },
  { key: 'embassy', label: 'Embassy / Consulate', tel: false },
  { key: 'hotel', label: 'Hotel', tel: false },
  { key: 'contact', label: 'Emergency contact', tel: false },
];

const BUDGET_ICON_BY_NAME = {
  flights: Plane, hotels: BedDouble, food: Utensils, transportation: Car,
  activities: Camera, shopping: ShoppingBag, other: MoreHorizontal,
};
export const budgetIcon = (name) => BUDGET_ICON_BY_NAME[String(name).trim().toLowerCase()] || Tag;

export const DEFAULT_BUDGET_NAMES = ['Flights', 'Hotels', 'Food', 'Transportation', 'Activities', 'Shopping', 'Other'];

export const DEFAULT_PACKING = [
  ['Documents & Essentials', ['Passport', 'Wallet', "Driver's license", 'Travel insurance', 'Boarding passes', 'Phone', 'Charger', 'Power bank']],
  ['Clothing', ['Tops', 'Bottoms', 'Dresses', 'Underwear', 'Socks', 'Pajamas', 'Jacket', 'Comfortable shoes', 'Sandals']],
  ['Toiletries', ['Toothbrush', 'Toothpaste', 'Skincare', 'Shampoo', 'Conditioner', 'Makeup', 'Hairbrush', 'Sunscreen']],
  ['Tech', ['Laptop', 'Laptop charger', 'Camera', 'Camera charger', 'Headphones']],
  ['Other', ['Sunglasses', 'Water bottle', 'Travel bag']],
];

export const DEFAULT_SETTINGS = {
  theme: 'light',
  currency: 'USD',
  weekStartsMonday: false,
  showCountdown: true,
  autoSave: true,
};
