import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

export default function ContentBody({ source }: { source: string }) {
  return (
    <MDEditor.Markdown
      className="prose prose-slate prose-base max-w-prose prose-headings:font-semibold prose-headings:tracking-tight prose-img:rounded-xl"
      source={source}
      rehypePlugins={[rehypeSanitize]}
    />
  )
}
