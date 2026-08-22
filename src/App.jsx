import { useEffect, useState } from "react";
import {
  Search, Menu, AlertTriangle, X, Heart, TrendingUp, Calendar, Pill,
  Gift, Settings, ChevronLeft, Plus, Check, Copy, Star, Phone,
  FileText, Trash2, HelpCircle, ShieldCheck, MessageCircle, Camera,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import greetingImage from "./assets/Greeting.png";
import recordImage from "./assets/Record.png";
import graphImage from "./assets/Graph.png";
import appointmentImage from "./assets/Appointment.png";
import allergyImage from "./assets/Allergy.png";
import donateImage from "./assets/Donate.png";

const IMG_GREETING = greetingImage;
const IMG_RECORD = recordImage;
const IMG_ALLERGY = allergyImage;
const IMG_APPOINTMENT = appointmentImage;
const IMG_DONATE = donateImage;
const IMG_GRAPH = graphImage;

// วันที่แสดงผลเป็น พ.ศ. และเวลาทั้งหมดใช้รูปแบบ 24 ชั่วโมง
const THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
function todayThaiDate() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
}
function daysAgoThaiDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
}
function ThaiDateField({ value, onChange, label, required = true }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9/]/g, ""))}
        placeholder="วว/ดด/พ.ศ."
        aria-label={label || "วันที่ พ.ศ."}
      />
    </div>
  );
}

/* ---------------------------------------------------------
   TrangCare — UI prototype (หน้าจอตัวอย่าง ยังไม่ต่อฐานข้อมูลจริง)
   สีและโครงหน้าจอทำตามภาพตัวอย่างที่คุณหมอส่งมา
--------------------------------------------------------- */

const C = {
  primary: "#0d9488",
  primaryDark: "#0f766e",
  bg: "#f2f9f8",
  card: "#ffffff",
  ink: "#1f2937",
  sub: "#6b7280",
};

const LEVEL = {
  green: { bg: "#dcfce7", text: "#15803d", dot: "#22c55e", label: "อยู่ในเป้าหมาย" },
  yellow: { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b", label: "เฝ้าระวัง" },
  red: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444", label: "เกินเป้าหมาย" },
};

// ---- เกณฑ์สี ตามตารางใน Features.md (เป้าหมายการรักษา ไม่ใช่เกณฑ์วินิจฉัย) ----
const levelBP = (sys, dia) => {
  if (!sys || !dia) return null;
  if (sys >= 180 || dia >= 120) return { level: "red", crisis: true };
  if (sys >= 140 || dia >= 90) return { level: "red" };
  if (sys >= 130 || dia >= 80) return { level: "yellow" };
  return { level: "green" };
};
const levelSugar = (v, timing) => {
  if (!v) return null;
  if (timing === "หลังอาหาร") {
    if (v > 250) return { level: "red" };
    if (v >= 180) return { level: "yellow" };
    return { level: "green" };
  }
  if (v > 180 || v < 70) return { level: "red" };
  if (v >= 80 && v <= 130) return { level: "green" };
  return { level: "yellow" };
};
const levelA1c = (v) => (!v ? null : v > 8 ? { level: "red" } : v >= 7 ? { level: "yellow" } : { level: "green" });
const levelGfr = (v) => (!v ? null : v < 30 ? { level: "red" } : v < 60 ? { level: "yellow" } : { level: "green" });
const levelLdl = (v) => (!v ? null : v >= 130 ? { level: "red" } : v >= 100 ? { level: "yellow" } : { level: "green" });
const levelTg = (v) => (!v ? null : v >= 500 ? { level: "red", crisis: true } : v >= 200 ? { level: "red" } : v >= 150 ? { level: "yellow" } : { level: "green" });

function Chip({ result }) {
  if (!result) return null;
  const s = LEVEL[result.level];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.text, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: s.dot }} />
      {result.crisis ? "ค่าวิกฤต แจ้งแพทย์/โทร รพ." : s.label}
    </div>
  );
}

function Dot({ result }) {
  if (!result) return null;
  const s = LEVEL[result.level];
  return <span title={result.crisis ? "ค่าวิกฤต" : s.label} style={{ width: 8, height: 8, borderRadius: 999, background: s.dot, display: "inline-block" }} />;
}

function TopBar({ title, onBack }) {
  return (
    <div style={{ background: C.primary, color: "#fff", padding: "16px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
      <button onClick={onBack} aria-label="ย้อนกลับ" style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 999, width: 34, height: 34, display: "grid", placeItems: "center", color: "#fff", cursor: "pointer" }}>
        <ChevronLeft size={20} />
      </button>
      <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 78, left: "50%", transform: "translateX(-50%)", background: "#1f2937", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, zIndex: 50, boxShadow: "0 8px 20px rgba(0,0,0,0.25)", maxWidth: "88%", textAlign: "center" }}>
      {msg}
    </div>
  );
}

