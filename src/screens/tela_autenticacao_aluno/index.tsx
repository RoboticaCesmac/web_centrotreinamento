import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailEstaValido } from '../../utils/validacoes';

import db from '../../providers/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

import Loading from '../../components/loading';

import logomarca from '../../assets/images/logo_cs.png';
import './styles.css';

export default function TelaAutenticacaoAluno(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    /**
     * Busca o e-mail do aluno no banco de dados firestore. Redireciona para a tela meus-treinos se o e-mail for encontrado.
     */
    const autenticar = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try{
            setStatusCarregando("Autenticando...");

            //PreventDefault para não dar reload na página
            event.preventDefault();

            if(emailEstaValido(email) === false){
                throw new Error("Informe um e-mail válido");
            }

            //Busca o e-mail informado no banco de dados firestore
            let consulta = query(collection(db, "alunos"), where("email", "==", email));
            let documentosRetornados = await getDocs(consulta);
            
            if(documentosRetornados.empty === true){
                throw new Error("Nenhum aluno com o e-mail informado foi encontrado no sistema.");
            }

            let dadosAluno = documentosRetornados.docs[0].data();

            //Redireciona para a tela com os treinos do aluno
            navigate('/meus-treinos?idAluno='+dadosAluno.idAluno, {state: {aluno: dadosAluno}});
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return(
        <div id="tela-autenticacao-aluno">
            <form>
                <img src={logomarca} alt="Logomarca" />

                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" value={email} onChange={(event) => setEmail(event?.target.value)} />
                </div>

                <button type="submit" onClick={(event) => autenticar(event)}>Entrar</button>
                <a href="/#" onClick={(event) => {event.preventDefault(); navigate("/autenticacao-administrador")}}>Sou administrador</a>
            </form>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}