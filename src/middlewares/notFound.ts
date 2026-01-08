import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
    res.status(404).json({
        message: "Route Not FOUND!",
        path: req.originalUrl,
        date: Date()
    })
}