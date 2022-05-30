import { execa } from "execa";
import getPort from "get-port";
import "pptr-testing-library/extend";
import puppeteer from "puppeteer";
import { generateDatabaseUrl, migrateDatabase, type DATABASE_URL } from "./db";

export type Process = {
  stop(): Promise<void>;
  port: number;
};

export type App = {
  navigate(path: string): Promise<puppeteer.ElementHandle<Element>>;
  stop(): Promise<void>;
  browser: puppeteer.Browser;
  page: puppeteer.Page;
};

function clearBuild() {
  return Promise.all([
    execa("rm", ["-rf", "server/build"]),
    execa("rm", ["-rf", "public/build"]),
  ]);
}

function buildApp() {
  return execa("npm", ["run", "build"]);
}

async function prepareBuild() {
  await clearBuild();
  await buildApp();
}

async function prepareDatabase() {
  let databaseUrl = generateDatabaseUrl();
  await migrateDatabase(databaseUrl);
  return databaseUrl;
}

async function startProcess({ databaseUrl }: { databaseUrl: DATABASE_URL }) {
  let port = await getPort();

  let server = execa("npm", ["start"], {
    env: {
      CI: "true",
      NODE_ENV: "test",
      PORT: port.toString(),
      BASE_URL: `http://localhost:${port}`,
      DATABASE_URL: databaseUrl,
    },
  });

  return await new Promise<Process>(async (resolve, reject) => {
    server.catch((error) => reject(error));
    if (server.stdout === null) return reject("Failed to start server.");
    server.stdout.on("data", (stream: Buffer) => {
      if (stream.toString().includes(port.toString())) {
        return resolve({
          async stop() {
            if (server.killed) return;
            server.cancel();
          },
          port,
        });
      }
    });
  });
}

async function openBrowser() {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  return { browser, page };
}

export async function start(): Promise<App> {
  let browserPromise = openBrowser();
  let [databaseUrl] = await Promise.all([prepareDatabase(), prepareBuild()]);

  let [{ port, stop }, { browser, page }] = await Promise.all([
    startProcess({ databaseUrl }),
    browserPromise,
  ]);

  return {
    browser,
    page,
    async navigate(path: string) {
      let url = new URL(path, `http://localhost:${port}/`);
      await page.goto(url.toString());
      return await page.getDocument();
    },
    async stop() {
      await stop();
      await browser.close();
      await clearBuild();
    },
  };
}
