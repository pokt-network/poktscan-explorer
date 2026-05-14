// Helpers for selecting the right RPC base URL depending on the call site.
//
// We keep two env vars by design:
//   - RPC_BASE_URL         (private/cluster-internal — never reaches browser)
//   - RPC_BASE_URL_PUBLIC  (public — used in browser-bound code paths)
//
// SSR fetches inside the pod can prefer the private URL to avoid an
// egress→ingress hop back into our own cluster. If the private URL isn't set
// (e.g. local dev, non-k8s deployments), they transparently fall back to the
// public URL — slightly slower, still works.
//
// Browser-bound values (RpcUrlProvider Context, props from Server to Client
// Components) MUST use the public URL only — never fall back to the private
// one, because a `*.svc.cluster.local` style hostname leaking to the browser
// triggers Private Network Access prompts on user devices.

export function getServerRpcUrl(): string {
  return process.env.RPC_BASE_URL || process.env.RPC_BASE_URL_PUBLIC || ''
}

export function getPublicRpcUrl(): string {
  return process.env.RPC_BASE_URL_PUBLIC || ''
}