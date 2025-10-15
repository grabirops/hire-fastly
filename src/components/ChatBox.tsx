import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/posthog";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  sender_name?: string;
}

interface ChatBoxProps {
  jobId: string;
}

const OFF_PLATFORM_REGEX =
  /\b(whatsapp|telegram|pix|e-mail|email|gmail|hotmail|outlook|skype|contato direto)\b/i;

export default function ChatBox({ jobId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:sender_id(name)
      `
      )
      .eq("thread_id", jobId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(
      data.map((msg) => ({
        ...msg,
        sender_name: msg.sender?.name || "Usuário",
      }))
    );
    setTimeout(scrollToBottom, 100);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getCurrentUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [jobId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !user) return;

    // A verificação de off-platform continua no cliente para feedback rápido
    if (OFF_PLATFORM_REGEX.test(newMessage)) {
      trackEvent("offplatform_communication_attempted", {
        job_id: jobId,
        user_id: user.id,
        message_content: newMessage.substring(0, 100), // Log a snippet
      });

      toast({
        title: "Comunicação Externa Detectada",
        description:
          "Para sua segurança, mantenha todas as conversas e pagamentos dentro da plataforma. Isso nos ajuda a proteger suas informações e garantir o acordo.",
        variant: "destructive",
        duration: 7000,
      });
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            thread_id: jobId, // Supondo que jobId é o thread_id
            text: newMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao enviar mensagem.");
      }

      setNewMessage("");
      // O Supabase Realtime cuidará de atualizar a UI com a nova mensagem
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle>Chat da Vaga</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }
                >
                  {msg.sender_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                <span className="text-xs text-muted-foreground mb-1">
                  {msg.sender_name}
                </span>
                <div
                  className={`rounded-lg px-4 py-2 max-w-md ${
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
