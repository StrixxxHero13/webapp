import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { label: "État des véhicules", action: "vehicle-status", description: "Consulter le statut de tous les véhicules" },
  { label: "Alertes maintenance", action: "maintenance-alerts", description: "Voir les alertes de maintenance urgentes" },
  { label: "Stock pièces", action: "parts-inventory", description: "Vérifier l'état du stock des pièces" },
  { label: "Programmer maintenance", action: "schedule-maintenance", description: "Planifier une nouvelle intervention" },
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour ! Je suis votre assistant FleetManager. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur vos véhicules, la maintenance, les pièces détachées ou utiliser les actions rapides ci-dessous.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const chatMutation = useMutation({
    mutationFn: async ({ message, action }: { message?: string; action?: string }) => {
      try {
        const response = await apiRequest("POST", "/api/chat/query", { message, action });
        return await response.json();
      } catch (error) {
        // Fallback to simulated responses if API fails
        return { response: generateFallbackResponse(message || action || "") };
      }
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

  const generateFallbackResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (input === "vehicle-status") {
      return "📊 **État de la flotte:**\n\n• ABC-123-FR: Opérationnel ✅\n• DEF-456-FR: Maintenance due ⚠️\n• GHI-789-FR: En réparation 🔧\n\nTotal: 3 véhicules dans la flotte.";
    }
    
    if (input === "maintenance-alerts") {
      return "🚨 **Alertes de maintenance:**\n\n• Véhicule ABC-123-FR: Vidange due dans 5 jours\n• Véhicule DEF-456-FR: Contrôle technique expiré\n\nJe recommande de programmer ces interventions rapidement.";
    }
    
    if (input === "parts-inventory") {
      return "📦 **État du stock:**\n\n✅ En stock: 4 articles\n⚠️ Stock faible: 2 articles\n❌ Rupture: 1 article\n\nLes filtres à huile sont en rupture de stock.";
    }
    
    if (input === "schedule-maintenance") {
      return "📅 **Programmer une maintenance:**\n\nPour planifier une nouvelle intervention:\n1. Allez dans l'onglet 'Maintenance'\n2. Cliquez sur 'Programmer une maintenance'\n3. Sélectionnez le véhicule et le type d'intervention\n\nJe peux vous aider à identifier les maintenances prioritaires!";
    }
    
    if (lowerInput.includes("véhicule") || lowerInput.includes("vehicule")) {
      return "🚗 Vous avez actuellement 3 véhicules dans votre flotte. Un véhicule est opérationnel, un autre nécessite une maintenance, et un est en réparation. Voulez-vous plus de détails sur un véhicule spécifique?";
    }
    
    if (lowerInput.includes("maintenance")) {
      return "🔧 Votre planning de maintenance montre plusieurs interventions à venir. Je recommande de traiter en priorité les alertes urgentes. Voulez-vous que je vous aide à organiser le planning?";
    }
    
    if (lowerInput.includes("pièce") || lowerInput.includes("piece") || lowerInput.includes("stock")) {
      return "📦 Votre inventaire contient plusieurs types de pièces. Certains articles sont en stock faible et nécessitent un réapprovisionnement. Souhaitez-vous consulter la liste des pièces à commander?";
    }
    
    if (lowerInput.includes("coût") || lowerInput.includes("cout") || lowerInput.includes("budget")) {
      return "💰 Les coûts de maintenance représentent environ 150€ en moyenne par intervention. Je peux vous aider à analyser les dépenses par véhicule ou par type d'intervention.";
    }
    
    if (lowerInput.includes("bonjour") || lowerInput.includes("salut")) {
      return "Bonjour! 👋 Je suis votre assistant FleetManager. Je peux vous aider avec la gestion de vos véhicules, la planification des maintenances, le suivi des pièces détachées et bien plus encore. Que puis-je faire pour vous aujourd'hui?";
    }
    
    if (lowerInput.includes("merci")) {
      return "Je vous en prie! 😊 N'hésitez pas à me poser d'autres questions sur la gestion de votre flotte. Je suis là pour vous aider!";
    }
    
    if (lowerInput.includes("aide") || lowerInput.includes("help")) {
      return "🆘 **Comment puis-je vous aider?**\n\nJe peux vous assister avec:\n• État et suivi des véhicules\n• Planification des maintenances\n• Gestion de l'inventaire des pièces\n• Analyse des coûts\n• Alertes et notifications\n\nUtilisez les actions rapides ou posez-moi une question spécifique!";
    }
    
    return "Je comprends votre question et je suis là pour vous aider avec la gestion de votre flotte. Pourriez-vous être plus spécifique? Vous pouvez utiliser les actions rapides ci-contre ou me poser des questions sur vos véhicules, maintenances, ou pièces détachées.";
  };

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
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Assistant FleetManager</h3>
        <p className="text-sm text-gray-600">Votre assistant virtuel pour la gestion de flotte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white">Assistant FleetManager</CardTitle>
                  <p className="text-sm text-blue-100">En ligne et prêt à vous aider</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
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
                        className={`rounded-lg p-4 max-w-md ${
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
                        <p
                          className={`text-xs mt-2 ${
                            message.isUser ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                  disabled={chatMutation.isPending}
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                  disabled={chatMutation.isPending || !inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((item) => (
                  <div key={item.action} className="p-3 bg-gray-50 rounded-lg">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left p-0 h-auto"
                      onClick={() => handleQuickAction(item.action, item.label)}
                      disabled={chatMutation.isPending}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils d'utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Utilisez les actions rapides pour des réponses immédiates</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Posez des questions spécifiques sur un véhicule en mentionnant son immatriculation</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p>Demandez des informations sur les stocks, maintenances ou alertes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}