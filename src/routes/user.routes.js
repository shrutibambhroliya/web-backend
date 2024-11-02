import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { logOutUser } from "../controllers/user.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";
import { getUserProfile } from "../controllers/user.controller.js";
import { changeCurrentPassword } from "../controllers/user.controller.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { updateAvatar } from "../controllers/user.controller.js";
import { getAllUser } from "../controllers/user.controller.js";
import { updateUserRole } from "../controllers/user.controller.js";
import { deleteUser } from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logOut").post(verifyJwt, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getUser-Profile").get(verifyJwt, getUserProfile);
router.route("/updateUser-Profile").patch(verifyJwt, updateUserProfile);
router.route("/change-password").post(verifyJwt, changeCurrentPassword);
router
  .route("/update-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);
router.route("/getAll-user").get(verifyJwt, getAllUser);
router.route("/c/:userId").patch(verifyJwt, updateUserRole);
router.route("/c/:userId").delete(verifyJwt, isAdmin, deleteUser);

export default router;
