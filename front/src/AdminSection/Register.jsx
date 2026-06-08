import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import AxiosClient from '../services/AxiosClient';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'etudiant'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    if (!formData.password_confirmation) newErrors.password_confirmation = 'Veuillez confirmer le mot de passe';
    if (formData.password && formData.password_confirmation && formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await AxiosClient.post('/register', formData);

      setSuccess('Utilisateur créé avec succès !');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'etudiant'
      });

    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Erreur lors de la création du compte';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-4 px-3 flex items-center justify-center">
      <div className="w-full max-w-xs"> {/* Réduit la largeur maximale */}
        

        {/* Carte d'inscription compacte */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* En-tête avec dégradé */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 p-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <FaUserShield className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-sm font-semibold text-white mb-1">
              Nouvel utilisateur
            </h1>
            <p className="text-blue-100 text-xs opacity-90">
              Créer un compte utilisateur
            </p>
          </div>

          {/* Formulaire compact */}
          <div className="p-3">
            {errors.general && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                {errors.general}
              </div>
            )}

            {success && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-xs">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Champ Nom */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaUser className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-2 py-2 text-xs border rounded focus:ring-1 focus:outline-none transition-colors ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Champ Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaEnvelope className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-2 py-2 text-xs border rounded focus:ring-1 focus:outline-none transition-colors ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaLock className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-6 py-2 text-xs border rounded focus:ring-1 focus:outline-none transition-colors ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="8 caractères min"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-3 w-3" />
                    ) : (
                      <FaEye className="h-3 w-3" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirmation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaLock className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-6 py-2 text-xs border rounded focus:ring-1 focus:outline-none transition-colors ${
                      errors.password_confirmation
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Confirmez le mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirm ? (
                      <FaEyeSlash className="h-3 w-3" />
                    ) : (
                      <FaEye className="h-3 w-3" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                )}
              </div>

              {/* Champ Rôle */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <FaUserShield className="h-3 w-3 text-gray-400" />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-7 pr-6 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white"
                  >
                    <option value="etudiant">Étudiant</option>
                    <option value="enseignant">Enseignant</option>
                    <option value="super-admin">Super-Admin</option>
                  </select>
                </div>
              </div>

              {/* Bouton de création */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-2 px-3 rounded text-sm font-semibold hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Création...
                  </div>
                ) : (
                  'Créer le compte'
                )}
              </button>
            </form>

            {/* Informations compactes */}
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                Le Mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default Register;