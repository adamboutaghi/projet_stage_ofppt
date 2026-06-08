import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  Clock,
  MapPin,
  Bell,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const infoCards = [
  {
    icon: BookOpen,
    title: "Consulter vos cours",
    text: "Accédez à l'emploi du temps par semaine et par professeur depuis la page « Consulter mes cours ».",
    link: "/enseignant/cours",
    linkLabel: "Ouvrir mes cours",
  },
  {
    icon: Calendar,
    title: "Planning hebdomadaire",
    text: "Les emplois du temps sont organisés du lundi au vendredi, avec les horaires et salles de chaque séance.",
  },
  {
    icon: Users,
    title: "Groupes & filières",
    text: "Chaque séance est associée à un groupe d'étudiants pour faciliter le suivi pédagogique.",
  },
];

const quickTips = [
  {
    icon: Clock,
    title: "Horaires",
    text: "Les créneaux affichent l'heure de début et de fin de chaque séance.",
  },
  {
    icon: MapPin,
    title: "Salles",
    text: "La salle indiquée correspond au lieu du cours sur le campus ICTAP.",
  },
  {
    icon: Bell,
    title: "Mises à jour",
    text: "La cloche en haut à droite vous alerte dès qu'un emploi du temps est publié ou modifié.",
  },
  {
    icon: HelpCircle,
    title: "Besoin d'aide ?",
    text: "Contactez le secrétariat ou le Super-Admin en cas d'erreur sur votre planning.",
  },
];

export default function TeacherHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Enseignant";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-16">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
            <GraduationCap className="w-4 h-4" />
            Espace ddd
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-blue-950">
            Bienvenue, <span className="text-orange-600">{firstName} .</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Gérez vos cours, consultez votre emploi du temps et suivez vos groupes
            d&apos;étudiants depuis un tableau de bord moderne et intuitif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              to="/enseignant/cours"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-orange-700 hover:shadow-lg transition-all duration-200 font-medium"
            >
              <BookOpen className="w-5 h-5" />
              Consulter mes cours dddd
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 shadow-xl border border-orange-100">
          <div className="space-y-4">
            {[
              {
                icon: BookOpen,
                title: "Gestion des cours",
                text: "Visualisez et organisez l'ensemble de vos séances programmées.",
              },
              {
                icon: Users,
                title: "Suivi des étudiants",
                text: "Consultez les groupes que vous encadrez chaque semaine.",
              },
              {
                icon: Calendar,
                title: "Planning en temps réel",
                text: "Accédez à votre emploi du temps actualisé par semaine.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <item.icon className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-orange-600">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h3 className="text-xl font-bold text-blue-950 mb-6">
          Votre espace en un coup d&apos;œil
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-blue-600 mb-4">
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-blue-950 mb-2">{card.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{card.text}</p>
              {card.link && (
                <Link
                  to={card.link}
                  className="inline-block mt-4 text-sm font-medium text-orange-600 hover:text-orange-700"
                >
                  {card.linkLabel} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-50 to-white rounded-2xl p-6 sm:p-8 shadow-lg border border-orange-100">
        <h3 className="text-xl font-bold text-blue-950 mb-2">Informations utiles</h3>
        <p className="text-gray-600 text-sm mb-6">
          Tout ce que vous devez savoir pour utiliser la plateforme ICTAP au quotidien.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickTips.map((tip) => (
            <div
              key={tip.title}
              className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-2 bg-orange-50 rounded-lg w-fit mb-3">
                <tip.icon className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="font-semibold text-blue-950 text-sm mb-1">{tip.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


