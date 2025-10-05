import { Bell, MessageSquare, FileText, Home, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Local type matching useNotifications hook
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  action_url: string | null;
  category: string;
  is_read: boolean;
  created_at: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'messages':
      return MessageSquare;
    case 'applications':
      return FileText;
    case 'properties':
      return Home;
    case 'payments':
      return DollarSign;
    default:
      return Bell;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'messages':
      return 'Messages';
    case 'applications':
      return 'Candidatures';
    case 'properties':
      return 'Biens';
    case 'payments':
      return 'Paiements';
    case 'system':
      return 'Système';
    default:
      return 'Général';
  }
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestPermission } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    const url = notification.action_url || notification.link;
    if (url) {
      navigate(url);
    }
  };

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {
      all: notifications,
      messages: [],
      applications: [],
      properties: [],
      payments: [],
      system: [],
    };

    notifications.forEach(notif => {
      const category = notif.category || 'system';
      if (groups[category]) {
        groups[category].push(notif);
      }
    });

    return groups;
  }, [notifications]);

  const categoryUnreadCount = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(groupedNotifications).forEach(category => {
      counts[category] = groupedNotifications[category].filter(n => !n.is_read).length;
    });
    return counts;
  }, [groupedNotifications]);

  const renderNotificationItem = (notification: NotificationItem) => {
    const CategoryIcon = getCategoryIcon(notification.category || 'system');
    
    return (
      <DropdownMenuItem
        key={notification.id}
        className={`cursor-pointer p-4 ${
          !notification.is_read ? 'bg-muted/50' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex gap-3 w-full">
          <div className={`p-2 rounded-full ${!notification.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
            <CategoryIcon className={`h-4 w-4 ${!notification.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm line-clamp-1">{notification.title}</p>
              {!notification.is_read && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </div>
            {notification.message && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0"
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="all" className="text-xs">
              Tout {categoryUnreadCount.all > 0 && `(${categoryUnreadCount.all})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs">
              Messages {categoryUnreadCount.messages > 0 && `(${categoryUnreadCount.messages})`}
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              Système {categoryUnreadCount.system > 0 && `(${categoryUnreadCount.system})`}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all" className="m-0">
              {groupedNotifications.all.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                groupedNotifications.all.map(renderNotificationItem)
              )}
            </TabsContent>

            <TabsContent value="messages" className="m-0">
              {groupedNotifications.messages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun message</p>
                </div>
              ) : (
                groupedNotifications.messages.map(renderNotificationItem)
              )}
            </TabsContent>

            <TabsContent value="system" className="m-0">
              {groupedNotifications.system.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification système</p>
                </div>
              ) : (
                groupedNotifications.system.map(renderNotificationItem)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
