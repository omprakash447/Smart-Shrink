import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

export default function Signup() {
    const navigate=useNavigate();
    const {isAuthenticated}=useAuth();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");


    useEffect(()=>{
        if(isAuthenticated){
            navigate("/uploder");
        }
    },[isAuthenticated , navigate]);

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:4000/signup-backend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName: name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }

            console.log("Signup success:", data);

            alert("Signup successful! Redirecting to login..."); // ✅ show popup message

            // Optional: Clear form
            setName("");
            setEmail("");
            setPassword("");

            // ✅ Redirect to login after 1 second
            setTimeout(() => {
                navigate("/signin");
            }, 1000);
        } catch (err: any) {
            console.error("Signup error:", err.message);
            alert("Signup failed: " + err.message); // Optional error popup
        }
    };



    const gradientStyle = {
        background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
        color: "white",
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 bg-white">
            <div
                className="card border-2 shadow-sm rounded-4 p-4 p-md-5 w-100"
                style={{ maxWidth: "500px" }}
            >
                <div className="text-center mt-4">
                    <h1 className="h4 fw-bold" style={{ color: "#a855f7" }}>
                        Create Your Account
                    </h1>
                    <p className="text-muted small">Sign up to start compressing images</p>
                </div>
                <form onSubmit={handleSignin}>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="form-label small fw-medium"
                            style={{ color: "#f472b6" }}
                        >
                            Name
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FiUser style={{ color: "#f472b6" }} />
                            </span>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-control border-start-0"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ borderRadius: "0.5rem" }}
                                autoComplete="name"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="email"
                            className="form-label small fw-medium"
                            style={{ color: "#f472b6" }}
                        >
                            Email
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FiMail style={{ color: "#f472b6" }} />
                            </span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control border-start-0"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ borderRadius: "0.5rem" }}
                                autoComplete="email"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="password"
                            className="form-label small fw-medium"
                            style={{ color: "#f472b6" }}
                        >
                            Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FiLock style={{ color: "#f472b6" }} />
                            </span>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-control border-start-0"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ borderRadius: "0.5rem" }}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 text-white py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
                        style={gradientStyle}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.filter = "brightness(1.1)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.filter = "brightness(1)")
                        }
                    >
                        Sign Up
                    </button>
                    <div className="mt-3 text-center">
                        <p className="small">
                            Already have an account?{" "}
                            <a
                                href="/signin"
                                style={{ color: "#a855f7", fontWeight: "600" }}
                            >
                                Login
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
