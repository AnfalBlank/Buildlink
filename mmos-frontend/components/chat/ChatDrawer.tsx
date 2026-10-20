"use client";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, X, Send, Search, CheckCheck, Paperclip,
  Smile, User, Phone, Video, MoreVertical, Circle, ArrowLeft
} from "lucide-react";
import { users } from "@/lib/dummy-data";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
  status: "sent" | "delivered" | "read";
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  department: string;
  online: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

const initialContacts: ChatContact[] = [
  {
    id: "USR002",
    name: "Reza Mahendra",
    role: "Project Manager",
    department: "Project Management",
    online: true,
    lastMessage: "Fabrikasi Tangki 16KL on track, mohon cek material plate.",
    lastTime: "17:45",
    unreadCount: 2,
  },
  {
    id: "USR005",
    name: "Supri Santoso",
    role: "Production Manager",
    department: "Fabrikasi Pabrik",
    online: true,
    lastMessage: "Mesin rolling sedang standby menunggu material baru.",
    lastTime: "16:20",
    unreadCount: 0,
  },
  {
    id: "USR003",
    name: "Eko Prasetyo",
    role: "Chief Engineering",
    department: "R&D & Engineering",
    online: false,
    lastMessage: "Revisi drawing GA Rev.C sudah di-upload ke sistem.",
    lastTime: "14:10",
    unreadCount: 0,
  },
  {
    id: "USR006",
    name: "Andi QC",
    role: "Lead Inspector",
    department: "Quality Control",
    online: true,
    lastMessage: "Laporan NDT radiografi SN-TK-001 sudah selesai.",
    lastTime: "11:30",
    unreadCount: 1,
  },
  {
    id: "USR004",
    name: "Hadi Susanto",
    role: "Procurement Manager",
    department: "Pengadaan & Vendor",
    online: false,
    lastMessage: "PO Baja Krakatau Steel estimasi tiba lusa.",
    lastTime: "Kemarin",
    unreadCount: 0,
  },
  {
    id: "USR007",
    name: "Sinta Dewi",
    role: "Cost Control",
    department: "Keuangan",
    online: true,
    lastMessage: "Invoice down payment PTK sudah terverifikasi.",
    lastTime: "Kemarin",
    unreadCount: 0,
  },
];

