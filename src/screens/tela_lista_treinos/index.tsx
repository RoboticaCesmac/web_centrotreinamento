import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { Treino } from '../../models/Treino';
import { Aluno } from '../../models/Aluno';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import iconeVideo from '../../assets/images/icons/play-button.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

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
                    divisaoTreino: dadosTreino.divisaoTreino,
                    sequencias: dadosTreino.sequencias
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

    return(
        <div id="tela-lista-treinos">
            <SideBar />

            <main className="conteudo">
                <header>
                    <h2>Lista de treinos de {aluno?.nome}</h2>
                    <button type="button" onClick={() => navigate("/cadastro-treino", {state: {aluno: aluno}})}>Cadastrar novo treino</button>
                </header>

                <form id="container-busca">
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
                                    <th>Divisão de treino</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {treinos.map((treino, index) => {
                                    return(
                                        <tr key={index}>
                                            <td>{treino.nome}</td>
                                            <td>{treino.objetivo}</td>
                                            <td>{treino.divisaoTreino}</td>
                                            <td>
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
        </div>
    );
}