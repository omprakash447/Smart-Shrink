import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:4000/login-backend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store token in localStorage
            localStorage.setItem("token", data.token);

            console.log("Login successful:", data);
            alert("Login Successful!");
            navigate("/dashboard"); // Redirect to dashboard or desired page
        } catch (err: any) {
            console.error("Login error:", err.message);
            alert("Login failed: " + err.message);
        }
    };

    const gradientStyle = {
        background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
        color: "white",
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 bg-white">
            <div className="card border-2 shadow-sm rounded-4 p-4 p-md-5 w-100" style={{ maxWidth: "500px" }}>
                <div className="text-center mb-4 mb-md-5">
                    <h1 className="h3 fw-bold" style={{ color: "#a855f7" }}>
                        Login to Your Account
                    </h1>
                    <p className="text-muted small">Welcome back! Please login.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="form-label small fw-medium" style={{ color: "#f472b6" }}>
                            Email
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FiMail style={{ color: "#f472b6" }} />
                            </span>
                            <input
                                type="email"
                                id="email"
                                className="form-control border-start-0"
                                placeholder="Enter your email"
                                style={{ borderRadius: "0.5rem" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label small fw-medium" style={{ color: "#f472b6" }}>
                            Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <FiLock style={{ color: "#f472b6" }} />
                            </span>
                            <input
                                type="password"
                                id="password"
                                className="form-control border-start-0"
                                placeholder="Enter your password"
                                style={{ borderRadius: "0.5rem" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn w-100 text-white py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
                        style={gradientStyle}
                    >
                        Login
                    </button>

                    <div className="mt-3 text-center">
                        <p className="small">
                            Don’t have an account?{" "}
                            <a href="/signup" style={{ color: "#a855f7", fontWeight: "600" }}>
                                Sign Up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
