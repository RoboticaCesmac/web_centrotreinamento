import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { emailEstaValido } from '../../utils/validacoes';

import db from '../../providers/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { Aluno } from '../../models/Aluno';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import './styles.css';

interface ParametrosStateAluno {
    aluno?: Aluno
}

export default function TelaCadastroAluno(){
    const navigate = useNavigate();
    const stateParams = useLocation().state as ParametrosStateAluno;
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [idAluno, setIDAluno] = useState<string>("");
    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [objetivo, setObjetivo] = useState<string>("");
    const [temProblemaFisico, setTemProblemaFisico] = useState<boolean>(false);
    const [descricaoProblemaFisico, setDescricaoProblemaFisico] = useState<string>("");
    const [observacoes, setObservacoes] = useState<string>("");

    useEffect(() => {
        inicializarCampos();
    }, []);

    /**
     * Se for uma edição essa tela terá recebido os dados do aluno por parâmetro state.
     * Essa função é responsável por inicializar os campos com os dados passados.
     */
    const inicializarCampos = () => {
        if(stateParams !== null && stateParams.aluno !== undefined){
            let aluno = stateParams.aluno;
            setIDAluno(aluno.idAluno || "");
            setNome(aluno.nome);
            setEmail(aluno.email);
            setObjetivo(aluno.objetivo);
            setTemProblemaFisico(aluno.descricaoProblemaFisico !== "" ? true : false);
            setDescricaoProblemaFisico(aluno.descricaoProblemaFisico || "");
            setObservacoes(aluno.observacoes);
        }
    }

    /**
     * Salva o cadastro do aluno no banco de dados firestore
     * (Atualização ou inserção)
     * @param event
     */
    const salvarCadastro = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try{
            setStatusCarregando("Salvando cadastro...");

            event.preventDefault(); //Para não recarregar a página

            if(nome.length < 3 || emailEstaValido(email) === false || objetivo === "" || (temProblemaFisico === true && descricaoProblemaFisico === "")){
                throw new Error ("Preencha todos os campos obrigatórios (nome, email e objetivo");
            }

            let alunoID = idAluno;
            
            //Se for atualização, verifica se  o e-mail informado é diferente do que está cadastrado no banco (necessário para o próximo passo)
            let emailAlterado:boolean = false;
            if(alunoID !== ""){
                let documentoAluno = await getDoc(doc(db, "alunos", alunoID));
                let dadosAluno = documentoAluno.data();
                if(email !== dadosAluno?.email){
                    emailAlterado = true;
                }
            }

            //Busca se o e-mail informado já está cadastrado no banco de dados. Se estiver, retorna um erro.
            let consulta = query(collection(db, "alunos"), where("email", "==", email));
            let resultadoConsulta = await getDocs(consulta);

            //Se for atualização e o email não tiver sido alterado, é normal que tenha o email informado já cadastrado. Nos outros casos, pra que possa prosseguir é necessário não ter nenhum cadastro no banco de dados com o email informado.
            if((alunoID !== "" && emailAlterado === true && resultadoConsulta.size > 1) || (alunoID === "" && !resultadoConsulta.empty)){
                throw new Error("O aluno com e-mail "+email+" já está cadastrado no sistema.");
            }

            //Faz a alteração no banco de dados
            if(alunoID === "")
                alunoID = doc(collection(db, "alunos")).id;

            let aluno: Aluno = {
                idAluno: alunoID,
                nome: nome,
                email: email,
                objetivo: objetivo,
                descricaoProblemaFisico: descricaoProblemaFisico,
                observacoes: observacoes
            }

            //Se o aluno já existir apenas atualiza, mas se não existir, cria um novo cadastro. (merge: true)
            await setDoc(doc(db, "alunos", alunoID), aluno, { merge: true });

            navigate('/lista-alunos');
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return (
        <div id="tela-cadastro-aluno">
            <SideBar />

            <div className="conteudo">
                <header>
                    <h2>Cadastro de aluno</h2>
                </header>

                <form>
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input id="nome" type="text" value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="objetivo">Objetivo</label>
                        <input id="objetivo" type="text" value={objetivo} onChange={(event) => setObjetivo(event.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="problema-fisico">Tem problema físico?</label>
                        <select id="problema-fisico" value={temProblemaFisico === true ? "Sim" : "Não"} onChange={(event) => setTemProblemaFisico(event.target.value === "Sim" ? true : false)}>
                            <option disabled={true}>Selecione</option>
                            <option value={"Sim"}>Sim</option>
                            <option value={"Não"}>Não</option>
                        </select>
                    </div>

                    {temProblemaFisico === true &&
                        <div className="form-group">
                            <label htmlFor="descricao-problema-fisico">Descrição do problema físico</label>
                            <input id="descricao-problema-fisico" type="text" value={descricaoProblemaFisico} onChange={(event) => setDescricaoProblemaFisico(event.target.value)} />
                        </div>
                    }

                    <div className="form-group">
                        <label htmlFor="observacoes">Observações</label>
                        <textarea id="observacoes" value={observacoes} onChange={(event) => setObservacoes(event.target.value)} />
                    </div>

                    <div id="container-botoes">
                        <button type="button" onClick={() => navigate('/lista-alunos')}>Cancelar</button>
                        <button type="submit" onClick={(event) => salvarCadastro(event)}>Salvar cadastro</button>
                    </div>
                </form>
            </div>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}