import { Request, Response } from "express";
import Registration from "../models/Registrations";

// ✅ Add a new registration
export const addRegistration = async (req: any, res: Response) => {
  try {
    const { rollNo, labNo, systemNo, machineId } = req.body;

    const newEntry = new Registration({
      userId: req.user._id, // comes from middleware
      name: req.user.name,
      rollNo,
      labNo,
      systemNo,
      timestamp: new Date(),
      machineId,
    });

    await newEntry.save();
    res.status(201).json({ message: "Registration saved", entry: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all registrations (faculty use)
export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const { date, labNo, rollNo } = req.query;

    const filter: any = {};
    if (date) {
      const start = new Date(date as string);
      const end = new Date(date as string);
      end.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: start, $lte: end };
    }
    if (labNo) filter.labNo = labNo;
    if (rollNo) filter.rollNo = rollNo;

    const entries = await Registration.find(filter).sort({ timestamp: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
