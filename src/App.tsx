import { useState } from "react";
import { HOSTING_SIGNATURES, detectProvider } from "./constants/signatures";
import type { HostingProvider, DNSResponse, CombinedDNSData } from "./types";

function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HostingProvider | null>(null);
  const [error, setError] = useState<string>("");
  const [dnsDebug, setDnsDebug] = useState<CombinedDNSData | null>(null);

  const getDomain = (inputUrl: string): string | null => {
    try {
      let hostname = inputUrl;
      // Append protocol if missing to make URL constructor happy
      if (!hostname.match(/^[a-zA-Z]+:\/\//)) {
        hostname = `https://${hostname}`;
      }
      const domain = new URL(hostname).hostname;
      return domain;
    } catch (e) {
      return null;
    }
  };

  const checkHosting = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setDnsDebug(null);
    setLoading(true);

    const domain = getDomain(url);
    if (!domain) {
      setError("Invalid URL format");
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch CNAME (Aliases)
      const cnameRes = await fetch(
        `https://dns.google/resolve?name=${domain}&type=CNAME`,
      );
      const cnameData: DNSResponse = await cnameRes.json();

      // 2. Fetch NS (Name Servers)
      const nsRes = await fetch(
        `https://dns.google/resolve?name=${domain}&type=NS`,
      );
      const nsData: DNSResponse = await nsRes.json();

      // 3. Fetch A (IP Address)
      const aRes = await fetch(
        `https://dns.google/resolve?name=${domain}&type=A`,
      );
      const aData: DNSResponse = await aRes.json();

      const combinedData: CombinedDNSData = {
        cname: cnameData.Answer || [],
        ns: nsData.Answer || [],
        a: aData.Answer || [],
      };

      setDnsDebug(combinedData);

      const detected = detectProvider(combinedData);

      if (detected) {
        setResult(detected);
      } else {
        // Fallback result for unknown hosts
        setResult({
          id: "unknown",
          name: "Unknown / Self-Hosted",
          icon: "/icons/unknown.svg", // Ensure you have a generic SVG for this
          color: "bg-slate-700",
          patterns: [],
          desc: "Could not match specific signatures. It might be a VPS (DigitalOcean, Linode) or a private server.",
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch DNS data. Please check your internet connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600">
            Host Detective
          </h1>
          <p className="text-slate-400">
            Enter a URL to uncover where it is hosted.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
          <form onSubmit={checkHosting} className="relative">
            <input
              type="text"
              placeholder="example.com or https://my-site.vercel.app"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-5 py-4 pr-32 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-lg placeholder:text-slate-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="absolute right-2 top-2 bottom-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 rounded-lg transition-colors"
            >
              {loading ? "Scanning..." : "Detect"}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-fade-in-up">
            <div
              className={`relative overflow-hidden rounded-2xl p-8 shadow-2xl border border-white/10 ${result.color}`}
            >
              {/* Background Pattern SVG */}
              <img
                src={result.icon}
                alt=""
                className="absolute -right-10 -top-10 w-64 h-64 opacity-10 select-none pointer-events-none object-contain"
              />

              <div className="relative z-10">
                <h2 className="text-sm uppercase tracking-widest font-bold opacity-80 mb-4">
                  Hosted on
                </h2>
                <div className="flex items-center gap-6">
                  {/* Main Icon SVG */}
                  <img
                    src={result.icon}
                    alt={`${result.name} logo`}
                    className="w-16 h-16 object-contain drop-shadow-md"
                  />
                  <h3 className="text-3xl font-bold">{result.name}</h3>
                </div>
                {result.desc && (
                  <p className="mt-4 text-white/80">{result.desc}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Supported Providers List (Optional: can remove if you don't have SVGs for all yet) */}
        {!result && !loading && (
          <div className="pt-10">
            <p className="text-center text-slate-500 text-xs uppercase tracking-widest mb-4">
              Detects signatures from
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {HOSTING_SIGNATURES.map((p) => (
                <span
                  key={p.id}
                  className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700 flex items-center gap-2"
                >
                  {/* Optional: Small icon in list */}
                  {/* <img src={p.icon} alt="" className="w-3 h-3 opacity-50"/> */}
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {dnsDebug && (
          <details className="mt-8 text-xs text-slate-500 cursor-pointer">
            <summary className="text-center mb-2 hover:text-slate-300">
              View Raw DNS Data
            </summary>
            <div className="bg-black p-4 rounded-lg overflow-auto max-h-40 font-mono">
              <pre>{JSON.stringify(dnsDebug, null, 2)}</pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default App;
