import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, DocumentData, getDocs, limit, query, QueryDocumentSnapshot, startAfter, where } from 'firebase/firestore';

import SideBar from '../../components/sidebar';
import Modal from '../../components/modal';
import Loading from '../../components/loading';

import { Exercicio } from '../../models/Exercicio';

import iconeVideo from '../../assets/images/icons/play-button.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';
import imagemNaoEncontrada from '../../assets/images/imagem_nao_encontrada.png';

import './styles.css';

export default function TelaListaExercicios(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [modalGIFVisivel, setModalGIFVisivel] = useState<boolean>(false);
    const [URLGifModal, setURLGifModal] = useState<string>("");
    
    const [busca, setBusca] = useState<string>("");
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);

    //Paginação
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const [limitePorBusca, setLimitePorBusca] = useState<number>(10);
    const [ultimoDocumentoPagina, setUltimoDocumentoPagina] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();

    /**
     * Executado na primeira renderização da págna
     */
    useEffect(() => {
        buscarExercicios();
    }, []);

    /**
     * Carrega para um array os exercícios cadastrados no banco de dados firestore
     */
    const buscarExercicios = async (buscaPorMaisResultados?: boolean) => {
        try{
            setStatusCarregando("Buscando exercícios...");

            let listaExercicios: Exercicio[] = exercicios;
            //Para uso na paginação - https://firebase.google.com/docs/firestore/query-data/query-cursors?hl=pt-br#paginate_a_query
            let ultimoDocumento: QueryDocumentSnapshot<DocumentData> | undefined = ultimoDocumentoPagina;

            //Pesquisa por prefixos: https://stackoverflow.com/questions/46568142/google-firestore-query-on-substring-of-a-property-value-text-search
            let consulta = query(collection(db, "exercicios"), where("nome", ">=", busca), where("nome", "<=", busca+"~"), limit(limitePorBusca));

            //Se a busca for devido ao loading da página ou por ter apertado no botão buscar, então reinicia a lista de documentos encontrados.
            if(buscaPorMaisResultados === undefined || buscaPorMaisResultados === false){
                ultimoDocumento = undefined;
                listaExercicios = [];
                setPaginaAtual(1);
            }

            //Se houver ultimo documento, então começa a nova busca a partir dele
            if(ultimoDocumento !== undefined){
                consulta = query(consulta, startAfter(ultimoDocumento));
            }

            //Realiza a consulta após ter feito sua preparação
            let colecaoExercicios = await getDocs(consulta);

            //Guarda o resultado na lista
            colecaoExercicios.forEach((documentoExercicio) => {
                let dadosExercicio = documentoExercicio.data();
                listaExercicios.push({
                    idExercicio: dadosExercicio.idExercicio,
                    nome: dadosExercicio.nome,
                    descricao: dadosExercicio.descricao,
                    gruposMusculares: dadosExercicio.gruposMusculares,
                    urlGIF: dadosExercicio.urlGIF
                });
            });

            //Guarda o último doc para que na próxima consulta se for avançar de página, possa começar a partir dele.
            ultimoDocumento = colecaoExercicios.docs[colecaoExercicios.docs.length-1];

            setUltimoDocumentoPagina(ultimoDocumento);
            setExercicios([...listaExercicios]);
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
        buscarExercicios(true);
    }

    /**
     * Deleta o cadastro do exercício do banco de dados firestore
     * @param idExercicio 
     * @param index 
     */
    const deletarCadastro = async (idExercicio: string, index: number) => {
        try{
            let confirmacao = window.confirm("Deseja mesmo deletar o exercício?");
            
            if(confirmacao === true){
                setStatusCarregando("Deletando cadastro...");
                await deleteDoc(doc(db, "exercicios", idExercicio));
    
                //Deleta a posição no vetor de exercícios para que não precise fazer a consulta novamente no banco de dados
                let listaExercicios = exercicios;
                listaExercicios.splice(index, 1);
                setExercicios([...listaExercicios]);
            }
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Torna o modal de visualização do gif visível e atribui o URL que ele irá exibir
     * @param exercicio 
     */
    const visualizarGIF = async (urlGIF: string) => {
        setURLGifModal(urlGIF);
        setModalGIFVisivel(true);
    }

    return(
        <div id="tela-lista-exercicios">
            <SideBar />

            <main className="conteudo">
                <header>
                    <h2>Lista de exercícios</h2>
                    <button type="button" onClick={() => navigate("/cadastro-exercicio")}>Cadastrar novo exercício</button>
                </header>

                <form id="container-busca" onSubmit={(event) => {event.preventDefault(); buscarExercicios();}}>
                    <input id="busca-exercicio" placeholder="Buscar exercícios" type="text" value={busca} onChange={(event) => setBusca(event.target.value)} />
                    <button type="button" onClick={() => buscarExercicios()}>Buscar</button>
                </form>

                {exercicios.length !== 0 ?
                    <>
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Nome do exercício</th>
                                    <th>Grupos musculares</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {exercicios.map((exercicio: Exercicio, index: number) => {
                                    return(
                                        <tr key={index}>
                                            <td>{exercicio.nome}</td>
                                            <td>{exercicio.gruposMusculares}</td>
                                            <td>
                                                <button type="button" onClick={() => navigate("/cadastro-exercicio", { state: {exercicio: exercicio} })}><img src={iconeEditar} alt="Editar" /></button>
                                                <button type="button"><img src={iconeVideo} alt="GIF" onClick={() => visualizarGIF(exercicio.urlGIF)}/></button>
                                                <button type="button" onClick={() => deletarCadastro(exercicio.idExercicio || "", index)}><img src={iconeApagar} alt="Apagar" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="paginacao">
                            {/* Se tiver chegado até a quantidade máxima de itens, então ainda tem chance de ter dados */}
                            {exercicios.length >= (limitePorBusca*paginaAtual) && 
                                <a href="/#" onClick={(event) => {mostrarMaisResultados(event)}}>Mostrar mais</a>
                            }
                        </div>
                    </>
                :
                    <p id="nenhum-registro">Nenhum exercício encontrado</p>
                }
            </main>
            
            <Modal titulo="Visualização do GIF" visivel={modalGIFVisivel} onClose={() => setModalGIFVisivel(!modalGIFVisivel)}>
                <div id="modal-visualizacao-gif">
                    <img src={URLGifModal} alt="GIF animado" referrerPolicy="no-referrer" onError={( event ) => {event.currentTarget.onerror = null; /*prevents looping*/ event.currentTarget.src=imagemNaoEncontrada}} />
                    <button onClick={() => setModalGIFVisivel(false)}>Ok</button>
                </div>
            </Modal>
            
            <Loading statusLoading={statusCarregando} />
        </div>
    );
}