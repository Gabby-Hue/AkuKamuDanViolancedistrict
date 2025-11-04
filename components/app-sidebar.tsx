"use client";

import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavProjects, type NavProject } from "@/components/nav-projects";
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
  navProjects?: NavProject[];
};

export function AppSidebar({
  user,
  teams = [],
  navMain,
  navProjects = [],
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teams.length ? <TeamSwitcher teams={teams} /> : null}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {navProjects.length ? <NavProjects projects={navProjects} /> : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
