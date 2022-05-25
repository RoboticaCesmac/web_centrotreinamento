import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { Aluno } from '../../models/Aluno';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import iconeTreinos from '../../assets/images/icons/haltere-lighter.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

import './styles.css';

export default function TelaListaAlunos(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [alunos, setAlunos] = useState<Aluno[]>([]);

    useEffect(() => {
        carregarListaAlunos();
    }, []);

    /**
     * Carrega para um array os alunos cadastrados no banco de dados firestore
     */
    const carregarListaAlunos = async () => {
        try{
            setStatusCarregando("Buscando alunos...");
            let documentosAlunos = await getDocs(collection(db, "alunos"));

            let listaAlunos: Aluno[] = [];
            documentosAlunos.forEach((documento) => {
                let dadosAluno = documento.data();

                listaAlunos.push({
                    idAluno: dadosAluno.idAluno,
                    nome: dadosAluno.nome,
                    email: dadosAluno.email,
                    objetivo: dadosAluno.objetivo,
                    observacoes: dadosAluno.observacoes,
                    descricaoProblemaFisico: dadosAluno?.descricaoProblemaFisico,
                });
            });

            setAlunos([...listaAlunos]);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Deleta o cadastro do usuário do banco de dados firestore
     * @param idAluno 
     * @param posicaoArray 
     */
     const deletarCadastro = async (idAluno: string, posicaoArray: number) => {
        try{
            setStatusCarregando("Deletando cadastro...");
            await deleteDoc(doc(db, "alunos", idAluno));

            //Deleta do vetor de alunos para que não precise fazer a consulta novamente no banco de dados
            let listaAlunos = alunos;
            listaAlunos.splice(posicaoArray, 1);
            setAlunos([...listaAlunos]);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return(
        <div id="tela-lista-alunos">
            <SideBar />

            <main className="conteudo">
                <div>
                    <header>
                        <h2>Lista de alunos</h2>
                        <button type="button" onClick={() => navigate("/cadastro-aluno")}>Cadastrar novo aluno</button>
                    </header>

                    <form id="container-busca">
                        <input id="busca-aluno" placeholder="Buscar alunos" type="text" />
                        <button type="button">Buscar</button>
                    </form>

                    {alunos.length !== 0 ?
                        <>
                            <table cellSpacing={0}>
                                <thead>
                                    <tr>
                                        <th>Nome do aluno</th>
                                        <th>E-mail</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {alunos.map((aluno: Aluno, index: number) => {
                                        return(
                                            <tr key={index}>
                                                <td>{aluno.nome}</td>
                                                <td>{aluno.email}</td>
                                                <td>
                                                    <button type="button" onClick={() => navigate("/cadastro-aluno", { state: {aluno: aluno} })}><img src={iconeEditar} alt="Editar" /></button>
                                                    <button type="button" onClick={() => navigate("/lista-treinos", { state: {aluno: aluno} })}><img src={iconeTreinos} alt="Treinos" /></button>
                                                    <button type="button" onClick={() => deletarCadastro((aluno.idAluno || ""), index)}><img src={iconeApagar} alt="Apagar" /></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            <div className="paginacao">
                                <a>Voltar</a>
                                <p>1/2</p>
                                <a>Avançar</a>
                            </div>
                        </>
                    :
                        <p id="nenhum-registro">Nenhum aluno encontrado</p>
                    }
                </div>

                <Loading statusLoading={statusCarregando} />
            </main>
        </div>
    );
}