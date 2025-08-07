export type ActionState =
  | {
      status: 'success' | 'idle'
    }
  | {
      status: 'error'
      error: string
    }
