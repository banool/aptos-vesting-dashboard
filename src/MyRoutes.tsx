import { Route, Routes } from "react-router-dom";
import { InteractPage } from "./pages/InteractPage";
import { LandingPage } from "./pages/LandingPage";
import MainLayout from "./layouts/MainLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function MyRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        }
      />
      <Route
        path="/interact"
        element={
          <MainLayout>
            <InteractPage />
          </MainLayout>
        }
      />
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFoundPage />
          </MainLayout>
        }
      />
    </Routes>
  );
}
