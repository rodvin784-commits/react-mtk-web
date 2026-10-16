import { memo, useMemo } from "react";
import { useProgress } from "../context/ProgressContext.jsx";
import { KB_MODULES, KB_ORDER } from "../data/kbModules.js";
import WelcomeBanner from "../components/WelcomeBanner.jsx";
import StatCard from "../components/StatCard.jsx";
import KBCard from "../components/KBCard.jsx";
import QuickAccessList from "../components/QuickAccessList.jsx";

const NEXT_NAMES = {
  kb1: "Fungsi Linear",
  kb2: "Fungsi Kuadrat",
  kb3: "Komposisi dan Invers",
  kb4: "Program Linear",
};

const QUICK = [
  {
    to: "/kb3#komposisi",
    title: "Kalkulator Komposisi",
    desc: "Hitung (f+g)(x) dan (gof)(x) langkah demi langkah",
  },
  {
    to: "/kb1#grafik",
    title: "Grafik Fungsi",
    desc: "Gambar grafik tanpa internet",
  },
  {
    to: "/kb1#kuis",
    title: "Contoh Soal",
    desc: "Latihan dengan pembahasan",
  },
];

/**
 * Dashboard — beranda. Semua turunan dihitung dengan useMemo dari summary.
 * Best practice: page hanya merakit components + props, tanpa logika DOM manual.
 */
