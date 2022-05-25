import { ExercicioTreino } from "./ExercicioTreino";

/**
 * Uma das sequências do treino.
 * Por exemplo, para um treino ABC, essa pode ser a sequência A, voltada para o treino do peitoral, ombros e tríceps.
 */
export interface Sequencia {
    sequencia: string,
    gruposMusculares: string,
    numeroCiclos: number,
    observacoes: string,
    exercicios: ExercicioTreino[]
}