import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

import { Exercicio } from '../../models/Exercicio';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

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
            if(nome.length < 3 || gruposMusculares === "" || urlGIF.length < 40){
                throw new Error("Preencha os campos. Apenas o campo descrição não é obrigatório.");
            }

            let exercicioID = idExercicio;

            if(exercicioID === "")
                exercicioID = doc(collection(db, "exercicios")).id;

            // Salva a imagem no storage do firebase
            let urlGIFStorage = undefined;
            if(arquivosGIF !== null){
                const uploadSnapshot = await uploadBytes(ref(storage, "exercicios/"+exercicioID), arquivosGIF[0]);
                urlGIFStorage = await getDownloadURL(uploadSnapshot.ref);
            }

            let exercicio: Exercicio = {
                idExercicio: exercicioID,
                nome: nome,
                gruposMusculares: gruposMusculares,
                descricao: descricao,
                urlGIF: urlGIFStorage || urlGIF // Se for edição e a imagem não tiver sido alterada, mantém a que já estava
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
     * Abre a imagem (se existir) e abre o explorer
     * caso seja para selecionar uma nova imagem
     * @returns 
     */
    const adicionarOuAbrirImagem = () => {
        if(urlGIF === ""){
            // Abre o explorer do sistema
            refInputGIF.current?.click();
            return;
        }

        // Abre o link da imagem
        window.open(urlGIF);
    }

    const abrirExplorer = () => {
        refInputGIF.current?.click();
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
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" type="text" placeholder="Nome do exercício" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grupos-musculares">Grupos musculares</label>
                        <input id="grupos-musculares" type="text" placeholder="Grupos musculares trabalhados" value={gruposMusculares} onChange={(event) => setGruposMusculares(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricao">Descrição</label>
                        <textarea id="descricao" value={descricao} placeholder="Descrição do exercício" onChange={(event) => setDescricao(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gif-url">Arquivo de imagem</label>
                        <div id="container-input-files">
                            <input placeholder='Nenhum arquivo escolhido' value={urlGIF} onClick={() => adicionarOuAbrirImagem()} />
                            <input ref={refInputGIF} id="gif-url" type="file" accept='image/gif' value={urlGIF} onChange={(event) => setArquivosGIF(event.target.files)} />
                            
                            <button type="button" onClick={() => {(urlGIF === "" || arquivosGIF === null) ?  : apagarImagem()}}>{urlGIF === "" ? "Adicionar" : "Apagar"}</button>
                        </div>
                    </div>

                    {/* <input id="gif-url" type="url" value={urlGIF} onChange={(event) => setURLGIF(event.target.value)} /> */}

                    <div id="container-botoes">
                        <button type="button" onClick={() => navigate('/lista-exercicios')}>Cancelar</button>
                        <button type="submit" onClick={(event) => salvarCadastro(event)}>Salvar cadastro</button>
                    </div>
                </form>
            </div>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}