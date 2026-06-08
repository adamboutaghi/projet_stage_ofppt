import AppLayout from "./AppLayout";

const teacherNav = [
  { to: "/enseignant", label: "Accueil", end: true },
  { to: "/enseignant/cours", label: "Consulter mes cours", end: true },
];

export default function TeacherLayout() {
  return (
    <AppLayout
      homePath="/enseignant"
      footerTagline="Plateforme pour enseignants"
      navItems={teacherNav}
      showLogout
      showNotifications
    />
  );
}
