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

const styles = {
  button: {
    padding: '10px 20px',
    backgroundColor: '#0056b3',
    color: '#fff',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  backButton: {
    padding: '10px 15px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

const CadastroMecanico = () => {
  const [mecanicos, setMecanicos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMecanico, setEditingMecanico] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMecanicos = async () => {
      try {
        const response = await axios.get('https://projeto-integrador-v-administrativo.onrender.com/mecanicos');
        setMecanicos(response.data);
      } catch (error) {
        console.error('Erro ao obter mecânicos da API:', error);
      }
    };
    fetchMecanicos();
  }, []);

  const excluirMecanico = async (id) => {
    try {
      await axios.delete(`https://projeto-integrador-v-administrativo.onrender.com/mecanicos/${id}`);
      setMecanicos(mecanicos.filter((mec) => mec.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o mecânico:", error);
    }
  };

  const editarMecanico = (mec) => {
    setEditingMecanico(mec);
    setIsModalVisible(true);
  };

  const actionBodyTemplate = (rowData) => (
    <>
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning"
        onClick={() => editarMecanico(rowData)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => excluirMecanico(rowData.id)}
      />
    </>
  );

  const CadastroMecanicoForm = () => {
    const [formData, setFormData] = useState({
      nomeMecanico: "",
      dataNascimento: "",
      cpf: "",
      rg: "",
      enderecoResidencial: "",
      contato: "",
      valorSalario: "",
      comissao: "",
    });

    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      if (editingMecanico) setFormData(editingMecanico);
    }, [editingMecanico]);

    useEffect(() => {
      const newErrors = {};

      if (!formData.nomeMecanico.trim()) newErrors.nomeMecanico = "Campo obrigatório";
      else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.nomeMecanico)) newErrors.nomeMecanico = "Apenas letras";

      if (!formData.cpf.trim()) newErrors.cpf = "Campo obrigatório";
      else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) newErrors.cpf = "CPF inválido";

      if (formData.contato && !/^\+\d{2} \(\d{2}\) \d{5}-\d{4}$/.test(formData.contato)) newErrors.contato = "Número inválido";

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
    }, [formData]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;

      if (name === "cpf") {
        newValue = value.replace(/\D/g, '')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
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

      if (name === "nomeMecanico") {
        newValue = value.replace(/[^A-Za-zÀ-ÿ\s]/g, '');
      }

      setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleSave = async () => {
      if (!isValid) return;

      try {
        if (editingMecanico) {
          await axios.put(`https://projeto-integrador-v-administrativo.onrender.com/mecanicos/${editingMecanico.id}`, formData);
        } else {
          await axios.post('https://projeto-integrador-v-administrativo.onrender.com/mecanicos', formData);
        }

        const response = await axios.get('https://projeto-integrador-v-administrativo.onrender.com/mecanicos');
        setMecanicos(response.data);
        setFormData({
          nomeMecanico: "",
          dataNascimento: "",
          cpf: "",
          rg: "",
          enderecoResidencial: "",
          contato: "",
          valorSalario: "",
          comissao: "",
        });
        setIsModalVisible(false);
        setEditingMecanico(null);
      } catch (error) {
        console.error('Erro ao salvar os dados:', error);
      }
    };

    const fieldLabels = {
      nomeMecanico: "Nome",
      dataNascimento: "Data de Nascimento",
      cpf: "CPF",
      rg: "RG",
      enderecoResidencial: "Endereço Residencial",
      contato: "Contato",
      valorSalario: "Salário",
      comissao: "Comissão (%)"
    };

    return (
      <form className="form">
        {Object.keys(formData).map((field) => (
          <div className="form-group" key={field}>
            <label>{fieldLabels[field]}</label>
            <input
              type={field === 'dataNascimento' ? 'date' : field.includes('valor') || field === 'comissao' ? 'number' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
            />
            {errors[field] && <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>{errors[field]}</p>}
          </div>
        ))}
        <div className="form-buttons">
          <Button label={editingMecanico ? "Atualizar" : "Salvar"} onClick={handleSave} className="p-button-success" disabled={!isValid} />
          <Button label="Cancelar" onClick={() => { setIsModalVisible(false); setEditingMecanico(null); }} className="p-button-secondary" />
        </div>
      </form>
    );
  };

  return (
    <div>
      <h2>Lista de Mecânicos</h2>
      <Button
        label="Novo Cadastro de Mecânico"
        icon="pi pi-plus"
        onClick={() => { setIsModalVisible(true); setEditingMecanico(null); }}
        style={{ marginBottom: '1rem' }}
      />
      <DataTable
        value={mecanicos}
        showGridlines
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 20]}
        tableStyle={{ minWidth: '50rem' }}
        removableSort
        globalFilterFields={['nomeMecanico', 'cpf', 'rg', 'enderecoResidencial', 'contato']}
      >
        <Column field="nomeMecanico" header="Nome" sortable filter filterPlaceholder="Filtrar por nome" />
        <Column field="dataNascimento" header="Data de Nascimento" sortable filter filterPlaceholder="Filtrar por data" />
        <Column field="cpf" header="CPF" sortable filter filterPlaceholder="Filtrar por CPF" />
        <Column field="rg" header="RG" sortable filter filterPlaceholder="Filtrar por RG" />
        <Column field="enderecoResidencial" header="Endereço Residencial" sortable filter filterPlaceholder="Filtrar por endereço" />
        <Column field="contato" header="Contato" sortable filter filterPlaceholder="Filtrar por contato" />
        <Column field="valorSalario" header="Salário" sortable filter filterPlaceholder="Filtrar por salário" />
        <Column field="comissao" header="Comissão (%)" sortable filter filterPlaceholder="Filtrar por comissão" />
        <Column header="Ações" body={actionBodyTemplate} />
      </DataTable>
      <Dialog
        visible={isModalVisible}
        style={{ width: '50%' }}
        onHide={() => { setIsModalVisible(false); setEditingMecanico(null); }}
        header={editingMecanico ? "Alterar Mecânico" : "Cadastro de Mecânico"}
      >
        <CadastroMecanicoForm />
      </Dialog>
    </div>
  );
};

export default CadastroMecanico;