function Disclaimer() {
  return (
    <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, marginTop: 18, padding: "10px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #eef2f2" }}>
      ข้อมูลนี้ผู้ใช้แก้ไขได้เอง ใช้เพื่อการสื่อสาร ไม่สามารถใช้อ้างอิงทางการแพทย์/กฎหมายได้
    </p>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [consentStatus, setConsentStatus] = useState("checking");
  const [lineProfile, setLineProfile] = useState(null);
  const [showWarning, setShowWarning] = useState(true);
  const [toast, setToast] = useState(null);
  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2200); };

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const liffModule = await import("@line/liff");
        const liff = liffModule.default;
        await liff.init({ liffId: "2011202913-XQ3OIaNL" });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        if (cancelled) return;
        setLineProfile(profile);

        const response = await fetch(`/api/consent/${encodeURIComponent(profile.userId)}`);
        if (!response.ok) throw new Error("ตรวจสอบ consent ไม่สำเร็จ");
        const data = await response.json();
        if (!cancelled) setConsentStatus(data.consented ? "consented" : "required");
      } catch (error) {
        console.warn("LIFF/consent bootstrap error:", error);
        if (import.meta.env.DEV) {
          const consentDate = localStorage.getItem("trangcare-health-consent-date");
          if (!cancelled) setConsentStatus(consentDate ? "consented" : "required");
        } else if (!cancelled) {
          setConsentStatus("error");
        }
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const giveConsent = async () => {
    const consentedAt = new Date().toISOString();
    try {
      if (lineProfile?.userId) {
        const response = await fetch("/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineUserId: lineProfile.userId,
            displayName: lineProfile.displayName || "",
            consentedAt,
          }),
        });
        if (!response.ok) throw new Error("บันทึก consent ไม่สำเร็จ");
      }
      localStorage.setItem("trangcare-health-consent-date", consentedAt);
      setConsentStatus("consented");
      notify("บันทึกความยินยอมเรียบร้อยครับ");
    } catch (error) {
      console.error(error);
      notify("บันทึกความยินยอมไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  const consentGiven = consentStatus === "consented";

  // ---- ข้อมูลตัวอย่าง (mock) เพื่อสาธิตเท่านั้น ----
  const [bpList, setBpList] = useState([
    { id: 1, date: todayThaiDate(), time: "07:20", sys: 124, dia: 78, pulse: 72 },
    { id: 2, date: todayThaiDate(), time: "07:22", sys: 120, dia: 76, pulse: 70 },
    { id: 3, date: todayThaiDate(), time: "19:10", sys: 130, dia: 82, pulse: 76 },
    { id: 4, date: daysAgoThaiDate(1), time: "07:15", sys: 118, dia: 74, pulse: 70 },
    { id: 5, date: daysAgoThaiDate(2), time: "07:30", sys: 132, dia: 86, pulse: 80 },
    { id: 6, date: daysAgoThaiDate(2), time: "07:32", sys: 128, dia: 84, pulse: 78 },
    { id: 7, date: daysAgoThaiDate(2), time: "19:00", sys: 128, dia: 80, pulse: 75 },
    { id: 8, date: daysAgoThaiDate(4), time: "19:05", sys: 142, dia: 92, pulse: 82 },
    { id: 9, date: daysAgoThaiDate(5), time: "07:10", sys: 120, dia: 76, pulse: 68 },
  ]);
  const [sugarList, setSugarList] = useState([
    { id: 1, date: todayThaiDate(), time: "07:40", value: 118, timing: "ก่อนอาหาร" },
    { id: 2, date: todayThaiDate(), time: "19:30", value: 210, timing: "หลังอาหาร" },
    { id: 3, date: daysAgoThaiDate(1), time: "07:35", value: 142, timing: "ก่อนอาหาร" },
    { id: 4, date: daysAgoThaiDate(3), time: "12:20", value: 255, timing: "หลังอาหาร" },
    { id: 5, date: daysAgoThaiDate(5), time: "07:25", value: 95, timing: "ก่อนอาหาร" },
  ]);
  const [a1cList, setA1cList] = useState([
    { id: 1, date: "15/3/2569", value: 8.1 },
    { id: 2, date: "10/5/2569", value: 7.6 },
    { id: 3, date: "12/7/2569", value: 7.2 },
  ]);
  const [gfrList, setGfrList] = useState([
    { id: 1, date: "15/3/2569", value: 58 },
    { id: 2, date: "10/5/2569", value: 55 },
    { id: 3, date: "12/7/2569", value: 52 },
  ]);
  const [tgList, setTgList] = useState([
    { id: 1, date: "15/3/2569", value: 240 },
    { id: 2, date: "10/5/2569", value: 205 },
    { id: 3, date: "12/7/2569", value: 180 },
  ]);
  const [ldlList, setLdlList] = useState([
    { id: 1, date: "15/3/2569", value: 145 },
    { id: 2, date: "10/5/2569", value: 128 },
    { id: 3, date: "12/7/2569", value: 118 },
  ]);
  const [allergyList, setAllergyList] = useState([{ id: 1, drug: "Penicillin", reaction: "ผื่นขึ้นทั้งตัว" }]);

  const FEATURES = [
    { key: "record", label: "บันทึกค่า", icon: Heart, iconColor: "#f43f5e", tile: "#dbeafe" },
    { key: "history", label: "ตารางย้อนหลัง", icon: TrendingUp, iconColor: "#0d9488", tile: "#d1fae5" },
    { key: "appointment", label: "นัดหมาย", icon: Calendar, iconColor: "#e11d48", tile: "#fce7f3" },
    { key: "allergy", label: "แพ้ยา", icon: Pill, iconColor: "#dc2626", tile: "#fee2e2" },
    { key: "donate", label: "บริจาคให้รพ.", icon: Gift, iconColor: "#7c3aed", tile: "#ede9fe" },
    { key: "more", label: "อื่นๆ", icon: Settings, iconColor: "#6b7280", tile: "#f3f4f6" },
  ];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", boxShadow: "0 0 40px rgba(0,0,0,0.06)" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800&display=swap'); * { font-family: 'Noto Sans Thai', system-ui, sans-serif; box-sizing: border-box; } button { font-family: inherit; } button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #0d9488; outline-offset: 2px; } input, select { font-family: inherit; }`}</style>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 88 }}>
        {view === "home" && (
          <HomeView showWarning={showWarning} setShowWarning={setShowWarning} FEATURES={FEATURES} setView={setView} consentGiven={consentGiven} consentStatus={consentStatus} giveConsent={giveConsent} />
        )}
        {view === "record" && <RecordView onBack={() => setView("home")} notify={notify} bpList={bpList} setBpList={setBpList} sugarList={sugarList} setSugarList={setSugarList} a1cList={a1cList} setA1cList={setA1cList} gfrList={gfrList} setGfrList={setGfrList} tgList={tgList} setTgList={setTgList} ldlList={ldlList} setLdlList={setLdlList} />}
        {view === "history" && <HistoryView onBack={() => setView("home")} bpList={bpList} sugarList={sugarList} a1cList={a1cList} gfrList={gfrList} tgList={tgList} ldlList={ldlList} />}
        {view === "appointment" && <AppointmentView onBack={() => setView("home")} notify={notify} />}
        {view === "allergy" && <AllergyView onBack={() => setView("home")} allergyList={allergyList} setAllergyList={setAllergyList} notify={notify} />}
        {view === "donate" && <DonateView onBack={() => setView("home")} notify={notify} />}
        {view === "more" && <MoreView onBack={() => setView("home")} notify={notify} />}
      </div>

      {view !== "home" && <button onClick={() => setView("home")} style={{ position: "sticky", bottom: 0, border: "none", borderTop: "1px solid #e5e7eb", background: "#fff", padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.sub, fontSize: 13, cursor: "pointer" }}><Menu size={16} /> เมนูหลัก</button>}
      <Toast msg={toast} />
    </div>
  );
}

