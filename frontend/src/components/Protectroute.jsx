// Protectroute.jsx - Authentication Guard
// EXACT SAME as front_react_1/src/components/Protectroute.jsx from internship
// Checks sessionStorage for login, redirects to /login if not logged in

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

    // Same check as internship - sessionStorage.getItem("useremail")
    const email = sessionStorage.getItem("useremail");

    // If not logged in -> redirect to /login (same as internship)
    return email ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
