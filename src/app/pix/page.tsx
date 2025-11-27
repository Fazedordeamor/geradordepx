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

type BlackcatResponse = {
  // flexible typing because gateway may return various shapes
  // allow any keys on pix because different gateways / responses use different names
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

export default function PixPage() {
  const [amount, setAmount] = useState<string>("10.00");
  const [name, setName] = useState<string>("Cliente");
  const [email, setEmail] = useState<string>("user@example.com");
  const [cpf, setCpf] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [expiresInDays, setExpiresInDays] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [copyPaste, setCopyPaste] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<BlackcatResponse | null>(
    null
  );
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

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
      // Build request payload following the provided documentation
      const payload = {
        amount: cents,
        currency: "BRL",
        paymentMethod: "pix",
        pix: {
          expiresInDays: Number(expiresInDays) || 1,
        },
        items: [
          {
            name: "Pagamento via site",
            quantity: 1,
            price: cents,
          },
        ],
        customer: {
          name,
          email,
          document: cpf,
          documentType: cpf && cpf.length > 11 ? "cnpj" : "cpf",
          phone,
        },
        externalRef: `app_${Date.now()}`,
        // postbackUrl could be added here if you host a webhook endpoint
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

      // Extract transaction id (several possible shapes)
      const id =
        data?.id?.toString?.() ??
        data?.transaction?.id?.toString?.() ??
        data?.data?.id?.toString?.() ??
        null;
      if (id) {
        setTransactionId(String(id));
      } else {
        // try to find any id-like field
        for (const key of ["id", "_id", "transactionId", "transaction_id"]) {
          if ((data as any)[key]) {
            setTransactionId(String((data as any)[key]));
            break;
          }
        }
      }

      // Extract copy/paste payload according to documentation:
      // Prefer payment.payload, then payment_payload, then common fields like payload, emv, qr_code
      const maybePayment = data?.payment ?? data?.pix ?? data;
      // Cast to `any` for flexible property checks (gateway responses may use different field names)
      const mp: any = maybePayment as any;
      const copytext =
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

      if (copytext) {
        setCopyPaste(copytext);
      } else {
        setCopyPaste(null);
      }

      // If the response contains a status set it
      if (data?.status) {
        setTxStatus(String(data.status));
      } else {
        setTxStatus("pending");
      }

      toast.success("Transação criada (veja copia-e-cola abaixo)");
    } catch (err) {
      console.error("Erro ao criar PIX:", err);
      toast.error("Erro ao criar a transação (ver console)");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (id?: string) => {
    const targetId = id ?? transactionId;
    if (!targetId) {
      toast.error("Nenhum ID de transação disponível para consulta");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/blackcat/${encodeURIComponent(targetId)}`, {
        method: "GET",
      });
      const data = await res.json();
      setRawResponse(data);

      if (!res.ok) {
        toast.error(data?.message || "Erro ao consultar status (ver resposta).");
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
      } else {
        toast.success("Consulta realizada (ver resposta bruta)");
      }
    } catch (err) {
      console.error("Erro ao consultar status:", err);
      toast.error("Erro ao consultar status (ver console)");
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">CPF / CNPJ</label>
                  <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Validade do PIX (dias)</label>
                <Input
                  value={String(expiresInDays)}
                  onChange={(e) => setExpiresInDays(Number(e.target.value || 1))}
                  placeholder="1"
                />
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
                    setExpiresInDays(1);
                    setCopyPaste(null);
                    setRawResponse(null);
                    setTransactionId(null);
                    setTxStatus(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {transactionId && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Transação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">ID</div>
                  <div className="font-medium">{transactionId}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{txStatus ?? "unknown"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => checkStatus()} variant="secondary" size="sm">
                    Verificar status
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
        )}

        {copyPaste && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Chave copia e cola</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">Copia e cola</label>
                <div className="flex gap-2">
                  <Input value={copyPaste} readOnly />
                  <Button onClick={() => copyToClipboard(copyPaste)} variant="secondary">
                    Copiar
                  </Button>
                </div>
              </div>
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