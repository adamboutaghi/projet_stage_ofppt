import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Building, Search, Download, Zap } from "lucide-react";

export default function StudentHomeContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
        <div className="space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-blue-950">
            Votre emploi du temps{" "}
            <span className="text-orange-600 block sm:inline">toujours à jour</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Consultez vos horaires de cours, trouvez vos salles, et restez informé des
            changements en temps réel. Simple, rapide et accessible depuis n&apos;importe où.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/emploi"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 sm:py-4 rounded-lg shadow-md hover:bg-orange-700 transition-colors duration-200 text-base sm:text-lg font-medium w-full sm:w-auto"
            >
              <Calendar className="w-5 h-5" />
              Voir mon emploi du temps
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="space-y-4">
            {[
              {
                icon: Clock,
                title: "Temps réel",
                text: "Les modifications apparaissent instantanément sur votre emploi du temps",
              },
              {
                icon: Zap,
                title: "Événements à venir",
                text: "Restez informé des événements importants de l'école",
              },
              {
                icon: Download,
                title: "Téléchargement",
                text: "Exportez votre emploi en PDF ou ajoutez-le à votre calendrier",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-4 sm:p-3 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1 bg-orange-50 rounded-lg">
                    <item.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-orange-600 text-lg">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 lg:mt-16">
        <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-3">
              Événements à venir
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les événements importants prévus à ICTAP
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Journée portes ouvertes",
                date: "Date à déterminer",
                text: "Découvrez les formations et rencontrez les équipes pédagogiques",
              },
              {
                icon: Users,
                title: "Forum des entreprises",
                date: "En préparation",
                text: "Rencontrez les entreprises partenaires pour vos stages et emplois",
              },
              {
                icon: Zap,
                title: "Hackathon étudiant",
                date: "Bientôt annoncé",
                text: "Compétition de programmation pour les passionnés de technologie",
              },
            ].map((ev) => (
              <div
                key={ev.title}
                className="bg-white rounded-xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ev.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950 mb-1">{ev.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{ev.date}</p>
                    <p className="text-sm text-gray-600">{ev.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-gray-500 text-sm">
            <span className="font-medium text-orange-600">En cours de développement</span> —
            Plus d&apos;événements seront ajoutés prochainement
          </p>
        </div>
      </section>

      <section className="mt-12 lg:mt-16">
        <div className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Pour tous les étudiants", text: "Accessible à toutes les filières et tous les niveaux" },
              { icon: Building, title: "Plans des salles", text: "Visualisez l'emplacement de vos salles de cours" },
              { icon: Search, title: "Recherche intuitive", text: "Trouvez rapidement vos cours par matière ou professeur" },
            ].map((card) => (
              <div key={card.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <card.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-950 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
