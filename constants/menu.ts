import {
  IconBell,
  IconCube,
  IconDashboard,
  IconUsers,
  IconUserShield,
} from "@tabler/icons-react";

export const LIST_MENU = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/dashboard/user",
      icon: IconUsers,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: IconBell,
    },
    {
      title: "Topic",
      url: "/dashboard/topic",
      icon: IconCube,
    },
  ],
  adminArea: [
    {
      name: "User Admin",
      url: "/dashboard/user-admin",
      icon: IconUserShield,
    },
  ],
};
