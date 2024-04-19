import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { Treino } from '../../models/Treino';
import { Aluno } from '../../models/Aluno';
import { Exercicio } from '../../models/Exercicio';
import { ExercicioTreino } from '../../models/ExercicioTreino';

import Modal from '../../components/modal';
import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import iconeVisualizar from '../../assets/images/icons/eye.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';
import imagemNaoEncontrada from '../../assets/images/imagem_nao_encontrada.png';

import './styles.css';

interface ParametrosStateListaTreino {
    aluno: Aluno
}

export default function TelaListaTreinos(){
    const navigate = useNavigate();
    const stateParams = useLocation().state as ParametrosStateListaTreino;
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [aluno, setAluno] = useState<Aluno>();
    const [treinos, setTreinos] = useState<Treino[]>([]);

    // Modal de visualização do treino
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [treinoVisualizacao, setTreinoVisualizacao] = useState<Treino | undefined>(undefined);
    const [indexBlocoVisualizado, setIndexBlocoVisualizado] = useState<number>(NaN);

    useEffect(() => {
        if(stateParams !== null && stateParams.aluno !== undefined){
            let aluno = stateParams.aluno;
            buscarTreinos(aluno.idAluno || "");
            setAluno(aluno);
        }else{
            navigate("/lista-alunos");
        }
    }, []);

    /**
     * Busca os treinos do aluno no banco de dados firestore
     * @param idAluno 
     */
    const buscarTreinos = async (idAluno: string) => {
        try{
            setStatusCarregando("Buscando treinos...");

            let documentosTreinos = await getDocs(collection(db, "alunos", idAluno, "treinos"));
            
            let listaTreinos: Treino[] = [];
            documentosTreinos.forEach((documento) => {
                let dadosTreino = documento.data();

                listaTreinos.push({
                    idTreino: dadosTreino.idTreino,
                    nome: dadosTreino.nome,
                    objetivo: dadosTreino.objetivo,
                    diasSemana: dadosTreino.diasSemana,
                    blocos: dadosTreino.blocos
                });
            });

            setTreinos(listaTreinos);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Deleta o cadastro do usuário no banco de dados firestore
     * @param idTreino 
     * @param index 
     */
    const deletarCadastro = async (idTreino: string, posicaoArray: number) => {
        try{
            let confirmacao = window.confirm("Deseja mesmo deletar o treino?");

            if(confirmacao === true){
                setStatusCarregando("Deletando cadastro...");
                await deleteDoc(doc(db, "alunos", (aluno?.idAluno || ""), "treinos", idTreino));
    
                let listaTreinos = treinos;
                listaTreinos.splice(posicaoArray, 1);
                setTreinos([...listaTreinos]);
            }
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Busca todos os exercícios cadastrados no sistema. Para que auxiliem no preenchimento
     * dos exercícios do treino selecionado
     */
    const buscarExercicios = async () => {
        try{
            setStatusCarregando("Buscando exercícios...");

            const documentosExercicios = await getDocs(collection(db, "exercicios"));

            let listaExercicios: Exercicio[] = [];
            documentosExercicios.forEach((documento) => {
                const dadosExercicio = documento.data();

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
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }
    
    /**
     * Abre um modal com o treino escolhido para visualizar
     * @param treino 
     */
    const visualizarTreino = async (treino: Treino) => {
        if(exercicios.length === 0){
            buscarExercicios();
        }

        setTreinoVisualizacao(treino);
    }

    return(
        <div id="tela-lista-treinos">
            <SideBar />

            <main className="conteudo">
                <header>
                    <h2>Lista de treinos de {aluno?.nome}</h2>
                    <button type="button" onClick={() => navigate("/cadastro-treino", {state: {aluno: aluno}})}>Cadastrar novo treino</button>
                </header>

                <form id="container-busca" onSubmit={(event) => {event.preventDefault()}}>
                    <input id="busca-treino" placeholder="Buscar exercícios" type="text" />
                    <button type="button">Buscar</button>
                </form>

                {treinos.length !== 0 ?
                    <>
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Objetivo</th>
                                    <th>Dias da semana</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {treinos.map((treino, index) => {
                                    return(
                                        <tr key={index}>
                                            <td>{treino.nome}</td>
                                            <td>{treino.objetivo}</td>
                                            <td>{treino.diasSemana}</td>
                                            <td>
                                                <button type="button" onClick={() => visualizarTreino(treino)}><img src={iconeVisualizar} alt="Visualizar" /></button>
                                                <button type="button" onClick={() => navigate("/cadastro-treino", {state: {aluno: aluno, treino: treino}})}><img src={iconeEditar} alt="Editar" /></button>
                                                <button type="button" onClick={() => deletarCadastro((treino.idTreino || ""), index)}><img src={iconeApagar} alt="Apagar" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        <div className="paginacao">
                            <a>Voltar</a>
                            <p>0/0</p>
                            <a>Avançar</a>
                        </div>
                    </>
                :
                    <p id="nenhum-registro">Nenhum treino encontrado</p>
                }

                <Loading statusLoading={statusCarregando} />
            </main>

            <Modal titulo={'Visualização de '+treinoVisualizacao?.nome} visivel={treinoVisualizacao !== undefined} onClose={() => setTreinoVisualizacao(undefined)}>
                <div id="modal-visualizacao-treino">
                    <div className="form-group">
                        <select value={indexBlocoVisualizado.toString()} onChange={(event) => setIndexBlocoVisualizado(parseInt(event.target.value))}>
                            <option value={"NaN"} disabled={true}>Selecione o bloco</option>
                            {treinoVisualizacao?.blocos.map((bloco, index) => {
                                return(
                                    <option key={index} value={index}>{bloco.bloco}</option>
                                );
                            })}
                        </select>
                    </div>
                        
                    {!isNaN(indexBlocoVisualizado) &&
                    <>
                        <div id="sobre-o-treino">
                            <p>Objetivo: {treinoVisualizacao?.objetivo}</p>
                            <p>Grupos musculares: {treinoVisualizacao?.blocos[indexBlocoVisualizado]?.gruposMusculares}</p>
                            <p>Observações: {treinoVisualizacao?.blocos[indexBlocoVisualizado]?.observacoes}</p>
                        </div>

                        {treinoVisualizacao?.blocos[indexBlocoVisualizado]?.exercicios.map((exercicioTreino: ExercicioTreino, index) => {
                            // Busca os dados do exercicioTreino através da busca pelo id no array de exercícios
                            let exercicio: Exercicio | undefined = exercicios.find(exercicio => exercicio.idExercicio === exercicioTreino.idExercicio);

                            

                            return(
                                <div>
                                    <div>
                                        <p>{exercicio?.nome}</p>
                                    </div>

                                    <div>
                                        <img src={exercicio?.urlGIF} alt={"Demonstração do "+exercicio?.nome} onError={( event ) => {event.currentTarget.onerror = null; /*prevents looping*/ event.currentTarget.src=imagemNaoEncontrada}} />
                                    </div>

                                    <div>
                                        {(exercicio?.descricao !== undefined && exercicio?.descricao !== "") ? <p>Descrição: {exercicio?.descricao}</p> : undefined}
                                        {exercicioTreino.series !== undefined ? <p>Séries: {exercicioTreino.series}</p> : undefined}
                                        {exercicioTreino.repeticoes !== undefined ? <p>Repetições: {exercicioTreino.repeticoes}</p> : undefined}
                                    </div>
                                </div>
                            );
                        })}
                    </>
                    }

                </div>
            </Modal>
        </div>
    );
}