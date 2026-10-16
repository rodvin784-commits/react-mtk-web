import { memo } from "react";
import { Link } from "react-router-dom";
import PageHead from "../components/PageHead.jsx";

const SKILLS = ["HTML", "CSS", "JavaScript", "Math UI", "GitHub Pages"];

// ── FOTO PROFIL (hanya lewat coding, pengunjung web tidak bisa mengubah) ──
// Caranya: simpan file foto dengan nama persis "dev-photo.jpg" (atau .jpeg /
// .png / .webp) ke folder "react/src/assets/", lalu rebuild.
// Selama file belum ada, tampil inisial "VR" seperti sekarang.
const devPhotoFiles = import.meta.glob("../assets/dev-photo.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
const DEV_PHOTO_URL = Object.values(devPhotoFiles)[0] ?? null;

/** DevAvatar — foto statis dari coding, fallback inisial "VR". */
function DevAvatar() {
  if (!DEV_PHOTO_URL) return <div className="dev-avatar">VR</div>;
  return (
    <div className="dev-avatar has-photo">
      <img src={DEV_PHOTO_URL} alt="Foto Vin Rumere" />
    </div>
  );
}

const WORKS = [
  "Dashboard bertema soft dengan sidebar rapi",
  "Grafik fungsi berbasis canvas, tetap jalan saat offline",
  "Kalkulator dengan 10 bentuk komposisi",
  "Bank 60 soal dengan kunci bertingkat",
];

/** Developer — halaman profil pengembang. */
function Developer() {
  return (
    <>
      <PageHead title="Kenalan sama developer" titleClass="" crumb="Profil pengembang" />

      <div className="card section dev-card">
        <div className="dev-hero">
          <DevAvatar />
          <div>
            <h2>Vin Rumere</h2>
            <p className="sub">Siswa • Kelas XI</p>
            <p>
              Halo! Saya pengembang website pembelajaran matematika ini.
              Isinya dashboard KB 1–4, grafik fungsi offline, kalkulator
              komposisi hingga tiga tingkat (h∘g∘f), dan kuis bertingkat.
              Versi terbaru ditulis ulang dengan React, memakai component,
              props, hooks, dan context.
            </p>
            <div className="skill-tags">
              {SKILLS.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cols">
        <div className="card">
          <h3>Yang saya kerjakan</h3>
          <ul className="dev-list">
            {WORKS.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Kontak</h3>
          <div className="kontak">
            <div>
              <small>GitHub</small>
              <a href="https://github.com/vinrumere">github.com/vinrumere</a>
            </div>
            <div>
              <small>Email</small>
              <a href="mailto:vinzz.devv25@gmail.com">vinzz.devv25@gmail.com</a>
            </div>
            <div>
              <small>Sekolah</small>
              <b>SMK Bagimu Negeriku</b>
            </div>
          </div>
          <Link className="btn btn-pale" to="/">
            Lihat hasil web
          </Link>
        </div>
      </div>

      <div className="dev-pager">
        <Link className="btn ghost" to="/">
          ← Beranda
        </Link>
        <Link className="btn btn-solid" to="/kb1">
          Mulai belajar →
        </Link>
      </div>
    </>
  );
}

export default memo(Developer);
