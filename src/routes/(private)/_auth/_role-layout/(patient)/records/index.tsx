import { Link, createFileRoute } from "@tanstack/react-router";
import PageTitle from "~/components/Page/PageTitle";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export const Route = createFileRoute(
  "/(private)/_auth/_role-layout/(patient)/records/",
)({
  component: RouteComponent,
});

const SAMPLE_RECORDS = [
  {
    id: "1",
    date: "2023-01-15",
    clinician: "Dr. Smith",
    feedback: `# Feedback\n\nYour blood pressure is improving. Keep up the good work with your diet and exercise!\n\n## Diagnosis\n\n- Hypertension Stage 1\n- Recommend lifestyle changes and follow-up in 3 months.`,
  },
  {
    id: "2",
    date: "2023-03-10",
    clinician: "Dr. Johnson",
    feedback: `# Feedback\n\nYour cholesterol levels have decreased significantly. Continue with your current medication and diet.\n\n## Diagnosis\n\n- Hyperlipidemia\n- Continue statin therapy and monitor lipid levels in 6 months.`,
  },
];

function RouteComponent() {
  return (
    <>
      <PageTitle
        heading="Feedback and Diagnosis"
        subheading="View your medical records and feedback from your healthcare providers."
      />
      <Grid cols={12} gap={6}>
        <GridItem colSpan={4}>
          <RecordList />
        </GridItem>

        <GridItem colSpan={8}>
          <RecordDetail recordId="1" />
        </GridItem>
      </Grid>
    </>
  );
}

function RecordList() {
  return (
    <div className="flex flex-col gap-2">
      {SAMPLE_RECORDS.map((record) => (
        <div key={record.id} className="p-4 border rounded">
          <h3 className="text-lg font-bold">
            {record.date} - {record.clinician}
          </h3>
        </div>
      ))}
    </div>
  );
}

function RecordDetail({ recordId }: { recordId: string }) {
  const record = SAMPLE_RECORDS.find((r) => r.id === recordId);
  if (!record) {
    return <div>Record not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Record from {record.date} by {record.clinician}
      </h2>
      <div className="prose">
        {/* Render Markdown content here */}
        <Markdown rehypePlugins={[rehypeRaw]}>{record.feedback}</Markdown>
      </div>
    </div>
  );
}
