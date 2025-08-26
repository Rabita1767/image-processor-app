import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery, baseQueryWithReauth } from "./baseQuery"; // no reauth
import { ILoginResponse } from "@/types/types";

export const api = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    // default to baseQueryWithReauth unless overridden in endpoint
    return baseQueryWithReauth(args, api, extraOptions);
  },
  endpoints: (builder) => ({
    // Guest upload & compress (reauth required)
    uploadAndCompressAsGuest: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/image/upload-and-compress",
        method: "POST",
        body: formData,
      }),
    }),

    // Signup (no reauth)
    signup: builder.mutation<
      any,
      { userName: string; email: string; password: string }
    >({
      queryFn: async (body, api, extraOptions) =>
        baseQuery(
          {
            url: "/user/signup",
            method: "POST",
            body,
          },
          api,
          extraOptions
        ),
    }),

    // Login (no reauth)
    login: builder.mutation<any, { email: string; password: string }>({
      queryFn: async (body, api, extraOptions) => {
        const response = await baseQuery(
          {
            url: "/user/login",
            method: "POST",
            body,
          },
          api,
          extraOptions
        );
        const data = response.data as ILoginResponse;
        if (data?.result?.accessToken) {
          localStorage.setItem("accessToken", data?.result?.accessToken);
        }
        return response;
      },
    }),

    // Get user images (reauth required)
    getUserImages: builder.query<any, void>({
      query: () => ({
        url: "/image/get/userImages",
        method: "GET",
      }),
    }),
    // Upload image (reauth required)
    uploadImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/image/uploadImage",
        method: "POST",
        body: formData,
      }),
    }),

    // Bulk upload images (reauth required)
    bulkUploadImage: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/image/bulkUploadImage",
        method: "POST",
        body: formData,
      }),
    }),

    // compressImage (reauth required)
    compressImage: builder.mutation<any, { imageId: string; payload: any }>({
      query: ({ imageId, payload }) => ({
        url: `/image/compress/${imageId}`,
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useUploadAndCompressAsGuestMutation,
  useSignupMutation,
  useLoginMutation,
  useGetUserImagesQuery,
  useUploadImageMutation,
  useCompressImageMutation,
  useBulkUploadImageMutation,
} = api;
