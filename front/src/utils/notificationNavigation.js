/**
 * Chemin emploi du temps selon le rôle (étudiant / enseignant).
 */
export function getSchedulePathForRole(role) {
  if (role === "enseignant") return "/enseignant/cours";
  if (role === "etudiant" || role === "user") return "/emploi";
  return null;
}

/**
 * URL complète avec semaine présélectionnée (depuis une notification).
 */
export function buildScheduleUrl(role, semaineId) {
  const base = getSchedulePathForRole(role);
  if (!base) return null;
  if (!semaineId) return base;
  return `${base}?semaine_id=${semaineId}`;
}
