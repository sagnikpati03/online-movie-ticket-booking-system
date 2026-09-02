const express = require("express");
const controller = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get("/dashboard", controller.dashboardStats);
router.get("/management", controller.getManagementData);

router.put("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deleteUser);

router.post("/movies", controller.createMovie);
router.put("/movies/:id", controller.updateMovie);
router.delete("/movies/:id", controller.deleteMovie);

router.post("/theatres", controller.createTheatre);
router.put("/theatres/:id", controller.updateTheatre);
router.delete("/theatres/:id", controller.deleteTheatre);

router.post("/screens", controller.createScreen);
router.put("/screens/:id", controller.updateScreen);
router.delete("/screens/:id", controller.deleteScreen);

router.post("/seats", controller.createSeat);
router.put("/seats/:id", controller.updateSeat);
router.delete("/seats/:id", controller.deleteSeat);

router.post("/shows", controller.createShow);
router.put("/shows/:id", controller.updateShow);
router.delete("/shows/:id", controller.deleteShow);

router.patch("/bookings/:id", controller.updateBooking);

module.exports = router;
