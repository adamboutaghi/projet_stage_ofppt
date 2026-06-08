import React, { useEffect, useState } from "react";
import AxiosClient from "../services/AxiosClient";
import { FaSync, FaPlus, FaTimes, FaCalendarWeek } from "react-icons/fa";

export default function Semaines() {
  const [semaines, setSemaines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, titre: "" });

  const [form, setForm] = useState({
    titre: "",
    date_debut: "",
    date_fin: ""
  });

  const [editingId, setEditingId] = useState(null);

  // Afficher une notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Charger toutes les semaines
  const fetchSemaines = async () => {
    setLoading(true);
    try {
      const res = await AxiosClient.get("/admin/semaines");
      setSemaines(res.data);
    } catch (error) {
      console.error("Erreur :", error);
      showNotification("Erreur lors du chargement des semaines", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemaines();
  }, []);

  // Gestion du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter ou mettre à jour une semaine
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId === null) {
        await AxiosClient.post("/semaines", form);
        showNotification("Semaine ajoutée avec succès!");
      } else {
        await AxiosClient.put(`/semaines/${editingId}`, form);
        showNotification("Semaine mise à jour avec succès!");
      }

      resetForm();
      fetchSemaines();
    } catch (error) {
      console.error("Erreur enregistrement :", error);
      showNotification("Erreur lors de l'enregistrement", "error");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({ titre: "", date_debut: "", date_fin: "" });
    setEditingId(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire pour créer une nouvelle semaine
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Pour éditer une semaine
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      titre: item.titre,
      date_debut: item.date_debut,
      date_fin: item.date_fin
    });
    setShowForm(true);
  };

  // Ouvrir la boîte de confirmation
  const openConfirmDialog = (id, titre) => {
    setConfirmDialog({ show: true, id, titre });
  };

  // Fermer la boîte de confirmation
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, id: null, titre: "" });
  };

  const handlePublish = async (id) => {
    try {
      await AxiosClient.post(`/semaines/${id}/publish`);
      showNotification("Emploi du temps publié — notifications envoyées !");
      fetchSemaines();
    } catch (error) {
      console.error("Erreur publication :", error);
      showNotification("Erreur lors de la publication", "error");
    }
  };

  // Pour supprimer une semaine
  const handleDelete = async (id) => {
    try {
      await AxiosClient.delete(`/semaines/${id}`);
      showNotification("Semaine supprimée avec succès!");
      fetchSemaines();
      closeConfirmDialog();
    } catch (error) {
      console.error("Erreur suppression :", error);
      showNotification("Erreur lors de la suppression", "error");
    }
  };



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
              Êtes-vous sûr de vouloir supprimer la semaine "<span className="font-semibold">{confirmDialog.titre}</span>" ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDialog.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaCalendarWeek />
          Gestion des Semaines
        </h2>
        
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FaPlus />
            Créer une nouvelle semaine
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
            {editingId ? "Modifier la semaine" : "Créer une nouvelle semaine"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-blue-800 mb-2 font-medium">Titre de la semaine :</label>
                <input
                  type="text"
                  name="titre"
                  placeholder="Titre de la semaine"
                  value={form.titre}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-800 mb-2 font-medium">Date début :</label>
                  <input
                    type="date"
                    name="date_debut"
                    value={form.date_debut}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-blue-800 mb-2 font-medium">Date fin :</label>
                  <input
                    type="date"
                    name="date_fin"
                    value={form.date_fin}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  editingId 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {editingId ? "Mettre à jour" : "Créer la semaine"}
              </button>
              
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section des semaines avec indicateur de chargement */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Semaines</h3>
          <button 
            onClick={fetchSemaines}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {loading ? <FaSync className="animate-spin" /> : <FaSync />}
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-blue-800 flex items-center gap-2">
              <FaSync className="animate-spin" />
              Chargement des semaines...
            </div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Titre</th>
                  <th className="p-4 text-left font-semibold">Date début</th>
                  <th className="p-4 text-left font-semibold">Date fin</th>
                  <th className="p-4 text-left font-semibold">Statut</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {semaines.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`${
                      index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                    } hover:bg-orange-100 transition-colors duration-150`}
                  >
                    
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.titre}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.date_debut}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.date_fin}
                    </td>
                    <td className="p-4 border-b border-orange-200">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.est_publie
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.est_publie ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                    <td className="p-4 border-b border-orange-200">
                      <div className="flex flex-wrap gap-2">
                        {!item.est_publie && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                          >
                            Publier
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          Éditer
                        </button>

                        <button
                          onClick={() => openConfirmDialog(item.id, item.titre)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                        >
                          Supprimer
                        </button>

                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {semaines.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-800">
                Aucune semaine disponible
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}