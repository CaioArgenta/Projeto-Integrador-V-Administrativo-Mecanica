import { useState } from "react";
import "./ContasReceberPorCliente.css";

export default function ContasReceberPorCliente() {
  const [formData, setFormData] = useState({
    cpfCnpj: "",
    pessoa: "",
    caixa: "",
    saldoDevedor: "R$500.00",
    formaPagamento: "DINHEIRO",
    dataEmissao: "21/02/2025 12:10:02",
    categoria: "RECEBIMENTO A PRAZO",
    observacoes: "",
    pagamento: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /* Imprime no console os dados do formulario  */
  const handleConfirm = () => {
    console.log("Recebimento confirmado:", formData);
  };

  return (
    <div className="contas-receber-container">
      <h2 className="title">Contas a Receber Por Cliente</h2>





      <h3 className="section-title">Identificação da Pessoa</h3>
      <div className="identificacao">
        <div className="form-group-inline">
          <label className="form-label">CPF/CNPJ</label>
          <input className="form-input" type="text" name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange}/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Pessoa</label>
          <input className="form-input" type="text" name="pessoa" value={formData.pessoa} onChange={handleChange}/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Caixa</label>
          <input className="form-input" type="text" name="caixa" value={formData.caixa} onChange={handleChange}/>
        </div>
      </div>





      <div className="documento-valor-emissao">
        <table className="contas-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Parc</th>
              <th>Documento</th>
              <th>Valor Total</th>
              <th>Comissão</th>
              <th>Vencimento</th>
              <th>Emissão</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formData.categoria}</td>
              <td>1/1</td>
              <td>DOC-001</td>
              <td>R$500.00</td>
              <td>R$0.00</td>
              <td>21/02/2025</td>
              <td>{formData.dataEmissao}</td>
            </tr>
          </tbody>
        </table>
      </div>






      <h3 className="section-title">Valores</h3>
      <div className="valores">
        <div className="form-group-inline">
          <label className="form-label">Saldo Devedor</label>
          <input className="form-input" type="text" name="saldoDevedor" value={formData.saldoDevedor} readOnly/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Forma de Pagamento</label>
          <input className="form-input" type="text" name="formaPagamento" value={formData.formaPagamento} onChange={handleChange}/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Emissão de Pagamento</label>
          <input className="form-input" type="text" name="pagamento" value={formData.pagamento} onChange={handleChange}/>
        </div>
      </div>





      <h3 className="section-title">Informações Adicionais</h3>
      <div className="informacoes-adicionais">
        <div className="form-group-inline">
          <label className="form-label">Documento</label>
          <input className="form-input" type="text" name="categoria" value={formData.categoria} onChange={handleChange}/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Categoria</label>
          <input className="form-input" type="text" name="categoria" value={formData.categoria} onChange={handleChange}/>
        </div>
        <div className="form-group-inline">
          <label className="form-label">Observações</label>
          <textarea className="form-textarea" name="observacoes" rows="3" value={formData.observacoes} onChange={handleChange}/>
        </div>
      </div>

      
      <div className="form-buttons">
        <button className="btn btn-close">Fechar Janela</button>
        <button className="btn btn-print">Imprimir Recibo</button>
        <button className="btn btn-confirm" onClick={handleConfirm}>Confirmar Recebimento</button>
      </div>
    </div>
  );
}
