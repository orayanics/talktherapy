import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";

import ContentMediaCreate from "~/modules/content/ContentMediaCreate";

export const Route = createFileRoute(
  "/_private/(shared)/content/create"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [bodyContent, setBodyContent] = useState("");
  const role = "admin";

  if (role !== "clinician") return null;
  return (
    <>
      <PageTitle
        heading={"Add Content"}
        subheading={"Add and maange the content of this media."}
      />

      <Grid cols={12} gap={6} className="w-auto">
        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 order-1 md:col-span-6"
        >
          <ContentMediaCreate
            bodyValue={bodyContent}
            onBodyChange={setBodyContent}
          />

          <div className="flex flex-col gap-2 col-span-12">
            <button className="btn btn-soft btn-info">Submit</button>
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
