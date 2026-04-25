import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div style={{ overflowWrap: 'anywhere', maxWidth: '100%' }}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }) {
          if (inline) {
            return (
              <code
                style={{
                  bgcolor: 'action.hover',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontSize: '0.875em',
                }}
                {...props}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        p({ children }) {
          return <p style={{ margin: '0.5em 0' }}>{children}</p>;
        },
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'primary.main' }}>
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th style={{ border: '1px solid', borderColor: 'divider', padding: '6px 12px', textAlign: 'left' }}>
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td style={{ border: '1px solid', borderColor: 'divider', padding: '6px 12px' }}>
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
