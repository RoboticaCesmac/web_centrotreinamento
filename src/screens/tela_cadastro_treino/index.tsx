import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

import { Sequencia } from '../../models/Sequencia';
import { Treino } from '../../models/Treino';
import { Aluno } from '../../models/Aluno';

import Loading from '../../components/loading';
import SideBar from '../../components/sidebar';

import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

import './styles.css';

interface ParametrosStateTreino {
    treino: Treino,
    aluno: Aluno
}

export default function TelaCadastroTreino(){
    const navigate = useNavigate();
    const stateParams = useLocation().state as ParametrosStateTreino;
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [aluno, setAluno] = useState<Aluno>();
    const [treinoUltimaPagina, setTreinoUltimaPagina] = useState<Treino>();

    const [nome, setNome] = useState<string>("");
    const [objetivo, setObjetivo] = useState<string>("");
    const [divisaoTreino, setDivisaoTreino] = useState<string>("");
    const [listaSequencias, setListaSequencias] = useState<Sequencia[]>([]);

    useEffect(() => {
        inicializarCampos();
    }, []);

    const inicializarCampos = () => {
        if(stateParams !== null && stateParams.aluno !== undefined){
            setAluno(stateParams.aluno);
        }else{
            navigate("/lista-alunos");
        }

        if(stateParams.treino !== undefined){
            let treino: Treino = stateParams.treino;
            
            setNome(treino.nome);
            setObjetivo(treino.objetivo);
            setDivisaoTreino(treino.divisaoTreino);
            setListaSequencias(treino.sequencias);

            setTreinoUltimaPagina(treino);
        }
    }

    /**
     * Cadastra o treino com suas sequências e exercícios no banco de dados firestore
     */
    const cadastrar = async (event: React.MouseEvent<HTMLButtonElement>) => {
        try{
            setStatusCarregando("Salvando cadastro...");

            event.preventDefault();

            if(nome.length < 3 && objetivo === "" && divisaoTreino === "" && listaSequencias.length === 0){
                throw new Error ("Preencha todos os campos");
            }

            let treinoID: string = "";
            if(stateParams.treino !== undefined && stateParams.treino.idTreino !== undefined && stateParams.treino.idTreino !== ""){
                treinoID = stateParams.treino.idTreino;
            }else{
                treinoID = doc(collection(db, "alunos", (aluno?.idAluno || ""), "treinos")).id;
            }

            let treino: Treino = {
                idTreino: treinoID,
                nome: nome,
                objetivo: objetivo,
                divisaoTreino: divisaoTreino,
                sequencias: listaSequencias
            }

            await setDoc(doc(db, "alunos", (aluno?.idAluno || ""), "treinos", treinoID), treino, {merge: true});

            navigate("/lista-treinos", {state: {aluno: aluno}});
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Redireciona para a página de criação de nova sequência junto com os dados do treino que já foram preenchidos
     * @param posicaoArraySequencia (caso seja uma edição)
     */
    const irParaFormularioSequencia = (posicaoArraySequencia?: number) => {
        let treinoID: string = "";
        if(stateParams.treino !== undefined && stateParams.treino.idTreino !== undefined){
            treinoID = stateParams.treino.idTreino;
        }

        let treino: Treino = {
            idTreino: treinoID,
            nome: nome,
            objetivo: objetivo,
            divisaoTreino: divisaoTreino,
            sequencias: listaSequencias
        }

        if(posicaoArraySequencia === undefined)
            navigate("/cadastro-sequencia", {state: {treino: treino, aluno: aluno}});
        else
            navigate("/cadastro-sequencia?indexSequencia="+posicaoArraySequencia, {state: {treino: treino, aluno: aluno}});
    }

    /**
     * Remove a sequência do array de sequências
     * @param posicaoArray 
     */
    const removerSequencia = (posicaoArray: number) => {
        let sequencias = listaSequencias;
        sequencias.splice(posicaoArray, 1);
        setListaSequencias([...sequencias]);
    }

    return (
        <div id="tela-cadastro-treino">
            <SideBar />

            <div className="conteudo">
                <header>
                    <h2>Cadastro de treino</h2>
                </header>

                <form>
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" type="text" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="objetivo">Objetivo</label>
                        <input id="objetivo" type="text" value={objetivo} onChange={(event) => setObjetivo(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="divisao-treino">Divisão de treino</label>
                        <input id="divisao-treino" type="text" value={divisaoTreino} onChange={(event) => setDivisaoTreino(event.target.value)} />
                    </div>

                    <header>
                        <h2>Sequências</h2>
                        <button type="button" onClick={() => irParaFormularioSequencia()}>Nova sequência</button>
                    </header>

                    {listaSequencias.length !== 0 ?
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Sequência</th>
                                    <th>Grupos musculares</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {listaSequencias.map((sequencia, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{sequencia.sequencia}</td>
                                            <td>{sequencia.gruposMusculares}</td>
                                            <td>
                                                {/* Quando for editar tem que passar o indexSequencia que é a posição da sequencia no vetor de sequencias */}
                                                <button type="button"><img src={iconeEditar} alt="Editar" onClick={() => irParaFormularioSequencia(index)} /></button>
                                                <button type="button" onClick={() => removerSequencia(index)}><img src={iconeApagar} alt="Apagar" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    :
                        <p id="nenhum-registro">Nenhuma sequência encontrada</p>
                    }


                    <div id="container-botoes">
                        <button type="button" onClick={() => navigate("/lista-treinos", {state: {aluno: aluno}})}>Cancelar</button>
                        <button type="submit" onClick={(event) => cadastrar(event)}>Salvar cadastro</button>
                    </div>
                </form>

                <Loading statusLoading={statusCarregando} />
            </div>
        </div>
    );
}