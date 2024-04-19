import { ExercicioTreino } from "./ExercicioTreino";

/**
 * Uma das sequências/blocos do treino.
 * Por exemplo, para um treino ABC, essa pode ser a sequência/bloco A, voltada para o treino do peitoral, ombros e tríceps.
 */
export interface Bloco {
    bloco: string,
    gruposMusculares: string,
    observacoes: string,
    exercicios: ExercicioTreino[]
}