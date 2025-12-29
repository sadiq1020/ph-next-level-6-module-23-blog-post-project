import express from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

// setting cors
app.use(cors({
    origin: process.env.APP_URL || "http://localhost:4000",
    credentials: true
}))


app.use(express.json());

app.use("/posts", postRouter);

app.get("/", (req, res) => {
    res.send("hello world!")
})

export default app;