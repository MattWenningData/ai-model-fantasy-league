import { BrowserRouter, Routes, Route, Outlet, useOutletContext } from "react-router-dom";
import Nav from "./components/Nav";
import { useLeagueData } from "./data/useLeagueData";
import type { LeagueData } from "./types";
import Home from "./pages/Home";
import DraftBoard from "./pages/DraftBoard";
import Rosters from "./pages/Rosters";
import Standings from "./pages/Standings";
import Matchups from "./pages/Matchups";
import MatchupDetail from "./pages/MatchupDetail";
import TeamDetail from "./pages/TeamDetail";
import "./App.css";

function Layout() {
  const { data, error } = useLeagueData();

  return (
    <div className="app-shell">
      <Nav />
      <main className="app-main">
        {error && <div className="banner banner-error">Failed to load league data: {error}</div>}
        {!error && !data && <div className="banner">Loading league data…</div>}
        {data && <Outlet context={data} />}
      </main>
    </div>
  );
}

export function useLeague() {
  return useOutletContext<LeagueData>();
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/draft" element={<DraftBoard />} />
          <Route path="/rosters" element={<Rosters />} />
          <Route path="/rosters/:team" element={<TeamDetail />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/matchups" element={<Matchups />} />
          <Route path="/matchups/:week/:home/:away" element={<MatchupDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
