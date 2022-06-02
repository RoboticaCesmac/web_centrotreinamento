import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import db from '../../providers/firebase';
import { collection, DocumentData, getDocs, limit, query, QueryDocumentSnapshot, startAfter, where } from 'firebase/firestore';

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

    const [busca, setBusca] = useState<string>("");
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    //Paginação
    const [paginaAtual, setPaginaAtual] = useState<number>(1);
    const [limitePorBusca, setLimitePorBusca] = useState<number>(10);
    const [ultimoDocumentoPagina, setUltimoDocumentoPagina] = useState<QueryDocumentSnapshot<DocumentData> | undefined>();

    useEffect(() => {
        buscarUsuarios();
    }, []);

    /**
     * Carrega para um array os usuarios cadastrados no banco de dados firestore
     */
    const buscarUsuarios = async (buscaPorMaisResultados?: boolean) => {
        try{
            setStatusCarregando("Buscando usuários...");

            let listaUsuarios: Usuario[] = usuarios;
            let ultimoDocumento: QueryDocumentSnapshot<DocumentData> | undefined = ultimoDocumentoPagina;   //Utilizado para paginação
            
            //Busca por nome e com limite de resultados
            let consulta = query(collection(db, "usuarios"), where("nome", ">=", busca), where("nome", "<=", busca+"~"), limit(limitePorBusca));
            
            //Se a chamada não tiver vindo do botão mostrarMaisResultados, então reinicia as variáveis envolvidas na paginação
            if(buscaPorMaisResultados === undefined || buscaPorMaisResultados === false){
                ultimoDocumento = undefined;
                listaUsuarios = [];
                setPaginaAtual(1);
            }

            //Se houver ultimo documento, então começa a nova busca a partir dele
            if(ultimoDocumento !== undefined){
                consulta = query(consulta, startAfter(ultimoDocumento));
            }

            //Realiza a consulta
            let colecaoUsuarios = await getDocs(consulta);

            //Coloca os resultados na lista
            colecaoUsuarios.forEach((documento) => {
                let dadosUsuario = documento.data();
                listaUsuarios.push({
                    idUsuario: dadosUsuario.idUsuario,
                    nome: dadosUsuario.nome,
                    email: dadosUsuario.email
                });
            });

            //Guarda o último documento
            ultimoDocumento = colecaoUsuarios.docs[colecaoUsuarios.docs.length-1];
            setUltimoDocumentoPagina(ultimoDocumento);
            
            //Atualiza a lista de usuários
            setUsuarios([...listaUsuarios]);
        }catch(erro){
            alert(erro);
        }finally{
            setStatusCarregando("");
        }
    }

    /**
     * Aumenta a quantidade de página e faz uma nova busca a partir de onde parou
     */
     const mostrarMaisResultados = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        setPaginaAtual(paginaAtual + 1);
        buscarUsuarios(true);
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
                        <input id="busca-usuario" placeholder="Buscar usuarios" type="text" value={busca} onChange={(event) => setBusca(event.target.value)} />
                        <button type="button" onClick={() => buscarUsuarios()}>Buscar</button>
                    </form>

                    {usuarios.length !== 0 ? 
                        <>
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

                            {/* Se tiver chegado até a quantidade máxima de itens, então ainda tem chance de ter dados */}
                            {usuarios.length >= (limitePorBusca*paginaAtual) && 
                                <div className="paginacao">
                                    <a href="/#" onClick={(event) => {mostrarMaisResultados(event)}}>Mostrar mais</a>
                                </div>
                            }
                        </>
                    :
                    <p id="nenhum-registro">Nenhum usuário encontrado</p>
                    }
                </div>
            </main>

            <Loading statusLoading={statusCarregando} />
        </div>
    );
}