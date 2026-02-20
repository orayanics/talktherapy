import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

import PatientAppointments from "./PatientAppointments";
import PatientBookmark from "./PatientBookmark";
export default function index() {
  return (
    <>
      <Grid cols={12} gap={6}>
        {/* First Col */}
        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 border p-4 rounded-lg lg:col-span-8"
        >
          <PatientAppointments />
        </GridItem>

        <GridItem
          colSpan={12}
          className="flex flex-col gap-4 border p-4 rounded-lg lg:col-span-4"
        >
          <PatientBookmark />
        </GridItem>
      </Grid>
    </>
  );
}
