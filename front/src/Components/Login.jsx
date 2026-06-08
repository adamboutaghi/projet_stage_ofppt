import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaExclamationCircle
} from 'react-icons/fa';

import logo_main   from '../services/logo_main.png';
import AxiosClient from '../services/AxiosClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});

    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosClient.post('/login', {
        email: formData.email,
        password: formData.password
      });

      const token = response.data.token;

      const userRole = response.data.user.role;

      if (userRole === 'admin') {
        setErrors({
          general: 'Ce compte administrateur n\'a plus accès au système.'
        });
        return;
      }

      flushSync(() => {
        login(response.data.user, token);
      });

      if (userRole === 'super-admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'enseignant') {
        navigate('/enseignant', { replace: true });
      } else {
        navigate('/accueil', { replace: true });
      }

    } catch (error) {

      if (error.response?.status === 401) {
        setErrors({
          general: 'Email ou mot de passe incorrect'
        });
      } else if (error.response?.status === 422) {
        const emailError = error.response?.data?.errors?.email?.[0];
        setErrors({
          general: emailError || error.response.data.message || 'Identifiants incorrects'
        });
      } else if (error.response?.data?.message) {
        setErrors({
          general: error.response.data.message
        });
      } else {
        setErrors({
          general: 'Erreur de connexion, veuillez réessayer'
        });
      }

      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-orange-500 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-orange-500 py-8 px-6 flex flex-col items-center">

            <img
              src={logo_main}
              alt="Sup2i Logo"
              className="w-28 h-28 object-contain drop-shadow-lg"
            />

            <h1 className="text-white text-3xl font-bold mt-4">
              Bienvenue
            </h1>

            <p className="text-blue-100 mt-2 text-sm">
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Form */}
          <div className="p-8">

            {/* General Error */}
            {errors.general && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center text-sm">
                <FaExclamationCircle className="mr-2" />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Adresse email
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <FaEnvelope className="text-gray-400" />
                  </div>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>

                <label className="block text-gray-700 font-medium mb-2">
                  Mot de passe
                </label>

                <div className="relative">

                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                    <FaLock className="text-gray-400" />
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition"
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-700 to-orange-500 hover:from-blue-800 hover:to-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          © 2025 ICTAP - Tous droits réservés
        </div>

      </div>
    </div>
  );
};

export default Login;