import Link from "next/link";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="max-w-md text-center space-y-4 p-8">
        {error ? (
          <>
            <h1 className="text-2xl font-bold text-red-700">Verification failed</h1>
            <p className="text-gray-600">{decodeURIComponent(error)}</p>
            <Link href="/register" className="text-sm underline">
              Back to register
            </Link>
          </>
        ) : (
          <p className="text-gray-500">Invalid verification link.</p>
        )}
      </div>
    </main>
  );
}