/* ================= HOME ================= */
function LineChatArea({ locked }) {
  return (
    <section style={{ marginTop: 16, background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(15,118,110,0.08)", border: "1px solid #e5eeee" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #edf2f2", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: "#06c755", display: "grid", placeItems: "center", color: "#fff" }}>
          <MessageCircle size={19} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>LINE OA · TrangCare</div>
          <div style={{ fontSize: 11.5, color: C.sub }}>Chatbot Gemini · ข้อความแจ้งเตือน</div>
        </div>
        <span style={{ fontSize: 10.5, color: C.sub, background: "#f3f4f6", borderRadius: 999, padding: "5px 8px" }}>Chat</span>
      </div>

      <div style={{ minHeight: 190, padding: 14, background: "#f7faf9", position: "relative" }}>
        {locked ? (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 20 }}>
            <div style={{ textAlign: "center", color: C.sub, fontSize: 12.5, lineHeight: 1.7 }}>
              <MessageCircle size={26} color={C.sub} style={{ marginBottom: 6 }} />
              <div style={{ fontWeight: 700 }}>พื้นที่สนทนา LINE OA</div>
              <div>กรุณากดยินยอมก่อนเริ่มใช้งาน</div>
            </div>
          </div>
        ) : (
          <div style={{ height: "100%", minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12.5 }}>
            <div style={{ textAlign: "center" }}>
              <MessageCircle size={28} color="#cbd5d1" style={{ marginBottom: 7 }} />
              <div>พื้นที่สนทนาพร้อมใช้งาน</div>
              <div style={{ fontSize: 11, marginTop: 3 }}>ข้อความจาก Chatbot และ LINE OA จะแสดงที่นี่</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 10, borderTop: "1px solid #edf2f2", display: "flex", gap: 8, background: "#fff" }}>
        <input disabled={locked} placeholder={locked ? "กรุณากดยินยอมก่อน" : "พิมพ์ข้อความ..."} style={{ flex: 1, minWidth: 0, border: "1px solid #dbe5e3", borderRadius: 999, padding: "9px 13px", fontSize: 12.5, background: locked ? "#f3f4f6" : "#fff" }} />
        <button disabled={locked} aria-label="ส่งข้อความ" style={{ width: 38, height: 38, border: "none", borderRadius: 999, background: locked ? "#d1d5db" : C.primary, color: "#fff", display: "grid", placeItems: "center", cursor: locked ? "not-allowed" : "pointer" }}>
          <MessageCircle size={17} />
        </button>
      </div>
    </section>
  );
}

