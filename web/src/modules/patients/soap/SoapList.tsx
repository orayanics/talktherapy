import { format } from 'date-fns'
import type { SoapDto } from '~/models/booking'
import TableContent from '~/components/Table/TableContent'

interface SoapListProps {
  data: Array<SoapDto>
  selectedSoapId?: string
  onSelect: (soap: SoapDto) => void
}

export default function SoapList({
  data,
  selectedSoapId,
  onSelect,
}: SoapListProps) {
  return (
    <TableContent
      columns={[
        {
          header: 'Date',
          accessor: 'created_at',
          render: (created_at) => format(new Date(created_at), 'MM/dd/yyyy'),
        },
        { header: 'Activity Plan', accessor: 'activity_plan' },
        { header: 'Session', accessor: 'session_type' },
        { header: 'Assessment', accessor: 'assessment' },
      ]}
      data={data}
      selectedRowId={selectedSoapId}
      onRowClick={onSelect}
    />
  )
}
