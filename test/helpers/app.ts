import "pptr-testing-library/extend";
import getPort from "get-port";
import { execa } from "execa";
import puppeteer from "puppeteer";

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

async function startProcess() {
  let port = await getPort();

  let server = execa("npm", ["start"], {
    env: {
      CI: "true",
      NODE_ENV: "test",
      PORT: port.toString(),
      BASE_URL: `http://localhost:${port}`,
    },
  });

  server.catch((error) => {
    console.error(error);
  });

  return await new Promise<Process>(async (resolve, reject) => {
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

function openBrowser() {
  return puppeteer.launch();
}

function openPage(browser: puppeteer.Browser) {
  return browser.newPage();
}

export async function start(): Promise<App> {
  await clearBuild();
  await buildApp();

  let { port, stop } = await startProcess();

  let browser = await openBrowser();
  let page = await openPage(browser);

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
