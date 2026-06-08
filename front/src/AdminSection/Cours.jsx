import React, { useEffect, useState } from "react";
import AxiosClient from "../services/AxiosClient";
import { FaSync, FaPlus, FaTimes, FaBook } from "react-icons/fa";

export default function Cours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, intitule: "" });

  const [form, setForm] = useState({
    intitule: "",
    professeur: ""
  });

  const [editingId, setEditingId] = useState(null);

  // Afficher une notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Charger les cours
  const fetchCours = async () => {
    setLoading(true);
    try {
      const res = await AxiosClient.get("/cours");
      setCours(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
      showNotification("Erreur lors du chargement des cours", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCours();
  }, []);

  // Gestion du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter ou mettre à jour
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId === null) {
        await AxiosClient.post("/cours", form);
        showNotification("Cours ajouté avec succès!");
      } else {
        await AxiosClient.put(`/cours/${editingId}`, form);
        showNotification("Cours mis à jour avec succès!");
      }

      resetForm();
      fetchCours();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      showNotification("Erreur lors de l'enregistrement", "error");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({ intitule: "", professeur: "" });
    setEditingId(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire pour créer un nouveau cours
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Éditer un cours
  const handleEdit = (cour) => {
    setEditingId(cour.id);
    setForm({
      intitule: cour.intitule,
      professeur: cour.professeur
    });
    setShowForm(true);
  };

  // Ouvrir la boîte de confirmation
  const openConfirmDialog = (id, intitule) => {
    setConfirmDialog({ show: true, id, intitule });
  };

  // Fermer la boîte de confirmation
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, id: null, intitule: "" });
  };

  // Supprimer un cours
  const handleDelete = async (id) => {
    try {
      await AxiosClient.delete(`/cours/${id}`);
      showNotification("Cours supprimé avec succès!");
      fetchCours();
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
              Êtes-vous sûr de vouloir supprimer le cours "<span className="font-semibold">{confirmDialog.intitule}</span>" ?
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
          <FaBook />
          Gestion des Cours
        </h2>
        
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FaPlus />
            Créer un nouveau cours
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
            {editingId ? "Modifier le cours" : "Créer un nouveau cours"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-blue-800 mb-2 font-medium">Intitulé du cours :</label>
                <input
                  type="text"
                  name="intitule"
                  placeholder="Intitulé du cours"
                  value={form.intitule}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Professeur :</label>
                <input
                  type="text"
                  name="professeur"
                  placeholder="Professeur"
                  value={form.professeur}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
                {editingId ? "Mettre à jour" : "Créer le cours"}
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

      {/* Section des cours avec indicateur de chargement */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Cours</h3>
          <button 
            onClick={fetchCours}
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
              Chargement des cours...
            </div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Intitulé</th>
                  <th className="p-4 text-left font-semibold">Professeur</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {cours.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`${
                      index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                    } hover:bg-orange-100 transition-colors duration-150`}
                  >
                  
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.intitule}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.professeur}
                    </td>

                    <td className="p-4 border-b border-orange-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          Éditer
                        </button>

                        <button
                          onClick={() => openConfirmDialog(item.id, item.intitule)}
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

            {cours.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-800">
                Aucun cours disponible
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}