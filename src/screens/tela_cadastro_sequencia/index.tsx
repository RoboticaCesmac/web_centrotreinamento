import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, getDocs } from 'firebase/firestore';

import { Treino } from '../../models/Treino';
import { Sequencia } from '../../models/Sequencia';
import { Exercicio } from '../../models/Exercicio';
import { ExercicioTreino } from '../../models/ExercicioTreino';
import { Aluno } from '../../models/Aluno';

import SideBar from '../../components/sidebar';
import Modal from '../../components/modal';
import Loading from '../../components/loading';

import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

import './styles.css';

interface ParametrosStateSequencia {
    treino: Treino,
    aluno: Aluno
}

export default function TelaCadastroSequencia(){
    const navigate = useNavigate();
    const location = useLocation();
    const stateParams = location.state as ParametrosStateSequencia;
    const queryParams = new URLSearchParams(useLocation().search);
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [aluno, setAluno] = useState<Aluno>();
    const [treinoUltimaTela, setTreinoUltimaTela] = useState<Treino>();
    const [indexSequenciaEdicao, setIndexSequenciaEdicao] = useState<number | undefined>(undefined);

    const [sequencia, setSequencia] = useState<string>("");
    const [gruposMusculares, setGruposMusculares] = useState<string>("");
    const [numerosCiclos, setNumerosCiclos] = useState<number>(0);
    const [observacoes, setObservacoes] = useState<string>("");
    const [exerciciosTreino, setExerciciosTreino] = useState<ExercicioTreino[]>([]);

    const [modalExercicioVisivel, setModalExercicioVisivel] = useState<boolean>(false);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [posicaoArrayExercicioSelecionado, setPosicaoArrayExercicioSelecionado] = useState<number>(NaN);
    const [idExercicioSelecionado, setIDExercicioSelecionado] = useState<string>("");
    const [series, setSeries] = useState<number>(0);
    const [repeticoes, setRepeticoes] = useState<number>(0);
    
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

            if(queryParams.get("indexSequencia") !== null){
                let indexSequencia = parseInt(queryParams.get("indexSequencia") || "");
                setIndexSequenciaEdicao(indexSequencia);

                let sequencia: Sequencia = treinoParametro.sequencias[indexSequencia];
                setSequencia(sequencia.sequencia);
                setGruposMusculares(sequencia.gruposMusculares);
                setNumerosCiclos(sequencia.numeroCiclos);
                setObservacoes(sequencia.observacoes);
                setExerciciosTreino(sequencia.exercicios);
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
            setSeries(exercicioTreino.repeticoes);
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
                series: series,
                repeticoes: repeticoes
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
     * Envia para a página de treino os dados da sequência juntamente com os exercícios escolhidos para que possa ser salvo no banco de dados.
     * @param event 
     */
    const salvarCadastro = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        let treino: Treino | undefined = treinoUltimaTela;
        if(treino !== undefined){
            let sequencias: Sequencia[] = treino.sequencias;

            let objSequencia: Sequencia = {
                sequencia: sequencia,
                gruposMusculares: gruposMusculares,
                numeroCiclos: numerosCiclos,
                observacoes: observacoes,
                exercicios: exerciciosTreino
            }

            if(indexSequenciaEdicao === undefined){
                sequencias.push(objSequencia);
            }else{
                sequencias[indexSequenciaEdicao] = objSequencia;
            }


            treino.sequencias = sequencias;
            navigate("/cadastro-treino", { state: { treino: treino, aluno: aluno} });
        }
    }

    return (
        <div id="tela-cadastro-sequencia">
            <SideBar />

            <div className="conteudo">
                <header>
                    <h2>Cadastro de sequência</h2>
                </header>

                <form>
                    <div className="form-group">
                        <label htmlFor="sequencia">Sequência</label>
                        <input id="sequencia" type="text" value={sequencia} onChange={(event) => setSequencia(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grupos-musculares">Grupos musculares</label>
                        <input id="grupos-musculares" type="text" value={gruposMusculares} onChange={(event) => setGruposMusculares(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="numero-ciclos">Número de ciclos</label>
                        <input id="numero-ciclos" type="number" min={1} value={numerosCiclos} onChange={(event) => setNumerosCiclos(parseInt(event.target.value))} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="observacoes">Observações</label>
                        <textarea id="observacoes" value={observacoes} onChange={(event) => setObservacoes(event.target.value)} />
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
                                                <button type="button"><img src={iconeEditar} alt="Editar" onClick={() => abrirModalAdicionarExercicio(index)} /></button>
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
                            <input id="series" type="number" value={(isNaN(series) ? 0 : series)} onChange={(event) => setSeries(parseInt(event.target.value))} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="repeticoes">Repetições</label>
                            <input id="repeticoes" type="number" value={(isNaN(repeticoes) ? 0 : repeticoes)} onChange={(event) => setRepeticoes(parseInt(event.target.value))} />
                        </div>

                        <div id="container-botoes">
                            <button type="button" onClick={() => setModalExercicioVisivel(false)}>Cancelar</button>
                            <button type="submit" onClick={(event) => adicionarExercicio(event)}>Salvar exercício</button>
                        </div>
                    </form>
                </Modal>

                <Loading statusLoading={statusCarregando} />
            </div>
        </div>
    );
}