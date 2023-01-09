import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import MainLayout from "./pages/MainLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function MyRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  );
}
