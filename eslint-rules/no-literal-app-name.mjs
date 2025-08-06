/** @type {import('eslint').Linter.Plugin} */
export default {
  rules: {
    'no-literal-app-name': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Evita usar "IArena" directamente. Usa la constante APP_NAME de ui.ts.'
        },
        messages: {
          avoidLiteral: 'Evita usar "IArena" directamente. Usa la constante APP_NAME.'
        }
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string' && node.value === 'IArena') {
              context.report({
                node,
                messageId: 'avoidLiteral'
              })
            }
          }
        }
      }
    }
  }
}
