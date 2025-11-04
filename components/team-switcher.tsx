"use client";

import * as React from "react";
import {
  Building2,
  ChevronsUpDown,
  House,
  type LucideIcon,
  icons,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type IconName = keyof typeof icons;

type IconLike = React.ElementType<{ className?: string }> | IconName;

function resolveIcon(icon?: IconLike): LucideIcon {
  if (!icon) {
    return Building2;
  }

  if (typeof icon === "string") {
    return icons[icon as IconName] ?? Building2;
  }

  return icon as LucideIcon;
}

export type TeamOption = {
  id: string;
  name: string;
  description?: string | null;
  icon?: IconLike;
  href?: string;
};

export function TeamSwitcher({ teams }: { teams: TeamOption[] }) {
  const { isMobile } = useSidebar();
  const [activeTeamId, setActiveTeamId] = React.useState<string | null>(
    teams[0]?.id ?? null,
  );

  React.useEffect(() => {
    if (!teams.length) {
      setActiveTeamId(null);
      return;
    }

    const hasActive = teams.some((team) => team.id === activeTeamId);
    if (!hasActive) {
      setActiveTeamId(teams[0]?.id ?? null);
    }
  }, [teams, activeTeamId]);

  const activeTeam = React.useMemo(() => {
    if (!activeTeamId) {
      return teams[0] ?? null;
    }

    return teams.find((team) => team.id === activeTeamId) ?? teams[0] ?? null;
  }, [teams, activeTeamId]);

  if (!activeTeam) {
    return null;
  }

  const activeIconComponent = resolveIcon(activeTeam.icon);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {React.createElement(activeIconComponent, { className: "size-4" })}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                {activeTeam.description ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {activeTeam.description}
                  </span>
                ) : null}
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Pilih venue
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams.map((team) => {
              const iconComponent = resolveIcon(team.icon);
              return (
                <DropdownMenuItem
                  key={team.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    setActiveTeamId(team.id);
                  }}
                >
                  {React.createElement(iconComponent, { className: "mr-2 size-4" })}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">
                      {team.name}
                    </span>
                    {team.description ? (
                      <span className="text-muted-foreground text-xs">
                        {team.description}
                      </span>
                    ) : null}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <Link href="/">
              <DropdownMenuItem>
                <House className="mr-2 size-4" />
                Home
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
