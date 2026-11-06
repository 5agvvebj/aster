export type SkyStar = {
  name: string;
  ra: number;
  dec: number;
  magnitude: number;
};

export type RashiConstellation = {
  slug: string;
  rashi: string;
  name: string;
  symbol: string;
  palette: string;
  stars: SkyStar[];
  connections: [number, number][];
};

export const zodiacConstellations: RashiConstellation[] = [
  {
    slug: "mesha", rashi: "Mesha", name: "Aries", symbol: "♈", palette: "#dcae87",
    stars: [
      { name: "Hamal", ra: 31.79, dec: 23.46, magnitude: 2.0 },
      { name: "Sheratan", ra: 28.66, dec: 20.81, magnitude: 2.6 },
      { name: "Mesarthim", ra: 28.38, dec: 19.29, magnitude: 3.9 },
    ],
    connections: [[2, 1], [1, 0]],
  },
  {
    slug: "vrishabha", rashi: "Vrishabha", name: "Taurus", symbol: "♉", palette: "#a9a46c",
    stars: [
      { name: "Aldebaran", ra: 68.98, dec: 16.51, magnitude: 0.9 },
      { name: "Elnath", ra: 81.57, dec: 28.61, magnitude: 1.7 },
      { name: "Alcyone", ra: 56.87, dec: 24.11, magnitude: 2.9 },
      { name: "Zeta Tauri", ra: 84.41, dec: 21.14, magnitude: 3.0 },
    ],
    connections: [[2, 0], [0, 3], [3, 1]],
  },
  {
    slug: "mithuna", rashi: "Mithuna", name: "Gemini", symbol: "♊", palette: "#a08bc5",
    stars: [
      { name: "Pollux", ra: 116.33, dec: 28.03, magnitude: 1.1 },
      { name: "Castor", ra: 113.65, dec: 31.89, magnitude: 1.6 },
      { name: "Alhena", ra: 99.43, dec: 16.40, magnitude: 1.9 },
      { name: "Mebsuta", ra: 100.98, dec: 25.13, magnitude: 3.1 },
    ],
    connections: [[1, 0], [0, 3], [3, 2]],
  },
  {
    slug: "karka", rashi: "Karka", name: "Cancer", symbol: "♋", palette: "#78a5a2",
    stars: [
      { name: "Acubens", ra: 134.62, dec: 11.86, magnitude: 4.3 },
      { name: "Asellus Borealis", ra: 130.82, dec: 21.47, magnitude: 4.7 },
      { name: "Asellus Australis", ra: 131.17, dec: 18.15, magnitude: 3.9 },
      { name: "Iota Cancri", ra: 131.67, dec: 28.76, magnitude: 4.0 },
    ],
    connections: [[3, 1], [1, 2], [2, 0]],
  },
  {
    slug: "simha", rashi: "Simha", name: "Leo", symbol: "♌", palette: "#c79665",
    stars: [
      { name: "Regulus", ra: 152.09, dec: 11.97, magnitude: 1.4 },
      { name: "Denebola", ra: 177.26, dec: 14.57, magnitude: 2.1 },
      { name: "Algieba", ra: 154.99, dec: 19.84, magnitude: 2.0 },
      { name: "Zosma", ra: 168.53, dec: 20.52, magnitude: 2.6 },
    ],
    connections: [[0, 2], [2, 3], [3, 1]],
  },
  {
    slug: "kanya", rashi: "Kanya", name: "Virgo", symbol: "♍", palette: "#8c9f79",
    stars: [
      { name: "Spica", ra: 201.30, dec: -11.16, magnitude: 1.0 },
      { name: "Zavijava", ra: 177.67, dec: 1.76, magnitude: 3.6 },
      { name: "Porrima", ra: 190.42, dec: -1.45, magnitude: 2.7 },
      { name: "Vindemiatrix", ra: 195.54, dec: 10.96, magnitude: 2.8 },
    ],
    connections: [[1, 3], [3, 2], [2, 0]],
  },
  {
    slug: "tula", rashi: "Tula", name: "Libra", symbol: "♎", palette: "#bb8b92",
    stars: [
      { name: "Zubeneschamali", ra: 229.25, dec: -9.38, magnitude: 2.6 },
      { name: "Zubenelgenubi", ra: 222.72, dec: -16.04, magnitude: 2.8 },
      { name: "Brachium", ra: 233.88, dec: -14.79, magnitude: 3.3 },
    ],
    connections: [[1, 0], [0, 2], [2, 1]],
  },
  {
    slug: "vrishchika", rashi: "Vrishchika", name: "Scorpius", symbol: "♏", palette: "#bd786e",
    stars: [
      { name: "Antares", ra: 247.35, dec: -26.43, magnitude: 1.1 },
      { name: "Dschubba", ra: 240.08, dec: -22.62, magnitude: 2.3 },
      { name: "Shaula", ra: 263.40, dec: -37.10, magnitude: 1.6 },
      { name: "Sargas", ra: 264.33, dec: -42.99, magnitude: 1.9 },
    ],
    connections: [[1, 0], [0, 2], [2, 3]],
  },
  {
    slug: "dhanu", rashi: "Dhanu", name: "Sagittarius", symbol: "♐", palette: "#c49566",
    stars: [
      { name: "Kaus Australis", ra: 276.04, dec: -34.38, magnitude: 1.8 },
      { name: "Nunki", ra: 283.82, dec: -26.30, magnitude: 2.0 },
      { name: "Ascella", ra: 285.65, dec: -29.88, magnitude: 2.6 },
      { name: "Kaus Media", ra: 275.25, dec: -29.83, magnitude: 2.7 },
    ],
    connections: [[0, 3], [3, 1], [1, 2]],
  },
  {
    slug: "makara", rashi: "Makara", name: "Capricornus", symbol: "♑", palette: "#7c9a9b",
    stars: [
      { name: "Deneb Algedi", ra: 326.76, dec: -16.13, magnitude: 2.9 },
      { name: "Dabih", ra: 305.25, dec: -14.78, magnitude: 3.1 },
      { name: "Nashira", ra: 325.02, dec: -16.66, magnitude: 3.7 },
      { name: "Algedi", ra: 304.51, dec: -12.54, magnitude: 3.6 },
    ],
    connections: [[3, 1], [1, 0], [0, 2]],
  },
  {
    slug: "kumbha", rashi: "Kumbha", name: "Aquarius", symbol: "♒", palette: "#7da5b3",
    stars: [
      { name: "Sadalsuud", ra: 322.89, dec: -5.57, magnitude: 2.9 },
      { name: "Sadalmelik", ra: 331.45, dec: -0.32, magnitude: 3.0 },
      { name: "Skat", ra: 342.40, dec: -15.82, magnitude: 3.3 },
      { name: "Albali", ra: 311.92, dec: -9.50, magnitude: 3.8 },
    ],
    connections: [[3, 0], [0, 1], [1, 2]],
  },
  {
    slug: "meena", rashi: "Meena", name: "Pisces", symbol: "♓", palette: "#8294bd",
    stars: [
      { name: "Alrescha", ra: 30.51, dec: 2.76, magnitude: 3.8 },
      { name: "Fumalsamakah", ra: 352.84, dec: 3.28, magnitude: 4.5 },
      { name: "Eta Piscium", ra: 22.87, dec: 15.35, magnitude: 3.6 },
    ],
    connections: [[1, 0], [0, 2]],
  },
];
