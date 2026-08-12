import API_URL from "../api";
// Register.jsx - User Registration Form
// Same pattern as front_react_1/src/components/Register.jsx from internship
// useState, changeHandler, validate, axios.post - all same as internship

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";
import { useToast } from "./Toast";

function Register() {

    const navigate = useNavigate();
    const toast = useToast();

    // useState for form fields - same as internship Register.jsx
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });

    // errors state - same as internship
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // changeHandler - same spread operator pattern as internship
    const changeHandler = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });

        // Live validation on each keystroke - same as internship
        let error = "";

        if (name === "email") {
            if (!/\S+@\S+\.\S+/.test(value)) {
                error = "Invalid Email Address";
            }
        }

        if (name === "password") {
            if (value.length < 6) {
                error = "Password Must Be At Least 6 Characters";
            }
        }

        if (name === "phone") {
            if (!/^[6-9]\d{9}$/.test(value)) {
                error = "Enter Valid 10-Digit Mobile Number";
            }
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };

    // validate function - same as internship Register.jsx
    const validate = () => {
        let newErrors = {};

        if (user.name.trim() === "") {
            newErrors.name = "Name Is Required";
        }

        if (user.email === "") {
            newErrors.email = "Email Is Required";
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
            newErrors.email = "Invalid Email Address";
        }

        if (user.password === "") {
            newErrors.password = "Password Is Required";
        } else if (user.password.length < 6) {
            newErrors.password = "Password Must Be At Least 6 Characters";
        }

        if (user.phone === "") {
            newErrors.phone = "Phone Number Is Required";
        } else if (!/^[6-9]\d{9}$/.test(user.phone)) {
            newErrors.phone = "Enter Valid 10-Digit Mobile Number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // submitHandler - same axios.post pattern as internship
    const submitHandler = async (e) => {
        e.preventDefault();

        if (validate()) {
            try {
                setLoading(true);
                const response = await axios.post(`${API_URL}/register`, user);
                console.log(response);

                if (response.data.flag > 0) {
                    toast.success(response.data.message || "Account created! Please login.", "Registration Successful", 4000);
                    setTimeout(() => navigate("/login"), 1500);
                } else {
                    toast.error(response.data.message || "Registration failed. Try again.", "Registration Failed");
                }
            } catch (err) {
                toast.error("Unable to connect. Please try again.", "Connection Error");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
        <LoadingOverlay show={loading} text="Creating your account..." />
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            background: "linear-gradient(150deg, #031a17 0%, #062f29 40%, #0a5a52 100%)",
        }}>

            <div style={{
                width: "100%", maxWidth: "480px",
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
                    <h2 style={{ marginBottom: 4 }}>Create Your Account</h2>
                    <p>Join Kore Travels and book your first journey</p>
                </div>

                {/* Card Body - Form */}
                <div className="kt-card-body">
                    <form onSubmit={submitHandler} className="kt-form">

                        {/* Name */}
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={user.name}
                                onChange={changeHandler}
                            />
                            <span className="error-msg">{errors.name}</span>
                        </div>

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
                                placeholder="Minimum 6 characters"
                                value={user.password}
                                onChange={changeHandler}
                            />
                            <span className="error-msg">{errors.password}</span>
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="10-digit mobile number"
                                value={user.phone}
                                onChange={changeHandler}
                            />
                            <span className="error-msg">{errors.phone}</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn-kt-primary"
                            style={{ width: "100%", padding: "13px", fontSize: "16px", marginTop: "5px" }}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Create Account"}
                        </button>

                    </form>

                    <p style={{ textAlign: "center", marginTop: "18px", color: "#666", fontSize: "14px" }}>
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#1a7a6e", fontWeight: "600" }}>Login here</Link>
                    </p>
                </div>

            </div>
        </div>
        </>
    );
}

export default Register;
