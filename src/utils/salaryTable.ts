/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Database & Kalkulator Gaji Pokok ASN (PNS & PPPK) Terupdate 2024
 * Berdasarkan:
 * - PNS: Peraturan Pemerintah (PP) Nomor 5 Tahun 2024
 * - PPPK: Peraturan Presiden (Perpres) Nomor 11 Tahun 2024
 */

// Kamus Gaji PNS PP 5/2024 per Golongan dan Masa Kerja (MKG) dalam bentuk Tahun
const PNS_SALARY_TABLE: Record<string, Record<number, number>> = {
  "I/a": {
    0: 1685700, 2: 1738800, 4: 1793500, 6: 1850000, 8: 1908300, 10: 1968400, 12: 2030400, 14: 2094300, 16: 2160300, 18: 2228300, 20: 2298500, 22: 2370900, 24: 2445500, 26: 2522600
  },
  "I/b": {
    3: 1840800, 5: 1898800, 7: 1958600, 9: 2020300, 11: 2083900, 13: 2149600, 15: 2217300, 17: 2287100, 19: 2359100, 21: 2433400, 23: 2510100, 25: 2589100, 27: 2670700
  },
  "I/c": {
    3: 1918700, 5: 1979100, 7: 2041500, 9: 2105800, 11: 2172200, 13: 2240500, 15: 2311100, 17: 2383900, 19: 2458900, 21: 2536400, 23: 2616300, 25: 2698700, 27: 2783700
  },
  "I/d": {
    3: 1999900, 5: 2062900, 7: 2127800, 9: 2194800, 11: 2264000, 13: 2335300, 15: 2408800, 17: 2484700, 19: 2562900, 21: 2643700, 23: 2726900, 25: 2812800, 27: 2901400
  },
  "II/a": {
    0: 2184000, 1: 2218400, 3: 2288200, 5: 2360300, 7: 2434600, 9: 2511300, 11: 2590400, 13: 2672000, 15: 2756200, 17: 2843000, 19: 2932500, 21: 3024900, 23: 3120100, 25: 3218400, 27: 3319800, 29: 3424300, 31: 3532200, 33: 3643400
  },
  "II/b": {
    3: 2385000, 5: 2460100, 7: 2537600, 9: 2617500, 11: 2700000, 13: 2785000, 15: 2872700, 17: 2963200, 19: 3056500, 21: 3152800, 23: 3252100, 25: 3354500, 27: 3460200, 29: 3569200, 31: 3681600, 33: 3797500
  },
  "II/c": {
    3: 2485900, 5: 2564200, 7: 2645000, 9: 2728300, 11: 2814200, 13: 2902800, 15: 2994300, 17: 3088600, 19: 3185800, 21: 3286200, 23: 3389700, 25: 3496400, 27: 3606500, 29: 3720100, 31: 3837300, 33: 3958200
  },
  "II/d": {
    3: 2591100, 5: 2672700, 7: 2756800, 9: 2843700, 11: 2933200, 13: 3025600, 15: 3120900, 17: 3219200, 19: 3320600, 21: 3425200, 23: 3533100, 25: 3644300, 27: 3759100, 29: 3877500, 31: 3999600, 33: 4125600
  },
  "III/a": {
    0: 2785700, 2: 2873500, 4: 2964000, 6: 3057300, 8: 3153600, 10: 3252900, 12: 3355400, 14: 3461100, 16: 3570100, 18: 3682500, 20: 3798500, 22: 3918100, 24: 4041500, 26: 4168800, 28: 4300100, 30: 4435500, 32: 4575200
  },
  "III/b": {
    0: 2903600, 2: 2995000, 4: 3089300, 6: 3186600, 8: 3287000, 10: 3390500, 12: 3497300, 14: 3607500, 16: 3721100, 18: 3838300, 20: 3959200, 22: 4083900, 24: 4212500, 26: 4345100, 28: 4482000, 30: 4623200, 32: 4768800
  },
  "III/c": {
    0: 3026400, 2: 3121700, 4: 3220000, 6: 3321400, 8: 3426000, 10: 3533900, 12: 3645200, 14: 3760100, 16: 3878500, 18: 4000600, 20: 4126600, 22: 4256600, 24: 4390700, 26: 4528900, 28: 4671600, 30: 4818700, 32: 4970500
  },
  "III/d": {
    0: 3154400, 2: 3253700, 4: 3356200, 6: 3461900, 8: 3571000, 10: 3683400, 12: 3799400, 14: 3919100, 16: 4042500, 18: 4169900, 20: 4301200, 22: 4436700, 24: 4576400, 26: 4720500, 28: 4869200, 30: 5022500, 32: 5180700
  },
  "IV/a": {
    0: 3287800, 2: 3391400, 4: 3498200, 6: 3608400, 8: 3722000, 10: 3839200, 12: 3960200, 14: 4084900, 16: 4213500, 18: 4346200, 20: 4483100, 22: 4624300, 24: 4770000, 26: 4920200, 28: 5075200, 30: 5235000, 32: 5399900
  },
  "IV/b": {
    0: 3426900, 2: 3534800, 4: 3646200, 6: 3761000, 8: 3879500, 10: 4001600, 12: 4127700, 14: 4257700, 16: 4391900, 18: 4530100, 20: 4672800, 22: 4819900, 24: 4971700, 26: 5128300, 28: 5289800, 30: 5456400, 32: 5628300
  },
  "IV/c": {
    0: 3571900, 2: 3684400, 4: 3800400, 6: 3920100, 8: 4043600, 10: 4170900, 12: 4302300, 14: 4437800, 16: 4577500, 18: 4721700, 20: 4870400, 22: 5023800, 24: 5182000, 26: 5345200, 28: 5513600, 30: 5687200, 32: 5866400
  },
  "IV/d": {
    0: 3723000, 2: 3840200, 4: 3961200, 6: 4085900, 8: 4214600, 10: 4347300, 12: 4484300, 14: 4625500, 16: 4771200, 18: 4921400, 20: 5076400, 22: 5236300, 24: 5401200, 26: 5571400, 28: 5746800, 30: 5927800, 32: 6114500
  },
  "IV/e": {
    0: 3880400, 2: 4002700, 4: 4128700, 6: 4258700, 8: 4392900, 10: 4531200, 12: 4673900, 14: 4821100, 16: 4973000, 18: 5129600, 20: 5291200, 22: 5457800, 24: 5629700, 26: 5807000, 28: 5989900, 30: 6178600, 32: 6373200
  }
};

