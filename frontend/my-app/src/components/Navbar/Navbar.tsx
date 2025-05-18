import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

export const Navbar = () => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [user, setUser] = useState<{ username?: string; email?: string } | null>(null); // Store user data
  const { isAuthenticated, logout } = useAuth();

  const handleToggle = () => {
    setToggle(!toggle);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getLoggedinUser = async () => {
      try {
        const response = await fetch("http://localhost:4000/get-loggedin-user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          console.log(data.username);

        } else {
          console.log("Failed to fetch user");
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (isAuthenticated) {
      getLoggedinUser();
    }
  }, [isAuthenticated]);

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)" }}
    >
      <div className="container">
        <Link
          className="navbar-brand fw-bold"
          to="/uploder"
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
            {isAuthenticated && user ? (
              <li className="nav-item dropdown px-2">
                <a
                  className="nav-link dropdown-toggle fw-bold text-secondary"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👋 {user.username || "User"}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li className="dropdown-item text-muted">
                    📧 {user.email}
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={() => {
                        logout();
                        setUser(null);
                        setToggle(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item px-2">
                  <Link
                    className="btn btn-outline-primary btn-sm me-2"
                    to="/signin"
                    onClick={() => setToggle(false)}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <Link
                    className="btn btn-primary btn-sm"
                    to="/signup"
                    onClick={() => setToggle(false)}
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};
