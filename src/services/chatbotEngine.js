const ROLE_ALIASES = {
  passenger: "student",
  student: "student",
  admin: "admin",
  conductor: "conductor",
};

const ROLE_HOME_PAGE = {
  student: "dashboard",
  admin: "admin",
  conductor: "conductor",
};

const VALID_MODES = new Set(["smart", "steps", "troubleshoot"]);

const ROUTE_SUMMARY = [
  "Route Alpha: College Gate -> North Campus -> Library Sq -> Main Market -> City Centre | 12.5 km | 35 min | Rs 450/month",
  "Route Beta: College Gate -> Tech Park -> Sector 4 -> Bus Terminal -> Railway Station | 18.2 km | 50 min | Rs 650/month",
  "Route Gamma: College Gate -> East Campus -> Ring Road -> IT Hub -> Airport Road | 22 km | 65 min | Rs 750/month",
].join("\n");

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRole(role) {
  return ROLE_ALIASES[(role || "").toLowerCase()] || "student";
}

function withFollowUp(body, followUp) {
  return `${body}\n\n${followUp}`.trim();
}

const INTENTS = [
  {
    id: "greeting",
    roles: ["student", "admin", "conductor"],
    keywords: ["hi", "hello", "hey", "help", "start", "guide"],
    response: (_q, role) => {
      if (role === "admin") {
        return "I can help you manage pass applications, routes, users, analytics, and announcements. You can start from [navigate:admin] or [navigate:hub].";
      }
      if (role === "conductor") {
        return "I can help with QR scanning, camera scan, manual lookup, and daily trip logs. Start from [navigate:conductor] or [navigate:camera].";
      }
      return "I can help you apply or renew a pass, book tickets/taxi, track routes, and resolve payment issues. Start from [navigate:dashboard] or [navigate:apply].";
    },
  },
  {
    id: "student_apply_pass",
    roles: ["student"],
    keywords: ["apply", "application", "new pass", "bus pass", "how apply"],
    response: () =>
      withFollowUp(
        "Apply in 3 steps:\n1. Open [navigate:apply].\n2. Choose route + boarding stop, then duration.\n3. Review total and pay.\nAfter payment, status is PENDING and admin usually approves within 24 hours.",
        "Want me to suggest the best duration (monthly, quarterly, annual) for your travel pattern?"
      ),
  },
  {
    id: "student_renew",
    roles: ["student"],
    keywords: ["renew", "renewal", "extend pass", "pass expiring"],
    response: () =>
      withFollowUp(
        "To renew quickly:\n1. Open [navigate:renew].\n2. Confirm duration (your route is pre-filled).\n3. Complete payment.\nRenewals usually do not need manual admin approval.",
        "If you want, I can help compare cost across durations before you pay."
      ),
  },
  {
    id: "student_pending",
    roles: ["student"],
    keywords: ["pending", "stuck", "not approved", "approval", "application status"],
    response: () =>
      withFollowUp(
        "Pending status is normal for up to 24 hours. If it crosses 48 hours:\n1. Check your application in [navigate:profile].\n2. Confirm payment status in your payment history.\n3. Raise a support request with your application ID.",
        "If you share your exact status text, I can suggest the next best action."
      ),
  },
  {
    id: "student_ticket",
    roles: ["student"],
    keywords: ["single ticket", "book ticket", "one way", "journey", "seat"],
    response: () =>
      withFollowUp(
        "Book a single journey ticket from [navigate:tickets]:\n1. Enter from/to stops and date.\n2. Pick a listed trip.\n3. Select seat and pay.\nYou get an instant QR ticket for one journey.",
        "Need help calculating the expected fare for your route?"
      ),
  },
  {
    id: "student_taxi",
    roles: ["student"],
    keywords: ["taxi", "cab", "auto", "ride", "driver", "otp"],
    response: () =>
      withFollowUp(
        "Book from [navigate:taxi]:\n1. Enter pickup and destination.\n2. Select ride type (Auto/Economy/Premium/Shared).\n3. Book now or schedule, then pay.\n4. Share OTP only after the driver arrives in person.",
        "Want me to help choose the cheapest ride type for your distance?"
      ),
  },
  {
    id: "student_payment_failed",
    roles: ["student"],
    keywords: ["payment failed", "amount deducted", "money deducted", "refund", "transaction failed"],
    response: () =>
      withFollowUp(
        "If money was deducted but pass/ticket is missing:\n1. Wait 5 minutes and refresh.\n2. Check payment status in [navigate:profile].\n3. If status is SUCCESS but no pass, raise support with transaction reference.\nRefund timelines are usually 5-7 business days for failed captures.",
        "If you share your payment status, I can tell you whether to wait or escalate now."
      ),
  },
  {
    id: "student_qr_issue",
    roles: ["student"],
    keywords: ["qr", "not scanning", "scan failed", "invalid qr"],
    response: () =>
      withFollowUp(
        "For QR scan issues:\n1. Increase screen brightness and clean screen glare.\n2. Re-open your pass/ticket QR from [navigate:dashboard].\n3. Ask conductor to verify via manual lookup if camera still fails.",
        "Want a quick checklist to avoid scan failures during boarding?"
      ),
  },
  {
    id: "routes_fares",
    roles: ["student", "admin", "conductor"],
    keywords: ["route", "fare", "timing", "distance", "stops", "price"],
    response: () =>
      withFollowUp(
        `Current routes:\n${ROUTE_SUMMARY}`,
        "Tell me your source and destination, and I can suggest the best route and pass duration."
      ),
  },
  {
    id: "admin_approve",
    roles: ["admin"],
    keywords: ["approve", "applications", "review", "reject", "pending"],
    response: () =>
      withFollowUp(
        "Approve applications from [navigate:admin]:\n1. Open a pending request.\n2. Verify student details, route, and payment.\n3. Approve to issue pass instantly, or Reject with a reason note.",
        "Need a fast checklist to reduce approval errors?"
      ),
  },
  {
    id: "admin_route_manage",
    roles: ["admin"],
    keywords: ["add route", "new route", "edit route", "route manager", "update fare"],
    response: () =>
      withFollowUp(
        "Manage routes via [navigate:routes]:\n1. Add/edit route name, source, destination, stops, fare, and distance.\n2. Enable only valid active routes.\n3. Save and verify route appears in student pass flow.",
        "If you want, I can give a route template format you can paste directly."
      ),
  },
  {
    id: "admin_announce",
    roles: ["admin"],
    keywords: ["announcement", "broadcast", "notify", "send message"],
    response: () =>
      withFollowUp(
        "Use [navigate:announce] to broadcast:\n1. Choose audience (all students or route specific).\n2. Select message type (info/warning/good news).\n3. Send and verify in notifications feed.",
        "I can draft a ready-to-send announcement if you tell me the scenario."
      ),
  },
  {
    id: "admin_analytics",
    roles: ["admin"],
    keywords: ["analytics", "revenue", "ridership", "stats", "report"],
    response: () =>
      withFollowUp(
        "Open [navigate:analytics] for daily/weekly/monthly trends in issued passes, revenue, and route demand. For exports and admin operations, use [navigate:hub].",
        "Need help interpreting low-demand routes or peak-hour spikes?"
      ),
  },
  {
    id: "admin_discount",
    roles: ["admin"],
    keywords: ["discount", "voucher", "coupon", "promo", "code"],
    response: () =>
      withFollowUp(
        "Create vouchers from [navigate:hub] under Discounts:\n1. Set code, percentage, and target students.\n2. Set validity period and max uses.\n3. Share code through announcement.",
        "If needed, I can suggest discount slabs for low-ridership routes."
      ),
  },
  {
    id: "conductor_scan",
    roles: ["conductor"],
    keywords: ["scan", "qr", "validate", "boarding", "scanner"],
    response: () =>
      withFollowUp(
        "From [navigate:conductor], tap SCAN QR CODE and verify status:\n- VALID: allow boarding\n- EXPIRED/INVALID: deny or verify manually\nUse [navigate:lookup] if QR cannot be scanned.",
        "I can also share a quick SOP for handling peak-hour queues."
      ),
  },
  {
    id: "conductor_camera",
    roles: ["conductor"],
    keywords: ["camera", "camera scan", "automatic scan", "jsqr"],
    response: () =>
      withFollowUp(
        "Use [navigate:camera] for continuous camera scanning. Keep stable lighting and hold the QR steady for 1-2 seconds for best detection.",
        "If scans are slow, I can give troubleshooting steps for camera focus and glare."
      ),
  },
  {
    id: "conductor_triplog",
    roles: ["conductor"],
    keywords: ["trip log", "daily report", "export", "pdf", "summary"],
    response: () =>
      withFollowUp(
        "Check [navigate:triplog] for valid/invalid scan counts and day summary. Export PDF at shift end for records.",
        "Need a recommended end-of-day closure checklist?"
      ),
  },
  {
    id: "conductor_lookup",
    roles: ["conductor"],
    keywords: ["lookup", "manual", "search student", "pass number", "id"],
    response: () =>
      withFollowUp(
        "Use [navigate:lookup] when QR fails:\n1. Enter student ID or pass number.\n2. Verify validity status and expiry.\n3. Log manual boarding if allowed by policy.",
        "If you want, I can provide quick rules for VALID vs EXPIRED exceptions."
      ),
  },
  {
    id: "password_reset",
    roles: ["student", "admin", "conductor"],
    keywords: ["forgot password", "reset password", "cant login", "can't login", "otp"],
    response: () =>
      withFollowUp(
        "Password reset flow:\n1. On login page, click Forgot password.\n2. Enter email and receive OTP.\n3. Verify OTP and set a new password.",
        "If OTP is delayed, check spam and retry after 60 seconds."
      ),
  },
];

