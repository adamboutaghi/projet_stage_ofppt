import React, { useEffect, useState, useCallback } from "react";
import AxiosClient from "../services/AxiosClient";
import { 
  FaBook, 
  FaSync, 
  FaSave, 
  FaPlus, 
  FaTimes, 
  FaEdit, 
  FaTrash,
  FaChevronDown,
  FaChevronRight
} from "react-icons/fa";

export default function Seances() {
  const [seances, setSeances] = useState([]);
  const [cours, setCours] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [semaines, setSemaines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ show: false, seance: null });
  const [expandedGroupes, setExpandedGroupes] = useState({});

  const [form, setForm] = useState({
    salle: "",
    jour: 0,
    heure_debut: "",
    heure_fin: "",
    type: "cours",
    cours_id: "",
    groupe_id: "",
    semaine_id: ""
  });

  const jourLabel = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

  // Afficher une notification
  const showNotification = useCallback((message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  }, []);

  // Ouvrir/fermer un groupe
  const toggleGroupe = useCallback((groupeId) => {
    setExpandedGroupes(prev => ({
      ...prev,
      [groupeId]: !prev[groupeId]
    }));
  }, []);

  // Ouvrir tous les groupes
  const expandAll = useCallback(() => {
    const allExpanded = {};
    groupes.forEach(groupe => {
      allExpanded[groupe.id] = true;
    });
    setExpandedGroupes(allExpanded);
  }, [groupes]);

  // Fermer tous les groupes
  const collapseAll = useCallback(() => {
    setExpandedGroupes({});
  }, []);

  // Ouvrir la boîte de confirmation
  const openConfirmDialog = useCallback((seance) => {
    setConfirmDialog({ show: true, seance });
  }, []);

  // Fermer la boîte de confirmation
  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog({ show: false, seance: null });
  }, []);

  // Charger toutes les données nécessaires
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [seancesRes, coursRes, groupesRes, semainesRes] = await Promise.all([
        AxiosClient.get("/seances"),
        AxiosClient.get("/cours"),
        AxiosClient.get("/groupes"),
        AxiosClient.get("/admin/semaines")
      ]);

      setSeances(seancesRes.data);
      setCours(coursRes.data);
      setGroupes(groupesRes.data);
      setSemaines(semainesRes.data);
    } catch (err) {
      console.error("Erreur chargement données:", err);
      showNotification("Erreur lors du chargement des données", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const handleChange = useCallback((e) => {
    clearFieldError(e.target.name);
    if (e.target.name === "cours_id" || e.target.name === "heure_debut" || e.target.name === "heure_fin") {
      clearFieldError("cours_id");
    }
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, [clearFieldError]);

  const normalizeTime = useCallback((t) => {
    return t && t.length === 5 ? t : t?.slice(0,5) || "";
  }, []);

  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setForm({
      salle: "",
      jour: 0,
      heure_debut: "",
      heure_fin: "",
      type: "cours",
      cours_id: "",
      groupe_id: "",
      semaine_id: ""
    });
    setEditingId(null);
    setShowForm(false);
    setFieldErrors({});
  }, []);

  // Ouvrir le formulaire pour créer une nouvelle séance
  const handleCreateNew = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  // CREATE - Ajouter une séance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFieldErrors({});
    
    try {
      // Préparer les données avec normalisation du temps
      const payload = {
        ...form,
        heure_debut: normalizeTime(form.heure_debut),
        heure_fin: normalizeTime(form.heure_fin),
      };

      if (editingId) {
        // UPDATE - Modifier une séance
        await AxiosClient.put(`/seances/${editingId}`, payload);
        showNotification("Séance modifiée avec succès !");
      } else {
        // CREATE - Ajouter une séance
        await AxiosClient.post("/seances", payload);
        showNotification("Séance ajoutée avec succès !");
      }
      
      resetForm();
      await loadData();
    } catch (err) {
      console.error(err);
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped = {};
        Object.keys(apiErrors).forEach((key) => {
          const value = apiErrors[key];
          mapped[key] = Array.isArray(value) ? value[0] : value;
        });
        setFieldErrors(mapped);
        const firstMessage = Object.values(mapped)[0];
        showNotification(firstMessage || err.response?.data?.message || "Conflit détecté.", "error");
      } else {
        const errorMessage = err.response?.data?.message || "Erreur lors de l'opération !";
        showNotification(errorMessage, "error");
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [form, editingId, normalizeTime, showNotification, resetForm, loadData]);

  // READ - Pré-remplir le formulaire pour modification
  const handleEdit = useCallback((seance) => {
    setForm({
      salle: seance.salle || "",
      jour: seance.jour || 0,
      heure_debut: normalizeTime(seance.heure_debut) || "",
      heure_fin: normalizeTime(seance.heure_fin) || "",
      type: seance.type || "cours",
      cours_id: seance.cours_id || "",
      groupe_id: seance.groupe_id || "",
      semaine_id: seance.semaine_id || ""
    });
    setEditingId(seance.id);
    setShowForm(true);
  }, [normalizeTime]);

  // DELETE - Supprimer une séance
  const handleDelete = useCallback(async () => {
    if (!confirmDialog.seance) return;
    
    setLoading(true);
    try {
      await AxiosClient.delete(`/seances/${confirmDialog.seance.id}`);
      showNotification("Séance supprimée avec succès !");
      await loadData();
      closeConfirmDialog();
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de la suppression", "error");
    } finally {
      setLoading(false);
    }
  }, [confirmDialog.seance, showNotification, loadData, closeConfirmDialog]);

  // Grouper les séances par groupe avec useMemo pour optimiser les performances
  const seancesParGroupe = React.useMemo(() => {
    const grouped = seances.reduce((acc, seance) => {
      const groupeId = seance.groupe_id;
      if (!acc[groupeId]) {
        acc[groupeId] = {
          groupe: seance.groupe,
          seances: []
        };
      }
      acc[groupeId].seances.push(seance);
      return acc;
    }, {});

    // Trier les séances par jour et heure
    Object.keys(grouped).forEach(groupeId => {
      grouped[groupeId].seances.sort((a, b) => {
        if (a.jour !== b.jour) return a.jour - b.jour;
        return a.heure_debut.localeCompare(b.heure_debut);
      });
    });

    return grouped;
  }, [seances]);

  // Vérifier si le formulaire est valide avec useMemo
  const isFormValid = React.useMemo(() => {
    return form.cours_id && form.groupe_id && form.semaine_id && form.heure_debut && form.heure_fin;
  }, [form.cours_id, form.groupe_id, form.semaine_id, form.heure_debut, form.heure_fin]);

  const inputClass = (fieldName, base = "w-full p-3 border rounded-lg focus:outline-none focus:ring-2") => {
    const hasError = Boolean(fieldErrors[fieldName]);
    return `${base} ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-orange-300 focus:ring-orange-500"
    }`;
  };

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="mt-1 text-sm text-red-600 font-medium" role="alert">
        {fieldErrors[name]}
      </p>
    ) : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === "error" 
            ? "bg-red-500 text-white" 
            : "bg-green-500 text-white"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Boîte de confirmation */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Confirmer la suppression</h3>
            <p className="text-blue-800 mb-6">
              Êtes-vous sûr de vouloir supprimer cette séance ?
            </p>
            
            {confirmDialog.seance && (
              <div className="bg-orange-50 p-3 rounded-lg mb-4 border border-orange-200">
                <p className="font-semibold text-blue-800">
                  {jourLabel[confirmDialog.seance.jour]} - {confirmDialog.seance.heure_debut} → {confirmDialog.seance.heure_fin}
                </p>
                <p className="text-blue-700 text-sm">
                  {confirmDialog.seance.cours?.intitule} - {confirmDialog.seance.groupe?.nom}
                </p>
                <p className="text-blue-600 text-sm">
                  Salle: {confirmDialog.seance.salle || "Non définie"} | Type: {confirmDialog.seance.type}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaBook />
          Gestion des Séances
        </h2>
        
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="bg-orange-500 text-white px-4 py-2 rounded-lgorange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FaPlus />
            Créer une nouvelle séance
          </button>
        )}
      </div>

      {/* Formulaire - Seulement visible quand showForm est true */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-200 relative">
          <button 
            onClick={resetForm}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FaTimes size={20} />
          </button>

          <h3 className="text-xl font-bold text-blue-800 mb-4">
            {editingId ? "Modifier la séance" : "Créer une nouvelle séance"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-blue-800 mb-2 font-medium">Salle :</label>
                <input 
                  type="text" 
                  name="salle" 
                  value={form.salle} 
                  onChange={handleChange}
                  placeholder="Ex: A101"
                  className={inputClass("salle")}
                />
                <FieldError name="salle" />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Jour :</label>
                <select 
                  name="jour" 
                  value={form.jour} 
                  onChange={handleChange}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {jourLabel.map((j, i) => (
                    <option key={i} value={i}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Heure début :</label>
                <input 
                  type="time" 
                  name="heure_debut" 
                  value={form.heure_debut} 
                  onChange={handleChange} 
                  required
                  className={inputClass("heure_debut")}
                />
                <FieldError name="heure_debut" />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Heure fin :</label>
                <input 
                  type="time" 
                  name="heure_fin" 
                  value={form.heure_fin} 
                  onChange={handleChange} 
                  required
                  className={inputClass("heure_fin")}
                />
                <FieldError name="heure_fin" />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Type :</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="cours">Cours</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                  <option value="exam">Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Cours :</label>
                <select 
                  name="cours_id" 
                  value={form.cours_id} 
                  onChange={handleChange} 
                  required
                  className={inputClass("cours_id")}
                >
                  <option value="">-- Choisir --</option>
                  {cours.map(c => (
                    <option key={c.id} value={c.id}>{c.intitule} - {c.professeur}</option>
                  ))}
                </select>
                <FieldError name="cours_id" />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Groupe :</label>
                <select 
                  name="groupe_id" 
                  value={form.groupe_id} 
                  onChange={handleChange} 
                  required
                  className={inputClass("groupe_id")}
                >
                  <option value="">-- Choisir --</option>
                  {groupes.map(g => (
                    <option key={g.id} value={g.id}>{g.nom} -- {g.filiere}</option>
                  ))}
                </select>
                <FieldError name="groupe_id" />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Semaine :</label>
                <select 
                  name="semaine_id" 
                  value={form.semaine_id} 
                  onChange={handleChange} 
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Choisir --</option>
                  {semaines.map(s => (
                    <option key={s.id} value={s.id}>{s.titre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                disabled={submitLoading || !isFormValid}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  editingId 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {submitLoading ? (
                  <>
                    <FaSync className="animate-spin" />
                    Traitement...
                  </>
                ) : editingId ? (
                  <>
                    <FaSave />
                    Mettre à jour
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Créer la séance
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>

            {!isFormValid && (
              <div className="mt-3 text-blue-600 text-sm">
                * Remplissez tous les champs obligatoires
              </div>
            )}
          </form>
        </div>
      )}

      {/* Section des séances avec indicateur de chargement */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Séances par Groupe</h3>
          <div className="flex gap-2">
            <button 
              onClick={expandAll}
              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm flex items-center gap-2"
            >
              <FaChevronDown />
              Tout ouvrir
            </button>
            <button 
              onClick={collapseAll}
              className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm flex items-center gap-2"
            >
              <FaChevronRight />
              Tout fermer
            </button>
            <button 
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {loading ? <FaSync className="animate-spin" /> : <FaSync />}
              Actualiser
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-blue-800 flex items-center gap-2">
              <FaSync className="animate-spin" />
              Chargement des séances...
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {Object.keys(seancesParGroupe).length === 0 ? (
                <div className="text-center py-8 text-blue-800">
                  Aucune séance disponible
                </div>
              ) : (
                Object.keys(seancesParGroupe).map(groupeId => {
                  const groupeData = seancesParGroupe[groupeId];
                  const isExpanded = expandedGroupes[groupeId];
                  
                  return (
                    <div key={groupeId} className="border border-blue-200 rounded-lg overflow-hidden">
                      {/* En-tête du groupe */}
                      <div 
                        className="bg-blue-600 text-white p-4 cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                        onClick={() => toggleGroupe(groupeId)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                            <h4 className="text-lg font-bold">
                              Groupe: {groupeData.groupe?.nom || 'Groupe inconnu'}
                            </h4>
                            <span className="bg-blue-800 px-2 py-1 rounded text-sm">
                              {groupeData.seances.length} séance(s)
                            </span>
                          </div>
                          <div className="text-sm">
                            Cliquez pour {isExpanded ? 'réduire' : 'développer'}
                          </div>
                        </div>
                      </div>

                      {/* Séances du groupe */}
                      {isExpanded && (
                        <div className="bg-blue-50 p-4 space-y-3">
                          {groupeData.seances.map((seance) => (
                            <div 
                              key={seance.id} 
                              className="bg-white border border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-150"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="text-md font-bold text-blue-800">
                                    {jourLabel[seance.jour]} — {seance.heure_debut} → {seance.heure_fin}
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2 text-blue-700 text-sm">
                                    <div>
                                      <strong>Cours :</strong> {seance.cours?.intitule}
                                    </div>
                                    <div>
                                      <strong>Semaine :</strong> {seance.semaine?.titre}
                                    </div>
                                    <div>
                                      <strong>Salle :</strong> {seance.salle || "Non définie"}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                                      Type: {seance.type?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
                                  <button 
                                    onClick={() => handleEdit(seance)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center gap-1"
                                  >
                                    <FaEdit />
                                    Éditer
                                  </button>
                                  <button 
                                    onClick={() => openConfirmDialog(seance)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm flex items-center gap-1"
                                  >
                                    <FaTrash />
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}