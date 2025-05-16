import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi"; // For hamburger and close icons

export const Navbar = () => {
  const [toggle, setToggle] = useState<boolean>(false);

  const handleToggle = () => {
    setToggle(!toggle);
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)" }}
    >
      <div className="container">
        <a
          className="navbar-brand fw-bold"
          href="#"
          style={{
            background: "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Smart Shrink
        </a>
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
            <li className="nav-item px-2">
              <a
                className="nav-link fw-medium active text-dark"
                href="#"
                style={{ transition: "color 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
              >
                Image
              </a>
            </li>
            <li className="nav-item px-2">
              <a
                className="nav-link fw-medium text-dark"
                href="#"
                style={{ transition: "color 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
              >
                Video
              </a>
            </li>
            <li className="nav-item px-2">
              <a
                className="nav-link fw-medium text-dark"
                href="#"
                style={{ transition: "color 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
              >
                Resume Analyzer
              </a>
            </li>
            <li className="nav-item px-2">
              <a
                className="nav-link fw-medium text-dark"
                href="#"
                style={{ transition: "color 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f472b6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#212529")}
              >
                User
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};