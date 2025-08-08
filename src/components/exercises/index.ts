import { ExerciseType } from '@/generated/prisma'
import MultipleChoiceExercise from './multiple-choice'
import ShortAnswer from './short-answer'

const EmptyComponent = () => 'empty'

const exercises = {
  [ExerciseType.MULTIPLE_CHOICE]: MultipleChoiceExercise,
  [ExerciseType.SHORT_ANSWER]: ShortAnswer,
  [ExerciseType.TRUE_FALSE]: EmptyComponent,
  [ExerciseType.MATCHING]: EmptyComponent
}

export default exercises
