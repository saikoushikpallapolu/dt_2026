import { Link } from "react-router-dom";

type PlaceholderPageProps = {
  title: string;
  checkpoint: string;
};

export function PlaceholderPage({ title, checkpoint }: PlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-stone-500">{checkpoint}</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-stone-700">
        This screen is a route placeholder. It does not show live faculty data.
      </p>
      <Link className="underline" to="/">
        Back to foundation home
      </Link>
    </main>
  );
}
