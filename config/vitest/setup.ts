import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/extend-expect";
import dotenv from "dotenv";

dotenv.config({ override: true });

installGlobals();
