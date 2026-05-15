import { LoginForm } from "../components/LoginForm";


export default function LoginPage({ searchParams }: { searchParams: { verified?: string } }) {
  return (
    <div className="flex mt-[8vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border-2 border-antique-white-600 bg-camel/75 backdrop-blur-sm p-6 shadow-lg">
        <h1 className="zilla-slab-bold text-3xl mb-1 pl-1 text-cayenne-red-900">Log in</h1>
        <hr className="border-2 mb-6 rounded-full w-1/4 border-cayenne-red-700" />
        {searchParams.verified && (
          <p className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Email verified! You can now log in.
          </p>
        )}
         <LoginForm />
      </div>
    </div>
  );
}
