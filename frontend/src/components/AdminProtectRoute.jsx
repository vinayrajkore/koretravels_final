// AdminProtectRoute.jsx - Admin Authentication Guard
// Same concept as Protectroute.jsx from internship, but checks for admin role

import { Navigate } from "react-router-dom";

function AdminProtectRoute({ children }) {
    const isAdmin = localStorage.getItem("isAdmin");
    return isAdmin === "true" ? children : <Navigate to="/login" replace />;
}

export default AdminProtectRoute;
