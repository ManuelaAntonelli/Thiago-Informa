export default function CardInformativo({ item }) {
  return (
    <div className="card">

      {item.imagem && (
        <img src={item.imagem} alt="img" />
      )}

      <div className="card-body">

        <h3>{item.titulo}</h3>

        <p>{item.descricao}</p>

        <small>
          {new Date(item.data).toLocaleDateString()}
        </small>

      </div>

    </div>
  );
}