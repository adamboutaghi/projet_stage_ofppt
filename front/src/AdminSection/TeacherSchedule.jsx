import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  User,
} from "lucide-react";
import AxiosClient from "../services/AxiosClient";
import { useAuth } from "../contexts/AuthContext";
import SearchableSelect from "../Components/ui/SearchableSelect";

function TeacherSchedule() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const semaineFromUrl = searchParams.get("semaine_id");
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semaines, setSemaines] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [professeurSelectionne, setProfesseurSelectionne] = useState("");
  const [semaineId, setSemaineId] = useState("");
  const [semaineMeta, setSemaineMeta] = useState(null);
  const [initLoading, setInitLoading] = useState(true);

  const chargerFiltres = useCallback(async () => {
    setInitLoading(true);
    try {
      const res = await AxiosClient.get("/teacher/filters");
      const data = res.data || {};
      const listeProfs = data.professeurs || [];
      const listeSemaines = data.semaines || [];

      setProfesseurs(listeProfs);
      setSemaines(listeSemaines);

      const prof =
        data.default_professeur && listeProfs.includes(data.default_professeur)
          ? data.default_professeur
          : listeProfs[0] || "";

      setProfesseurSelectionne(prof);

      const urlId =
        semaineFromUrl && listeSemaines.some((s) => String(s.id) === semaineFromUrl)
          ? semaineFromUrl
          : null;

      const sid =
        urlId ||
        (data.default_semaine_id &&
        listeSemaines.some((s) => s.id === data.default_semaine_id)
          ? String(data.default_semaine_id)
          : listeSemaines[0]
          ? String(listeSemaines[0].id)
          : "");

      setSemaineId(sid);
    } catch {
      setProfesseurs([]);
      setSemaines([]);
      setProfesseurSelectionne("");
      setSemaineId("");
    } finally {
      setInitLoading(false);
    }
  }, [semaineFromUrl]);

  const chargerEmploi = useCallback(async () => {
    if (!semaineId || !professeurSelectionne) {
      setSchedule([]);
      setSemaineMeta(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await AxiosClient.get("/teacher/schedule", {
        params: {
          professeur: professeurSelectionne,
          semaine_id: semaineId,
        },
      });
      setSchedule(res.data?.schedule || []);
      setSemaineMeta(res.data?.semaine || null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
      setSchedule([]);
      setSemaineMeta(null);
    } finally {
      setLoading(false);
    }
  }, [semaineId, professeurSelectionne]);

  useEffect(() => {
    chargerFiltres();
  }, [chargerFiltres]);

  useEffect(() => {
    if (!initLoading) {
      chargerEmploi();
    }
  }, [chargerEmploi, initLoading]);

  const optionsProfesseurs = useMemo(
    () =>
      professeurs.map((nom) => ({
        value: nom,
        label: nom,
      })),
    [professeurs]
  );

  const optionsSemaines = useMemo(
    () =>
      semaines.map((s) => ({
        value: String(s.id),
        label: s.titre,
        description: `${s.date_debut} → ${s.date_fin}`,
      })),
    [semaines]
  );

  const semaineAffichee =
    semaineMeta || semaines.find((s) => String(s.id) === String(semaineId));

  if (initLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-3">
          <BookOpen className="w-4 h-4" />
          Mes cours
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">Mon emploi du temps</h1>
        <p className="text-gray-600 mt-2">
          Choisissez un enseignant et une semaine publiée — l&apos;emploi du temps se met à jour
          automatiquement.
        </p>
        {user?.name && (
          <p className="text-xs text-gray-500 mt-3">
            Connecté : <strong className="text-blue-950">{user.name}</strong>
          </p>
        )}
      </header>

      <section className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 sm:p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SearchableSelect
            label="Enseignant"
            icon={User}
            options={optionsProfesseurs}
            value={professeurSelectionne}
            onChange={setProfesseurSelectionne}
            placeholder="Rechercher un enseignant…"
            disabled={professeurs.length === 0}
            emptyMessage="Aucun enseignant dans la table des cours"
          />
          <SearchableSelect
            label="Semaine (publiée)"
            icon={Calendar}
            options={optionsSemaines}
            value={semaineId}
            onChange={setSemaineId}
            placeholder="Rechercher une semaine…"
            disabled={semaines.length === 0}
            emptyMessage="Aucune semaine publiée"
          />
        </div>

        {semaineAffichee && professeurSelectionne && (
          <div className="mt-6 pt-5 border-t border-orange-50 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-800 text-sm font-medium">
              <User className="w-4 h-4" />
              {professeurSelectionne}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-sm">
              <Calendar className="w-4 h-4" />
              {semaineAffichee.titre}
              <span className="text-blue-600/80 text-xs">
                ({semaineAffichee.date_debut} – {semaineAffichee.date_fin})
              </span>
            </span>
          </div>
        )}
      </section>

      {!professeurSelectionne && professeurs.length > 0 && (
        <div className="text-center py-10 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm mb-6">
          Sélectionnez un enseignant pour afficher son emploi du temps.
        </div>
      )}

      {loading && professeurSelectionne && semaineId && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-800 font-medium">Chargement de l&apos;emploi du temps…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!loading && !error && semaines.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-orange-100 shadow-sm">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-blue-950 font-semibold">Aucun emploi du temps publié</p>
          <p className="text-gray-500 text-sm mt-1">
            Les semaines en brouillon ne sont pas visibles ici.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        professeurSelectionne &&
        semaineId &&
        schedule.length === 0 &&
        semaines.length > 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-blue-950 font-semibold">Aucun cours cette semaine</p>
            <p className="text-gray-500 text-sm mt-1">
              Aucune séance publiée pour <strong>{professeurSelectionne}</strong>.
            </p>
          </div>
        )}

      {!loading && schedule.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-800 to-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-medium">Jour</th>
                  <th className="p-4 text-left font-medium">Heure</th>
                  <th className="p-4 text-left font-medium">Cours</th>
                  <th className="p-4 text-left font-medium">Groupe</th>
                  <th className="p-4 text-left font-medium">Salle</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((seance) => (
                  <tr
                    key={seance.id ?? `${seance.jour}-${seance.heure}-${seance.cours}`}
                    className="even:bg-orange-50/50 odd:bg-white hover:bg-orange-50 transition-colors"
                  >
                    <td className="p-4 border-b border-orange-100 font-medium text-blue-950">
                      {seance.jour}
                    </td>
                    <td className="p-4 border-b border-orange-100 text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {seance.heure}
                      </span>
                    </td>
                    <td className="p-4 border-b border-orange-100 font-medium text-blue-900">
                      {seance.cours}
                    </td>
                    <td className="p-4 border-b border-orange-100">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <Users className="w-4 h-4 text-blue-600" />
                        {seance.groupe}
                      </span>
                    </td>
                    <td className="p-4 border-b border-orange-100">
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {seance.salle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden grid grid-cols-1 gap-4">
            {schedule.map((seance) => (
              <article
                key={seance.id ?? `${seance.jour}-${seance.heure}-${seance.cours}`}
                className="bg-white rounded-2xl p-5 shadow-md border border-orange-100 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    {seance.jour}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {seance.heure}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-blue-950 mb-2">{seance.cours}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    {seance.groupe}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Salle {seance.salle}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default TeacherSchedule;
