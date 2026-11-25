"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  DrawingPinFilledIcon,
  DrawingPinIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AnnouncementBody } from "@/components/AnnouncementBody";
import { HackathonNav } from "@/components/HackathonNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errorMessage";
import { formatUkDayTime } from "@/lib/ukTime";

export default function AnnouncementsPage() {
  const viewer = useQuery(api.users.viewer);
  const announcements = useQuery(api.announcements.list);

  if (!viewer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen grow flex-col bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
      <HackathonNav title="📌 BULLETIN BOARD 📌" />
      <div className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {viewer.isAdmin && <NewAnnouncementForm />}

          {announcements === undefined ? null : announcements.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-xs border-cyan-400/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-2 hackathon-title">
                  No announcements yet
                </h3>
                <p className="text-cyan-200 hackathon-text">
                  News from the organisers will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                isAdmin={viewer.isAdmin}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function AnnouncementCard({
  announcement,
  isAdmin,
}: {
  announcement: {
    _id: Id<"announcements">;
    title: string;
    body: string;
    pinned: boolean;
    createdAt: number;
  };
  isAdmin: boolean;
}) {
  const setPinned = useMutation(api.announcements.setPinned);
  const remove = useMutation(api.announcements.remove);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const togglePin = async () => {
    try {
      await setPinned({
        announcementId: announcement._id,
        pinned: !announcement.pinned,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update announcement"));
    }
  };

  const handleDelete = async () => {
    try {
      await remove({ announcementId: announcement._id });
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete announcement"));
    }
  };

  return (
    <Card
      className={`bg-black/40 backdrop-blur-xs ${
        announcement.pinned ? "border-yellow-400/60" : "border-cyan-400/20"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {announcement.pinned && (
              <Badge className="bg-yellow-400 text-black hackathon-text">
                📌 Pinned
              </Badge>
            )}
            <CardTitle className="text-yellow-400 hackathon-title text-lg sm:text-xl">
              {announcement.title}
            </CardTitle>
            <p className="text-xs text-gray-400 hackathon-text">
              {formatUkDayTime(announcement.createdAt)}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={togglePin}
                aria-label={announcement.pinned ? "Unpin" : "Pin"}
                className="border-yellow-400/60 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                {announcement.pinned ? (
                  <DrawingPinFilledIcon className="h-4 w-4" />
                ) : (
                  <DrawingPinIcon className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Delete announcement"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnnouncementBody
          body={announcement.body}
          className="text-cyan-100 text-sm sm:text-base hackathon-text"
        />
      </CardContent>
      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete this announcement?"
        confirmLabel="Delete announcement"
        tone="destructive"
        onConfirm={handleDelete}
      >
        <p>
          “{announcement.title}” will be removed from the bulletin for everyone.
          This can&apos;t be undone.
        </p>
      </ConfirmDialog>
    </Card>
  );
}

function NewAnnouncementForm() {
  const create = useMutation(api.announcements.create);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button
          onClick={() => setOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          New announcement
        </Button>
      </div>
    );
  }

  const handlePost = async () => {
    setPosting(true);
    try {
      await create({ title, body, pinned });
      setTitle("");
      setBody("");
      setPinned(false);
      setOpen(false);
      toast.success("Announcement posted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to post announcement"));
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-xs border-yellow-400/40">
      <CardHeader>
        <CardTitle className="text-yellow-400 hackathon-title">
          New announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="announcement-title"
            className="text-sm text-cyan-300 mb-2 block"
          >
            Title
          </label>
          <Input
            id="announcement-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="e.g. Pizza is here!"
            className="bg-black/20 border-cyan-400/30 text-white placeholder:text-gray-400"
          />
        </div>
        <div>
          <label
            htmlFor="announcement-body"
            className="text-sm text-cyan-300 mb-2 block"
          >
            Message
          </label>
          <textarea
            id="announcement-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
            rows={6}
            placeholder="Links are clickable. Line breaks are kept."
            className="w-full bg-black/20 border border-cyan-400/30 text-white placeholder:text-gray-400 rounded-md px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-cyan-400/50"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-cyan-300">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="w-4 h-4"
          />
          Pin to the top
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handlePost}
            disabled={posting || title.trim().length < 3 || !body.trim()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
          >
            Post
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
