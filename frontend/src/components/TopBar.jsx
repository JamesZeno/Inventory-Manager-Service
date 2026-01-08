import { useEffect, useRef, useState, useContext } from "react";
import './topbar.css'
import { AuthContext } from "../context/AuthContext";
import UserLogin from "./Auth/UserLogin";
import UserLogout from "./Auth/UserLogout";


function Topbar({
  services = [],
  activeServiceId = "",
  onTabChange = () => { },
  onAdminPanelClick = () => { },
}) {
  const { username, isAuthed, company, role } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  //Close dropdown on click outside or Escape
  useEffect(() => {
    function onDocClick(e) {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", onDocClick, { capture: false });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen]);

  return (
    <div className="topbar">
      {/* Left Side */}
      <div className="topbar_left">
        <a href="\">{company}</a>
      </div>
      {/* Center Tab Bar */}
      <div className="navbar">
        {services.map((svc) => (
          <a key={svc.id} href={svc.href}
            className={"tab " + (activeServiceId === svc.id ? "tab_active" : "")}
          >
            {svc.label}
          </a>
        ))}
      </div>
      {/* Right Side */}
      <div className="topbar_right">
        {isAuthed && role === 'Admin' && (
          <button onClick={onAdminPanelClick} className="btn btn-info">
            Admin Panel
          </button>
        )}
        <button
          ref={btnRef}
          className="userbtn"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-controls="user-menu"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          {isAuthed ? (
            <span>👤 {username} ({role})</span>
          ) : (
            <span>Login</span>
          )}
        </button>
        {dropdownOpen && (
          <div
            id="user-menu"
            role="menu"
            ref={dropdownRef}
            className="dropdown"
            aria-label={isAuthed ? "User menu" : "Login form"}
          >
            {!isAuthed ? (
              <UserLogin></UserLogin>
            ) : (
              <UserLogout></UserLogout>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Topbar;
