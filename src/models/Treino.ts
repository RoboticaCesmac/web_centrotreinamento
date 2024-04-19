import { Bloco } from "./Bloco";

export interface Treino {
    idTreino?: string,
    nome: string,
    objetivo: string,
    diasSemana: string[],
    blocos: Bloco[]
}