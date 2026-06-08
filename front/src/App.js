import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import AdminEmploi from "./AdminSection/AdminEmploi";
import Groupes from "./AdminSection/Groupes";
import Cours from "./AdminSection/Cours";
import Semaines from "./AdminSection/semaines";
import Seances from "./AdminSection/seances";
import AffichageEmploi from "./AdminSection/AffichageEmploi";
import Events from "./AdminSection/Events";
import Sup2iEmploi from "./Components/Sup2iEmploi";
import Login from "./Components/Login";
import Utilisateurs from "./AdminSection/Utilisateurs";
import StudentHomeContent from "./Components/StudentHomeContent";
import Oops from "./Components/Oops";
import ProtectedRoute from "./services/ProtectedRoute";
import StudentPortalLayout from "./Components/layout/StudentPortalLayout";
import TeacherLayout from "./Components/layout/TeacherLayout";
import TeacherHome from "./AdminSection/TeacherHome";
import TeacherSchedule from "./AdminSection/TeacherSchedule";

const studentRoles = ["etudiant", "user"];

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Espace enseignant */}
          <Route
            path="/enseignant"
            element={
              <ProtectedRoute allowedRoles={["enseignant"]}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherHome />} />
            <Route path="cours" element={<TeacherSchedule />} />
          </Route>

          <Route
            path="/enseignant/schedule"
            element={<Navigate to="/enseignant/cours" replace />}
          />

          {/* Espace étudiant — accueil + emploi du temps */}
          <Route
            element={
              <ProtectedRoute allowedRoles={studentRoles}>
                <StudentPortalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/accueil" element={<StudentHomeContent />} />
            <Route path="/emploi" element={<Sup2iEmploi />} />
          </Route>

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["super-admin"]}>
                <AdminEmploi />
              </ProtectedRoute>
            }
          >
            <Route index element={<Seances />} />
            <Route path="gestion-cours" element={<Cours />} />
            <Route path="gestion-semaines" element={<Semaines />} />
            <Route path="gestion-groupes" element={<Groupes />} />
            <Route path="gestion-seances" element={<Seances />} />
            <Route path="affichage-emploi" element={<AffichageEmploi />} />
            <Route path="gestion-evenements" element={<Events />} />
            <Route
              path="super/utilisateurs"
              element={
                <ProtectedRoute allowedRoles={["super-admin"]}>
                  <Utilisateurs />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Oops />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
