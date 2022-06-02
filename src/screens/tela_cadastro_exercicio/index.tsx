import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';

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
            if(nome.length < 3 || gruposMusculares === "" || descricao === "" || urlGIF.length < 40){
                throw new Error("Preencha todos os campos");
            }

            let exercicioID = idExercicio;

            if(exercicioID === "")
                exercicioID = doc(collection(db, "alunos")).id;

            let urlGIFAjustado = urlGIF;
            //Se a URL for realmente do google drive e ainda não tiver sido ajustada, então faz o ajuste na URL (pra que possa ser exibida posteriormente na tag img)
            if(urlGIF.search("drive") > -1 && urlGIF.search("thumbnail") === -1){
                let urlDividida = urlGIF.split("d/");
                urlGIFAjustado = "https://drive.google.com/thumbnail?id="+urlDividida[1].split("/")[0];
            }

            let exercicio: Exercicio = {
                idExercicio: exercicioID,
                nome: nome,
                gruposMusculares: gruposMusculares,
                descricao: descricao,
                urlGIF: urlGIFAjustado
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
                        <input id="nome" type="text" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="grupos-musculares">Grupos musculares</label>
                        <input id="grupos-musculares" type="text" value={gruposMusculares} onChange={(event) => setGruposMusculares(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descricao">Descrição</label>
                        <textarea id="descricao" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gif-url">Link GIF Google Drive</label>
                        <input id="gif-url" type="url" value={urlGIF} onChange={(event) => setURLGIF(event.target.value)} />
                    </div>

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