function scoreIntent(normalizedQuestion, intent) {
  let score = 0;
  for (const kw of intent.keywords) {
    const phrase = normalizeText(kw);
    if (!phrase) continue;
    if (normalizedQuestion === phrase) {
      score += 6;
    } else if (normalizedQuestion.includes(phrase)) {
      score += Math.max(2, Math.floor(phrase.length / 6));
    }
  }
  return score;
}

function fallbackReply(role) {
  if (role === "admin") {
    return "I did not fully match that yet. I can still help with applications, route setup, analytics, announcements, discounts, and reports. Try opening [navigate:admin] or [navigate:hub].";
  }
  if (role === "conductor") {
    return "I did not fully match that yet. I can help with QR validation, camera scan, manual lookup, and trip logs. Try [navigate:conductor] or [navigate:lookup].";
  }
  return "I did not fully match that yet. I can help with applying/renewing pass, tickets, taxi booking, route/fare details, and payment issues. Try [navigate:dashboard] or [navigate:apply].";
}

function firstNavigatePage(text, role) {
  const match = (text || "").match(/\[navigate:([a-z]+)\]/);
  if (match?.[1]) return match[1];
  return ROLE_HOME_PAGE[role] || "dashboard";
}

function applyResponseMode(reply, mode, role) {
  if (!VALID_MODES.has(mode) || mode === "smart") {
    return reply;
  }

  if (mode === "troubleshoot") {
    if (/Quick checks:/i.test(reply)) return reply;
    return `${reply}\n\nQuick checks:\n1. Refresh once and retry.\n2. Re-login if status looks stale.\n3. If issue continues, share exact error text for a targeted fix.`;
  }

  // mode === "steps"
  if (/\n1\./.test(reply)) return reply;
  const page = firstNavigatePage(reply, role);
  return `${reply}\n\nStep-by-step:\n1. Open [navigate:${page}].\n2. Complete the form/action shown there and submit.\n3. Confirm status update, then continue.\n4. If blocked, share the exact message you see and I will give the next exact step.`;
}

