import { useState } from 'react';

import Modal from '../modal';

import iconeSetaBaixo from '../../assets/images/icons/arrow-down.png';
import './styles.css';

export interface IItemSelectMultiplo{
    id: string,
    descricao: string
}

interface ISelectMultiplo{
    titulo: string,
    itensDisponiveis: IItemSelectMultiplo[],
    idsItensSelecionados: string[],
    salvar?: (itensSelecionados: string[]) => void,
    mostrarItensSelecionados?: boolean

}

export default function SelectMultiplo(props: ISelectMultiplo){
    const [modalAberto, setModalAberto] = useState<boolean>(false);
    const [idsItensSelecionados, setIdsItensSelecionados] = useState<string[]>(props.idsItensSelecionados);

    const selecionarItem = (itemSelecionado: IItemSelectMultiplo) => {
        const listaIdsItensSelecionados = idsItensSelecionados;

        // Verifica se o item já foi selecionado (-1 se não tiver sido)
        const indexItem = listaIdsItensSelecionados.findIndex((item, index) => item === itemSelecionado.id);
        
        if(indexItem !== -1){
            // Remove o item (desmarca)
            listaIdsItensSelecionados.splice(indexItem, 1);
        }else{
            // Adiciona o item (marca)
            listaIdsItensSelecionados.push(itemSelecionado.id);
        }

        setIdsItensSelecionados([...listaIdsItensSelecionados]);
    }

    const salvar = () => {
        if(props.salvar === undefined){
            return;
        }

        props.salvar(idsItensSelecionados);
        setModalAberto(false);
    }

    /**
     * Retorna uma string com todos os itens selecionados
     * @returns 
     */
    const listarItensSelecionados = (listaIdsSelecionados: string[]) => {
        let descricaoItensSelecionados = "";

        listaIdsSelecionados.forEach((idItem, index) => {
            // Busca o objeto do item de id informado
            const itemSelecionado: IItemSelectMultiplo | undefined = props.itensDisponiveis.find((itemDisponivel) => itemDisponivel.id === idItem);

            // Adiciona a descrição à string, se encontrada
            descricaoItensSelecionados = descricaoItensSelecionados + (itemSelecionado?.descricao || "");
           
            // Só adiciona "," se não for o último item do vetor de selecionados
            if(index !== (listaIdsSelecionados.length - 1)){
                descricaoItensSelecionados = descricaoItensSelecionados+", ";
            }
        });

        return descricaoItensSelecionados;
    }

    return(
        <div id="componente-select-multiplo">
            <div id="select-fechado">
                <input placeholder="Selecione um item" value={listarItensSelecionados(props.idsItensSelecionados)} onClick={() => setModalAberto(true)} />
                <button type="button" onClick={() => setModalAberto(true)}><img id="icone-seta-baixo" src={iconeSetaBaixo} alt="Seta para baixo" /></button>
            </div>

            {/* Modal de quando o select está aberto */}
            <Modal titulo={props.titulo} visivel={modalAberto} onClose={() => setModalAberto(false)}>
                <>
                    <div id="container-itens">
                        {props.itensDisponiveis.map((item, index) => {
                            // Verifica se o item já foi selecionado (-1 se não tiver sido)
                            const itemSelecionado: number = idsItensSelecionados.findIndex((itemSelecionado) => itemSelecionado === item.id);

                            return(
                                <button type="button" key={index} className={itemSelecionado !== -1 ? "item-selecionado" : ""} onClick={() => selecionarItem(item)}>{item.descricao}</button>
                            );
                        })}

                        {props.itensDisponiveis.length === 0 &&
                            <p className="texto-centralizado">Nenhum item encontrado</p>
                        }
                    </div>
                    
                    {/* Descrição dos itens presentes no array de itens selecionados */}
                    {(idsItensSelecionados.length > 0 && props.mostrarItensSelecionados === true) &&
                        <p id="itens-selecionados">Selecionado(s):{" "+listarItensSelecionados(idsItensSelecionados)}</p>
                    }

                    <div id="modal-container-botoes">
                        <button type="button" onClick={() => salvar()}>Salvar</button>
                    </div>
                </>
            </Modal>
        </div>
    );
}