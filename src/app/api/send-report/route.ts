import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to, name, reportUrl } = await req.json();
    if (!to || !reportUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Reports <reports@yourdomain.com>",
        to: [to],
        subject: `Your Satoshi Comparison Report`,
        html: `
          <h2>Hi ${name || "there"},</h2>
          <p>Your report is ready.</p>
          <p><a href="${reportUrl}">Download / View your PDF</a></p>
          <p>Keep hacking,<br/>Could I Be Satoshi?</p>
        `,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: t }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}