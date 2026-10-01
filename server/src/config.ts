export const config = {
  host: process.env.HOST ?? "localhost",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173"
};
