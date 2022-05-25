import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, getDocs } from 'firebase/firestore';

import { Usuario } from '../../models/Usuario';

import iconeTreinos from '../../assets/images/icons/haltere-lighter.png';
import iconeApagar from '../../assets/images/icons/trash-can-lighter.png';
import iconeEditar from '../../assets/images/icons/edit-lighter.png';

import SideBar from '../../components/sidebar';
import Loading from '../../components/loading';
import './styles.css';

export default function TelaListaUsuarios(){
    const navigate = useNavigate();
    const [statusCarregando, setStatusCarregando] = useState<string>("");

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    useEffect(() => {
        carregarListaUsuarios();
    }, []);

    /**
     * Carrega para um array os usuarios cadastrados no banco de dados firestore
     */
    const carregarListaUsuarios = async () => {
        try{
            setStatusCarregando("Buscando usuários...");

            let documentosUsuarios = await getDocs(collection(db, "usuarios"));
            
            let listaUsuarios: Usuario[] = [];
            documentosUsuarios.forEach((documento) => {
                let dadosUsuario = documento.data();
                listaUsuarios.push({
                    idUsuario: dadosUsuario.idUsuario,
                    nome: dadosUsuario.nome,
                    email: dadosUsuario.email
                });
            });
            
            setUsuarios([...listaUsuarios]);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    return(
        <div id="tela-lista-usuarios">
            <SideBar />

            <main className="conteudo">
                <div>
                    <header>
                        <h2>Lista de administradores</h2>
                        <button type="button" onClick={() => navigate("/cadastro-administrador")}>Cadastrar novo administrador</button>
                    </header>

                    <form id="container-busca">
                        <input id="busca-usuario" placeholder="Buscar usuarios" type="text" />
                        <button type="button">Buscar</button>
                    </form>

                    {usuarios.length !== 0 ?                    
                        <table cellSpacing={0}>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                </tr>
                            </thead>

                            <tbody>
                                {usuarios.map((usuario: Usuario, index) => {
                                    return(
                                        <tr key={index}>
                                            <td>{usuario.nome}</td>
                                            <td>{usuario.email}</td>
                                            {/* <td>
                                                <button type="button"><img src={iconeEditar} alt="Editar" /></button>
                                                <button type="button"><img src={iconeApagar} alt="Apagar" /></button>
                                            </td> */}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    :
                    <p id="nenhum-registro">Nenhum usuário encontrado</p>
                    }
                </div>
            </main>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}