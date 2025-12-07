// frontend/src/store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch all users for sidebar
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users"); // backend route
      set({ users: res.data });
    } catch (error) {
      console.error("getUsers error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages for a selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("getMessages error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send a new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.post(`/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("sendMessage error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Listen for incoming messages via Socket.IO
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage"); // Remove old listeners
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  // Set a user as the current chat target
  setSelectedUser: (selectedUser) => {
    const { unsubscribeFromMessages, subscribeToMessages } = get();

    unsubscribeFromMessages();           // Clean previous listener
    set({ selectedUser, messages: [] }); // Reset messages
    subscribeToMessages();               // Subscribe to new user's messages
    get().getMessages(selectedUser._id); // Load messages from backend
  },

  // Stop listening to messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
