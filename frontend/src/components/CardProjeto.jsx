function CardProjeto({
  titulo,
  descricao,
  imagem
}) {
  return (
    <div className="card">

      <img
        src={imagem}
        alt={titulo}
      />

      <div className="card-body">
        <h2>{titulo}</h2>

        <p>{descricao}</p>
      </div>

    </div>
  );
}

export default CardProjeto;