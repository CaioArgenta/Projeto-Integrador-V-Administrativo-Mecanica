import React, { useState, useEffect } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import axios from "axios";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";
import { locale, addLocale } from "primereact/api";

addLocale('pt', {
  startsWith: 'Começa com',
  contains: 'Contém',
  notContains: 'Não contém',
  endsWith: 'Termina com',
  equals: 'Igual',
  notEquals: 'Diferente',
  noFilter: 'Sem Filtro',
  filter: 'Filtrar',
  lt: 'Menor que',
  lte: 'Menor ou igual a',
  gt: 'Maior que',
  gte: 'Maior ou igual a',
  dateIs: 'Data é',
  dateIsNot: 'Data não é',
  dateBefore: 'Data antes de',
  dateAfter: 'Data depois de',
  clear: 'Limpar',
  apply: 'Aplicar',
  matchAll: 'Corresponde a todos',
  matchAny: 'Corresponde a qualquer',
  addRule: 'Adicionar Regra',
  removeRule: 'Remover Regra',
  accept: 'Sim',
  reject: 'Não',
  choose: 'Escolher',
  upload: 'Upload',
  cancel: 'Cancelar',
  dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  dayNamesMin: ["Do","Se","Te","Qa","Qi","Sx","Sa"],
  monthNames: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
  monthNamesShort: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  today: 'Hoje',
  weekHeader: 'Sem',
  firstDayOfWeek: 0,
  dateFormat: 'dd/mm/yy',
  weak: 'Fraco',
  medium: 'Médio',
  strong: 'Forte',
  passwordPrompt: 'Digite uma senha'
});

