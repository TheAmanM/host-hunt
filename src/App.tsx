import { useState } from "react";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { HOSTING_SIGNATURES, detectProvider } from "./constants/signatures";
import type { HostingProvider, DNSResponse, CombinedDNSData } from "./types";

const UNKNOWN_ICON = "/icon/unknown.svg";

function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HostingProvider | null>(null);
  const [error, setError] = useState<string>("");
  const [dnsDebug, setDnsDebug] = useState<CombinedDNSData | null>(null);

  const getDomain = (inputUrl: string): string | null => {
    try {
      let hostname = inputUrl.trim();
      if (!hostname.match(/^[a-zA-Z]+:\/\//)) {
        hostname = `https://${hostname}`;
      }
      const domain = new URL(hostname).hostname;
      return domain;
    } catch (e) {
      return null;
    }
  };

  const checkHosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setError("");
    setResult(null);
    setDnsDebug(null);
    setLoading(true);

    const domain = getDomain(url);
    if (!domain) {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      // Parallelize requests for speed
      const [cnameRes, nsRes, aRes] = await Promise.all([
        fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`),
        fetch(`https://dns.google/resolve?name=${domain}&type=NS`),
        fetch(`https://dns.google/resolve?name=${domain}&type=A`),
      ]);

      const cnameData: DNSResponse = await cnameRes.json();
      const nsData: DNSResponse = await nsRes.json();
      const aData: DNSResponse = await aRes.json();

      const combinedData: CombinedDNSData = {
        cname: cnameData.Answer || [],
        ns: nsData.Answer || [],
        a: aData.Answer || [],
      };

      setDnsDebug(combinedData);
      const detected = detectProvider(combinedData);

      // Small delay for visual effect
      await new Promise((r) => setTimeout(r, 600));

      if (detected) {
        setResult(detected);
      } else {
        setResult({
          id: "unknown",
          name: "Unknown / Self-Hosted",
          icon: UNKNOWN_ICON,
          color: "bg-slate-800",
          patterns: [],
          desc: "No matching signature found. This could be a private server or a VPS.",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Connection failed. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-svh flex flex-col items-center justify-center p-6 font-sans text-white overflow-hidden bg-[#0a0a0c]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1aff_2px,transparent_2px),linear-gradient(to_bottom,#1a1a1aff_2px,transparent_2px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_20%,#000_50%,transparent_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Host Hunt
          </h1>
          <p className="text-gray-400">
            Determine where any website is hosted.
          </p>
        </div>

        {/* Minimal Input Form */}
        <div className="w-full flex justify-center">
          <form
            onSubmit={checkHosting}
            className="bg-[#1a1a1a] rounded-xl relative flex items-center w-full shadow-[0_4px_8px_0px_rgba(0,0,0,0.2)] transition-all focus-within:ring-1 focus-within:ring-white/10"
          >
            <input
              type="text"
              placeholder="example.com"
              className="h-14 px-6 text-lg bg-transparent border-none grow text-white placeholder:text-[#AAA] focus:outline-none rounded-l-xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading || !url}
              className={`h-10 w-10 mr-2 rounded-lg flex items-center justify-center transition-all duration-200 
                ${!url ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100 cursor-pointer hover:bg-black/20"}`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5 text-white" />
              )}
            </button>

            {/* Error Message Absolute */}
            {error && (
              <div className="absolute -bottom-8 left-0 text-red-400 text-sm animate-fade-in pl-2">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Result Section */}
        {result && (
          <div className="animate-fade-in-up">
            <div
              className={`relative overflow-hidden rounded-2xl p-1 bg-linear-to-b from-white/10 to-transparent`}
            >
              <div
                className={`relative rounded-[15px] p-8 bg-[#151515] border border-white/5 overflow-hidden group`}
              >
                {/* Glow Effect */}
                <div
                  className={`absolute top-0 right-0 w-64 h-64 opacity-10 transition-opacity duration-700 ${result.color} blur-[80px]`}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Icon Box */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 bg-[#222] rounded-xl border border-white/5 flex items-center justify-center shadow-lg">
                      <img
                        src={result.icon}
                        alt={result.name}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-4 border-[#151515]">
                      <ShieldCheck className="w-3 h-3 text-black" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-bold text-white">
                      {result.name}
                    </h2>
                    {result.desc && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {result.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Provider Grid (Signatures) */}
        {!result && !loading && (
          <div className="pt-4 animate-fade-in opacity-50 hover:opacity-100 transition-opacity duration-500">
            <p className="text-center text-[#AAA] text-[12px] uppercase tracking-[0.2em] mb-4 font-semibold">
              Supported Signatures
            </p>
            <div className="flex flex-wrap justify-center gap-3 grayscale hover:grayscale-0 transition-all duration-500">
              {HOSTING_SIGNATURES.map((p) => (
                <div
                  key={p.id}
                  className="p-2 bg-[#1a1a1a] rounded-lg border border-white/5"
                  title={p.name}
                >
                  <img
                    src={p.icon}
                    alt={p.name}
                    className="w-5 h-5 object-contain"
                    style={{
                      filter:
                        "invert(0.5) brightness(1000%) grayscale(1) contrast(100)",
                    }}
                  />
                </div>
              ))}
              <div className="flex items-center justify-center p-2 bg-[#1a1a1a] rounded-lg border border-white/5 text-xs text-white px-3">
                + others
              </div>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {dnsDebug && (
          <div className="mt-8 pt-6">
            <details className="group text-center">
              <summary className="text-xs text-gray-600 hover:text-gray-400 cursor-pointer transition-colors list-none select-none">
                Raw DNS Data
              </summary>
              <div className="mt-4 p-4 rounded-lg bg-[#111] border border-white/5 font-mono text-[10px] text-gray-400 overflow-x-auto text-left mx-auto max-w-lg">
                <pre>{JSON.stringify(dnsDebug, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
