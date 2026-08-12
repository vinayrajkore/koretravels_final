// Login.jsx - User Login Form
// Same pattern as front_react_1/src/components/Login.jsx from internship
// axios.post, sessionStorage.setItem, localStorage.setItem - all same

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function Login() {

    const navigate = useNavigate();

    // useState - same as internship Login.jsx
    const [user, setUser] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // changeHandler with spread operator - same as internship
    const changeHandler = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    // validate - same as internship
    const validate = () => {
        let newErrors = {};

        if (user.email.trim() === "") {
            newErrors.email = "Email Is Required";
        }

        if (user.password === "") {
            newErrors.password = "Password Is Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // submitHandler - same axios.post + sessionStorage + localStorage pattern
    const submitHandler = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                setLoading(true);
                const response = await axios.post(`${API_URL}/login`, user);
                console.log(response);

                if (response.data.flag > 0) {
                    // Save to localStorage + sessionStorage - same as internship Login.jsx
                    localStorage.setItem("u_id",    response.data.uid);
                    localStorage.setItem("u_name",  response.data.uname);
                    localStorage.setItem("u_email", response.data.umail);
                    localStorage.setItem("role",    response.data.role);

                    // Admin check - set isAdmin flag
                    const isAdmin = response.data.role === "admin";
                    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

                    sessionStorage.setItem("userid",    response.data.uid);
                    sessionStorage.setItem("useremail", response.data.umail);

                    alert("Logged In Successfully !!");

                    // Redirect admin to admin panel, users to home
                    if (isAdmin) {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }

                } else {
                    alert(response.data.message);
                }

            } catch (err) {
                alert("Error: " + err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            background: "linear-gradient(150deg, #031a17 0%, #062f29 40%, #0a5a52 100%)",
        }}>

            <div style={{
                width: "100%", maxWidth: "440px",
                background: "rgba(255,255,255,0.97)",
                borderRadius: 24,
                boxShadow: "0 24px 80px rgba(3,26,23,0.45), 0 0 0 1px rgba(200,255,0,0.08)",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
            }}>

                <div className="kt-card-header" style={{ textAlign: "center", padding: "32px 30px 28px" }}>
                    <div style={{ marginBottom: 14 }}>
                        <img src="/logo.png" alt="Kore Travels" style={{ height: "58px", filter: "drop-shadow(0 0 12px rgba(200,255,0,0.5))" }} />
                    </div>
                    <h2 style={{ marginBottom: 4 }}>Welcome Back</h2>
                    <p>Sign in to your Kore Travels account</p>
                </div>

                {/* Login Form */}
                <div className="kt-card-body">
                    <form onSubmit={submitHandler} className="kt-form">

                        {/* Email */}
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Enter your email"
                                value={user.email}
                                onChange={changeHandler}
                            />
                            <span className="error-msg">{errors.email}</span>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={user.password}
                                onChange={changeHandler}
                            />
                            <span className="error-msg">{errors.password}</span>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-kt-primary"
                            style={{ width: "100%", padding: "13px", fontSize: "16px", marginTop: "5px" }}
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    <p style={{ textAlign: "center", marginTop: "18px", color: "#666", fontSize: "14px" }}>
                        New user?{" "}
                        <Link to="/register" style={{ color: "#1a7a6e", fontWeight: "600" }}>Register here</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Login;
