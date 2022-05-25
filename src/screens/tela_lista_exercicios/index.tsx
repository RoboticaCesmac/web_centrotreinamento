import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import SideBar from '../../components/sidebar';
import Modal from '../../components/modal';
import Loading from '../../components/loading';

import { Exercicio } from '../../models/Exercicio';

import iconeVideo from '../../assets/images/icons/play-button.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

import './styles.css';

export default function TelaListaExercicios(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");
    
    const [modalGIFVisivel, setModalGIFVisivel] = useState<boolean>(false);
    const [URLGifModal, setURLGifModal] = useState<string>("");
    
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);

    /**
     * Executado na primeira renderização da págna
     */
    useEffect(() => {
        carregarListaExercicios();
    }, []);

    /**
     * Carrega para um array os exercícios cadastrados no banco de dados firestore
     */
    const carregarListaExercicios = async () => {
        try{
            setStatusCarregando("Buscando exercícios...");
            let documentosExercicios = await getDocs(collection(db, "exercicios"));

            let listaExercicios: Exercicio[] = [];
            documentosExercicios.forEach((documentoExercicio) => {
                let dadosExercicio = documentoExercicio.data();
                listaExercicios.push({
                    idExercicio: dadosExercicio.idExercicio,
                    nome: dadosExercicio.nome,
                    descricao: dadosExercicio.descricao,
                    gruposMusculares: dadosExercicio.gruposMusculares,
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
     * Deleta o cadastro do exercício do banco de dados firestore
     * @param idExercicio 
     * @param index 
     */
    const deletarCadastro = async (idExercicio: string, index: number) => {
        try{
            setStatusCarregando("Deletando cadastro...");
            await deleteDoc(doc(db, "exercicios", idExercicio));

            //Deleta a posição no vetor de exercícios para que não precise fazer a consulta novamente no banco de dados
            let listaExercicios = exercicios;
            listaExercicios.splice(index, 1);
            setExercicios([...listaExercicios]);
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

                <form id="container-busca">
                    <input id="busca-exercicio" placeholder="Buscar exercícios" type="text" />
                    <button type="button">Buscar</button>
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
                            <a>Voltar</a>
                            <p>0/0</p>
                            <a>Avançar</a>
                        </div>
                    </>
                :
                    <p id="nenhum-registro">Nenhum exercício encontrado</p>
                }
            </main>
            
            <Modal titulo="Visualização do GIF" visivel={modalGIFVisivel} onClose={() => setModalGIFVisivel(!modalGIFVisivel)}>
                <div id="modal-visualizacao-gif">
                    <img src={URLGifModal} alt="GIF animado" referrerPolicy="no-referrer" />
                    <button onClick={() => setModalGIFVisivel(false)}>Ok</button>
                </div>
            </Modal>
            
            <Loading statusLoading={statusCarregando} />
        </div>
    );
}