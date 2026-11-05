import type { L } from "./i18n";

/** Данные из таблицы машин «Дрифт Чирчик» (assets/index.html → CARS). v — м/с, цены — игровые доллары. */
export interface DriftCar {
  id: string;
  name: string;
  price: number;
  v: number;
  acc: number;
  grip: number;
  steer: number;
  ev?: boolean;
}

export const DRIFT_CARS: DriftCar[] = [
  { id: "damas", name: "Damas", price: 1200, v: 33, acc: 6.5, grip: 3.7, steer: 2.0 },
  { id: "matiz", name: "Matiz", price: 1500, v: 38, acc: 7.5, grip: 4.0, steer: 2.35 },
  { id: "nexia", name: "Nexia", price: 0, v: 44, acc: 9, grip: 4.2, steer: 2.1 },
  { id: "spark", name: "Spark", price: 2500, v: 42, acc: 8.5, grip: 4.2, steer: 2.3 },
  { id: "lacetti", name: "Lacetti", price: 3000, v: 50, acc: 11, grip: 4.6, steer: 2.2 },
  { id: "cobalt", name: "Cobalt", price: 4000, v: 49, acc: 10.5, grip: 4.6, steer: 2.15 },
  { id: "gentra", name: "Gentra", price: 6000, v: 54, acc: 12.5, grip: 5, steer: 2.3 },
  { id: "onix", name: "Onix", price: 7500, v: 55, acc: 13, grip: 5, steer: 2.35 },
  { id: "tracker", name: "Tracker", price: 9000, v: 52, acc: 12, grip: 5.1, steer: 2.2 },
  { id: "jolion", name: "Haval Jolion", price: 13000, v: 54, acc: 13, grip: 5.2, steer: 2.2 },
  { id: "k5", name: "Kia K5", price: 14000, v: 62, acc: 15, grip: 5.3, steer: 2.4 },
  { id: "malibu", name: "Malibu", price: 15000, v: 60, acc: 14.5, grip: 5.3, steer: 2.35 },
  { id: "tiggo", name: "Chery Tiggo 7 Pro", price: 16000, v: 55, acc: 13.5, grip: 5.2, steer: 2.25 },
  { id: "equinox", name: "Equinox", price: 18000, v: 57, acc: 14, grip: 5.3, steer: 2.25 },
  { id: "captiva", name: "Captiva", price: 20000, v: 56, acc: 13.5, grip: 5.2, steer: 2.15 },
  { id: "han", name: "BYD Han", price: 32000, v: 66, acc: 20, grip: 5.6, steer: 2.45, ev: true },
  { id: "camaro", name: "Camaro", price: 40000, v: 72, acc: 19, grip: 5.7, steer: 2.55 },
  { id: "tahoe", name: "Tahoe", price: 45000, v: 60, acc: 15, grip: 5.4, steer: 2.1 },
];

/** Максимумы по таблице — для нормировки полос. */
export const DRIFT_MAX = {
  v: Math.max(...DRIFT_CARS.map((c) => c.v)),
  acc: Math.max(...DRIFT_CARS.map((c) => c.acc)),
  grip: Math.max(...DRIFT_CARS.map((c) => c.grip)),
  steer: Math.max(...DRIFT_CARS.map((c) => c.steer)),
};

/** Дрифт-зоны на настоящих местах Чирчика; medals — очки на бронзу/серебро/золото за 60 секунд в зоне. */
export const DRIFT_ZONES: { id: string; name: L<string>; medals: [number, number, number] }[] = [
  { id: "navoi", name: { ru: "Площадь Навои", uz: "Navoiy maydoni", en: "Navoi Square" }, medals: [2500, 7000, 14000] },
  { id: "bazar", name: { ru: "Центральный рынок", uz: "Markaziy bozor", en: "Central Bazaar" }, medals: [2000, 6000, 12000] },
  { id: "mkr1", name: { ru: "1-й микрорайон", uz: "1-mavze", en: "Microdistrict 1" }, medals: [3000, 8000, 16000] },
  { id: "mkr3", name: { ru: "3-й микрорайон", uz: "3-mavze", en: "Microdistrict 3" }, medals: [3000, 8000, 16000] },
  { id: "dustlik", name: { ru: "Дустлик", uz: "Doʻstlik", en: "Dustlik" }, medals: [3000, 8500, 17000] },
  { id: "konstr", name: { ru: "Квартал Конструкторов", uz: "Konstruktorlar mahallasi", en: "Constructors’ Quarter" }, medals: [3000, 8000, 16000] },
  { id: "mkr9", name: { ru: "9-й микрорайон", uz: "9-mavze", en: "Microdistrict 9" }, medals: [3500, 9000, 18000] },
  { id: "maxam", name: { ru: "Промзона «Максам»", uz: "«Maxam» sanoat zonasi", en: "Maxam industrial zone" }, medals: [4000, 11000, 22000] },
  { id: "troitsk", name: { ru: "Троицк", uz: "Troitsk", en: "Troitsk" }, medals: [3500, 9500, 19000] },
];

export const kmh = (ms: number) => Math.round(ms * 3.6);