function HomeView({ showWarning, setShowWarning, FEATURES, setView, consentGiven, consentStatus, giveConsent }) {
  const locked = !consentGiven;
  if (consentStatus === "checking") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 22, width: "100%", textAlign: "center", boxShadow: "0 4px 16px rgba(15,118,110,0.08)" }}>
          <img src={IMG_GREETING} alt="น้องยูน" style={{ width: 92, height: "auto", marginBottom: 10 }} />
          <div style={{ fontWeight: 800, color: C.primaryDark, fontSize: 17 }}>กำลังตรวจสอบการยินยอม</div>
          <div style={{ color: C.sub, fontSize: 12.5, marginTop: 6 }}>กำลังเชื่อมต่อ LINE และตรวจสอบข้อมูลของคุณครับ</div>
        </div>
      </div>
    );
  }

  if (consentStatus === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ background: C.card, borderRadius: 18, padding: 22, width: "100%", textAlign: "center", boxShadow: "0 4px 16px rgba(15,118,110,0.08)" }}>
          <AlertTriangle size={32} color="#d97706" style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 800, color: C.ink, fontSize: 17 }}>ยังเข้าใช้งานไม่ได้ครับ</div>
          <div style={{ color: C.sub, fontSize: 12.5, marginTop: 8, lineHeight: 1.7 }}>ระบบตรวจสอบความยินยอมกับฐานข้อมูลไม่สำเร็จ เพื่อความปลอดภัย TrangCare จะยังไม่เปิดข้อมูลสุขภาพ</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, border: "none", borderRadius: 12, padding: "11px 18px", background: C.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>ลองใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ background: `linear-gradient(180deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", padding: "18px 16px 26px", borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 30, height: 30, borderRadius: 999, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center" }}><Star size={16} fill="#fff" /></div><span style={{ fontWeight: 800, fontSize: 20 }}>TrangCare</span></div>
          <div style={{ display: "flex", gap: 14 }}><Search size={20} /><FileText size={20} /><Menu size={20} /></div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {showWarning && <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}><AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} /><p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.6, flex: 1 }}>บัญชีนี้ไม่ได้เป็นบัญชีรับรอง โปรดตรวจสอบให้มั่นใจก่อนให้ข้อมูลส่วนบุคคลหรือทำธุรกรรมใดๆ</p><button onClick={() => setShowWarning(false)} aria-label="ปิด" style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e" }}><X size={16} /></button></div>}

        {!consentGiven && <div style={{ background: C.card, borderRadius: 18, padding: 18, boxShadow: "0 4px 16px rgba(15,118,110,0.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: 10, top: 10, width: 78, textAlign: "center" }}><img src={IMG_GREETING} alt="น้องยูน" style={{ width: 78, height: "auto" }} /><div style={{ fontSize: 9.5, color: C.primaryDark, fontWeight: 700, marginTop: 2 }}>น้องยูน</div></div>
          <h2 style={{ fontSize: 19, margin: 0 }}>สวัสดีครับ ❤️</h2>
          <p style={{ fontSize: 13.5, color: C.ink, marginTop: 8, marginRight: 84, lineHeight: 1.7 }}>ก่อนเริ่มใช้งาน ขอความยินยอมเก็บข้อมูลสุขภาพของคุณครับ</p>
          <hr style={{ border: "none", borderTop: "1px solid #eef2f2", margin: "12px 0" }} />
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>ระบบจะเก็บ:</p>
          <ul style={{ fontSize: 13, color: C.ink, lineHeight: 1.9, margin: 0, paddingLeft: 18 }}><li>ค่าความดัน ค่าน้ำตาล ค่าผลเลือด ที่คุณบันทึก</li><li>ข้อมูลนัดแพทย์จากใบนัด</li><li>ข้อมูลแพ้ยา ที่คุณบันทึก</li><li>ชื่อโปรไฟล์ LINE ของคุณ</li></ul>
          <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, marginTop: 10 }}>ใช้เพื่อบันทึก วิเคราะห์ และแจ้งเตือนเท่านั้น ไม่ส่งต่อบุคคลอื่น รูปที่ส่งจะถูกอ่านค่าด้วย AI ไม่เชื่อมต่อกับฐานข้อมูลโรงพยาบาล ใช้เพื่อการสื่อสารเท่านั้น</p>
          <p style={{ fontSize: 11.5, color: C.sub, marginTop: 8, lineHeight: 1.6 }}>*ไม่สามารถใช้ในทางกฎหมายได้ เนื่องจากผู้ใช้สามารถแก้ไขค่าได้ด้วยตนเอง</p>
          <p style={{ fontSize: 11.5, color: C.primaryDark, marginTop: 4, lineHeight: 1.6 }}>*ขอลบข้อมูลได้ตลอดเวลา อยู่ในเมนู "อื่นๆ" → "ลบข้อมูลทั้งหมด"</p>
          <label style={{ marginTop: 16, padding: "12px 12px", borderRadius: 12, background: consentGiven ? "#ecfdf5" : "#f0fdfa", border: `1px solid ${consentGiven ? "#a7f3d0" : "#99f6e4"}`, display: "flex", alignItems: "center", gap: 10, cursor: consentGiven ? "default" : "pointer" }}>
            <input type="checkbox" checked={consentGiven} onChange={(e) => { if (e.target.checked) giveConsent(); }} disabled={consentGiven} style={{ width: 20, height: 20, accentColor: C.primary, flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: C.primaryDark }}>{consentGiven ? "ยินยอมแล้ว — สามารถใช้งานแอปได้" : "ยินยอมเก็บข้อมูลสุขภาพและเริ่มใช้งาน"}</span>
          </label>
        </div>}

        <LineChatArea locked={locked} />

        <div style={{ position: "relative", marginTop: 16 }}>
          {locked && <div style={{ position: "absolute", inset: 0, zIndex: 2, borderRadius: 16, background: "rgba(242,249,248,0.72)", backdropFilter: "blur(1.5px)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto" }}><div style={{ background: "#fff", border: "1px solid #d1d5db", borderRadius: 12, padding: "10px 14px", boxShadow: "0 4px 14px rgba(0,0,0,0.08)", color: C.sub, fontSize: 12.5, fontWeight: 600 }}>กรุณากดยินยอมก่อนเริ่มใช้งาน</div></div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, opacity: locked ? 0.55 : 1 }}>
            {FEATURES.map((f) => <button key={f.key} onClick={() => { if (!locked) setView(f.key); }} disabled={locked} style={{ background: C.card, border: "none", borderRadius: 16, padding: "16px 8px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", cursor: locked ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><div style={{ width: 46, height: 46, borderRadius: 14, background: f.tile, display: "grid", placeItems: "center" }}><f.icon size={22} color={f.iconColor} /></div><span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, textAlign: "center" }}>{f.label}</span></button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= บันทึกค่า ================= */
const METRICS = [
  { key: "bp", label: "ความดันโลหิต" },
  { key: "sugar", label: "ค่าน้ำตาลปลายนิ้ว(DTX)" },
  { key: "a1c", label: "น้ำตาลเฉลี่ยสะสม(HbA1C)" },
  { key: "gfr", label: "ค่าอัตรากรองไต(eGFR)" },
  { key: "tg", label: "ไขมันไตรกลีเซอไรด์(TG)" },
  { key: "ldl", label: "ไขมันร้าย(LDL)" },
];

function RecordView(props) {
  const { onBack, notify } = props;
  const [metric, setMetric] = useState("bp");
  return (
    <div>
      <TopBar title="บันทึกค่า" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><img src={IMG_RECORD} alt="" style={{ height: 88 }} /></div>
        <Disclaimer />
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {METRICS.map((m) => (
            <button key={m.key} onClick={() => setMetric(m.key)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer", border: metric === m.key ? "none" : "1px solid #d1d5db", background: metric === m.key ? C.primary : "#fff", color: metric === m.key ? "#fff" : C.sub, whiteSpace: "nowrap" }}>{m.label}</button>
          ))}
        </div>
        {metric === "bp" && <BPForm {...props} notify={notify} />}
        {metric === "sugar" && <SugarForm {...props} notify={notify} />}
        {metric === "a1c" && <SimpleForm label="น้ำตาลเฉลี่ยสะสม(HbA1C)" unit="%" list={props.a1cList} setList={props.setA1cList} notify={notify} levelFn={levelA1c} step="0.1" photoLabel="ถ่ายรูปผลแลป" />}
        {metric === "gfr" && <SimpleForm label="ค่าอัตรากรองไต(eGFR)" unit="mL/min" list={props.gfrList} setList={props.setGfrList} notify={notify} levelFn={levelGfr} photoLabel="ถ่ายรูปผลแลป" />}
        {metric === "tg" && <SimpleForm label="ไขมันไตรกลีเซอไรด์(TG)" unit="mg/dL" list={props.tgList} setList={props.setTgList} notify={notify} levelFn={levelTg} photoLabel="ถ่ายรูปผลแลป" />}
        {metric === "ldl" && <SimpleForm label="ไขมันร้าย(LDL)" unit="mg/dL" list={props.ldlList} setList={props.setLdlList} notify={notify} levelFn={levelLdl} photoLabel="ถ่ายรูปผลแลป" />}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label style={{ fontSize: 12.5, color: C.sub, fontWeight: 600, display: "block", marginBottom: 5 }}>{children}</label>;
}
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14 };

function LcdField({ label, value, onChange, small }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, color: "#99f6e4", marginBottom: 2 }}>{label}</p>
      <input
        type="number" inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: small ? 20 : 26, fontWeight: 800, padding: "2px 0", outline: "none" }}
      />
    </div>
  );
}
function LcdDivider() {
  return <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />;
}

function TwoButtons({ onSave, onPhoto, photoLabel }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, flexDirection: "column" }}>
      <button onClick={onSave} style={{ width: "100%", background: C.primary, color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
        ยืนยันบันทึกค่า
      </button>
      <button onClick={onPhoto} style={{ width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Camera size={16} /> {photoLabel}
      </button>
    </div>
  );
}

function BPForm({ bpList, setBpList, notify }) {
  const [date, setDate] = useState(todayThaiDate());
  const [time, setTime] = useState("");
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");

  const save = () => {
    if (!date) return notify("กรุณาระบุวันที่ (พ.ศ.)");
    if (!time) return notify("กรุณาระบุเวลาที่วัด");
    if (!sys || !dia) return notify("กรุณากรอกความดันโลหิตตัวบน(Systolic) และความดันโลหิตตัวล่าง(Diastolic)");
    const next = { id: Date.now(), date, time, sys: Number(sys), dia: Number(dia), pulse: pulse ? Number(pulse) : null };
    setBpList([next, ...bpList]);
    setDate(todayThaiDate()); setTime(""); setSys(""); setDia(""); setPulse("");
    notify("บันทึกค่าความดันโลหิตเรียบร้อยครับ");
  };

  const photo = () => notify("กำลังเตรียมขั้นตอน OCR สำหรับรูปเครื่องวัดความดัน");

  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <ThaiDateField label="วันที่บันทึกค่า (พ.ศ.)" value={date} onChange={setDate} />
      <div style={{ marginTop: 12 }}><FieldLabel>เวลาที่บันทึกค่า (24 ชั่วโมง)</FieldLabel><input style={{ ...inputStyle, marginBottom: 14 }} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>

      <div style={{ background: `linear-gradient(160deg, ${C.primaryDark}, #134e4a)`, borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        <LcdField label="ความดันโลหิตตัวบน(Systolic)" value={sys} onChange={setSys} inputMode="numeric" />
        <LcdDivider />
        <LcdField label="ความดันโลหิตตัวล่าง(Diastolic)" value={dia} onChange={setDia} inputMode="numeric" />
        <LcdDivider />
        <LcdField label="ชีพจร (Pulse)" value={pulse} onChange={setPulse} small inputMode="numeric" />
      </div>

      <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "12px 13px" }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, color: "#92400e", margin: "0 0 6px" }}>คำแนะนำก่อนวัดความดันโลหิต</p>
        <p style={{ fontSize: 10.5, color: "#92400e", lineHeight: 1.65, margin: 0 }}>
          ควรนั่งพักผ่อนคลาย 5 นาทีก่อนวัด<br />
          นั่งหลังพิงพนัก เท้าราบพื้น ไม่ไขว่ห้าง งดพูดคุย<br />
          งดดื่มกาแฟ สูบบุหรี่ หรือดื่มแอลกอฮอล์ 30 นาทีก่อนวัด<br />
          และวัดซ้ำ 2 ครั้งห่างกัน 1-2 นาที ช่วงเช้าและเย็น
        </p>
      </div>

      <TwoButtons onSave={save} photoLabel="ถ่ายรูปเครื่องวัดความดัน" onPhoto={photo} />
      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, margin: "18px 0 8px" }}>รายการล่าสุด</p>
      {bpList.map((r) => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "9px 0", borderTop: "1px solid #f1f5f4" }}>
          <span style={{ fontSize: 11.5, color: C.sub, width: 112 }}>{r.date} {r.time}</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.sys}/{r.dia}{r.pulse ? ` · ${r.pulse}` : ""}</span>
          <Dot result={levelBP(r.sys, r.dia)} />
        </div>
      ))}
    </div>
  );
}

