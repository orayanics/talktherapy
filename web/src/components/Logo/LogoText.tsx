import LogoSvg from "./LogoSvg";

export default function LogoText() {
  return (
    <div className="p-4 items-center border-b">
      <div className=" drop-shadow drop-shadow-primary/40">
        <LogoSvg size="sm" />
      </div>
    </div>
  );
}
