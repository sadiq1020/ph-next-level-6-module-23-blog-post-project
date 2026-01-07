import express from 'express';
import { PostController } from './post .controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get("/", PostController.getAllPosts)
router.get("/my-posts", auth(UserRole.USER, UserRole.ADMIN), PostController.getMyPosts);
// ----------- show various stats on the UI ------------- (Module: 28.8)
router.get("/stats", auth(UserRole.ADMIN), PostController.getStats);
// ----------------
router.get("/:id", PostController.getPostById);
router.post("/", auth(UserRole.USER, UserRole.ADMIN), PostController.createPost);
router.patch("/:postId", auth(UserRole.USER, UserRole.ADMIN), PostController.updateMyPost);
router.delete("/:postId", auth(UserRole.USER, UserRole.ADMIN), PostController.deletePost);

export const postRouter = router;