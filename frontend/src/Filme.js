import React from "react";
import { Rating } from "primereact/rating"; 


const Filme = (props) => {
  return (
    <div>
      <h3>{props.titulo}</h3>
      <p>Gênero: {props.genero}</p>
      <p>Popularidade: {props.popularidade}</p>
      <Rating value={props.popularidade} starts={10}/>
    </div>
  );
};


export default Filme; 