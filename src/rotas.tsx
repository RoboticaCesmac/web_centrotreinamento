import { Routes, Route } from 'react-router-dom';

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

/**
 * Controlando autenticação em rotas no ReactJS | Diego Fernandes: https://youtu.be/sYe4r8WXGQg
 * @returns 
 */
 const Rotas = () => (
    <Routes>
        <Route path="/cadastro-administrador" element={<TelaCadastroAdministrador />} />
        <Route path="/lista-administradores" element={<TelaListaUsuarios />} />
        <Route path="/lista-alunos" element={<TelaListaAlunos />} />
        <Route path="/cadastro-aluno" element={<TelaCadastroAluno />} />
        <Route path="/lista-exercicios" element={<TelaListaExercicios />} />
        <Route path="/cadastro-exercicio" element={<TelaCadastroExercicio />} />
        <Route path="/lista-treinos" element={<TelaListaTreinos />} />
        <Route path="/cadastro-treino" element={<TelaCadastroTreino />} />
        <Route path="/cadastro-sequencia" element={<TelaCadastroSequencia />} />
        <Route path="/meus-treinos" element={<TelaMeusTreinos />} />
        {/* <PrivateRoute exact path="/lista-usuarios" element={TelaListaUsuarios} */}
        <Route path="/autenticacao-administrador" element={<TelaAutenticacaoAdministrador/>} />
        <Route path="/*" element={<TelaAutenticacaoAluno />} />
    </Routes>
);

export default Rotas;