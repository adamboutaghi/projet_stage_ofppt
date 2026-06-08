import React, { useState, useEffect } from "react";
import AxiosClient from "../services/AxiosClient";
import { FaSync, FaCalendarAlt, FaPlus, FaTimes } from "react-icons/fa";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, titre: "" });

  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "",
    date: "",
    heure: "",
    lieu: "",
    image: null
  });

  const [editingId, setEditingId] = useState(null);

  // Afficher une notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Charger tous les événements
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await AxiosClient.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Erreur :", error);
      showNotification("Erreur lors du chargement des événements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Gestion du formulaire
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Ajouter ou mettre à jour un événement
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      if (editingId === null) {
        await AxiosClient.post("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("Événement ajouté avec succès!");
      } else {
        await AxiosClient.post(`/events/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showNotification("Événement mis à jour avec succès!");
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Erreur enregistrement :", error);
      showNotification("Erreur lors de l'enregistrement", "error");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      type: "",
      date: "",
      heure: "",
      lieu: "",
      image: null
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire pour créer un nouvel événement
  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  // Pour éditer un événement
  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      titre: event.titre,
      description: event.description || "",
      type: event.type || "",
      date: event.date ? event.date.split('T')[0] : "",
      heure: event.heure || "",
      lieu: event.lieu || "",
      image: null
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

  // Pour supprimer un événement
  const handleDelete = async (id) => {
    try {
      await AxiosClient.delete(`/events/${id}`);
      showNotification("Événement supprimé avec succès!");
      fetchEvents();
      closeConfirmDialog();
    } catch (error) {
      console.error("Erreur suppression :", error);
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
              Êtes-vous sûr de vouloir supprimer l'événement "<span className="font-semibold">{confirmDialog.titre}</span>" ?
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
          <FaCalendarAlt />
          Gestion des Événements
        </h2>
        
        {!showForm && (
          <button 
            onClick={handleCreateNew}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center gap-2"
          >
            <FaPlus />
            Créer un nouvel événement
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
            {editingId ? "Modifier l'événement" : "Créer un nouvel événement"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-blue-800 mb-2 font-medium">Titre :</label>
                <input
                  type="text"
                  name="titre"
                  placeholder="Titre de l'événement"
                  value={form.titre}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-blue-800 mb-2 font-medium">Description :</label>
                <textarea
                  name="description"
                  placeholder="Description de l'événement"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Type :</label>
                <input
                  type="text"
                  name="type"
                  placeholder="Type d'événement"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Date :</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Heure :</label>
                <input
                  type="time"
                  name="heure"
                  value={form.heure}
                  onChange={handleChange}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Lieu :</label>
                <input
                  type="text"
                  name="lieu"
                  placeholder="Lieu de l'événement"
                  value={form.lieu}
                  onChange={handleChange}
                  className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-blue-800 mb-2 font-medium">Image :</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
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
                {editingId ? "Mettre à jour" : "Créer l'événement"}
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

      {/* Section des événements */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Événements</h3>
          <button 
            onClick={fetchEvents}
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
              Chargement des événements...
            </div>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">ID</th>
                  <th className="p-4 text-left font-semibold">Titre</th>
                  <th className="p-4 text-left font-semibold">Type</th>
                  <th className="p-4 text-left font-semibold">Date</th>
                  <th className="p-4 text-left font-semibold">Lieu</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event, index) => (
                  <tr 
                    key={event.id} 
                    className={`${
                      index % 2 === 0 ? 'bg-orange-50' : 'bg-white'
                    } hover:bg-orange-100 transition-colors duration-150`}
                  >
                    <td className="p-4 border-b border-orange-200 text-blue-800 font-medium">
                      {event.id}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800 font-semibold">
                      {event.titre}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {event.type || "-"}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {formatDate(event.date)}
                    </td>
                    <td className="p-4 border-b border-orange-200 text-blue-800">
                      {event.lieu || "-"}
                    </td>

                    <td className="p-4 border-b border-orange-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                        >
                          Éditer
                        </button>

                        <button
                          onClick={() => openConfirmDialog(event.id, event.titre)}
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

            {events.length === 0 && !loading && (
              <div className="text-center py-8 text-blue-800">
                Aucun événement disponible
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}