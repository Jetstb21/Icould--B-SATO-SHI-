import jsPDF from "jspdf";

export function exportChecklistPdf(userName: string, score: number, gaps: any[], blueprint: any) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text(`Satoshi Comparison Report`, 14, y); y += 10;

  doc.setFontSize(14);
  doc.text(`Candidate: ${userName}`, 14, y); y += 8;
  doc.text(`Satoshi Score: ${score}/100`, 14, y); y += 12;

  doc.setFontSize(16);
  doc.text("Gap Checklist (vs Satoshi)", 14, y); y += 8;
  doc.setFontSize(11);

  if (!gaps.length) {
    doc.text("You already meet Satoshi-level targets — incredible!", 14, y);
    y += 10;
  } else {
    gaps.forEach(g => {
      const line = `${g.metric}: need +${g.delta} (you ${g.userHas}/10 → ${g.neededToReach}/10) — ${g.detail}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split, 14, y);
      y += split.length * 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  y += 10;
  doc.setFontSize(16);
  doc.text("Benchmark Qualifications (detailed)", 14, y); y += 8;
  doc.setFontSize(11);

  Object.entries(blueprint).forEach(([bench, metrics]: any) => {
    doc.setFont(undefined, "bold");
    doc.text(bench, 14, y); y += 6;
    doc.setFont(undefined, "normal");

    Object.entries(metrics).forEach(([m, tasks]: any) => {
      const line = `${m}: ${(tasks as string[]).join("; ")}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split, 18, y);
      y += split.length * 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 6;
  });

  doc.save(`${userName.replace(/\s+/g,"_")}_satoshi_report.pdf`);
}