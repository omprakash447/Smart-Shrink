import { useEffect, useState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    // Redirect to uploader if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/uploder");
        }
    }, [isAuthenticated, navigate]);

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

            localStorage.setItem("token", data.token);
            console.log("Login successful:", data);
            login();
            alert("Login Successful!");
        } catch (err: any) {
            console.error("Login error:", err.message);
            alert("Login failed: " + err.message);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 bg-dark">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100 fade show" style={{ maxWidth: "500px", backgroundColor: "#222222" }}>
                <div className="text-center mb-4 mb-md-5">
                    <h1 className="h3 fw-bold text-light">
                        Login to Your Account
                    </h1>
                    <p className="small" style={{ color: "white" }}>Welcome back! Please login.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="form-label small fw-medium text-light">
                            Email
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-secondary border-end-0">
                                <FiMail style={{ color: "#b3b3b3" }} />
                            </span>
                            <input
                                type="email"
                                id="email"
                                className="form-control border-start-0 bg-dark text-light"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label small fw-medium text-light">
                            Password
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-secondary border-end-0">
                                <FiLock style={{ color: "#b3b3b3" }} />
                            </span>
                            <input
                                type="password"
                                id="password"
                                className="form-control border-start-0 bg-dark text-light"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-dark w-100 text-light py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    >
                        Login
                    </button>

                    <div className="mt-3 text-center">
                        <p className="small text-light">
                            Don’t have an account?{" "}
                            <a href="/signup" className="text-light fw-semibold">
                                Sign Up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
            <style>{`
        .form-control::placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control::-webkit-input-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control::-moz-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
        .form-control:-ms-input-placeholder {
          color: #999999 !important;
          opacity: 1 !important;
        }
      `}</style>
        </div>
    );
}