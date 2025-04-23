// // _components/lead-view.tsx
// export default function LeadDashboard({ teamId }: { teamId: string }) {
//   const { data } = useDashboardData({
//     scope: "team",
//     teamId,
//   });

//   return (
//     <>
//       <TeamMetrics metrics={data.teamMetrics} />
//       <MemberPerformance
//         members={data.members}
//         showDetails={true} // Leads see individual stats
//       />
//     </>
//   );
// }
