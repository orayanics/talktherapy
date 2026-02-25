import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

interface CalenderSingleProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export default function CalenderSingle(props: CalenderSingleProps) {
  const { date, onSelect } = props;
  const dateStr = date ? format(date, "yyyy-MM-dd") : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onSelect(date);
  };
  return (
    <DayPicker
      className="react-day-picker bg-white"
      classNames={{
        months: "w-full max-w-full",
        month_grid: "w-100 mx-auto",
        day_button: "p-2 rounded-lg hover:text-primary hover:bg-primary/10",
        selected: "font-bold text-primary rounded-lg",
      }}
      mode="single"
      selected={date}
      onSelect={handleSelect}
      disabled={{ before: new Date() }}
      footer={date ? `Selected: ${dateStr}` : "Pick a day."}
    />
  );
}
