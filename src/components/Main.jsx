import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from './QRCodeSVG';
import Cardapio from './Cardapio';
import './Main.css';

function carregarAlunos() {
  try {
    return JSON.parse(localStorage.getItem('alunos')) || [];
  } catch {
    return [];
  }
}

function salvarAlunos(lista) {
  localStorage.setItem('alunos', JSON.stringify(lista));
}

function dataDeHoje() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function carregarEstoques() {
  try {
    return JSON.parse(localStorage.getItem('estoqueFilaZero')) || {};
  } catch {
    return {};
  }
}

function carregarRetiradas() {
  try {
    return JSON.parse(localStorage.getItem('retiradasFilaZero')) || [];
  } catch {
    return [];
  }
}

function Main() {
  const [modo, setModo] = useState('cadastro');
  const [alunos, setAlunos] = useState(carregarAlunos);
  const [alunoLogado, setAlunoLogado] = useState(null);

  const [estoques, setEstoques] = useState(carregarEstoques);
  const [retiradas, setRetiradas] = useState(carregarRetiradas);

  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  const [login, setLogin] = useState({
    email: '',
    senha: ''
  });

  const [mostrarEstoque, setMostrarEstoque] = useState(false);
  const [adminLogado, setAdminLogado] = useState(false);

  const [loginAdmin, setLoginAdmin] = useState({
    usuario: '',
    senha: ''
  });

  const [quantidadeEstoque, setQuantidadeEstoque] = useState('');
  const [alunoParaRetirada, setAlunoParaRetirada] = useState('');

  const hoje = dataDeHoje();
  const estoque = estoques[hoje] ?? 0;

  const retiradasHoje = retiradas.filter(
    (retirada) => retirada.data === hoje
  );

  const lanchesDisponiveis = Math.max(
    0,
    estoque - retiradasHoje.length
  );

  // Atualiza os dados quando outra aba do navegador os altera.
  useEffect(() => {
    function atualizarDados() {
      setAlunos(carregarAlunos());
      setEstoques(carregarEstoques());
      setRetiradas(carregarRetiradas());
    }

    window.addEventListener('storage', atualizarDados);

    return () => {
      window.removeEventListener('storage', atualizarDados);
    };
  }, []);

  // Cadastro do aluno.
  function cadastrar(e) {
    e.preventDefault();

    if (
      !formulario.nome.trim() ||
      !formulario.email.trim() ||
      !formulario.senha
    ) {
      alert('Preencha todos os campos!');
      return;
    }

    if (formulario.senha.length < 8) {
      alert('A senha precisa ter pelo menos 8 caracteres!');
      return;
    }

    const email = formulario.email.trim().toLowerCase();

    if (alunos.some((aluno) => aluno.email.toLowerCase() === email)) {
      alert('Esse e-mail já está cadastrado!');
      return;
    }

    const novoAluno = {
      id: crypto.randomUUID(),
      nome: formulario.nome.trim(),
      email,
      senha: formulario.senha
    };

    const novaLista = [...alunos, novoAluno];

    salvarAlunos(novaLista);
    setAlunos(novaLista);
    setAlunoLogado(novoAluno);

    setFormulario({
      nome: '',
      email: '',
      senha: ''
    });
  }

  // Login do aluno.
  function entrar(e) {
    e.preventDefault();

    const alunoEncontrado = alunos.find(
      (aluno) =>
        aluno.email.toLowerCase() === login.email.trim().toLowerCase() &&
        aluno.senha === login.senha
    );

    if (!alunoEncontrado) {
      alert('E-mail ou senha incorretos!');
      return;
    }

    setAlunoLogado(alunoEncontrado);
    setLogin({ email: '', senha: '' });
  }

  // Login administrativo de demonstração.
  function entrarAdmin(e) {
    e.preventDefault();

    if (
      loginAdmin.usuario === 'admin' &&
      loginAdmin.senha === 'FilaZero@2026'
    ) {
      setAdminLogado(true);
      setQuantidadeEstoque(String(estoque));
      setLoginAdmin({ usuario: '', senha: '' });
    } else {
      alert('Usuário ou senha do administrador incorretos!');
    }
  }

  // Define o estoque total previsto para o dia.
  function salvarQuantidadeEstoque(e) {
    e.preventDefault();

    if (!adminLogado) {
      alert('Somente o administrador pode alterar o estoque.');
      return;
    }

    const quantidade = Number(quantidadeEstoque);

    if (
      quantidadeEstoque.trim() === '' ||
      !Number.isInteger(quantidade) ||
      quantidade < retiradasHoje.length
    ) {
      alert(
        'Informe um número inteiro igual ou maior que as retiradas de hoje.'
      );
      return;
    }

    const novosEstoques = {
      ...carregarEstoques(),
      [hoje]: quantidade
    };

    localStorage.setItem(
      'estoqueFilaZero',
      JSON.stringify(novosEstoques)
    );

    setEstoques(novosEstoques);
    alert('Estoque de hoje atualizado!');
  }

  // O funcionário registra a retirada do aluno selecionado.
  function registrarRetirada(e) {
    e.preventDefault();

    if (!adminLogado) {
      alert('Somente o administrador pode registrar retiradas.');
      return;
    }

    const aluno = alunos.find(
      (item) => item.id === alunoParaRetirada
    );

    if (!aluno) {
      alert('Selecione um aluno.');
      return;
    }

    // Lê novamente os dados salvos antes de registrar.
    const listaAtual = carregarRetiradas();
    const estoqueAtual = carregarEstoques()[hoje] ?? 0;

    const jaRetirou = listaAtual.some(
      (retirada) =>
        retirada.alunoId === aluno.id &&
        retirada.data === hoje
    );

    if (jaRetirou) {
      alert('Este aluno já retirou o lanche hoje!');
      setRetiradas(listaAtual);
      return;
    }

    const totalRetiradas = listaAtual.filter(
      (retirada) => retirada.data === hoje
    ).length;

    if (totalRetiradas >= estoqueAtual) {
      alert('O estoque de hoje acabou!');
      return;
    }

    const novaLista = [
      ...listaAtual,
      {
        id: crypto.randomUUID(),
        alunoId: aluno.id,
        data: hoje
      }
    ];

    localStorage.setItem(
      'retiradasFilaZero',
      JSON.stringify(novaLista)
    );

    setRetiradas(novaLista);
    setAlunoParaRetirada('');

    alert(`Retirada de ${aluno.nome} registrada com sucesso!`);
  }

  // CARTEIRINHA DIGITAL DO ALUNO.
  if (alunoLogado) {
    const conteudoQR = JSON.stringify({
      id: alunoLogado.id,
      nome: alunoLogado.nome
    });

    const jaRetirou = retiradas.some(
      (retirada) =>
        retirada.alunoId === alunoLogado.id &&
        retirada.data === hoje
    );

    let situacao;

    if (jaRetirou) {
      situacao = 'Não pode repetir hoje: já retirou o lanche.';
    } else if (lanchesDisponiveis > 0) {
      situacao = 'Pode retirar: ainda não lanchou hoje.';
    } else {
      situacao = 'Estoque esgotado para hoje.';
    }

    return (
      <main>
        <section className="carteirinha">
          <h2>SENAI Fila Zero</h2>
          <h3>Carteirinha Digital</h3>

          <p>
            <strong>Nome:</strong> {alunoLogado.nome}
          </p>

          <p>
            <strong>E-mail:</strong> {alunoLogado.email}
          </p>

          <p>
            <strong>Número da carteirinha:</strong>{' '}
            {alunoLogado.id.slice(0, 8).toUpperCase()}
          </p>

          <QRCodeSVG value={conteudoQR} size={180} />

          <h3>Controle de lanches</h3>

          <p>
            <strong>Estoque disponível:</strong>{' '}
            {lanchesDisponiveis}
          </p>

          <p>
            <strong>Retiradas realizadas hoje:</strong>{' '}
            {retiradasHoje.length}
          </p>

          <p>
            <strong>Sua retirada hoje:</strong>{' '}
            {jaRetirou ? 'Já realizada' : 'Ainda não realizada'}
          </p>

          <p className="situacao-carteirinha">
            <strong>Situação:</strong> {situacao}
          </p>

          <p>
            Apresente o QR Code ao funcionário para confirmar sua
            retirada.
          </p>

          <button
            type="button"
            onClick={() => {
              setAlunoLogado(null);
              setModo('login');
            }}
          >
            Sair
          </button>
        </section>

        <Cardapio />
      </main>
    );
  }

  return (
    <main>
      {mostrarEstoque ? (
        <section>
          {!adminLogado ? (
            <>
              <h3>Área do administrador</h3>

              <form onSubmit={entrarAdmin}>
                <label htmlFor="usuarioAdmin">Usuário</label>
                <input
                  id="usuarioAdmin"
                  value={loginAdmin.usuario}
                  onChange={(e) =>
                    setLoginAdmin({
                      ...loginAdmin,
                      usuario: e.target.value
                    })
                  }
                  required
                />

                <label htmlFor="senhaAdmin">Senha</label>
                <input
                  id="senhaAdmin"
                  type="password"
                  value={loginAdmin.senha}
                  onChange={(e) =>
                    setLoginAdmin({
                      ...loginAdmin,
                      senha: e.target.value
                    })
                  }
                  required
                />

                <button type="submit">
                  Entrar como administrador
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Estoque de hoje</h2>
              <p><strong>Data:</strong> {hoje}</p>

              <p>
                <strong>Quantidade inicial:</strong> {estoque}
              </p>

              <p>
                <strong>Lanches retirados:</strong>{' '}
                {retiradasHoje.length}
              </p>

              <p>
                <strong>Lanches restantes:</strong>{' '}
                {lanchesDisponiveis}
              </p>

              <form onSubmit={salvarQuantidadeEstoque}>
                <label htmlFor="quantidadeEstoque">
                  Quantidade total de lanches para hoje
                </label>

                <input
                  id="quantidadeEstoque"
                  type="number"
                  min={retiradasHoje.length}
                  step="1"
                  value={quantidadeEstoque}
                  onChange={(e) =>
                    setQuantidadeEstoque(e.target.value)
                  }
                  required
                />

                <button type="submit">
                  Salvar estoque
                </button>
              </form>

              <hr />

              <h3>Registrar retirada de aluno</h3>

              <form onSubmit={registrarRetirada}>
                <label htmlFor="alunoRetirada">
                  Selecione o aluno que recebeu o lanche
                </label>

                <select
                  id="alunoRetirada"
                  value={alunoParaRetirada}
                  onChange={(e) =>
                    setAlunoParaRetirada(e.target.value)
                  }
                  required
                >
                  <option value="">Selecione um aluno</option>

                  {alunos.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} — {aluno.id.slice(0, 8).toUpperCase()}
                    </option>
                  ))}
                </select>

                <button type="submit">
                  Confirmar retirada
                </button>
              </form>

              <h3>Retiradas de hoje</h3>

              {retiradasHoje.length === 0 ? (
                <p>Nenhum lanche retirado hoje.</p>
              ) : (
                <ul>
                  {retiradasHoje.map((retirada) => {
                    const aluno = alunos.find(
                      (item) => item.id === retirada.alunoId
                    );

                    return (
                      <li key={retirada.id}>
                        {aluno ? aluno.nome : 'Aluno não encontrado'}
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                type="button"
                onClick={() => {
                  setAdminLogado(false);
                  setMostrarEstoque(false);
                }}
              >
                Sair do administrador
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setAdminLogado(false);
              setMostrarEstoque(false);
            }}
          >
            Voltar
          </button>
        </section>
      ) : (
        <>
          {modo === 'cadastro' && (
            <section>
              <h3>Cadastro</h3>

              <form onSubmit={cadastrar}>
                <label htmlFor="nome">Coloque seu nome completo</label>
                <input
                  id="nome"
                  className="input-1"
                  type="text"
                  value={formulario.nome}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      nome: e.target.value
                    })
                  }
                  required
                />

                <label htmlFor="email">Vincule um e-mail</label>
                <input
                  id="email"
                  className="input-2"
                  type="email"
                  value={formulario.email}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      email: e.target.value
                    })
                  }
                  required
                />

                <label htmlFor="senha">Crie uma senha</label>
                <input
                  id="senha"
                  className="input-3"
                  type="password"
                  minLength={8}
                  value={formulario.senha}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      senha: e.target.value
                    })
                  }
                  required
                />

                <p>8 caracteres ou mais.</p>
                <p>Use maiúsculas, minúsculas, números e símbolos.</p>
                <p>Evite sequências como 123456.</p>
                <p>Não use dados pessoais.</p>

                <button className="btn-1" type="submit">
                  Cadastrar
                </button>
              </form>
            </section>
          )}

          {modo === 'login' && (
            <section>
              <h3>Login</h3>

              <form onSubmit={entrar}>
                <label htmlFor="emailLogin">Digite seu e-mail</label>
                <input
                  id="emailLogin"
                  className="input-2"
                  type="email"
                  value={login.email}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      email: e.target.value
                    })
                  }
                  required
                />

                <label htmlFor="senhaLogin">Digite sua senha</label>
                <input
                  id="senhaLogin"
                  className="input-3"
                  type="password"
                  value={login.senha}
                  onChange={(e) =>
                    setLogin({
                      ...login,
                      senha: e.target.value
                    })
                  }
                  required
                />

                <button className="btn-2" type="submit">
                  Entrar
                </button>
              </form>
            </section>
          )}

          <button
            type="button"
            onClick={() =>
              setModo(modo === 'cadastro' ? 'login' : 'cadastro')
            }
          >
            {modo === 'cadastro'
              ? 'Já tem uma conta? Entrar'
              : 'Não tem uma conta? Cadastrar'}
          </button>

          <button
            type="button"
            onClick={() => setMostrarEstoque(true)}
          >
            Estoque de hoje — Administrador
          </button>
        </>
      )}
    </main>
  );
}

export default Main;