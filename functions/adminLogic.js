// Logika murni peran (tanpa Firebase) supaya mudah diuji.

/** Super Admin = punya claim `superAdmin: true` (selalu bersama `admin: true`). */
function isSuperAdmin(claims) {
  return claims?.superAdmin === true;
}

/**
 * Alasan penolakan bila peran akun target tidak boleh diubah lewat dasbor,
 * atau null bila boleh. Super Admin kebal: hanya bisa dibuat/diganti lewat
 * skrip bootstrap, tidak pernah lewat setUserRole.
 */
function roleChangeBlockReason(targetClaims) {
  return isSuperAdmin(targetClaims) ? "Super admin tidak dapat diubah." : null;
}

module.exports = { isSuperAdmin, roleChangeBlockReason };
