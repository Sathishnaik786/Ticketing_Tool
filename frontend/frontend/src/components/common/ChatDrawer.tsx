import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { MessageCircle, X, Send, MoreVertical, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, ChatMessage as ChatMessageInterface, Conversation as ConversationInterface } from '@/services/chatService';
import { chatApi, employeesApi } from '@/services/api';
import { Employee } from '@/types';

interface User {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface LocalConversation {
  id: string;
  user: User;
  unreadCount: number;
  lastMessage?: string | null;
  lastMessageTime?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    id: string;
    name: string;
    role: string;
  };
}

export const ChatDrawer = forwardRef<any, ChatDrawerProps>(({ isOpen, onClose, targetUser }: ChatDrawerProps, ref) => {
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<LocalConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Expose openChatWithUser method to parent components
  useImperativeHandle(ref, () => ({
    openChatWithUser
  }));

  // Initialize chat service and fetch conversations
  useEffect(() => {
    if (isOpen && user) {
      // Connect to chat service
      const token = localStorage.getItem('token');
      if (token) {
        chatService.connect(user.id, token);
      }

      // Fetch conversations for the user
      fetchConversations();
    }

    return () => {
      // Disconnect from chat service when drawer closes
      if (!isOpen) {
        chatService.disconnect();
      }
    };
  }, [isOpen, user]);
  
  // Handle target user when it changes
  useEffect(() => {
    if (targetUser && isOpen && conversations.length > 0) {
      const targetConversation = conversations.find(conv => conv.user.id === targetUser.id);
      if (targetConversation) {
        setActiveConversation(targetConversation);
      } else {
        // If no conversation exists, try to open with the target user
        openChatWithUser(targetUser);
      }
    }
  }, [targetUser, conversations, isOpen]);
  
  // Public method to open chat with a specific user
  const openChatWithUser = async (targetUser: { id: string; name: string; role: string }) => {
    try {
      // Find if conversation already exists
      const existingConversation = conversations.find(conv => conv.user.id === targetUser.id);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        return;
      }
      
      // If no existing conversation, create a temporary representation
      const tempConversation: LocalConversation = {
        id: `temp-${targetUser.id}`,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          role: targetUser.role,
          status: 'online'
        },
        unreadCount: 0,
        lastMessage: null,
        lastMessageTime: undefined
      };
      setActiveConversation(tempConversation);
    } catch (error) {
      console.error('Error opening conversation:', error);
    }
  };
  
  // Function to find or create conversation with a specific user (internal)
  const findOrCreateConversation = async (targetUserId: string) => {
    try {
      // Find if conversation already exists
      const existingConversation = conversations.find(conv => conv.user.id === targetUserId);
      if (existingConversation) {
        setActiveConversation(existingConversation);
        return existingConversation;
      }
      
      // If no existing conversation, we'll let the first message create it
      // For now, create a temporary representation
      const employee = (await employeesApi.getAll({})).data.find(emp => emp.userId === targetUserId);
      if (employee) {
        const tempConversation: LocalConversation = {
          id: `temp-${targetUserId}`,
          user: {
            id: employee.userId!,
            name: `${employee.firstName} ${employee.lastName}`,
            role: employee.role,
            status: 'online'
          },
          unreadCount: 0,
          lastMessage: null,
          lastMessageTime: undefined
        };
        setActiveConversation(tempConversation);
        return tempConversation;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding or creating conversation:', error);
      return null;
    }
  };

  // Fetch conversations for the user
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const response = await chatApi.getConversations();
      
      // Fetch all employees to get real names
      const employeesResponse = await employeesApi.getAll({});
      const allEmployees = employeesResponse.data || [];
      
      // Create a map of userId to employee for quick lookup
      const employeeMap = new Map();
      allEmployees.forEach(emp => {
        if (emp.userId) {
          employeeMap.set(emp.userId, emp);
        }
      });
      
      const localConversations = response.map(conv => {
        return {
          id: conv.conversationId,
          user: {
            id: conv.user.id,
            name: conv.user.name || conv.user.email,
            role: conv.user.role || user.role,
            status: 'online' as const // Using online as default status for now
          },
          unreadCount: conv.unreadCount,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      });
      
      setConversations(localConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      
      // Fallback to fetching employees for chat options if API fails
      try {
        const employeesResponse = await employeesApi.getAll({});
        const allEmployees = employeesResponse.data || [];
        
        // Filter employees based on role-based access rules
        const allowedEmployees = allEmployees.filter((emp: Employee) => {
          if (user.role === 'ADMIN') return true;
          if (user.role === 'MANAGER') return ['HR', 'EMPLOYEE'].includes(emp.role);
          if (user.role === 'HR') return true;
          if (user.role === 'EMPLOYEE') return ['MANAGER', 'HR'].includes(emp.role);
          return false;
        }).filter(emp => emp.userId !== user.id); // Don't show current user in chat list
        
        // Create conversations with real employees
        const realConversations: LocalConversation[] = allowedEmployees
          .filter(emp => emp.userId !== undefined) // Only include employees with valid userId
          .map((emp, index) => ({
            id: `conv-${index}`,
            user: {
              id: emp.userId!, // Non-null assertion since we filtered out undefined
              name: `${emp.firstName} ${emp.lastName}`,
              role: emp.role,
              status: 'online' // In a real app, this would come from presence data
            },
            unreadCount: 0, // Real unread count would come from API
            lastMessage: null,
            lastMessageTime: undefined
          }));
        
        setConversations(realConversations);
      } catch (fallbackError) {
        console.error('Error fetching employees as fallback:', fallbackError);
        
        // If both API calls fail, use mock data
        // Mock users based on role access rules
        const mockUsers: User[] = [];
        
        if (user.role === 'ADMIN') {
          mockUsers.push(
            { id: '1', name: 'John Doe', role: 'EMPLOYEE', status: 'online' },
            { id: '2', name: 'Jane Smith', role: 'MANAGER', status: 'online' },
            { id: '3', name: 'Robert Johnson', role: 'HR', status: 'away' },
            { id: '4', name: 'Emily Davis', role: 'EMPLOYEE', status: 'offline' }
          );
        } else if (user.role === 'MANAGER') {
          mockUsers.push(
            { id: '1', name: 'John Doe', role: 'EMPLOYEE', status: 'online' },
            { id: '4', name: 'Emily Davis', role: 'EMPLOYEE', status: 'online' },
            { id: '3', name: 'Robert Johnson', role: 'HR', status: 'online' },
            { id: '5', name: 'Sarah Wilson', role: 'EMPLOYEE', status: 'away' }
          );
        } else if (user.role === 'HR') {
          mockUsers.push(
            { id: '2', name: 'Jane Smith', role: 'MANAGER', status: 'online' },
            { id: '5', name: 'Sarah Wilson', role: 'EMPLOYEE', status: 'online' },
            { id: '1', name: 'John Doe', role: 'EMPLOYEE', status: 'away' },
            { id: '6', name: 'Michael Brown', role: 'MANAGER', status: 'offline' }
          );
        } else if (user.role === 'EMPLOYEE') {
          mockUsers.push(
            { id: '2', name: 'Jane Smith', role: 'MANAGER', status: 'online' },
            { id: '3', name: 'Robert Johnson', role: 'HR', status: 'online' },
            { id: '5', name: 'Sarah Wilson', role: 'EMPLOYEE', status: 'away' }
          );
        }

        // Create mock conversations
        const mockConversations: LocalConversation[] = mockUsers.map((u, index) => ({
          id: `conv-${index}`,
          user: u,
          unreadCount: index % 3 === 0 ? 2 : 0, // Every third conversation has unread messages
          lastMessage: `Last message with ${u.name}`,
          lastMessageTime: '10:30 AM'
        }));

        setConversations(mockConversations);
      }
    }
  };

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (activeConversation && user) {
      // Fetch messages for this conversation
      fetchMessages(activeConversation.id);
      
      // Subscribe to new messages via socket
      const handleMessage = (message: ChatMessageInterface) => {
        setMessages(prev => [...prev, message]);
      };
      
      chatService.subscribeToNewMessage(handleMessage);
      
      // Cleanup: unsubscribe when leaving conversation
      return () => {
        chatService.unsubscribeFromNewMessage();
      };
    } else {
      setMessages([]);
    }
  }, [activeConversation, user]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      // Map the API response to the ChatMessageInterface format
      const mappedMessages: ChatMessageInterface[] = response.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
        receiverId: msg.receiverId,
        content: msg.message,
        timestamp: msg.createdAt,
        read: msg.isRead
      }));
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    const chatMessage: ChatMessageInterface = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name || user.email || 'You',
      receiverId: activeConversation.user.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      conversationId: activeConversation.id
    };

    // Add message to local state
    setMessages(prev => [...prev, chatMessage]);
    
    // Send message via chat service
    chatService.sendMessage(activeConversation.user.id, newMessage);
    
    setNewMessage('');

    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessage: newMessage, lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : conv
      )
    );
    
    // If this is a temporary conversation (first time chatting), refresh conversations list
    if (activeConversation.id.startsWith('temp-')) {
      await fetchConversations();
      
      // Find the actual conversation that was created and update active conversation
      const updatedConversations = await chatApi.getConversations();
      const actualConversation = updatedConversations.find(conv => conv.user.id === activeConversation.user.id);
      
      if (actualConversation) {
        const localConversation: LocalConversation = {
          id: actualConversation.conversationId,
          user: {
            id: actualConversation.user.id,
            name: actualConversation.user.name || actualConversation.user.email,
            role: actualConversation.user.role || user.role,
            status: 'online' as const
          },
          unreadCount: actualConversation.unreadCount,
          lastMessage: actualConversation.lastMessage,
          lastMessageTime: actualConversation.lastMessageTime ? new Date(actualConversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
        setActiveConversation(localConversation);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Messages</h2>
            {activeConversation && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  activeConversation.user.status === 'online' ? 'bg-green-500' :
                  activeConversation.user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm text-muted-foreground">
                  {activeConversation.user.name}
                </span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          {!activeConversation && (
            <div className="w-full flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b"
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-background ${
                        conversation.user.status === 'online' ? 'bg-green-500' :
                        conversation.user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium truncate">{conversation.user.name}</h3>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessageTime}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    
                    {conversation.unreadCount > 0 && (
                      <span className="h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat View */}
          {activeConversation && (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === user?.id
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="pr-10 resize-none"
                    />
                    <Button
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ChatDrawer;