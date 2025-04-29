import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { NumericFormat } from 'react-number-format'; // Importação correta
import "./App.css";

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
    id: Date.now().toString(),
    codigoCliente: "",
    idMecanico: "",
    modelo: "",
    anoVeiculo: "",
    placa: "",
    descricaoServico: "",
    dataServico: "",
    valorServico: "",
    situacao: "Aberto",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAgendamento) {
      setFormData(editingAgendamento);
    } else {
      setFormData({
        id: Date.now().toString(),
        codigoCliente: "",
        idMecanico: "",
        modelo: "",
        anoVeiculo: "",
        placa: "",
        descricaoServico: "",
        dataServico: "",
        valorServico: "",
        situacao: "Aberto",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
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
        await axios.put(`http://localhost:4000/ordemDeServico/${editingAgendamento.id}`, formData);
      } else {
        await axios.post("http://localhost:4000/ordemDeServico", formData);
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
        <input type="text" name="anoVeiculo" value={formData.anoVeiculo} onChange={handleChange} />
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
          onValueChange={(values) => handleChange({ target: { name: 'valorServico', value: values.value } })}
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
            { label: "Aberto", value: "Aberto" },
            { label: "Fechado", value: "Fechado" },
            { label: "Cancelado", value: "Cancelado" },
          ]}
          onChange={(e) => handleChange("situacao", e.value)}
          placeholder="Selecione a situação"
          filter
        />
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);

  useEffect(() => {
    fetchAgendamentos();
    fetchClientes();
    fetchMecanicos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/ordemDeServico");
      setAgendamentos(response.data);
    } catch (error) {
      console.error("Erro ao obter agendamentos:", error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao obter clientes:", error);
    }
  };

  const fetchMecanicos = async () => {
    try {
      const response = await axios.get("http://localhost:4000/mecanicos");
      setMecanicos(response.data);
    } catch (error) {
      console.error("Erro ao obter mecânicos:", error);
    }
  };

  const excluirAgendamento = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/ordemDeServico/${id}`);
      setAgendamentos(agendamentos.filter((ag) => ag.id !== id));
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
    }
  };

  const editarAgendamento = (agendamento) => {
    setEditingAgendamento(agendamento);
    setIsModalVisible(true);
  };

  const getNomeCliente = (codigoCliente) => {
    const cliente = clientes.find((c) => c.id === codigoCliente);
    return cliente ? cliente.nome : "Desconhecido";
  };

  const getNomeMecanico = (idMecanico) => {
    const mecanico = mecanicos.find((m) => m.id === idMecanico);
    return mecanico ? mecanico.nomeMecanico : "Desconhecido";
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning" onClick={() => editarAgendamento(rowData)} />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => excluirAgendamento(rowData.id)} />
    </>
  );

  return (
    <div>
      <h2>Agendamentos de Serviço</h2>
      <Button label="Adicionar Agendamento" onClick={() => setIsModalVisible(true)}/>
      <DataTable value={agendamentos} showGridlines tableStyle={{ minWidth: "50rem" }}>
        <Column field="id" header="ID OS" />
        <Column field="codigoCliente" header="Cliente" body={(rowData) => getNomeCliente(rowData.codigoCliente)} />
        <Column field="idMecanico" header="Mecânico" body={(rowData) => getNomeMecanico(rowData.idMecanico)} />
        <Column field="modelo" header="Modelo" />
        <Column field="anoVeiculo" header="Ano do Veículo" />
        <Column field="placa" header="Placa" />
        <Column field="descricaoServico" header="Descrição do Serviço" />
        <Column field="dataServico" header="Data do Serviço" />
        <Column
          field="valorServico"
          header="Valor do Serviço"
          body={(rowData) => rowData.valorServico ? rowData.valorServico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
        />
        <Column header="Ações" body={actionBodyTemplate} />
      </DataTable>

      <Dialog
        visible={isModalVisible}
        style={{ width: "50vw" }}
        header={editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
        modal
        onHide={() => {
          setIsModalVisible(false);
          setEditingAgendamento(null);
        }}
      >
        <AgendamentoForm
          editingAgendamento={editingAgendamento}
          setIsModalVisible={setIsModalVisible}
          setEditingAgendamento={setEditingAgendamento}
          fetchAgendamentos={fetchAgendamentos}
          clientes={clientes}
          mecanicos={mecanicos}
        />
      </Dialog>
    </div>
  );
};

export default AgendamentoServicos;
