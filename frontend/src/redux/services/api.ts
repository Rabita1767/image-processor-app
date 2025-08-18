import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Guest upload & compress
    uploadAndCompressAsGuest: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/image/upload-and-compress",
        method: "POST",
        body: formData,
      }),
    }),

    // Signup
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

    // Login
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
      // Optionally transform response to store accessToken only
      transformResponse: (response: any) => {
        if (response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);
        }
        return response;
      },
    }),

    // Get user images (protected endpoint)
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
