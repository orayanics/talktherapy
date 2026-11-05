import { Link } from '@tanstack/react-router'
import type { AdminStats } from '../../api/dashboard'
import HalfPieChart from '../../../../components/Chart/HalfPieChart'

interface PatientsByDiagnosisProps {
  stats: AdminStats
}

const diagnosisChartColors = [
  'rgb(0, 224, 176)',
  'rgb(38, 214, 100)',
  'rgb(128, 222, 42)',
  'rgb(222, 218, 32)',
  'rgb(255, 186, 24)',
  'rgb(255, 140, 40)',
  'rgb(255, 88, 72)',
  'rgb(240, 62, 122)',
  'rgb(206, 72, 190)',
  'rgb(164, 86, 240)',
  'rgb(102, 82, 236)',
]

export default function PatientsByDiagnosis({
  stats,
}: PatientsByDiagnosisProps) {
  return (
    <section className="bg-white border border-border rounded-box p-4 flex flex-col h-fit">
      <p className="font-bold mt-0">Patients</p>
      <div>
        <HalfPieChart
          data={stats.users.by_diagnosis.map((diagnosis, index) => ({
            label: diagnosis.label,
            value: diagnosis.count,
            color:
              diagnosisChartColors[index % diagnosisChartColors.length] ??
              diagnosisChartColors[0],
          }))}
          smooth={false}
          glow={0}
          gap={2}
        />
      </div>

      <Link
        to="/users"
        search={{ page: 1, role: ['patient'] }}
        className="btn btn-neutral w-full mt-4"
      >
        View Patients
      </Link>
    </section>
  )
}