function SugarForm({ sugarList, setSugarList, notify }) {
  const [date, setDate] = useState(todayThaiDate());
  const [time, setTime] = useState("");
  const [value, setValue] = useState("");
  const [timing, setTiming] = useState("ก่อนอาหาร");
  const save = () => {
    if (!date) return notify("กรุณาระบุวันที่ (พ.ศ.)");
    if (!time) return notify("กรุณาระบุเวลาที่วัด");
    if (!value) return notify("กรุณากรอกค่าน้ำตาลปลายนิ้ว(DTX)");
    setSugarList([{ id: Date.now(), date, time, value: +value, timing }, ...sugarList]);
    setDate(todayThaiDate()); setTime(""); setValue(""); notify("บันทึกค่าน้ำตาลปลายนิ้วเรียบร้อยครับ");
  };
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <ThaiDateField label="วันที่บันทึกค่า (พ.ศ.)" value={date} onChange={setDate} />
      <div style={{ marginTop: 12 }}><FieldLabel>เวลาที่บันทึกค่า (24 ชั่วโมง)</FieldLabel><input style={{ ...inputStyle, marginBottom: 12 }} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
      <div style={{ background: `linear-gradient(160deg, ${C.primaryDark}, #134e4a)`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
        <LcdField label="ค่าน้ำตาลปลายนิ้ว(DTX)" value={value} onChange={setValue} inputMode="numeric" />
      </div>
      <FieldLabel>ช่วงเวลาที่วัดเทียบกับมื้ออาหาร</FieldLabel>
      <div style={{ display: "flex", gap: 8 }}>
        {["ก่อนอาหาร", "หลังอาหาร", "ไม่ระบุ"].map((t) => <button key={t} onClick={() => setTiming(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, fontSize: 12.5, cursor: "pointer", border: timing === t ? "none" : "1px solid #d1d5db", background: timing === t ? C.primary : "#fff", color: timing === t ? "#fff" : C.sub, fontWeight: 600 }}>{t}</button>)}
      </div>
      <TwoButtons onSave={save} photoLabel="ถ่ายรูปเครื่องตรวจน้ำตาล" onPhoto={() => notify("กำลังเตรียมขั้นตอน OCR สำหรับรูปเครื่องตรวจน้ำตาล")} />
      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, margin: "18px 0 8px" }}>รายการล่าสุด</p>
      {sugarList.map((r) => <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderTop: "1px solid #f1f5f4" }}><span style={{ fontSize: 11.5, color: C.sub, width: 112 }}>{r.date} {r.time}</span><span style={{ fontSize: 14, fontWeight: 600 }}>{r.value} <span style={{ fontSize: 11, color: C.sub, fontWeight: 400 }}>({r.timing})</span></span><Dot result={levelSugar(r.value, r.timing)} /></div>)}
    </div>
  );
}

