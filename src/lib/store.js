/**
 * store — "database" lokal berbasis localStorage (atau storage apa pun).
 * Best practice:
 *  - factory `createStore(storage)` agar bisa diuji tanpa browser,
 *  - fungsi murni untuk normalisasi,
 *  - satu kunci JSON `mathlab_db_v1` + migrasi dari kunci lama `mtk_*`.
 */

export const STORE_KEY = "mathlab_db_v1";
export const LEVELS = ["mudah", "sedang", "sulit"];
export const QUIZ_KBS = ["kb1", "kb2", "kb3", "kb4"];
export const ALL_KBS = ["kb1", "kb2", "kb3", "kb4"];
export const KB_NAMES = {
  kb1: "KB1 Fungsi Linear",
  kb2: "KB2 Fungsi Kuadrat",
  kb3: "KB3 Komposisi & Invers",
  kb4: "KB4 Program Linear",
};

const clone = (o) => JSON.parse(JSON.stringify(o));

export function defaults() {
  return {
    ver: 1,
    profile: { nama: "Siswa Kelas X", kelas: "X" },
    quiz: {},
    materi: {},
  };
}

function blankLevel() {
  return { best: null, attempts: 0, last: null, history: [] };
}

function normLevel(l) {
  l = l && typeof l === "object" ? l : {};
  return {
    best:
      typeof l.best === "number" && isFinite(l.best)
        ? Math.min(100, Math.max(0, Math.floor(l.best)))
        : null,
    attempts:
      typeof l.attempts === "number" && l.attempts > 0
        ? Math.floor(l.attempts)
        : 0,
    last: typeof l.last === "string" ? l.last : null,
    history: Array.isArray(l.history) ? l.history.slice(0, 10) : [],
  };
}

