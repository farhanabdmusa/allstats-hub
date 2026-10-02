"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "next-auth/react";
import { IconLogout2 } from "@tabler/icons-react";
import Link from "next/link";

const SignOutSection = () => {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign Out</CardTitle>
          <CardDescription>Are you sure want to sign out?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button asChild variant={"outline"} className="w-full">
              <Link href={"/dashboard"}>Cancel</Link>
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/authentication",
                })
              }
            >
              <IconLogout2 />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignOutSection;
