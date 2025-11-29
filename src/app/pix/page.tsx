"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Toaster as UIToaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import TypingTitle from "@/components/typing-title";
import { ChevronDown, ChevronUp, MapPin, ShieldAlert, BadgeDollarSign } from "lucide-react";

// --- Types ---
type BlackcatResponse = {
  pix?: { [key: string]: any } | null;
  payment?: { qrCode?: string; payload?: string } | null;
  id?: string | number;
  status?: string;
  payload?: string;
  qr_code?: string;
  qrCodeBase64?: string;
  copyPaste?: string;
  [k: string]: any;
};

type IpInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
};

// --- Login Users Data ---
const USERS = [
  { id: 'jota', name: 'Jota', emoji: '👨‍💻' },
  { id: 'russo', name: 'Russo', emoji: '🇷🇺' },
  { id: 'rj', name: 'RJ', emoji: '💣' },
];

export default function PixPage() {
  // --- Login State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);

  // --- Generator State ---
  // Hardcoded defaults as requested
  const [amount, setAmount] = useState<string>("");
  const [name, setName] = useState<string>("Cliente");
  const [email, setEmail] = useState<string>("Cliente@email.com");
  const [cpf, setCpf] = useState<string>("33236600802");
  const [phone, setPhone] = useState<string>("11999999999");
  
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<BlackcatResponse | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Fetch IP info on mount
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setIpInfo({
          ip: data.ip,
          city: data.city,
          region: data.region_code,
          country: data.country_name
        });
      })
      .catch(err => console.error("Failed to fetch IP", err));
  }, []);

  // --- Handlers ---
  const handleLogin = (userId: string) => {
    setCurrentUser(userId);
    // Add a small delay for effect
    setTimeout(() => setIsLoggedIn(true), 500);
  };

  const parseAmountToCents = (value: string) => {
    const normalized = Number(String(value).replace(",", "."));
    if (Number.isNaN(normalized) || normalized <= 0) return null;
    return Math.round(normalized * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cents = parseAmountToCents(amount);
    if (cents === null) {
      toast.error("Informe um valor válido maior que 0");
      return;
    }

    setLoading(true);
    setCopyPaste(null);
    setRawResponse(null);
    setTransactionId(null);
    setTxStatus(null);

    try {
      const payload = {
        amount: cents,
        currency: "BRL",
        paymentMethod: "pix",
        pix: {
          expiresInDays: Number(expiresInDays) || 1,
        },
        items: [
          {
            title: "Pagamento via site",
            quantity: 1,
            unitPrice: cents,
            tangible: false,
          },
        ],
        customer: {
          name,
          email,
          document: {
            type: cpf && cpf.length > 11 ? "cnpj" : "cpf",
            number: cpf || undefined,
          },
          phone,
        },
        externalRef: `app_${Date.now()}`,
      };

      const res = await fetch("/api/blackcat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: BlackcatResponse = await res.json();
      setRawResponse(data);

      if (!res.ok) {
        toast.error(data?.message || "Erro na criação da transação.");
        setLoading(false);
        return;
      }

      // ID Extraction
      const id =
        data?.id?.toString?.() ??
        data?.transaction?.id?.toString?.() ??
        data?.data?.id?.toString?.() ??
        null;
      if (id) setTransactionId(String(id));

      // CopyPaste Extraction
      const maybePayment = data?.payment ?? data?.pix ?? data;
      const mp: any = maybePayment as any;
      const copytext =
        mp?.qrcode ??
        mp?.payload ??
        mp?.payment_payload ??
        mp?.copyPaste ??
        mp?.copiaECola ??
        mp?.copia_e_cola ??
        mp?.copy ??
        data?.payload ??
        data?.emv ??
        data?.qr_code ??
        null;

      if (copytext) setCopyPaste(copytext);
      if (data?.status) setTxStatus(String(data.status));
      else setTxStatus("pending");

      toast.success("Transação criada com sucesso!");
    } catch (err) {
      console.error("Erro ao criar PIX:", err);
      toast.error("Erro ao criar a transação");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (id?: string) => {
    const targetId = id ?? transactionId;
    if (!targetId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/blackcat/${encodeURIComponent(targetId)}`, {
        method: "GET",
      });
      const data = await res.json();
      setRawResponse(data);

      if (!res.ok) {
        toast.error("Erro ao consultar status.");
        return;
      }

      const status =
        data?.status ??
        data?.transaction?.status ??
        data?.data?.status ??
        data?.payment?.status ??
        null;

      if (status) {
        setTxStatus(String(status));
        toast.success(`Status: ${String(status)}`);
      }
    } catch (err) {
      toast.error("Erro ao consultar status");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text?: string | null) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  // --- Renders ---

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-foreground">
        <div className="flex justify-center mb-8">
           <img
            src="/logo-los-hermanos.png"
            alt="Los Hermanos Logo"
            className="h-32 w-auto drop-shadow-[0_0_20px_rgba(255,140,65,0.6)] animate-pulse"
          />
        </div>
        
        <Card className="w-full max-w-md bg-background/60 backdrop-blur-md border-primary/50 shadow-[0_0_30px_rgba(255,140,65,0.15)]">
          <CardHeader>
            <CardTitle className="font-orbitron text-center text-2xl text-primary">IDENTIFIQUE-SE</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            {USERS.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                className="h-16 text-lg border-primary/30 hover:bg-primary/20 hover:border-primary hover:text-primary transition-all duration-300 group"
                onClick={() => handleLogin(user.id)}
              >
                <span className="mr-3 text-2xl group-hover:scale-125 transition-transform">{user.emoji}</span>
                <span className="font-orbitron tracking-wider">{user.name}</span>
              </Button>
            ))}
          </CardContent>
          <CardFooter className="flex-col gap-2 pt-4 border-t border-primary/10">
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              {ipInfo ? (
                <span>Seu IP é: <span className="text-primary">{ipInfo.ip}</span></span>
              ) : (
                <span className="animate-pulse">Localizando...</span>
              )}
            </div>
            {ipInfo && (
              <div className="text-xs text-muted-foreground font-mono">
                Localização aproximada: {ipInfo.city}, {ipInfo.region}
              </div>
            )}
            <div className="text-[10px] text-red-400/80 mt-2 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              Sempre verifique se está usando 4G para sua segurança.
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 text-foreground">
      <UIToaster />
      <div className="max-w-3xl mx-auto animate-fade-in-slow">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-los-hermanos.png"
            alt="Los Hermanos Logo"
            className="h-24 w-auto drop-shadow-[0_0_12px_rgba(255,140,65,0.45)]"
          />
        </div>
        <TypingTitle text="Los hermanos - Emissor de pix" className="mb-6 text-center" />

        <Card className="mb-6 bg-background/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="font-orbitron text-center">Gerar Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Amount Input - The Hero */}
              <div className="relative group">
                <label className="block text-sm font-orbitron text-primary mb-2 text-center uppercase tracking-widest">
                  Valor a receber
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/80 pointer-events-none">
                    <BadgeDollarSign className="w-8 h-8" />
                  </div>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-14 h-20 text-4xl font-bold bg-background/50 border-primary/60 focus-visible:ring-neon-purple text-center tracking-widest shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xl pointer-events-none">
                    BRL
                  </div>
                </div>
              </div>

              {/* Collapsible Client Details */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientDetails(!showClientDetails)}
                  className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mx-auto"
                >
                  {showClientDetails ? "Ocultar dados do cliente" : "Alterar dados do cliente?"}
                  {showClientDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {showClientDetails && (
                  <div className="mt-4 grid gap-4 p-4 border border-primary/20 rounded-md bg-black/20 animate-accordion-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-primary/80">Nome</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background/40" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-primary/80">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-primary/80">CPF</label>
                        <Input value={cpf} onChange={(e) => setCpf(e.target.value)} className="bg-background/40" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-primary/80">Telefone</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background/40" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 text-lg font-orbitron bg-primary/90 hover:bg-primary hover:shadow-[0_0_20px_rgba(255,140,65,0.4)] transition-all duration-300"
              >
                {loading ? "PROCESSANDO..." : "GERAR PIX AGORA"}
              </Button>

            </form>
          </CardContent>
        </Card>

        {transactionId && (
          <Card className="mb-4 bg-background/80 backdrop-blur-sm border-primary/50 animate-fade-in-slow">
            <CardHeader className="pb-2">
              <CardTitle className="font-orbitron text-sm uppercase text-muted-foreground">ID da Transação</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="font-mono text-lg text-primary">{transactionId}</div>
              <div className={`px-3 py-1 rounded text-xs font-bold uppercase ${txStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {txStatus ?? "unknown"}
              </div>
              <Button onClick={() => checkStatus()} variant="secondary" size="sm" className="ml-2">
                Verificar
              </Button>
            </CardContent>
          </Card>
        )}

        {copyPaste && (
          <Card className="mb-4 bg-background/80 backdrop-blur-sm border-primary/50 animate-fade-in-slow">
            <CardHeader>
              <CardTitle className="font-orbitron text-center text-primary">Chave Copia e Cola</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <div className="flex gap-2">
                  <Input value={copyPaste} readOnly className="font-mono text-xs bg-black/40 border-primary/30" />
                  <Button onClick={() => copyToClipboard(copyPaste)} className="bg-neon-purple hover:bg-neon-purple/80 text-white min-w-[100px]">
                    Copiar
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3 animate-pulse">
                  Copie o código acima e pague no app do seu banco.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug area - kept hidden/small unless needed */}
        {rawResponse && (
          <div className="mt-8 opacity-40 hover:opacity-100 transition-opacity">
            <pre className="text-[10px] overflow-hidden max-h-0 hover:max-h-64 transition-all">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}