// Kamus Gaji PPPK Perpres 11/2024 per Golongan (I s.d. XVII) dan Masa Kerja dalam bentuk Tahun
const PPPK_SALARY_TABLE: Record<string, Record<number, number>> = {
  "I": { 0: 1938500, 2: 2010200, 4: 2084600, 6: 2161700, 8: 2241600, 10: 2324500, 12: 2410500, 14: 2499700, 16: 2592200, 18: 2688100, 20: 2787600, 22: 2890800, 24: 2997600, 26: 3071200, 28: 3071200, 30: 3071200, 32: 3071200 },
  "II": { 0: 2116900, 2: 2183300, 4: 2253000, 6: 2325000, 8: 2399200, 10: 2476100, 12: 2555300, 14: 2637100, 16: 2721400, 18: 2808400, 20: 2898300, 22: 2991000, 24: 3086700, 26: 3185500, 28: 3201300, 30: 3201300, 32: 3201300 },
  "III": { 0: 2206500, 2: 2276100, 4: 2348900, 6: 2424000, 8: 2501600, 10: 2581600, 12: 2664300, 14: 2749500, 16: 2837500, 18: 2928300, 20: 3022000, 22: 3118700, 24: 3218500, 26: 3321500, 28: 3336600, 30: 3336600, 32: 3336600 },
  "IV": { 0: 2299800, 2: 2372400, 4: 2447200, 6: 2525100, 8: 2605900, 10: 2689300, 12: 2775400, 14: 2864200, 16: 2955900, 18: 3050400, 20: 3148100, 22: 3248800, 24: 3352800, 26: 3460100, 28: 3460100, 30: 3460100, 32: 3460100 },
  "V": { 0: 2511500, 2: 2590700, 4: 2673200, 6: 2758150, 8: 2843500, 10: 2933900, 12: 3027800, 14: 3124700, 16: 3224700, 18: 3327900, 20: 3434400, 22: 3544300, 24: 3657700, 26: 3774800, 28: 3895500, 30: 4020200, 32: 4186500 },
  "VI": { 0: 2742800, 2: 2829300, 4: 2918400, 6: 3010300, 8: 3105100, 10: 3203000, 12: 3303800, 14: 3407900, 16: 3515300, 18: 3625900, 20: 3740100, 22: 3857900, 24: 3979400, 26: 4104700, 28: 4236000, 30: 4371400, 32: 4500000 },
  "VII": { 0: 2858800, 2: 2948700, 4: 3041500, 6: 3137400, 8: 3236350, 10: 3338300, 12: 3443400, 14: 3551900, 16: 3663800, 18: 3779200, 20: 3898200, 22: 4021000, 24: 4147600, 26: 4278300, 28: 4415100, 30: 4556400, 32: 4690000 },
  "VIII": { 3: 2979700, 5: 3073500, 7: 3170300, 9: 3270200, 11: 3373200, 13: 3479400, 15: 3589000, 17: 3702000, 19: 3818600, 21: 3938900, 23: 4063000, 25: 4190900, 27: 4322900, 29: 4459100, 31: 4599500, 33: 4744400 },
  "IX": { 0: 3203600, 2: 3304400, 4: 3408500, 6: 3515900, 8: 3636600, 10: 3740800, 12: 3858600, 14: 3980200, 16: 4105500, 18: 4234800, 20: 4368200, 22: 4505800, 24: 4647700, 26: 4794100, 28: 4945100, 30: 5100800, 32: 5261500 },
  "X": { 0: 3339100, 2: 3444200, 4: 3552700, 6: 3664600, 8: 3780000, 10: 3899100, 12: 4021900, 14: 4148500, 16: 4279200, 18: 4414000, 20: 4553000, 22: 4696400, 24: 4844300, 26: 4996900, 28: 5154200, 30: 5316600, 32: 5484000 },
  "XI": { 0: 3480300, 2: 3589900, 4: 3703000, 6: 3819600, 8: 3939900, 10: 4064000, 12: 4192000, 14: 4324100, 16: 4460300, 18: 4600800, 20: 4745700, 22: 4895100, 24: 5049300, 26: 5208300, 28: 5372400, 30: 5541600, 32: 5716100 },
  "XII": { 0: 3627500, 2: 3741700, 4: 3859600, 6: 3981100, 8: 4106500, 10: 4235800, 12: 4369200, 14: 4506800, 16: 4648700, 18: 4795100, 20: 4946100, 22: 5101800, 24: 5262500, 26: 5428200, 28: 5599200, 30: 5775500, 32: 5957500 },
  "XIII": { 0: 3781000, 2: 3900100, 4: 4022900, 6: 4149600, 8: 4280300, 10: 4415200, 12: 4554300, 14: 4697700, 16: 4845700, 18: 4998300, 20: 5155800, 22: 5318200, 24: 5485800, 26: 5658600, 28: 5836900, 30: 6020700, 32: 6208500 },
  "XIV": { 0: 3940900, 2: 4065000, 4: 4193000, 6: 4325100, 8: 4461300, 10: 4601900, 12: 4746900, 14: 4896500, 16: 5050800, 18: 5209900, 20: 5374100, 22: 5543400, 24: 5718105, 26: 5898200, 28: 6083900, 30: 6275600, 32: 6471300 },
  "XV": { 0: 4107500, 2: 4236800, 4: 4370300, 6: 4507900, 8: 4649900, 10: 4796300, 12: 4947400, 14: 5103300, 16: 5264100, 18: 5430000, 20: 5601100, 22: 5777500, 24: 5959600, 26: 6147300, 28: 6341000, 30: 6540700, 32: 6745200 },
  "XVI": { 0: 4281200, 2: 4416100, 4: 4555100, 6: 4698600, 8: 4846600, 10: 4999200, 12: 5156700, 14: 5319200, 16: 5486800, 18: 5659600, 20: 5837800, 22: 6021750, 24: 6211400, 26: 6407000, 28: 6608900, 30: 6817105, 32: 7030500 },
  "XVII": { 0: 4462500, 2: 4603100, 4: 4748100, 6: 4897700, 8: 5051900, 10: 5211100, 12: 5375300, 14: 5544700, 16: 5719400, 18: 5899600, 20: 6085400, 22: 6277100, 24: 6474900, 26: 6678800, 28: 6889205, 30: 7106300, 32: 7327900 }
};