function Dashboard() {
  const { profile, summary, QUIZ_KBS, LEVELS } = useProgress();

  const progressItems = useMemo(
    () =>
      KB_ORDER.map((kb) => {
        const info = summary.perKB[kb];
        const isQuiz = QUIZ_KBS.includes(kb);
        if (isQuiz) {
          const done = info.done >= LEVELS.length;
          const prog = (info.done > 0 || info.avg > 0) && !done;
          return {
            kb,
            label: { kb1: "KB1 Fungsi Linear", kb2: "KB2 Fungsi Kuadrat", kb3: "KB3 Komposisi & Invers", kb4: "KB4 Program Linear" }[kb],
            extra: info.done
              ? ` • ${info.done}/${LEVELS.length} level`
              : " • belum dikerjakan",
            pct: info.avg,
            display: info.avg > 0 ? `${info.avg}%` : "—",
            status: done ? "done" : prog ? "prog" : "todo",
          };
        }
        return {
          kb,
          label: { kb1: "KB1 Fungsi Linear", kb2: "KB2 Fungsi Kuadrat", kb3: "KB3 Komposisi & Invers", kb4: "KB4 Program Linear" }[kb],
          extra: info.visited ? ` • dibuka ${info.opens}×` : " • belum dibuka",
          pct: info.visited ? 100 : 0,
          display: info.visited ? "✓" : "—",
          status: info.visited ? "done" : "todo",
        };
      }),
    [summary, QUIZ_KBS, LEVELS],
  );

  const { welcomeTitle, welcomeSub, welcomeTo, welcomeLabel } = useMemo(() => {
    const next =
      KB_ORDER.find((kb) => {
        const info = summary.perKB[kb];
        const isQuiz = QUIZ_KBS.includes(kb);
        return isQuiz
          ? !(info.done >= LEVELS.length)
          : !info.visited;
      }) ?? null;
    const allDone = !next;
    const first = String(profile?.nama || "").trim().split(/\s+/)[0] || "Pejuang";
    if (allDone) {
      return {
        welcomeTitle: `Halo, ${first}. Semua modul selesai.`,
        welcomeSub:
          "Pertahankan dengan mengulang kuis atau melihat profil pengembang.",
        welcomeTo: "/dev",
        welcomeLabel: "Lihat Profil",
      };
    }
    return {
      welcomeTitle: `Halo, ${first}. Lanjut ke ${NEXT_NAMES[next]}.`,
      welcomeSub:
        summary.materiOpened === 0
          ? "Belum ada modul yang dibuka. Satu modul butuh sekitar 10 menit, mulai saja dari yang pertama."
          : `Lanjutkan ke ${NEXT_NAMES[next]} — ${summary.materiOpened} dari ${summary.materiTotal} modul sudah dibuka.`,
      welcomeTo: `/${next}`,
      welcomeLabel: `Lanjut: ${NEXT_NAMES[next]}`,
    };
  }, [summary, QUIZ_KBS, LEVELS, profile]);

  const kbCards = useMemo(
    () =>
      KB_MODULES.map((m, i) => {
        const kb = KB_ORDER[i];
        const info = summary.perKB[kb];
        const isQuiz = QUIZ_KBS.includes(kb);
        const progress = isQuiz ? info.avg : info.visited ? 100 : 0;
        const statusText = isQuiz
          ? info.done
            ? `${info.done}/${LEVELS.length} level • rata-rata ${info.avg}%`
            : "Belum dikerjakan"
          : info.visited
            ? `Sudah dibuka ${info.opens}x`
            : "Belum dibuka";
        return { ...m.card, tag: `KB ${i + 1}`, tagClass: m.tagClass, progress, statusText };
      }),
    [summary, QUIZ_KBS, LEVELS],
  );

  const firstUnfinished = progressItems.findIndex((it) => it.status !== "done");
  const nextLabel =
    firstUnfinished >= 0
      ? progressItems[firstUnfinished].label.replace(/^KB\d\s*/, "")
      : null;

  return (
    <>
      <WelcomeBanner
        title={welcomeTitle}
        subtitle={welcomeSub}
        primaryTo={welcomeTo}
        primaryLabel={welcomeLabel}
      />

      <div className="steps-row">
        <div className="step">
          <span className="step-num">1</span>
          <div><b>Pelajari modul</b><span>Buka KB1 sampai KB4 berurutan.</span></div>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <div><b>Coba alat bantu</b><span>Pakai grafik dan kalkulator di tiap modul.</span></div>
        </div>
        <div className="step">
          <span className="step-num">3</span>
          <div><b>Kerjakan kuis</b><span>Mudah, sedang, sulit. Lulus 60% untuk lanjut.</span></div>
        </div>
      </div>

      <div className="stats">
        <StatCard
          label="Materi dipelajari"
          value={summary.materiOpened}
          sub={`dari ${summary.materiTotal} modul dibuka`}
        />
        <StatCard
          label="Kuis diselesaikan"
          value={summary.quizLevelsDone}
          sub={`dari ${summary.totalLevels} level kuis`}
        />
        <StatCard
          label="Kemajuan"
          value={summary.progress}
          suffix="%"
          progress={summary.progress}
        />
      </div>

      <div className="cols">
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Kemajuan belajar</h3>
              <small className="muted">
                {nextLabel
                  ? `Selesaikan ${nextLabel} untuk mengisi kemajuan pertamamu.`
                  : "Semua modul selesai. Kerja bagus!"}
              </small>
            </div>
          </div>
          <ol className="timeline">
            {progressItems.map((it, i) => (
              <li
                key={it.kb}
                className={
                  it.status === "done"
                    ? "is-done"
                    : i === firstUnfinished
                      ? "is-current"
                      : ""
                }
              >
                <span className="timeline-num">{i + 1}</span>
                <div>
                  <b>{it.label}</b>
                  <small>
                    {it.status === "done"
                      ? "Selesai"
                      : i === firstUnfinished
                        ? "Siap dimulai"
                        : "Belum dikerjakan"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Akses cepat</h3>
                <small className="muted">Alat yang paling sering dipakai.</small>
              </div>
            </div>
            <QuickAccessList items={QUICK} />
          </div>
          <div className="misi-card" style={{ marginTop: 14 }}>
            <span className="misi-badge">
              {summary.quizLevelsDone}/{summary.totalLevels}
            </span>
            <div>
              <h4>Misi minggu ini</h4>
              <p>Selesaikan kuis mudah dan sedang untuk membuka level sulit.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card section">
        <div className="card-head">
          <h3>Jelajahi Modul</h3>
          <small className="muted">4 modul belajar</small>
        </div>
        <div className="kb-grid">
          {kbCards.map((c) => (
            <KBCard key={c.title} {...c} to={c.link} linkLabel={c.linkLabel} />
          ))}
        </div>
      </div>

      <div className="card section">
        <h3>Contoh cepat dari papan tulis</h3>
        <p>
          f(x) = x+3, g(x) = 4x+5, h(x) = 3x−9 ⇒{" "}
          <code>(f∘g)(x) = 4x+8</code>, <code>(g∘f)(x) = 4x+17</code>. Coba
          di <b>kalkulator KB3</b>.
        </p>
      </div>
    </>
  );
}

export default memo(Dashboard);
