import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Informativos from "./pages/Informativos";
import Projetos from "./pages/Projetos";
import Calendario from "./pages/Calendario";
import Admin from "./pages/Admin";

// Proteção para rotas de usuário logado
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/" />;
}

// Proteção exclusiva para Admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return token && role === "admin"
    ? children
    : <Navigate to="/home" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* HOME */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />

        {/* INFORMATIVOS */}
        <Route
          path="/informativos"
          element={
            <PrivateRoute>
              <Informativos />
            </PrivateRoute>
          }
        />

        {/* PROJETOS */}
        <Route
          path="/projetos"
          element={
            <PrivateRoute>
              <Projetos />
            </PrivateRoute>
          }
        />

        {/* CALENDARIO */}
        <Route
          path="/calendario"
          element={
            <PrivateRoute>
              <Calendario />
            </PrivateRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* ROTA NÃO ENCONTRADA */}
        <Route
          path="*"
          element={<Navigate to="/" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;