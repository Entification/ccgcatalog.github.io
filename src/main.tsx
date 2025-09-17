import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";

const Home = lazy(() => import("./pages/Home"));
const Releases = lazy(() => import("./pages/Releases"));
const Cards = lazy(() => import("./pages/Cards"));
const BanList = lazy(() => import("./pages/BanList"));

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Home /> },
        { path: "releases", element: <Releases /> },
        { path: "cards", element: <Cards /> },
        { path: "banlist", element: <BanList /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
