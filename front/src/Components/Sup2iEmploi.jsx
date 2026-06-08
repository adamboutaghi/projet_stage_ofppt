import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AxiosClient from '../services/AxiosClient';
import { FaSync, FaCalendarAlt, FaUsers, FaChevronLeft, FaChevronRight, FaFilePdf, FaBars, FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sup2iLogo from '../services/Sup2iLogo.png';
import logoMain from '../services/logo_main.png';

const Sup2iEmploi = () => {
  const [searchParams] = useSearchParams();
  const semaineFromUrl = searchParams.get('semaine_id');
  const [semaine, setSemaine] = useState(null);
  const [semainesListe, setSemainesListe] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [groupeSelectionne, setGroupeSelectionne] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [navigation, setNavigation] = useState({ precedente: null, suivante: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Jours de la semaine
  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Détection de l'appareil mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Charger la liste des semaines
  useEffect(() => {
    chargerListeSemaines();
  }, []);

  const chargerListeSemaines = async () => {
    try {
      const response = await AxiosClient.get('/semaines');
      setSemainesListe(response.data);

      if (response.data.length === 0) return;

      if (semaineFromUrl && response.data.some((s) => String(s.id) === semaineFromUrl)) {
        await chargerEmploiDuTemps(parseInt(semaineFromUrl, 10));
        return;
      }

      chargerSemaineActuelle();
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
      
      if (response.data.groupes.length > 0 && !groupeSelectionne) {
        setGroupeSelectionne(response.data.groupes[0].id.toString());
      }
      
    } catch (err) {
      console.error('Erreur chargement emploi:', err);
      setError('Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
      setIsMobileMenuOpen(false);
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

  const telechargerPDF = () => {
    const groupeActuel = getGroupeActuel();
    if (!semaine || !groupeActuel) return;

    setGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const tousLesCours = getTousLesCours(groupeActuel);

      const primaryBlue = [24, 60, 100];
      const accentOrange = [255, 140, 0];
      const lightGray = [240, 240, 240];
      const headerLineColor = [220, 220, 220];

      const logoX = 14;
      const textX = 55;
      const headerHeight = 50;

      // En-tête
      doc.setFillColor(255, 255, 255); 
      doc.rect(0, 0, doc.internal.pageSize.width, headerHeight, 'F');

      doc.setDrawColor(headerLineColor[0], headerLineColor[1], headerLineColor[2]);
      doc.setLineWidth(1);
      doc.line(0, headerHeight, doc.internal.pageSize.width, headerHeight); 

      try {
        doc.addImage(logoMain, 'PNG', logoX, 8, 35, 30); 
      } catch (error) {
        console.log('Logo Sup2i non chargé');
      }

      doc.setFontSize(16);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFont(undefined, 'bold');
      
      doc.text('ICTAP ÉCOLE RECONNUE PAR L\'ÉTAT', textX, 20);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Informatique • Industrie • Génie Civil • Logistique • Et Plus Encore', textX, 27);
      
      doc.setDrawColor(accentOrange[0], accentOrange[1], accentOrange[2]); 
      doc.setLineWidth(1);
      doc.line(textX, 32, doc.internal.pageSize.width - 14, 32);

      doc.setFontSize(10);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.text(`Groupe: ${groupeActuel.nom}`, textX, 38);
      if (groupeActuel.filiere) {
        doc.text(`Filière: ${groupeActuel.filiere}`, textX + 60, 38);
      }
      doc.text(`Semaine: ${semaine.titre}`, textX + 120, 38);

      doc.setFontSize(18);
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFont(undefined, 'bold');
      doc.text('EMPLOI DU TEMPS', 14, 65);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'normal');
      doc.text(`Période du ${semaine.date_debut} au ${semaine.date_fin}`, 14, 72);

      let yPosition = 85;

      const tableData = [];
      
      joursSemaine.forEach((jour, jourIndex) => {
        const coursDuJour = tousLesCours.filter(cours => cours.jourIndex === jourIndex);
        
        if (coursDuJour.length > 0) {
          coursDuJour.forEach((cours, index) => {
            const typeCours = cours.type ? cours.type.toUpperCase() : '';
            const heure = `${formaterHeure(cours.heure_debut)} - ${formaterHeure(cours.heure_fin)}`;
            const matiere = cours.cours.intitule;
            const professeur = cours.cours.professeur;
            const salle = cours.salle || 'Non spécifiée';
            
            tableData.push([
              index === 0 ? jour : '',
              heure,
              matiere,
              typeCours,
              professeur,
              salle
            ]);
          });
        } else {
          tableData.push([
            jour,
            '-',
            'Aucune séance programmée',
            '-',
            '-',
            '-'
          ]);
        }
        
        if (jourIndex < joursSemaine.length - 1) {
          tableData.push(['', '', '', '', '', '']);
        }
      });

      // CORRECTION ICI : Utilisation correcte de autoTable
      autoTable(doc, {
        startY: yPosition,
        head: [['Jour', 'Heure', 'Matière', 'Type', 'Professeur', 'Salle']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: accentOrange,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [50, 50, 50],
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold', textColor: accentOrange, halign: 'left' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 50 },
          3: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
          4: { cellWidth: 40 },
          5: { cellWidth: 22, fontStyle: 'bold', halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.cell.text[0] !== '') {
            data.cell.styles.fillColor = [220, 220, 220];
            data.cell.styles.textColor = primaryBlue;
          }
          if (data.row.raw[0] === '' && data.row.raw[1] === '') {
              data.cell.styles.minCellHeight = 2;
              data.cell.styles.fillColor = [255, 255, 255]; 
              data.cell.styles.lineColor = [255, 255, 255];
          }
        },
        alternateRowStyles: {
          fillColor: lightGray
        },
        didDrawPage: function (data) {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(8);
          doc.setTextColor(128);
          
          try {
            doc.addImage(Sup2iLogo, 'PNG', 14, pageHeight - 15, 15, 12);
          } catch (error) {
            console.log('Logo main non chargé');
          }

          doc.setDrawColor(accentOrange[0], accentOrange[1], accentOrange[2]);
          doc.setLineWidth(0.5);
          doc.line(14, pageHeight - 18, doc.internal.pageSize.width - 14, pageHeight - 18);
          
          doc.text(
            `SUP2I - Document généré par le système d'affichage le ${new Date().toLocaleDateString('fr-FR')}`,
            35,
            pageHeight - 10
          );
          
          doc.text(
            `Page ${data.pageNumber}`,
            doc.internal.pageSize.width - 14,
            pageHeight - 10,
            { align: 'right' }
          );
        }
      });

      const fileName = `emploi_du_temps_${groupeActuel.nom}_${semaine.titre.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <div className="text-blue-800 font-medium">Chargement des emplois du temps...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
          <div className="text-red-500 text-lg font-bold mb-3">Erreur</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={chargerSemaineActuelle}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!semaine) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
          <div className="text-yellow-500 text-lg font-bold mb-3">Information</div>
          <div className="text-gray-600">Aucun emploi du temps disponible</div>
        </div>
      </div>
    );
  }

  const groupeActuel = getGroupeActuel();
  const tousLesCours = groupeActuel ? getTousLesCours(groupeActuel) : [];

  // Vue mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="space-y-4">
          {/* Header mobile */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-orange-50 text-orange-600"
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              <div className="text-center flex-1 mx-2">
                <div className="font-bold text-blue-800 text-lg">{semaine.titre}</div>
                <div className="text-blue-600 text-sm">Du {semaine.date_debut} au {semaine.date_fin}</div>
              </div>
              <button 
                onClick={telechargerPDF}
                disabled={generatingPdf || loading || !groupeActuel}
                className="p-2 rounded-lg bg-orange-500 text-white disabled:opacity-50"
              >
                {generatingPdf ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <FaFilePdf size={20} />
                )}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="space-y-4 mt-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-blue-800 mb-2 font-medium text-sm">
                    Choisir une semaine :
                  </label>
                  <select
                    value={semaine.id}
                    onChange={handleSemaineSelectChange}
                    className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {semainesListe.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.titre} ({sem.date_debut} au {sem.date_fin})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-blue-800 mb-2 font-medium text-sm">
                    <FaUsers />
                    Groupe :
                  </label>
                  <select
                    value={groupeSelectionne}
                    onChange={(e) => setGroupeSelectionne(e.target.value)}
                    className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    {groupes.map((groupe) => (
                      <option key={groupe.id} value={groupe.id}>
                        {groupe.nom} {groupe.filiere && `- ${groupe.filiere}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleNavigation(navigation.precedente)}
                    disabled={!navigation.precedente}
                    className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    <FaChevronLeft />
                    Précédente
                  </button>

                  <button
                    onClick={() => handleNavigation(navigation.suivante)}
                    disabled={!navigation.suivante}
                    className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    Suivante
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-blue-800 font-bold text-center">
                {groupeActuel?.nom}
                {groupeActuel?.filiere && ` - ${groupeActuel.filiere}`}
              </div>
            </div>
          </div>

          {/* Sélecteur de jour pour mobile */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="grid grid-cols-3 gap-2">
              {joursSemaine.slice(0, 7).map((jour, index) => (
                <button
                  key={jour}
                  onClick={() => setActiveDay(activeDay === index ? null : index)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    activeDay === index 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-orange-50 text-blue-800 hover:bg-orange-100'
                  }`}
                >
                  <div className="font-medium text-sm">{jour.substring(0, 3)}</div>
                  <div className="text-xs mt-1">
                    {tousLesCours.filter(c => c.jourIndex === index).length} séance{tousLesCours.filter(c => c.jourIndex === index).length !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Affichage des cours du jour sélectionné */}
          {activeDay !== null ? (
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-blue-800 text-lg">{joursSemaine[activeDay]}</div>
                <button
                  onClick={() => setActiveDay(null)}
                  className="text-orange-500 text-sm font-medium"
                >
                  Fermer
                </button>
              </div>

              {tousLesCours.filter(cours => cours.jourIndex === activeDay).length > 0 ? (
                <div className="space-y-3">
                  {tousLesCours
                    .filter(cours => cours.jourIndex === activeDay)
                    .map((cours, index) => (
                      <div 
                        key={index}
                        className="border border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-white"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {formaterHeure(cours.heure_debut)} - {formaterHeure(cours.heure_fin)}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            cours.type === 'cours' ? 'bg-blue-100 text-blue-800' :
                            cours.type === 'td' ? 'bg-green-100 text-green-800' :
                            cours.type === 'tp' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cours.type?.toUpperCase() || 'COURS'}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <div className="font-bold text-blue-800 text-base">{cours.cours.intitule}</div>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-blue-700">
                            <div className="font-medium">Professeur:</div>
                            <div>{cours.cours.professeur}</div>
                          </div>
                          
                          {cours.salle && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <div className="font-medium">Salle:</div>
                              <div>{cours.salle}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-blue-800 text-lg italic mb-2">Aucune séance programmée</div>
                  <div className="text-blue-600 text-sm">Journée libre</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-blue-600">
              Sélectionnez un jour pour voir les cours
            </div>
          )}

          {/* Résumé total */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="text-center">
              <div className="text-blue-800 font-bold text-lg mb-2">Résumé de la semaine</div>
              <div className="text-orange-500 text-2xl font-bold">{tousLesCours.length}</div>
              <div className="text-blue-600">séance{tousLesCours.length !== 1 ? 's' : ''} au total</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue desktop
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <FaCalendarAlt />
            Emploi du Temps
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button 
              onClick={telechargerPDF}
              disabled={generatingPdf || loading || !groupeActuel}
              className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {generatingPdf ? <FaSync className="animate-spin" /> : <FaFilePdf />}
              Télécharger PDF
            </button>
            
            <button 
              onClick={() => chargerEmploiDuTemps(semaine.id)}
              disabled={loading}
              className="bg-blue-800 text-white px-4 py-3 rounded-lg hover:bg-blue-950 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
            >
              {loading ? <FaSync className="animate-spin" /> : <FaSync />}
              Actualiser
            </button>
          </div>
        </div>

        {/* Navigation et sélection */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md mb-6 md:mb-8 border border-orange-200">
          {/* Navigation horizontale */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <button
              onClick={() => handleNavigation(navigation.precedente)}
              disabled={!navigation.precedente}
              className="w-full md:w-auto bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaChevronLeft />
              Précédente
            </button>

            <div className="text-center flex-1 mx-0 md:mx-6">
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
              className="w-full md:w-auto bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Suivante
              <FaChevronRight />
            </button>
          </div>

          {/* Sélection de semaine et groupe */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

        {/* Tableau de l'emploi du temps */}
        {groupeActuel && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-orange-200 gap-2">
              <h3 className="text-lg font-semibold text-blue-800">
                Emploi du temps - {groupeActuel.nom}
                {groupeActuel.filiere && ` (${groupeActuel.filiere})`}
              </h3>
              <div className="text-blue-800 text-sm bg-orange-50 px-3 py-1 rounded-full">
                {tousLesCours.length} séance{tousLesCours.length !== 1 ? 's' : ''} au total
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-500 text-white">
                  <tr>
                    <th className="p-3 md:p-4 text-left font-semibold min-w-32">Jour</th>
                    <th className="p-3 md:p-4 text-left font-semibold">Séances</th>
                  </tr>
                </thead>
                <tbody>
                  {joursSemaine.slice(0, 7).map((jour, jourIndex) => {
                    const coursDuJour = tousLesCours.filter(cours => cours.jourIndex === jourIndex);
                    
                    return (
                      <tr 
                        key={jour} 
                        className={jourIndex % 2 === 0 ? 'bg-orange-50' : 'bg-white'}
                      >
                        <td className="p-3 md:p-4 border-b border-orange-200 text-blue-800 font-semibold min-w-32">
                          <div className="text-base md:text-lg">{jour}</div>
                          <div className="text-xs md:text-sm text-blue-600 font-normal mt-1">
                            {coursDuJour.length} séance{coursDuJour.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        
                        <td className="p-3 md:p-4 border-b border-orange-200">
                          {coursDuJour.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {coursDuJour.map((cours, index) => (
                                <div 
                                  key={index}
                                  className="bg-white border border-orange-300 rounded-lg p-3 md:p-4 hover:bg-Orange-50 transition-colors duration-150"
                                >
                                  <div className="bg-orange-500 text-white rounded-md p-2 mb-2 text-center">
                                    <div className="font-bold text-xs md:text-sm">
                                      {formaterHeure(cours.heure_debut)} - {formaterHeure(cours.heure_fin)}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="font-bold text-blue-800 text-xs md:text-sm leading-tight">
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
                            <div className="text-center py-4 md:py-6 text-blue-800">
                              <div className="text-base md:text-lg italic">
                                Aucune séance programmée
                              </div>
                              <div className="text-xs md:text-sm text-blue-600 mt-1">
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
        )}

        {/* Légende */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-4 border border-orange-200">
          <h4 className="text-blue-800 font-semibold mb-3">Légende des types de séance :</h4>
          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
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
    </div>
  );
};

export default Sup2iEmploi;