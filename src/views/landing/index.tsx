import { Link } from "@tanstack/react-router";

export default function index() {
  const handleRedirect = () => {};
  return (
    <main className="container mx-auto h-100 p-2">
      <div className="flex flex-col h-full justify-center items-center gap-4 text-center m-auto">
        <h1 className="text-5xl font-bold">TalkTherapy</h1>
        <h2>Speech service in your hands.</h2>
        <p>Skilled doctors, personalized exercises and feedback system.</p>
        <p>All-in-one go with TalkTherapy.</p>
        <Link to="/register" className="btn btn-primary">
          Get Started
        </Link>
      </div>
    </main>
  );
}