/**
 * Ekstraksi Golongan ASN dari text input (PNS atau PPPK)
 * @param pangkatGolongan text input, e.g. "PENATA TK. I, III/d" atau "Golongan IX" atau "IX"
 * @returns { golongan: string, type: "PNS" | "PPPK" }
 */
export function parseGolonganAndType(pangkatGolongan: string): { golongan: string; type: "PNS" | "PPPK" } {
  const normalized = pangkatGolongan.trim().toUpperCase();

  // 1. Cek PNS (mengandung slash / seperti III/A, IV/B atau romawi di depannya / belakangnya)
  // Mencari segment romawi/huruf seperti "III/D", "IV/A", "II/C"
  const pnsRegex = /\b(I|II|III|IV)\/[A-E]\b/i;
  const pnsMatch = normalized.match(pnsRegex);
  if (pnsMatch) {
    // Normalisasi case, e.g. III/d -> III/d (menggunakan huruf kecil untuk d-nya demi kecocokan index)
    const rawGol = pnsMatch[0].toLowerCase(); // e.g. "iii/d"
    // Format agar sinkron dengan key PNS_SALARY_TABLE (e.g. "III/d" atau "III/a")
    const parts = rawGol.split('/');
    const cleanGol = parts[0].toUpperCase() + '/' + parts[1]; // e.g. "III/d"
    return { golongan: cleanGol, type: "PNS" };
  }

  // 2. Cek PPPK (Romawi mandiri atau bertuliskan Golongan)
  const listPPPK = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII"];
  
  // Mencari jika input persis atau ada kata khusus Romawi PPPK
  for (const r of listPPPK) {
    const pppkRegex = new RegExp(`\\b${r}\\b`);
    // Memastikan tidak berisi slash '/'
    if (pppkRegex.test(normalized) && !normalized.includes("/")) {
      return { golongan: r, type: "PPPK" };
    }
  }

  // Fallback default deteksi cerdas
  if (normalized.includes("/")) {
    return { golongan: "III/a", type: "PNS" };
  } else {
    return { golongan: "IX", type: "PPPK" };
  }
}