function SimpleForm({ label, unit, list, setList, notify, levelFn, step, photoLabel }) {
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const save = () => {
    if (!date) return notify("กรุณาระบุวันที่ (พ.ศ.)");
    if (!value) return notify(`กรุณากรอก${label}`);
    setList([{ id: Date.now(), date, value: +value }, ...list]);
    setDate(""); setValue(""); notify(`บันทึก${label}เรียบร้อยครับ`);
  };
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <ThaiDateField label="วันที่บันทึกผล (พ.ศ.)" value={date} onChange={setDate} />
      <div style={{ marginTop: 12 }}><FieldLabel>{label}</FieldLabel><input style={inputStyle} type="number" step={step || "1"} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder={`กรอกค่า (${unit})`} /></div>
      <TwoButtons onSave={save} photoLabel={photoLabel || "ถ่ายรูปผลตรวจ"} onPhoto={() => notify("กำลังเตรียมขั้นตอน OCR สำหรับรูปผลตรวจ")} />
      <p style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, margin: "18px 0 8px" }}>รายการล่าสุด</p>
      {list.map((r) => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderTop: "1px solid #f1f5f4" }}>
          <span style={{ fontSize: 11.5, color: C.sub }}>{r.date}</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.value} {unit}</span>
          <Dot result={levelFn(r.value)} />
        </div>
      ))}
      <Disclaimer />
    </div>
  );
}

/* ================= ตารางย้อนหลัง ================= */
function partOfDay(t) {
  if (!t) return "เย็น";
  const h = parseInt(t.split(":")[0], 10);
  return h < 12 ? "เช้า" : "เย็น";
}
const BP_SUGAR_DATES = Array.from({ length: 7 }, (_, i) => daysAgoThaiDate(i));

function buildDayRows(list, dates) {
  return dates.map((d) => {
    const entries = list.filter((x) => x.date === d);
    return {
      date: d,
      am: entries.find((x) => partOfDay(x.time) === "เช้า") || null,
      pm: entries.find((x) => partOfDay(x.time) === "เย็น") || null,
    };
  });
}

function DayPartTable({ title, rows, renderCell }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{title}</p>
      <div style={{ background: C.card, borderRadius: 14, padding: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0fdfa" }}>
              <th style={{ fontSize: 11, color: C.sub, fontWeight: 700, padding: "8px 6px", textAlign: "left" }}>วันที่</th>
              <th style={{ fontSize: 11, color: C.sub, fontWeight: 700, padding: "8px 6px" }}>เช้า</th>
              <th style={{ fontSize: 11, color: C.sub, fontWeight: 700, padding: "8px 6px" }}>เย็น</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} style={{ borderTop: "1px solid #f1f5f4" }}>
                <td style={{ fontSize: 11.5, color: C.ink, padding: "8px 6px" }}>{r.date}</td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}>{renderCell(r.am)}</td>
                <td style={{ padding: "8px 6px", textAlign: "center" }}>{renderCell(r.pm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Disclaimer />
    </div>
  );
}

// ---- ตารางความดัน: วันที่/เวลา x ช่วงเช้า(ครั้งที่1,ครั้งที่2) x ช่วงเย็น(ครั้งที่1,ครั้งที่2) ----
function buildBPRows(list, dates) {
  return dates.map((d) => {
    const day = list.filter((x) => x.date === d);
    const am = day.filter((x) => partOfDay(x.time) === "เช้า").sort((a, b) => a.time.localeCompare(b.time));
    const pm = day.filter((x) => partOfDay(x.time) === "เย็น").sort((a, b) => a.time.localeCompare(b.time));
    return { date: d, amR1: am[0] || null, amR2: am[1] || null, pmR1: pm[0] || null, pmR2: pm[1] || null };
  });
}

function bpCell(e) {
  if (!e) return <span style={{ color: "#d1d5db", fontSize: 12 }}>-</span>;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{e.sys}/{e.dia}</span>
        <Dot result={levelBP(e.sys, e.dia)} />
      </div>
      <span style={{ fontSize: 9.5, color: C.sub }}>{e.time}</span>
    </div>
  );
}

const bpTh = { fontSize: 10.5, color: C.sub, fontWeight: 700, padding: "7px 4px", textAlign: "center" };

