const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const Payment = require("../models/Payment");
const EnrolledStudents = require("../models/EnrolledStudents");

exports.getAllCategories = async (req, res) => {
    try {
        console.log("inside getAllCategories inside server")
        const allCategories = await Category.find({}, { name: true, description: true, course: true });
        console.log("Get all catagories in server : ", allCategories)
        return res.status(200).json({
            success: true,
            data: allCategories,
            message: "All categories fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
}

exports.addSingleCategory = async (req, res) => {
    try {
        console.log("inside addSingleCategory inside server")
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }

        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();
        console.log("Saved category: ", savedCategory);

        return res.status(201).json({
            success: true,
            data: savedCategory,
            message: "Category added successfully"
        });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add category",
        });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Name and description are required"
            });
        }
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: updatedCategory,
            message: "Category updated successfully"
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update category",
        });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            firstName: true,
            lastName: true,
            email: true,
            accountType: true,
            accountStatus: true,
            createdAt: true,
            image: true
        });
        return res.status(200).json({
            success: true,
            data: users,
            message: "All users fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
}

exports.updateAccountStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { accountStatus } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        if (!accountStatus) {
            return res.status(400).json({
                success: false,
                message: "Account status is required"
            });
        }

        const validStatuses = ["pending", "active", "suspended", "deactivated"];
        if (!validStatuses.includes(accountStatus.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid account status"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { accountStatus: accountStatus.toLowerCase() },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedUser,
            message: "Account status updated successfully"
        });


    } catch (error) {
        console.error("Error updating account status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update account status",
        });
    }
}

exports.coursesManagement = async (req, res) => {
    try {
        const courses = await Course.find({})
            .select("courseName category instructor price studentsEnrolled status")
            .populate("category", "name")
            .populate(
                "instructor", "firstName lastName email"
            );

        return res.status(200).json({
            success: true,
            data: courses,
            message: "All courses fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
};

exports.updateCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { status } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const validStatuses = ["Draft", "Published", "Unpublished"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { status },
            { new: true }
        );
        if (!updatedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: updatedCourse,
            message: "Course status updated successfully"
        });
    } catch (error) {
        console.error("Error updating course status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update course status",
        });
    }
}

exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required"
            });
        }

        const deletedCourse = await Course.findByIdAndDelete(courseId);
        if (!deletedCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        /* 
            Need to update all state
        */

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const payments = await Payment.find({ paymentTime: { $gte: thirtyDaysAgo } })
            .select("amount user course paymentStatus paymentTime")
            .populate("user", "firstName lastName email")
            .populate("course", "courseName price")
            .sort({ paymentTime: -1 });

        console.log("Payments:", payments);

        const totalRevenue = payments.reduce((acc, payment) => acc + payment.amount / 100, 0);

        const totalEarnings = payments.reduce((acc, payment) => {
            if (payment.paymentStatus === "completed") {
                return acc + (payment.amount * 0.2) / 100;
            }
            return acc;
        }, 0);

        const totalPayouts = payments.reduce((acc, payment) => {
            if (payment.paymentStatus === "completed") {
                return acc + (payment.amount * 0.8) / 100;
            }
            return acc;
        }, 0);

        console.log("Total Revenue:", totalRevenue);
        console.log("Total Earnings:", totalEarnings);
        console.log("Total Payouts:", totalPayouts);

        return res.status(200).json({
            success: true,
            data: {
                payments: payments,
                totalRevenue,
                totalEarnings,
                totalPayouts,
                transactionCount: payments.length
            },
            message: "All payment details fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching payment details:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch payment details",
        });
    }
}

exports.getAdminDashboardData = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalRevenue = await Payment.aggregate([
            { $match: { paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalEnrollments = await EnrolledStudents.countDocuments();

        // need to get data for the current year month till to current month

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const aggregation = await EnrolledStudents.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lt: new Date(currentYear, currentMonth + 1, 1)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    enrollments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyEnrollments = monthNames.slice(0, currentMonth + 1).map((name, idx) => {
            const found = aggregation.find(m => m._id === idx + 1);
            return {
                name,
                enrollments: found ? found.enrollments : 0
            };
        });

        console.log("Monthly Enrollments:", monthlyEnrollments);
        console.log("last month enrollment: ", monthlyEnrollments[monthlyEnrollments.length - 1]);

        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select("firstName lastName email accountType createdAt")
            .lean();

        const popularCourses = await Course.find({})
            .sort({ studentsEnrolled: -1 })
            .limit(5)
            .select("courseName studentsEnrolled")
            .lean();

        console.log("Popular Courses:", popularCourses);

        const popularCourseData = popularCourses.map(course => ({
            _id: course._id,
            name: course.courseName,
            value: course.studentsEnrolled.length
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalEnrollments,
                monthlyEnrollments,
                popularCourseData,
                recentUsers
            },
            message: "Dashboard data fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
        });
    }
}

