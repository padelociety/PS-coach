# PS Coach Schedule (PWA)

Padel Society 코치용 주간 스케줄 관리 PWA.

## 파일 구조

```
├── index.html            # 메인 앱 (React via CDN + Babel standalone)
├── sw.js                 # Service Worker
├── manifest.json         # PWA manifest
├── icon-192.png          # 일반 아이콘
├── icon-512.png
├── icon-192-maskable.png # Android adaptive 아이콘
└── icon-512-maskable.png
```

## 로컬 테스트

PWA는 HTTPS 또는 localhost가 필요해서 file:// 로는 동작 안 함. 간단한 정적 서버 띄우기:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

브라우저에서 `http://localhost:8080`

## GitHub Pages 배포

평소처럼 `padelociety` 조직 아래 새 레포 만들고 (예: `PS-coach`):

```bash
git init
git remote add origin git@github.com:padelociety/PS-coach.git
git add .
git commit -m "Initial PWA"
git push -u origin main
```

레포 Settings → Pages → Source: `main` 브랜치 / `/` (root) 선택.
배포되면 `https://padelociety.github.io/PS-coach/` 에서 접근 가능.

## PWA 설치

- **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
- **Android Chrome**: 메뉴 → "앱 설치" (자동 프롬프트 뜨기도 함)
- **데스크탑 Chrome/Edge**: 주소창 오른쪽 설치 아이콘

## 기능

- ✅ 주간 캘린더 (MON-THU × 7AM-10PM)
- ✅ 슬롯 편집: 학생, lesson type (다중), 시간, 노트
- ✅ 커스텀 lesson type 추가/삭제
- ✅ Member breakdown — 학생별 집계
- ✅ 이미지로 저장 (스케줄/브레이크다운 분리)
- ✅ URL 공유 (base64 인코딩, 서버 불필요)
- ✅ localStorage 자동 저장
- ✅ 오프라인 동작 (Service Worker)
- ✅ 자동 업데이트 알림

## 업데이트 배포 방법

코드 수정 후 push만 하면 됨. Service Worker는 네트워크-퍼스트로 `index.html`을 가져오므로
배포 즉시 새 버전이 캐싱되고, 다음 새로고침 때 자동 적용.

CDN 의존성 (Tailwind, React, html2canvas) 버전을 바꾸려면 `sw.js`의 `CACHE_VERSION` 을
`ps-coach-v2` 식으로 올리면 새 캐시로 갈아치움.

## 데이터 위치

- 자동 저장: localStorage 키 `ps-schedule-v4`
- 백업/이동: 앱 안의 **Save / Share** 버튼 → 링크 복사

## 알려진 제약

- Babel standalone 사용 → 초기 로딩이 production build 대비 살짝 느림 (수백 ms 정도, 모바일에서도 큰 문제 없음)
- 정식 빌드를 원하면 `index.html`의 `<script type="text/babel">` 부분을 추출해서 Vite 등으로 빌드 → `dist/` 산출물을 GitHub Pages에 올리는 방식으로 변경 가능

## 디자인 시스템

요일 컬러: `MON #bef264` `TUE #7dd3fc` `WED #fcd34d` `THU #f9a8d4`
다크 슬레이트 배경 + 라임/스카이/앰버/핑크 액센트.
폰트: Outfit (display) + JetBrains Mono (mono).
