import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="logo">
        Thiago Informa
      </div>

      <ul>

        <li>
          <Link to="/home">Home</Link>
        </li>

        <li>
          <Link to="/informativos">
            Informativos
          </Link>
        </li>

        <li>
          <Link to="/projetos">
            Projetos
          </Link>
        </li>

        {role === "admin" && (
          <li>
            <Link to="/admin">
              Administração
            </Link>
          </li>
        )}

        <li>
          <button
            className="logout-btn"
            onClick={logout}
          >
            Sair
          </button>
        </li>

      </ul>

    </nav>
  );
}

export default Navbar;