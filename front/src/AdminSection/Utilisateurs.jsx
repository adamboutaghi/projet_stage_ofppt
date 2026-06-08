import React, { useState, useEffect, useCallback } from "react";
import AxiosClient from "../services/AxiosClient";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaSync, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, id: null, name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "etudiant"
  });

  const [editingId, setEditingId] = useState(null);

  // Notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Charger utilisateurs
  const fetchUtilisateurs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AxiosClient.get("/users");
      setUtilisateurs(res.data);
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors du chargement des utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  // Formulaire
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const passwordsMatch = form.password === form.password_confirmation;
  const isPasswordTouched = form.password !== "" || form.password_confirmation !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!editingId && !passwordsMatch) || (editingId && form.password && !passwordsMatch)) {
      showNotification("Les mots de passe ne correspondent pas", "error");
      return;
    }

    try {
      if (!editingId) {
        // Création
        await AxiosClient.post("/register", form); // envoyer tout le form
        showNotification("Utilisateur créé avec succès!");
      } else {
        // Modification
        const updateData = { ...form };
        if (!updateData.password) {
          delete updateData.password;
          delete updateData.password_confirmation;
        }
        await AxiosClient.put(`/users/${editingId}`, updateData);
        showNotification("Utilisateur mis à jour avec succès!");
      }

      resetForm();
      fetchUtilisateurs();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Erreur lors de l'enregistrement";
      showNotification(message, "error");
    }
  };

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", password_confirmation: "", role: "etudiant" });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
    setShowPasswordConfirmation(false);
  };

  const handleCreateNew = () => { resetForm(); setShowForm(true); };
  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: "", password_confirmation: "", role: user.role || "etudiant" });
    setShowForm(true);
  };

  const openConfirmDialog = (id, name) => setConfirmDialog({ show: true, id, name });
  const closeConfirmDialog = () => setConfirmDialog({ show: false, id: null, name: "" });

  const handleDelete = async (id) => {
    try {
      await AxiosClient.delete(`/users/${id}`);
      showNotification("Utilisateur supprimé avec succès!");
      fetchUtilisateurs();
      closeConfirmDialog();
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordConfirmationVisibility = () => setShowPasswordConfirmation(!showPasswordConfirmation);

  const roleOptions = [
    { value: "etudiant", label: "Étudiant" },
    { value: "enseignant", label: "Enseignant" },
    { value: "super-admin", label: "Super-Admin" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${notification.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {notification.message}
        </div>
      )}

      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">Confirmer la suppression</h3>
            <p className="text-blue-800 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur "<span className="font-semibold">{confirmDialog.name}</span>" ?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeConfirmDialog} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Annuler</button>
              <button onClick={() => handleDelete(confirmDialog.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2"><FaUsers /> Gestion des Utilisateurs</h2>
        {!showForm && <button onClick={handleCreateNew} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"><FaPlus /> Créer un nouvel utilisateur</button>}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-200 relative">
          <button onClick={resetForm} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"><FaTimes size={20} /></button>
          <h3 className="text-xl font-bold text-blue-800 mb-4">{editingId ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-800 mb-2 font-medium">Nom complet :</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-blue-800 mb-2 font-medium">Email :</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="relative">
              <label className="block text-blue-800 mb-2 font-medium">{editingId ? "Nouveau mot de passe" : "Mot de passe :"}</label>
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder={editingId ? "Nouveau mot de passe" : "Mot de passe"} required={!editingId} minLength={8} className="w-full p-3 border border-orange-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"/>
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
            </div>
            <div className="relative">
              <label className="block text-blue-800 mb-2 font-medium">Confirmer le mot de passe :</label>
              <input type={showPasswordConfirmation ? "text" : "password"} name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required={!editingId} className={`w-full p-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 ${isPasswordTouched && !passwordsMatch ? "border-red-500 focus:ring-red-500" : "border-orange-300 focus:ring-orange-500"}`}/>
              <button type="button" onClick={togglePasswordConfirmationVisibility} className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700">{showPasswordConfirmation ? <FaEyeSlash /> : <FaEye />}</button>
              {isPasswordTouched && !passwordsMatch && <p className="text-red-500 text-sm mt-1">Les mots de passe ne correspondent pas</p>}
            </div>
            <div>
              <label className="block text-blue-800 mb-2 font-medium">Rôle :</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                {roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={isPasswordTouched && !passwordsMatch} className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${editingId ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>{editingId ? "Mettre à jour" : "Créer l'utilisateur"}</button>
              <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Table utilisateurs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
        <div className="flex justify-between items-center p-4 border-b border-orange-200">
          <h3 className="text-lg font-semibold text-blue-800">Liste des Utilisateurs</h3>
          <button onClick={fetchUtilisateurs} disabled={loading} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm">
            {loading ? <FaSync className="animate-spin" /> : <FaSync />} Actualiser
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12 text-blue-800"><FaSync className="animate-spin mr-2"/>Chargement...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Rôle</th>
                <th className="p-4 text-left">Date création</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u, i) => (
                <tr key={u.id} className={i%2===0?"bg-orange-50":"bg-white"}>
                  <td className="p-4 border-b border-orange-200">{u.name}</td>
                  <td className="p-4 border-b border-orange-200">{u.email}</td>
                  <td className="p-4 border-b border-orange-200">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  u.role === 'super-admin' ? 'bg-purple-500 text-white'
  : u.role === 'enseignant' ? 'bg-blue-500 text-white'
  : 'bg-green-500 text-white'
}`}>
  {u.role === 'super-admin' ? 'Super-Admin'
  : u.role === 'enseignant' ? 'Enseignant'
  : u.role === 'etudiant' || u.role === 'user' ? 'Étudiant'
  : u.role}
</span>
                  </td>
                  <td className="p-4 border-b border-orange-200">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="p-4 border-b border-orange-200 flex gap-2">
                    <button onClick={() => handleEdit(u)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"><FaEdit size={12}/>Éditer</button>
                    <button onClick={() => openConfirmDialog(u.id, u.name)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"><FaTrash size={12}/>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && utilisateurs.length===0 && <div className="text-center py-8 text-blue-800">Aucun utilisateur disponible</div>}
      </div>
    </div>
  );
}
