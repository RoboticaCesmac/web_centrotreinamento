import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from "../../providers/firebase";
import { collection, getDocs } from 'firebase/firestore';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import { Aluno } from '../../models/Aluno';
import { Treino } from '../../models/Treino';
import { Sequencia } from '../../models/Sequencia';
import { Exercicio } from '../../models/Exercicio';

import logomarca from '../../assets/images/logo_cs.png';

import './styles.css';

interface ParametrosStateSequencia {
    aluno: Aluno
}

export default function TelaMeusTreinos(){
    const navigate = useNavigate();
    const location = useLocation();
    const stateParams = location.state as ParametrosStateSequencia;
    const queryParams = new URLSearchParams(useLocation().search);
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [economiaDados, setEconomiaDados] = useState<boolean>(false);
    const [treinos, setTreinos] = useState<Treino[]>([]);
    const [indexTreinoSelecionado, setIndexTreinoSelecionado] = useState<number>();
    const [exerciciosSequenciaSelecionada, setExerciciosSequenciaSelecionada] = useState<Exercicio[]>([]);


    const [indexSequencia, setIndexSequencia] = useState<number>(0);

    const [listaExercicios, setListaExercicios] = useState<string[]>([]);

    useEffect(() => {
        buscarTreinos();
    }, []);

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
                    <h3>{(stateParams.aluno.nome || "Aluno")}</h3>
                </header>
                
                <form>
                    <div className="form-group form-group-horizontal">
                        <input type="checkbox" checked={economiaDados} onChange={() => setEconomiaDados(!economiaDados)} />
                        <label htmlFor="esconder-imagens">Ativar economia de dados</label>
                    </div>

                    <div className="form-group">
                        <label htmlFor="nome-treino">Treino</label>
                        <select>
                            <option disabled={true}>Selecione</option>
                            {treinos.map((treino, index) => {
                                return(
                                    <option key={index} value={index}>{treino.nome}</option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="sequencia-treino">Sequência</label>
                        <select>
                            <option disabled={true}>Selecione</option>
                            {/* {treinos[indexSequencia].sequencias.map((sequencia, index) => {
                                return(
                                    <option key={index} value={index}>{sequencia.sequencia}</option>
                                );
                            })} */}
                        </select>
                    </div>
                </form>
                
                {indexTreinoSelecionado !== undefined &&
                <>
                    <div id="sobre-o-treino">
                        <p>Objetivo: {treinos[indexTreinoSelecionado].objetivo}</p>
                        <p>Grupos musculares: Peito, tríceps e ombros</p>
                        <p>Número de ciclos: 10</p>
                        <p>Observações: Não tenha pressa. Sinta o músculo sendo trabalhado.</p>
                    </div>

                    <div>
                        <div className="container-exercicio">
                            <div>
                                <p>Aquecimento</p>
                            </div>

                            <div>
                                {(economiaDados === false /* || listaExercicios[index].esconderImagem === false */) ? (
                                    <img src={"https://drive.google.com/thumbnail?id=1qnHDC-C-M2cB6fnByUoL_KXwCWwmFyKc"} alt="Demonstração do supino reto" />
                                ) : (  
                                    <a>Mostrar imagem</a>
                                )}
                            </div>

                            <div>
                                <p>Séries: </p>
                                <p>Repetições: </p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div className="container-exercicio">
                            <div>
                                <p>Supino reto</p>
                            </div>
                            <img src={"https://drive.google.com/thumbnail?id=1ejmsvTjv8zvrmomEg8B6qLRqQmqIfpCr"} alt="Demonstração do supino reto" />
                            <div>
                                <p>Séries: </p>
                                <p>Repetições: </p>
                            </div>
                        </div>
                    </div>
                </>
                }

            </main>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}