export function initials(nama) {
  const w = String(nama || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return w.map((x) => x.charAt(0).toUpperCase()).join("") || "S";
}

function memoryStorage() {
  const data = {};
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

export function safeStorage() {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* abaikan */
  }
  return memoryStorage();
}

/** Factory utama — dipanggil sekali di ProgressProvider. */
export function createStore(storage = safeStorage()) {
  let broken = false;
  let db = load();

  function ensureLevelOn(doc, kb, lv) {
    if (!doc.quiz[kb]) doc.quiz[kb] = {};
    if (!doc.quiz[kb][lv]) doc.quiz[kb][lv] = blankLevel();
    doc.quiz[kb][lv] = normLevel(doc.quiz[kb][lv]);
    return doc.quiz[kb][lv];
  }

  function migrateLegacy() {
    let moved = false;
    const seed = defaults();
    try {
      QUIZ_KBS.forEach((kb) => {
        LEVELS.forEach((lv) => {
          const raw = storage.getItem(`mtk_${kb}_${lv}`);
          if (raw != null) {
            const n = Number(raw);
            if (!isNaN(n)) {
              ensureLevelOn(seed, kb, lv).best = n;
              moved = true;
            }
            storage.removeItem(`mtk_${kb}_${lv}`);
          }
        });
      });
    } catch {
      /* best-effort */
    }
    return moved ? seed : null;
  }

  function load() {
    try {
      const raw = storage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        const base = defaults();
        if (d && typeof d === "object") {
          base.profile = {
            ...base.profile,
            ...(d.profile && typeof d.profile === "object" ? d.profile : {}),
          };
          base.profile.nama =
            String(base.profile.nama || "Siswa Kelas X").trim() ||
            "Siswa Kelas X";
          base.profile.kelas =
            String(base.profile.kelas || "X").trim() || "X";
          if (d.quiz && typeof d.quiz === "object") base.quiz = d.quiz;
          if (d.materi && typeof d.materi === "object") base.materi = d.materi;
          QUIZ_KBS.forEach((kb) => {
            LEVELS.forEach((lv) => {
              if (base.quiz[kb]) base.quiz[kb][lv] = normLevel(base.quiz[kb][lv]);
            });
          });
          base.ver = 1;
          return base;
        }
      }
      const migrated = migrateLegacy();
      if (migrated) {
        try {
          storage.setItem(STORE_KEY, JSON.stringify(migrated));
        } catch {
          /* abaikan */
        }
        return migrated;
      }
      return defaults();
    } catch {
      broken = true;
      return defaults();
    }
  }

  function save() {
    if (broken) return false;
    try {
      storage.setItem(STORE_KEY, JSON.stringify(db));
      return true;
    } catch {
      broken = true;
      return false;
    }
  }

  function ensureLevel(kb, lv) {
    if (!db.quiz[kb]) db.quiz[kb] = {};
    if (!db.quiz[kb][lv]) db.quiz[kb][lv] = blankLevel();
    db.quiz[kb][lv] = normLevel(db.quiz[kb][lv]);
    return db.quiz[kb][lv];
  }

  function materiOpenedCount() {
    return ALL_KBS.filter((kb) => db.materi[kb] && db.materi[kb].visited)
      .length;
  }

  const api = {
    LEVELS,
    QUIZ_KBS,
    ALL_KBS,
    KB_NAMES,

    storageOK() {
      if (broken) return false;
      try {
        storage.setItem("__mlt", "1");
        storage.removeItem("__mlt");
        return true;
      } catch {
        broken = true;
        return false;
      }
    },

    profile() {
      return clone(db.profile);
    },
    setProfile(p = {}) {
      const nama = String(p.nama ?? db.profile.nama).trim();
      const kelas = String(p.kelas ?? db.profile.kelas).trim();
      db.profile = { nama: nama || "Siswa Kelas X", kelas: kelas || "X" };
      return save();
    },

    best(kb, lv) {
      const q = db.quiz[kb];
      return q && q[lv] && typeof q[lv].best === "number" ? q[lv].best : null;
    },
    attempts(kb, lv) {
      const q = db.quiz[kb];
      return q && q[lv] ? q[lv].attempts : 0;
    },
    levelRecord(kb, lv) {
      const q = db.quiz[kb];
      return clone(q && q[lv] ? normLevel(q[lv]) : blankLevel());
    },
    recordQuiz(kb, lv, pct) {
      const q = ensureLevel(kb, lv);
      const prev = q.best;
      const improved = prev == null || pct > prev;
      if (improved) q.best = pct;
      q.attempts += 1;
      q.last = new Date().toISOString();
      q.history.unshift({ pct, at: q.last });
      q.history = q.history.slice(0, 10);
      const saved = save();
      return { prev, best: q.best, improved, attempts: q.attempts, saved };
    },

    materi(kb) {
      const m = db.materi[kb];
      return { visited: (m && m.visited) || null, opens: (m && m.opens) || 0 };
    },
    markMateri(kb) {
      if (ALL_KBS.indexOf(kb) < 0) return false;
      const m = db.materi[kb] || { visited: null, opens: 0 };
      m.opens = (m.opens || 0) + 1;
      if (!m.visited) m.visited = new Date().toISOString();
      db.materi[kb] = m;
      return save();
    },
    materiOpenedCount,

    summary() {
      let quizLevelsDone = 0;
      let totalBest = 0;
      const slots = QUIZ_KBS.length * LEVELS.length;
      let sumBest = 0;
      const perKB = {};
      QUIZ_KBS.forEach((kb) => {
        let done = 0;
        let sum = 0;
        LEVELS.forEach((lv) => {
          const b =
            db.quiz[kb] && db.quiz[kb][lv] ? db.quiz[kb][lv].best : null;
          if (b != null) {
            quizLevelsDone++;
            done++;
            totalBest += b;
            sum += b;
            sumBest += b;
          }
        });
        perKB[kb] = {
          avg: done ? Math.round(sum / done) : 0,
          done,
          visited: !!(db.materi[kb] && db.materi[kb].visited),
        };
      });
      ALL_KBS.forEach((kb) => {
        perKB[kb] = perKB[kb] || {};
        perKB[kb].visited = !!(db.materi[kb] && db.materi[kb].visited);
        perKB[kb].opens = (db.materi[kb] && db.materi[kb].opens) || 0;
      });
      return {
        quizLevelsDone,
        totalLevels: slots,
        totalBest,
        progress: slots ? Math.round(sumBest / slots) : 0,
        materiOpened: materiOpenedCount(),
        materiTotal: ALL_KBS.length,
        perKB,
      };
    },

    resetScores() {
      db.quiz = {};
      db.materi = {};
      return save();
    },
    exportJSON() {
      return JSON.stringify(db, null, 2);
    },
    importJSON(str) {
      try {
        const d = JSON.parse(str);
        if (!d || typeof d !== "object" || !d.profile) return false;
        const base = defaults();
        base.profile = {
          ...base.profile,
          nama:
            String(d.profile.nama || "Siswa Kelas X").trim() ||
            "Siswa Kelas X",
          kelas: String(d.profile.kelas || "X").trim() || "X",
        };
        if (d.quiz && typeof d.quiz === "object") base.quiz = d.quiz;
        if (d.materi && typeof d.materi === "object") base.materi = d.materi;
        QUIZ_KBS.forEach((kb) => {
          LEVELS.forEach((lv) => {
            if (base.quiz[kb]) base.quiz[kb][lv] = normLevel(base.quiz[kb][lv]);
          });
        });
        db = base;
        return save();
      } catch {
        return false;
      }
    },
  };

  return api;
}

export default createStore;
