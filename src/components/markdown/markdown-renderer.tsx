import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

import 'katex/dist/katex.min.css'
import MermaidBlock from './mermaid-block'

export default function MarkdownRenderer({
  content,
  inline = false
}: {
  content: string
  inline?: boolean
}) {
  console.log(content)
  return (
    <div className='prose dark:prose-invert [&_pre:has(>.mermaid-block)]:bg-transparent'>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
        components={{
          ...(inline && { p: ({ children }) => <>{children}</> }),
          code({ className = '', children }) {
            if (className.includes('language-mermaid')) {
              return <MermaidBlock code={String(children)} />
            }
            return (
              <pre>
                <code className={className}>{children}</code>
              </pre>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
