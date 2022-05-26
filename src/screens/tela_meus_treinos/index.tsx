import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from "../../providers/firebase";
import { collection, getDocs } from 'firebase/firestore';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import { Aluno } from '../../models/Aluno';
import { Treino } from '../../models/Treino';
import { ExercicioTreino } from '../../models/ExercicioTreino';
import { Exercicio } from '../../models/Exercicio';

import logomarca from '../../assets/images/logo_cs.png';

import './styles.css';

interface ParametrosStateSequencia {
    aluno: Aluno
}

interface ExercicioMeusTreinos extends ExercicioTreino {
    esconderImagem?: boolean
} 

export default function TelaMeusTreinos(){
    const navigate = useNavigate();
    const location = useLocation();
    const stateParams = location.state as ParametrosStateSequencia;
    const queryParams = new URLSearchParams(useLocation().search);
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [economiaDados, setEconomiaDados] = useState<boolean>(false);
    const [treinos, setTreinos] = useState<Treino[]>([]);
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [indexTreinoSelecionado, setIndexTreinoSelecionado] = useState<number>(NaN);
    const [indexSequenciaSelecionada, setIndexSequenciaSelecionada] = useState<number>(NaN);
    const [exerciciosSequenciaSelecionada, setExerciciosSequenciaSelecionada] = useState<ExercicioMeusTreinos[]>([]);

    useEffect(() => {
        inicializarTela();
    }, []);

    /**
     * Chama as funções responsáveis por buscar no banco de dados o que é necessário para compor a tela
     */
    const inicializarTela = async () => {
        await buscarTreinos();
        await carregarExercicios();
    }

    /**
     * Busca a lista de treinos do aluno com id informado por parâmetro
     */
    const buscarTreinos = async () => {
        try{
            setStatusCarregando("Buscando treinos...");

            if(queryParams.get("idAluno") === null){
                throw new Error("Aluno não identificado");
            }

            let idAluno = (queryParams.get("idAluno") || "");
            
            let documentosTreinos = await getDocs(collection(db, "alunos", idAluno, "treinos"));
            let listaTreinos: Treino[] = [];
            documentosTreinos.forEach((documento) => {
                let dadosTreino = documento.data();
                listaTreinos.push({
                    idTreino: dadosTreino.idTreino,
                    nome: dadosTreino.nome,
                    objetivo: dadosTreino.objetivo,
                    divisaoTreino: dadosTreino.divisaoTreino,
                    sequencias: dadosTreino.sequencias
                });
            });

            setTreinos([...listaTreinos]);
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
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Define o state do indexTreinoSelecionado para o escolhido e reseta o estado do indexSequenciaSelecionada e dos exerciciosSequenciaSelecionada,
     * para que o usuário possa escolher a sequência para o novo treino selecionado.
     * @param index 
     */
    const selecionarTreino = (index: number) => {
        setIndexTreinoSelecionado(index);
        setIndexSequenciaSelecionada(NaN);
        setExerciciosSequenciaSelecionada([]);
    }

    /**
     * Define o state do indexSequenciaSelecionada para o escolhido e guarda os exercícios dessa sequência.
     * @param index 
     */
    const selecionarSequencia = (index: number) => {
        setIndexSequenciaSelecionada(index);
        setExerciciosSequenciaSelecionada(treinos[indexTreinoSelecionado].sequencias[index].exercicios);
    }

    /**
     * Mostra a imagem escondida devido a economia de dados, do exercício que está na posição (index) passada por parâmetro
     * @param event 
     * @param index 
     */
    const mostrarImagemEscondida = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, index: number) => {
        event.preventDefault(); //PreventDefault para não dar reload na página
        let listaExercicios = exerciciosSequenciaSelecionada;
        listaExercicios[index].esconderImagem = false;
        setExerciciosSequenciaSelecionada([...listaExercicios]);
    }

    return(
        <div id="tela-meus-treinos">
            <SideBar />

            <main className="conteudo">
                <header>
                    <div id="container-logomarca"> 
                        <img src={logomarca} alt="Logomarca" />
                        <h2>Sistema CS</h2>
                    </div>

                    <h2>Bem-vindo,</h2>
                    <h3>{(stateParams !== null && stateParams.aluno !== undefined) ? stateParams.aluno.nome : "Aluno"}</h3>
                </header>
                
                <form>
                    <div className="form-group form-group-horizontal">
                        <input type="checkbox" checked={economiaDados} onChange={() => setEconomiaDados(!economiaDados)} />
                        <label htmlFor="esconder-imagens">Ativar economia de dados</label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nome-treino">Treino</label>
                        <select value={indexTreinoSelecionado.toString()} onChange={(event) => selecionarTreino(parseInt(event.target.value))}>
                            <option value={"NaN"} disabled={true}>Selecione o treino</option>
                            {treinos.map((treino, index) => {
                                return(
                                    <option key={index} value={index}>{treino.nome}</option>
                                );
                            })}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="sequencia-treino">Sequência</label>
                        <select value={indexSequenciaSelecionada.toString()} onChange={(event) => selecionarSequencia(parseInt(event.target.value))}>
                            <option value={"NaN"} disabled={true}>Selecione a sequência</option>
                            {isNaN(indexTreinoSelecionado) === false && 
                             treinos[indexTreinoSelecionado].sequencias.map((sequencia, index) => {
                                return(
                                    <option key={index} value={index}>{sequencia.sequencia}</option>
                                );
                            })}
                        </select>
                    </div>
                </form>
                
                {isNaN(indexSequenciaSelecionada) === false &&
                    <>
                        <div id="sobre-o-treino">
                            <p>Objetivo: {treinos[indexTreinoSelecionado].objetivo}</p>
                            <p>Grupos musculares: {treinos[indexTreinoSelecionado].sequencias[indexSequenciaSelecionada].gruposMusculares}</p>
                            <p>Número de ciclos: {treinos[indexTreinoSelecionado].sequencias[indexSequenciaSelecionada].numeroCiclos}</p>
                            <p>Observações: {treinos[indexTreinoSelecionado].sequencias[indexSequenciaSelecionada].observacoes}</p>
                        </div>

                        <div>
                            {exerciciosSequenciaSelecionada.map((exercicioTreino: ExercicioMeusTreinos, index) => {
                                // Busca os dados do exercicioTreino através da busca pelo id no array de exercícios
                                let exercicio: Exercicio | undefined = exercicios.find(exercicio => exercicio.idExercicio === exercicioTreino.idExercicio);
                                return(
                                    <div key={index} className="container-exercicio">
                                        <div>
                                            <p>{exercicio?.nome}</p>
                                        </div>
        
                                        <div>
                                            {(economiaDados === false || exerciciosSequenciaSelecionada[index].esconderImagem === false) ? (
                                                <img src={exercicio?.urlGIF} alt={"Demonstração do "+exercicio?.nome} />
                                            ) : (  
                                                <a onClick={(event) => mostrarImagemEscondida(event, index)}>Mostrar imagem</a>
                                            )}
                                        </div>
        
                                        <div>
                                            <p>Descrição: {exercicio?.descricao}</p>
                                            <p>Tempo: {exercicioTreino.tempo} segundos</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                }

            </main>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}