import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";

import ContentMediaInfoEdit from "~/modules/content/ContentMediaInfoEdit";
export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(admin)/content_/$contentId/edit"
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
  height="400px"
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
  const [bodyContent, setBodyContent] = useState(MEDIA_ITEMS[0].body);
  return (
    <>
      <PageTitle
        heading={"Edit Content"}
        subheading={"Manage the content of this media."}
      />

      <Grid cols={12} gap={6} className="w-auto">
        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 md:col-span-6"
        >
          <ContentMediaInfoEdit
            {...MEDIA_ITEMS[0]}
            bodyValue={bodyContent}
            onBodyChange={setBodyContent}
          />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-soft btn-info">Save Changes</button>
            <button className="btn btn-soft btn-error">Cancel</button>
          </div>
        </GridItem>

        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 md:col-span-6"
        >
          <p className="font-bold">Live Preview of Media Body</p>
          <Markdown rehypePlugins={[rehypeRaw]}>{bodyContent}</Markdown>
        </GridItem>
      </Grid>
    </>
  );
}
