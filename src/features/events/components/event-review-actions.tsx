"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewEvent } from "../actions";
export function EventReviewActions({ eventId }: { eventId: string }) { const [pending, start] = useTransition(); const run = (publish: boolean) => start(async () => { await reviewEvent(eventId, publish); }); return <div className="flex gap-2"><Button size="sm" loading={pending} onClick={() => run(true)}>Publicar</Button><Button size="sm" variant="danger" disabled={pending} onClick={() => run(false)}>Rechazar</Button></div>; }
