import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import AgendamentoServicos from "./ordemDeServico";
import CadastroMecanico from "./cadastroMecanico";
import ContasReceberPorCliente from "./contasReceberCliente";
import CadastroClientesForm from "./cadastroCliente";
import "./App.css"; 


//npx json-server --watch bancoPI.json -p 4000

function NavBar() {
  return (
    <nav className="navbar">
      <ul>
        <li><NavLink to="/cadastro-cliente" activeClassName="active">Clientes</NavLink></li>
        <li><NavLink to="/cadastro-mecanico" activeClassName="active">Mecânicos</NavLink></li>
        <li><NavLink to="/agendamento-servicos" activeClassName="active">Agendamentos</NavLink></li>
        <li><NavLink to="/contas-receber-cliente" activeClassName="active">Contas a Receber</NavLink></li>
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
        <Route path="/contas-receber-cliente" element={<ContasReceberPorCliente />} />
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
