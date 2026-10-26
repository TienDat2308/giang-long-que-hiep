# Giáng Long Que Hiệp

Game người que kiếm hiệp chạy trên trình duyệt, Android và iOS. Nhân vật dùng khinh công ba tầng, quyền cước nhiều lộ và năm chiêu Giáng Long Thập Bát Chưởng để đánh từng đợt Huyết Ma giáo đồ: đao khách, cung thủ, ám khí thủ, thiết chùy, cùng hai boss Huyết Ma Lão Tổ và Lạc Nhật Thần Cung. Có ba mức Dễ, Vừa và Khó.

- **Chơi ngay trên web:** https://tiendat2308.github.io/giang-long-que-hiep/
- **Tải bản mobile:** mục [Releases → mobile-latest](https://github.com/TienDat2308/giang-long-que-hiep/releases/tag/mobile-latest)

## Cài lên điện thoại

**Android**
1. Mở trang Releases trên điện thoại, tải `GiangLongQueHiep.apk`.
2. Mở file vừa tải. Nếu máy hỏi, cho phép trình duyệt cài ứng dụng từ nguồn không xác định.

Bản APK được ký bằng khóa debug, dùng để cài trực tiếp và chưa đưa lên Google Play.

**iPhone / iPad**
- **Cách nhanh (PWA):** mở link web bằng Safari, bấm nút Chia sẻ, chọn *Thêm vào Màn hình chính*. Game sẽ mở toàn màn hình như một ứng dụng và chơi được khi mất mạng sau lần mở đầu.
- **Cài file IPA:** tải `GiangLongQueHiep-unsigned.ipa` rồi cài bằng [AltStore](https://altstore.io) hoặc [Sideloadly](https://sideloadly.io) với Apple ID của bạn. Với Apple ID miễn phí, Apple yêu cầu ký lại ứng dụng mỗi 7 ngày. Muốn phát hành lên App Store thì cần tài khoản Apple Developer.

## Điều khiển

| Phím | Tác dụng |
|---|---|
| `A` `D` | Di chuyển |
| `W` / `Space` | Nhảy ba tầng (lộn nhào), giữ khi rơi để lướt gió |
| `K` / `Shift` | Lăng Ba Vi Bộ: lướt né |
| `J` | Đứng yên: quyền chưởng. Giữ hướng: cước pháp. Giữ `S`: Tảo Đường Cước. Đang chạy: Phi Tất. Trên không: lộn nhào cước rồi phi cước |
| `U` `I` `O` `Y` `H` | Kháng Long Hữu Hối, Phi Long Tại Thiên, Thần Long Bãi Vĩ, Kiến Long Tại Điền, Hồng Tiệm Ư Lục |
| `L` | Giáng Long Thập Bát Chưởng (cần đầy nội lực) |
| `P` / `Esc` | Tạm dừng |

Trên điện thoại có sẵn nút cảm ứng: ◀ ▼ ▶ để di chuyển, các nút Nhảy, Đánh, Lướt và sáu ấn chữ Hán để ra chiêu.

## Phát triển

Cần Node 22 trở lên.

```bash
npm install
npm run build        # tạo www/ (bản web + PWA) và dist/giang-long-que-hiep.html
npx serve www        # chạy thử tại http://localhost:3000
```

Mã game nằm trong `src/` và được ghép thành một trang duy nhất:

| File | Nội dung |
|---|---|
| `src/a-shell.html` | Giao diện, HUD, nút cảm ứng, màn hình chính |
| `src/b-core.js` | Canvas, điều khiển, âm thanh, hiệu ứng, cảnh nền |
| `src/c-fighter.js` | Bộ xương người que, nhân vật chính, đòn đánh và các chiêu Giáng Long |
| `src/d-foes.js` | Rồng, ám khí, binh khí, các loại địch và boss |
| `src/e-game.js` | Vòng lặp game, độ khó, các đợt địch, HUD |

**Android tại máy:** cần JDK 21 và Android SDK. Chạy `npm run android` để build lại, áp cấu hình và mở Android Studio.

**iOS tại máy:** cần máy Mac có Xcode. Chạy `npx cap add ios`, rồi `npm run sync`, rồi `npx cap open ios`.

Icon và màn hình chờ được vẽ bằng code trong `scripts/art.mjs`. Lệnh `npm run icons` vẽ lại icon web. `scripts/patch-native.mjs` áp icon, khóa màn hình ngang và chế độ toàn màn hình cho Android và iOS.

## Build tự động (GitHub Actions)

- `.github/workflows/pages.yml`: mỗi lần đẩy lên `main`, build bản web và đăng lên GitHub Pages.
- `.github/workflows/mobile.yml`: build APK trên Ubuntu và IPA chưa ký trên macOS, rồi thay hai file trong release `mobile-latest`.
