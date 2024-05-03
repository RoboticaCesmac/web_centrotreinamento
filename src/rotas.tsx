import { useEffect, useState } from 'react';
import { Routes, Route, RouteProps, Navigate } from 'react-router-dom';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

import TelaAutenticacaoAluno from './screens/tela_autenticacao_aluno';
import TelaAutenticacaoAdministrador from './screens/tela_autenticacao_administrador';
import TelaCadastroAdministrador from './screens/tela_cadastro_administrador';
import TelaCadastroAluno from './screens/tela_cadastro_aluno';
import TelaCadastroExercicio from './screens/tela_cadastro_exercicio';
import TelaCadastroBloco from './screens/tela_cadastro_bloco';
import TelaCadastroTreino from './screens/tela_cadastro_treino';
import TelaListaUsuarios from './screens/tela_lista_administradores';
import TelaListaAlunos from './screens/tela_lista_alunos';
import TelaListaExercicios from './screens/tela_lista_exercicios';
import TelaListaTreinos from './screens/tela_lista_treinos';
import TelaMeusTreinos from './screens/tela_meus_treinos';
import TelaConfiguracoes from './screens/tela_configuracoes';
import TelaSobre from './screens/tela_sobre';

type PropsRotaPrivada = RouteProps & { somenteAdministrador?: boolean };

/**
 * Rotas privadas, onde só acessa se estiver autenticado
 * @param props 
 * @returns 
 */
function RotaPrivada(props: PropsRotaPrivada){
  const [carregandoAutenticacao, setCarregandoAutenticacao] = useState<boolean>(true);
  const [autenticado, setAutenticado] = useState<boolean>(false);

  useEffect(() => {
    // Guarda o estado da autenticação quando ele for alterado
    const desinscrever = onAuthStateChanged(getAuth(), (usuario) => {
      if(usuario === null){
        // Seta que o usuário não está autenticado
        setAutenticado(false);
      }else{
        // Seta que o usuário está autenticado
        setAutenticado(true);
      }

      setCarregandoAutenticacao(false);
    });

    // Desinscreve do onAuthStateChanged para não continuar checando o estado da autenticação, caso saia da página
    return () => {
      desinscrever();
    };
  }, []);
  
  if(carregandoAutenticacao === true){
    // Enquanto não tiver buscado o estado da autenticação, não retorna página nenhuma
    return null;
  }else if(autenticado === false){
    // Se já tiver carregado mas o usuário não estiver autenticado, redireciona o usuário para a página de login
    getAuth().signOut();
    return <Navigate to="login" />;
  }else{
    // Se estiver autenticado, permite entrar na página que deseja
    return <>{props.children}</>;
  }
}

/**
 * Controlando autenticação em rotas no ReactJS | Diego Fernandes: https://youtu.be/sYe4r8WXGQg
 * @returns 
 */
 const Rotas = () => (
    <Routes>
        <Route path="/cadastro-administrador" element={<RotaPrivada><TelaCadastroAdministrador /></RotaPrivada>} />
        <Route path="/lista-administradores" element={<RotaPrivada><TelaListaUsuarios /></RotaPrivada>} />
        <Route path="/lista-alunos" element={<RotaPrivada><TelaListaAlunos /></RotaPrivada>} />
        <Route path="/cadastro-aluno" element={<RotaPrivada><TelaCadastroAluno /></RotaPrivada>} />
        <Route path="/lista-exercicios" element={<RotaPrivada><TelaListaExercicios /></RotaPrivada>} />
        <Route path="/cadastro-exercicio" element={<RotaPrivada><TelaCadastroExercicio /></RotaPrivada>} />
        <Route path="/lista-treinos" element={<RotaPrivada><TelaListaTreinos /></RotaPrivada>} />
        <Route path ="/cadastro-treino" element={<RotaPrivada><TelaCadastroTreino /></RotaPrivada>} />
        <Route path="/cadastro-bloco" element={<RotaPrivada><TelaCadastroBloco /></RotaPrivada>} />
        <Route path="/configuracoes" element={<RotaPrivada><TelaConfiguracoes /></RotaPrivada>} />
        <Route path="/meus-treinos" element={<TelaMeusTreinos />} />
        <Route path="/sobre" element={<TelaSobre />} />
        <Route path="/autenticacao-administrador" element={<TelaAutenticacaoAdministrador/>} />
        <Route path="/*" element={<TelaAutenticacaoAluno />} />
    </Routes>
);

export default Rotas;