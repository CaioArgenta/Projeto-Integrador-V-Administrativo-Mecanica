import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { NumericFormat } from "react-number-format"; 
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

const styles = {
  button: {
    padding: '10px 20px',
    backgroundColor: '#0056b3',
    color: '#fff',
    borderRadius: '4px',
    marginBottom: '10px',
  },
};

const AgendamentoForm = ({
  editingAgendamento,
  setIsModalVisible,
  setEditingAgendamento,
  fetchAgendamentos,
  clientes,
  mecanicos,
}) => {
  const [formData, setFormData] = useState({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    codigoCliente: "",
    idMecanico: "",
    modelo: "",
    anoVeiculo: "",
    placa: "",
    descricaoServico: "",
    dataServico: "",
    valorServico: "",
    situacao: "Serviço Aberto",
    categoria: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAgendamento) {
      setFormData(editingAgendamento);
    } else {
      setFormData({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        codigoCliente: "",
        idMecanico: "",
        modelo: "",
        anoVeiculo: "",
        placa: "",
        descricaoServico: "",
        dataServico: "",
        valorServico: "",
        situacao: "Serviço Aberto",
        categoria: "",
      });
    }
    setErrors({});
  }, [editingAgendamento]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idMecanico) newErrors.idMecanico = "Selecione um mecânico";
    if (!formData.codigoCliente) newErrors.codigoCliente = "Selecione um cliente";
    if (!formData.modelo || !/^[A-Za-zÀ-ÿ0-9\s]+$/.test(formData.modelo)) {
      newErrors.modelo = "Modelo inválido";
    }
    if (!formData.placa || !/^[A-Za-z0-9]{7}$/.test(formData.placa)) {
      newErrors.placa = "Placa inválida (7 caracteres alfanuméricos)";
    }
    if (!formData.descricaoServico || !/^[A-Za-zÀ-ÿ0-9\s]+$/.test(formData.descricaoServico)) {
      newErrors.descricaoServico = "Descrição inválida";
    }
    if (!formData.categoria) newErrors.categoria = "Selecione uma categoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingAgendamento) {
        await axios.put(`https://projeto-integrador-v-administrativo.onrender.com/ordemDeServico/${editingAgendamento.id}`, formData);
      } else {
        await axios.post("https://projeto-integrador-v-administrativo.onrender.com/ordemDeServico", formData);
      }
      fetchAgendamentos();
      setIsModalVisible(false);
      setEditingAgendamento(null);
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  return (
    <form className="form">
      <div className="form-group">
        <label>Número da OS (ID)</label>
        <input type="text" name="id" value={formData.id} disabled />
      </div>

      <div className="form-group">
        <label>Cliente</label>
        <Dropdown
          value={formData.codigoCliente}
          options={clientes}
          optionLabel="nome"
          optionValue="id"
          onChange={(e) => handleDropdownChange("codigoCliente", e.value)}
          placeholder="Selecione o cliente"
          filter
          showClear
        />
        {errors.codigoCliente && <small className="p-error">{errors.codigoCliente}</small>}
      </div>

      <div className="form-group">
        <label>Mecânico</label>
        <Dropdown
          value={formData.idMecanico}
          options={mecanicos}
          optionLabel="nomeMecanico"
          optionValue="id"
          onChange={(e) => handleDropdownChange("idMecanico", e.value)}
          placeholder="Selecione o mecânico"
          filter
          showClear
        />
        {errors.idMecanico && <small className="p-error">{errors.idMecanico}</small>}
      </div>

      <div className="form-group">
        <label>Modelo</label>
        <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} />
        {errors.modelo && <small className="p-error">{errors.modelo}</small>}
      </div>

      <div className="form-group">
        <label>Ano Veículo</label>
        <input
          type="number"
          name="anoVeiculo"
          min="1900"
          max={new Date().getFullYear()}
          value={formData.anoVeiculo}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Placa</label>
        <input type="text" name="placa" value={formData.placa} onChange={handleChange} />
        {errors.placa && <small className="p-error">{errors.placa}</small>}
      </div>

      <div className="form-group">
        <label>Descrição do Serviço</label>
        <input type="text" name="descricaoServico" value={formData.descricaoServico} onChange={handleChange} />
        {errors.descricaoServico && <small className="p-error">{errors.descricaoServico}</small>}
      </div>

      <div className="form-group">
        <label>Data do Serviço</label>
        <input type="date" name="dataServico" value={formData.dataServico} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Valor do Serviço</label>
        <NumericFormat
          name="valorServico"
          value={formData.valorServico}
          onValueChange={(values) =>
            handleChange({ target: { name: "valorServico", value: values.value } })
          }
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          allowNegative={false}
          isNumericString
        />
      </div>

      <div className="form-group">
        <label>Situação</label>
        <Dropdown
          value={formData.situacao}
          options={[
            { label: "Serviço em Aberto", value: "Serviço Aberto" },
            { label: "Serviço Fechado", value: "Serviço Fechado" },
            { label: "Serviço Cancelado", value: "Serviço Cancelado" },
          ]}
          onChange={(e) => handleDropdownChange("situacao", e.value)}
          placeholder="Selecione a situação"
          filter
        />
      </div>

      <div className="form-group">
        <label>Categoria</label>
        <Dropdown
          value={formData.categoria}
          options={[
            { label: "Serviço", value: "Serviço" },
            { label: "Compra", value: "Compra" },
            { label: "Outros", value: "Outros" },
          ]}
          onChange={(e) => handleDropdownChange("categoria", e.value)}
          placeholder="Selecione a categoria"
          filter
        />
        {errors.categoria && <small className="p-error">{errors.categoria}</small>}
      </div>

      <div className="form-buttons">
        <Button
          type="button"
          label={editingAgendamento ? "Atualizar" : "Salvar"}
          onClick={handleSave}
          className="p-button-success"
        />
        <Button
          type="button"
          label="Cancelar"
          onClick={() => {
            setIsModalVisible(false);
            setEditingAgendamento(null);
            setErrors({});
          }}
          className="p-button-secondary"
        />
      </div>
    </form>
  );
};

