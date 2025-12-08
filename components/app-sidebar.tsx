"use client";

import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavUser, type SidebarUser } from "@/components/nav-user";
import { TeamSwitcher, type TeamOption } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
  teams?: TeamOption[];
  navMain: NavMainItem[];
};

export function AppSidebar({
  user,
  teams = [],
  navMain,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teams.length ? <TeamSwitcher teams={teams} /> : null}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
