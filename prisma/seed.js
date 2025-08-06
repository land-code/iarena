import { PrismaClient } from '../src/generated/prisma/index.js'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'David',
      email: 'david@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'ADMIN',
      banned: false
    }
  })

  // Crear teorías
  const theory1 = await prisma.theory.create({
    data: {
      title: 'Introducción a la Física',
      content: 'Contenido de teoría 1...'
    }
  })

  const theory2 = await prisma.theory.create({
    data: {
      title: 'Leyes del Movimiento',
      content: 'Contenido de teoría 2...'
    }
  })

  // Crear lección
  const lesson = await prisma.lesson.create({
    data: {
      title: 'Física Básica',
      description: 'Una introducción básica a la física',
      ownerId: user.id
    }
  })

  // Vincular teorías a la lección con orden
  await prisma.lessonTheory.createMany({
    data: [
      {
        lessonId: lesson.id,
        theoryId: theory1.id,
        position: 1
      },
      {
        lessonId: lesson.id,
        theoryId: theory2.id,
        position: 2
      }
    ]
  })

  console.log('✅ Seed completed')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
