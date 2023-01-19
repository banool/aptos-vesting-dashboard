import { Navigate, Route, Routes } from "react-router-dom";
import { TransactPage } from "./pages/TransactPage";
import { ExplorePage } from "./pages/ExplorePage";
import MainLayout from "./layouts/MainLayout";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function MyRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/explore" replace />} />
      <Route
        path="/explore"
        element={
          <MainLayout>
            <ExplorePage />
          </MainLayout>
        }
      />
      <Route
        path="/transact"
        element={
          <MainLayout>
            <TransactPage />
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