/**
 * Mendapatkan nilai gaji pokok berdasarkan Golongan dan Masa Kerja Golongan (MKG)
 * Berdasarkan PP 5/2024 (PNS) atau Perpres 11/2024 (PPPK)
 * 
 * @param pangkatGolongan String golongan (e.g. "III/d" atau "Penata III/c" atau "IX")
 * @param mkgTahun Masa Kerja Golongan dalam satuan tahun (misal: 12)
 * @returns nominal Rupiah gaji pokok
 */
export function getSalaryByGolonganAndMasaKerja(pangkatGolongan: string, mkgTahun: number): number {
  const { golongan, type } = parseGolonganAndType(pangkatGolongan);
  
  const table = type === "PNS" ? PNS_SALARY_TABLE : PPPK_SALARY_TABLE;
  const subTable = table[golongan];
  
  if (!subTable) {
    // Jika golongan spesifik tidak ketemu di record, beri perkiraan cerdas
    return calculateEstimatedSalary(golongan, mkgTahun, type);
  }

  // Menentukan target year key secara presisi sesuai regulasi Kenaikan Gaji Berkala (KGB)
  let targetYear = 0;
  if (type === "PNS") {
    if (golongan === "II/a") {
      if (mkgTahun <= 0) {
        targetYear = 0;
      } else {
        // maps: 1, 2 -> 1; 3, 4 -> 3; 5, 6 -> 5; etc.
        targetYear = Math.floor((mkgTahun - 1) / 2) * 2 + 1;
      }
    } else if (["I/b", "I/c", "I/d", "II/b", "II/c", "II/d"].includes(golongan)) {
      if (mkgTahun < 3) {
        targetYear = 3; // minimal masa kerja golongan ini adalah 3 tahun dalam tabel PNS
      } else {
        // maps: 3, 4 -> 3; 5, 6 -> 5; etc.
        targetYear = Math.floor((mkgTahun - 1) / 2) * 2 + 1;
      }
    } else {
      // Untuk golongan I/a, III/a s.d. IV/e
      // maps: 0, 1 -> 0; 2, 3 -> 2; 4, 5 -> 4; dll.
      targetYear = Math.floor(mkgTahun / 2) * 2;
    }
  } else {
    // PPPK
    if (golongan === "VIII" && mkgTahun < 3) {
      targetYear = 3; // Golongan VIII PPPK dimulai dari 3 tahun
    } else if (golongan === "VIII") {
      targetYear = Math.floor((mkgTahun - 1) / 2) * 2 + 1;
    } else {
      // Golongan PPPK lainnya yang dimulai dari 0 tahun (IX, X, V, dll.)
      targetYear = Math.floor(mkgTahun / 2) * 2;
    }
  }

  const keys = Object.keys(subTable).map(Number).sort((a, b) => a - b);
  const minKey = keys[0] ?? 0;
  const maxKey = keys[keys.length - 1] ?? 32;
  const closestYear = Math.max(minKey, Math.min(maxKey, targetYear));

  const salary = subTable[closestYear];
  if (salary !== undefined) {
    return salary;
  }

  // Fallback bila key tidak ditemukan
  const yearsWithSalary = [...keys].reverse(); // descending
  for (const yr of yearsWithSalary) {
    if (mkgTahun >= yr) {
      return subTable[yr];
    }
  }

  // Fallback absolut terkecil
  return subTable[minKey] || (type === "PNS" ? 2785700 : 3203600);
}

/**
 * Fungsi pembantu estimasi gaji proporsional jika golongan tidak ada di database utama
 */
function calculateEstimatedSalary(golongan: string, mkgTahun: number, type: "PNS" | "PPPK"): number {
  // Estimasi kasar pertumbuhan gaji per 2 tahun
  const baseSalary = type === "PNS" ? 2500000 : 3000000;
  const multiplier = type === "PNS" ? 85000 : 98000;
  const steps = Math.floor(mkgTahun / 2);
  return baseSalary + (steps * multiplier);
}
