import type { FoodSource } from '../lib/calc';

export interface Portion { label: string; g: number }
export interface Food {
  id: string;
  name: string;
  cat: string;
  /** per 100 g, as eaten (matang kecuali disebut) */
  kcal: number; p: number; c: number; f: number;
  state?: 'matang' | 'mentah' | 'siap saji';
  portions: Portion[];
  source: FoodSource;
  keywords?: string;
}

/**
 * Starter pack — nilai PERKIRAAN per 100 g dari referensi umum komposisi pangan.
 * Wajib ditinjau ahli gizi sebelum rilis publik (PRD §19 #2). Masakan campuran = estimasi.
 */
const P = {
  centong: (g = 100): Portion => ({ label: '1 centong', g }),
  porsi: (g: number): Portion => ({ label: '1 porsi', g }),
  potong: (g: number): Portion => ({ label: '1 potong', g }),
  butir: (g: number): Portion => ({ label: '1 butir', g }),
  gelas: (g = 250): Portion => ({ label: '1 gelas', g }),
  sdm: (g = 15): Portion => ({ label: '1 sdm', g }),
  mangkok: (g: number): Portion => ({ label: '1 mangkok', g }),
  bungkus: (g: number): Portion => ({ label: '1 bungkus', g }),
};

export const FOODS: Food[] = [
  { id: 'nasi-putih', name: 'Nasi putih', cat: 'Nasi & karbo', kcal: 130, p: 2.7, c: 28.2, f: 0.3, state: 'matang', portions: [P.centong(100), { label: '1 piring', g: 200 }, { label: '½ porsi', g: 75 }], source: 'curated', keywords: 'rice' },
  { id: 'nasi-merah', name: 'Nasi merah', cat: 'Nasi & karbo', kcal: 110, p: 2.6, c: 23, f: 0.9, state: 'matang', portions: [P.centong(100), { label: '1 piring', g: 200 }], source: 'curated', keywords: 'brown rice' },
  { id: 'kentang-rebus', name: 'Kentang rebus', cat: 'Nasi & karbo', kcal: 87, p: 1.9, c: 20, f: 0.1, state: 'matang', portions: [P.butir(150)], source: 'curated' },
  { id: 'ubi-rebus', name: 'Ubi rebus', cat: 'Nasi & karbo', kcal: 86, p: 1.6, c: 20, f: 0.1, state: 'matang', portions: [P.potong(100)], source: 'curated' },
  { id: 'oat', name: 'Oatmeal', cat: 'Nasi & karbo', kcal: 379, p: 13, c: 67, f: 6.5, state: 'mentah', portions: [{ label: '4 sdm', g: 40 }], source: 'curated' },
  { id: 'roti-tawar', name: 'Roti tawar', cat: 'Nasi & karbo', kcal: 265, p: 9, c: 49, f: 3.2, portions: [{ label: '1 lembar', g: 30 }], source: 'curated', keywords: 'bread' },
  { id: 'mi-instan', name: 'Mi instan goreng', cat: 'Mi', kcal: 460, p: 9, c: 60, f: 20, state: 'siap saji', portions: [P.bungkus(85)], source: 'curated', keywords: 'indomie mie' },
  { id: 'mi-ayam', name: 'Mi ayam', cat: 'Mi', kcal: 150, p: 7, c: 20, f: 4.5, state: 'siap saji', portions: [P.mangkok(350)], source: 'estimate', keywords: 'mie' },

  { id: 'dada-ayam', name: 'Dada ayam tanpa kulit (panggang)', cat: 'Lauk', kcal: 165, p: 31, c: 0, f: 3.6, state: 'matang', portions: [P.potong(100), { label: '½ dada', g: 120 }], source: 'curated', keywords: 'chicken breast' },
  { id: 'paha-ayam', name: 'Paha ayam goreng', cat: 'Lauk', kcal: 260, p: 24, c: 4, f: 16, state: 'matang', portions: [P.potong(90)], source: 'curated', keywords: 'chicken' },
  { id: 'ayam-geprek', name: 'Ayam geprek', cat: 'Lauk', kcal: 280, p: 19, c: 13, f: 17, state: 'siap saji', portions: [P.porsi(180)], source: 'estimate' },
  { id: 'telur-rebus', name: 'Telur rebus', cat: 'Lauk', kcal: 155, p: 12.6, c: 1.1, f: 10.6, state: 'matang', portions: [P.butir(55)], source: 'curated', keywords: 'egg' },
  { id: 'telur-dadar', name: 'Telur dadar', cat: 'Lauk', kcal: 196, p: 13.6, c: 0.8, f: 15, state: 'matang', portions: [P.butir(65)], source: 'curated', keywords: 'egg omelet' },
  { id: 'tempe-goreng', name: 'Tempe goreng', cat: 'Lauk', kcal: 280, p: 18, c: 12, f: 18, state: 'matang', portions: [P.potong(25)], source: 'curated' },
  { id: 'tempe-bacem', name: 'Tempe bacem', cat: 'Lauk', kcal: 210, p: 16, c: 18, f: 8, state: 'matang', portions: [P.potong(30)], source: 'estimate' },
  { id: 'tahu-goreng', name: 'Tahu goreng', cat: 'Lauk', kcal: 200, p: 12, c: 6, f: 14, state: 'matang', portions: [P.potong(40)], source: 'curated' },
  { id: 'ikan-bakar', name: 'Ikan bakar (nila)', cat: 'Lauk', kcal: 130, p: 26, c: 0, f: 2.7, state: 'matang', portions: [P.potong(120)], source: 'curated', keywords: 'fish' },
  { id: 'lele-goreng', name: 'Lele goreng', cat: 'Lauk', kcal: 240, p: 18, c: 6, f: 16, state: 'matang', portions: [P.potong(100)], source: 'estimate' },
  { id: 'rendang', name: 'Rendang sapi', cat: 'Lauk', kcal: 195, p: 20, c: 5, f: 11, state: 'siap saji', portions: [P.potong(60)], source: 'estimate', keywords: 'padang' },

  { id: 'nasi-padang', name: 'Nasi padang (nasi + rendang + sayur)', cat: 'Siap saji', kcal: 180, p: 7, c: 22, f: 7, state: 'siap saji', portions: [P.bungkus(400)], source: 'estimate' },
  { id: 'warteg', name: 'Nasi warteg (nasi + 2 lauk + sayur)', cat: 'Siap saji', kcal: 160, p: 6, c: 22, f: 5.5, state: 'siap saji', portions: [P.porsi(380)], source: 'estimate' },
  { id: 'nasi-goreng', name: 'Nasi goreng', cat: 'Siap saji', kcal: 175, p: 5.5, c: 24, f: 6.5, state: 'siap saji', portions: [P.porsi(300)], source: 'estimate', keywords: 'fried rice' },
  { id: 'soto-ayam', name: 'Soto ayam (tanpa nasi)', cat: 'Siap saji', kcal: 60, p: 5, c: 3, f: 3, state: 'siap saji', portions: [P.mangkok(350)], source: 'estimate' },
  { id: 'bakso', name: 'Bakso kuah (tanpa mi)', cat: 'Siap saji', kcal: 80, p: 5, c: 6, f: 4, state: 'siap saji', portions: [P.mangkok(350)], source: 'estimate', keywords: 'meatball' },
  { id: 'gado-gado', name: 'Gado-gado', cat: 'Siap saji', kcal: 140, p: 6, c: 12, f: 8, state: 'siap saji', portions: [P.porsi(300)], source: 'estimate' },
  { id: 'sate-ayam', name: 'Sate ayam + bumbu kacang', cat: 'Siap saji', kcal: 225, p: 18, c: 8, f: 13, state: 'siap saji', portions: [{ label: '10 tusuk', g: 150 }], source: 'estimate' },

  { id: 'sayur-bayam', name: 'Sayur bening bayam', cat: 'Sayur & buah', kcal: 25, p: 1.5, c: 3.5, f: 0.3, state: 'matang', portions: [P.mangkok(150)], source: 'curated' },
  { id: 'capcay', name: 'Capcay', cat: 'Sayur & buah', kcal: 70, p: 3, c: 6, f: 4, state: 'matang', portions: [P.porsi(200)], source: 'estimate' },
  { id: 'pisang', name: 'Pisang', cat: 'Sayur & buah', kcal: 89, p: 1.1, c: 23, f: 0.3, portions: [P.butir(100)], source: 'curated', keywords: 'banana' },
  { id: 'apel', name: 'Apel', cat: 'Sayur & buah', kcal: 52, p: 0.3, c: 14, f: 0.2, portions: [P.butir(150)], source: 'curated' },

  { id: 'sambal', name: 'Sambal', cat: 'Tambahan', kcal: 70, p: 1.5, c: 8, f: 3.5, portions: [P.sdm(15)], source: 'estimate' },
  { id: 'minyak', name: 'Minyak goreng', cat: 'Tambahan', kcal: 884, p: 0, c: 0, f: 100, portions: [{ label: '1 sdt', g: 5 }, P.sdm(13)], source: 'curated', keywords: 'oil' },
  { id: 'kecap', name: 'Kecap manis', cat: 'Tambahan', kcal: 270, p: 3, c: 63, f: 0.5, portions: [P.sdm(18)], source: 'curated' },
  { id: 'kerupuk', name: 'Kerupuk', cat: 'Tambahan', kcal: 480, p: 2, c: 70, f: 22, portions: [{ label: '1 keping', g: 10 }], source: 'estimate' },

  { id: 'es-teh', name: 'Es teh manis', cat: 'Minuman', kcal: 32, p: 0, c: 8, f: 0, portions: [P.gelas(300)], source: 'estimate', keywords: 'tea' },
  { id: 'kopi-susu', name: 'Es kopi susu gula aren', cat: 'Minuman', kcal: 70, p: 1.5, c: 11, f: 2.3, portions: [{ label: '1 cup', g: 250 }], source: 'estimate', keywords: 'coffee' },
  { id: 'susu-uht', name: 'Susu UHT full cream', cat: 'Minuman', kcal: 61, p: 3.2, c: 4.8, f: 3.3, portions: [{ label: '1 kotak', g: 200 }], source: 'curated', keywords: 'milk' },
  { id: 'whey', name: 'Whey protein', cat: 'Minuman', kcal: 380, p: 75, c: 10, f: 5, portions: [{ label: '1 scoop', g: 30 }], source: 'estimate', keywords: 'protein shake' },
];

export const SOURCE_LABEL: Record<FoodSource, string> = {
  curated: 'Database kurasi',
  label: 'Label kemasan',
  user: 'Dibuat sendiri',
  estimate: 'Estimasi kasar',
};

export function searchFoods(q: string, extra: Food[] = []): Food[] {
  const s = q.trim().toLowerCase();
  const all = [...extra, ...FOODS];
  if (!s) return all;
  const terms = s.split(/\s+/);
  return all
    .map((f) => {
      const hay = `${f.name} ${f.cat} ${f.keywords ?? ''}`.toLowerCase();
      const ok = terms.every((t) => hay.includes(t));
      const score = f.name.toLowerCase().startsWith(s) ? 0 : 1;
      return { f, ok, score };
    })
    .filter((x) => x.ok)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.f);
}
