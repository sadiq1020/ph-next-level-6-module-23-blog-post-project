import { Request, Response } from "express"
import { postService } from "./post.service"

// add a new post (post)
const createPost = async (req: Request, res: Response) => {
    // console.log({ req, res })
    const user = req.user;

    if (!user) {
        return res.status(400).json({
            error: "Unauthorized!"
        })
    }
    try {
        console.log(req.user);
        const result = await postService.createPostToDB(req.body, user.id as string)
        res.status(201).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all post (get)
const getAllPosts = async (req: Request, res: Response) => {
    // console.log({ req, res })
    try {
        const result = await postService.getAllPostFromDb();
        res.status(201).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const PostController = {
    createPost,
    getAllPosts
}