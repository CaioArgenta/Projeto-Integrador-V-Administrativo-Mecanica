import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import "./App.css";
import Filme from "./Filme.js"

const App = () => {
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
  });

  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:4000/clientes');
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao obter clientes da API:', error);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:4000/clientes', formData);
      console.log('Dados salvos com sucesso!');
      setFormData({ nome: "", endereco: "" });
      const response = await axios.get('http://localhost:4000/clientes');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
      console.log('Falha ao salvar os dados!');
    }
  };

  const excluirCliente = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/clientes/${id}`);
      setClients(clients.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("Erro ao excluir o cliente:", error);
    }
  };


  return (
    <div>
      <h2>Adicionar Clientes</h2>
      
        <label className="form-label">Nome</label>
        <input className="form-input" type="text" name="nome" value={formData.nome} onChange={handleChange}/>
    

        <label className="form-label">Endereço</label>
        <input className="form-input" type="text" name="endereco" value={formData.endereco} onChange={handleChange}/>


      <button type="button" className="btn btn-save" onClick={handleSave}>
        Salvar
      </button>



      <h2>Lista de Clientes</h2>
      <DataTable value={clients} showGridlines tableStyle={{ minWidth: '50rem' }}>
        <Column field="nome" header="Nome" />
        <Column field="endereco" header="Endereço" />
        <Column header='Excluir' body= { (rowData) => {
          return (
          <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={ () => excluirCliente(rowData.id)} />);}  }/>
      </DataTable>
      <Filme titulo= "Vingadores" genero= "Ação" popularidade = "4.5"/>
    </div>
  );
};

export default App;
