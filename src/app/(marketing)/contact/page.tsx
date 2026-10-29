"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API || "http://localhost:3030"}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      setStatus("success");
      (event.currentTarget as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-32">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Contact
          </h1>
          <p className="max-w-md text-lg text-pretty text-muted-foreground">
            Have questions about Clasp Workspace or want to discuss your workspace setup? Send us a message.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Support: support@claspworkspace.com</p>
            <p>General: hello@claspworkspace.com</p>
          </div>
        </div>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>We&apos;ll get back to you as soon as we can.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={6} required />
              </div>
              <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending..." : "Send message"}
              </Button>
              {status === "success" && (
                <p className="text-sm text-muted-foreground">Message sent successfully.</p>
              )}
              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
