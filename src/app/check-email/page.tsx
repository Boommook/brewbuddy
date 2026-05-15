export default function CheckEmailPage() {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-gray-600">
            We sent a verification link to your email address. Click it to activate your account.
          </p>
          <p className="text-sm text-gray-500">
            Didn't get it? Check your spam folder. The link expires in 24 hours.
          </p>
        </div>
      </main>
    );
  }