import { useState } from "react";

export default function ContactAdminWidget({ username }) {
  const [open, setOpen]       = useState(false);
  const [mode, setMode]       = useState(null);
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

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
    const body    = encodeURIComponent(message);
    window.open(`mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 2000);
  };

  const handleSendWhatsApp = () => {
    window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 2000);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30" onClick={() => setOpen(false)} />
      )}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        aria-label="Contact Admin"
        title="Contact Admin"
        className="fixed bottom-5 left-5 z-50 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group cursor-pointer"
        style={{ width: 52, height: 52 }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <span className="absolute left-14 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Contact Admin
        </span>
      </button>

      {/* Popup panel */}
      {open && (
        <div
          className="fixed bottom-20 left-5 z-50 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm">👤</div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Contact Admin</p>
                <p className="text-blue-200 text-xs">Request task assignment</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/70 hover:text-white text-xl leading-none transition cursor-pointer">
              ×
            </button>
          </div>

          <div className="p-4 space-y-3">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Opening now!</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your message app should open.</p>
              </div>
            ) : mode === null ? (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Send a message to the admin to request task assignment for your account{" "}
                  <strong className="text-gray-700 dark:text-gray-200">{username}</strong>.
                </p>
                <button
                  onClick={() => setMode("email")}
                  className="w-full flex items-center gap-3 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl px-4 py-3 transition group cursor-pointer">
                  <span className="text-2xl">📧</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">Send Email</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{ADMIN_EMAIL}</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode("whatsapp")}
                  className="w-full flex items-center gap-3 bg-gray-50 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-950 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 rounded-xl px-4 py-3 transition group cursor-pointer">
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400">WhatsApp</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">+{ADMIN_PHONE}</p>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMode(null)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition cursor-pointer">
                    ← Back
                  </button>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    via {mode === "email" ? "Email" : "WhatsApp"}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
                />
                <button
                  onClick={mode === "email" ? handleSendEmail : handleSendWhatsApp}
                  disabled={!message.trim()}
                  className={`w-full text-white text-sm font-medium py-2.5 rounded-xl transition disabled:opacity-40 cursor-pointer ${
                    mode === "email" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-500 hover:bg-green-600"
                  }`}>
                  {mode === "email" ? "📧 Open Email App" : "📱 Open WhatsApp"}
                </button>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
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
