import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import AgendamentoServicos from "./ordemDeServico";
import CadastroMecanico from "./cadastroMecanico";
import Caixa from "./caixa";
import CadastroClientesForm from "./cadastroCliente";
import "./App.css";

//npx json-server --watch bancoPI.json -p 4000

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink to="/cadastro-cliente" className={({ isActive }) => isActive ? "active" : ""}>
            Clientes
          </NavLink>
        </li>
        <li>
          <NavLink to="/cadastro-mecanico" className={({ isActive }) => isActive ? "active" : ""}>
            Mecânicos
          </NavLink>
        </li>
        <li>
          <NavLink to="/agendamento-servicos" className={({ isActive }) => isActive ? "active" : ""}>
            Agendamentos
          </NavLink>
        </li>
        <li>
          <NavLink to="/caixa" className={({ isActive }) => isActive ? "active" : ""}>
            Caixa
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

function ContentWrapper() {
  return (
    <div className="content">
      <Routes>
        <Route path="/agendamento-servicos" element={<AgendamentoServicos />} />
        <Route path="/cadastro-mecanico" element={<CadastroMecanico />} />
        <Route path="/caixa" element={<Caixa />} />
        <Route path="/cadastro-cliente" element={<CadastroClientesForm />} />
        <Route path="/" element={<h1>Bem-vindo ao sistema! 🚀</h1>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <NavBar />
      <ContentWrapper />
    </Router>
  );
}
