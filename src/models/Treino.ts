import { Sequencia } from "./Sequencia";

export interface Treino {
    idTreino?: string,
    nome: string,
    objetivo: string,
    divisaoTreino: string,
    sequencias: Sequencia[]
}