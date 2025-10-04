import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface UserProfile {
  id: string;
  full_name: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('recipient');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(recipientId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all messages where user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();
      const userIds = new Set<string>();

      messagesData?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        userIds.add(partnerId);

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            id: partnerId,
            user_id: partnerId,
            user_name: '',
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
          });
        } else {
          const conv = conversationMap.get(partnerId)!;
          if (msg.receiver_id === user.id && !msg.is_read) {
            conv.unread_count++;
          }
        }
      });

      // Fetch user profiles
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        const profileMap: Record<string, UserProfile> = {};
        profilesData?.forEach(profile => {
          profileMap[profile.id] = profile;
        });
        setProfiles(profileMap);

        // Update conversation names
        conversationMap.forEach((conv, key) => {
          conv.user_name = profileMap[key]?.full_name || 'Utilisateur inconnu';
        });
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (partnerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation);
      fetchConversations();

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations list */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-l-4 ${
                            selectedConversation === conv.id
                              ? 'border-primary bg-muted/50'
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {conv.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">{conv.user_name}</p>
                                {conv.unread_count > 0 && (
                                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {conv.last_message}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="md:col-span-2">
              {selectedConversation ? (
                <>
                  <CardHeader>
                    <CardTitle>
                      {profiles[selectedConversation]?.full_name || 'Chargement...'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {messages.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
