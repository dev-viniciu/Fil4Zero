import React from 'react';
import './Cardapio.css';

function Cardapio() {
  const lanches = [
    {
      nome: 'Pão de queijo',
      descricao: 'Pão de queijo quentinho.'
    },
    {
      nome: 'Sanduíche',
      descricao: 'Presunto e queijo.'
    },
    {
      nome: 'Salgado',
      descricao: 'Opções de frango ou carne.'
    },
    {
      nome: 'Bolo',
      descricao: 'Opção doce para o lanche.'
    }
  ];

  const bebidas = [
    'Suco de pêssego',
    'Suco de uva',
    'Suco de maçã',
    'Suco de morango'
  ];

  return (
    <section className="cardapio">
      <h2>Cardápio do dia</h2>
      <p className="cardapio-subtitulo">
        Confira as opções de lanche e bebida disponíveis.
      </p>

      <div className="cardapio-imagem">
        <span className="cardapio-imagem-icone">＋</span>
        <p>Espaço reservado para a imagem do lanche</p>
        <small>
          Adicione sua imagem em public/imagens/cardapio.jpg
        </small>
      </div>

      <h3>Lanches</h3>

      <div className="cardapio-lista">
        {lanches.map((lanche) => (
          <article className="cardapio-item" key={lanche.nome}>
            <h4>{lanche.nome}</h4>
            <p>{lanche.descricao}</p>
          </article>
        ))}
      </div>

      <h3>Bebidas</h3>

      <div className="cardapio-bebidas">
        {bebidas.map((bebida) => (
          <span className="cardapio-bebida" key={bebida}>
            {bebida}
          </span>
        ))}
      </div>

      <p className="cardapio-observacao">
        Consulte a cantina para confirmar as opções disponíveis no dia.
      </p>
    </section>
  );
}

export default Cardapio;