import { useState } from "react";

export default function ContactAdminWidget({ username }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE;

  const defaultMsg = `Hi Admin,\n\nI'm ${username || "a new user"} and I'd like to request a task assignment.\n\nPlease assign tasks to my account: ${username || ""}\n\nThank you!`;

  const handleOpen = () => {
    setOpen(true);
    setMode(null);
    setMessage(defaultMsg);
    setSent(false);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Task Assignment Request — ${username}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 2000);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${text}`, "_blank");
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 2000);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setOpen(false)} />
      )}

      <button
        onClick={handleOpen}
        aria-label="Contact Admin"
        title="Contact Admin"
        className="fixed bottom-5 left-5 z-50 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group"
        style={{ width: 52, height: 52 }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Contact Admin
        </span>
      </button>

      {open && (
        <div
          className="fixed bottom-20 left-5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">👤</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Contact Admin</p>
                <p className="text-blue-200 text-xs">Request task assignment</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/70 hover:text-white text-xl leading-none transition">×</button>
          </div>

          <div className="p-4 space-y-3">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-gray-700">Opening now!</p>
                <p className="text-xs text-gray-400 mt-1">Your message app should open.</p>
              </div>
            ) : mode === null ? (
              <>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Send a message to the admin to request task assignment for your account{" "}
                  <strong className="text-gray-700">{username}</strong>.
                </p>
                <button
                  onClick={() => setMode("email")}
                  className="w-full flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl px-4 py-3 transition group">
                  <span className="text-2xl">📧</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Send Email</p>
                    <p className="text-xs text-gray-400">{ADMIN_EMAIL}</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode("whatsapp")}
                  className="w-full flex items-center gap-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl px-4 py-3 transition group">
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">WhatsApp</p>
                    <p className="text-xs text-gray-400">+{ADMIN_PHONE}</p>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMode(null)} className="text-gray-400 hover:text-gray-600 text-sm transition">← Back</button>
                  <span className="text-xs text-gray-400">via {mode === "email" ? "Email" : "WhatsApp"}</span>
                </div>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <button
                  onClick={mode === "email" ? handleSendEmail : handleSendWhatsApp}
                  disabled={!message.trim()}
                  className={`w-full text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-40 ${mode === "email" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-500 hover:bg-green-600"}`}>
                  {mode === "email" ? "📧 Open Email App" : "📱 Open WhatsApp"}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  This will open your {mode === "email" ? "email client" : "WhatsApp"}.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
