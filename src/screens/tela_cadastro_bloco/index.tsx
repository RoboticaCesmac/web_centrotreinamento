import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, getDocs } from 'firebase/firestore';

import { Treino } from '../../models/Treino';
import { Bloco } from '../../models/Bloco';
import { Exercicio } from '../../models/Exercicio';
import { ExercicioTreino } from '../../models/ExercicioTreino';
import { Aluno } from '../../models/Aluno';

import SideBar from '../../components/sidebar';
import Modal from '../../components/modal';
import Loading from '../../components/loading';

import iconeVideo from '../../assets/images/icons/play-button.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';
import imagemNaoEncontrada from '../../assets/images/imagem_nao_encontrada.png';

import './styles.css';

interface ParametrosStateBloco {
    treino: Treino,
    aluno: Aluno
}

export default function TelaCadastroBloco(){
    const navigate = useNavigate();
    const location = useLocation();
    const stateParams = location.state as ParametrosStateBloco;
    const queryParams = new URLSearchParams(useLocation().search);
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [aluno, setAluno] = useState<Aluno>();
    const [treinoUltimaTela, setTreinoUltimaTela] = useState<Treino>();
    const [indexBlocoEdicao, setIndexBlocoEdicao] = useState<number | undefined>(undefined);

    const [bloco, setBloco] = useState<string>("");
    const [gruposMusculares, setGruposMusculares] = useState<string>("");
    const [observacoes, setObservacoes] = useState<string>("");
    const [exerciciosTreino, setExerciciosTreino] = useState<ExercicioTreino[]>([]);

    const [modalExercicioVisivel, setModalExercicioVisivel] = useState<boolean>(false);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [posicaoArrayExercicioSelecionado, setPosicaoArrayExercicioSelecionado] = useState<number>(NaN);
    const [idExercicioSelecionado, setIDExercicioSelecionado] = useState<string>("");
    const [series, setSeries] = useState<number>(NaN);
    const [repeticoes, setRepeticoes] = useState<number>(NaN);
    
    const [URLGifModal, setURLGifModal] = useState<string | undefined>(undefined);

    useEffect(() => {
        inicializarCampos();
    }, []);

    /**
     * Guarda os campos do treino já preenchidos na tela passada, para que ao retornar pra ela, possa enviá-lo e dessa forma não retornar com os dados vazios.
     * Também inicializa os campos dessa tela caso seja uma atualização.
     */
    const inicializarCampos = async () => {
        if(stateParams === null || stateParams.aluno === undefined || stateParams.treino === undefined){
            navigate('/lista-alunos');
        }else{
            setAluno(stateParams.aluno);

            let treinoParametro: Treino = stateParams.treino;

            if(queryParams.get("indexBloco") !== null){
                let indexBloco = parseInt(queryParams.get("indexBloco") || "");
                setIndexBlocoEdicao(indexBloco);

                let bloco: Bloco = treinoParametro.blocos[indexBloco];
                setBloco(bloco.bloco);
                setGruposMusculares(bloco.gruposMusculares);
                setObservacoes(bloco.observacoes);
                setExerciciosTreino(bloco.exercicios);
            }

            setTreinoUltimaTela(treinoParametro);

            carregarExercicios();
        }
    }

    /**
     * Consulta os exercícios cadastrados no banco de dados firestore para carregá-los no select do modal de adicionar exercício.
     */
    const carregarExercicios = async () => {
        try{
            setStatusCarregando("Buscando exercícios...");

            let documentosExercicios = await getDocs(collection(db, "exercicios"));

            let listaExercicios: Exercicio[] = [];
            documentosExercicios.forEach((documento) => {
                let dadosExercicio = documento.data();
                listaExercicios.push({
                    idExercicio: dadosExercicio.idExercicio,
                    nome: dadosExercicio.nome,
                    gruposMusculares: dadosExercicio.gruposMusculares,
                    descricao: dadosExercicio.descricao,
                    urlGIF: dadosExercicio.urlGIF
                });
            });

            setExercicios([...listaExercicios]);
        }catch(erro){
            alert(erro)
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Abre o modal com o formulário para adição de exercício com os campos resetados
     */
    const abrirModalAdicionarExercicio = (posicaoExercicioArray?:number) => {
        if(posicaoExercicioArray === undefined){    //Se for para um novo cadastro
            setSeries(0);
            setRepeticoes(0);
            setIDExercicioSelecionado("");
            setPosicaoArrayExercicioSelecionado(NaN);
        }else{  //Se for para uma edição
            let exercicioTreino: ExercicioTreino = exerciciosTreino[posicaoExercicioArray];
            setIDExercicioSelecionado(exercicioTreino.idExercicio);
            setSeries(exercicioTreino.series);
            setRepeticoes(exercicioTreino.repeticoes);
            setPosicaoArrayExercicioSelecionado(posicaoExercicioArray); //Com a posição do array que contém todos os exercícios é possível ter acesso ao id e ao nome para uso no select dos exercícios
        }

        setModalExercicioVisivel(true);
    }

    /**
     * Adiciona o exercício escolhido em um array de exercícios, para que possa ser enviado posteriormente na página de treino, 
     * onde eles são salvos no banco de dados.
     * @param event 
     */
    const adicionarExercicio = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        try{
            if(idExercicioSelecionado === ""){
                throw new Error ("Nenhum exercício foi selecionado");
            }

            let novoExercicio: ExercicioTreino = {
                idExercicio: idExercicioSelecionado,
                series: series | 0,
                repeticoes: repeticoes | 0
            }
            
            let listaExercicios = exerciciosTreino;
    
            if(isNaN(posicaoArrayExercicioSelecionado)){  //Novo cadastro
                listaExercicios.push(novoExercicio);
            }else{  //Edição de cadastro
                listaExercicios[posicaoArrayExercicioSelecionado] = novoExercicio;
            }
    
            setExerciciosTreino([...listaExercicios]);
            setModalExercicioVisivel(false);
        }catch(erro){
            alert(erro);
        }
    }

    /**
     * Remove o exercicioTreino do array de exercícios
     * @param posicaoArray 
     */
    const removerExercicio = (posicaoArray: number) => {
        let listaExerciciosTreino = exerciciosTreino;
        listaExerciciosTreino.splice(posicaoArray, 1);
        setExerciciosTreino([...listaExerciciosTreino]);
    }

    /**
     * Envia para a página de treino os dados do bloco juntamente com os exercícios escolhidos para que possa ser salvo no banco de dados.
     * @param event 
     */
    const salvarCadastro = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        let treino: Treino | undefined = treinoUltimaTela;
        if(treino !== undefined){
            let blocos: Bloco[] = treino.blocos;

            let objBloco: Bloco = {
                bloco: bloco,
                gruposMusculares: gruposMusculares,
                observacoes: observacoes,
                exercicios: exerciciosTreino
            }

            if(indexBlocoEdicao === undefined){
                blocos.push(objBloco);
            }else{
                blocos[indexBlocoEdicao] = objBloco;
            }


            treino.blocos = blocos;
            navigate("/cadastro-treino", { state: { treino: treino, aluno: aluno} });
        }
    }

    return (
        <div id="tela-cadastro-bloco">
            <SideBar />

            <div className="conteudo">
                <header>
                    <h2>Cadastro de bloco</h2>
                </header>

                <form>
                    <div className="form-group">
                        <label htmlFor="bloco">Bloco</label>
                        <input id="bloco" type="text" placeholder="Bloco" value={bloco} onChange={(event) => setBloco(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grupos-musculares">Grupos musculares</label>
                        <input id="grupos-musculares" type="text" placeholder="Grupos musculares" value={gruposMusculares} onChange={(event) => setGruposMusculares(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="observacoes">Observações</label>
                        <textarea id="observacoes"  placeholder="Observações" value={observacoes} onChange={(event) => setObservacoes(event.target.value)} />
                    </div>

                    <header>
                        <h2>Exercícios</h2>
                        <button type="button" onClick={() => abrirModalAdicionarExercicio()}>Adicionar exercício</button>
                    </header>


                    {exerciciosTreino.length !== 0 ?
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Séries</th>
                                    <th>Repetições</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {exerciciosTreino.map((exercicioTreino, index) => {
                                    // Busca os dados do exercicioTreino através da busca pelo id no array de exercícios
                                    let exercicio: Exercicio | undefined = exercicios.find(exercicio => exercicio.idExercicio === exercicioTreino.idExercicio);
                                    return (
                                        <tr key={index}>
                                            <td>{(exercicio?.nome || "Não encontrado")}</td>
                                            <td>{exercicioTreino.series}</td>
                                            <td>{exercicioTreino.repeticoes}</td>
                                            <td>
                                                <button type="button" onClick={() => abrirModalAdicionarExercicio(index)}><img src={iconeEditar} alt="Editar" /></button>
                                                <button type="button" onClick={() => setURLGifModal(exercicio?.urlGIF)}><img src={iconeVideo} alt="GIF" /></button>
                                                <button type="button" onClick={() => removerExercicio(index)}><img src={iconeApagar} alt="Apagar" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    :
                        <p id="nenhum-registro">Nenhum exercício encontrado</p>
                    }

                    <div id="container-botoes">
                        <button type="button" onClick={() => navigate('/cadastro-treino', { state: {treino: treinoUltimaTela, aluno: aluno} })}>Cancelar</button>
                        <button type="submit" onClick={(event) => salvarCadastro(event)}>Salvar cadastro</button>
                    </div>
                </form>

                <Modal titulo="Adicionar exercício" visivel={modalExercicioVisivel} onClose={() => setModalExercicioVisivel(false)}>
                    <form id="modal-exercicio">
                        <div className="form-group">
                            <label htmlFor="exercicio">Exercício</label>
                            <select id="exercicio" value={idExercicioSelecionado} onChange={(event) => setIDExercicioSelecionado(event.target.value)}>
                                <option value={""} disabled={true}>Selecione</option>
                                {exercicios.map((exercicio, index) => {
                                    return (
                                        <option key={index} value={exercicio.idExercicio}>{exercicio.nome}</option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Falta adicionar uma função pra caso o exercício seja conjugado (um exercício seguido do outro, sem descanso). Uma opção que permite escolher mais de um exercício */}

                        <div className="form-group">
                            <label htmlFor="series">Séries</label>
                            <input id="series" type="number" value={series} onChange={(event) => setSeries(parseInt(event.target.value))} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="repeticoes">Repetições</label>
                            <input id="repeticoes" type="number" value={repeticoes} onChange={(event) => setRepeticoes(parseInt(event.target.value))} />
                        </div>

                        <div id="container-botoes">
                            <button type="button" onClick={() => setModalExercicioVisivel(false)}>Cancelar</button>
                            <button type="submit" onClick={(event) => adicionarExercicio(event)}>Salvar exercício</button>
                        </div>
                    </form>
                </Modal>

                <Modal titulo="Visualização do GIF" visivel={URLGifModal !== undefined} onClose={() => setURLGifModal(undefined)}>
                    <div id="modal-visualizacao-gif">
                        <img src={URLGifModal} alt="GIF animado" referrerPolicy="no-referrer" onError={( event ) => {event.currentTarget.onerror = null; /*prevents looping*/ event.currentTarget.src=imagemNaoEncontrada}} />
                        <button onClick={() => setURLGifModal(undefined)}>Ok</button>
                    </div>
                </Modal>

                <Loading statusLoading={statusCarregando} />
            </div>
        </div>
    );
}