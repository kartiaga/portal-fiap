import fastify from "fastify";
import { registerUsersModule } from "./modules/users";

export const app = fastify();

await registerUsersModule(app)