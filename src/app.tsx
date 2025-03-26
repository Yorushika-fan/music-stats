import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Loading from "./components/common/loading";
import Layout from "./components/layout/layout";
import { I18nProvider } from "./providers/i18n-provider";

// Lazy load page components
const Home = lazy(() => import("./components/pages/home"));
const Login = lazy(() => import("./components/pages/auth/login"));
const Callback = lazy(() => import("./components/pages/auth/callback"));
const Stats = lazy(() => import("./components/pages/stats"));
const Playlists = lazy(() => import("./components/pages/playlists"));
const Downloads = lazy(() => import("./components/pages/downloads"));

function App() {
  return (
    <div className="w-full h-full">
      <I18nProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/callback" element={<Callback />} />
                  <Route path="/stats" element={<Stats />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/downloads" element={<Downloads />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </BrowserRouter>
      </I18nProvider>
    </div>
  );
}

export default App;
