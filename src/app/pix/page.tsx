"use client";

import React, { useState } from "react";
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
import QRCode from "qrcode";

type BlackcatResponse = {
  // flexible typing because gateway may return various shapes
  // allow any keys on pix because different gateways / responses use different names
  pix?: { [key: string]: any } | null;
  payload?: string;
  qr_code?: string;
  qrCodeBase64?: string;
  copyPaste?: string;
  [k: string]: any;
};

export default function PixPage() {
  const [amount, setAmount] = useState<string>("10.00");
  const [name, setName] = useState<string>("Cliente");
  const [email, setEmail] = useState<string>("user@example.com");
  const [cpf, setCpf] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<BlackcatResponse | null>(
    null
  );

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
    setQrDataUrl(null);
    setCopyPaste(null);
    setRawResponse(null);

    try {
      const payload = {
        amount: cents,
        paymentMethod: "pix",
        externalReference: `app_${Date.now()}`,
        customer: {
          name,
          email,
          document: cpf,
          phone,
        },
      };

      const res = await fetch("/api/blackcat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: BlackcatResponse = await res.json();
      setRawResponse(data);

      if (!res.ok) {
        toast.error(
          data?.message || "Erro na criação da transação (ver resposta bruta)."
        );
        setLoading(false);
        return;
      }

      // Try to extract pix info
      const pix = data.pix ?? data;
      const base64Img =
        pix?.qrCodeBase64 ?? pix?.qr_code_base64 ?? data?.qrCodeBase64 ?? data?.qr_code_base64;
      const payloadText =
        pix?.payload ?? pix?.emv ?? pix?.qr_code ?? pix?.qrcode ?? data?.payload ?? data?.emv ?? data?.qr_code;
      const copytext =
        pix?.copyPaste ??
        pix?.copiaECola ??
        pix?.copia_e_cola ??
        pix?.copy ??
        data?.copyPaste ??
        data?.copiaECola ??
        data?.copia_e_cola ??
        data?.copy;

      if (base64Img) {
        const prefix = base64Img.startsWith("data:") ? "" : "data:image/png;base64,";
        setQrDataUrl(prefix + base64Img);
      } else if (payloadText) {
        const url = await QRCode.toDataURL(payloadText, { margin: 1, scale: 6 });
        setQrDataUrl(url);
      }

      if (copytext) {
        setCopyPaste(copytext);
      } else if (payloadText) {
        // some gateways expect the "payload" text is the copia e cola
        setCopyPaste(payloadText);
      }

      toast.success("Transação criada (veja resultado abaixo)");
    } catch (err) {
      // Let the error bubble in logs but notify user
      // Not catching to hide details; still notify
      console.error("Erro ao criar PIX:", err);
      toast.error("Erro ao criar a transação (ver console)");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text?: string | null) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  };

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <UIToaster />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Gerador de PIX (Blackcat)</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gerar cobrança PIX</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor (BRL)</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CPF / CNPJ</label>
                <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Gerando..." : "Gerar PIX"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setAmount("10.00");
                    setName("Cliente");
                    setEmail("user@example.com");
                    setCpf("");
                    setPhone("");
                    setQrDataUrl(null);
                    setCopyPaste(null);
                    setRawResponse(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {qrDataUrl && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <img src={qrDataUrl} alt="QR Code PIX" className="max-w-xs" />
              {copyPaste && (
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">Chave copia e cola</label>
                  <div className="flex gap-2">
                    <Input value={copyPaste} readOnly />
                    <Button onClick={() => copyToClipboard(copyPaste)} variant="secondary">
                      Copiar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter />
          </Card>
        )}

        {rawResponse && (
          <Card>
            <CardHeader>
              <CardTitle>Resposta bruta da API</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-64">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}