import { NextResponse } from "next/server";

export function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mailory-authorization"
  );
  response.headers.set("Access-Control-Max-Age", "600");
  return response;
}

export function handleCorsOptions(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}
