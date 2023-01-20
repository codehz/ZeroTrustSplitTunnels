// deno-lint-ignore-file ban-types
type CFApiResponse<T> =
  | {
      success: false;
      result: null;
      errors: {
        code: number;
        message: string;
      }[];
    }
  | {
      success: true;
      result: T;
      errors: never[];
      result_info: {
        page: number;
        per_page: number;
        count: number;
        total_count: number;
      };
    };

type SplitTunnelList = {
  description?: string;
  address?: string;
  host?: string;
};

export class ApiClient {
  constructor(private access_token: string, private account: string) {}

  private async fetchCFApi<T>(
    method: "GET" | "PUT" | "POST" | "DELETE" | "PATCH",
    path: string,
    payload?: {}
  ) {
    const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
      method,
      headers: {
        ...(payload != null ? { "Content-Type": "application/json" } : {}),
        Authorization: "Bearer " + this.access_token,
      },
      body: JSON.stringify(payload),
    });
    // if (res.status !== 200 && res.status !== 304) {
    //   throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    // }
    const ret: CFApiResponse<T> = await res.json();
    if (ret.success) {
      return ret.result;
    } else {
      throw new Error(
        ret.errors.map((x) => `${x.code}:${x.message}`).join("\n")
      );
    }
  }

  async verify() {
    return await this.fetchCFApi<{
      id: string;
      status: "active" | "disabled" | "expired";
      not_before: string;
      expires_on: string;
    }>("GET", "/user/tokens/verify");
  }

  async checkAccount() {
    return await this.fetchCFApi<{
      created_at: string;
      updated_at: string;
      name: string;
      auth_domain: string;
      login_design: {
        background_color: string;
        text_color: string;
        logo_path: string;
        header_text: string;
        footer_text: string;
      };
      is_ui_read_only: boolean;
    }>("GET", `/accounts/${this.account}/access/organizations`);
  }

  async getSplitTunnelList(mode: "exclude" | "include") {
    return await this.fetchCFApi<SplitTunnelList[]>(
      "GET",
      `/accounts/${this.account}/devices/policy/${mode}`
    );
  }

  async setSplitTunnelList(mode: "exclude" | "include", list: SplitTunnelList[]) {
    await this.fetchCFApi<SplitTunnelList[]>(
      "PUT",
      `/accounts/${this.account}/devices/policy/${mode}`,
      list
    );
  }
}

export default function api() {
  const token = localStorage.getItem("access_token");
  const account = localStorage.getItem("account");
  if (!token)
    throw new Error("Cannot found stored access token, please run setup first");
  if (!account)
    throw new Error("Cannot found stored account, please run setup first");
  return new ApiClient(token, account);
}
