import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    event: { type: String, required: true },
    date: { type: String, required: true },
    relation: { type: String },
  },
  { _id: true } // ensure each event has an _id (default is true)
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    events: [eventSchema],
  },
  { timestamps: true }
);

const userModal = mongoose.models.user || mongoose.model("user", userSchema);

export default userModal;
