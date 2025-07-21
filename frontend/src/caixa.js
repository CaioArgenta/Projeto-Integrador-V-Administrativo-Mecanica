import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

function Caixa() {
  const [clientes, setClientes] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const clientesRes = await axios.get("https://projeto-integrador-v-administrativo.onrender.com/clientes");
      const pagamentosRes = await axios.get("https://projeto-integrador-v-administrativo.onrender.com/pagamentos");

      console.log("clientes:", clientesRes.data);
      console.log("pagamentos:", pagamentosRes.data);

      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
      setPagamentos(Array.isArray(pagamentosRes.data) ? pagamentosRes.data : []);
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
      setClientes([]);
      setPagamentos([]);
    }
  };

  const handleConfirm = async () => {
    try {
      const novoPagamento = {
        cliente: clienteSelecionado,
        nome,
        valor,
        descricao,
      };

      await axios.post("https://projeto-integrador-v-administrativo.onrender.com/pagamentos", novoPagamento);
      fetchData();
      setClienteSelecionado("");
      setNome("");
      setValor("");
      setDescricao("");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    }
  };

  const ordensDoCliente = Array.isArray(pagamentos)
    ? pagamentos.filter((pagamento) => pagamento.cliente === clienteSelecionado)
    : [];

  console.log("clienteSelecionado:", clienteSelecionado);
  console.log("ordensDoCliente:", ordensDoCliente);

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Controle de Caixa</h2>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1">Cliente</label>
          <InputText value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Nome</label>
          <InputText value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Valor</label>
          <InputText value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Descrição</label>
          <InputText value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>
      </div>

      <Button label="Confirmar" icon="pi pi-check" onClick={handleConfirm} className="mb-4" />

      <DataTable value={ordensDoCliente} paginator rows={5} stripedRows>
        <Column field="nome" header="Nome" />
        <Column field="valor" header="Valor" />
        <Column field="descricao" header="Descrição" />
      </DataTable>
    </div>
  );
}

export default Caixa;
