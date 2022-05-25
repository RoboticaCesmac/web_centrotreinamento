/**
 * Exercício cadastrado no sistema que pode compor o "ExercicioTreino" 
 * quando escolhido para ser usado no treino do aluno.
 */
export interface Exercicio {
    idExercicio?: string,
    nome: string,
    gruposMusculares: string,
    descricao: string,
    urlGIF: string
}