import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import { Exercicio } from '../../models/Exercicio';

import SideBar from '../../components/sidebar';
import Modal from '../../components/modal';
import Loading from '../../components/loading';

import iconeVideo from '../../assets/images/icons/play-button.png';
import imagemNaoEncontrada from '../../assets/images/imagem_nao_encontrada.png';
import './styles.css';

interface ParametrosExercicio {
    exercicio?: Exercicio
}

export default function TelaCadastroExercicio(){
    const navigate = useNavigate();
    const stateParams = useLocation().state as ParametrosExercicio;
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [idExercicio, setIDExercicio] = useState<string>("");
    const [nome, setNome] = useState<string>("");
    const [gruposMusculares, setGruposMusculares] = useState<string>("");
    const [descricao, setDescricao] = useState<string>("");
    const [urlGIF, setURLGIF] = useState<string>("");

    const storage = getStorage();
    const refInputGIF = useRef<HTMLInputElement>(null);
    const [arquivosGIF, setArquivosGIF] = useState<FileList | null>(null);

    const [modalGIFVisivel, setModalGIFVisivel] = useState<boolean>(false);

    useEffect(() => {
        inicializarCampos();
    }, []);

    /**
     * Se for uma edição essa tela terá recebido os dados do exercício por parâmetro state.
     * Essa função é responsável por inicializar os campos com os dados passados.
     */
    const inicializarCampos = () => {
        if(stateParams !== null && stateParams.exercicio !== undefined){
            let exercicio: Exercicio = stateParams.exercicio;
            setIDExercicio(exercicio.idExercicio || "");
            setNome(exercicio.nome);
            setGruposMusculares(exercicio.gruposMusculares);
            setDescricao(exercicio.descricao);
            setURLGIF(exercicio.urlGIF);
        }
    }

    /**
     * Salva o cadastro do exercício no banco de dados firestore
     * (Atualização ou inserção)
     */
    const salvarCadastro = async (event: React.MouseEvent<HTMLButtonElement>) => {
        try{
            setStatusCarregando("Cadastrando exercício...");
            event.preventDefault();

            //Valida se os todos os campos foram preechidos. Retorna um erro caso a validação falhe.
            if(nome.length < 3 || gruposMusculares === ""){
                throw new Error("Preencha os campos. Apenas o campo descrição e imagem não é obrigatório.");
            }

            let exercicioID = idExercicio;

            if(exercicioID === "")
                exercicioID = doc(collection(db, "exercicios")).id;

            // Salva a imagem no storage do firebase
            let urlGIFStorage = urlGIF;
            if(arquivosGIF !== null){
                const uploadSnapshot = await uploadBytes(ref(storage, "exercicios/"+exercicioID), arquivosGIF[0]);
                urlGIFStorage = await getDownloadURL(uploadSnapshot.ref);
            }else if(exercicioID !== "" && urlGIFStorage === ""){
                // Tenta deletar a imagem anterior (se houver)
                await deleteObject(ref(storage, 'exercicios/'+exercicioID));
            }

            let exercicio: Exercicio = {
                idExercicio: exercicioID,
                nome: nome,
                gruposMusculares: gruposMusculares,
                descricao: descricao,
                urlGIF: urlGIFStorage
            }

            //Se o exercício já existir apenas atualiza, mas se não existir, cria um novo cadastro. (merge: true)
            await setDoc(doc(db, "exercicios", exercicioID), exercicio, {merge: true});

            //Redireciona para a lista de exercícios
            navigate('/lista-exercicios');
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Abre a imagem (se existir) ou abre o explorer
     * caso seja para selecionar uma nova imagem
     * @returns 
     */
    const adicionarOuAbrirImagem = () => {
        if(urlGIF === ""){
            // Abre o explorer do sistema
            refInputGIF.current?.click();
            return;
        }

        // Abre o modal para visualização da imagem
        setModalGIFVisivel(true);
    }

    /**
     * Atualiza o state de arquivos e a URL da imagem
     * @param arquivosImagem
     */
    const onChangeInputGIF = (arquivosImagem: FileList | null) => {
        setArquivosGIF(arquivosImagem);

        if(arquivosImagem !== null){
            setURLGIF(URL.createObjectURL(arquivosImagem[0]));
        }
    }

    /**
     * Abre o explorer para adicionar uma nova imagem
     * ou remove as imagens das variáveis, caso elas já estejam
     * preenchidas.
     * @returns 
     */
    const adicionarOuApagarImagem = () => {
        // Adicionar
        if(urlGIF === "" && arquivosGIF === null){
            refInputGIF.current?.click();
            return;
        }

        // Remover
        setURLGIF("");
        setArquivosGIF(null);
        refInputGIF.current!.value = "";
    }

    return (
        <div id="tela-cadastro-exercicio">
            <SideBar />
            
            <div className="conteudo">
                <header>
                    <h2>Cadastro de exercício</h2>
                </header>

                <form>
                    <div className="form-group">
                        <label htmlFor="nome">Nome do exercício</label>
                        <input id="nome" type="text" placeholder="Nome do exercício" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grupos-musculares">Grupos musculares</label>
                        <input id="grupos-musculares" type="text" placeholder="Grupos musculares trabalhados" value={gruposMusculares} onChange={(event) => setGruposMusculares(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricao">Descrição do exercício</label>
                        <textarea id="descricao" value={descricao} placeholder="Descrição do exercício" onChange={(event) => setDescricao(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gif-url">Arquivo de imagem (GIF)</label>

                        <div id="container-input-imagem-externo">
                            <div id="container-input-imagem-interno">
                                <input placeholder='Nenhum arquivo selecionado' value={urlGIF} onClick={() => adicionarOuAbrirImagem()} />
                                <input ref={refInputGIF} id="gif-url" type="file" accept='image/gif' onChange={(event) => onChangeInputGIF(event.target.files)} />

                                {urlGIF !== "" &&
                                    <button type="button" onClick={() => setModalGIFVisivel(true)}><img className="img-icone" src={iconeVideo} alt="GIF" /></button>
                                }
                            </div>

                            <button id="botao-adicionar-apagar" type="button" onClick={() => {adicionarOuApagarImagem()}}>{urlGIF === "" ? "Adicionar imagem" : "Apagar imagem"}</button>
                        </div>
                    </div>

                    <div id="container-botoes">
                        <button type="button" onClick={() => navigate('/lista-exercicios')}>Cancelar</button>
                        <button type="submit" onClick={(event) => salvarCadastro(event)}>Salvar cadastro</button>
                    </div>
                </form>
            </div>

            <Modal titulo="Visualização do GIF" visivel={modalGIFVisivel} onClose={() => setModalGIFVisivel(!modalGIFVisivel)}>
                <div id="modal-visualizacao-gif">
                    <img src={urlGIF} alt="GIF animado" referrerPolicy="no-referrer" onError={( event ) => {event.currentTarget.onerror = null; /*prevents looping*/ event.currentTarget.src=imagemNaoEncontrada}} />
                    <button onClick={() => setModalGIFVisivel(false)}>Ok</button>
                </div>
            </Modal>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}