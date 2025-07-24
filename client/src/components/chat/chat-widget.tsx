import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const quickActions = [
  { label: "État des véhicules", action: "vehicle-status" },
  { label: "Alertes maintenance", action: "maintenance-alerts" },
  { label: "Stock pièces", action: "parts-inventory" },
  { label: "Programmer maintenance", action: "schedule-maintenance" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour ! Je suis votre assistant FleetManager. Comment puis-je vous aider aujourd'hui ?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const chatMutation = useMutation({
    mutationFn: async ({ message, action }: { message?: string; action?: string }) => {
      const response = await apiRequest("POST", "/api/chat/query", { message, action });
      return response.json();
    },
    onSuccess: (data) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
  });

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    chatMutation.mutate({ message: inputValue });
    setInputValue("");
  };

  const handleQuickAction = (action: string, label: string) => {
    addUserMessage(label);
    chatMutation.mutate({ action });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14 shadow-lg"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Assistant FleetManager</h4>
                <p className="text-xs text-blue-100">En ligne</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-64 p-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.isUser ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser
                        ? "bg-primary"
                        : "bg-primary bg-opacity-10"
                    }`}
                  >
                    {message.isUser ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 max-w-xs ${
                      message.isUser
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.isUser ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.map((item) => (
                <Button
                  key={item.action}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleQuickAction(item.action, item.label)}
                  disabled={chatMutation.isPending}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 text-sm"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="flex-shrink-0 h-9 w-9"
                disabled={chatMutation.isPending || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
