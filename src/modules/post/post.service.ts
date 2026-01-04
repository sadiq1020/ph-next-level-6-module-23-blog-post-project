import { Post, PostStatus } from "../../../generated/prisma/client"
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"

// business logic create a new post (post)
const createPostToDB = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}

// get a post by id
const getPostById = async (postId: string) => {

    const result = await prisma.$transaction(async (tx) => {
        // first updating the view count for that specific post
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        const postData = await tx.post.findUnique({
            where: {
                id: postId
            }
        })
        return postData;
    })
    return result;
}

// business logic for get all posts
const getAllPostFromDb = async (payload: { search: string | undefined, tags: string[] | [], isFeatured: boolean | undefined, status: PostStatus | undefined, authorId: string | undefined, page: number, limit: number, skip: number, sortBy: string, sortOrder: string }) => {
    const andConditions: PostWhereInput[] = [];

    const { search, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder } = payload;

    // search for any values
    if (search) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: search
                    }
                }
            ]
        },)
    }

    // search for multiple tags
    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: payload.tags as string[]
            }
        })
    }

    // search for isFeatured
    if (typeof isFeatured === 'boolean') {
        andConditions.push({
            isFeatured
        })
    }

    // search for status
    if (status) {
        andConditions.push({
            status
        })
    }

    // search by authorId
    if (authorId) {
        andConditions.push({
            authorId
        })
    }

    const allPost = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: andConditions
        },
        orderBy:
        {
            [sortBy]: sortOrder
        }
    })

    // counting total posts to return it 
    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })

    return {
        data: allPost,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export const postService = {
    createPostToDB,
    getAllPostFromDb,
    getPostById
}