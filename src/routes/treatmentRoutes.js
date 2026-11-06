const express = require("express");
const { getAllTreatments, getTreatmentById } = require("../controllers/treatmentController");

// A Router is a mini-Express app. It only handles routes for a specific resource.
const router = express.Router();

// When a GET request hits the root of this router, run getAllTreatments
router.get("/", getAllTreatments);
router.get("/:id", getTreatmentById);
module.exports = router;
