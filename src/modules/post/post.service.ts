import { Post } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"

// business logic create a new post (post)
const createPostToDB = async (data: Omit<Post, "id" | "createdAt" | "updatedAt">) => {
    const result = await prisma.post.create({
        data
    })
    return result;
}

// business logic for get all posts
const getAllPostFromDb = async () => {
    const result = await prisma.post.findMany({
        include: {
            comments: true
        }
    })
    return result;
}

export const postService = {
    createPostToDB,
    getAllPostFromDb
}