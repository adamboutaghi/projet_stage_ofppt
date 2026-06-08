import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiUserGroup,
  HiLogout
} from "react-icons/hi";

import { FaBook, FaBookOpen } from "react-icons/fa";
import axiosClient from "../services/AxiosClient";
import { useAuth } from "../contexts/AuthContext";

export default function AdminEmploi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const baseLinks = [
    { name: "Affichage Emploi", to: "/admin/affichage-emploi", icon: <HiCalendar size={20} className="text-blue-600" /> },
    { name: "Gestion Seances", to: "/admin/gestion-seances", icon: <FaBookOpen size={20} className="text-blue-600" /> },
    { name: "Gestion Cours", to: "/admin/gestion-cours", icon: <FaBook size={20} className="text-blue-600" /> },
    { name: "Gestion Semaines", to: "/admin/gestion-semaines", icon: <HiCalendar size={20} className="text-blue-600" /> },
    { name: "Gestion Groupes", to: "/admin/gestion-groupes", icon: <HiUserGroup size={20} className="text-blue-600" /> },
  //  { name: "Gestion Evenements", to: "/admin/gestion-evenements", icon: <HiCalendar size={20} className="text-blue-600" /> },
  ];

  const superAdminLink = {
    name: "Gestion Utilisateurs",
    to: "/admin/super/utilisateurs",
    icon: <HiUserGroup size={20} className="text-blue-600" />,
  };

  const links =
    user?.role === "super-admin"
      ? [...baseLinks, superAdminLink]
      : baseLinks;

  const handleLogout = async () => {
    setLoadingLogout(true); // start loading
    try {
      // Déconnexion backend
      await axiosClient.post("/logout");
        

    } catch (e) {
      console.error("Erreur logout (pas grave)", e);
    }

    logout();
    setLoadingLogout(false);
    setConfirmModalVisible(false);
    navigate("/");
  };

  const ConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Confirmer la déconnexion</h2>
        <p className="mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="flex justify-end space-x-4">
      <button
  onClick={handleLogout}
  disabled={loadingLogout}
  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
>
  {loadingLogout ? (
    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
  ) : (
    "Déconnecter"
  )}
</button>

          <button
            onClick={() => setConfirmModalVisible(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">

      {/* --- Mobile sidebar --- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>

          <aside className="absolute left-0 top-0 w-64 bg-green-500 h-full shadow-lg p-4 z-50">
            <button onClick={() => setSidebarOpen(false)} className="text-white p-1 mb-6">
              <HiX size={24} />
            </button>

            <p className="mb-6 text-white text-sm pb-4 border-b border-orange-400">
              Bienvenue, {user?.name ?? "Super-Admin"}
            </p>

            <nav>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center p-3 text-blue-800 bg-white hover:bg-orange-100 rounded-lg mb-2"
                >
                  {link.icon}
                  <span className="ml-3 text-sm font-medium">{link.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* --- Desktop sidebar --- */}
      <aside
        className={`hidden md:flex flex-col bg-orange-500 wshadow-xl fixed left-0 top-0 h-screen z-30 transition-all duration-300 ${
          sidebarCollapsed ? "w-16 p-2" : "w-56 p-4"
        }`}
      >
        {/* Toggle collapse */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-white p-1 hover:bg-orange-600 w-8 rounded-lg mb-2"
        >
          {sidebarCollapsed ? <HiChevronRight size={20} /> : <HiChevronLeft size={20} />}
        </button>

        {!sidebarCollapsed && (
          <p className="mb-6 text-white text-sm pb-1 border-b border-orange-400">
            Bienvenue, <strong>{user?.name ?? "Super-Admin"}</strong> <br/>
            Votre rôle : <strong>Super-Admin</strong>
          </p>
        )}

        <nav>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center bg-white text-blue-800 hover:bg-orange-100 rounded-lg p-3 mb-2 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? link.name : ""}
            >
              {link.icon}
              {!sidebarCollapsed && <span className="ml-3 text-sm font-medium">{link.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout button */}
        <button
          onClick={() => setConfirmModalVisible(true)}
          className={`mt-3  bg-red-700 text-white py-1 rounded-lg hover:bg-red-800 flex items-center justify-center`}
        >
          <HiLogout size={20} className={!sidebarCollapsed ? "mr-2" : ""} />
          {!sidebarCollapsed && "Déconnexion"}
        </button>
      </aside>

      {/* --- Main content --- */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {confirmModalVisible && <ConfirmModal />}
    </div>
  );
}
