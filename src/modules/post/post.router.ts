import express, { NextFunction, Request, Response } from 'express';
import { PostController } from './post .controller';
import { auth as betterAuth } from "../../lib/auth";
import { success } from 'better-auth/*';

const router = express.Router();

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}

// declare global type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string,
                email: string,
                name: string,
                role: string,
                emailVerified: boolean
            }
        }
    }
}

// handling AUTH here (should be separate file)
const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // get user session(session is added in schema.prisma)
        const session = await betterAuth.api.getSession({
            headers: req.headers as any
        })

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized"
            })
        }

        if (!session.user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Email verification required"
            })
        }

        // if all ok, then set the user information to the user
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role as string,
            emailVerified: session.user.emailVerified
        }

        // checking the role
        if (roles.length && !roles.includes(req.user.role as UserRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }

        console.log(session);
    }
}

router.post("/", auth(UserRole.USER), PostController.createPost);
router.get("/", PostController.getAllPosts)

export const postRouter = router;