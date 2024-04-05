/**
 * Minified by jsDelivr using Terser v5.19.2.
 * Original file: /npm/@gradio/client@0.15.0/dist/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var fn = new Intl.Collator(0, { numeric: 1 }).compare;
function semiver(e, t, a) {
  return (
    (e = e.split(".")),
    (t = t.split(".")),
    fn(e[0], t[0]) ||
      fn(e[1], t[1]) ||
      ((t[2] = t.slice(2).join(".")),
      (a = /[.-]/.test((e[2] = e.slice(2).join(".")))) == /[.-]/.test(t[2])
        ? fn(e[2], t[2])
        : a
        ? -1
        : 1)
  );
}
function resolve_root(e, t, a) {
  return t.startsWith("http://") || t.startsWith("https://")
    ? a
      ? e
      : t
    : e + t;
}
function determine_protocol(e) {
  if (e.startsWith("http")) {
    const { protocol: t, host: a } = new URL(e);
    return a.endsWith("hf.space")
      ? { ws_protocol: "wss", host: a, http_protocol: t }
      : {
          ws_protocol: "https:" === t ? "wss" : "ws",
          http_protocol: t,
          host: a,
        };
  }
  return e.startsWith("file:")
    ? { ws_protocol: "ws", http_protocol: "http:", host: "lite.local" }
    : { ws_protocol: "wss", http_protocol: "https:", host: e };
}
const RE_SPACE_NAME = /^[^\/]*\/[^\/]*$/,
  RE_SPACE_DOMAIN = /.*hf\.space\/{0,1}$/;
async function process_endpoint(e, t) {
  const a = {};
  t && (a.Authorization = `Bearer ${t}`);
  const s = e.trim();
  if (RE_SPACE_NAME.test(s))
    try {
      const t = await fetch(`https://huggingface.co/api/spaces/${s}/host`, {
        headers: a,
      });
      if (200 !== t.status)
        throw new Error("Space metadata could not be loaded.");
      return { space_id: e, ...determine_protocol((await t.json()).host) };
    } catch (e) {
      throw new Error("Space metadata could not be loaded." + e.message);
    }
  if (RE_SPACE_DOMAIN.test(s)) {
    const { ws_protocol: e, http_protocol: t, host: a } = determine_protocol(s);
    return {
      space_id: a.replace(".hf.space", ""),
      ws_protocol: e,
      http_protocol: t,
      host: a,
    };
  }
  return { space_id: !1, ...determine_protocol(s) };
}
function map_names_to_ids(e) {
  let t = {};
  return (
    e.forEach(({ api_name: e }, a) => {
      e && (t[e] = a);
    }),
    t
  );
}
const RE_DISABLED_DISCUSSION =
  /^(?=[^]*\b[dD]iscussions{0,1}\b)(?=[^]*\b[dD]isabled\b)[^]*$/;
async function discussions_enabled(e) {
  try {
    const t = (
      await fetch(`https://huggingface.co/api/spaces/${e}/discussions`, {
        method: "HEAD",
      })
    ).headers.get("x-error-message");
    return !t || !RE_DISABLED_DISCUSSION.test(t);
  } catch (e) {
    return !1;
  }
}
async function get_space_hardware(e, t) {
  const a = {};
  t && (a.Authorization = `Bearer ${t}`);
  try {
    const t = await fetch(`https://huggingface.co/api/spaces/${e}/runtime`, {
      headers: a,
    });
    if (200 !== t.status)
      throw new Error("Space hardware could not be obtained.");
    const { hardware: s } = await t.json();
    return s;
  } catch (e) {
    throw new Error(e.message);
  }
}
async function set_space_hardware(e, t, a) {
  const s = {};
  a && (s.Authorization = `Bearer ${a}`);
  try {
    const a = await fetch(`https://huggingface.co/api/spaces/${e}/hardware`, {
      headers: s,
      body: JSON.stringify(t),
    });
    if (200 !== a.status)
      throw new Error(
        "Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in."
      );
    const { hardware: n } = await a.json();
    return n;
  } catch (e) {
    throw new Error(e.message);
  }
}
async function set_space_timeout(e, t, a) {
  const s = {};
  a && (s.Authorization = `Bearer ${a}`);
  try {
    const a = await fetch(`https://huggingface.co/api/spaces/${e}/hardware`, {
      headers: s,
      body: JSON.stringify({ seconds: t }),
    });
    if (200 !== a.status)
      throw new Error(
        "Space hardware could not be set. Please ensure the space hardware provided is valid and that a Hugging Face token is passed in."
      );
    const { hardware: n } = await a.json();
    return n;
  } catch (e) {
    throw new Error(e.message);
  }
}
const hardware_types = [
  "cpu-basic",
  "cpu-upgrade",
  "t4-small",
  "t4-medium",
  "a10g-small",
  "a10g-large",
  "a100-large",
];
function apply_edit(e, t, a, s) {
  if (0 === t.length) {
    if ("replace" === a) return s;
    if ("append" === a) return e + s;
    throw new Error(`Unsupported action: ${a}`);
  }
  let n = e;
  for (let e = 0; e < t.length - 1; e++) n = n[t[e]];
  const o = t[t.length - 1];
  switch (a) {
    case "replace":
      n[o] = s;
      break;
    case "append":
      n[o] += s;
      break;
    case "add":
      Array.isArray(n) ? n.splice(Number(o), 0, s) : (n[o] = s);
      break;
    case "delete":
      Array.isArray(n) ? n.splice(Number(o), 1) : delete n[o];
      break;
    default:
      throw new Error(`Unknown action: ${a}`);
  }
  return e;
}
function apply_diff(e, t) {
  return (
    t.forEach(([t, a, s]) => {
      e = apply_edit(e, a, t, s);
    }),
    e
  );
}
async function upload(e, t, a, s = upload_files) {
  let n = (Array.isArray(e) ? e : [e]).map((e) => e.blob);
  return await Promise.all(
    await s(t, n, void 0, a).then(async (a) => {
      if (a.error) throw new Error(a.error);
      return a.files
        ? a.files.map(
            (a, s) => new FileData({ ...e[s], path: a, url: t + "/file=" + a })
          )
        : [];
    })
  );
}
async function prepare_files(e, t) {
  return e.map(
    (e, a) =>
      new FileData({
        path: e.name,
        orig_name: e.name,
        blob: e,
        size: e.size,
        mime_type: e.type,
        is_stream: t,
      })
  );
}
class FileData {
  constructor({
    path: e,
    url: t,
    orig_name: a,
    size: s,
    blob: n,
    is_stream: o,
    mime_type: r,
    alt_text: i,
  }) {
    (this.meta = { _type: "gradio.FileData" }),
      (this.path = e),
      (this.url = t),
      (this.orig_name = a),
      (this.size = s),
      (this.blob = t ? void 0 : n),
      (this.is_stream = o),
      (this.mime_type = r),
      (this.alt_text = i);
  }
}
const QUEUE_FULL_MSG = "This application is too busy. Keep trying!",
  BROKEN_CONNECTION_MSG = "Connection errored out.";
let NodeBlob;
async function duplicate(e, t) {
  const { hf_token: a, private: s, hardware: n, timeout: o } = t;
  if (n && !hardware_types.includes(n))
    throw new Error(
      `Invalid hardware type provided. Valid types are: ${hardware_types
        .map((e) => `"${e}"`)
        .join(",")}.`
    );
  const r = { Authorization: `Bearer ${a}` },
    i = (
      await (
        await fetch("https://huggingface.co/api/whoami-v2", { headers: r })
      ).json()
    ).name,
    c = e.split("/")[1],
    u = { repository: `${i}/${c}` };
  s && (u.private = !0);
  try {
    const s = await fetch(`https://huggingface.co/api/spaces/${e}/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...r },
      body: JSON.stringify(u),
    });
    if (409 === s.status) return client(`${i}/${c}`, t);
    const l = await s.json();
    let d;
    n || (d = await get_space_hardware(e, a));
    const p = n || d || "cpu-basic";
    return (
      await set_space_hardware(`${i}/${c}`, p, a),
      await set_space_timeout(`${i}/${c}`, o || 300, a),
      client(l.url, t)
    );
  } catch (e) {
    throw new Error(e);
  }
}
function api_factory(e, t) {
  return {
    post_data: a,
    upload_files: s,
    client: async function (s, o = {}) {
      return new Promise(async (r) => {
        const { status_callback: i, hf_token: c } = o,
          u = {
            predict: function (e, t, a) {
              let s,
                n = !1,
                o = !1;
              if ("number" == typeof e) s = S.dependencies[e];
              else {
                const t = e.replace(/^\//, "");
                s = S.dependencies[N[t]];
              }
              if (s.types.continuous)
                throw new Error(
                  "Cannot call predict on this function as it may run forever. Use submit instead"
                );
              return new Promise((s, r) => {
                const i = D(e, t, a);
                let c;
                i.on("data", (e) => {
                  o && (i.destroy(), s(e)), (n = !0), (c = e);
                }).on("status", (e) => {
                  "error" === e.stage && r(e),
                    "complete" === e.stage &&
                      ((o = !0), n && (i.destroy(), s(c)));
                });
              });
            },
            submit: D,
            view_api: q,
            component_server: async function (t, a, s) {
              var n;
              const o = { "Content-Type": "application/json" };
              c && (o.Authorization = `Bearer ${c}`);
              let r,
                i = S.components.find((e) => e.id === t);
              r = (
                null == (n = null == i ? void 0 : i.props) ? void 0 : n.root_url
              )
                ? i.props.root_url
                : S.root;
              const u = await e(`${r}/component_server/`, {
                method: "POST",
                body: JSON.stringify({
                  data: s,
                  component_id: t,
                  fn_name: a,
                  session_hash: f,
                }),
                headers: o,
              });
              if (!u.ok)
                throw new Error(
                  "Could not connect to component server: " + u.statusText
                );
              return await u.json();
            },
          };
        if (
          !(
            ("undefined" != typeof window && "WebSocket" in window) ||
            global.Websocket
          )
        ) {
          const e = await import("./wrapper-6f348d45.js");
          (NodeBlob = (await import("node:buffer")).Blob),
            (global.WebSocket = e.WebSocket);
        }
        const {
            ws_protocol: l,
            http_protocol: d,
            host: p,
            space_id: _,
          } = await process_endpoint(s, c),
          f = Math.random().toString(36).substring(2),
          h = {};
        let g = !1,
          m = {},
          w = {},
          y = null;
        const b = {},
          v = new Set();
        let S,
          E,
          N = {},
          $ = !1;
        async function O(e) {
          if (
            ((S = e),
            "https:" === window.location.protocol &&
              (S.root = S.root.replace("http://", "https://")),
            (N = map_names_to_ids((null == e ? void 0 : e.dependencies) || [])),
            S.auth_required)
          )
            return { config: S, ...u };
          try {
            E = await q(S);
          } catch (e) {
            console.error(`Could not get api details: ${e.message}`);
          }
          return { config: S, ...u };
        }
        c && _ && ($ = await get_jwt(_, c));
        try {
          S = await resolve_config(e, `${d}//${p}`, c);
          const t = await O(S);
          new EventSource(`${S.root}/heartbeat/${f}`);
          r(t);
        } catch (t) {
          console.error(t),
            _
              ? check_space_status(
                  _,
                  RE_SPACE_NAME.test(_) ? "space_name" : "subdomain",
                  async function (t) {
                    if ((i && i(t), "running" === t.status))
                      try {
                        S = await resolve_config(e, `${d}//${p}`, c);
                        const t = await O(S);
                        r(t);
                      } catch (e) {
                        console.error(e),
                          i &&
                            i({
                              status: "error",
                              message: "Could not load this space.",
                              load_status: "error",
                              detail: "NOT_FOUND",
                            });
                      }
                  }
                )
              : i &&
                i({
                  status: "error",
                  message: "Could not load this space.",
                  load_status: "error",
                  detail: "NOT_FOUND",
                });
        }
        function D(s, o, r, i = null) {
          let u, d, _, O;
          if ("number" == typeof s) (u = s), (d = E.unnamed_endpoints[u]);
          else {
            const e = s.replace(/^\//, "");
            (u = N[e]), (d = E.named_endpoints[s.trim()]);
          }
          if ("number" != typeof u)
            throw new Error(
              "There is no endpoint matching that name of fn_index matching that number."
            );
          let D = S.protocol ?? "ws";
          const q = "number" == typeof s ? "/predict" : s;
          let k,
            C = null,
            B = !1;
          const A = {};
          let j = "";
          function T(e) {
            const t = A[e.type] || [];
            null == t || t.forEach((t) => t(e));
          }
          function z(e, t) {
            const a = A,
              s = a[e] || [];
            return (
              (a[e] = s),
              null == s || s.push(t),
              { on: z, off: U, cancel: P, destroy: I }
            );
          }
          function U(e, t) {
            const a = A;
            let s = a[e] || [];
            return (
              (s = null == s ? void 0 : s.filter((e) => e !== t)),
              (a[e] = s),
              { on: z, off: U, cancel: P, destroy: I }
            );
          }
          async function P() {
            const t = { stage: "complete", queue: !1, time: new Date() };
            (B = t), T({ ...t, type: "status", endpoint: q, fn_index: u });
            let a = {};
            "ws" === D
              ? (_ && 0 === _.readyState
                  ? _.addEventListener("open", () => {
                      _.close();
                    })
                  : _.close(),
                (a = { fn_index: u, session_hash: f }))
              : (O.close(), (a = { event_id: C }));
            try {
              await e(`${S.root}/reset`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify(a),
              });
            } catch (e) {
              console.warn(
                "The `/reset` endpoint could not be called. Subsequent endpoint results may be unreliable."
              );
            }
          }
          function I() {
            for (const e in A)
              A[e].forEach((t) => {
                U(e, t);
              });
          }
          return (
            "undefined" != typeof window &&
              (j = new URLSearchParams(window.location.search).toString()),
            n(`${S.root}`, o, d, c).then((e) => {
              if (
                ((k = {
                  data: e || [],
                  event_data: r,
                  fn_index: u,
                  trigger_id: i,
                }),
                skip_queue(u, S))
              )
                T({
                  type: "status",
                  endpoint: q,
                  stage: "pending",
                  queue: !1,
                  fn_index: u,
                  time: new Date(),
                }),
                  a(
                    `${S.root}/run${q.startsWith("/") ? q : `/${q}`}${
                      j ? "?" + j : ""
                    }`,
                    { ...k, session_hash: f },
                    c
                  )
                    .then(([e, t]) => {
                      const a = e.data;
                      200 == t
                        ? (T({
                            type: "data",
                            endpoint: q,
                            fn_index: u,
                            data: a,
                            time: new Date(),
                          }),
                          T({
                            type: "status",
                            endpoint: q,
                            fn_index: u,
                            stage: "complete",
                            eta: e.average_duration,
                            queue: !1,
                            time: new Date(),
                          }))
                        : T({
                            type: "status",
                            stage: "error",
                            endpoint: q,
                            fn_index: u,
                            message: e.error,
                            queue: !1,
                            time: new Date(),
                          });
                    })
                    .catch((e) => {
                      T({
                        type: "status",
                        stage: "error",
                        message: e.message,
                        endpoint: q,
                        fn_index: u,
                        queue: !1,
                        time: new Date(),
                      });
                    });
              else if ("ws" == D) {
                T({
                  type: "status",
                  stage: "pending",
                  queue: !0,
                  endpoint: q,
                  fn_index: u,
                  time: new Date(),
                });
                let e = new URL(
                  `${l}://${resolve_root(
                    p,
                    S.path,
                    !0
                  )}\n\t\t\t\t\t\t\t/queue/join${j ? "?" + j : ""}`
                );
                $ && e.searchParams.set("__sign", $),
                  (_ = new WebSocket(e)),
                  (_.onclose = (e) => {
                    e.wasClean ||
                      T({
                        type: "status",
                        stage: "error",
                        broken: !0,
                        message: BROKEN_CONNECTION_MSG,
                        queue: !0,
                        endpoint: q,
                        fn_index: u,
                        time: new Date(),
                      });
                  }),
                  (_.onmessage = function (e) {
                    const t = JSON.parse(e.data),
                      { type: a, status: s, data: n } = handle_message(t, h[u]);
                    if ("update" === a && s && !B)
                      T({
                        type: "status",
                        endpoint: q,
                        fn_index: u,
                        time: new Date(),
                        ...s,
                      }),
                        "error" === s.stage && _.close();
                    else {
                      if ("hash" === a)
                        return void _.send(
                          JSON.stringify({ fn_index: u, session_hash: f })
                        );
                      "data" === a
                        ? _.send(JSON.stringify({ ...k, session_hash: f }))
                        : "complete" === a
                        ? (B = s)
                        : "log" === a
                        ? T({
                            type: "log",
                            log: n.log,
                            level: n.level,
                            endpoint: q,
                            fn_index: u,
                          })
                        : "generating" === a &&
                          T({
                            type: "status",
                            time: new Date(),
                            ...s,
                            stage: null == s ? void 0 : s.stage,
                            queue: !0,
                            endpoint: q,
                            fn_index: u,
                          });
                    }
                    n &&
                      (T({
                        type: "data",
                        time: new Date(),
                        data: n.data,
                        endpoint: q,
                        fn_index: u,
                      }),
                      B &&
                        (T({
                          type: "status",
                          time: new Date(),
                          ...B,
                          stage: null == s ? void 0 : s.stage,
                          queue: !0,
                          endpoint: q,
                          fn_index: u,
                        }),
                        _.close()));
                  }),
                  semiver(S.version || "2.0.0", "3.6") < 0 &&
                    addEventListener("open", () =>
                      _.send(JSON.stringify({ hash: f }))
                    );
              } else if ("sse" == D) {
                T({
                  type: "status",
                  stage: "pending",
                  queue: !0,
                  endpoint: q,
                  fn_index: u,
                  time: new Date(),
                });
                var s = new URLSearchParams({
                  fn_index: u.toString(),
                  session_hash: f,
                }).toString();
                let e = new URL(`${S.root}/queue/join?${j ? j + "&" : ""}${s}`);
                (O = t(e)),
                  (O.onmessage = async function (e) {
                    const t = JSON.parse(e.data),
                      { type: s, status: n, data: o } = handle_message(t, h[u]);
                    if ("update" === s && n && !B)
                      T({
                        type: "status",
                        endpoint: q,
                        fn_index: u,
                        time: new Date(),
                        ...n,
                      }),
                        "error" === n.stage && O.close();
                    else if ("data" === s) {
                      C = t.event_id;
                      let [e, s] = await a(
                        `${S.root}/queue/data`,
                        { ...k, session_hash: f, event_id: C },
                        c
                      );
                      200 !== s &&
                        (T({
                          type: "status",
                          stage: "error",
                          message: BROKEN_CONNECTION_MSG,
                          queue: !0,
                          endpoint: q,
                          fn_index: u,
                          time: new Date(),
                        }),
                        O.close());
                    } else
                      "complete" === s
                        ? (B = n)
                        : "log" === s
                        ? T({
                            type: "log",
                            log: o.log,
                            level: o.level,
                            endpoint: q,
                            fn_index: u,
                          })
                        : "generating" === s &&
                          T({
                            type: "status",
                            time: new Date(),
                            ...n,
                            stage: null == n ? void 0 : n.stage,
                            queue: !0,
                            endpoint: q,
                            fn_index: u,
                          });
                    o &&
                      (T({
                        type: "data",
                        time: new Date(),
                        data: o.data,
                        endpoint: q,
                        fn_index: u,
                      }),
                      B &&
                        (T({
                          type: "status",
                          time: new Date(),
                          ...B,
                          stage: null == n ? void 0 : n.stage,
                          queue: !0,
                          endpoint: q,
                          fn_index: u,
                        }),
                        O.close()));
                  });
              } else
                ("sse_v1" != D &&
                  "sse_v2" != D &&
                  "sse_v2.1" != D &&
                  "sse_v3" != D) ||
                  (T({
                    type: "status",
                    stage: "pending",
                    queue: !0,
                    endpoint: q,
                    fn_index: u,
                    time: new Date(),
                  }),
                  a(
                    `${S.root}/queue/join?${j}`,
                    { ...k, session_hash: f },
                    c
                  ).then(([e, a]) => {
                    if (503 === a)
                      T({
                        type: "status",
                        stage: "error",
                        message: QUEUE_FULL_MSG,
                        queue: !0,
                        endpoint: q,
                        fn_index: u,
                        time: new Date(),
                      });
                    else if (200 !== a)
                      T({
                        type: "status",
                        stage: "error",
                        message: BROKEN_CONNECTION_MSG,
                        queue: !0,
                        endpoint: q,
                        fn_index: u,
                        time: new Date(),
                      });
                    else {
                      C = e.event_id;
                      let a = async function (e) {
                        try {
                          const {
                            type: t,
                            status: a,
                            data: s,
                          } = handle_message(e, h[u]);
                          if ("heartbeat" == t) return;
                          if ("update" === t && a && !B)
                            T({
                              type: "status",
                              endpoint: q,
                              fn_index: u,
                              time: new Date(),
                              ...a,
                            });
                          else if ("complete" === t) B = a;
                          else if ("unexpected_error" == t)
                            console.error(
                              "Unexpected error",
                              null == a ? void 0 : a.message
                            ),
                              T({
                                type: "status",
                                stage: "error",
                                message:
                                  (null == a ? void 0 : a.message) ||
                                  "An Unexpected Error Occurred!",
                                queue: !0,
                                endpoint: q,
                                fn_index: u,
                                time: new Date(),
                              });
                          else {
                            if ("log" === t)
                              return void T({
                                type: "log",
                                log: s.log,
                                level: s.level,
                                endpoint: q,
                                fn_index: u,
                              });
                            "generating" === t &&
                              (T({
                                type: "status",
                                time: new Date(),
                                ...a,
                                stage: null == a ? void 0 : a.stage,
                                queue: !0,
                                endpoint: q,
                                fn_index: u,
                              }),
                              s &&
                                ["sse_v2", "sse_v2.1", "sse_v3"].includes(D) &&
                                (function (e, t) {
                                  w[e]
                                    ? t.data.forEach((a, s) => {
                                        let n = apply_diff(w[e][s], a);
                                        (w[e][s] = n), (t.data[s] = n);
                                      })
                                    : ((w[e] = []),
                                      t.data.forEach((t, a) => {
                                        w[e][a] = t;
                                      }));
                                })(C, s));
                          }
                          s &&
                            (T({
                              type: "data",
                              time: new Date(),
                              data: s.data,
                              endpoint: q,
                              fn_index: u,
                            }),
                            B &&
                              T({
                                type: "status",
                                time: new Date(),
                                ...B,
                                stage: null == a ? void 0 : a.stage,
                                queue: !0,
                                endpoint: q,
                                fn_index: u,
                              })),
                            ("complete" !== (null == a ? void 0 : a.stage) &&
                              "error" !== (null == a ? void 0 : a.stage)) ||
                              (b[C] && delete b[C], C in w && delete w[C]);
                        } catch (e) {
                          console.error("Unexpected client exception", e),
                            T({
                              type: "status",
                              stage: "error",
                              message: "An Unexpected Error Occurred!",
                              queue: !0,
                              endpoint: q,
                              fn_index: u,
                              time: new Date(),
                            }),
                            ["sse_v2", "sse_v2.1"].includes(D) && x();
                        }
                      };
                      C in m && (m[C].forEach((e) => a(e)), delete m[C]),
                        (b[C] = a),
                        v.add(C),
                        g ||
                          (function () {
                            g = !0;
                            let e = new URLSearchParams({
                                session_hash: f,
                              }).toString(),
                              a = new URL(`${S.root}/queue/data?${e}`);
                            (y = t(a)),
                              (y.onmessage = async function (e) {
                                let t = JSON.parse(e.data);
                                const a = t.event_id;
                                if (a)
                                  if (b[a]) {
                                    "process_completed" === t.msg &&
                                      [
                                        "sse",
                                        "sse_v1",
                                        "sse_v2",
                                        "sse_v2.1",
                                      ].includes(S.protocol) &&
                                      (v.delete(a), 0 === v.size && x());
                                    let e = b[a];
                                    window.setTimeout(e, 0, t);
                                  } else m[a] || (m[a] = []), m[a].push(t);
                                else
                                  await Promise.all(
                                    Object.keys(b).map((e) => b[e](t))
                                  );
                                "close_stream" === t.msg && x();
                              }),
                              (y.onerror = async function (e) {
                                await Promise.all(
                                  Object.keys(b).map((e) =>
                                    b[e]({
                                      msg: "unexpected_error",
                                      message: BROKEN_CONNECTION_MSG,
                                    })
                                  )
                                ),
                                  x();
                              });
                          })();
                    }
                  }));
            }),
            { on: z, off: U, cancel: P, destroy: I }
          );
        }
        function x() {
          (g = !1), null == y || y.close();
        }
        async function q(t) {
          if (E) return E;
          const a = { "Content-Type": "application/json" };
          let s;
          if (
            (c && (a.Authorization = `Bearer ${c}`),
            (s =
              semiver(t.version || "2.0.0", "3.30") < 0
                ? await e("https://gradio-space-api-fetcher-v2.hf.space/api", {
                    method: "POST",
                    body: JSON.stringify({
                      serialize: !1,
                      config: JSON.stringify(t),
                    }),
                    headers: a,
                  })
                : await e(`${t.root}/info`, { headers: a })),
            !s.ok)
          )
            throw new Error(BROKEN_CONNECTION_MSG);
          let n = await s.json();
          "api" in n && (n = n.api),
            n.named_endpoints["/predict"] &&
              !n.unnamed_endpoints[0] &&
              (n.unnamed_endpoints[0] = n.named_endpoints["/predict"]);
          return transform_api_info(n, t, N);
        }
      });
    },
    handle_blob: n,
  };
  async function a(t, a, s) {
    const n = { "Content-Type": "application/json" };
    s && (n.Authorization = `Bearer ${s}`);
    try {
      var o = await e(t, {
        method: "POST",
        body: JSON.stringify(a),
        headers: n,
      });
    } catch (e) {
      return [{ error: BROKEN_CONNECTION_MSG }, 500];
    }
    let r, i;
    try {
      (r = await o.json()), (i = o.status);
    } catch (e) {
      (r = { error: `Could not parse server response: ${e}` }), (i = 500);
    }
    return [r, i];
  }
  async function s(t, a, s, n) {
    const o = {};
    s && (o.Authorization = `Bearer ${s}`);
    const r = [];
    for (let s = 0; s < a.length; s += 1e3) {
      const c = a.slice(s, s + 1e3),
        u = new FormData();
      c.forEach((e) => {
        u.append("files", e);
      });
      try {
        const a = n ? `${t}/upload?upload_id=${n}` : `${t}/upload`;
        var i = await e(a, { method: "POST", body: u, headers: o });
      } catch (e) {
        return { error: BROKEN_CONNECTION_MSG };
      }
      const l = await i.json();
      r.push(...l);
    }
    return { files: r };
  }
  async function n(e, t, a, n) {
    const o = await walk_and_store_blobs(t, void 0, [], !0, a);
    return Promise.all(
      o.map(async ({ path: t, blob: a, type: o }) => {
        if (a) {
          return {
            path: t,
            file_url: (await s(e, [a], n)).files[0],
            type: o,
            name: null == a ? void 0 : a.name,
          };
        }
        return { path: t, type: o };
      })
    ).then(
      (e) => (
        e.forEach(({ path: e, file_url: a, type: s, name: n }) => {
          if ("Gallery" === s) update_object(t, a, e);
          else if (a) {
            const s = new FileData({ path: a, orig_name: n });
            update_object(t, s, e);
          }
        }),
        t
      )
    );
  }
}
const {
  post_data: post_data,
  upload_files: upload_files,
  client: client,
  handle_blob: handle_blob,
} = api_factory(fetch, (...e) => new EventSource(...e));
function get_type(e, t, a, s) {
  switch (e.type) {
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "number":
      return "number";
  }
  return "JSONSerializable" === a || "StringSerializable" === a
    ? "any"
    : "ListStringSerializable" === a
    ? "string[]"
    : "Image" === t
    ? "parameter" === s
      ? "Blob | File | Buffer"
      : "string"
    : "FileSerializable" === a
    ? "array" === (null == e ? void 0 : e.type)
      ? "parameter" === s
        ? "(Blob | File | Buffer)[]"
        : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}[]"
      : "parameter" === s
      ? "Blob | File | Buffer"
      : "{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}"
    : "GallerySerializable" === a
    ? "parameter" === s
      ? "[(Blob | File | Buffer), (string | null)][]"
      : "[{ name: string; data: string; size?: number; is_file?: boolean; orig_name?: string}, (string | null))][]"
    : void 0;
}
function get_description(e, t) {
  return "GallerySerializable" === t
    ? "array of [file, label] tuples"
    : "ListStringSerializable" === t
    ? "array of strings"
    : "FileSerializable" === t
    ? "array of files or single file"
    : e.description;
}
function transform_api_info(e, t, a) {
  const s = { named_endpoints: {}, unnamed_endpoints: {} };
  for (const n in e) {
    const o = e[n];
    for (const e in o) {
      const r = t.dependencies[e] ? e : a[e.replace("/", "")],
        i = o[e];
      (s[n][e] = {}),
        (s[n][e].parameters = {}),
        (s[n][e].returns = {}),
        (s[n][e].type = t.dependencies[r].types),
        (s[n][e].parameters = i.parameters.map(
          ({ label: e, component: t, type: a, serializer: s }) => ({
            label: e,
            component: t,
            type: get_type(a, t, s, "parameter"),
            description: get_description(a, s),
          })
        )),
        (s[n][e].returns = i.returns.map(
          ({ label: e, component: t, type: a, serializer: s }) => ({
            label: e,
            component: t,
            type: get_type(a, t, s, "return"),
            description: get_description(a, s),
          })
        ));
    }
  }
  return s;
}
async function get_jwt(e, t) {
  try {
    const a = await fetch(`https://huggingface.co/api/spaces/${e}/jwt`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    return (await a.json()).token || !1;
  } catch (e) {
    return console.error(e), !1;
  }
}
function update_object(e, t, a) {
  for (; a.length > 1; ) e = e[a.shift()];
  e[a.shift()] = t;
}
async function walk_and_store_blobs(e, t = void 0, a = [], s = !1, n = void 0) {
  if (Array.isArray(e)) {
    let o = [];
    return (
      await Promise.all(
        e.map(async (r, i) => {
          var c;
          let u = a.slice();
          u.push(i);
          const l = await walk_and_store_blobs(
            e[i],
            s
              ? (null == (c = null == n ? void 0 : n.parameters[i])
                  ? void 0
                  : c.component) || void 0
              : t,
            u,
            !1,
            n
          );
          o = o.concat(l);
        })
      ),
      o
    );
  }
  if (globalThis.Buffer && e instanceof globalThis.Buffer) {
    return [{ path: a, blob: !("Image" === t) && new NodeBlob([e]), type: t }];
  }
  if ("object" == typeof e) {
    let t = [];
    for (let s in e)
      if (e.hasOwnProperty(s)) {
        let o = a.slice();
        o.push(s),
          (t = t.concat(await walk_and_store_blobs(e[s], void 0, o, !1, n)));
      }
    return t;
  }
  return [];
}
function skip_queue(e, t) {
  var a, s, n, o;
  return (
    !(null ===
    (null ==
    (s = null == (a = null == t ? void 0 : t.dependencies) ? void 0 : a[e])
      ? void 0
      : s.queue)
      ? t.enable_queue
      : null ==
        (o = null == (n = null == t ? void 0 : t.dependencies) ? void 0 : n[e])
      ? void 0
      : o.queue) || !1
  );
}
async function resolve_config(e, t, a) {
  const s = {};
  if (
    (a && (s.Authorization = `Bearer ${a}`),
    "undefined" != typeof window &&
      window.gradio_config &&
      "http://localhost:9876" !== location.origin &&
      !window.gradio_config.dev_mode)
  ) {
    const e = window.gradio_config.root,
      a = window.gradio_config;
    return (a.root = resolve_root(t, a.root, !1)), { ...a, path: e };
  }
  if (t) {
    let a = await e(`${t}/config`, { headers: s });
    if (200 === a.status) {
      const e = await a.json();
      return (e.path = e.path ?? ""), (e.root = t), e;
    }
    throw new Error("Could not get config.");
  }
  throw new Error("No config or app endpoint found");
}
async function check_space_status(e, t, a) {
  let s,
    n,
    o =
      "subdomain" === t
        ? `https://huggingface.co/api/spaces/by-subdomain/${e}`
        : `https://huggingface.co/api/spaces/${e}`;
  try {
    if (((s = await fetch(o)), (n = s.status), 200 !== n)) throw new Error();
    s = await s.json();
  } catch (e) {
    return void a({
      status: "error",
      load_status: "error",
      message: "Could not get space status",
      detail: "NOT_FOUND",
    });
  }
  if (!s || 200 !== n) return;
  const {
    runtime: { stage: r },
    id: i,
  } = s;
  switch (r) {
    case "STOPPED":
    case "SLEEPING":
      a({
        status: "sleeping",
        load_status: "pending",
        message: "Space is asleep. Waking it up...",
        detail: r,
      }),
        setTimeout(() => {
          check_space_status(e, t, a);
        }, 1e3);
      break;
    case "PAUSED":
      a({
        status: "paused",
        load_status: "error",
        message:
          "This space has been paused by the author. If you would like to try this demo, consider duplicating the space.",
        detail: r,
        discussions_enabled: await discussions_enabled(i),
      });
      break;
    case "RUNNING":
    case "RUNNING_BUILDING":
      a({ status: "running", load_status: "complete", message: "", detail: r });
      break;
    case "BUILDING":
      a({
        status: "building",
        load_status: "pending",
        message: "Space is building...",
        detail: r,
      }),
        setTimeout(() => {
          check_space_status(e, t, a);
        }, 1e3);
      break;
    default:
      a({
        status: "space_error",
        load_status: "error",
        message: "This space is experiencing an issue.",
        detail: r,
        discussions_enabled: await discussions_enabled(i),
      });
  }
}
function handle_message(e, t) {
  const a = !0;
  switch (e.msg) {
    case "send_data":
      return { type: "data" };
    case "send_hash":
      return { type: "hash" };
    case "queue_full":
      return {
        type: "update",
        status: {
          queue: a,
          message: QUEUE_FULL_MSG,
          stage: "error",
          code: e.code,
          success: e.success,
        },
      };
    case "heartbeat":
      return { type: "heartbeat" };
    case "unexpected_error":
      return {
        type: "unexpected_error",
        status: { queue: a, message: e.message, stage: "error", success: !1 },
      };
    case "estimation":
      return {
        type: "update",
        status: {
          queue: a,
          stage: t || "pending",
          code: e.code,
          size: e.queue_size,
          position: e.rank,
          eta: e.rank_eta,
          success: e.success,
        },
      };
    case "progress":
      return {
        type: "update",
        status: {
          queue: a,
          stage: "pending",
          code: e.code,
          progress_data: e.progress_data,
          success: e.success,
        },
      };
    case "log":
      return { type: "log", data: e };
    case "process_generating":
      return {
        type: "generating",
        status: {
          queue: a,
          message: e.success ? null : e.output.error,
          stage: e.success ? "generating" : "error",
          code: e.code,
          progress_data: e.progress_data,
          eta: e.average_duration,
        },
        data: e.success ? e.output : null,
      };
    case "process_completed":
      return "error" in e.output
        ? {
            type: "update",
            status: {
              queue: a,
              message: e.output.error,
              stage: "error",
              code: e.code,
              success: e.success,
            },
          }
        : {
            type: "complete",
            status: {
              queue: a,
              message: e.success ? void 0 : e.output.error,
              stage: e.success ? "complete" : "error",
              code: e.code,
              progress_data: e.progress_data,
            },
            data: e.success ? e.output : null,
          };
    case "process_starts":
      return {
        type: "update",
        status: {
          queue: a,
          stage: "pending",
          code: e.code,
          size: e.rank,
          position: 0,
          success: e.success,
          eta: e.eta,
        },
      };
  }
  return { type: "none", status: { stage: "error", queue: a } };
}

/////////////////////////
/// A-Frame Component ///
/////////////////////////
AFRAME.registerComponent('3d-generator', {
  schema: {
    prompt: { type: 'string', default: '' },
    seed: { type: 'number', default: 140689996 },
    guidanceScale: { type: 'number', default: 15 },
    numSteps: { type: 'number', default: 64 }
  },

  init: function () {
    this.createButton();
  },

  createButton: function () {
    let myButton = document.createElement("a-box");
    myButton.id = "myButton";
    myButton.setAttribute("position", "0 0 -3")
    myButton.setAttribute("class", "clickable");
    document.querySelector("a-scene").appendChild(myButton);
    myButton.addEventListener("click", this.onClick.bind(this));
  },

  onClick: async function () {
    const result = await this.fetchData();
    this.createTextEntity(result.data[0].url);
  },

  fetchData: async function () {
    const app = await client("hysts/Shap-E");
    return await app.predict("/text-to-3d", [
      this.data.prompt,
      this.data.seed,
      this.data.guidanceScale,
      this.data.numSteps
    ]);
  },

  createTextEntity: function (url) {
    const entity = document.createElement('a-entity');
    entity.setAttribute('gltf-model', url);
    // Set position, rotation, scale if needed
    entity.setAttribute('id', 'myButton');
    this.el.appendChild(entity);
  }
});






//# sourceMappingURL=/sm/3abdbafda352f2713e4aa87ae08e932f390a5e262a835c9e9d9c97417fee317b.map
