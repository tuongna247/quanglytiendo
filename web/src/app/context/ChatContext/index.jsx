'use client';
import { createContext, useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import apiClient from '@/app/lib/apiClient';

export const ChatContext = createContext({
  conversations: [],
  selectedChat: null, // { partnerId, partnerName, partnerUsername, partnerAvatarColor, messages[] }
  currentUser: null,
  chatSearch: '',
  loading: true,
  typing: false,
  unreadTotal: 0,
  setChatSearch: () => {},
  selectChat: () => {},
  sendMessage: () => {},
  refreshConversations: () => {},
});

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatSearch, setChatSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const connectionRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await apiClient.get('/api/chat/conversations');
      setConversations(Array.isArray(data) ? data : []);
      const total = Array.isArray(data) ? data.reduce((s, c) => s + (c.unreadCount || 0), 0) : 0;
      setUnreadTotal(total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    apiClient.get('/api/auth/me').then(data => { if (data) setCurrentUser(data); }).catch(() => {});
  }, [fetchConversations]);

  // Connect SignalR
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qlTD_token') : '';
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/chat?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (msg) => {
      // Update messages if this conversation is open
      setSelectedChat(prev => {
        if (!prev) return prev;
        const meId = currentUser?.id;
        const relevant =
          (msg.senderId === prev.partnerId && msg.receiverId === meId) ||
          (msg.senderId === meId && msg.receiverId === prev.partnerId);
        if (!relevant) return prev;
        if (prev.messages?.some(m => m.id === msg.id)) return prev;
        return { ...prev, messages: [...(prev.messages || []), msg] };
      });

      // Refresh conversation list (last message + unread count)
      fetchConversations();
    });

    connection.on('MessageUpdated', (updated) => {
      setSelectedChat(prev => {
        if (!prev) return prev;
        return { ...prev, messages: (prev.messages || []).map(m => m.id === updated.id ? { ...m, content: updated.content, isEdited: true } : m) };
      });
    });

    connection.on('MessageDeleted', (deleted) => {
      setSelectedChat(prev => {
        if (!prev) return prev;
        return { ...prev, messages: (prev.messages || []).map(m => m.id === deleted.id ? { ...m, isDeleted: true, content: '' } : m) };
      });
    });

    connection.on('UserTyping', (senderId) => {
      setSelectedChat(prev => {
        if (prev?.partnerId === senderId) {
          setTyping(true);
          clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTyping(false), 3000);
        }
        return prev;
      });
    });

    connection.start()
      .then(() => { connectionRef.current = connection; })
      .catch(err => console.warn('SignalR connect error:', err));

    return () => {
      connection.stop();
      clearTimeout(typingTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChat = useCallback(async (conv) => {
    setSelectedChat({ ...conv, messages: [] });
    setTyping(false);
    try {
      const msgs = await apiClient.get(`/api/chat/history/${conv.partnerId}`);
      setSelectedChat(prev => prev?.partnerId === conv.partnerId
        ? { ...prev, messages: Array.isArray(msgs) ? msgs : [] }
        : prev
      );
      // Mark as read in sidebar
      setConversations(prev => prev.map(c =>
        c.partnerId === conv.partnerId ? { ...c, unreadCount: 0 } : c
      ));
      setUnreadTotal(prev => Math.max(0, prev - (conv.unreadCount || 0)));
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !selectedChat || !connectionRef.current) return;
    try {
      await connectionRef.current.invoke('SendMessage', selectedChat.partnerId, text.trim());
    } catch (err) {
      console.error('Send error:', err);
    }
  }, [selectedChat]);

  const sendTyping = useCallback(async () => {
    if (!selectedChat || !connectionRef.current) return;
    try {
      await connectionRef.current.invoke('Typing', selectedChat.partnerId);
    } catch { /* ignore */ }
  }, [selectedChat]);

  return (
    <ChatContext.Provider value={{
      conversations,
      selectedChat,
      currentUser,
      chatSearch,
      loading,
      typing,
      unreadTotal,
      setChatSearch,
      selectChat,
      sendMessage,
      sendTyping,
      refreshConversations: fetchConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
