import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex mt-[8vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border-2 border-antique-white-600 bg-camel/75 backdrop-blur-sm p-6 shadow-lg">
        <h1 className="zilla-slab-bold text-3xl mb-1 pl-1 text-cayenne-red-900">Log in</h1>
        <hr className="border-2 mb-6 rounded-full w-1/4 border-cayenne-red-700" />
        <LoginForm />
      </div>
    </div>
  );
}
