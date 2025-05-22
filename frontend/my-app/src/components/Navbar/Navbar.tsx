import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useEffect, useState } from "react";
import { FiMenu, FiScissors, FiUser, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../controller/Authcontroller";

export const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [user, setUser] = useState<{ username?: string; email?: string } | null>(null);
  const { isAuthenticated, logout } = useAuth();

  const handleToggle = () => setToggle(!toggle);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getLoggedinUser = async () => {
      try {
        const response = await fetch("http://localhost:4000/get-loggedin-user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) setUser(await response.json());
      } catch (err) {
        console.log(err);
      }
    };
    if (isAuthenticated) getLoggedinUser();
  }, [isAuthenticated]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        aria-label="Toggle navigation menu"
        style={{
          position: "fixed",
          top: 20,
          right: 20, // moved toggle button to top-right corner
          zIndex: 2000,
          background: "#f8d047",
          border: "none",
          borderRadius: "8px",
          padding: "10px",
          boxShadow: "0 4px 10px rgba(248, 208, 71, 0.4)",
          cursor: "pointer",
          transition: "background 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#d4b63a")}
        onMouseLeave={e => (e.currentTarget.style.background = "#f8d047")}
      >
        {toggle ? <FiX size={26} color="#222" /> : <FiMenu size={26} color="#222" />}
      </button>

      {/* Sidebar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "260px",
          background:
            "linear-gradient(135deg, rgba(40,40,40,0.95) 0%, rgba(30,30,30,0.9) 100%)",
          color: "#f8d047",
          padding: "2.5rem 1.5rem",
          boxShadow: "2px 0 15px rgba(0,0,0,0.6)",
          transform: toggle ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1500,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
        onClick={() => toggle && setToggle(false)}
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setToggle(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "1.75rem",
            fontWeight: "900",
            color: "#f8d047",
            marginBottom: "2rem",
            textDecoration: "none",
            userSelect: "none",
            textShadow: "0 0 8px rgba(248, 208, 71, 0.8)",
          }}
        >
          <FiScissors size={28} />
          SmartShrink
        </Link>

        {/* Navigation */}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            flexGrow: 1,
          }}
        >
          {isAuthenticated && user ? (
            <>
              <li>
                <Link
                  to="/uploder"
                  onClick={() => setToggle(false)}
                  style={navLinkStyle}
                >
                  Image Compress
                </Link>
              </li>
              <li>
                <Link
                  to="/pdf-compressser"
                  onClick={() => setToggle(false)}
                  style={navLinkStyle}
                >
                  PDF Compress
                </Link>
              </li>
              <li>
                <Link
                  to="/file"
                  onClick={() => setToggle(false)}
                  style={navLinkStyle}
                >
                  AI Resume Analyze
                </Link>
              </li>

              {/* User info + Logout */}
              <li
                style={{
                  marginTop: "auto",
                  borderTop: "1px solid rgba(248, 208, 71, 0.3)",
                  paddingTop: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "0.3rem",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  <FiUser size={20} />
                  <span>{user.username || "User"}</span>
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#ccc",
                    marginBottom: "1rem",
                    userSelect: "text",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "220px",
                  }}
                  title={user.email}
                >
                  📧 {user.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setUser(null);
                    setToggle(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#f8d047",
                    color: "#222",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(248, 208, 71, 0.5)",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d4b63a")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f8d047")}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/signin"
                  onClick={() => setToggle(false)}
                  style={{
                    ...btnStyle,
                    backgroundColor: "transparent",
                    color: "#f8d047",
                    border: "2px solid #f8d047",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#f8d047";
                    e.currentTarget.style.color = "#222";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#f8d047";
                  }}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  onClick={() => setToggle(false)}
                  style={btnStyle}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#d4b63a")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#f8d047")}
                >
                  Signup
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Overlay */}
      {toggle && (
        <div
          onClick={() => setToggle(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            zIndex: 1400,
            cursor: "pointer",
          }}
        />
      )}
    </>
  );
};

// Shared styles

const navLinkStyle: React.CSSProperties = {
  color: "#f8d047",
  fontWeight: 600,
  fontSize: "1.05rem",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  transition: "background-color 0.2s ease, color 0.2s ease",
  userSelect: "none",
  display: "inline-block",
};

const btnStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  padding: "10px 0",
  borderRadius: "8px",
  fontWeight: "700",
  fontSize: "1rem",
  color: "#222",
  backgroundColor: "#f8d047",
  textDecoration: "none",
  boxShadow: "0 4px 8px rgba(248, 208, 71, 0)",
};
