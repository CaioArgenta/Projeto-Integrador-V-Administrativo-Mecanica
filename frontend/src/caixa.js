import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "../App.css";

function Caixa() {
  const [clientes, setClientes] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);

  const API_BASE = "https://projeto-integrador-v-administrativo.onrender.com";

  useEffect(() => {
    axios.get(`${API_BASE}/clientes`)
      .then((res) => {
        setClientes(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Erro ao buscar clientes", err));

    axios.get(`${API_BASE}/ordemDeServico`)
      .then((res) => {
        setOrdens(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Erro ao buscar ordens", err));

    axios.get(`${API_BASE}/caixa`)
      .then((res) => {
        setPagamentos(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Erro ao buscar caixa", err);
        setPagamentos([]); // Garante que pagamentos seja array
      });
  }, []);

  const getClienteNome = (id) => {
    const cliente = clientes.find((c) => c.id === id);
    return cliente ? cliente.nome : "Desconhecido";
  };

  const formatarValor = (valor) => {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="container">
      <h2>Controle de Caixa</h2>
      <DataTable value={Array.isArray(pagamentos) ? pagamentos : []} paginator rows={5} stripedRows>
        <Column field="id" header="ID" />
        <Column
          field="clienteId"
          header="Cliente"
          body={(rowData) => getClienteNome(rowData.clienteId)}
        />
        <Column field="descricao" header="Descrição" />
        <Column
          field="valor"
          header="Valor"
          body={(rowData) => formatarValor(rowData.valor)}
        />
        <Column field="formaPagamento" header="Forma de Pagamento" />
        <Column field="data" header="Data" />
      </DataTable>
    </div>
  );
}

export default Caixa;
