import { runMongoCheck } from "./check-mongodb-runner";

void runMongoCheck().then(
  (code) => { process.exitCode = code; },
  () => {
    console.error("MongoDB verification failed. Sensitive details are suppressed.");
    process.exitCode = 1;
  },
);
