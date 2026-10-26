"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API || "http://localhost:3030";

export default function BillingSettingsPage() {
  const { token } = useAuthStore();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tenant/billing`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const data = await res.json();
        setBilling(data.billing || data);
      }
    } catch {
      setBilling(null);
    } finally {
      setLoading(false);
    }
  };

  const contact = async () => {
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/tenant/billing/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message: "Upgrade inquiry" }),
      });
      if (res.ok) {
        setMessage("Request sent");
      } else {
        setMessage("Failed to send");
      }
    } catch {
      setMessage("Failed to send");
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Billing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && billing && (
          <div className="flex flex-col gap-2 text-sm">
            <div>Status: {billing.status || billing.tenant?.status}</div>
            <div>Plan: {billing.plan || "TRIAL"}</div>
            <div>Trial expires: {billing.trialExpiresAt || "-"}</div>
            <div>Grace period ends: {billing.gracePeriodEndsAt || "-"}</div>
            <div>Seats: {billing.seatCount || billing.tenant?.seatCount || 0}</div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={contact}>
            Contact support to upgrade
          </Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
