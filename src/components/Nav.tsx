import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview", end: true },
  { to: "/draft", label: "Draft Board" },
  { to: "/rosters", label: "Rosters" },
  { to: "/standings", label: "Standings" },
  { to: "/matchups", label: "Matchups" },
];

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-title">🏈 AI Model Fantasy League</div>
      <div className="nav-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
