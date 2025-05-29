import { Context } from "hono";

export type AuthenticationContext = Context<{
  Variables: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}>;
