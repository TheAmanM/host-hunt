import { useState } from "react";
import {
  ShieldCheck,
  Loader2,
  ArrowRight,
  Network,
  Globe2,
  Fingerprint,
  Clock,
} from "lucide-react";
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

  const getDetectionDetails = () => {
    if (!dnsDebug) return null;

    // 1. Get IP
    const ip = dnsDebug.a?.[0]?.data || "Hidden / N/A";

    // 2. Get Name Server (Controller)
    let ns = dnsDebug.ns?.[0]?.data || "Unknown";
    if (ns.endsWith(".")) ns = ns.slice(0, -1); // Remove trailing dot

    // 3. Get TTL (Time To Live)
    const ttlRaw = dnsDebug.a?.[0]?.TTL || dnsDebug.cname?.[0]?.TTL || 0;
    const ttl = ttlRaw > 0 ? `${ttlRaw}s` : "Dynamic";

    // 4. Find the specific string that caused the match
    let matchedPattern = "Analysis";
    if (result && result.patterns.length > 0) {
      const allDnsString = JSON.stringify(dnsDebug).toLowerCase();
      // Find which pattern from the provider exists in the DNS data
      const found = result.patterns.find((p) => allDnsString.includes(p));
      if (found) matchedPattern = found;
    }

    return { ip, ns, ttl, matchedPattern };
  };

  const specs = getDetectionDetails();

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
        {result && specs && (
          <div className="w-full animate-fade-in-up mt-8">
            <div className="relative w-full rounded-2xl p-px bg-linear-to-b from-white/10 to-transparent">
              {/* Main Card Container */}
              <div className="relative rounded-2xl bg-[#151515] overflow-hidden">
                {/* Dynamic Glow Background (Provider Color) */}
                <div
                  className={`absolute -top-24 -right-24 w-64 h-64 opacity-20 transition-all duration-1000 ${result.color} blur-[100px] pointer-events-none`}
                />

                <div className="relative z-10 p-6 md:p-8">
                  {/* Top Section: Header & Actions */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-white/5">
                    {/* Icon Container */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 bg-[#1a1a1a] rounded-xl border border-white/5 flex items-center justify-center shadow-inner relative overflow-hidden group">
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${result.color}`}
                        />
                        <img
                          src={result.icon}
                          alt={result.name}
                          className="w-12 h-12 object-contain relative z-10 drop-shadow-sm"
                        />
                      </div>

                      {/* Verification Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-[#151515] rounded-full p-1">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>VERIFIED</span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Status */}
                    <div className="grow space-y-1 text-center md:text-left">
                      <h2 className="max-md:text-left text-3xl font-bold text-white tracking-tight">
                        {result.name}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Infrastructure
                        </span>
                        <span className="text-gray-700 hidden md:inline">
                          •
                        </span>
                        <span className="hidden md:inline">
                          DNS Fingerprint Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Description */}
                  <div className="py-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                      Overview
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-2xl">
                      {result.desc ||
                        "This provider was identified based on public DNS records associated with the domain."}
                    </p>
                  </div>

                  {/* Bottom Section: REAL Technical Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* Spec Item 1: IP Address */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Network className="w-3 h-3" /> Server IP
                      </div>
                      <div
                        className="text-sm font-mono text-cyan-400 truncate"
                        title={specs.ip}
                      >
                        {specs.ip}
                      </div>
                    </div>

                    {/* Spec Item 2: Name Server */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Globe2 className="w-3 h-3" /> DNS Authority
                      </div>
                      <div
                        className="text-sm font-mono text-purple-400 truncate"
                        title={specs.ns}
                      >
                        {specs.ns}
                      </div>
                    </div>

                    {/* Spec Item 3: Match Evidence */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" /> Match Signature
                      </div>
                      <div
                        className="text-sm font-mono text-emerald-400 truncate"
                        title={`Matched pattern: ${specs.matchedPattern}`}
                      >
                        {specs.matchedPattern}
                      </div>
                    </div>

                    {/* Spec Item 4: TTL */}
                    <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> TTL Cache
                      </div>
                      <div className="text-sm font-mono text-white">
                        {specs.ttl}
                      </div>
                    </div>
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
