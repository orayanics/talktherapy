import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";

import ContentMediaInfo from "~/modules/content/ContentMediaInfo";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(admin)/content/$contentId"
)({
  component: RouteComponent,
});

export const MEDIA_ITEMS = [
  {
    id: "1",
    title: "Getting Started with TypeScript",
    description: "An introduction to TypeScript and its core features.",
    body: `
## TypeScript Basics

![TypeScript example](https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp)

TypeScript is a typed superset of JavaScript that adds static typing to the language.

It helps developers catch errors early, improve code quality, and build more maintainable applications.

---

## Featured Video

<iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/EmeW6li6bbo"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
`,
    authorId: "author-001",
    createdAt: "2025-06-27",
    updatedAt: "2025-06-29",
    category: "Programming",
    tags: ["typescript", "javascript", "basics", "node"],
  },
];

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading={"Content Overview"}
        subheading={"Manage media content."}
      />

      <Grid cols={12} gap={6}>
        <GridItem colSpan={12} className="md:col-span-6">
          <ContentMediaInfo {...MEDIA_ITEMS[0]} />
        </GridItem>

        <GridItem colSpan={12} className="md:col-span-6">
          <h1 className="font-bold">Content Body Preview</h1>
          <div className="flex flex-col gap-4 bg-gray-50 border-dashed border-gray-200 border p-4 rounded-lg max-h-200 overflow-scroll">
            <Markdown rehypePlugins={[rehypeRaw]}>
              {MEDIA_ITEMS[0].body}
            </Markdown>
          </div>
        </GridItem>
      </Grid>
    </>
  );
}
