import React from 'react';

import './styles.css';

interface propriedadesLoading{
    statusLoading: string
}

export default function Loading(props: propriedadesLoading){
    return(
        <>
            {props.statusLoading !== "" && 
                <div id="componente-loading">
                    <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                    <p>{props.statusLoading}</p>
                </div>
            }
        </>
    );
}