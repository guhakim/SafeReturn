import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  ShieldCheck, 
  Printer, 
  RefreshCw, 
  Check, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Bell, 
  Database, 
  Code, 
  Layers, 
  Eye, 
  ChevronRight, 
  User, 
  AlertCircle,
  HelpCircle,
  Hash,
  Laptop,
  CheckCircle2,
  Trash2
} from "lucide-react";

// ==================== TYPES & INTERFACES ====================
interface Item {
  id: string;
  name: string;
  contact: string;
  password?: string;
  createdAt: string;
}

interface Message {
  id: string;
  sender: "owner" | "finder" | "system";
  message: string;
  time: string;
}

interface ChatRoom {
  id: string;
  itemId: string;
  createdAt: string;
  messages: Message[];
}

// 해시 URL에서 /find/:id 파싱
function getFinderIdFromHash(): string | null {
  const hash = window.location.hash; // e.g. "#/find/SR-721842"
  const match = hash.match(/^#\/find\/(.+)$/);
  return match ? match[1] : null;
}

export default function App() {
  // 해시 기반 라우팅: QR 스캔 시 /find/:id 뷰 진입
  const [hashFinderId, setHashFinderId] = useState<string | null>(() => getFinderIdFromHash());

  useEffect(() => {
    const onHashChange = () => setHashFinderId(getFinderIdFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Global Mock Database States (React State serves as our client-side Realtime database)
  const [items, setItems] = useState<Item[]>([
    { id: "SR-721842", name: "에어팟 맥스 (실버)", contact: "010-1234-5678", password: "1234", createdAt: "2026-06-19 오후 2:30" },
    { id: "SR-109581", name: "맥북 프로 14인치 스페이스 그레이", contact: "010-9876-5432", password: "1234", createdAt: "2026-06-19 오후 5:10" }
  ]);

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: "room-98213",
      itemId: "SR-721842",
      createdAt: "오후 2:31",
      messages: [
        { id: "m1", sender: "system", message: "🚨 안심 익명 채팅방이 개설되었습니다.", time: "오후 2:31" },
        { id: "m2", sender: "owner", message: "안녕하세요! 제 에어팟 맥스를 찾아주셔서 정말 감사합니다. 분실 장소가 강남역 근처였을까요?", time: "오후 2:32" },
        { id: "m3", sender: "finder", message: "네, 강남역 11번 출구 앞 카페에서 습득했습니다. 케이스에 작은 스티커가 붙어있는걸 확인했어요.", time: "오후 2:33" }
      ]
    }
  ]);

  // UI Navigation / Tab control
  // Views: 
  // - "explore" (Main SafeReturn entry with Interactive Playground Panel)
  // - "code" (Supabase / Next.js implementation helper)
  const [activeTab, setActiveTab] = useState<"explore" | "code">("explore");
  
  // Custom Playground Mode Switch (Single screen view or split-screen monitor)
  const [splitScreen, setSplitScreen] = useState<boolean>(() => window.innerWidth >= 1024);
  const [mobileActivePanel, setMobileActivePanel] = useState<"owner" | "finder">("owner");

  // Active Chat Selection in simulated panels
  const [activeOwnerRoomId, setActiveOwnerRoomId] = useState<string>("room-98213");
  const [activeFinderRoomId, setActiveFinderRoomId] = useState<string>("room-98213");

  // Real-time Event Broadcaster Notifications for the dashboard
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: "alert" | "success" }[]>([]);

  // Form States for creating new sticker
  const [newItemName, setNewItemName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [generatedSticker, setGeneratedSticker] = useState<Item | null>(null);

  // Dashboard Authorization State
  const [dashboardPassword, setDashboardPassword] = useState("");
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(true);
  const [activeDashboardItemId, setActiveDashboardItemId] = useState<string>("SR-721842");

  // Finder Scanned View state
  const [scannedItemId, setScannedItemId] = useState<string>("SR-721842");
  const [finderStep, setFinderStep] = useState<"landing" | "chat">("landing");
  
  // Custom live inputs
  const [finderInput, setFinderInput] = useState("");
  const [ownerInput, setOwnerInput] = useState("");

  const chatEndOwnerRef = useRef<HTMLDivElement>(null);
  const chatEndFinderRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Effects
  useEffect(() => {
    chatEndOwnerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatRooms, activeOwnerRoomId]);

  useEffect(() => {
    chatEndFinderRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatRooms, activeFinderRoomId, finderStep]);

  // Real-time Event Helper: Push notification to Dashboard simulated console
  const triggerNotification = (title: string, msg: string, type: "alert" | "success" = "success") => {
    const id = String(Date.now());
    setNotifications(prev => [{ id, title, message: msg, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // 1. ISSUER FLOW: Handle creation of new lost items (Stickers)
  const handleCreateSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newContact || newPassword.length < 4) return;

    const randomId = "SR-" + Math.floor(100000 + Math.random() * 900000);
    const newItem: Item = {
      id: randomId,
      name: newItemName,
      contact: newContact,
      password: newPassword,
      createdAt: new Date().toLocaleDateString("ko-KR", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }) + " 오후 " + new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "numeric" })
    };

    setItems(prev => [newItem, ...prev]);
    setGeneratedSticker(newItem);
    setActiveDashboardItemId(randomId); // Auto-focus on new item
    triggerNotification("📦 QR 단말 신규 등록", `성공적으로 '${newItemName}' 스티커 정보가 DB에 저장되었습니다.`, "success");
  };

  // 2. FINDER CHAT CREATION FLOW (The 1:N Relationship in Action!)
  // 습득자가 '주인과 실시간 채팅하기' 단추를 누르면 새로운 채팅방 레코드 chat_rooms가 itemId 외래키를 갖고 자동 INSERT 및 Realtime 구독 유발
  const handleStartFinderChat = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Check if an active chat room already exists or generate a brand new one to showcase 1:N multiple finders
    const newRoomId = "room-" + Math.floor(10000 + Math.random() * 90000);
    const newChatRoom: ChatRoom = {
      id: newRoomId,
      itemId: itemId,
      createdAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
      messages: [
        { id: "sys-start", sender: "system", message: `🚨 ${item.name} 안심 익명 채팅방이 실시간 매칭되었습니다.`, time: "" },
        { id: "sys-notify", sender: "system", message: "🔒 종단간 암호화 기술로 안전한 익명 연결이 보장됩니다.", time: "" }
      ]
    };

    setChatRooms(prev => [...prev, newChatRoom]);
    setActiveFinderRoomId(newRoomId);
    setFinderStep("chat");

    // Realtime Hook trigger on Owner Dashboard!
    // Triggers real-time alert notice on the owner's viewport instantly.
    triggerNotification(
      "⚡ Supabase Realtime INSERT 감지",
      `'chat_rooms' 테이블에 item_id (${itemId})를 연계한 신규 대화방(${newRoomId})이 자동 생성되었습니다!`,
      "alert"
    );

    // Auto set the active room for the owner so they don't miss it or can toggle
    setActiveOwnerRoomId(newRoomId);
  };

  // 3. BROADCAST MESSAGES: Syncs instantly across Owner and Finder via our React Client Bridge
  const sendMessage = (sender: "owner" | "finder", roomId: string, text: string) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString("ko-KR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });

    const newMsg: Message = {
      id: "msg-" + Date.now(),
      sender: sender,
      message: text,
      time: timeString
    };

    // Update real-time chat room array
    setChatRooms(prev => prev.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          messages: [...room.messages, newMsg]
        };
      }
      return room;
    }));

    // Trigger developer notification console to inform relational binding
    triggerNotification(
      "📨 Supabase Realtime Broadcast",
      `Channel 'room:${roomId}' 로부터 '${sender === "owner" ? "주인" : "습득자"}'의 실시간 수신 메시지가 연동되었습니다.`,
      "success"
    );
  };

  const generatedStickerId = generatedSticker?.id || "SR-721842";
  const finderUrl = `${window.location.origin}${window.location.pathname}#/find/${generatedStickerId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(finderUrl)}&color=1e293b`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col justify-between font-sans antialiased text-gray-950 overflow-x-hidden">

      {/* ===== 습득자 전용 뷰 (QR 스캔 시 진입) ===== */}
      {hashFinderId && (() => {
        const foundItem = items.find(i => i.id === hashFinderId);
        return (
          <div className="min-h-screen flex flex-col bg-white">
            {/* 헤더 */}
            <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2 sticky top-0 z-40">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-base text-gray-900">SafeReturn</span>
                <p className="text-[10px] text-gray-400 font-medium">안심 분실물 찾기</p>
              </div>
            </header>

            {!foundItem ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="text-5xl">😢</div>
                <h2 className="text-lg font-bold text-gray-800">등록되지 않은 QR입니다</h2>
                <p className="text-sm text-gray-500">ID: {hashFinderId}</p>
                <button onClick={() => { window.location.hash = ""; }} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">홈으로</button>
              </div>
            ) : (() => {
              const existingRoom = chatRooms.find(r => r.itemId === hashFinderId && r.id === activeFinderRoomId);
              const inChat = finderStep === "chat" && !!existingRoom;
              return (
                <div className="flex-1 flex flex-col max-w-lg mx-auto w-full p-4 gap-4">
                  {!inChat ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6 pt-4">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto">🎁</div>
                        <h2 className="text-xl font-bold text-gray-900">소중한 분실물을 발견하셨군요!</h2>
                        <p className="text-sm text-gray-500">주인의 <span className="font-bold text-blue-600">{foundItem.name}</span> 입니다.<br/>주인에게 연락해 하루를 되돌려주세요.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div className="h-36 bg-slate-200 rounded-xl overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400" alt="" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                        <p className="text-center font-mono text-[11px] text-slate-500 mt-2">분실물 ID: <span className="text-blue-600 font-bold">{hashFinderId}</span></p>
                      </div>

                      <div className="space-y-3">
                        <a href="tel:0507-1249-1951" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> 안심번호 전화 걸기 (0507)
                        </a>
                        <button
                          onClick={() => handleStartFinderChat(hashFinderId)}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                        >
                          <MessageSquare className="w-4 h-4" /> 주인과 익명 채팅하기
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 text-center">* 편의점 반값 택배함 또는 지하철 보관함 이용을 추천할 수 있습니다.</p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-2 py-2 border-b border-gray-100">
                        <button onClick={() => setFinderStep("landing")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft className="w-4 h-4" /></button>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{foundItem.name} — 익명 채팅</h4>
                          <p className="text-[10px] text-emerald-600">🔒 안전한 익명 연결</p>
                        </div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-2xl p-3 overflow-y-auto space-y-2 min-h-[300px] max-h-[50vh]">
                        {chatRooms.find(r => r.id === activeFinderRoomId)?.messages.map(m => {
                          if (m.sender === "system") return <p key={m.id} className="text-[10px] text-gray-400 text-center italic">{m.message}</p>;
                          const isMe = m.sender === "finder";
                          return (
                            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                              <div className={`p-2.5 rounded-xl text-xs font-medium max-w-[80%] ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"}`}>{m.message}</div>
                              <span className="text-[8px] text-gray-400 mt-0.5">{m.time}</span>
                            </div>
                          );
                        })}
                        <div ref={chatEndFinderRef} />
                      </div>

                      <form onSubmit={e => { e.preventDefault(); sendMessage("finder", activeFinderRoomId, finderInput); setFinderInput(""); }} className="flex gap-2">
                        <input value={finderInput} onChange={e => setFinderInput(e.target.value)} placeholder="메시지를 입력하세요..." className="flex-1 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        <button type="submit" className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0"><Send className="w-4 h-4" /></button>
                      </form>
                    </motion.div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ===== 일반 앱 뷰 (hashFinderId 없을 때만 표시) ===== */}
      {!hashFinderId && <>

      {/* HTML Sticker Printing styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
            background: none !important;
          }
          #print-sticker-element, #print-sticker-element * {
            visibility: visible !important;
          }
          #print-sticker-element {
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            border: 4px dashed #2563EB !important;
            padding: 32px !important;
            border-radius: 20px !important;
            background: white !important;
            width: 290px !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}} />

      {/* Global Realtime App Header */}
      <header className="bg-white border-b border-gray-200/80 shadow-xs px-3 sm:px-6 py-3 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900">SafeReturn</span>
                <span className="hidden sm:flex bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-emerald-100 items-center gap-0.5">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Realtime
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium hidden sm:block">안심 QR 분실물 실시간 매칭 시스템</p>
            </div>
          </div>


        </div>
      </header>

      {/* Real-time Toast Notifications Manager */}
      <div className="fixed right-2 bottom-2 sm:right-4 sm:bottom-4 z-50 max-w-[calc(100vw-16px)] sm:max-w-sm w-full space-y-2 pointer-events-none print:hidden">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-xl border text-left flex items-start gap-3 pointer-events-auto ${
                notif.type === "alert" 
                  ? "bg-slate-900 text-white border-blue-500/30" 
                  : "bg-white text-gray-900 border-emerald-100"
              }`}
            >
              <div className={`mt-0.5 p-1 rounded-md ${
                notif.type === "alert" ? "bg-blue-600/30 text-blue-400" : "bg-emerald-100 text-emerald-600"
              }`}>
                {notif.type === "alert" ? <Bell className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">{notif.title}</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{notif.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* EXPLOER PORT: Real-time Multi-View Simulator Layout                       */}
      {/* ========================================================================= */}
      {activeTab === "explore" && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex-1 flex flex-col gap-4 sm:gap-6 print:p-0">


          {/* Mobile responsive tab switcher for Playground simulations (hidden on desktop lg) */}
          <div className="flex lg:hidden bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner sticky top-[57px] z-30">
            <button
              onClick={() => setMobileActivePanel("owner")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mobileActivePanel === "owner"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              주인 대시보드
            </button>
            <button
              onClick={() => setMobileActivePanel("finder")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mobileActivePanel === "finder"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="text-sm">🎁</span>
              습득자 안심 접수
            </button>
          </div>

          <div className={`grid gap-6 ${splitScreen ? "lg:grid-cols-2" : "grid-cols-1"}`}>
            
            {/* ========================================================== */}
            {/* PANEL A: OWNER VIEW & STICKER ISSUER (좌측: 주인 대시보드)    */}
            {/* ========================================================== */}
            <div className={`space-y-6 flex flex-col ${
              splitScreen 
                ? (mobileActivePanel === "owner" ? "flex" : "hidden lg:flex") 
                : (mobileActivePanel === "owner" ? "flex" : "hidden")
            }`}>
              
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden flex flex-col flex-1">
                {/* Header of Owners panel */}
                <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-blue-400" />
                    <span className="font-extrabold text-sm tracking-tight">주인 대시보드</span>
                    <span className="bg-slate-800 text-[10px] text-gray-400 font-mono px-2 py-0.5 rounded">
                      ID/Password Auth
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    실시간 WebSocket 리스너 활성화
                  </div>
                </div>

                {/* Sub Tab selection inside dashboard */}
                <div className="bg-slate-50 border-b border-gray-100 p-2.5 flex gap-2 text-xs">
                  <button
                    onClick={() => setIsDashboardUnlocked(true)}
                    className={`flex-1 py-2 px-1 rounded-xl font-bold text-center transition-all ${
                      isDashboardUnlocked ? "bg-white text-slate-900 border border-gray-200/50 shadow-xs" : "text-gray-500 hover:text-slate-900"
                    }`}
                  >
                    대시보드 메인 (/dashboard)
                  </button>
                  <button
                    onClick={() => setIsDashboardUnlocked(false)}
                    className={`flex-1 py-2 px-1 rounded-xl font-bold text-center transition-all ${
                      !isDashboardUnlocked ? "bg-white text-slate-900 border border-gray-200/50 shadow-xs" : "text-gray-500 hover:text-slate-900"
                    }`}
                  >
                    ➕ 새 안심 스티커 발급
                  </button>
                </div>

                {/* Main panel displays */}
                <div className="p-3 sm:p-5 md:p-8 flex-1 flex flex-col justify-between">

                  {isDashboardUnlocked ? (
                    // Display Main dynamic Dashboard
                    <div className="space-y-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900">🛡️ 내 분실 스티커 실시간 관리</h3>
                            <p className="text-xs text-gray-500">각 물건의 안심 QR 스티커가 수신될 때 실시간 즉시 연결됩니다.</p>
                          </div>
                          <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-1 rounded-md">
                            총 {items.length}개 보관
                          </span>
                        </div>

                        {/* List of Registered Stickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {items.map((item) => {
                            const isSelected = activeDashboardItemId === item.id;
                            const roomCount = chatRooms.filter(r => r.itemId === item.id).length;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setActiveDashboardItemId(item.id);
                                  const linkedRoom = chatRooms.find(r => r.itemId === item.id);
                                  if (linkedRoom) setActiveOwnerRoomId(linkedRoom.id);
                                }}
                                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-blue-50/50 border-blue-500/40 ring-2 ring-blue-500/10 shadow-sm"
                                    : "bg-white border-gray-200/80 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono tracking-wider font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                                    {item.id}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {roomCount > 0 && (
                                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                                        연락 {roomCount}건 수신!
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`'${item.name}' 스티커를 삭제할까요?`)) {
                                          setItems(prev => prev.filter(i => i.id !== item.id));
                                          setChatRooms(prev => prev.filter(r => r.itemId !== item.id));
                                          if (activeDashboardItemId === item.id) {
                                            const remaining = items.filter(i => i.id !== item.id);
                                            setActiveDashboardItemId(remaining[0]?.id || "");
                                          }
                                        }
                                      }}
                                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mt-2 truncate">{item.name}</h4>
                                <p className="text-[11px] text-gray-400 font-medium mt-1">등록일: {item.createdAt}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* 1:N Chat Rooms related to the selected item */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">
                            🔌 수신된 실시간 대화 채널 리스트 (1:N 매칭 확인)
                          </label>
                          
                          {chatRooms.filter(r => r.itemId === activeDashboardItemId).length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-xs">
                              <Bell className="w-7 h-7 mx-auto stroke-1 mb-2.5 text-gray-300" />
                              아직 본 물건으로 들어온 익명 습득자 연락이 없습니다.<br/>
                              <strong className="text-blue-500">우측 응대화면</strong>에서 채팅을 시작해 보세요!
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {chatRooms.filter(r => r.itemId === activeDashboardItemId).map((room) => {
                                const isSelected = activeOwnerRoomId === room.id;
                                const lastMsg = room.messages[room.messages.length - 1];
                                return (
                                  <div
                                    key={room.id}
                                    onClick={() => setActiveOwnerRoomId(room.id)}
                                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-gray-50 hover:bg-gray-100 border-gray-100"
                                    }`}
                                  >
                                    <div className="flex-1 space-y-0.5 text-left min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 px-1.5 rounded">
                                          {room.id}
                                        </span>
                                        <p className="text-[11px] font-bold truncate">습득자와의 연락 채널</p>
                                      </div>
                                      <p className={`text-xs truncate ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                                        마지막 내용: {lastMsg ? lastMsg.message : "대화 시작"}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{room.createdAt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Selected Owner Live Chat Panel */}
                        {activeOwnerRoomId && chatRooms.find(r => r.id === activeOwnerRoomId) && (
                          <div className="border border-gray-200 rounded-2xl bg-gray-50/50 p-4 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                              <div>
                                <h4 className="text-xs font-extrabold text-gray-900">
                                  💬 Realtime Channel : <span className="font-mono text-blue-600">room:{activeOwnerRoomId}</span>
                                </h4>
                                <p className="text-[10px] text-emerald-600 font-medium">안전한 E2E 익명 통신 중</p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                매칭 완료
                              </span>
                            </div>

                            {/* Messages render */}
                            <div className="max-h-[160px] overflow-y-auto space-y-2 text-left p-1">
                              {chatRooms.find(r => r.id === activeOwnerRoomId)?.messages.map((m) => {
                                if (m.sender === "system") {
                                  return (
                                    <p key={m.id} className="text-[10px] text-gray-400 text-center italic">{m.message}</p>
                                  );
                                }
                                const isMe = m.sender === "owner";
                                return (
                                  <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                    <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                                      isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                                    }`}>
                                      {m.message}
                                    </div>
                                    <span className="text-[8px] text-gray-400 mt-0.5 font-mono">{m.time}</span>
                                  </div>
                                );
                              })}
                              <div ref={chatEndOwnerRef} />
                            </div>

                            {/* Send form */}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage("owner", activeOwnerRoomId, ownerInput);
                                setOwnerInput("");
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="text"
                                value={ownerInput}
                                onChange={(e) => setOwnerInput(e.target.value)}
                                placeholder="습득자에게 안심 비공개 답장을 작성해보세요."
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-gray-900"
                              />
                              <button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-950 text-white rounded-lg px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-center"
                              >
                                전송
                              </button>
                            </form>
                          </div>
                        )}

                      </div>

                      {/* Info and Tips */}
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/30 flex items-start gap-2.5 text-left text-[11px] text-blue-800 font-medium leading-relaxed">
                        <Database className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p>
                          <strong>Supabase Realtime Trigger:</strong> 습득자가 오른쪽 화면에서 보낸 실시간 채팅 메시지는 <code>PUBLIC.chat_messages</code>에 신규 INSERT 이벤트를 통해 즉각 대시보드로 브로드캐스트 됩니다.
                        </p>
                      </div>

                    </div>
                  ) : (
                    // Display Issuer Sticker Form
                    <div className="space-y-6 text-left">
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-extrabold text-slate-900">🔒 안심 분실 스티커 신규 발급</h3>
                        <p className="text-xs text-gray-500">회원가입이 필요 없습니다. 안전한 고유 QR 코드로 분실물을 지키세요.</p>
                      </div>

                      {generatedSticker ? (
                        /* Generated code display & printable view */
                        <div className="space-y-6">
                          
                          <div 
                            id="print-sticker-element"
                            className="border-3 border-dashed border-blue-600 p-5 rounded-2xl bg-slate-50 text-center space-y-4 max-w-[240px] mx-auto shadow-inner"
                          >
                            <div className="w-32 h-32 bg-white p-2.5 rounded-xl border border-gray-100 flex items-center justify-center mx-auto shadow-xs">
                              {qrImageUrl ? (
                                <img src={qrImageUrl} alt="QR Placeholder" className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full bg-slate-200 animate-pulse" />
                              )}
                            </div>
                            <div className="space-y-1 text-center">
                              <span className="text-[9px] font-mono font-extrabold tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {generatedSticker.id}
                              </span>
                              <h4 className="text-md font-extrabold text-slate-900 truncate">
                                {generatedSticker.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium">SafeReturn 안심분실물스티커</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handlePrint}
                              className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                            >
                              <Printer className="w-4 h-4" />
                              🖨️ 스티커 인쇄하기
                            </button>
                            <button
                              onClick={() => {
                                setGeneratedSticker(null);
                                setNewItemName("");
                                setNewContact("");
                                setNewPassword("");
                              }}
                              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs transition-all"
                            >
                              뒤로가기
                            </button>
                          </div>

                          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                            * 인쇄하기를 누르면 점선 테두리영역만 깔끔하게 용지에 자동 출력되도록 미디어 쿼리가 구성되어 있습니다.
                          </p>

                        </div>
                      ) : (
                        <form onSubmit={handleCreateSticker} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">물건 이름 (별칭)</label>
                            <input
                              type="text"
                              required
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              placeholder="맥북 프로, 갤럭시 버즈, 골프 가방 등"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">실제 연락처</label>
                            <input
                              type="tel"
                              required
                              value={newContact}
                              onChange={(e) => setNewContact(e.target.value)}
                              placeholder="010-0000-0000"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900"
                            />
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50/50 p-1.5 rounded-lg font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>실제 연락처는 고도로 안전하게 단방향 암호화 처리됩니다.</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-600">수정/수거용 비밀번호 (4자리 이상)</label>
                            <input
                              type="password"
                              required
                              minLength={4}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="비밀번호 4자리 숫자 설정"
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-900"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-bold text-xs tracking-wider transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 uppercase mt-4"
                          >
                            무료 안심 QR 분실물 스티커 만들기
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              </div>
              
            </div>

            {/* ========================================================== */}
            {/* PANEL B: FINDER SCAN RESOLVING VIEW (우측: 습득자 응대 화면)    */}
            {/* ========================================================== */}
            <div className={`space-y-6 flex flex-col ${
              splitScreen 
                ? (mobileActivePanel === "finder" ? "flex" : "hidden lg:flex") 
                : (mobileActivePanel === "finder" ? "flex" : "hidden")
            }`}>
              
              <div className="bg-white rounded-3xl border border-gray-200/80 shadow-md overflow-hidden flex flex-col flex-1">
                {/* Header of Finders panel */}
                <div className="bg-emerald-500 text-white px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <span className="font-extrabold text-sm tracking-tight">습득자 안심 접수 페이지</span>
                    <span className="bg-emerald-600/50 text-[10px] font-mono px-2 py-0.5 rounded">
                      Scanned View (/find/[id])
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600/30 px-2 py-1 rounded">
                    안심 링크 활성화
                  </div>
                </div>

                {/* Sub control menu for selecting which item has been scanned */}
                <div className="bg-emerald-50/50 border-b border-emerald-100/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-left">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="font-bold text-emerald-800 shrink-0">모의 스캔 아이템 선택:</span>
                    <select
                      value={scannedItemId}
                      onChange={(e) => {
                        setScannedItemId(e.target.value);
                        setFinderStep("landing");
                      }}
                      className="bg-white border border-gray-200 rounded-lg text-xs p-1 font-medium text-gray-800 outline-none focus:ring-2 focus:ring-emerald-250 shrink-0"
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={() => setFinderStep("landing")}
                    className="text-emerald-700 font-bold hover:underline self-end sm:self-auto shrink-0"
                  >
                    스캔 초기 리셋
                  </button>
                </div>

                {/* Interactive Finder content panels */}
                <div className="p-3 sm:p-5 md:p-8 flex-1 flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    
                    {finderStep === "landing" ? (
                      /* Landing view for finder */
                      <motion.div
                        key="finder-landing-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6 text-center flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-5">
                          {/* Emoticon / Head */}
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm border border-blue-100/30">
                            🎁
                          </div>

                          <div className="space-y-2">
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
                              소중한 분실물을 발견하셨군요!
                            </h2>
                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                              주인의 소중한 <span className="font-extrabold text-blue-600">[{items.find(i => i.id === scannedItemId)?.name || "등록 물건"}]</span> 입니다.<br/>
                              주인에게 신속히 연락해 소중한 하루를 되돌려주세요.
                            </p>
                          </div>

                          {/* Object Visual context card */}
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 max-w-sm mx-auto">
                            <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative shadow-inner">
                              <img 
                                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400" 
                                alt="Demo Accessory profile representation"
                                className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
                              />
                              <div className="absolute top-2 left-2 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap shadow-xs">
                                Verified Secure QR Stamped
                              </div>
                            </div>
                            <div className="text-center font-mono text-[10px] font-bold text-slate-500">
                              스캔된 분실물 ID: <span className="text-blue-600">{scannedItemId}</span>
                            </div>
                          </div>

                          {/* Trigger Options */}
                          <div className="space-y-2.5 max-w-sm mx-auto">
                            <a
                              href="tel:0507-1249-1951"
                              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                            >
                              <Phone className="w-4 h-4 text-emerald-100" />
                              📞 안심번호 가상전화 걸기 (0507)
                            </a>

                            <button
                              onClick={() => handleStartFinderChat(scannedItemId)}
                              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                            >
                              <MessageSquare className="w-4 h-4 text-blue-100" />
                              💬 주인과 실시간 채팅하기 (1:N 자동 매칭)
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-gray-400 leading-normal font-medium max-w-xs mx-auto">
                          * 직접 전속대면이 부담스러우시다면 분실 대화방에서 편의점 반값 택배함 또는 지하철 보관함 사용을 편하게 추천할 수 있습니다.
                        </p>
                      </motion.div>
                    ) : (
                      /* Chat room view for finder */
                      <motion.div
                        key="finder-chat-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 flex flex-col flex-1"
                      >
                        {/* Header bar of Finder Chat panel */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 bg-gray-50/50 p-2 rounded-xl">
                          <button
                            onClick={() => setFinderStep("landing")}
                            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">
                              [{items.find(i => i.id === scannedItemId)?.name || "대화방"}] 주인과 익명 채팅
                            </h4>
                            <p className="text-[9px] text-gray-400">Room ID: {activeFinderRoomId}</p>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>

                        {/* Message log renders */}
                        <div className="bg-gray-50/70 border border-gray-100/50 rounded-2xl p-4 h-[240px] overflow-y-auto space-y-3 text-left">
                          {chatRooms.find(r => r.id === activeFinderRoomId)?.messages.map((m) => {
                            if (m.sender === "system") {
                              return (
                                <p key={m.id} className="text-[10px] text-gray-400 text-center italic">{m.message}</p>
                              );
                            }
                            const isMe = m.sender === "finder";
                            return (
                              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                                  isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                                }`}>
                                  {m.message}
                                </div>
                                <span className="text-[8px] text-gray-400 mt-0.5 font-mono">{m.time}</span>
                              </div>
                            );
                          })}
                          <div ref={chatEndFinderRef} />
                        </div>

                        {/* Input tools */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage("finder", activeFinderRoomId, finderInput);
                            setFinderInput("");
                          }}
                          className="flex items-center gap-1.5"
                        >
                          <input
                            type="text"
                            value={finderInput}
                            onChange={(e) => setFinderInput(e.target.value)}
                            placeholder="물건을 획득하신 상황이나 비공개 메시지를 적어주세요."
                            className="flex-1 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900"
                          />
                          <button
                            type="submit"
                            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold tracking-wide"
                          >
                            <Send className="w-4 h-4 text-white" />
                          </button>
                        </form>

                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

              </div>
              
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* CODE PORT: Beautiful relational guidelines & production copies          */}
      {/* ========================================================================= */}
      {activeTab === "code" && (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col gap-6 text-left">
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              1:N 데이터베이스 설계 및 실시간 (Realtime) 연동 가이드
            </h2>
            <p className="text-xs text-gray-500 leading-normal">
              구글 시트 프로토타이핑을 넘어 Next.js / Supabase / PostgreSQL에 즉각 이식 및 적용 가능한 프로덕션 레벨의 구독 통합 코드라인입니다.
            </p>
          </div>

          {/* DDL Schema View */}
          <div className="bg-slate-900 text-gray-300 rounded-2xl p-6 space-y-4 shadow-lg overflow-x-auto">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                PostgreSQL Schema DDL
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">1:N 릴레이션 관계 설정 DDL 쿼리</h3>
            </div>
            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl leading-relaxed whitespace-pre font-medium overflow-x-auto">
              {SCHEMA_DDL_CODE}
            </pre>
          </div>

          {/* Real-time hook subscribe guidelines */}
          <div className="bg-slate-900 text-gray-300 rounded-2xl p-6 space-y-4 shadow-lg overflow-x-auto">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2563EB]">
                Supabase Realtime TypeScript / Next.js
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">주인 대시보드 실시간 INSERT 리스너 바인딩 코드</h3>
            </div>
            <pre className="text-xs font-mono text-blue-300 bg-slate-950 p-4 rounded-xl leading-relaxed whitespace-pre font-medium overflow-x-auto">
              {DASHBOARD_CODE_STRING}
            </pre>
          </div>

          {/* Singleroom realtime chat stream code */}
          <div className="bg-slate-900 text-gray-300 rounded-2xl p-6 space-y-4 shadow-lg overflow-x-auto">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                Production Client Chat Stream
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">대화방 ID (room:roomId) 기준의 개별 브로드캐스트 스트리밍</h3>
            </div>
            <pre className="text-xs font-mono text-emerald-300 bg-slate-950 p-4 rounded-xl leading-relaxed whitespace-pre font-medium overflow-x-auto">
              {CHAT_CODE_STRING}
            </pre>
          </div>

        </div>
      )}

      {/* Footer view */}
      <footer className="bg-white border-t border-gray-200/80 py-6 text-center text-xs text-gray-400 font-semibold print:hidden mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
          <p>© 2024 SafeReturn Utility. Anonymous & Secure.</p>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 transition-colors cursor-pointer">이용약관</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">개인정보처리방침</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer">도움말</span>
          </div>
        </div>
      </footer>

      </> /* 일반 앱 뷰 끝 */}

    </div>
  );
}

// ==================== STATIC CODE GUIDE STRINGS ====================
const SCHEMA_DDL_CODE = `-- 1. 분실물 안심 QR 스티커 테이블 생성
CREATE TABLE items (
  id VARCHAR(255) PRIMARY KEY, -- 랜덤 발급 고유 ID (예: SR-721842)
  name VARCHAR(255) NOT NULL,    -- 소지품 이름/별칭 (예: 에어팟 맥스)
  contact VARCHAR(255) NOT NULL, -- 단방향 암호화 처리된 연락처
  password VARCHAR(255) NOT NULL, -- 관리용 간편 비밀번호
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 안심 익명 대화방 테이블 생성 (1:N 다중 연결)
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id VARCHAR(255) REFERENCES items(id) ON DELETE CASCADE NOT NULL, -- 1:N 외래키 관계 지정
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 실시간 대화 테이블 생성
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender VARCHAR(50) CHECK (sender IN ('owner', 'finder', 'system')) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Supabase Realtime 활성화 (중요!)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;`;

const DASHBOARD_CODE_STRING = `import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function OwnerDashboard({ ownerItemIds }: { ownerItemIds: string[] }) {
  const [chatRooms, setChatRooms] = useState<any[]>([]);

  useEffect(() => {
    // 1. 주인의 사용 스티커(item_id)들을 대상으로 chat_rooms의 신규 INSERT 이벤트를 Supabase Realtime 채널로 연결
    const roomChannel = supabase
      .channel('owner-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          // INSERT된 chat_room의 item_id가 내가 보유한 항목 중 하나인지 검사
          const newRoom = payload.new;
          if (ownerItemIds.includes(newRoom.item_id)) {
            // 주인의 대시보드 화면에 즉각적으로 실시간 알림 표시 및 리스트 추가 연동
            alert("🚨 새로운 습득자로부터 익명 대화방 연락이 도착했습니다!");
            setChatRooms((prev) => [newRoom, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [ownerItemIds]);

  return (
    <div>
      {/* 주인용 실시간 수신 채팅방 리스트 뷰포트 레이아웃 */}
    </div>
  );
}`;

const CHAT_CODE_STRING = `// 대화방 메시지 송수신용 채널 독립 구독 로직
useEffect(() => {
  if (!roomId) return;

  const chatChannel = supabase
    .channel('room:' + roomId) // 고유 룸 ID를 기준으로 채널 바인딩 지정
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'room_id=eq.' + roomId // 현재 대화방 ID 기준 타겟팅 필터링 적용
      },
      (payload) => {
        // 메시지 수신 시 대화 배열에 즉시 결합
        setMessages((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(chatChannel);
  };
}, [roomId]);`;
