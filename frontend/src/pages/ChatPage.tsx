import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import { userApi } from '../services/api';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';

export const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Subscribe to socket events
  useEffect(() => {
    const unsubscribeOnline = socketService.onUserOnline((data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId ? { ...u, isOnline: true } : u
        )
      );
      if (selectedUser?.id === data.userId) {
        setSelectedUser((prev) => (prev ? { ...prev, isOnline: true } : null));
      }
    });

    const unsubscribeOffline = socketService.onUserOffline((data) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.userId
            ? { ...u, isOnline: false, lastSeen: new Date().toISOString() }
            : u
        )
      );
      if (selectedUser?.id === data.userId) {
        setSelectedUser((prev) =>
          prev
            ? { ...prev, isOnline: false, lastSeen: new Date().toISOString() }
            : null
        );
      }
    });

    const unsubscribeTyping = socketService.onTyping((data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      } else {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      unsubscribeTyping();
    };
  }, [selectedUser?.id]);

  const loadUsers = async () => {
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <UserList
                users={users}
                selectedUserId={selectedUser?.id || null}
                onSelectUser={handleSelectUser}
                typingUsers={typingUsers}
              />
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-bold text-primary">ChatNap</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {user ? getInitials(user.username) : '?'}
            </div>
            <span className="text-sm font-medium">{user?.username}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* User list - Desktop */}
        <div className="hidden lg:block w-80">
          <UserList
            users={users}
            selectedUserId={selectedUser?.id || null}
            onSelectUser={handleSelectUser}
            typingUsers={typingUsers}
          />
        </div>

        {/* Chat window */}
        <div className="flex-1">
          {selectedUser ? (
            <ChatWindow
              selectedUser={selectedUser}
              onBack={() => setSelectedUser(null)}
              isMobile={true}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Select a user to start chatting
                </p>
                <p className="text-sm text-muted-foreground">
                  {users.length} user{users.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
