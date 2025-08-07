import {Difficulty} from "@/generated/prisma"

export const LESSON_DIFFICULTIES = [
  {
    label: 'Fácil',
    value: Difficulty.EASY
  },
  {
    label: 'Intermedio',
    value: Difficulty.MEDIUM
  },
  {
    label: 'Avanzado',
    value: Difficulty.ADVANCED
  }
]

export const getLessonDifficultyLabel = (value: string) =>
  LESSON_DIFFICULTIES.find(l => l.value === value)?.label
