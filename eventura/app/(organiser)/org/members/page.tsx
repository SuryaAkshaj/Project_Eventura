"use client";
import { useState, useEffect } from "react";
import { membersApi } from "@/lib/api/members.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Maps DB role names to display config
const roleConfig: Record<string, string> = {
  CLUB_PRESIDENT: "bg-primary/10 text-primary border-primary/20",
  COLLEGE_ADMIN: "bg-secondary-container text-on-secondary-container border-secondary-fixed-dim",
  EVENT_MANAGER: "bg-tertiary-fixed/40 text-on-tertiary-fixed border-tertiary-fixed",
  ATTENDEE: "bg-surface-variant text-on-surface-variant border-outline-variant",
};

const formatRole = (role: string) => {
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    COLLEGE_ADMIN: 'College Admin',
    CLUB_PRESIDENT: 'Club President',
    EVENT_MANAGER: 'Event Manager',
    ATTENDEE: 'Attendee',
  };
  return roleLabels[role] || role.split('_').map(
    (w: string) => w.charAt(0) + w.slice(1).toLowerCase()
  ).join(' ');
};

export default function OrgMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    membersApi.getMyMembers()
      .then((res) => setMembers(res.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = members.filter(
    (m) =>
      search === "" ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      {/* Top bar */}
      <header className="bg-surface flex justify-between items-center px-margin-desktop h-16 border-b border-outline-variant flex-shrink-0">
        <div className="font-label-sm text-label-sm text-on-surface-variant">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[14px] mx-1">chevron_right</span>
          <span className="text-primary font-bold">Members</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-margin-desktop">
        <div className="max-w-5xl mx-auto space-y-xl">
          {/* Header */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
                Club Members
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Manage your team — view roles and responsibilities.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                id="invite-member-btn"
                onClick={() => setShowInviteModal(true)}
                className="bg-primary text-on-primary hover:bg-primary/90 font-label-sm text-label-sm flex items-center gap-1.5 h-10 px-4"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Invite Member
              </Button>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-md">
            {[
              { label: "Total Members", value: members.length.toString(), icon: "group", color: "text-primary" },
              { label: "Team Admins", value: members.filter((m) => m.role === "CLUB_PRESIDENT").length.toString(), icon: "stars", color: "text-[#2e7d32]" },
              { label: "Event Managers", value: members.filter((m) => m.role === "EVENT_MANAGER").length.toString(), icon: "event", color: "text-tertiary" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[22px] ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                    <p className={`font-headline-md text-headline-md ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Search + Table */}
          <section className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex items-center gap-4">
              <div className="relative flex-1 max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                  search
                </span>
                <Input
                  id="members-search"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-outline-variant text-on-surface bg-surface-container-lowest focus-visible:ring-primary"
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto">
                {filtered.length} members
              </span>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">👥</p>
                <p className="font-body-md text-on-surface-variant font-medium">
                  {search ? "No members match your search" : "No members yet"}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                   Members appear here when they sign up and get approved
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low hover:bg-surface-container-low border-outline-variant">
                    <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3">
                      Member
                    </TableHead>
                    <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3">
                      Role
                    </TableHead>
                    <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3">
                      Team
                    </TableHead>
                    <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3">
                      Last Active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => (
                    <TableRow key={member.id} className="border-outline-variant hover:bg-surface-container/40 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0 border border-outline-variant">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md text-on-surface font-semibold">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center font-label-sm text-label-sm px-2.5 py-1 rounded-sm border uppercase tracking-wide ${roleConfig[member.role] ?? "bg-surface-variant text-on-surface-variant border-outline-variant"}`}>
                          {formatRole(member.role)}
                        </span>
                        {member.expiresAt && (
                          <p className="text-xs text-on-surface-variant mt-1">
                            Expires {new Date(member.expiresAt).toLocaleDateString("en-IN")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-body-md text-body-md text-on-surface-variant">
                        {member.clubName ?? "—"}
                      </TableCell>
                      <TableCell className="py-4 font-body-md text-body-md text-on-surface-variant">
                        {member.lastActive
                          ? new Date(member.lastActive).toLocaleDateString("en-IN")
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </div>

      {/* Assign Role Dialog (member detail view) */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="max-w-md bg-surface border-outline-variant">
          <DialogHeader>
            <DialogTitle className="font-headline-md text-headline-md text-on-surface">
              Member Details
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              {assignTarget?.firstName} {assignTarget?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setAssignTarget(null)}
              className="flex-1 border-outline-variant text-on-surface-variant"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-sm bg-surface border-outline-variant">
          <DialogHeader>
            <DialogTitle className="font-headline-md text-headline-md text-on-surface">
              Invite Member
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Share your organisation&apos;s sign-up link or ask members to register directly on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Institutional Email
              </p>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-outline-variant focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowInviteModal(false)} className="flex-1 border-outline-variant">
              Cancel
            </Button>
            <Button
              id="send-invite-btn"
              onClick={() => setShowInviteModal(false)}
              className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-[16px] mr-1">send</span>
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
