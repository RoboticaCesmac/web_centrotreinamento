import React from 'react';

import iconeFechar from '../../assets/images/icons/close.png';

import './styles.css';

interface propriedadesModal{
    titulo: string,
    visivel:boolean,
    onClose:() => void,
    children: JSX.Element,
}

export default function Modal(props: propriedadesModal){
    return (
        <>
            {props.visivel === true &&
                <div id="componente-modal">
                    <div>
                        <header>
                            <h2>{props.titulo}</h2>
                            <a type="button" onClick={() => props.onClose()}><img src={iconeFechar} alt="Fechar" /></a>
                        </header>

                        {props.children}
                    </div>
                </div>
            }
        </>
    );
}