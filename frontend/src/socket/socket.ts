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

const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
  autoConnect: false,
  transports: ["websocket"],
  query: {
    userId: getOrCreateGuestId() || "guest",
  },
});

export default socket;