locale('pt');

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function Caixa() {
  const [clientes, setClientes] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [selectedOrdens, setSelectedOrdens] = useState([]);
  const [formData, setFormData] = useState({
    formaPagamento: "",
    pagamento: "",
    valorPago: "",
    numeroParcelas: "1/1",
    observacoes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resClientes = await axios.get(`${API_URL}/clientes`);
        setClientes(Array.isArray(resClientes.data) ? resClientes.data : []);

        const resOrdens = await axios.get(`${API_URL}/ordemDeServico`);
        setOrdens(Array.isArray(resOrdens.data) ? resOrdens.data : []);

        const resPagamentos = await axios.get(`${API_URL}/caixa`);
        if (Array.isArray(resPagamentos.data)) {
          setPagamentos(resPagamentos.data);
        } else {
          console.error("Pagamentos não é array:", resPagamentos.data);
          setPagamentos([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setClientes([]);
        setOrdens([]);
        setPagamentos([]);
      }
    };

    fetchData();
  }, []);

  const selecionarCliente = (clienteId) => {
    if (!Array.isArray(clientes)) {
      setClienteSelecionado(null);
      setSelectedOrdens([]);
      return;
    }
    const cliente = clientes.find((cli) => cli.id === clienteId) || null;
    setClienteSelecionado(cliente);
    setSelectedOrdens([]);
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pagamentosArray = Array.isArray(pagamentos) ? pagamentos : [];
  const ordensArray = Array.isArray(ordens) ? ordens : [];

  const ordensDoCliente = clienteSelecionado
    ? ordensArray.filter((ordem) => ordem.codigoCliente === clienteSelecionado.id)
    : [];

  const ordensDoClienteArray = Array.isArray(ordensDoCliente) ? ordensDoCliente : [];

  console.log("pagamentos tipo e valor:", typeof pagamentos, pagamentos);
  console.log("ordensDoCliente tipo e valor:", typeof ordensDoCliente, ordensDoCliente);

  const pagamentosDoCliente = clienteSelecionado && pagamentosArray.length && ordensDoClienteArray.length
    ? pagamentosArray.filter((pag) =>
        ordensDoClienteArray.some((ordem) => ordem.id === pag.idOrdemDeServico)
      )
    : [];

  const ordensSemPagamento = ordensDoClienteArray.filter((ordem) => {
    const totalPago = pagamentosDoCliente
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
    return totalPago < parseFloat(ordem.valorServico || 0);
  });

  const saldoDevedor = ordensDoClienteArray.reduce((total, ordem) => {
    const totalPago = pagamentosDoCliente
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
    return total + (parseFloat(ordem.valorServico || 0) - totalPago);
  }, 0);

  const totalDevedores = ordensArray.reduce((total, ordem) => {
    const totalPago = pagamentosArray
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
    return total + (parseFloat(ordem.valorServico || 0) - totalPago);
  }, 0);

  const totalPago = pagamentosArray.reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

  const clientesDevedores = Array.isArray(clientes) && ordensArray.length && pagamentosArray.length
    ? clientes.filter((cliente) => {
        const ordensCliente = ordensArray.filter((ordem) => ordem.codigoCliente === cliente.id);
        const totalDevido = ordensCliente.reduce((total, ordem) => {
          const totalPago = pagamentosArray
            .filter((pag) => pag.idOrdemDeServico === ordem.id)
            .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
          return total + (parseFloat(ordem.valorServico || 0) - totalPago);
        }, 0);
        return totalDevido > 0;
      })
    : [];

  const handleNumeroParcelasChange = (e) => {
    const value = e.target.value;
    if (/^[\d/]*$/.test(value)) {
      if (!value.includes('/')) {
        setFormData((prev) => ({ ...prev, numeroParcelas: prev.numeroParcelas }));
      } else {
        setFormData((prev) => ({ ...prev, numeroParcelas: value }));
      }
    } else {
      alert("Por favor, insira apenas números e o caractere '/'.");
    }
  };

  const handleConfirm = async () => {
    if (
      !clienteSelecionado ||
      !formData.formaPagamento ||
      !formData.pagamento ||
      !formData.valorPago ||
      selectedOrdens.length === 0
    ) {
      alert("Preencha todos os campos e selecione ao menos uma O.S.");
      return;
    }

    try {
      const numeroParcelas = formData.numeroParcelas;

      await Promise.all(
        selectedOrdens.map((ordem) => {
          const totalPago = pagamentosDoCliente
            .filter((pag) => pag.idOrdemDeServico === ordem.id)
            .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

          const novoTotalPago = totalPago + parseFloat(formData.valorPago);

          return axios.post(`${API_URL}/caixa`, {
            idOrdemDeServico: ordem.id,
            valorServico: ordem.valorServico,
            valorPago: formData.valorPago,
            emissao: formData.pagamento,
            numeroParcelas: numeroParcelas,
            formaPagamento: formData.formaPagamento,
            observacoes: formData.observacoes,
            situacaoCaixa:
              novoTotalPago >= parseFloat(ordem.valorServico) ? "Pago" : "Parcial",
          });
        })
      );

      alert("Recebimento confirmado com sucesso!");

      const pagamentosAtualizados = await axios.get(`${API_URL}/caixa`);
      setPagamentos(Array.isArray(pagamentosAtualizados.data) ? pagamentosAtualizados.data : []);
      setSelectedOrdens([]);
      setFormData({
        formaPagamento: "",
        pagamento: "",
        valorPago: "",
        numeroParcelas: "1/1",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      alert("Erro ao confirmar pagamento. Veja o console para detalhes.");
    }
  };

  return (
    <div className="contas-receber-container">
      <h2 className="title">Caixa</h2>

      <h3 className="section-title">Informações Financeiras</h3>
      <div className="informacoes-financeiras">
        <div className="form-group-inline">
          <label className="form-label">Total de Devedores</label>
          <input
            className="form-input"
            type="text"
            value={totalDevedores.toFixed(2)}
            readOnly
          />
        </div>
        <div className="form-group-inline">
          <label className="form-label">Total Pago</label>
          <input
            className="form-input"
            type="text"
            value={totalPago.toFixed(2)}
            readOnly
          />
        </div>
      </div>

      <h3 className="section-title">Devedores</h3>
      <DataTable
        value={clientesDevedores}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
        showGridlines
        tableStyle={{ minWidth: "50rem" }}
        dataKey="id"
      >
        <Column
          field="nome"
          header="Nome do Cliente"
          sortable
          filter
          filterPlaceholder="Filtrar por nome"
        />
        <Column
          field="cpfCnpj"
          header="CPF/CNPJ"
          sortable
          filter
          filterPlaceholder="Filtrar CPF/CNPJ"
        />
        <Column
          header="Valor Devido"
          body={(rowData) => {
            const ordensCliente = ordensArray.filter((ordem) => ordem.codigoCliente === rowData.id);
            const totalDevido = ordensCliente.reduce((total, ordem) => {
              const totalPago = pagamentosArray
                .filter((pag) => pag.idOrdemDeServico === ordem.id)
                .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
              return total + (parseFloat(ordem.valorServico || 0) - totalPago);
            }, 0);
            return `R$ ${totalDevido.toFixed(2)}`;
          }}
        />
      </DataTable>

      <h3 className="section-title">Identificação do Cliente</h3>
      <div className="pesquisa-form">
        <div className="identificacao">
          <label className="form-label">Cliente</label>
          <Dropdown
            value={clienteSelecionado?.id || ""}
            options={clientes}
            optionLabel="nome"
            optionValue="id"
            onChange={(e) => selecionarCliente(e.value)}
            placeholder="Selecione o cliente"
            filter
            showClear
          />
          <label className="form-label">CPF/CNPJ</label>
          <Dropdown
            value={clienteSelecionado?.id || ""}
            options={clientes}
            optionLabel="cpfCnpj"
            optionValue="id"
            onChange={(e) => selecionarCliente(e.value)}
            placeholder="Selecione pelo CPF/CNPJ"
            filter
            showClear
          />
        </div>
      </div>

      <h3 className="section-title">Selecionar O.S para pagamento</h3>
      <DataTable
        value={ordensSemPagamento}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
        showGridlines
        tableStyle={{ minWidth: "50rem" }}
        selection={selectedOrdens}
        onSelectionChange={(e) => setSelectedOrdens(e.value)}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column
          field="id"
          header="Número O.S"
          sortable
          filter
          filterPlaceholder="Filtrar por O.S"
        />
        <Column
          field="valorServico"
          header="Valor Total"
          sortable
          filter
          filterPlaceholder="Filtrar valor"
        />
        <Column
          field="descricaoServico"
          header="Descrição"
          sortable
          filter
          filterPlaceholder="Filtrar descrição"
        />
        <Column
          field="categoria"
          header="Categoria"
          sortable
          filter
          filterPlaceholder="Filtrar categoria"
        />
        <Column
          field="situacao"
          header="Situação"
          sortable
          filter
          filterPlaceholder="Filtrar situação"
        />
      </DataTable>

      <h3 className="section-title">O.S Pagas</h3>
      <DataTable
        value={pagamentosDoCliente}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 20, 50]}
        showGridlines
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          field="idOrdemDeServico"
          header="Número O.S"
          sortable
          filter
          filterPlaceholder="Filtrar por O.S"
        />
        <Column
          field="valorServico"
          header="Valor Total"
          sortable
          filter
          filterPlaceholder="Filtrar valor"
        />
        <Column
          field="valorPago"
          header="Valor Pago"
          sortable
          filter
          filterPlaceholder="Filtrar valor pago"
        />
        <Column
          field="emissao"
          header="Emissão"
          sortable
          filter
          filterPlaceholder="Filtrar por data"
        />
        <Column
          field="numeroParcelas"
          header="Nº de Parcelas"
          sortable
          filter
          filterPlaceholder="Filtrar parcelas"
        />
        <Column
          field="formaPagamento"
          header="Forma de Pagamento"
          sortable
          filter
          filterPlaceholder="Filtrar forma"
        />
        <Column
          field="situacaoCaixa"
          header="Situação"
          sortable
          filter
          filterPlaceholder="Filtrar situação"
        />
        <Column
          field="observacoes"
          header="Observações"
        />
      </DataTable>

      <h3 className="section-title">Pagamento</h3>
      <div className="valores">
        <div className="form-group-inline">
          <label className="form-label">Saldo Devedor</label>
          <input
            className="form-input"
            type="text"
            value={saldoDevedor.toFixed(2)}
            readOnly
          />
        </div>
        <div className="form-group-inline">
          <label className="form-label">Valor a Pagar</label>
          <input
            className="form-input"
            type="number"
            value={formData.valorPago}
            onChange={(e) =>
              setFormData({ ...formData, valorPago: e.target.value })
            }
          />
        </div>
        <div className="form-group-inline">
          <label className="form-label">Número de Parcelas</label>
          <input
            type="text"
            className="form-input"
            value={formData.numeroParcelas}
            onChange={handleNumeroParcelasChange}
          />
        </div>
        <div className="form-group-inline">
          <label>Forma de Pagamento</label>
          <Dropdown
            value={formData.formaPagamento}
            options={[
              { label: "Pix", value: "Pix" },
              { label: "Dinheiro", value: "Dinheiro" },
              { label: "Crédito", value: "Crédito" },
              { label: "Débito", value: "Débito" },
            ]}
            onChange={(e) => handleDropdownChange("formaPagamento", e.value)}
            placeholder="Selecione a Forma de Pagamento"
            filter
          />
        </div>
        <div className="form-group-inline">
          <label className="form-label">Data de Pagamento</label>
          <input
            type="date"
            className="form-input"
            value={formData.pagamento}
            onChange={(e) =>
              setFormData({ ...formData, pagamento: e.target.value })
            }
          />
        </div>
        <div className="form-group-inline">
          <label className="form-label">Observações</label>
          <input
            type="text"
            className="form-input"
            value={formData.observacoes}
            onChange={(e) =>
              setFormData({ ...formData, observacoes: e.target.value })
            }
          />
        </div>
      </div>

      <Button
        label="Confirmar Recebimento"
        icon="pi pi-check"
        onClick={handleConfirm}
      />
    </div>
  );
}
