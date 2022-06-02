import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailEstaValido } from '../../utils/validacoes';

import db from '../../providers/firebase';
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';

import { Aluno } from '../../models/Aluno';

import Loading from '../../components/loading';

import logomarca from '../../assets/images/logo_cs.png';
import './styles.css';

export default function TelaAutenticacao(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");

    useEffect(() => {
        redirecionarSeAutenticado();
    }, []);
    
    /**
     * Redireciona automaticamente para a tela de lista de alunos caso o administrador já esteja autenticado;
     * Ou para a página de meus-treinos caso um aluno já esteja autenticado.
     */
    const redirecionarSeAutenticado = () => {
        if(getAuth().currentUser !== null){
            navigate('/lista-alunos');
        }else if(localStorage.getItem("alunoAutenticado") !== null){
            let dadosAluno: Aluno = JSON.parse(localStorage.getItem("alunoAutenticado") || "");
            navigate('/meus-treinos?idAluno='+(dadosAluno.idAluno));
        }
    }

    /**
     * Faz a autenticação no banco de dados firebase
     */
    const autenticar = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try{
            setStatusCarregando("Autenticando...");

            //PreventDefault para não dar reload na página
            event.preventDefault();

            //Autentica o usuário no firebase
            await signInWithEmailAndPassword(getAuth(), email, senha);

            //Redireciona para a tela de lista de alunos
            navigate('/lista-alunos');
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Envia um e-mail de redefinição de senha
     */
    const redefinirSenha = async () => {
        try{
            setStatusCarregando("Solicitando redefinição...");

            if(emailEstaValido(email) === false){
                throw new Error("Email inválido");
            }

            await sendPasswordResetEmail(getAuth(), email);
            alert("Um e-mail de redefinição de senha foi enviado para "+email);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return(
        <div id="tela-autenticacao-administrador">
            <form>
                <img src={logomarca} alt="Logomarca" />

                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" value={email} onChange={(event) => setEmail(event?.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" minLength={6} onChange={(event) => setSenha(event?.target.value)} />
                </div>

                <button type="submit" onClick={(event) => autenticar(event)}>Entrar</button>
                <a href="/#" onClick={(event) => {event.preventDefault(); redefinirSenha();}}>Esqueci minha senha</a>
            </form>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}