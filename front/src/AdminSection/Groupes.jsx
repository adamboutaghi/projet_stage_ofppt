import React, { useState, useEffect } from "react";
import AxiosClient from "../services/AxiosClient";
import { FaSync, FaPlus, FaTimes, FaUsers } from "react-icons/fa";

export default function Groupes() {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, nom: "" });

  const [form, setForm] = useState({
    nom: "",
    filiere: ""
  });

  const [editingId, setEditingId] = useState(null);

  // Afficher une notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Charger tous les groupes
  const fetchGroupes = async () => {
    setLoading(true);
    try {
      const res = await AxiosClient.get("/groupes");
      setGroupes(res.data);
    } catch (error) {
      console.error("Erreur :", error);
      showNotification("Erreur lors du chargement des groupes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupes();
  }, []);

  // Gestion du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Ajouter ou mettre à jour un groupe
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId === null) {
        await AxiosClient.post("/groupes", form);
        showNotification("Groupe ajouté avec succès!");
      } else {
        await AxiosClient.put(`/groupes/${editingId}`, form);
        showNotification("Groupe mis à jour avec succès!");
      }

      resetForm();
      fetchGroupes();
    } catch (error) {
      console.error("Erreur enregistrement :", error);
      showNotification("Erreur lors de l'enregistrement", "error");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({ nom: "", filiere: "" });
    setEditingId(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire pour créer un nouveau groupe
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Pour éditer un groupe
  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nom: item.nom,
      filiere: item.filiere || ""
    });
    setShowForm(true);
  };

  // Ouvrir la boîte de confirmation
  const openConfirmDialog = (id, nom) => {
    setConfirmDialog({ show: true, id, nom });
  };

  // Fermer la boîte de confirmation
  const closeConfirmDialog = () => {
    setConfirmDialog({ show: false, id: null, nom: "" });
  };

  // Pour supprimer un groupe
  const handleDelete = async (id) => {
    try {
      await AxiosClient.delete(`/groupes/${id}`);
      showNotification("Groupe supprimé avec succès!");
      fetchGroupes();
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
              Êtes-vous sûr de vouloir supprimer le groupe "<span className="font-semibold">{confirmDialog.nom}</span>" ?
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
          <FaUsers />
          Gestion des Groupes
        </h2>
        
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FaPlus />
            Créer un nouveau groupe
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
            {editingId ? "Modifier le groupe" : "Créer un nouveau groupe"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-blue-800 mb-2 font-medium">Nom du groupe :</label>
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom du groupe"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Filière :</label>
                <input
                  type="text"
                  name="filiere"
                  placeholder="Filière"
                  value={form.filiere}
                  onChange={handleChange}
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
                {editingId ? "Mettre à jour" : "Créer le groupe"}
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

      {/* Section des groupes avec indicateur de chargement */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Groupes</h3>
          <button 
            onClick={fetchGroupes}
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
              Chargement des groupes...
            </div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Nom</th>
                  <th className="p-4 text-left font-semibold">Filière</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {groupes.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`${
                      index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                    } hover:bg-orange-100 transition-colors duration-150`}
                  >
                    
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.nom}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {item.filiere || "-"}
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
                          onClick={() => openConfirmDialog(item.id, item.nom)}
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

            {groupes.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-800">
                Aucun groupe disponible
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}