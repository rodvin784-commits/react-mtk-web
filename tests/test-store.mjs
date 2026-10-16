/* Uji unit store React (jalankan: npm test / node tests/test-store.mjs) */
import { createStore, initials } from "../src/lib/store.js";

let pass = 0;
let fail = 0;
function ok(cond, msg) {
  if (cond) pass++;
  else {
    fail++;
    console.log("  GAGAL:", msg);
  }
}

function stubStorage(seed = {}) {
  const data = { ...seed };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
    _data: data,
  };
}

/* 1) default baru */
let S = createStore(stubStorage());
ok(S.storageOK() === true, "storageOK harus true");
ok(S.profile().nama === "Siswa Kelas X", "nama default");
ok(S.best("kb3", "mudah") === null, "best awal null");
ok(S.attempts("kb3", "mudah") === 0, "attempts awal 0");
ok(S.materi("kb1").visited === null, "materi awal belum dikunjungi");
let sum = S.summary();
ok(sum.quizLevelsDone === 0 && sum.totalBest === 0 && sum.progress === 0, "ringkasan awal nol");
ok(sum.materiOpened === 0 && sum.materiTotal === 4, "materiOpened 0 dari 4");
ok(sum.totalLevels === 12, "total 4 KB x 3 level = 12");

/* 2-4) recordQuiz naik/turun */
let r = S.recordQuiz("kb3", "mudah", 80);
ok(r.best === 80 && r.attempts === 1 && r.saved === true, "percobaan 1 best 80");
r = S.recordQuiz("kb3", "mudah", 40);
ok(r.best === 80 && r.attempts === 2, "skor rendah: best bertahan 80");
r = S.recordQuiz("kb3", "mudah", 100);
ok(r.best === 100 && r.attempts === 3, "skor tinggi: best naik 100");

/* 5) gating: sedang terbuka jika mudah >= 60 */
ok(S.best("kb3", "mudah") >= 60, "mudah >= 60 → sedang terbuka");
ok(S.best("kb3", "sedang") === null, "sedang masih null");

/* 6) materi */
S.markMateri("kb1");
S.markMateri("kb1");
S.markMateri("kb2");
ok(S.materi("kb1").opens === 2 && !!S.materi("kb1").visited, "kb1 dibuka 2x");
ok(S.markMateri("kb9") === false, "kb di luar daftar ditolak");

/* 7) summary */
sum = S.summary();
ok(sum.quizLevelsDone === 1, "1 level selesai");
ok(sum.totalBest === 100 && sum.progress === Math.round(100 / 12), "progress = round(100/12)");
ok(sum.perKB.kb3.avg === 100 && sum.perKB.kb3.done === 1, "perKB kb3 avg 100");

/* 8) persistensi */
const shared = stubStorage();
let A = createStore(shared);
A.recordQuiz("kb1", "mudah", 90);
let B = createStore(shared);
ok(B.best("kb1", "mudah") === 90, "data bertahan antar sesi");

/* 9) profil + inisial */
A.setProfile({ nama: "Vin Rumere", kelas: "X-1" });
ok(initials("Vin Rumere") === "VR", "inisial VR");
ok(A.profile().nama === "Vin Rumere", "profil tersimpan");
A.setProfile({ nama: "   ", kelas: "" });
ok(A.profile().nama === "Siswa Kelas X", "kosong → fallback");

/* 10) reset */
A.setProfile({ nama: "Vin Rumere", kelas: "X-1" });
ok(A.resetScores() === true, "resetScores sukses");
ok(A.best("kb1", "mudah") === null, "skor terhapus");
ok(A.profile().nama === "Vin Rumere", "profil tetap");

/* 11) migrasi mtk_* */
const legacy = stubStorage({ mtk_kb3_mudah: "70", mtk_kb3_sedang: "60" });
S = createStore(legacy);
ok(S.best("kb3", "mudah") === 70, "migrasi kb3 mudah 70");
ok(legacy._data.mtk_kb3_mudah === undefined, "kunci lama dihapus");

/* 12) export/import */
S = createStore(stubStorage());
S.recordQuiz("kb3", "mudah", 90);
S.setProfile({ nama: "Budi", kelas: "XI" });
const json = S.exportJSON();
S = createStore(stubStorage());
ok(S.importJSON(json) === true, "impor valid");
ok(S.best("kb3", "mudah") === 90 && S.profile().nama === "Budi", "data pulih");
ok(S.importJSON("{rusak") === false, "JSON rusak ditolak");
ok(S.importJSON('{"halo":1}') === false, "tanpa profil ditolak");

/* 13) storage rusak */
const broken = {
  getItem: () => {
    throw new Error("x");
  },
  setItem: () => {
    throw new Error("x");
  },
  removeItem: () => {
    throw new Error("x");
  },
};
S = createStore(broken);
ok(S.storageOK() === false, "storageOK false saat rusak");
ok(S.recordQuiz("kb3", "mudah", 50).saved === false, "tandai gagal simpan");

console.log(`\nHasil: ${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
