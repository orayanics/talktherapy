/** @vitest-environment jsdom */
import { render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import ContentBody from './ContentBody'

vi.mock('@uiw/react-md-editor', () => ({
    default: {
        Markdown: ({
            source,
            rehypePlugins,
        }: {
            source: string
            rehypePlugins: Array<(...args: never[]) => unknown>
        }) => <div data-sanitizer={rehypePlugins[0]?.name}>{source}</div>,
    },
}))

it('applies a markdown sanitizer after parsing content', () => {
    const { container } = render(
        <ContentBody
            source={
                '<img src="x" onerror="alert(1)">\n\n[unsafe](javascript:alert(1))'
            }
        />,
    )

    expect(
        container.querySelector('[data-sanitizer="rehypeSanitize"]'),
    ).not.toBeNull()
})
