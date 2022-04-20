import "pptr-testing-library/extend";
import getPort from "get-port";
import { execa } from "execa";
import puppeteer from "puppeteer";

export type Process = {
  close(): Promise<void>;
  port: number;
};

export type App = {
  navigate(path: string): Promise<puppeteer.ElementHandle<Element>>;
  close(): Promise<void>;
  browser: puppeteer.Browser;
  page: puppeteer.Page;
};

async function process() {
  let port = await getPort();

  let server = execa("npm", ["start"], {
    env: {
      CI: "true",
      NODE_ENV: "test",
      PORT: port.toString(),
    },
  });

  return await new Promise<Process>(async (resolve, reject) => {
    if (server.stdout === null) return reject("Failed to start server.");
    server.stdout.on("data", (stream: Buffer) => {
      if (stream.toString().includes(port.toString())) {
        return resolve({
          async close() {
            if (server.killed) return;
            server.cancel();
          },
          port,
        });
      }
    });
  });
}

export async function open(): Promise<App> {
  let { port, close } = await process();
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  return {
    browser,
    page,
    async navigate(path: string) {
      let url = new URL(path, `http://localhost:${port}/`);
      await page.goto(url.toString());
      return await page.getDocument();
    },
    async close() {
      await close();
      await browser.close();
    },
  };
}
