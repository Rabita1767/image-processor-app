import socket from "@/socket/socket";
import { getUserIdFromToken } from "@/utils/util";
import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: "/token/getAccessToken", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const newAccessToken = (refreshResult.data as { data: string }).data;
      const userId = getUserIdFromToken(newAccessToken);
      localStorage.setItem("accessToken", newAccessToken);
      if (socket && socket.connected) {
        socket.io.opts.query = { userId: userId };
        socket.auth.token = newAccessToken;

        socket.disconnect();
        socket.connect();
      }

      result = await baseQuery(args, api, extraOptions);
    } else {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
  }

  return result;
};
