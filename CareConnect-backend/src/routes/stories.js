const express = require("express");
const asyncHandler = require("express-async-handler");
const { protect } = require("../middleware/auth");
const Story = require("../models/Story");
const Doctor = require("../models/Doctor");

const router = express.Router();

// @desc Get stories for doctor
// @route GET /api/stories/doctor/:doctorId
router.get(
  "/doctor/:doctorId",
  asyncHandler(async (req, res) => {
    const doctorId = req.params.doctorId;

    const stories = await Story.find({ doctor: doctorId })
      .populate("user", "fullname")
      .sort({ createdAt: -1 });

    res.json(stories);
  }),
);

// @desc Add a story (patient)
// @route POST /api/stories/add
router.post(
  "/add",
  protect,
  asyncHandler(async (req, res) => {
    // Only patients should be able to submit stories.
    if (req.user.role !== "user") {
      res.status(403);
      throw new Error("Only users can submit stories");
    }

    const {
      doctorId,
      visitedFor,
      visitingFor,
      recommended,
      recommend,
      story,
    } = req.body;

    const resolvedVisitedFor = visitedFor || visitingFor || "";
    const resolvedRecommend =
      typeof recommend === "boolean"
        ? recommend
        : typeof recommended === "boolean"
          ? recommended
          : false;

    if (!doctorId || !story) {
      res.status(400);
      throw new Error("doctorId and story are required");
    }

    const created = await Story.create({
      doctor: doctorId,
      user: req.user._id,
      visitedFor: resolvedVisitedFor,
      recommend: resolvedRecommend,
      story,
    });

    // Keep Doctor.stories in sync so the frontend can show review counts.
    await Doctor.findByIdAndUpdate(doctorId, {
      $addToSet: { stories: created._id },
    });

    const populated = await Story.findById(created._id).populate(
      "user",
      "fullname",
    );

    res.status(201).json({ story: populated });
  }),
);

module.exports = router;
