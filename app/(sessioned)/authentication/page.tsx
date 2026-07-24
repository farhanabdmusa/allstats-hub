import SignInSection from "@/components/authentication/sign-in";
import Image from "next/image";

const AuthenticationPage = async ({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error?: string }>;
}>) => {
  const { error } = await searchParams;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-10 items-center justify-center rounded-md text-primary-foreground">
            <Image
              src={"/logo.svg"}
              alt="Allstats Hub"
              className="!size-8"
              width={36}
              height={36}
            />
          </div>
          Allstats Hub
        </a>
        <SignInSection error={error} />
      </div>
    </div>
  );
};

export default AuthenticationPage;
