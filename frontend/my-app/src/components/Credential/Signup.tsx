import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

export default function Signup() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/uploder");
    }
  }, [isAuthenticated, navigate]);

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
      alert("Signup successful! Redirecting to login...");
      setName("");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        navigate("/signin");
      }, 1000);
    } catch (err: any) {
      console.error("Signup error:", err.message);
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4 p-lg-5 bg-dark">
      <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 w-100 fade show" style={{ maxWidth: "500px", backgroundColor: "#222222" }}>
        <div className="text-center mb-4 mb-md-5">
          <h1 className="h3 fw-bold text-light">
            Create Your Account
          </h1>
          <p className="small" style={{color:"white"}}>Sign up to start compressing images</p>
        </div>
        <form onSubmit={handleSignin}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label small fw-medium text-light">
              Name
            </label>
            <div className="input-group">
              <span className="input-group-text bg-secondary border-end-0">
                <FiUser style={{ color: "#b3b3b3" }} />
              </span>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control border-start-0 bg-dark text-light"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

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
                name="email"
                className="form-control border-start-0 bg-dark text-light"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
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
                name="password"
                className="form-control border-start-0 bg-dark text-light"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100 text-light py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
          >
            Sign Up
          </button>
          <div className="mt-3 text-center">
            <p className="small text-light">
              Already have an account?{" "}
              <a href="/signin" className="text-light fw-semibold">
                Login
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Inline CSS for placeholder visibility */}
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