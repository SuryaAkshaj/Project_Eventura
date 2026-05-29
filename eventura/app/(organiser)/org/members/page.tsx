"use client";
import { useState } from "react";
import { mockOrgMembers, mockOrgEvents, type OrgMember, type MemberRole } from "@/lib/mockData";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLES: MemberRole[] = ["Observer", "Event Manager", "Co-Organiser", "Admin"];

const statusConfig = {
  active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  invited: { label: "Invited", classes: "bg-tertiary-fixed/50 text-on-tertiary-fixed border-tertiary-fixed" },
  inactive: { label: "Inactive", classes: "bg-surface-variant text-on-surface-variant border-outline-variant" },
};

const roleConfig: Record<MemberRole, string> = {
  Admin: "bg-primary/10 text-primary border-primary/20",
  "Event Manager": "bg-secondary-container text-on-secondary-container border-secondary-fixed-dim",
  "Co-Organiser": "bg-tertiary-fixed/40 text-on-tertiary-fixed border-tertiary-fixed",
  Observer: "bg-surface-variant text-on-surface-variant border-outline-variant",
};

export default function OrgMembersPage() {
  const [members, setMembers] = useState<OrgMember[]>(mockOrgMembers);
  const [search, setSearch] = useState("");
  const [assignTarget, setAssignTarget] = useState<OrgMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<MemberRole>("Event Manager");
  const [selectedEvent, setSelectedEvent] = useState(mockOrgEvents[0]?.id ?? "");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const filtered = members.filter(
    (m) =>
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = () => {
    if (!assignTarget) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === assignTarget.id ? { ...m, role: selectedRole } : m
      )
    );
    setAssignTarget(null);
  };

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
                Manage your team — assign roles and responsibilities per event.
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
              { label: "Active", value: members.filter((m) => m.status === "active").length.toString(), icon: "check_circle", color: "text-[#2e7d32]" },
              { label: "Pending Invites", value: members.filter((m) => m.status === "invited").length.toString(), icon: "schedule_send", color: "text-tertiary" },
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
                    Status
                  </TableHead>
                  <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3 text-right">
                    Events Managed
                  </TableHead>
                  <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3">
                    Joined
                  </TableHead>
                  <TableHead className="font-label-sm text-on-surface-variant uppercase tracking-wider py-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => {
                  const sc = statusConfig[member.status];
                  return (
                    <TableRow key={member.id} className="border-outline-variant hover:bg-surface-container/40 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${member.avatarColor} flex items-center justify-center font-bold text-primary text-sm shrink-0 border border-outline-variant`}>
                            {member.avatarInitials}
                          </div>
                          <div>
                            <p className="font-body-md text-body-md text-on-surface font-semibold">{member.name}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center font-label-sm text-label-sm px-2.5 py-1 rounded-sm border uppercase tracking-wide ${roleConfig[member.role]}`}>
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-1 rounded-full border ${sc.classes}`}>
                          {member.status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {sc.label}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right font-body-md text-body-md text-on-surface-variant">
                        {member.eventsManaged}
                      </TableCell>
                      <TableCell className="py-4 font-body-md text-body-md text-on-surface-variant">
                        {member.joinDate}
                      </TableCell>
                      <TableCell className="py-4">
                        <Button
                          variant="outline"
                          id={`assign-role-${member.id}`}
                          onClick={() => {
                            setAssignTarget(member);
                            setSelectedRole(member.role);
                          }}
                          className="border-outline-variant text-on-surface-variant hover:bg-surface-variant font-label-sm text-label-sm h-8 px-3"
                        >
                          <span className="material-symbols-outlined text-[16px] mr-1">manage_accounts</span>
                          Assign Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        </div>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="max-w-md bg-surface border-outline-variant">
          <DialogHeader>
            <DialogTitle className="font-headline-md text-headline-md text-on-surface">
              Assign Role
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Update <span className="font-semibold text-on-surface">{assignTarget?.name}</span>&apos;s role within your organisation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Event Scope */}
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Scoped to Event (Optional)
              </Label>
              <select
                id="assign-event-scope"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full h-10 px-3 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">Platform-wide (all events)</option>
                {mockOrgEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.title}</option>
                ))}
              </select>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                New Role
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <label
                    key={role}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRole === role
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => setSelectedRole(role)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-body-md text-on-surface font-semibold">{role}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {role === "Admin" && "Full access"}
                        {role === "Event Manager" && "Manage events"}
                        {role === "Co-Organiser" && "Limited create"}
                        {role === "Observer" && "View only"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setAssignTarget(null)}
              className="flex-1 border-outline-variant text-on-surface-variant"
            >
              Cancel
            </Button>
            <Button
              id="confirm-assign-role-btn"
              onClick={handleAssign}
              className="flex-1 bg-primary text-on-primary hover:bg-primary/90"
            >
              Confirm Role
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
              Send an invitation to join your organisation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Institutional Email
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@university.edu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border-outline-variant focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wide">
                Initial Role
              </Label>
              <select className="w-full h-10 px-3 border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
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
