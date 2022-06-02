import { Routes, Route, RouteProps, Navigate } from 'react-router-dom';

import { getAuth } from 'firebase/auth';

import TelaAutenticacaoAluno from './screens/tela_autenticacao_aluno';
import TelaAutenticacaoAdministrador from './screens/tela_autenticacao_administrador';
import TelaCadastroAdministrador from './screens/tela_cadastro_administrador';
import TelaCadastroAluno from './screens/tela_cadastro_aluno';
import TelaCadastroExercicio from './screens/tela_cadastro_exercicio';
import TelaCadastroSequencia from './screens/tela_cadastro_sequencia';
import TelaCadastroTreino from './screens/tela_cadastro_treino';
import TelaListaUsuarios from './screens/tela_lista_administradores';
import TelaListaAlunos from './screens/tela_lista_alunos';
import TelaListaExercicios from './screens/tela_lista_exercicios';
import TelaListaTreinos from './screens/tela_lista_treinos';
import TelaMeusTreinos from './screens/tela_meus_treinos';
import TelaConfiguracoes from './screens/tela_configuracoes';
import TelaSobre from './screens/tela_sobre';

/**
 * Rotas privadas no react-router v6: https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
 * @param props 
 * @returns 
 */
const PrivateRoute = (props: RouteProps): JSX.Element => {
    if(getAuth().currentUser !== null){
        return <>{props.children}</>;
    }else{
        return(<Navigate to="/" />);
    }
}

/**
 * Controlando autenticação em rotas no ReactJS | Diego Fernandes: https://youtu.be/sYe4r8WXGQg
 * @returns 
 */
 const Rotas = () => (
    <Routes>
        <Route path="/cadastro-administrador" element={<PrivateRoute><TelaCadastroAdministrador /></PrivateRoute>} />
        <Route path="/lista-administradores" element={<PrivateRoute><TelaListaUsuarios /></PrivateRoute>} />
        <Route path="/lista-alunos" element={<PrivateRoute><TelaListaAlunos /></PrivateRoute>} />
        <Route path="/cadastro-aluno" element={<PrivateRoute><TelaCadastroAluno /></PrivateRoute>} />
        <Route path="/lista-exercicios" element={<PrivateRoute><TelaListaExercicios /></PrivateRoute>} />
        <Route path="/cadastro-exercicio" element={<PrivateRoute><TelaCadastroExercicio /></PrivateRoute>} />
        <Route path="/lista-treinos" element={<PrivateRoute><TelaListaTreinos /></PrivateRoute>} />
        <Route path="/cadastro-treino" element={<PrivateRoute><TelaCadastroTreino /></PrivateRoute>} />
        <Route path="/cadastro-sequencia" element={<PrivateRoute><TelaCadastroSequencia /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute><TelaConfiguracoes /></PrivateRoute>} />
        <Route path="/meus-treinos" element={<TelaMeusTreinos />} />
        <Route path="/sobre" element={<TelaSobre />} />
        <Route path="/autenticacao-administrador" element={<TelaAutenticacaoAdministrador/>} />
        <Route path="/*" element={<TelaAutenticacaoAluno />} />
    </Routes>
);

export default Rotas;