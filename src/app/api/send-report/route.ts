import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { to, name, reportUrl, profileId } = await req.json();
    if (!to || !reportUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reports <reports@yourdomain.com>",
        to: [to],
        subject: "Your Satoshi Comparison Report",
        html: `<p>Hi ${name || "there"}, your report is ready: <a href="${reportUrl}">Open PDF</a></p>`,
      }),
    });
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });

    // log to Supabase
    await supabase.from("emails_sent").insert({
      to_email: to,
      name,
      report_url: reportUrl,
      profile_id: profileId ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}