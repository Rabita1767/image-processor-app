import { io } from "socket.io-client";

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

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || "";
  }
};

const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
  autoConnect: false,
  transports: ["websocket"],
  query: {
    userId: getOrCreateGuestId() || "guest",
  },
  auth: {
    token: getToken() || "",
  },
});

export default socket;
