import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

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

export const PostController = {
    createPost,
    getAllPosts,
    getPostById
}