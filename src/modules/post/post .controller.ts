import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

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
        // console.log(req.user);
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

// get post by Id
const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            throw new Error("post id is required");
        }

        const result = await postService.getPostById(postId);
        res.status(201).json(result)
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

        // find the search result (25.4)
        // getting any search string except multiple tags at a time 
        const search = req.query.search
        // console.log(search);   
        const searchString = typeof search === "string" ? search : undefined

        // getting multiple search string of array only for multiple tags
        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

        // searching by isFeatured (only true/false) [25.9 watch full]
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                    ? false
                    : undefined
            : undefined;

        // console.log({ isFeatured });

        // searching by Status
        const status = req.query.status as PostStatus | undefined;

        // search by authorId
        const authorId = req.query.authorId as string | undefined;

        // ************** Pagination ***(26.3)******** //
        // const page = Number(req.query.page ?? 1);
        // const limit = Number(req.query.limit ?? 10)
        // const skip = (page - 1) * limit;


        // ************** Sorting ***(26.5)******** //
        // const sortBy = req.query.sortBy as string | undefined;
        // const sortOrder = req.query.sortOrder as string | undefined;

        // ** we will create a helper function named - paginationSortingHelper to use this from other component
        const option = paginationSortingHelper(req.query); // we will get values for page, limit, sortBy, sortOrder from req.query
        // console.log(option);
        const { page, limit, skip, sortBy, sortOrder } = option;



        const result = await postService.getAllPostFromDb({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder }); // sending the search values to service 
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

// get My Post (Module: 28-3)
const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        // console.log(user);

        if (!user) {
            throw new Error("You are not authorized");
        }
        const result = await postService.getMyPost(user.id);
        res.status(200).json(result)
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

// update my post
const updateMyPost = async (req: Request, res: Response) => {
    /*
    1. user can only update his post but not the isFeatured
    2. Admin can update and do all things for any one's post
    */

    try {
        const user = req.user;
        // console.log(user);

        if (!user) {
            throw new Error("You are not authorized");
        }

        const postId = req.params.postId;
        // check if the user is Admin
        const isAdmin = user.role === UserRole.ADMIN;

        const result = await postService.updateMyPost(postId as string, req.body, user.id, isAdmin);


        res.status(200).json(result)
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

// delete post
const deletePost = async (req: Request, res: Response) => {
    /*
    1. User can delete only his/her post
    2. Admin can delete anyone's post
    */

    try {
        const user = req.user;
        // console.log(user);

        if (!user) {
            throw new Error("You are not authorized");
        }

        const postId = req.params.postId;
        // check if the user is Admin
        const isAdmin = user.role === UserRole.ADMIN;

        const result = await postService.deletePost(postId as string, user.id, isAdmin);


        res.status(200).json(result)
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

// ----------- show various stats on the UI -------------
const getStats = async (req: Request, res: Response) => {
    /*
    1. User can delete only his/her post
    2. Admin can delete anyone's post
    */
    try {
        const result = await postService.getStats();


        res.status(200).json(result)
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const PostController = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updateMyPost,
    deletePost,
    getStats
}