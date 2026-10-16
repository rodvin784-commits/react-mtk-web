/**
 * toast — helper ringan pengganti MTKShell.toast versi vanilla.
 * Memancarkan CustomEvent `mathlab:toast` yang didengar <ToastHost/>.
 * Best practice: logika UI terpusat, komponen lain cukup panggil toast().
 */
export function toast(message, type = "") {
  window.dispatchEvent(
    new CustomEvent("mathlab:toast", { detail: { message, type } }),
  );
}
