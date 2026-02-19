import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { dashboardDataQueryOptions } from "~/api/dashboard";
// import { AppointmentStatus, AppointmentStatusValues } from "~/models/content";
import Grid from "~/components/Page/Grid";
import GridItem from "~/components/Page/GridItem";
import PageTitle from "~/components/Page/PageTitle";

// import AppointmentStatusBadge from "~/components/Badge/AppointmentStatusBadge";

import PatientDashboard from "~/views/dashboard/patient";
import AdminSharedDashboard from "~/views/dashboard/adm-shared/";
import { useSession } from "~/context/SessionContext";

export const Route = createFileRoute("/_private/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { account_role } = useSession();
  const enabled = account_role === "admin" || account_role === "clinician";

  const { data } = useQuery({
    ...dashboardDataQueryOptions,
    enabled: enabled,
  });

  // condition view render
  const dashboardView = () => {
    if (account_role === "admin") {
      return <AdminSharedDashboard data={data} />;
    } else if (account_role === "clinician") {
      return <div>IN PROGRESS: CLINICIAN DASHBOARD</div>;
    } else if (account_role === "patient") {
      return <PatientDashboard />;
    } else {
      return <div>Unauthorized</div>;
    }
  };

  return (
    <>
      <PageTitle
        heading="Dashboard"
        subheading="Overview and different key actions"
      />
      <Grid cols={12} gap={2}>
        <GridItem colSpan={12} className="flex flex-col gap-4">
          {dashboardView()}
        </GridItem>
      </Grid>
    </>
  );
}

// function AppointmentTest() {
//   const APPOINTMENT_DATA = [
//     {
//       totalAppointments: 120,
//       completedAppointments: 100,
//       pendingAppointments: 15,
//       cancelledAppointments: 5,
//       data: [
//         {
//           id: 1,
//           date: "2024-07-01",
//           time: "10:00 AM",
//           status: "completed",
//           patient: "John Doe",
//           clinician: "Dr. Smith",
//         },
//         {
//           id: 2,
//           date: "2024-07-02",
//           time: "11:00 AM",
//           status: "pending",
//           patient: "Jane Roe",
//           clinician: "Dr. Brown",
//         },
//         {
//           id: 3,
//           date: "2024-07-03",
//           time: "02:00 PM",
//           status: "rejected",
//           patient: "Alice Green",
//           clinician: "Dr. White",
//         },
//         {
//           id: 4,
//           date: "2024-07-04",
//           time: "01:00 PM",
//           status: "accepted",
//           patient: "Bob Blue",
//           clinician: "Dr. Black",
//         },
//         {
//           id: 5,
//           date: "2024-07-05",
//           time: "03:00 PM",
//           status: "requested",
//           patient: "Charlie Yellow",
//           clinician: "Dr. Grey",
//         },
//         {
//           id: 6,
//           date: "2024-07-06",
//           time: "09:00 AM",
//           status: "rescheduled",
//           patient: "Diana Purple",
//           clinician: "Dr. Orange",
//         },
//       ],
//     },
//   ];

//   return (
//     <div className="bg-white p-4 rounded-lg border">
//       {APPOINTMENT_DATA.map((summary, index) => {
//         const {
//           totalAppointments,
//           completedAppointments,
//           pendingAppointments,
//           cancelledAppointments,
//           data,
//         } = summary;
//         return (
//           <div key={index} className="mb-6">
//             <h2 className="font-medium text-gray-600 mb-4">
//               Appointment Summary
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//               <div>
//                 <h3 className="text-gray-500">Total Appointments</h3>
//                 <p className="text-2xl font-semibold">{totalAppointments}</p>
//               </div>
//               <div>
//                 <h3 className="text-gray-500">Completed</h3>
//                 <p className="text-2xl font-semibold">
//                   {completedAppointments}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-gray-500">Pending</h3>
//                 <p className="text-2xl font-semibold">{pendingAppointments}</p>
//               </div>
//               <div>
//                 <h3 className="text-gray-500">Cancelled</h3>
//                 <p className="text-2xl font-semibold">
//                   {cancelledAppointments}
//                 </p>
//               </div>
//             </div>
//             <table className="w-full text-sm border-separate border-spacing-0">
//               <thead className="hover:bg-gray-50">
//                 <tr>
//                   <th className="border-b px-4 py-2 text-left font-semibold">
//                     Date
//                   </th>
//                   <th className="border-b px-4 py-2 text-left font-semibold">
//                     Time
//                   </th>
//                   <th className="border-b px-4 py-2 text-left font-semibold">
//                     Status
//                   </th>
//                   <th className="border-b px-4 py-2 text-left font-semibold">
//                     Patient
//                   </th>
//                   <th className="border-b px-4 py-2 text-left font-semibold">
//                     Clinician
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="[&>_tr:last-child>_td]:border-b-0">
//                 {data.map((appointment) => {
//                   const { id, date, time, status, patient, clinician } =
//                     appointment;
//                   return (
//                     <tr key={id} className="transition-colors hover:bg-gray-50">
//                       <td className="border-b px-4 py-2 align-middle">
//                         {date}
//                       </td>
//                       <td className="border-b px-4 py-2 align-middle">
//                         {time}
//                       </td>
//                       <td className="border-b px-4 py-2 align-middle">
//                         <AppointmentStatusBadge
//                           status={status as AppointmentStatus}
//                         />
//                       </td>
//                       <td className="border-b px-4 py-2 align-middle">
//                         {patient}
//                       </td>
//                       <td className="border-b px-4 py-2 align-middle">
//                         {clinician}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
