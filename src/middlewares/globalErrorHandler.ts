import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

    let statusCode = 500;
    let errorMessage = "Internal Server Error";
    let errorDetails = err;

    // Prisma Client Validation Error
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        errorMessage = "Incorrect field type or missing fields";
    }

    //Prisma Client Known Request Error
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
            statusCode = 400;
            errorMessage = "An operation failed because ot depends on one or more records that are required but.... bla bla bla"
        }

        else if (err.code === "P2002") {
            statusCode = 400;
            errorMessage = "Duplicate Key Record"
        }

        else if (err.code === "P2003") {
            statusCode = 400;
            errorMessage = "Foreign Key Constraint failed"
        }
    }

    // 
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = 500;
        errorMessage = "Error occurred during query execution"
    }

    else if (err instanceof Prisma.PrismaClientInitializationError) {
        if (err.errorCode === "P1000") {
            statusCode = 401;
            errorMessage = "Authentication failed, please check your credentials"
        }

        if (err.errorCode === "P1001") {
            statusCode = 400;
            errorMessage = "Can't reach database server"
        }
    }

    res.status(statusCode)
    res.json({
        message: errorMessage,
        error: errorDetails
    })
}

export default errorHandler;
