import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailEstaValido } from '../../utils/validacoes';

import db from '../../providers/firebase';
import { deleteUser, getAuth, updateEmail } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, limit, query, updateDoc } from 'firebase/firestore';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';

import './styles.css';

export default function TelaConfiguracoes(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    /**
     * Atualiza o e-mail da autenticação do firebase e o e-mail do cadastro do usuário no firestore
     */
    const alterarEmail = async () => {
        try{
            setStatusCarregando("Atualizando e-mail...");

            if(emailEstaValido(email) === false){
                throw new Error("Digite um e-mail válido");
            }

            let usuarioLogado = getAuth().currentUser;

            if(usuarioLogado !== null){
                //Atualiza o e-mail da autenticação
                await updateEmail(usuarioLogado, email);
                //Atualiza o e-mail do cadastro no firestore
                await updateDoc(doc(db, "usuarios", usuarioLogado.uid), { email: usuarioLogado.email });

                alert("Seu e-mail foi alterado. Lembre de usar o e-mail novo na próxima vez que for se autenticar.");
            }else{
                throw new Error("O usuário não está autenticado. Tente sair da sua conta e entrar novamente.")
            }
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Deleta a autenticação do firebase e o cadastro do usuário no firestore.
     * Só conclui a exclusão se não for o único usuário cadastrado.
     */
    const deletarConta = async () => {
        try{
            setStatusCarregando("Deletando usuário...");

            let usuarioLogado = getAuth().currentUser;

            if(usuarioLogado !== null){
                let consulta = query(collection(db, "usuarios"), limit(5));
                let colecaoUsuarios = await getDocs(consulta);

                //Só deixa excluir se não for o único usuário cadastrado
                if(colecaoUsuarios.docs.length < 2){
                    throw new Error("Não é possível deletar o único usuário cadastrado.");
                }

                await deleteUser(usuarioLogado);
                await deleteDoc(doc(db, "usuarios", usuarioLogado.uid));
                navigate("/");
            }else{
                throw new Error("O usuário não está autenticado. Tente sair da sua conta e entrar novamente.");
            }
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return(
        <div id="tela-configuracoes">
            <SideBar />

            <div className="conteudo">
                <header>
                    <h2>Configurações</h2>
                </header>

                <form className="container-configuracao">
                    <h2>Alterar e-mail</h2>                    
                    <p>Se deseja alterar o seu e-mail de cadastro e de login, preencha o campo abaixo e clique no botão atualizar.</p>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>

                    <button type="button" onClick={() => alterarEmail()}>Atualizar</button>
                </form>

                <div className="container-configuracao">
                    <h2>Excluir conta</h2>
                    <p>Se deseja excluir sua conta, pressione o botão abaixo. Faça isso se tiver certeza, pois todos os seus dados serão excluídos permanentemente do sistema.</p>

                    <button type="button" onClick={() => deletarConta()}>Excluir conta</button>
                </div>

                <Loading statusLoading={statusCarregando} />
            </div>
        </div>
    );
}