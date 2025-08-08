'use client'

import mermaid from 'mermaid'
import { useEffect, useRef, useId } from 'react'

export default function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const id = useId()

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: false })

      mermaid
        .render(`mermaid-${id}`, code)
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg
          }
        })
        .catch(err => console.error('Error rendering mermaid diagram: ', err))
    }
  }, [code, id])

  return <div className='mermaid-block' ref={ref} />
}