const initialConversations: Record<string, Message[]> = {
  USR002: [
    {
      id: "m1",
      senderId: "USR002",
      text: "Selamat siang Pak Faisal, update untuk proyek Tangki BBM 16KL Pertamina saat ini progress sudah mencapai 42%.",
      timestamp: "17:40",
      isSelf: false,
      status: "read",
    },
    {
      id: "m2",
      senderId: "USR001",
      text: "Bagus. Bagaimana ketersediaan plat baja 8mm untuk bagian bottom plate?",
      timestamp: "17:42",
      isSelf: true,
      status: "read",
    },
    {
      id: "m3",
      senderId: "USR002",
      text: "Fabrikasi Tangki 16KL on track, mohon cek material plate di gudang agar tidak terjadi bottleneck.",
      timestamp: "17:45",
      isSelf: false,
      status: "read",
    },
  ],
  USR006: [
    {
      id: "m4",
      senderId: "USR006",
      text: "Laporan NDT radiografi SN-TK-001 sudah selesai dan lolos inspeksi 100%.",
      timestamp: "11:30",
      isSelf: false,
      status: "read",
    },
  ],
};

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ChatContact[]>(initialContacts);
  const [activeContactId, setActiveContactId] = useState<string>("USR002");
  const [conversations, setConversations] = useState<Record<string, Message[]>>(initialConversations);
  const [inputText, setInputText] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [mobileView, setMobileView] = useState<"contacts" | "chat">("contacts");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find(c => c.id === activeContactId) ?? contacts[0];
  const activeMessages = conversations[activeContactId] ?? [];

  // Scroll to bottom when message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeContactId]);

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      senderId: "USR001",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
      status: "sent",
    };

    setConversations(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    setContacts(prev =>
      prev.map(c =>
        c.id === activeContactId
          ? { ...c, lastMessage: newMsg.text, lastTime: newMsg.timestamp }
          : c
      )
    );

    const sentText = inputText.trim();
    setInputText("");

    // Simulate realistic instant automated reply from team member after 1.2s
    setTimeout(() => {
      const replies: Record<string, string[]> = {
        USR002: [
          "Siap Pak Faisal, segera saya koordinasikan dengan tim lapangan sekarang.",
          "Noted Pak, milestone laporan mingguan akan saya kirimkan sore ini.",
          "Baik Pak, kami pastikan timeline sesuai jadwal kesepakatan.",
        ],
        USR005: [
          "Lantai fabrikasi siap eksekusi perintah kerja selanjutnya Pak.",
          "Operator shift 1 sudah kami arahkan sesuai SOP terbaru.",
        ],
        USR006: [
          "Sertifikat hasil uji hydrostatic dan NDT sudah kami arsipkan di dokumen proyek.",
          "Semua parameter standar ASME & API 650 terpenuhi dengan baik.",
        ],
      };

      const userReplies = replies[activeContactId] || [
        "Baik Pak, pesan sudah diterima dan sedang diproses.",
      ];
      const randomReply = userReplies[Math.floor(Math.random() * userReplies.length)];

      const replyMsg: Message = {
        id: `reply_${Date.now()}`,
        senderId: activeContactId,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isSelf: false,
        status: "read",
      };

      setConversations(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), replyMsg],
      }));

      setContacts(prev =>
        prev.map(c =>
          c.id === activeContactId
            ? { ...c, lastMessage: replyMsg.text, lastTime: replyMsg.timestamp }
            : c
        )
      );

      toast.info(`Pesan Baru dari ${activeContact.name}`, randomReply);
    }, 1200);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.department.toLowerCase().includes(searchContact.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end select-none">
      {/* Light frosted backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-over Chat Drawer */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E2E8F0] animate-slide-left">
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                Internal Team Chat
                <span className="text-[10px] bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] px-2 py-0.5 rounded-full font-semibold">
                  Online
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">Komunikasi operasional lintas departemen MMOS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all cursor-pointer"
            title="Tutup Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body: 2 Columns (Contacts & Conversation) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Contact List */}
          <div
            className={cn(
              "w-full sm:w-72 border-r border-[#E2E8F0] bg-[#F8FAFC]/50 flex-col shrink-0",
              mobileView === "chat" ? "hidden sm:flex" : "flex"
            )}
          >
            {/* Search contacts */}
            <div className="p-3 border-b border-[#E2E8F0] bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Cari anggota tim..."
                  value={searchContact}
                  onChange={e => setSearchContact(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                />
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
              {filteredContacts.map(c => {
                const isSelected = c.id === activeContactId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveContactId(c.id);
                      setMobileView("chat");
                      setContacts(prev =>
                        prev.map(item => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                      );
                    }}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? "bg-[#EFF6FF] border-l-4 border-l-[#2563EB]" : "hover:bg-white"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      {c.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#16A34A] rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                          {c.name}
                        </p>
                        <span className="text-[10px] text-[#94A3B8] font-mono shrink-0">{c.lastTime}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-medium">{c.role}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{c.lastMessage}</p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-[#2563EB] text-white rounded-full text-[9px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Conversation Window */}
          <div
            className={cn(
              "flex-1 flex-col bg-white overflow-hidden",
              mobileView === "contacts" ? "hidden sm:flex" : "flex"
            )}
          >
            {/* Active Contact Header */}
            <div className="px-4 py-3 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileView("contacts")}
                  className="sm:hidden p-1.5 -ml-1 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors cursor-pointer shrink-0"
                  title="Kembali ke Daftar Kontak"
                  aria-label="Kembali ke Daftar Kontak"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center">
                    {activeContact.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  {activeContact.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#16A34A] rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[#0F172A] truncate">{activeContact.name}</h3>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {activeContact.role} · <span className="text-[#2563EB] font-medium">{activeContact.department}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md font-mono">
                  {activeContact.online ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
              <div className="text-center my-2">
                <span className="text-[10px] text-[#94A3B8] bg-white border border-[#E2E8F0] px-3 py-1 rounded-full font-medium">
                  Hari ini
                </span>
              </div>

              {activeMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.isSelf ? "justify-end" : "justify-start"}`}
                >
                  {!msg.isSelf && (
                    <div className="w-7 h-7 rounded-lg bg-[#CBD5E1] text-[#0F172A] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {activeContact.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                      msg.isSelf
                        ? "bg-[#2563EB] text-white rounded-br-xs"
                        : "bg-white text-[#0F172A] border border-[#E2E8F0] rounded-bl-xs"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        msg.isSelf ? "text-blue-100" : "text-[#94A3B8]"
                      }`}
                    >
                      <span className="font-mono">{msg.timestamp}</span>
                      {msg.isSelf && <CheckCheck size={12} className="text-blue-200" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-1.5 bg-white border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto text-[11px] text-[#475569]">
              <span className="text-[10px] text-[#94A3B8] shrink-0 font-medium">Cepat:</span>
              <button
                type="button"
                onClick={() => setInputText("Tolong update status WO shop floor.")}
                className="px-2.5 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] shrink-0 transition-colors"
              >
                Update WO
              </button>
              <button
                type="button"
                onClick={() => setInputText("Mohon verifikasi QC inspection sebelum dirilis.")}
                className="px-2.5 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] shrink-0 transition-colors"
              >
                Verifikasi QC
              </button>
              <button
                type="button"
                onClick={() => setInputText("Material plat baja sudah tiba di gudang.")}
                className="px-2.5 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] shrink-0 transition-colors"
              >
                Material Tiba
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
                title="Lampirkan Dokumen / Drawing"
                onClick={() => toast.info("Lampiran", "Fitur upload file gambar/drawing aktif.")}
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder={`Ketik pesan ke ${activeContact.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Kirim (Enter)"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
