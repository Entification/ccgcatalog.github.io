import { Outlet, NavLink } from "react-router-dom";
import { ImageViewerProvider } from "./components/ImageViewer";

export default function App() {
  const link = "px-4 py-2 rounded-xl hover:bg-neutral-800";
  const active = "bg-accent text-white";

  return (
    <ImageViewerProvider>
      <div className="min-h-full">
        <header className="sticky top-0 z-40 backdrop-blur bg-neutral-950/70 border-b border-neutral-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
            <div className="text-xl font-semibold">CCG Yugioh Community</div>
            <nav className="flex gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${link} ${isActive ? active : ""}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/releases"
                className={({ isActive }) =>
                  `${link} ${isActive ? active : ""}`
                }
              >
                Set Releases
              </NavLink>
              <NavLink
                to="/cards"
                className={({ isActive }) =>
                  `${link} ${isActive ? active : ""}`
                }
              >
                Card Database
              </NavLink>
              <NavLink
                to="/banlist"
                className={({ isActive }) =>
                  `${link} ${isActive ? active : ""}`
                }
              >
                Ban List
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <Outlet />
        </main>
        <footer className="max-w-6xl mx-auto p-6 text-sm text-neutral-400">
          © {new Date().getFullYear()} CCG Yugioh Community
        </footer>
      </div>
    </ImageViewerProvider>
  );
}
