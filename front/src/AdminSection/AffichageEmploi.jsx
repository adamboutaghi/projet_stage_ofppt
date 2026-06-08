import React, { useState, useEffect, useCallback } from 'react';
import AxiosClient from '../services/AxiosClient';
import { FaSync, FaCalendarAlt, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AffichageEmploi = () => {
  const [semaine, setSemaine] = useState(null);
  const [semainesListe, setSemainesListe] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [groupeSelectionne, setGroupeSelectionne] = useState('');
  const [loading, setLoading] = useState(true);
  const [navigation, setNavigation] = useState({ precedente: null, suivante: null });
  const [error, setError] = useState(null);

  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Charger la liste des semaines
  useEffect(() => {
    chargerListeSemaines();
  }, []);

  const chargerListeSemaines = async () => {
    try {
      const response = await AxiosClient.get('/admin/semaines');
      setSemainesListe(response.data);
      
      // Charger la semaine actuelle après avoir la liste
      if (response.data.length > 0) {
        chargerSemaineActuelle();
      }
    } catch (err) {
      console.error('Erreur chargement liste semaines:', err);
      setError('Impossible de charger la liste des semaines');
    }
  };

  const chargerSemaineActuelle = async () => {
    try {
      setLoading(true);
      const response = await AxiosClient.get('/semaines/actuelle');
      if (response.data) {
        await chargerEmploiDuTemps(response.data.id);
      }
    } catch (err) {
      console.error('Erreur semaine actuelle:', err);
      // Fallback: première semaine de la liste
      if (semainesListe.length > 0) {
        await chargerEmploiDuTemps(semainesListe[0].id);
      }
    }
  };

  const chargerEmploiDuTemps = async (semaineId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AxiosClient.get(`/semaines/${semaineId}/emploi`);
      
      setSemaine(response.data);
      setGroupes(response.data.groupes);
      setNavigation(response.data.navigation || {});
      
      // Sélectionner le premier groupe par défaut
      if (response.data.groupes.length > 0 && !groupeSelectionne) {
        setGroupeSelectionne(response.data.groupes[0].id.toString());
      }
      
    } catch (err) {
      console.error('Erreur chargement emploi:', err);
      setError('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (nouvelleSemaineId) => {
    if (nouvelleSemaineId) {
      chargerEmploiDuTemps(nouvelleSemaineId);
    }
  };

  const handleSemaineSelectChange = (e) => {
    handleNavigation(parseInt(e.target.value));
  };

  // Fonctions existantes conservées
  const formaterHeure = (heure) => {
    return heure?.substring(0, 5) || '';
  };

  const getGroupeActuel = () => {
    return groupes.find(groupe => groupe.id.toString() === groupeSelectionne);
  };

  const getTousLesCours = useCallback((groupe) => {
    if (!groupe) return [];
    
    const tousLesCours = [];
    const joursAPI = groupe.jours || [];

    joursAPI.forEach((coursDuJour, jourIndex) => {
      if (Array.isArray(coursDuJour)) {
        coursDuJour.forEach(cours => {
          tousLesCours.push({
            ...cours,
            jourIndex,
            jour: joursSemaine[jourIndex]
          });
        });
      }
    });
    
    return tousLesCours.sort((a, b) => {
      if (a.jourIndex !== b.jourIndex) return a.jourIndex - b.jourIndex;
      return a.heure_debut.localeCompare(b.heure_debut);
    });
  }, [joursSemaine]);

  if (loading && !semaine) {
     return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <div className="text-blue-800 font-medium">Chargement des emplois du temps...</div>
        </div>
      </div>
    );
  }

  if (error && !semaine) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
          {error}
          <button 
            onClick={chargerListeSemaines}
            className="ml-4 bg-white text-red-500 px-3 py-1 rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!semaine) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg">
          Aucun emploi du temps disponible
        </div>
      </div>
    );
  }

  const groupeActuel = getGroupeActuel();
  const tousLesCours = groupeActuel ? getTousLesCours(groupeActuel) : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaCalendarAlt />
          Emploi du Temps
        </h2>
        
        <button 
          onClick={() => chargerEmploiDuTemps(semaine.id)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {loading ? <FaSync className="animate-spin" /> : <FaSync />}
          Actualiser
        </button>
      </div>

      {/* Navigation et sélection */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-orange-200">
        {/* Navigation horizontale */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleNavigation(navigation.precedente)}
            disabled={!navigation.precedente}
            className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaChevronLeft />
            Précédente
          </button>

          <div className="text-center flex-1 mx-6">
            <div className="text-xl font-bold text-blue-800">
              {semaine.titre}
            </div>
            <div className="text-blue-600">
              Du {semaine.date_debut} au {semaine.date_fin}
            </div>
          </div>

          <button
            onClick={() => handleNavigation(navigation.suivante)}
            disabled={!navigation.suivante}
            className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Suivante
            <FaChevronRight />
          </button>
        </div>

        {/* Sélection de semaine et groupe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-blue-800 mb-2 font-medium">
              Choisir une semaine :
            </label>
            <select
              value={semaine.id}
              onChange={handleSemaineSelectChange}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {semainesListe.map((sem) => (
                <option key={sem.id} value={sem.id}>
                  {sem.titre} ({sem.date_debut} au {sem.date_fin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-blue-800 mb-2 font-medium">
              <FaUsers />
              Groupe :
            </label>
            <select
              value={groupeSelectionne}
              onChange={(e) => setGroupeSelectionne(e.target.value)}
              className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {groupes.map((groupe) => (
                <option key={groupe.id} value={groupe.id}>
                  {groupe.nom} {groupe.filiere && `- ${groupe.filiere}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Affichage des erreurs après chargement */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg mb-4">
          {error}
        </div>
      )}

      {/* Tableau de l'emploi du temps */}
      {groupeActuel ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-200">
          <div className="flex justify-between items-center p-4 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-blue-800">
              Emploi du temps - {groupeActuel.nom}
              {groupeActuel.filiere && ` (${groupeActuel.filiere})`}
            </h3>
            <div className="text-blue-800 text-sm">
              {tousLesCours.length} séance{tousLesCours.length !== 1 ? 's' : ''} au total
            </div>
          </div>

          {/* Votre tableau existant */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold min-w-32">Jour</th>
                  <th className="p-4 text-left font-semibold">Séances</th>
                </tr>
              </thead>
              <tbody>
                {joursSemaine.map((jour, jourIndex) => {
                  const coursDuJour = tousLesCours.filter(cours => cours.jourIndex === jourIndex);
                  
                  return (
                    <tr 
                      key={jour} 
                      className={jourIndex % 2 === 0 ? 'bg-orange-50' : 'bg-white'}
                    >
                      <td className="p-4 border-b border-orange-200 text-blue-800 font-semibold min-w-32">
                        <div className="text-lg">{jour}</div>
                        <div className="text-sm text-blue-600 font-normal mt-1">
                          {coursDuJour.length} séance{coursDuJour.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      
                      <td className="p-4 border-b border-orange-200">
                        {coursDuJour.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {coursDuJour.map((cours, index) => (
                              <div 
                                key={index}
                                className="bg-white border border-orange-300 rounded-lg p-4 hover:bg-orange-50 transition-colors duration-150"
                              >
                                <div className="bg-orange-500 text-white rounded-md p-2 mb-3 text-center">
                                  <div className="font-bold text-sm">
                                    {formaterHeure(cours.heure_debut)} - {formaterHeure(cours.heure_fin)}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="font-bold text-blue-800 text-sm leading-tight">
                                    {cours.cours.intitule}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {cours.type && (
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        cours.type === 'cours' ? 'bg-blue-100 text-blue-800' :
                                        cours.type === 'td' ? 'bg-green-100 text-green-800' :
                                        cours.type === 'tp' ? 'bg-purple-100 text-purple-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {cours.type.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="text-xs text-blue-700">
                                    <span className="font-semibold">Professeur:</span> {cours.cours.professeur}
                                  </div>
                                  
                                  {cours.salle && (
                                    <div className="text-xs text-blue-600 font-medium">
                                      <span className="font-semibold">Salle:</span> {cours.salle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-blue-800">
                            <div className="text-lg italic">
                              Aucune séance programmée
                            </div>
                            <div className="text-sm text-blue-600 mt-1">
                              Journée libre
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {tousLesCours.length === 0 && (
            <div className="text-center py-8 text-blue-800">
              Aucune séance disponible pour cette semaine
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-lg">
          Aucun groupe disponible pour cette semaine
        </div>
      )}

      {/* Légende */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4 border border-orange-200">
        <h4 className="text-blue-800 font-semibold mb-3">Légende des types de séance :</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-blue-800">Cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-blue-800">TD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-blue-800">TP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-blue-800">Examen</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffichageEmploi;