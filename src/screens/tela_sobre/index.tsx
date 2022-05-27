import React from 'react';

import SideBar from '../../components/sidebar';

import logomarcaCitec from '../../assets/images/logo_citec.png';
import './styles.css';

export default function TelaSobre(){
    return (
        <div id="tela-sobre">
            <SideBar/>

            <main className="conteudo">
                <header>
                    <h2>Sobre o sistema</h2>
                </header>
                
                <div>
                    <p>Sistema para gerenciamento dos treinos dos alunos de um centro de treinamento. Desenvolvido pelo Centro de Inovação Tecnológica Cesmac.</p>
                    <img src={logomarcaCitec} alt="Logomarca CITEC" />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Links úteis</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td><a target="_blank" href="https://cesmac.edu.br/">Centro Universitário Cesmac</a></td>
                        </tr>

                        <tr>
                            <td><a target="_blank" href="https://www.instagram.com/roboticacesmac/">Centro de Inovação Tecnológica Cesmac</a></td>
                        </tr>

                        <tr>
                            <td><a target="_blank" href="https://www.cesmac.edu.br/graduacao/educacao-fisica">Educação Física - Cesmac</a></td>
                        </tr>
                    </tbody>
                </table>
            </main>
        </div>
    );
}