# SafeReturn — 안심 QR 분실물 찾기

> QR 코드 하나로 연결되는 **안심 분실물 익명 채팅 매칭 서비스**

🌐 **라이브 데모**: [https://safereturn-qr.vercel.app](https://safereturn-qr.vercel.app)

---

## 서비스 개요

물건에 QR 스티커를 붙여두면, 습득자가 스캔했을 때 **개인정보 노출 없이** 주인과 즉시 익명 채팅으로 연결되는 분실물 매칭 서비스입니다.

- 회원가입 불필요
- 개인정보 노출 없는 익명 채팅
- 앱 설치 없이 QR 스캔만으로 즉시 연결
- 1:N 채팅 (한 물건에 여러 습득자 동시 연결)

---

## 서비스 흐름

```
[물건 주인]
  1. 스티커 발급 (물건 이름 + 연락처 + 비밀번호)
  2. QR 코드 생성 → 인쇄 → 물건에 부착

[분실 발생] ← 며칠 후...

[습득자]
  3. QR 코드 스캔 → 안심 접수 페이지 자동 열림
  4. "주인과 채팅하기" 클릭 → 채팅방 자동 생성

[주인 대시보드]
  5. 실시간 알림 수신 → 채팅방에서 대화 → 물건 수령
```

---

## 구현 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| QR 스티커 발급 | 물건 등록 → 고유 ID(`SR-XXXXXX`) + QR 생성 | ✅ 완료 |
| 스티커 인쇄 | 미디어 쿼리로 스티커 영역만 깔끔하게 출력 | ✅ 완료 |
| 습득자 전용 페이지 | QR 스캔 → `#/find/:id` 자동 라우팅 | ✅ 완료 |
| 익명 채팅 (1:N) | 주인·습득자 실시간 메시지 송수신 | ✅ 완료 |
| 실시간 알림 | 습득자 연락 시 주인 대시보드에 즉시 토스트 알림 | ✅ 완료 |
| 스티커 삭제 | 대화 종료 후 스티커 + 채팅방 일괄 삭제 | ✅ 완료 |
| 모바일 최적화 | 반응형 UI, 핸드폰 QR 스캔 후 바로 사용 | ✅ 완료 |
| Vercel 배포 | 외부 공유 가능한 공개 URL | ✅ 완료 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion |
| 빌드 | Vite 6 |
| 라우팅 | Hash 기반 (`#/find/:id`) |
| QR 생성 | api.qrserver.com |
| 배포 | Vercel |
| 백엔드 설계(목표) | Supabase (PostgreSQL + Realtime) |

---

## 데이터베이스 설계 (목표: Supabase)

```sql
-- 분실물 스티커
CREATE TABLE items (
  id VARCHAR(255) PRIMARY KEY,       -- SR-XXXXXX
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,     -- bcrypt 암호화 예정
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 익명 채팅방 (items와 1:N)
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id VARCHAR(255) REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 채팅 메시지 (chat_rooms와 1:N)
CREATE TABLE chat_messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender VARCHAR(50) CHECK (sender IN ('owner', 'finder', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:3000)
npm run dev

# 빌드
npm run build
```

---

## 개발 로드맵

- [x] **Phase 1** — React MVP 데모 구현 (완료)
  - QR 생성·인쇄, 해시 라우팅, 채팅 시뮬레이션, 모바일 최적화, Vercel 배포
- [ ] **Phase 2** — 프로덕션 전환 (1~3개월)
  - Supabase 실제 연동, 연락처 암호화, 주인 인증, 도메인 설정
- [ ] **Phase 3** — 성장 기능 (4~6개월)
  - 050 안심번호, 카카오 알림톡, PWA, NFC 태그, 프리미엄 구독

---

## 작업 이력 요약

| 날짜 | 작업 내용 |
|------|-----------|
| 2026-06-20 | 프로젝트 분석 및 기능 파악 |
| 2026-06-20 | 모바일 반응형 최적화 (헤더, 패널, padding, overflow) |
| 2026-06-20 | "REALTIME PLAYGROUND" 바 및 탭 버튼 제거 (UI 정리) |
| 2026-06-20 | 스티커 삭제 기능 추가 (Trash2 아이콘) |
| 2026-06-20 | QR 코드 실제 URL 연동 (`#/find/:id` 해시 라우팅) |
| 2026-06-20 | 습득자 전용 페이지 구현 (QR 스캔 → 채팅 페이지) |
| 2026-06-20 | Vercel 배포 완료 (`safereturn-qr.vercel.app`) |
| 2026-06-20 | 발표자료 HTML 생성 (7페이지) |
| 2026-06-20 | GitHub 저장소 등록 |

---

© 2026 SafeReturn — Anonymous & Secure Lost Item Matching