const AgendamentoServicos = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [agendamentosComNomes, setAgendamentosComNomes] = useState([]);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [ordemRes, clienteRes, mecanicoRes] = await Promise.all([
        axios.get("https://projeto-integrador-v-administrativo.onrender.com/ordemDeServico"),
        axios.get("https://projeto-integrador-v-administrativo.onrender.com/clientes"),
        axios.get("https://projeto-integrador-v-administrativo.onrender.com/mecanicos")
      ]);

      setAgendamentos(ordemRes.data);
      setClientes(clienteRes.data);
      setMecanicos(mecanicoRes.data);

      const agendamentosComNomes = ordemRes.data.map((item) => {
        const cliente = clienteRes.data.find((c) => c.id === item.codigoCliente);
        const mecanico = mecanicoRes.data.find((m) => m.id === item.idMecanico);

        return {
          ...item,
          nomeCliente: cliente ? cliente.nome : "Não encontrado",
          nomeMecanico: mecanico ? mecanico.nomeMecanico : "Não encontrado"
        };
      });

      setAgendamentosComNomes(agendamentosComNomes);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  const deleteAgendamento = async (id) => {
    if (window.confirm("Deseja realmente excluir este agendamento?")) {
      try {
        await axios.delete(`https://projeto-integrador-v-administrativo.onrender.com/ordemDeServico/${id}`);
        fetchAllData();
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
      }
    }
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-mr-2"
        onClick={() => {
          setEditingAgendamento(rowData);
          setIsModalVisible(true);
        }}
        aria-label="Editar"
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => deleteAgendamento(rowData.id)}
        aria-label="Excluir"
      />
    </>
  );

  return (
    <div className="agendamento-container" style={{ padding: "20px" }}>
      <h2>Agendamentos de Serviços</h2>
      <Button
        label="Novo Agendamento"
        icon="pi pi-plus"
        onClick={() => {
          setEditingAgendamento(null);
          setIsModalVisible(true);
        }}
      />

      <DataTable
        value={agendamentosComNomes}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        emptyMessage="Nenhum agendamento encontrado."
        responsiveLayout="scroll"
        removableSort
        showGridlines
        sortMode="multiple"
        tableStyle={{ minWidth: "60rem" }}
      >
        <Column field="id" header="Nº OS" sortable style={{ width: "8rem" }} />
        <Column
          field="nomeCliente"
          header="Cliente"
          sortable
          filter
          filterPlaceholder="Buscar cliente"
          style={{ width: "15rem" }}
        />
        <Column
          field="nomeMecanico"
          header="Mecânico"
          sortable
          filter
          filterPlaceholder="Buscar mecânico"
          style={{ width: "15rem" }}
        />
        <Column field="modelo" header="Modelo" sortable filter filterPlaceholder="Buscar modelo" />
        <Column field="anoVeiculo" header="Ano" sortable style={{ width: "6rem" }} />
        <Column field="placa" header="Placa" sortable style={{ width: "10rem" }} />
        <Column field="descricaoServico" header="Descrição" sortable filter filterPlaceholder="Buscar serviço" />
        <Column field="dataServico" header="Data Serviço" sortable style={{ width: "10rem" }} />
        <Column
          field="valorServico"
          header="Valor"
          body={(row) =>
            row.valorServico
              ? `R$ ${parseFloat(row.valorServico).toFixed(2).replace(".", ",")}`
              : "R$ 0,00"
          }
          sortable
          style={{ width: "10rem" }}
        />
        <Column field="situacao" header="Situação" sortable style={{ width: "12rem" }} />
        <Column
          header="Ações"
          body={actionBodyTemplate}
          style={{ width: "8rem" }}
          exportable={false}
        />
      </DataTable>

      <Dialog
        header={editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
        visible={isModalVisible}
        style={{ width: "600px" }}
        onHide={() => {
          setIsModalVisible(false);
          setEditingAgendamento(null);
        }}
        modal
      >
        <AgendamentoForm
          editingAgendamento={editingAgendamento}
          setIsModalVisible={setIsModalVisible}
          setEditingAgendamento={setEditingAgendamento}
          fetchAgendamentos={fetchAllData}
          clientes={clientes}
          mecanicos={mecanicos}
        />
      </Dialog>
    </div>
  );
};
export default AgendamentoServicos;
