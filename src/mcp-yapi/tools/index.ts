import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { mcpConfig } from "../../mcpConfig";

const RequestType = z.string().describe("YAPI 接口访问地址");

// 缓存登录信息
let yapiAuth: { token: string; uid: string } | null = null;
// projectId -> baseUrl 缓存
const projectBaseUrlCache: Record<string, string> = {};

interface YapiConfig {
  domain: string;
  username: string;
  password: string;
}

async function yapiLogin(domain: string, username: string, password: string) {
  const res = await fetch(`${domain}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }),
  });
  const cookies = res.headers.get("set-cookie") || "";

  const token = cookies.match(/_yapi_token=([^;]+)/);
  const uid = cookies.match(/_yapi_uid=([^;]+)/);

  if (!token || !uid) {
    throw new Error("YAPI 登录失败: 未能从 cookie 获取 token 或 uid");
  }
  yapiAuth = { token: token[1], uid: uid[1] };
}

/**
 * 根据 projectId 获取 baseUrl
 */
async function getProjectBaseUrl(domain: string, projectId: string) {
  if (projectBaseUrlCache[projectId]) {
    return projectBaseUrlCache[projectId];
  }

  const url = `${domain.replace(/\/$/, "")}/api/project/get?id=${projectId}`;
  const res = await fetch(url, {
    headers: {
      cookie: `_yapi_token=${yapiAuth?.token ?? ""}; _yapi_uid=${
        yapiAuth?.uid ?? ""
      }`,
    },
  });
  const data = await res.json();
  if (data.errcode !== 0) {
    throw new Error(`获取项目 baseUrl 失败：`, data);
  }
  const baseUrl = data.data?.basepath || "";
  projectBaseUrlCache[projectId] = baseUrl;
  return baseUrl;
}

async function getYApi(url?: string) {
  if (!url) {
    throw new Error("URL is required.");
  }
  // 提取 id 参数
  const match = url.match(/project\/(\d+)\/interface\/api\/(\d+)/);
  if (!match) {
    throw new Error("URL 中未找到 projectId 或 id 参数");
  }
  const projectId = match[1];
  const id = match[2];
  const { domain, username, password } =
    mcpConfig.config as unknown as YapiConfig;
  if (!yapiAuth?.token || !yapiAuth.uid) {
    await yapiLogin(domain, username, password);
  }

  const baseUrl = await getProjectBaseUrl(domain, projectId);

  const apiUrl = `${domain.replace(/\/$/, "")}/api/interface/get?id=${id}`;
  const apiRes = await fetch(apiUrl, {
    headers: {
      cookie: `_yapi_token=${yapiAuth!.token}; _yapi_uid=${yapiAuth!.uid}`,
    },
  });
  const apiData = await apiRes.json();

  if (apiData.errcode !== 0) {
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(apiData, null, 2) },
      ],
    };
  }

  // 识别 project 和 api 信息
  const resData = apiData.data;
  const apiPath = `${baseUrl}${resData?.path}`;
  const reqParam = resData?.req_params;
  const reqQuery = resData?.req_query;
  const reqBody = resData?.req_body_other || resData?.req_body_json_schema;
  const reqBodyType = resData?.req_body_type;
  const resBody = resData?.res_body || resData?.res_body_json_schema;
  const resBodyType = resData?.res_body_type;
  // 构造 mcp 格式
  const mcp = {
    projectId,
    apiPath,
    reqParam,
    reqQuery,
    reqBody,
    reqBodyType,
    resBody,
    resBodyType,
  };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(mcp, null, 2) }],
  };
}
export function registerGetYApiTool(server: McpServer) {
  server.tool(
    "get_yapi",
    "获取 YAPI 接口信息",
    { url: RequestType },
    async ({ url }) => getYApi(url)
  );
}
