import AppLayout from "./AppLayout";

const studentNav = [
  { to: "/accueil", label: "Accueil", end: true },
  { to: "/emploi", label: "Mon emploi du temps", end: true },
];

export default function StudentPortalLayout() {
  return (
    <AppLayout
      homePath="/accueil"
      footerTagline="Plateforme pour étudiants"
      navItems={studentNav}
      showLogout
      showNotifications
    />
  );
}
