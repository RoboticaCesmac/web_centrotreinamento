import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, DocumentData, getDocs, limit, query, QueryDocumentSnapshot, startAfter, where } from 'firebase/firestore';

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
    
    const [busca, setBusca] = useState<string>("");
    const [alunos, setAlunos] = useState<Aluno[]>([]);

    //Paginação
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const [limitePorBusca, setLimitePorBusca] = useState<number>(10);
    const [ultimoDocumentoPagina, setUltimoDocumentoPagina] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();

    useEffect(() => {
        buscarAlunos();
    }, []);

    /**
     * Carrega para um array os alunos cadastrados no banco de dados firestore.
     * Aplica o filtro se houver algo digitado no campo de busca.
     */
    const buscarAlunos = async (buscaPorMaisResultados?: boolean) => {
        try{
            setStatusCarregando("Buscando alunos...");

            let listaAlunos: Aluno[] = alunos;
            //Para uso na paginação - https://firebase.google.com/docs/firestore/query-data/query-cursors?hl=pt-br#paginate_a_query
            let ultimoDocumento: QueryDocumentSnapshot<DocumentData> | undefined = ultimoDocumentoPagina;

            //Pesquisa por prefixos: https://stackoverflow.com/questions/46568142/google-firestore-query-on-substring-of-a-property-value-text-search
            let consulta = query(collection(db, "alunos"), where("nome", ">=", busca), where("nome", "<=", busca+"~"), limit(limitePorBusca));

            //Se a busca for devido ao loading da página ou por ter apertado no botão buscar, então reinicia a lista de documentos encontrados.
            if(buscaPorMaisResultados === undefined || buscaPorMaisResultados === false){
                ultimoDocumento = undefined;
                listaAlunos = [];
                setPaginaAtual(1);
            }

            //Se houver ultimo documento, então começa a nova busca a partir dele
            if(ultimoDocumento !== undefined){
                consulta = query(consulta, startAfter(ultimoDocumento));
            }
            
            //Realiza a consulta após ter feito sua preparação
            let colecaoAlunos = await getDocs(consulta);

            //Guarda o resultado na lista
            colecaoAlunos.forEach((documento) => {
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

            //Guarda o último doc para que na próxima consulta se for avançar de página, possa começar a partir dele.
            ultimoDocumento = colecaoAlunos.docs[colecaoAlunos.docs.length-1];

            setUltimoDocumentoPagina(ultimoDocumento);
            setAlunos([...listaAlunos]);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Aumenta a quantidade de página e faz uma nova busca a partir de onde parou
     */
    const mostrarMaisResultados = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        setPaginaAtual(paginaAtual + 1);
        buscarAlunos(true);
    }

    /**
     * Deleta o cadastro do usuário do banco de dados firestore
     * @param idAluno 
     * @param posicaoArray 
     */
     const deletarCadastro = async (idAluno: string, posicaoArray: number) => {
        try{
            setStatusCarregando("Deletando cadastro...");

            //Deleta o documento do aluno
            await deleteDoc(doc(db, "alunos", idAluno));

            //Deleta os treinos do aluno
            let colecaoTreinos = await getDocs(collection(db, "alunos", idAluno, "treinos"));
            colecaoTreinos.forEach(documento => {
                deleteDoc(documento.ref);
            });

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
                        <input id="busca-aluno" type="text" placeholder="Buscar alunos" value={busca} onChange={(event) => setBusca(event.target.value)} />
                        <button type="button" onClick={() => buscarAlunos()}>Buscar</button>
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
                                {/* Se tiver chegado até a quantidade máxima de itens, então ainda tem chance de ter dados */}
                                {alunos.length >= (limitePorBusca*paginaAtual) &&
                                    <a href="/#" onClick={(event) => {mostrarMaisResultados(event)}}>Mostrar mais</a>                            
                                }
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