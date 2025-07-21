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
    axios.get("http://localhost:4000/clientes").then((res) => setClientes(res.data));
    axios.get("http://localhost:4000/ordemDeServico").then((res) => setOrdens(res.data));
    axios.get("http://localhost:4000/caixa").then((res) => setPagamentos(res.data));
  }, []);

  const selecionarCliente = (clienteId) => {
    const cliente = clientes.find((cli) => cli.id === clienteId);
    setClienteSelecionado(cliente);
    setSelectedOrdens([]);
  };

  const handleDropdownChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const ordensDoCliente = clienteSelecionado
    ? ordens.filter((ordem) => ordem.codigoCliente === clienteSelecionado.id)
    : [];

  const pagamentosDoCliente = clienteSelecionado
    ? pagamentos.filter((pag) =>
        ordensDoCliente.some((ordem) => ordem.id === pag.idOrdemDeServico)
      )
    : [];

  const ordensSemPagamento = ordensDoCliente.filter((ordem) => {
    const totalPago = pagamentosDoCliente
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

    return totalPago < parseFloat(ordem.valorServico);
  });

  const saldoDevedor = ordensDoCliente.reduce((total, ordem) => {
    const totalPago = pagamentosDoCliente
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

    return total + parseFloat(ordem.valorServico || 0) - totalPago;
  }, 0);

  const totalDevedores = ordens.reduce((total, ordem) => {
    const totalPago = pagamentos
      .filter((pag) => pag.idOrdemDeServico === ordem.id)
      .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

    return total + (parseFloat(ordem.valorServico || 0) - totalPago);
  }, 0);

  const totalPago = pagamentos.reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);

  const clientesDevedores = clientes.filter((cliente) => {
    const ordensCliente = ordens.filter((ordem) => ordem.codigoCliente === cliente.id);
    const totalDevido = ordensCliente.reduce((total, ordem) => {
      const totalPago = pagamentos
        .filter((pag) => pag.idOrdemDeServico === ordem.id)
        .reduce((sum, pag) => sum + parseFloat(pag.valorPago || 0), 0);
      return total + (parseFloat(ordem.valorServico || 0) - totalPago);
    }, 0);
    return totalDevido > 0;
  });

  const handleNumeroParcelasChange = (e) => {
    const value = e.target.value;

    if (/^[\d/]*$/.test(value)) {
      if (!value.includes('/')) {
        setFormData((prev) => ({ ...prev, numeroParcelas: prev.numeroParcelas }));
      } else {
        setFormData({ ...formData, numeroParcelas: value });
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

          return axios.post(`http://localhost:4000/caixa`, {
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

      const pagamentosAtualizados = await axios.get("http://localhost:4000/caixa");
      setPagamentos(pagamentosAtualizados.data);
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
            const ordensCliente = ordens.filter((ordem) => ordem.codigoCliente === rowData.id);
            const totalDevido = ordensCliente.reduce((total, ordem) => {
              const totalPago = pagamentos
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
        header="Observações" />
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

      <div className="form-buttons">
        <Button
          label="Confirmar Pagamento"
          className="btn btn-confirm"
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
}
