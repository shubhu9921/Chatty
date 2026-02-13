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
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {}, // New state for unread counts

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
      const res = await axiosInstance.get(`/messages/${userId}`);
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
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("sendMessage error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Listen for incoming messages via Socket.IO
  // Listen for incoming messages via Socket.IO
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage"); // Remove old listeners

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, unreadMessages } = get();

      // If chat is open with this user, add message
      if (selectedUser?._id === newMessage.senderId) {
        set({ messages: [...messages, newMessage] });
      } else {
        // Otherwise increment unread count
        toast.success("New message received");
        set({
          unreadMessages: {
            ...unreadMessages,
            [newMessage.senderId]: (unreadMessages[newMessage.senderId] || 0) + 1,
          },
        });
      }
    });
  },

  // Set a user as the current chat target
  setSelectedUser: (selectedUser) => {
    set({ selectedUser, messages: [] }); // Reset messages

    if (selectedUser) {
      // Clear unread messages for this user
      set((state) => ({
        unreadMessages: {
          ...state.unreadMessages,
          [selectedUser._id]: 0,
        },
      }));
      get().getMessages(selectedUser._id); // Load messages from backend
    }
  },

  // Stop listening to messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },
}));
