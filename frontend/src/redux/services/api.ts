import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getOrCreateGuestId = () => {
  if (typeof window !== "undefined") {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem("guestId", guestId);
    }
    return guestId;
  }
};

console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("accessToken") || "";

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    uploadAndCompressAsGuest: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/image/upload-and-compress",
        method: "POST",
        body: formData,
      }),
    }),
    signup: builder.mutation<
      any,
      { userName: string; email: string; password: string }
    >({
      query: (body) => ({
        url: "/user/signup",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),
    getUserImages: builder.query<any, void>({
      query: () => ({
        url: "/image/get/userImages",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useUploadAndCompressAsGuestMutation,
  useSignupMutation,
  useLoginMutation,
  useGetUserImagesQuery,
} = api;
