const express = require("express");
const router = express.Router();

const {
    getAllCategories,
    addSingleCategory,
    updateCategory,
    deleteCategory,
    getUsers,
    updateAccountStatus,
    coursesManagement,
    updateCourseStatus,
    deleteCourse,
    getPayments,
    getAdminDashboardData
} = require('../controller/AdminUpdated');

const { auth, isAdmin } = require('../middlewares/AuthNMid')

router.get("/get-all-categories", auth, isAdmin, getAllCategories);
router.post("/add-category", auth, isAdmin, addSingleCategory);
router.put("/update-category/:id", auth, isAdmin, updateCategory);
router.delete("/delete-category/:id", auth, isAdmin, deleteCategory);
router.get("/get-all-users", auth, isAdmin, getUsers);
router.put("/update-account-status/:userId", auth, isAdmin, updateAccountStatus);
router.get("/get-courses-management-data", auth, isAdmin, coursesManagement);
router.put("/update-course-status/:courseId", auth, isAdmin, updateCourseStatus);
router.delete("/delete-course/:courseId", auth, isAdmin, deleteCourse);
router.get("/get-payments", auth, isAdmin, getPayments);
router.get("/get-admin-dashboard-data", auth, isAdmin, getAdminDashboardData);

module.exports = router;