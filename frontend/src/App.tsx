import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Link2,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCircle,
} from "lucide-react";

import { Avatar } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { api, ApiError, type AnalyticsResponse, type ShortLink } from "./lib/api";
import { formatDate, getInitials } from "./lib/utils";
import { useAuth } from "./context/auth-context";

type View = "dashboard" | "urls" | "analytics" | "profile";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
}

function LandingPage() {
  const [error, setError] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold">KubeShort</span>
          </div>
          <Badge variant="outline">Version 2</Badge>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-emerald-100 text-emerald-800">
              Production-ready backend, polished frontend
            </Badge>
            <h1 className="text-balance text-5xl font-semibold leading-tight tracking-normal text-slate-950 md:text-7xl">
              Short links with the control panel they deserve.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Create branded short URLs, manage expiration, copy links quickly,
              and inspect analytics from one responsive dashboard backed by the
              existing Express, Prisma, PostgreSQL, and Redis API.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GoogleLoginButton onError={setError} />
              <a
                href={`${api.baseUrl}/api/v1/health`}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-accent"
              >
                API health
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            {error ? (
              <p className="mt-4 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl bg-slate-200" />
            <Card className="overflow-hidden rounded-lg shadow-soft">
              <div className="border-b border-border bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">Live workspace</p>
                    <h2 className="text-xl font-semibold">URL operations</h2>
                  </div>
                  <Activity className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <div className="space-y-5 p-5">
                {[
                  ["Create URL", "Custom aliases and optional expiration"],
                  ["Manage links", "Copy, delete, and inspect ownership"],
                  ["Analytics", "Recent clicks and total activity"],
                ].map(([title, copy]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-sm text-muted-foreground">{copy}</p>
                    </div>
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function GoogleLoginButton({ onError }: { onError: (message: string) => void }) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const { loginWithGoogleToken } = useAuth();

  useEffect(() => {
    if (!googleClientId) {
      onError("Set VITE_GOOGLE_CLIENT_ID before using Google login.");
      return;
    }

    const scriptId = "google-identity-services";

    const renderButton = () => {
      if (!buttonRef.current || !window.google) {
        return;
      }

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            onError("Google did not return an ID token.");
            return;
          }

          try {
            await loginWithGoogleToken(response.credential);
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : "Google login failed."
            );
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: 260,
      });
    };

    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () => onError("Google login script could not load.");
    document.head.appendChild(script);
  }, [loginWithGoogleToken, onError]);

  return (
    <div
      ref={buttonRef}
      className="min-h-11"
      aria-label="Sign in with Google"
    />
  );
}

function Dashboard() {
  const { session, logout } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [urls, setUrls] = useState<ShortLink[]>([]);
  const [selectedUrlId, setSelectedUrlId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [form, setForm] = useState({
    originalUrl: "",
    customAlias: "",
    expiresAt: "",
  });

  const token = session?.accessToken || "";
  const selectedUrl = useMemo(
    () => urls.find((url) => url.id === selectedUrlId) || urls[0],
    [selectedUrlId, urls]
  );

  const totalClicks = analytics?.totalClicks ?? 0;
  const activeUrls = urls.filter((url) => !isExpired(url.expiresAt)).length;

  const loadUrls = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const nextUrls = await api.listUrls(token);
      setUrls(nextUrls);
      setSelectedUrlId((current) => current || nextUrls[0]?.id || null);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (id?: string, openAnalyticsView = false) => {
    const analyticsId = id || selectedUrl?.id;

    if (!analyticsId || !token) {
      setAnalytics(null);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const nextAnalytics = await api.analytics(analyticsId, token);
      setAnalytics(nextAnalytics);
      setSelectedUrlId(analyticsId);
      if (openAnalyticsView) {
        setView("analytics");
      }
    } catch (analyticsError) {
      setError(getErrorMessage(analyticsError));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadUrls();
  }, [token]);

  useEffect(() => {
    if (selectedUrl?.id) {
      void loadAnalytics(selectedUrl.id);
    }
  }, [selectedUrl?.id]);

  const createUrl = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const created = await api.createUrl(
        {
          originalUrl: form.originalUrl,
          customAlias: form.customAlias || undefined,
          expiresAt: form.expiresAt
            ? new Date(form.expiresAt).toISOString()
            : undefined,
        },
        token
      );
      setForm({ originalUrl: "", customAlias: "", expiresAt: "" });
      setUrls((current) => [created, ...current]);
      setSelectedUrlId(created.id);
      setMessage("Short URL created.");
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setBusy(false);
    }
  };

  const deleteUrl = async (id: string) => {
    setBusy(true);
    setError("");

    try {
      await api.deleteUrl(id, token);
      setUrls((current) => current.filter((url) => url.id !== id));
      setSelectedUrlId((current) => (current === id ? null : current));
      setMessage("Short URL deleted.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  };

  const copyUrl = async (url: ShortLink) => {
    const value = getShortUrl(url);
    await navigator.clipboard.writeText(value);
    setCopiedId(url.id);
    window.setTimeout(() => setCopiedId(""), 1600);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">KubeShort</h1>
              <p className="text-sm text-muted-foreground">
                {api.baseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar
              src={session?.user.avatarUrl}
              fallback={getInitials(session?.user.name, session?.user.email)}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                {session?.user.name || "Signed in"}
              </p>
              <p className="text-xs text-muted-foreground">
                {session?.user.email}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <nav className="grid gap-2">
              {[
                ["dashboard", Activity, "Dashboard"],
                ["urls", Link2, "My URLs"],
                ["analytics", BarChart3, "Analytics"],
                ["profile", UserCircle, "Profile"],
              ].map(([key, Icon, label]) => (
                <button
                  key={key as string}
                  className={`flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors ${
                    view === key
                      ? "bg-slate-950 text-white"
                      : "text-slate-700 hover:bg-white"
                  }`}
                  onClick={() => setView(key as View)}
                >
                  <Icon className="h-4 w-4" />
                  {label as string}
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-6">
            {error ? <Status tone="error" message={error} /> : null}
            {message ? <Status tone="success" message={message} /> : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Total URLs" value={urls.length} icon={Link2} />
              <Metric label="Active URLs" value={activeUrls} icon={ShieldCheck} />
              <Metric label="Selected Clicks" value={totalClicks} icon={BarChart3} />
            </div>

            {(view === "dashboard" || view === "urls") && (
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Create Short URL</h2>
                      <p className="text-sm text-muted-foreground">
                        Custom alias and expiration map directly to the existing API.
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <form className="space-y-4" onSubmit={createUrl}>
                    <Field label="Destination URL" htmlFor="originalUrl">
                      <Input
                        id="originalUrl"
                        required
                        type="url"
                        placeholder="https://example.com/long/path"
                        value={form.originalUrl}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            originalUrl: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Custom Alias" htmlFor="customAlias">
                      <Input
                        id="customAlias"
                        minLength={3}
                        maxLength={30}
                        pattern="[A-Za-z0-9_-]+"
                        placeholder="launch-brief"
                        value={form.customAlias}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            customAlias: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Expiration Date" htmlFor="expiresAt">
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={form.expiresAt}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            expiresAt: event.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Button className="w-full" disabled={busy}>
                      {busy ? "Working..." : "Create URL"}
                    </Button>
                  </form>
                </Card>

                <UrlList
                  urls={urls}
                  loading={loading}
                  busy={busy}
                  copiedId={copiedId}
                  onCopy={copyUrl}
                  onDelete={deleteUrl}
                  onAnalytics={(id) => loadAnalytics(id, true)}
                  onRefresh={loadUrls}
                />
              </div>
            )}

            {view === "analytics" && (
              <AnalyticsPanel
                urls={urls}
                selectedUrl={selectedUrl}
                analytics={analytics}
                busy={busy}
                onSelect={(id) => {
                  setSelectedUrlId(id);
                  void loadAnalytics(id);
                }}
                onRefresh={() => void loadAnalytics()}
              />
            )}

            {view === "profile" && <ProfilePanel />}
          </section>
        </div>
      </div>
    </main>
  );
}

function UrlList({
  urls,
  loading,
  busy,
  copiedId,
  onCopy,
  onDelete,
  onAnalytics,
  onRefresh,
}: {
  urls: ShortLink[];
  loading: boolean;
  busy: boolean;
  copiedId: string;
  onCopy: (url: ShortLink) => void;
  onDelete: (id: string) => void;
  onAnalytics: (id: string) => void;
  onRefresh: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">My URLs</h2>
          <p className="text-sm text-muted-foreground">
            Manage links created by the authenticated account.
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh URLs</span>
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Loading URLs...
        </div>
      ) : urls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Create your first short URL to populate this workspace.
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map((url) => (
            <article
              key={url.id}
              className="rounded-lg border border-border bg-white p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={getShortUrl(url)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-semibold text-slate-950 hover:underline"
                    >
                      {getShortUrl(url)}
                    </a>
                    {isExpired(url.expiresAt) ? (
                      <Badge variant="outline">Expired</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {url.originalUrl}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>Created {formatDate(url.createdAt)}</span>
                    <span>Expires {formatDate(url.expiresAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void onCopy(url)}
                  >
                    {copiedId === url.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy short URL</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onAnalytics(url.id)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="sr-only">View analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={busy}
                    onClick={() => void onDelete(url.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete URL</span>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

function AnalyticsPanel({
  urls,
  selectedUrl,
  analytics,
  busy,
  onSelect,
  onRefresh,
}: {
  urls: ShortLink[];
  selectedUrl?: ShortLink;
  analytics: AnalyticsResponse | null;
  busy: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Recent click events are read from the existing analytics endpoint.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={selectedUrl?.id || ""}
            onChange={(event) => onSelect(event.target.value)}
          >
            {urls.map((url) => (
              <option key={url.id} value={url.id}>
                {url.shortCode}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh analytics</span>
          </Button>
        </div>
      </div>

      {!selectedUrl ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Create a URL before viewing analytics.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-border bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">Selected short URL</p>
            <h3 className="mt-2 break-all text-2xl font-semibold">
              {getShortUrl(selectedUrl)}
            </h3>
            <p className="mt-4 break-all text-sm text-slate-300">
              {selectedUrl.originalUrl}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-xs text-slate-300">Total clicks</p>
                <p className="text-2xl font-semibold">
                  {analytics?.totalClicks ?? 0}
                </p>
              </div>
              <div className="rounded-md bg-white/10 p-3">
                <p className="text-xs text-slate-300">Status</p>
                <p className="text-lg font-semibold">
                  {isExpired(selectedUrl.expiresAt) ? "Expired" : "Active"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-white">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Recent clicks</h3>
            </div>
            <div className="divide-y divide-border">
              {busy ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Loading analytics...
                </p>
              ) : analytics?.recentClicks.length ? (
                analytics.recentClicks.slice(0, 10).map((click) => (
                  <div
                    key={click.id}
                    className="grid gap-2 p-4 text-sm md:grid-cols-[180px_1fr]"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(click.clickedAt)}
                    </span>
                    <span className="truncate">
                      {click.userAgent || "Unknown browser"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  No click events recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function ProfilePanel() {
  const { session, logout } = useAuth();

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={session?.user.avatarUrl}
            fallback={getInitials(session?.user.name, session?.user.email)}
            className="h-16 w-16 text-lg"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {session?.user.name || "Google user"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {session?.user.email}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">User ID</p>
          <p className="mt-1 break-all text-sm font-medium">
            {session?.user.id}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Auth model</p>
          <p className="mt-1 text-sm font-medium">Google OAuth + backend JWT</p>
        </div>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Status({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
        tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

function getShortUrl(url: ShortLink) {
  return url.shortUrl || `${api.baseUrl}/${url.shortCode}`;
}

function isExpired(value?: string | null) {
  return value ? new Date(value) < new Date() : false;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}
