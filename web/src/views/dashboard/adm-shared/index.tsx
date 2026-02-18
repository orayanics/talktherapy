import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";

interface DashboardData {
  total: number;
  patients: number;
  clinicians: number;
  admins: number;
  appointments: number;
}

export default function Index(props: { data: DashboardData }) {
  const { data } = props;
  return (
    <>
      <UserStatsCard {...data} />
      <AppointmentStatsCard {...data} />
    </>
  );
}

function UserStatsCard(data: DashboardData) {
  const { total, patients, clinicians, admins } = data;
  const COUNT_ITEMS = [
    { key: "totalUsers", title: "Total Users", count: total },
    { key: "patients", title: "Patients", count: patients },
    { key: "clinicians", title: "Clinicians", count: clinicians },
    { key: "admins", title: "Admins", count: admins },
  ];
  return (
    <Grid
      cols={12}
      gap={4}
      className=" rounded-lg [&>div]:bg-white [&>div]:p-4 [&>div]:rounded-lg [&>div]:border
    [&>div>h2]:font-medium [&>div>h2]:text-gray-600 [&>div>p]:text-2xl [&>div>p]:font-semibold"
    >
      {COUNT_ITEMS.map((item) => (
        <GridItem
          key={item.key}
          colSpan={12}
          className={`md:col-span-3 ${item.key === "totalUsers" ? "order-first md:order-0" : ""}`}
        >
          <h2>{item.title}</h2>
          <p>{item.count}</p>
        </GridItem>
      ))}
    </Grid>
  );
}

function AppointmentStatsCard(data: DashboardData) {
  const { appointments } = data;
  return (
    <div className="bg-white p-4 rounded-lg border">
      {appointments ? (
        <>
          <h2 className="font-medium text-gray-600">Upcoming Appointments</h2>
          <p className="text-2xl font-semibold">{appointments}</p>
        </>
      ) : (
        <h2 className="font-medium text-gray-600">No Appointments</h2>
      )}
    </div>
  );
}
