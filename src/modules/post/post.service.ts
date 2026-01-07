import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client"
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
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: { createdAt: "asc" },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: { createdAt: "asc" },
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
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
        },
        include: {
            _count: {
                select: { comments: true }
            }
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

// get my posts
const getMyPost = async (authorId: string) => {
    // only if the user status is "ACTIVE"
    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE"
        },
        select: {
            id: true
        }
    })


    const result = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    // count my total posts
    // option 1
    const total1 = await prisma.post.aggregate({
        _count: {
            id: true
        },
        where: {
            authorId
        }
    })

    // option 2
    const total2 = await prisma.post.count({
        where: {
            authorId
        },
    })

    return {
        data: result,
        total1,
        total2
    }
}

// update my post 
const updateMyPost = async (postId: string, payload: Partial<Post>, authorId: string, isAdmin: boolean) => {
    /*
    1. user can only update his post but not the isFeatured
    2. Admin can update and do all things for any one's post
    */
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    });

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not the owner of the post")
    }

    if (!isAdmin) {
        delete payload.isFeatured;
    }

    const result = await prisma.post.update({
        where: {
            id: postData.id
        },
        data: payload
    })

    return result
}

// delete a post
const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    /*
    1. User can delete only his/her post
    2. Admin can delete anyone's post
    */
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    });

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not the owner of the post")
    }

    return await prisma.post.delete({
        where: {
            id: postId
        }
    })
}

// ----------- show various stats on the UI -------------
const getStats = async () => {
    // postCount, publishedPosts, draftPosts, totalComments, totalViews etc.

    return await prisma.$transaction(async (tx) => {

        // option 1
        // const totalPosts = await tx.post.count();
        // const publishedPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.PUBLISHED
        //     }
        // });
        // const draftPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.DRAFT
        //     }
        // });
        // const archivedPosts = await tx.post.count({
        //     where: {
        //         status: PostStatus.ARCHIVED
        //     }
        // });

        // option 2
        const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalComments, approvedComments, totalUsersCount, adminCount, userCount, totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
            await tx.post.count({ where: { status: PostStatus.DRAFT } }),
            await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
            await tx.comment.count(),
            await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
            await tx.user.count(),
            await tx.user.count({ where: { role: "ADMIN" } }),
            await tx.user.count({ where: { role: "USER" } }),
            await tx.post.aggregate({
                _sum: { views: true }
            })

        ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComments,
            totalUsersCount,
            adminCount,
            userCount,
            totalViews: totalViews._sum.views
        }
    })
}

export const postService = {
    createPostToDB,
    getAllPostFromDb,
    getPostById,
    getMyPost,
    updateMyPost,
    deletePost,
    getStats
}