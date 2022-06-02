import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuth, signOut } from 'firebase/auth';

import { Aluno } from '../../models/Aluno';

import logomarca from '../../assets/images/logo_cs.png';
import iconeAlunos from '../../assets/images/icons/user.png';
import iconeExercicios from '../../assets/images/icons/haltere.png';
import iconeAdministrador from '../../assets/images/icons/businessman.png';
import iconeConfiguracoes from '../../assets/images/icons/settings.png';
import iconeMeusTreinos from '../../assets/images/icons/to-do-list.png';
import iconeSobre from '../../assets/images/icons/info-button.png';
import iconeSair from '../../assets/images/icons/logout.png';
import iconeFechar from '../../assets/images/icons/hide.png';
import iconeAbrir from '../../assets/images/icons/menu.png';

import './styles.css';

export default function SideBar () {
    const [mostrarSideBar, setMostrarSideBar] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        //Inicializar o menu fechado se estiver com uma tela com largura pequena
        let larguraTela = document?.getElementById("root")?.offsetWidth || 1280;
        if(larguraTela <= 740){
            setMostrarSideBar(false);
        }
    }, []);

    /**
     * Desconecta o usuário da autenticação do firebase
     */
    const sair = async () => {
        try{
            //Se for administrador
            let autenticacao = getAuth();
            await signOut(autenticacao);

            //Se for aluno
            localStorage.removeItem('alunoAutenticado');

            navigate("/");
        }catch(erro){
            alert(erro);
        }
    }

    /**
     * Retorna true se estiver logado e fale se estiver deslogado
     * @returns boolean
     */
    const estaUsuarioAutenticado = ():boolean => {
        if(getAuth().currentUser !== null){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Se um aluno estiver autenticado, retorna o seu ID. Caso contrário, retorna undefined.
     */
    const retornarIDAluno = ():(string | null) => {
        if(localStorage.getItem("alunoAutenticado") !== null){
            let aluno: Aluno = JSON.parse(localStorage.getItem("alunoAutenticado") || "");
            return aluno.idAluno || "";
        }else{
            return null;
        }
    }

    return(
        <nav id="componente-side-bar" className={mostrarSideBar === true ? 'componente-side-bar-aberto' : ''}>
            {mostrarSideBar === true &&
                <ul>
                    <div id="container-logomarca">
                        <img src={logomarca} alt="Logomarca" />
                        <h4>Sistema CS</h4>
                    </div>

                    {estaUsuarioAutenticado() === true &&
                    <>
                        <li onClick={() => navigate("/lista-administradores")}>
                            <img src={iconeAdministrador} alt="Administradores" />
                            <label>Administradores</label>
                        </li>

                        <li onClick={() => navigate("/lista-alunos")}>
                            <img src={iconeAlunos} alt="Alunos" />
                            <label>Alunos</label>
                        </li>

                        <li onClick={() => navigate("/lista-exercicios")}>
                            <img src={iconeExercicios} alt="Exercícios" />
                            <label>Exercícios</label>
                        </li>

                        <li onClick={() => navigate("/configuracoes")}>
                            <img src={iconeConfiguracoes} alt="Configurações" />
                            <label>Configurações</label>
                        </li>
                    </>
                    }

                    {retornarIDAluno() !== null &&
                        <li onClick={() => navigate("/meus-treinos?idAluno="+retornarIDAluno())}>
                            <img src={iconeMeusTreinos} alt="Meus treinos" />
                            <label>Meus treinos</label>
                        </li>
                    }

                    <li onClick={() => navigate("/sobre")}>
                        <img src={iconeSobre} alt="Sobre" />
                        <label>Sobre</label>
                    </li>

                    <li onClick={() => sair()}>
                        <img src={iconeSair} alt="Sair" />
                        <label>Sair</label>
                    </li>
                </ul>
            }

            <button onClick={() => setMostrarSideBar(!mostrarSideBar)} id={mostrarSideBar === true ? "botao-side-bar-ativa" : "botao-side-bar-ausente"}>
                <img src={mostrarSideBar === true ? iconeFechar : iconeAbrir} alt="Menu" />
            </button>
        </nav>
    );

}