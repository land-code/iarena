'use client'

import mermaid from 'mermaid'
import { useEffect, useId, useRef } from 'react'

export default function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false })

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (ref.current) {
          ref.current.innerHTML = svg
        }
      })
      .catch(err => console.error('Error rendering mermaid diagram: ', err))
  }, [code, id])

  return (
    <div
      className='mermaid-block'
      ref={ref}
      style={{ minHeight: '150px', width: '100%', overflow: 'auto' }}
    />
  )
}
