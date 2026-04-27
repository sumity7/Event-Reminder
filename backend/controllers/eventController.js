// Note: Changed 'userModal' to 'userModel' as "Model" is the correct database terminology
import userModel from "../models/userModel.js";

// Add new event
const addEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, event, date, relation } = req.body;

    const newEvent = { name, phone, event, date, relation };

    // OPTIMIZATION: Use $push to add the item directly in the database
    // instead of downloading the whole user document into memory.
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $push: { events: newEvent } },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Grab the newly created event (which now has a MongoDB generated _id) to return it
    const addedEvent = updatedUser.events[updatedUser.events.length - 1];

    res.json({ success: true, message: "Event Added", event: addedEvent });
  } catch (error) {
    console.error("Error in addEvent:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List events
const listEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    // OPTIMIZATION: Added .lean()
    // .lean() tells Mongoose to return raw JSON instead of heavy Mongoose objects.
    // It makes read-only queries 3-5x faster.
    const user = await userModel.findById(userId).select("events").lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, events: user.events });
  } catch (error) {
    console.error("Error in listEvents:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Edit event
const editEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const { name, phone, event, date, relation } = req.body;

    const updateFields = {};
    if (name) updateFields["events.$.name"] = name;
    if (phone) updateFields["events.$.phone"] = phone;
    if (event) updateFields["events.$.event"] = event;
    if (date) updateFields["events.$.date"] = date;
    if (relation) updateFields["events.$.relation"] = relation;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: userId, "events._id": eventId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User or Event not found",
      });
    }

    const updatedEvent = updatedUser.events.find(
      (e) => e._id.toString() === eventId
    );

    res.json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error in editEvent:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    // OPTIMIZATION: Use $pull to remove the item instantly in the DB layer.
    // This turns a 3-step process (Fetch -> Pull -> Save) into a 1-step process.
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { events: { _id: eventId } } },
      { new: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error.stack || error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export { addEvent, editEvent, listEvents, deleteEvent };
