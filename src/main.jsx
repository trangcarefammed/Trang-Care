import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error)
      return (
        <div style={{ minHeight: '100vh', padding: 24, background: '#f2f9f8', fontFamily: 'Arial, sans-serif', color: '#1f2937' }}>
          <div style={{ maxWidth: 760, margin: '40px auto', padding: 24, borderRadius: 16, background: '#fff', border: '1px solid #fecaca' }}>
            <h2 style={{ marginTop: 0, color: '#b91c1c' }}>TrangCare โหลดหน้าจอไม่สำเร็จ</h2>
            <p>พบข้อผิดพลาดขณะเริ่มต้นแอป:</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#fef2f2', padding: 16, borderRadius: 10, overflow: 'auto' }}>{message}</pre>
            <p style={{ color: '#6b7280', fontSize: 14 }}>หน้านี้เป็นตัวช่วยตรวจสอบปัญหา ไม่ใช่หน้าสุดท้ายของแอป</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
