import { Request, Response } from "express";
import { CommentService } from "./comment.service";

// create a new comment
const createComment = async (req: Request, res: Response) => {

    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await CommentService.createCommentToDB(req.body)
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

// get comment by Id
const getCommentById = async (req: Request, res: Response) => {

    try {
        const commentId = req.params.commentId;
        const result = await CommentService.getCommentById(commentId as string)
        res.status(200).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: "Comment fetched failed",
            details: error
        })
    }
}

// get comment by author
const getCommentByAuthor = async (req: Request, res: Response) => {

    try {
        const authorId = req.params.authorId;
        const result = await CommentService.getCommentsByAuthor(authorId as string)
        res.status(200).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: "Comment fetched failed",
            details: error
        })
    }
}

// delete a comment 
const deleteComment = async (req: Request, res: Response) => {

    try {
        const id = req.user?.id;
        const commentId = req.params.commentId;
        const result = await CommentService.deleteCommentFromDb(commentId as string, id as string)
        res.status(200).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: "Comment delete failed",
            details: error
        })
    }
}

// update a comment
const updateComment = async (req: Request, res: Response) => {

    try {
        const id = req.user?.id;
        const commentId = req.params.commentId;
        const result = await CommentService.updateComment(commentId as string, req.body, id as string)
        res.status(200).json(result)

        //success: true,
        // message: "Users retrieved successfully",
        // data: result.rows
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            error: "Comment update failed",
            details: error
        })
    }
}

export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateComment
}