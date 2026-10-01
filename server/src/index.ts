import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`Messaging gateway is running on http://${config.host}:${config.port}`);
});
