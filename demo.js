import { makeTrip, emptyEmergency } from './defaults.js';
import { uid, nowISO } from '../utils/ids.js';

const act = (dayIndex, time, title, category, location, cost = 0, notes = '', reservation = '') => ({
  id: uid(), dayIndex, time, title, category, location, cost, notes, reservation,
});

export function buildDemoTrip() {
  const base = makeTrip({
    name: 'Amalfi Coast',
    destination: 'Amalfi Coast',
    country: 'Italy',
    startDate: '2027-06-12',
    endDate: '2027-06-18',
    travelers: 2,
    budget: 3240,
    currency: 'USD',
    description: 'A slow week of sea views, long lunches and boat days along the Amalfi Coast. Everything here is sample data — edit or delete anything you like.',
  });

  const activities = [
    act(0, '09:40', 'Arrive in Naples', 'Flight', 'Naples Capodichino Airport (NAP)', 0, 'Flight is saved under Bookings.'),
    act(0, '11:30', 'Private transfer to Positano', 'Transportation', 'Naples → Positano', 90, 'Driver meets us at arrivals. About 1.5 hours.'),
    act(0, '14:00', 'Hotel check-in', 'Hotel', 'Hotel Marina Positano', 0, 'Ask for a room with a sea view.'),
    act(0, '15:00', 'Lunch on the terrace', 'Food', 'Trattoria La Scogliera', 40),
    act(0, '17:30', 'Stroll down to the main beach', 'Activity', 'Spiaggia Grande, Positano', 0, 'Golden hour photos from the pier.'),
    act(0, '20:00', 'Welcome dinner', 'Food', 'Ristorante Il Belvedere', 80, 'Table booked for two.', 'Table for 2'),

    act(1, '08:30', 'Breakfast at the hotel', 'Food', 'Hotel Marina Positano', 0, 'Included in the room rate.'),
    act(1, '10:00', 'Beach day', 'Activity', 'Fornillo Beach', 45, 'Sunbeds and umbrella for two.'),
    act(1, '13:30', 'Lunch by the water', 'Food', 'Fornillo Beach', 50),
    act(1, '17:30', 'Sunset aperitivo', 'Food', 'Hotel terrace bar', 25),
    act(1, '20:30', 'Dinner in the old town', 'Food', 'Positano old town', 70),

    act(2, '09:30', 'Private boat tour', 'Activity', 'Marina Grande, Positano', 215, 'Bring swimsuits and towels. Swim stops along the coast.', 'Booking BT-2041'),
    act(2, '13:00', 'Lunch in a fishing village', 'Food', 'Nerano', 70),
    act(2, '19:30', 'Light dinner at the hotel', 'Food', 'Hotel Marina Positano', 50),

    act(3, '07:30', 'Bus to Bomerano', 'Transportation', 'Positano → Bomerano', 10, 'Start early to beat the heat.'),
    act(3, '08:30', 'Hike the Path of the Gods', 'Activity', 'Bomerano to Nocelle', 0, 'Wear real walking shoes. Bring water.'),
    act(3, '13:00', 'Lunch in Nocelle', 'Food', 'Nocelle', 35),
    act(3, '16:00', 'Ceramics shopping', 'Shopping', 'Positano', 70),
    act(3, '20:00', 'Dinner', 'Food', 'Positano', 70),

    act(4, '09:30', 'Ride up to Ravello', 'Transportation', 'Positano → Ravello', 40),
    act(4, '10:30', 'Villa Rufolo gardens', 'Activity', 'Ravello', 10),
    act(4, '13:00', 'Lunch with a view', 'Food', 'Ravello', 50),
    act(4, '15:30', 'Villa Cimbrone terrace', 'Activity', 'Ravello', 14),
    act(4, '19:30', 'Dinner in Ravello', 'Food', 'Ravello', 65, 'Reserved for two.', 'Table for 2'),

    act(5, '09:00', 'Check out and ferry to Amalfi', 'Transportation', 'Positano → Amalfi', 20),
    act(5, '10:30', 'Amalfi Cathedral and cloister', 'Activity', 'Amalfi', 6),
    act(5, '12:30', 'Lunch near the harbor', 'Food', 'Amalfi', 45),
    act(5, '15:00', 'Lemon products and paper shops', 'Shopping', 'Amalfi', 30, 'Gifts for family.'),
    act(5, '16:30', 'Hotel check-in', 'Hotel', 'Hotel Amalfi Centro', 0),
    act(5, '19:30', 'Farewell dinner', 'Food', 'Amalfi', 50),

    act(6, '08:00', 'Breakfast', 'Food', 'Hotel Amalfi Centro', 0),
    act(6, '10:00', 'Transfer to Naples airport', 'Transportation', 'Amalfi → NAP', 0, 'Included with the first transfer booking.'),
    act(6, '14:30', 'Flight home', 'Flight', 'Naples Capodichino Airport (NAP)', 0),
  ];

  const bk = (type, name, date, endDate, time, location, confirmation, provider, cost, notes = '') => ({
    id: uid(), type, name, date, endDate, time, location, provider, confirmation,
    address: '', phone: '', website: '', cost, notes,
  });
  const bookings = [
    bk('Flight', 'Outbound to Naples', '2027-06-11', '', '19:05', 'New York (JFK) → Naples (NAP)', 'WL7K92', 'Example Airlines', 430, 'Overnight flight, arrives June 12.'),
    bk('Flight', 'Return to New York', '2027-06-18', '', '14:30', 'Naples (NAP) → New York (JFK)', 'WL7K93', 'Example Airlines', 430),
    bk('Hotel', 'Hotel Marina Positano', '2027-06-12', '2027-06-17', '14:00', 'Positano', 'HMP-88214', 'Hotel Marina Positano', 790, '5 nights. Breakfast included.'),
    bk('Hotel', 'Hotel Amalfi Centro', '2027-06-17', '2027-06-18', '16:30', 'Amalfi', 'HAC-20417', 'Hotel Amalfi Centro', 250, '1 night before the flight home.'),
    bk('Activity', 'Private boat tour', '2027-06-14', '', '09:30', 'Marina Grande, Positano', 'BT-2041', 'Coastline Charters', 215, 'Deposit paid. Balance due on the day.'),
    bk('Other', 'Airport transfer to Positano', '2027-06-12', '', '11:30', 'Naples Airport', 'TR-5530', 'Amalfi Transfers', 90),
    bk('Restaurant', 'Welcome dinner', '2027-06-12', '', '20:00', 'Positano', 'Table for 2', 'Ristorante Il Belvedere', 0),
    bk('Restaurant', 'Dinner in Ravello', '2027-06-16', '', '19:30', 'Ravello', 'Table for 2', '', 0),
  ];

  const amounts = {
    Flights: [860, 860], Hotels: [1040, 1040], Food: [700, 0], Transportation: [250, 90],
    Activities: [290, 215], Shopping: [100, 0], Other: [0, 0],
  };
  const budgetCategories = base.budgetCategories.map((c) => ({
    ...c, planned: amounts[c.name][0], actual: amounts[c.name][1],
  }));

  const packed = new Set([
    'Passport', 'Wallet', 'Travel insurance', 'Phone', 'Charger', 'Tops', 'Bottoms', 'Dresses',
    'Underwear', 'Socks', 'Sandals', 'Toothbrush', 'Toothpaste', 'Sunscreen', 'Camera', 'Camera charger', 'Sunglasses',
  ]);
  const packingCategories = base.packingCategories.map((c) => ({
    ...c,
    items: [
      ...c.items.map((i) => ({ ...i, packed: packed.has(i.name) })),
      ...(c.name === 'Clothing' ? [{ id: uid(), name: 'Swimsuits', packed: true }] : []),
      ...(c.name === 'Other' ? [{ id: uid(), name: 'Sun hat', packed: false }, { id: uid(), name: 'Beach towel', packed: false }] : []),
    ],
  }));

  const pl = (name, category, location, cost, notes = '') => ({ id: uid(), name, category, location, cost, notes, visited: false });
  const places = [
    pl('Spiaggia Grande', 'Attractions', 'Positano', 'Free', 'The main beach. Go early or at sunset.'),
    pl('Fornillo Beach', 'Nature', 'Positano', 'Sunbed rental', 'Quieter than the main beach.'),
    pl('Path of the Gods', 'Nature', 'Bomerano to Nocelle', 'Free', 'About 3 hours one way. Start early.'),
    pl('Villa Rufolo', 'Attractions', 'Ravello', 'Entry fee', 'Garden terraces with famous sea views.'),
    pl('Villa Cimbrone', 'Photo Spots', 'Ravello', 'Entry fee', 'Terrace of Infinity at golden hour.'),
    pl('Amalfi Cathedral', 'Attractions', 'Amalfi', 'Small entry fee', 'Cover shoulders and knees.'),
    pl('Fiordo di Furore', 'Photo Spots', 'Furore', 'Free', 'Dramatic fjord and bridge. Good stop by boat.'),
    pl('Trattoria La Scogliera', 'Restaurants', 'Positano', '$$', 'Sample restaurant. Replace with your own pick.'),
    pl('Harbor pastry shop', 'Cafés', 'Positano', '$', 'Sample café for morning pastries and coffee.'),
    pl('Ceramics workshop', 'Shopping', 'Vietri sul Mare', 'Varies', 'Hand-painted plates and tiles.'),
    pl('Sunset terrace', 'Favorites', 'Hotel Marina Positano', '$$', 'Aperitivo with a view.'),
    pl('Evening music in the piazza', 'Entertainment', 'Ravello', 'Free', 'Check local listings before you go.'),
  ];

  const stamp = nowISO();
  const note = (title, content) => ({ id: uid(), title, content, createdAt: stamp, updatedAt: stamp });
  const notes = [
    note('Things to research', 'Ferry timetables between Positano and Amalfi.\nBest time for the Path of the Gods.\nBus tickets: where to buy them.\nWhether our hotel offers luggage storage on checkout day.'),
    note('Restaurant ideas', 'Seafood lunch near the water in Nerano.\nA cliffside dinner for our last night.\nBreakfast pastry stop before the boat tour.\nAsk the hotel which places need reservations.'),
    note('Travel tips', 'Wear comfortable shoes. Expect lots of stairs.\nCarry a little cash for small shops and buses.\nCover shoulders and knees when visiting churches.\nBook the boat tour early in the season.'),
  ];

  const documents = [
    { id: uid(), type: 'Passport', label: 'Passport number (sample)', value: 'X00000000' },
    { id: uid(), type: 'Travel insurance', label: 'Policy number (sample)', value: 'POL-000000' },
    { id: uid(), type: 'Emergency contact', label: 'Home contact (sample)', value: 'Sam Rivera, +1 555 0100' },
  ];

  const emergencyInfo = {
    ...emptyEmergency(),
    localNumber: '112',
    police: '113',
    fire: '115',
    ambulance: '118',
    embassy: 'U.S. Consulate General, Naples (add phone number)',
    hotel: 'Hotel Marina Positano (add phone number)',
    contact: 'Sam Rivera, +1 555 0100 (sample)',
  };

  return { ...base, activities, bookings, budgetCategories, packingCategories, places, notes, documents, emergencyInfo, isDemo: true };
}