function BPTable({ rows }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>ความดันโลหิต (7 วันล่าสุด)</p>
      <div style={{ background: C.card, borderRadius: 14, padding: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 460, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0fdfa" }}>
              <th rowSpan={2} style={{ ...bpTh, textAlign: "left", verticalAlign: "middle" }}>วันที่/เวลา</th>
              <th colSpan={2} style={{ ...bpTh, borderLeft: "1px solid #e5e7eb" }}>ช่วงเช้า</th>
              <th colSpan={2} style={{ ...bpTh, borderLeft: "1px solid #e5e7eb" }}>ช่วงเย็น</th>
            </tr>
            <tr style={{ background: "#f0fdfa" }}>
              <th style={{ ...bpTh, borderLeft: "1px solid #e5e7eb" }}>ครั้งที่ 1</th>
              <th style={bpTh}>ครั้งที่ 2</th>
              <th style={{ ...bpTh, borderLeft: "1px solid #e5e7eb" }}>ครั้งที่ 1</th>
              <th style={bpTh}>ครั้งที่ 2</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.date} style={{ borderTop: "1px solid #f1f5f4" }}>
                <td style={{ fontSize: 11.5, color: C.ink, padding: "8px 6px" }}>{r.date}</td>
                <td style={{ padding: "8px 4px", textAlign: "center", borderLeft: "1px solid #f1f5f4" }}>{bpCell(r.amR1)}</td>
                <td style={{ padding: "8px 4px", textAlign: "center" }}>{bpCell(r.amR2)}</td>
                <td style={{ padding: "8px 4px", textAlign: "center", borderLeft: "1px solid #f1f5f4" }}>{bpCell(r.pmR1)}</td>
                <td style={{ padding: "8px 4px", textAlign: "center" }}>{bpCell(r.pmR2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Disclaimer />
    </div>
  );
}

function MetricChart({ title, data, levelFn, color }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{title}</p>
      <div style={{ background: C.card, borderRadius: 14, padding: "16px 8px 4px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ width: "100%", height: 150 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 18, right: 14, left: 6, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: C.sub }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
              <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
              <Line
                type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
                dot={(p) => {
                  const r = levelFn(p.payload.value);
                  const c = r ? LEVEL[r.level].dot : color;
                  return <circle key={"d" + p.payload.date} cx={p.cx} cy={p.cy} r={4} fill={c} stroke="#fff" strokeWidth={1.5} />;
                }}
              >
                <LabelList dataKey="value" position="top" style={{ fontSize: 11, fontWeight: 700, fill: C.ink }} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

function HistoryView({ onBack, bpList, sugarList, a1cList, gfrList, tgList, ldlList }) {
  const bpRows = buildBPRows(bpList, BP_SUGAR_DATES);
  const sugarRows = buildDayRows(sugarList, BP_SUGAR_DATES);

  return (
    <div>
      <TopBar title="ตารางย้อนหลัง" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><img src={IMG_GRAPH} alt="" style={{ height: 82 }} /></div>
        <Disclaimer />
        <BPTable rows={bpRows} />
        <DayPartTable
          title="ค่าน้ำตาลปลายนิ้ว(DTX) — วันที่และเวลาที่ตรวจ (7 วันล่าสุด)"
          rows={sugarRows}
          renderCell={(e) => e ? (
            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>{e.value}</span><Dot result={levelSugar(e.value, e.timing)} /></div>
              <span style={{ fontSize: 9.5, color: C.sub }}>{e.time}</span>
            </div>
          ) : <span style={{ color: "#d1d5db", fontSize: 12 }}>-</span>}
        />
        <MetricChart title="น้ำตาลเฉลี่ยสะสม(HbA1C) %" data={[...a1cList].reverse()} levelFn={levelA1c} color={C.primary} />
        <MetricChart title="ค่าอัตรากรองไต(eGFR)" data={[...gfrList].reverse()} levelFn={levelGfr} color="#2563eb" />
        <MetricChart title="ไขมันไตรกลีเซอไรด์(TG)" data={[...tgList].reverse()} levelFn={levelTg} color="#7c3aed" />
        <MetricChart title="ไขมันร้าย(LDL)" data={[...ldlList].reverse()} levelFn={levelLdl} color="#db2777" />
      </div>
    </div>
  );
}

/* ================= นัดหมาย ================= */
function AppointmentView({ onBack, notify }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [detail, setDetail] = useState("เจาะเลือด");
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (!date || !time) return notify("กรุณาระบุวันและเวลานัดหมาย");
    setSaved(true); notify("บันทึกนัดหมายเรียบร้อยครับ");
  };
  return (
    <div>
      <TopBar title="นัดหมาย" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><img src={IMG_APPOINTMENT} alt="" style={{ height: 82 }} /></div>
        <Disclaimer />
        <div style={{ background: C.card, borderRadius: 16, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <ThaiDateField label="วันนัดหมาย (พ.ศ.)" value={date} onChange={setDate} />
          <div style={{ marginTop: 12 }}><FieldLabel>เวลานัดหมาย (24 ชั่วโมง)</FieldLabel><input style={{ ...inputStyle, marginBottom: 12 }} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <FieldLabel>รายละเอียดนัดหมาย</FieldLabel>
          <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
            {["เจาะเลือด", "พบแพทย์"].map((choice) => (
              <button key={choice} onClick={() => setDetail(choice)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, cursor: "pointer", border: detail === choice ? "none" : "1px solid #d1d5db", background: detail === choice ? C.primary : "#fff", color: detail === choice ? "#fff" : C.sub, fontWeight: 700 }}>{choice}</button>
            ))}
          </div>
          <TwoButtons onSave={save} photoLabel="ถ่ายรูปใบนัด" onPhoto={() => notify("กำลังเตรียมขั้นตอน OCR สำหรับใบนัดแพทย์")} />
        </div>
        {saved && <div style={{ marginTop: 12, background: C.card, borderRadius: 14, padding: 14, border: `1px solid ${C.primary}33` }}><p style={{ margin: 0, fontWeight: 700 }}>นัดหมายที่บันทึก</p><p style={{ margin: "7px 0 0", color: C.sub, fontSize: 12.5 }}>{date} · {time} · {detail}</p></div>}
      </div>
    </div>
  );
}

/* ================= แพ้ยา ================= */
function AllergyView({ onBack, allergyList, setAllergyList, notify }) {
  const [showForm, setShowForm] = useState(false);
  const [drug, setDrug] = useState("");
  const [reaction, setReaction] = useState("");
  const save = () => {
    if (!drug) return notify("กรุณากรอกชื่อยาที่แพ้");
    setAllergyList([{ id: Date.now(), drug, reaction }, ...allergyList]);
    setDrug(""); setReaction(""); setShowForm(false); notify("บันทึกข้อมูลแพ้ยาเรียบร้อยครับ");
  };
  return (
    <div>
      <TopBar title="แพ้ยา" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><img src={IMG_ALLERGY} alt="" style={{ height: 96 }} /></div>
        <Disclaimer />
        {allergyList.map((a) => (
          <div key={a.id} style={{ background: C.card, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fee2e2", display: "grid", placeItems: "center", flexShrink: 0 }}><Pill size={18} color="#dc2626" /></div>
            <div><p style={{ fontWeight: 700, fontSize: 14 }}>{a.drug}</p>{a.reaction && <p style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{a.reaction}</p>}</div>
          </div>
        ))}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={{ width: "100%", border: "1.5px dashed #cbd5e1", background: "transparent", borderRadius: 14, padding: "12px 0", color: C.primary, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}><Plus size={16} /> เพิ่มรายการแพ้ยา</button>
        ) : (
          <div style={{ background: C.card, borderRadius: 14, padding: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <FieldLabel>ชื่อยาที่แพ้</FieldLabel><input style={inputStyle} value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="เช่น Penicillin" />
            <div style={{ marginTop: 10 }}><FieldLabel>อาการ/ผลข้างเคียง</FieldLabel><input style={inputStyle} value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="เช่น ผื่นขึ้น" /></div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}><button onClick={save} style={{ flex: 1, background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>บันทึก</button><button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#f3f4f6", color: C.ink, border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>ยกเลิก</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= บริจาคให้รพ. ================= */
function DonateView({ onBack, notify }) {
  const copyAccount = async () => {
    try { await navigator.clipboard.writeText("123-4-56789-0"); } catch {}
    notify("คัดลอกเลขบัญชีแล้ว");
  };
  return (
    <div>
      <TopBar title="บริจาคให้ รพ." onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><img src={IMG_DONATE} alt="" style={{ height: 90 }} /></div>
        <div style={{ background: C.card, borderRadius: 16, padding: 24, textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 180, height: 180, margin: "0 auto 16px", borderRadius: 14, border: "1px solid #e5e7eb", display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, padding: 12 }}>
            {Array.from({ length: 49 }).map((_, i) => <div key={i} style={{ background: (i * 7 + i) % 3 === 0 ? "#111827" : "transparent" }} />)}
          </div>
          <p style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>สแกน QR เพื่อบริจาคให้โรงพยาบาลตรัง (ตัวอย่าง)</p>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ textAlign: "left" }}><p style={{ fontSize: 11, color: C.sub }}>เลขบัญชี</p><p style={{ fontWeight: 700, fontSize: 14 }}>123-4-56789-0</p></div>
            <button onClick={copyAccount} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}><Copy size={14} /> คัดลอก</button>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: C.sub, marginTop: 12, textAlign: "center" }}>ระบบไม่เก็บข้อมูลสลิปบริจาคใดๆ</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#d97706", lineHeight: 1.8, margin: "14px 4px 0", textAlign: "center" }}>ขอขอบพระคุณในความเมตตาของท่าน ขออำนาจคุณพระรัตนตรัยและสิ่งศักดิ์สิทธิ์ทั้งหลาย ดลบันดาลให้ท่านและครอบครัวประสบแต่ความสุข ความเจริญ มีสุขภาพพลานามัยที่แข็งแรงครับ✨🙏🥰</p>
      </div>
    </div>
  );
}

/* ================= อื่นๆ ================= */
function MoreView({ onBack, notify }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const items = [
    { icon: Phone, label: "ติดต่อโรงพยาบาล", sub: "075-201500" },
    { icon: FileText, label: "หน้าสรุปผล (โชว์หมอ/พิมพ์ PDF)" },
    { icon: HelpCircle, label: "วิธีใช้งานระบบ" },
    { icon: ShieldCheck, label: "นโยบายความเป็นส่วนตัว(Privacy Policy)" },
    { icon: FileText, label: "ข้อกำหนดการใช้งาน" },
    { icon: MessageCircle, label: "คำติชม/ข้อเสนอแนะ" },
  ];
  return (
    <div>
      <TopBar title="อื่นๆ" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <div style={{ background: C.card, borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => notify(it.label)} style={{ width: "100%", background: "none", border: "none", borderBottom: i < items.length - 1 ? "1px solid #f1f5f4" : "none", padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
              <it.icon size={17} color={C.primary} />
              <div style={{ flex: 1 }}><p style={{ fontSize: 13.5, color: C.ink }}>{it.label}</p>{it.sub && <p style={{ fontSize: 11.5, color: C.sub }}>{it.sub}</p>}</div>
            </button>
          ))}
        </div>
        <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", marginTop: 14, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <Trash2 size={17} color="#dc2626" /><span style={{ fontSize: 13.5, color: "#dc2626", fontWeight: 600 }}>ลบบัญชี / ขอลบข้อมูลทั้งหมด</span>
        </button>
        {confirmDelete && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 100, padding: 24 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, maxWidth: 320 }}>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>ยืนยันการลบข้อมูล?</p>
              <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, marginBottom: 16 }}>ข้อมูลจะถูกซ่อนทันที และลบถาวรใน 48 ชั่วโมง หากไม่ติดต่อขอยกเลิกคำขอ</p>
              <div style={{ display: "flex", gap: 8 }}><button onClick={() => { setConfirmDelete(false); notify("ส่งคำขอลบข้อมูลแล้ว (ตัวอย่าง)"); }} style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>ยืนยันลบ</button><button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: "#f3f4f6", color: C.ink, border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>ยกเลิก</button></div>
            </div>
          </div>
        )}
        <Disclaimer />
      </div>
    </div>
  );
}
