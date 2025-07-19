import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from "react-router-dom";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "./App.css";

const AppContent = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('https://projeto-integrador-v-administrativo.onrender.com/clientes');
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao obter clientes:', error);
      }
    };
    fetchClients();
  }, []);

  const excluirCliente = async (id) => {
    try {
      await axios.delete(`https://projeto-integrador-v-administrativo.onrender.com/clientes/${id}`);
      setClients(clients.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o cliente:", error);
    }
  };

  const editarCliente = (client) => {
    setEditingClient(client);
    setIsModalVisible(true);
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning"
        onClick={() => editarCliente(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => excluirCliente(rowData.id)}
      />
    </>
  );

  const CadastroClientesForm = () => {
    const [formData, setFormData] = useState({
      nome: "",
      dataNascimento: "",
      cpfCnpj: "",
      rg: "",
      enderecoResidencial: "",
      contato: "",
    });
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const fieldLabels = {
      nome: "Nome",
      dataNascimento: "Data de Nascimento",
      cpfCnpj: "CPF/CNPJ",
      rg: "RG",
      enderecoResidencial: "Endereço Residencial",
      contato: "Contato"
    };

    useEffect(() => {
      if (editingClient) setFormData(editingClient);
    }, [editingClient]);

    useEffect(() => {
      const newErrors = {};

      if (!formData.nome.trim()) newErrors.nome = "Campo obrigatório";
      else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.nome)) newErrors.nome = "Apenas letras permitidas";

      if (!formData.cpfCnpj.trim()) newErrors.cpfCnpj = "Campo obrigatório";
      else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpfCnpj)) newErrors.cpfCnpj = "CPF inválido";

      if (formData.rg && !/^\d{2}\.\d{3}\.\d{3}-\d{1,2}$/.test(formData.rg)) newErrors.rg = "RG inválido";

      if (formData.contato && !/^\+\d{2} \(\d{2}\) \d{5}-\d{4}$/.test(formData.contato)) newErrors.contato = "Número inválido";

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }, [formData]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;

      if (name === "cpfCnpj") {
        newValue = value.replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
          .substring(0, 14);
      }

      if (name === "contato") {
        newValue = value.replace(/\D/g, '')
          .replace(/^(\d{2})(\d)/g, '+$1 ($2')
          .replace(/(\d{2})(\d)/, '$1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .substring(0, 19);
      }

      if (name === "rg") {
        newValue = value.replace(/\D/g, '')
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
          .substring(0, 12);
      }

      if (name === "nome") {
        newValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
      }

      setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
      if (!isValid) return;

      try {
        if (editingClient) {
          await axios.put(`https://projeto-integrador-v-administrativo.onrender.com/clientes/${editingClient.id}`, formData);
        } else {
          await axios.post('https://projeto-integrador-v-administrativo.onrender.com/clientes', formData);
        }

        setIsModalVisible(false);
        setEditingClient(null);

        const response = await axios.get('https://projeto-integrador-v-administrativo.onrender.com/clientes');
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }
    };

    return (
      <form className="form">
        {Object.keys(formData).map(field => (
          <div className="form-group" key={field}>
            <label>{fieldLabels[field] || field}</label>
            <input
              type={field === "dataNascimento" ? "date" : "text"}
              name={field}
              value={formData[field]}
              onChange={handleChange}
            />
            {errors[field] && <p className="error-message">{errors[field]}</p>}
          </div>
        ))}
        <div className="form-buttons">
          <Button label="Salvar" onClick={handleSave} className="p-button-success" disabled={!isValid} />
          <Button label="Cancelar" onClick={() => { setIsModalVisible(false); setEditingClient(null); }} className="p-button-secondary" />
        </div>
      </form>
    );
  };

  return (
    <div>
      <h2>Lista de Clientes</h2>
      <div className="table-header">
        <Button label="Novo Cadastro de Cliente"
        icon="pi pi-plus"
        onClick={() => { setIsModalVisible(true); setEditingClient(null); }} />
      </div>
      <DataTable
        value={clients}
        paginator rows={5} rowsPerPageOptions={[5, 10, 20]}
        showGridlines
        tableStyle={{ minWidth: '50rem' }}
        sortMode="multiple"
        emptyMessage="Nenhum cliente encontrado."
      >
        <Column field="nome" header="Nome" sortable filter />
        <Column field="dataNascimento" header="Data Nascimento" sortable filter />
        <Column field="cpfCnpj" header="CPF/CNPJ" sortable filter />
        <Column field="rg" header="RG" sortable filter />
        <Column field="enderecoResidencial" header="Endereço Residencial" sortable filter />
        <Column field="contato" header="Contato" sortable filter />
        <Column header="Ações" body={actionBodyTemplate} />
      </DataTable>
      <Dialog visible={isModalVisible} style={{ width: '50%' }} onHide={() => { setIsModalVisible(false); setEditingClient(null); }} header="Cadastro de Cliente">
        <CadastroClientesForm />
      </Dialog>
    </div>
  );
};

export default AppContent;
