import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { repositorySourceUrl } from '../lib/markdownLinks'

type Props = { markdown: string; sourcePath: string }

export function MarkdownDocument({ markdown, sourcePath }: Props) {
  return (
    <article className="guide-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const resolvedHref = repositorySourceUrl(href, sourcePath)
            const isExternal = resolvedHref.startsWith('http')
            return (
              <a href={resolvedHref} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
                {children}
              </a>
            )
          },
          code: ({ children, className, ...props }) => <code className={className} {...props}>{children}</code>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  )
}
