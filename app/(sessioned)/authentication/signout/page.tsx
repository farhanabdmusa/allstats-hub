import SignOutSection from "@/components/authentication/sign-out";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

const SignOutPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/authentication");
  }

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
              loading="eager"
            />
          </div>
          Allstats Hub
        </a>
        <SignOutSection />
      </div>
    </div>
  );
};

export default SignOutPage;
