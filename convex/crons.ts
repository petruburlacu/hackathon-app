import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly("delete orphan uploads", { minuteUTC: 17 }, internal.images.deleteOrphanUploads, {});

export default crons;
