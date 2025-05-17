import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi"; // For hamburger and close icons
import { Link } from "react-router-dom"; // Use Link instead of <a> for SPA navigation
import { useAuth } from "../../controller/Authcontroller"; // Adjust path as needed

export const Navbar = () => {
  const [toggle, setToggle] = useState<boolean>(false);
  const { isAuthenticated, logout } = useAuth();

  const handleToggle = () => {
    setToggle(!toggle);
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)" }}
    >
      <div className="container">
        <Link
          className="navbar-brand fw-bold"
          to="/"
          style={{
            background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          onClick={() => setToggle(false)}
        >
          Smart Shrink
        </Link>
        <button
          className="navbar-toggler border-0 p-2"
          type="button"
          onClick={handleToggle}
          aria-controls="navbarNav"
          aria-expanded={toggle}
          aria-label="Toggle navigation"
        >
          <span
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
              color: "#fff",
              transition: "transform 0.3s ease",
            }}
          >
            {toggle ? <FiX className="fs-5" /> : <FiMenu className="fs-5" />}
          </span>
        </button>

        <div
          className={`collapse navbar-collapse ${toggle ? "show modern-collapse" : ""}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <li className="nav-item px-2">
                  <Link
                    className="nav-link fw-medium text-dark"
                    to="/user"
                    onClick={() => setToggle(false)}
                    style={{ transition: "color 0.3s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
                  >
                    User
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      logout();
                      setToggle(false);
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item px-2">
                <Link
                  className="btn btn-outline-primary btn-sm"
                  to="/signin"
                  onClick={() => setToggle(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
