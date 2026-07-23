import Providers from "@/components/authentication/provider";

const SessionedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <Providers>{children}</Providers>;
};

export default SessionedLayout;
