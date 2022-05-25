import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailEstaValido } from '../../utils/validacoes';

import { Usuario } from '../../models/Usuario';

import db from '../../providers/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import Loading from '../../components/loading';

import logomarca from '../../assets/images/logo_cs.png';
import './styles.css';

export default function TelaCadastroUsuario(){
    const navigate = useNavigate();
    const [statusCarregando, setStautsCarregando] = useState<string>("");

    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [senhaRepetida, setSenhaRepetida] = useState<string>("");
    
    /**
     * Cadastra o usuário no firebase
     */
    const cadastrar = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try{
            setStautsCarregando("Cadastrando usuário...");

            //PreventDefault para não dar reload na página
            event.preventDefault();

            //Valida se os campos foram preenchidos corretamente. Retorna um erro caso algum campo não esteja válido
            if(nome.length < 3 && emailEstaValido(email) === false && senha.length < 6 && senha !== senhaRepetida){
                throw new Error("E-mail ou senha inválida");
            }

            //Cria a autenticação
            let credencialUsuario = await createUserWithEmailAndPassword(getAuth(), email, senha);
            let idUsuario = credencialUsuario.user?.uid;
            updateProfile(credencialUsuario.user, {
                displayName: nome
            });

            //Guarda no banco de dados firestore
            let dadosUsuario: Usuario = {
                idUsuario: idUsuario,
                nome: nome,
                email: email
            }

            await setDoc(doc(db, "usuarios", idUsuario), dadosUsuario);

            //Redireciona para a página lista-alunos
            navigate('/lista-alunos');
        }catch(erro){
            alert(erro);
        }finally{
            setStautsCarregando("");
        }
    }

    return(
        <div id="tela-cadastro-usuario">
            <form>
                <img src={logomarca} alt="Logomarca" />

                <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" type="text" value={nome} onChange={(event) => setNome(event.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor="senha">Senha</label>
                    <input id="senha" type="password" minLength={6} value={senha} onChange={(event) => setSenha(event.target.value)} />
                </div>

                <div className="form-group">
                    <label htmlFor="senha">Repetir senha</label>
                    <input id="senha" type="password" minLength={6} value={senhaRepetida} onChange={(event) => setSenhaRepetida(event.target.value)} />
                </div>

                <div>
                    <button type="button" onClick={() => navigate("/autenticacao-administrador")}>Cancelar</button>
                    <button type="submit" onClick={(event) => cadastrar(event)}>Cadastrar</button>
                </div>
            </form>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}