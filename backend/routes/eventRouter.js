import express from "express";
import {
  addEvent,
  deleteEvent,
  editEvent,
  listEvents,
} from "../controllers/eventController.js";
import authUser from "../middleware/auth.js";

const eventRouter = express.Router();

eventRouter.post("/", authUser, addEvent);
eventRouter.get("/", authUser, listEvents);
eventRouter.put("/:id", authUser, editEvent);
eventRouter.delete("/:id", authUser, deleteEvent);

export default eventRouter;
