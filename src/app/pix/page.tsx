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
import { Toaster, toast } from "sonner";
import QRCode from "qrcode";

type ApiResponse = any;

export default function PixPage() {
  const [amount, setAmount] = useState<string>("10.00");
  const [name, setName] = useState<string>("Cliente");
  const [email, setEmail] = useState<string>("user@example.com");
  const [cpf, setCpf] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<ApiResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert amount to cents (integer) — many gateways expect integer cents.
    const normalized = Number(String(amount).replace(",", "."));
    if (Number.isNaN(normalized) || normalized <= 0) {
      toast.error("Informe um valor válido maior que 0");
      return;
    }

    const cents = Math.round(normalized * 100);

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
        // Adicione campos adicionais que a Blackcat aceite, se precisar.
      };

      const res = await fetch("/api/blackcat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();
      setRawResponse(data);

      // Heurística para extrair payload / imagem / copia-e-cola:
      // 1) procura por base64 de imagem
      const maybePix = data?.pix ?? data;
      const base64Img =
        maybePix?.qrCodeBase64 ||
        maybePix?.qr_code_base64 ||
        data?.qrCodeBase64 ||
        data?.qr_code_base64;

      const payloadText =
        maybePix?.payload ||
        maybePix?.emv ||
        maybePix?.qr_code ||
        maybePix?.qrcode ||
        data?.payload ||
        data?.emv;

      const copytext =
        maybePix?.copyPaste ||
        maybePix?.copiaECola ||
        maybePix?.copia_e_cola ||
        maybePix?.copy ||
        data?.copyPaste ||
        data?.copiaECola;

      if (base64Img) {
        // If we have a base64 PNG string (without data: prefix)
        const prefix = base64Img.startsWith("data:") ? "" : "data:image/png;base64,";
        setQrDataUrl(prefix + base64Img);
      } else if (payloadText) {
        // Generate image from payload
        const url = await QRCode.toDataURL(payloadText, { margin: 1, scale: 6 });
        setQrDataUrl(url);
      }

      if (copytext) {
        setCopyPaste(copytext);
      } else {
        // look for some common paths
        setCopyPaste(
          maybePix?.qr_code_copy ||
            maybePix?.qrCopy ||
            maybePix?.qr_code ||
            null
        );
      }

      toast.success("Transação criada (verifique o resultado abaixo)");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar a transação");
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
    <div className="min-h-screen p-8">
      <Toaster />
      <div className="max-w-2xl mx-auto">
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

              <div className="flex gap-2">
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