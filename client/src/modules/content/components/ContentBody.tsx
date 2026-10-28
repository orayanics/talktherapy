import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

export default function ContentBody({ source }: { source: string }) {
  return <MDEditor.Markdown source={source} rehypePlugins={[rehypeSanitize]} />
}
