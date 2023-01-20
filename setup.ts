import { ApiClient } from "./lib/api.ts";

async function setup() {
  const access_token = prompt("access_token");
  if (access_token == null) return;
  const account = prompt("account");
  if (account == null) return;
  const client = new ApiClient(access_token, account);
  const res = await client.verify();
  if (res.status !== "active") {
    console.error("Status:", res.status);
    return;
  }
  console.log(res);
  const details = await client.checkAccount();
  console.log(details);
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("account", account);
}

export default setup;

if (import.meta.main) {
  await Deno.permissions.request({ name: "net", host: "api.cloudflare.com" });
  await setup();
}
