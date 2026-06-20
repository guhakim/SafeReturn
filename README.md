# SafeReturn — 안심 QR 분실물 찾기

> QR 코드와 익명 채팅 기술을 결합하여 분실물의 주인과 습득자를 안전하게 연결하는 **생활안전 분실물 반환 플랫폼**

🌐 **라이브 데모**: [https://safereturn-qr.vercel.app](https://safereturn-qr.vercel.app)

---

## 1. 서비스 개요

SafeReturn은 QR 코드를 활용하여 분실물의 주인과 습득자를 안전하게 연결하는 분실물 반환 플랫폼이다. 사용자는 자신의 소지품에 고유 QR 스티커를 부착하고, 분실물 습득자가 QR 코드를 스캔하면 개인정보 노출 없이 즉시 익명 채팅으로 연결된다. 이를 통해 기존 분실물 반환 과정의 비효율성과 개인정보 노출 문제를 해결하고자 한다.

**핵심 가치**
- 회원가입 불필요 — 스티커 발급부터 채팅까지 30초 이내
- 개인정보 노출 없는 익명 채팅
- 앱 설치 없이 QR 스캔만으로 즉시 연결
- 1:N 채팅 구조 — 한 물건에 여러 습득자 동시 연결 가능

---

## 2. 기획 배경

일상생활에서 지갑, 휴대폰, 가방, 열쇠 등 개인 소지품을 분실하는 사례가 빈번하게 발생하고 있다. 그러나 현재 분실물을 찾기 위해서는 경찰서, 유실물센터, 대중교통 분실물센터 등을 거쳐야 하며 절차가 복잡하고 시간이 오래 걸린다.

또한 연락처를 물건에 직접 표기할 경우 개인정보 노출 위험이 있으며, 습득자 역시 연락 방법을 몰라 반환을 포기하는 경우가 발생한다. SafeReturn은 QR 코드와 익명 채팅 기술을 활용하여 주인과 습득자를 즉시 연결함으로써 분실물 반환 과정을 간소화하고 회수율을 높이는 것을 목표로 한다.

---

## 3. 해결하고자 하는 문제

- 분실물 반환 과정의 복잡성
- 개인정보 노출 위험
- 습득자와 주인 간 연락 수단 부재
- 분실물 회수율 저하
- 대면 반환에 대한 심리적 부담

---

## 4. 서비스 흐름

```
사용자 QR 발급
  → 소지품에 부착
  → 분실 발생
  → 습득자 QR 스캔
  → 익명 채팅 연결
  → 반환 장소 협의
  → 분실물 반환 완료
```

---

## 5. 구현 기능

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
| 050 안심번호 전화 | 실제 번호 노출 없이 전화 연결 | 🔄 목업 |
| 연락처 암호화 | bcrypt 단방향 암호화 | ⏳ 예정 |
| Supabase 실제 연동 | 영구 데이터 저장 및 실시간 WebSocket | ⏳ 예정 |

---

## 6. 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion |
| 빌드 | Vite 6 |
| 라우팅 | Hash 기반 (`#/find/:id`) |
| QR 생성 | api.qrserver.com |
| 배포 | Vercel |
| 백엔드 설계(목표) | Supabase (PostgreSQL + Realtime WebSocket) |

---

## 7. 데이터베이스 설계 (목표: Supabase)

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

## 8. 기대 효과

**사용자 측면**
- 빠른 분실물 회수
- 개인정보 보호
- 간편한 사용성 (앱 설치·회원가입 불필요)

**사회적 측면**
- 분실물 회수율 향상
- 공공기관 업무 부담 감소
- 사회적 신뢰 형성

**경제적 측면**
- 분실물 재구매 비용 절감
- 사회적 비용 감소

---

## 9. 수익 모델

**B2C**
- 프리미엄 QR 스티커 판매
- NFC 태그 판매
- 가족용 통합 관리 서비스 (월 구독)

**B2B**
- 학교 및 기업 단체 공급
- 호텔, 리조트, 공공기관 제휴
- 분실물 관리 솔루션 제공 (White-label)

---

## 10. 개발 로드맵

- [x] **Phase 1** — React MVP 데모 구현 ✅
  - QR 생성·인쇄, 해시 라우팅, 채팅 시뮬레이션, 모바일 최적화, Vercel 배포
- [ ] **Phase 2** — 프로덕션 전환 (1~3개월)
  - Supabase 실제 연동, 연락처 암호화, 주인 인증, 도메인 설정
- [ ] **Phase 3** — 성장 기능 (4~6개월)
  - AI 기반 분실 가능성 알림
  - NFC 태그 연동
  - 카카오 알림톡 연동
  - 무인 보관함 서비스 제휴
  - 스마트시티 통합 분실물 플랫폼 구축

---

## 11. 로컬 실행

```bash
npm install
npm run dev   # http://localhost:3000
npm run build
```

---

## 12. 작업 이력

| 날짜 | 작업 내용 |
|------|-----------|
| 2026-06-20 | 프로젝트 분석 및 기능 파악 |
| 2026-06-20 | 모바일 반응형 최적화 (헤더, 패널, padding, overflow) |
| 2026-06-20 | UI 정리 (불필요한 탭·바 제거) |
| 2026-06-20 | 스티커 삭제 기능 추가 |
| 2026-06-20 | QR 코드 실제 URL 연동 (`#/find/:id` 해시 라우팅) |
| 2026-06-20 | 습득자 전용 페이지 구현 (QR 스캔 → 채팅 페이지) |
| 2026-06-20 | Vercel 배포 완료 (`safereturn-qr.vercel.app`) |
| 2026-06-20 | 발표자료 HTML 생성 (7페이지) |
| 2026-06-20 | 서비스 기획안 작성 및 GitHub README 통합 |

---

© 2026 SafeReturn — Anonymous & Secure Lost Item Matching
