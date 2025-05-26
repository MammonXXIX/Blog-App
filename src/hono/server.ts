import { Hono } from "hono";
import authRoute from "./routes/auth.route";
import blogRoute from "./routes/blog.route";
import userRoute from "./routes/user.route";
import { authentication } from "./middlewares/authentication";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.use("/blogs/*", authentication);

app.route("/auth", authRoute);
app.route("/users", userRoute);
app.route("/blogs", blogRoute);

export { app };
