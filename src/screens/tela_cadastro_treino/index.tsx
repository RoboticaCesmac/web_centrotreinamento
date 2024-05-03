import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

import { Bloco } from '../../models/Bloco';
import { Treino } from '../../models/Treino';
import { Aluno } from '../../models/Aluno';

import Loading from '../../components/loading';
import SideBar from '../../components/sidebar';
import SelectMultiplo, { IItemSelectMultiplo } from '../../components/select-multiplo';

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
    const [diasSemana, setDiasSemana] = useState<string[]>([]);
    const [listaBlocos, setListaBlocos] = useState<Bloco[]>([]);

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
            setDiasSemana(treino.diasSemana);
            setListaBlocos(treino.blocos);

            setTreinoUltimaPagina(treino);
        }
    }

    /**
     * Cadastra o treino com suas blocos e exercícios no banco de dados firestore
     */
    const cadastrar = async (event: React.MouseEvent<HTMLButtonElement>) => {
        try{
            setStatusCarregando("Salvando cadastro...");

            event.preventDefault();

            if(nome.length < 3 && objetivo === "" && diasSemana.length === 0 && listaBlocos.length === 0){
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
                diasSemana: diasSemana,
                blocos: listaBlocos
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
     * Redireciona para a página de criação de novo bloco junto com os dados do treino que já foram preenchidos
     * @param posicaoArrayBloco (caso seja uma edição)
     */
    const irParaFormularioBloco = (posicaoArrayBloco?: number) => {
        let treinoID: string = "";
        if(stateParams.treino !== undefined && stateParams.treino.idTreino !== undefined){
            treinoID = stateParams.treino.idTreino;
        }

        let treino: Treino = {
            idTreino: treinoID,
            nome: nome,
            objetivo: objetivo,
            diasSemana: diasSemana,
            blocos: listaBlocos
        }

        if(posicaoArrayBloco === undefined)
            navigate("/cadastro-bloco", {state: {treino: treino, aluno: aluno}});
        else
            navigate("/cadastro-bloco?indexBloco="+posicaoArrayBloco, {state: {treino: treino, aluno: aluno}});
    }

    /**
     * Remove o bloco do array de blocos
     * @param posicaoArray 
     */
    const removerBloco = (posicaoArray: number) => {
        let blocos = listaBlocos;
        blocos.splice(posicaoArray, 1);
        setListaBlocos([...blocos]);
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
                        <label htmlFor="nome">Nome do treino</label>
                        <input id="nome" type="text" placeholder="Nome do treino" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="objetivo">Objetivo do treino</label>
                        <input id="objetivo" type="text" placeholder="Objetivo do treino" value={objetivo} onChange={(event) => setObjetivo(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dias-semana">Dias da semana</label>
                        <SelectMultiplo titulo='Dias da semana' itensDisponiveis={[
                            {id: "Segunda-feira", descricao: "Segunda-feira"},
                            {id: "Terça-feira", descricao: "Terça-feira"},
                            {id: "Quarta-feira", descricao: "Quarta-feira"},
                            {id: "Quinta-feira", descricao: "Quinta-feira"},
                            {id: "Sexta-feira", descricao: "Sexta-feira"},
                            {id: "Sábado", descricao: "Sábado"},
                            {id: "Domingo", descricao: "Domingo"}
                        ]} idsItensSelecionados={diasSemana} salvar={(itensSelecionados: string[]) => setDiasSemana([...itensSelecionados])} />
                    </div>

                    <header>
                        <h2>Blocos</h2>
                        <button type="button" onClick={() => irParaFormularioBloco()}>Novo bloco</button>
                    </header>

                    {listaBlocos.length !== 0 ?
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Bloco</th>
                                    <th>Grupos musculares</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {listaBlocos.map((bloco, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{bloco.bloco}</td>
                                            <td>{bloco.gruposMusculares}</td>
                                            <td>
                                                {/* Quando for editar tem que passar o indexBloco que é a posição do bloco no vetor de blocos */}
                                                <button type="button"><img src={iconeEditar} alt="Editar" onClick={() => irParaFormularioBloco(index)} /></button>
                                                <button type="button" onClick={() => removerBloco(index)}><img src={iconeApagar} alt="Apagar" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    :
                        <p id="nenhum-registro">Nenhum bloco encontrado</p>
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