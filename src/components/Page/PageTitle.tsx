interface PageTitleProps {
  heading: string;
  subheading?: string;
}

export default function PageTitle(props: PageTitleProps) {
  const { heading, subheading } = props;
  return (
    <div className="border-b mb-4">
      <h1 className={`font-bold text-2xl col-span-12 ${!subheading && "mb-4"}`}>
        {heading}
      </h1>
      {subheading && (
        <p className="col-span-12 mb-2 text-gray-600">{subheading}</p>
      )}
    </div>
  );
}
