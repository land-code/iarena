import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

import MarkdownRenderer from '@/components/markdown/markdown-renderer'

type TheoryPageProps = {
  params: Promise<{ itineraryId: string; lessonId: string; theoryId: string }>
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const { theoryId } = await params

  const theory = await prisma.theory.findFirst({ where: { id: theoryId } })
  if (!theory) notFound()

  const fullContent = `# ${theory.title}\n${theory.content}`
  return (
    <>
      <MarkdownRenderer content={fullContent} />
    </>
  )
}
