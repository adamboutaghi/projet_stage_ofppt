import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (user.role === "admin") {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen from-pink-500 to-indigo-600 bg-gradient-to-r px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-gray-700 mb-6">
            Vous n’avez pas la permission d’accéder à cette page.
            <br />
            Veuillez contacter le Super-Admin.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retour à la page précédente
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
