import api from "./lib/api.ts";
import { Select } from "https://deno.land/x/cliffy@v0.25.7/prompt/select.ts";

async function list(mode: "exclude" | "include") {
  const client = api();
  const list = await client.getSplitTunnelList(mode);
  console.log(list)
}

if (import.meta.main) {
  await Deno.permissions.request({ name: "net", host: "api.cloudflare.com" });
  const mode = (await Select.prompt({
    options: ["exclude", "include"],
    message: "Mode",
  })) as "exclude" | "include";
  await list(mode);
}