export function getRoleAwareReply({ message, role, history = [], mode = "smart" }) {
  const safeMessage = (message || "").trim();
  const normalizedQuestion = normalizeText(safeMessage);
  const normalizedRole = normalizeRole(role);
  const normalizedMode = VALID_MODES.has(mode) ? mode : "smart";

  if (!normalizedQuestion) {
    return {
      reply: "Please type your question and I will help step-by-step.",
      intent: "empty",
      confidence: 1,
      navigate: ROLE_HOME_PAGE[normalizedRole],
    };
  }

  let best = null;
  for (const intent of INTENTS) {
    if (!intent.roles.includes(normalizedRole)) continue;
    const score = scoreIntent(normalizedQuestion, intent);
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }

  if (!best) {
    const lastRoleHint = history.length > 0 ? " If helpful, include route name, stop, or status text for a precise answer." : "";
    const fallback = `${fallbackReply(normalizedRole)}${lastRoleHint}`;
    return {
      reply: applyResponseMode(fallback, normalizedMode, normalizedRole),
      intent: "fallback",
      confidence: 0.2,
      navigate: ROLE_HOME_PAGE[normalizedRole],
    };
  }

  const responseText = best.intent.response(safeMessage, normalizedRole, history);
  const finalReply = applyResponseMode(responseText, normalizedMode, normalizedRole);
  const navMatch = finalReply.match(/\[navigate:([a-z]+)\]/);

  return {
    reply: finalReply,
    intent: best.intent.id,
    confidence: Math.min(1, best.score / 10),
    navigate: navMatch ? navMatch[1] : null,
  };
}
