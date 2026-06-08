import React from 'react';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import LogoSpin from './LogoSpin';

const Oops = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50  to-white  flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-grey-200">
          {/* En-tête rose */}
          <div className="bg-white  border-grey p-8 text-center">
             <LogoSpin />
          </div>

          {/* Contenu */}
          <div className="p-8">
            <div className="text-center mb-8 ">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Oups ! Quelque chose s’est mal passé.
              </h2>
              <p className="text-gray-600">
             Reviens à l’accueil et tout ira bien !  </p>
            </div>

            {/* Boutons */}
            <div className="space-y-4">
              <button
                onClick={() => navigate('/accueil')}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-3 shadow hover:shadow-md"
              >
                <FaHome />
                Retour à l'accueil
              </button>

            
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Oops;