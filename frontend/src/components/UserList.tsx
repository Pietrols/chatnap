import React from 'react';
import { User } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (user: User) => void;
  typingUsers: Set<string>;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  typingUsers,
}) => {
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="w-full h-full bg-card border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} user{users.length !== 1 ? 's' : ''} online
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-2 space-y-1">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                selectedUserId === user.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{user.username}</p>
                  {typingUsers.has(user.id) && (
                    <Badge variant="secondary" className="text-xs">
                      typing...
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
