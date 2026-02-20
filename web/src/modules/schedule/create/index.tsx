import PageTitle from "~/components/Page/PageTitle";
import ScheduleForm from "../ScheduleForm";

export default function index() {
  return (
    <div>
      <PageTitle
        brow="Scheduling"
        heading="New Schedule"
        subheading="Add a new slot to your schedule."
      />
      <ScheduleForm />
    </div>
  );
}
