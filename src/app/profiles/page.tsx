"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProfilesDirectory() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("id,name,created_at")
          .eq("published", true)
          .order("created_at", { ascending: false });
        if (data) setRows(data);
      } catch (error) {
        console.error("Failed to load profiles:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Published Profiles</h1>
      
      {rows.length === 0 ? (
        <div className="text-gray-600">
          No published profiles yet. Be the first to share your Satoshi comparison!
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map(r => (
            <li key={r.id}>
              <Link 
                href={`/profile/${r.id}`} 
                className="text-blue-600 hover:underline block p-2 rounded hover:bg-gray-50"
              >
                {r.name || "Anonymous"} – {new Date(r.created_at).toLocaleDateString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-6">
        <Link 
          href="/" 
          className="text-gray-600 hover:text-gray-800 underline"
        >
          ← Back to main page
        </Link>
      </div>
    </div>
  );
}