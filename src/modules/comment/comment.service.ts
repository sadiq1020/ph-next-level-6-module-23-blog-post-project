import { CommentStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

// create a new comment
const createCommentToDB = async (payload: {
    content: string,
    authorId: string,
    postId: string,
    parentId?: string
}) => {
    // console.log("comment service", payload);
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    const result = await prisma.comment.create({
        data: payload
    })
    return result
}

// get comment by id
const getCommentById = async (commentId: string) => {
    return await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })
}

// get comment by author
const getCommentsByAuthor = async (authorId: string) => {
    return await prisma.comment.findMany({
        where: {
            authorId
        },
        orderBy: { createdAt: "desc" },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
}

// delete a comment
const deleteCommentFromDb = async (commentId: string, authorId: string) => {
    // 1. Only nijer comment delete korte parbe
    // 2. must be logged in
    // 3. nijer comment kina check korte hobe

    // console.log({ commentId, authorId });

    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })

    console.log({ commentData });

    if (!commentData) {
        throw new Error("your provided input is not valid")

    }
    return prisma.comment.delete({
        where: {
            id: commentId
        }
    })
}

// update a comment (we need authorId, commentId, updated data)
const updateComment = async (commentId: string, data: { content?: string, status?: CommentStatus }, authorId: string) => {
    // console.log({ commentId, data, authorId });
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: {
            id: true
        }
    })

    console.log({ commentData });

    if (!commentData) {
        throw new Error("your provided input is not valid")
    }
    return await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })
}

export const CommentService = {
    createCommentToDB,
    getCommentById,
    getCommentsByAuthor,
    deleteCommentFromDb,
    updateComment
}