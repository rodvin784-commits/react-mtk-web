import { memo, useState } from "react";
import { useParams } from "react-router-dom";
import { KB_MAP } from "../data/kbModules.js";
import { useMarkMateri } from "../hooks/useMarkMateri.js";
import PageHead from "../components/PageHead.jsx";
import GraphPlot from "../components/GraphPlot.jsx";
import Quiz from "../components/Quiz.jsx";
import CompositionCalculator from "../components/CompositionCalculator.jsx";
import Pager from "../components/Pager.jsx";
import Alert from "../components/Alert.jsx";

/** Isi contoh soal per KB (dipindah dari HTML lama ke data props). */
const CONTOH = {
  kb1: (
    <>
      <p>
        <b>Soal:</b> Diketahui f(x) = 2x + 3. Tentukan f(2), gradien, dan titik
        potong sumbu-Y.
      </p>
      <div className="mono steps">
        1. f(2) = 2×2+3 = 7. 2. Gradien = koefisien x = 2. 3. Potong sumbu-Y
        saat x = 0 → f(0) = 3 → titik (0,3).
      </div>
      <p>
        <b>Soal 2:</b> Garis melalui (1,2) bergradien 3. Persamaannya? → y−2 =
        3(x−1) → <b>y = 3x−1</b>.
      </p>
    </>
  ),
  kb2: (
    <>
      <p>
        <b>Soal:</b> Diketahui f(x) = x² − 4x + 3. Tentukan pembuat nol, sumbu
        simetri, dan titik puncak.
      </p>
      <div className="mono steps">
        1. Pembuat nol: x²−4x+3 = 0 → (x−1)(x−3) = 0 → x = 1 atau x = 3. 2.
        Sumbu simetri: x = −b/2a = 4/2 = 2. 3. Titik puncak: xp = 2 → yp =
        4−8+3 = −1 → (2,−1).
      </div>
      <p>
        <b>Soal 2:</b> f(x) = x² − 4. D = 0+16 = 16 &gt; 0 → dua nol di x = ±2,
        puncak (0,−4).
      </p>
    </>
  ),
  kb4: (
    <>
      <h3>Contoh soal (dibahas tuntas)</h3>
      <p>
        <b>Soal:</b> Maksimumkan z = 3x + 2y dengan kendala x + y ≤ 4, x ≥ 0, y
        ≥ 0.
      </p>
      <div className="mono steps">
        1. Titik sudut DHP: (0,0), (4,0), (0,4). 2. Uji z = 3x+2y: (0,0) → 0
        (4,0) → 12+0 = 12 (0,4) → 0+8 = 8 3. Maksimum 12 di titik (4,0). ⇒
        Jawaban: 12.
      </div>
    </>
  ),
};

/**
 * KBPage — satu halaman generik untuk KB1–KB4 (data-driven).
 * Best practice: hindari 4 file duplikat; bedakan lewat `kbId` + config.
 * CompositionCalculator mengirim hasilnya ke GraphPlot via state terangkat
 * (lifting state up) — contoh komunikasi antar-komponen lewat props.
 */
function KBPage({ kbId: propKbId }) {
  const { kbId: paramKbId } = useParams();
  const kbId = propKbId ?? paramKbId;
  const mod = KB_MAP[kbId];
  const [graphFormula, setGraphFormula] = useState("");

  useMarkMateri(kbId);

  if (!mod) return <Alert type="error">Modul {kbId} tidak ditemukan.</Alert>;

  // Penomoran section mengikuti halaman vanilla:
  // KB1–KB3: 4. Soal Bertingkat • KB4: 3. Soal Bertingkat (tanpa contoh terpisah).
  const quizTitle = kbId === "kb4" ? "3. Soal Bertingkat" : "4. Soal Bertingkat";

  return (
    <>
      <PageHead
        tag={mod.tag}
        tagClass={mod.tagClass}
        title={mod.title}
        crumb={mod.crumb}
      />

      <div className="card section">
        <h2>{mod.materiTitle}</h2>
        {mod.intro && (
          <p>
            <b>Definisi:</b> {mod.intro.def}
          </p>
        )}
        <ul>
          {mod.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {mod.exampleLine && <p><b>Contoh:</b> {mod.exampleLine.replace(/^Contoh:\s*/, "")}</p>}
        {CONTOH[kbId] && kbId === "kb4" && CONTOH[kbId]}
      </div>

      {mod.hasComposition && (
        <CompositionCalculator onUseResult={setGraphFormula} />
      )}

      <GraphPlot
        id="grafik"
        title={mod.graph.title}
        note={mod.graph.note}
        initial={mod.graph.initial}
        examples={mod.graph.examples}
        exampleLabels={mod.graph.labels}
        externalFormula={graphFormula}
      />

      {CONTOH[kbId] && kbId !== "kb4" && (
        <div className="card section">
          <h2>{mod.contohTitle}</h2>
          {CONTOH[kbId]}
        </div>
      )}

      <Quiz kbId={kbId} id="kuis" title={quizTitle} />

      <Pager
        prevTo={mod.prev}
        prevLabel={mod.prevLabel}
        nextTo={mod.next}
        nextLabel={mod.nextLabel}
      />
    </>
  );
}

export default memo(KBPage);
