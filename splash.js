// splash.js - 우주 오프닝 시퀀스 (독립 파일)
window.addEventListener('load', function() {
    var splash = document.getElementById('splash-screen');
    var textEl = document.getElementById('splash-text');
    var canvas = document.getElementById('warp-canvas');
    if (!splash || !canvas) return;

    // 이미 이번 세션에서 오프닝을 봤다면 즉시 제거
    if (sessionStorage.getItem('splashShown')) {
        splash.remove();
        document.body.style.overflow = 'auto';
        return;
    }
    // 처음 접속 시에만 오프닝 재생 후 플래그 저장
    sessionStorage.setItem('splashShown', '1');

    // 캔버스 세팅
    var ctx = canvas.getContext('2d');
    var W = canvas.width  = window.innerWidth;
    var H = canvas.height = window.innerHeight;

    // 별 생성
    var stars = [];
    for (var i = 0; i < 600; i++) {
        stars.push({
            x: Math.random() * W - W / 2,
            y: Math.random() * H - H / 2,
            z: Math.random() * W
        });
    }

    var warping = false;

    // 애니메이션 루프
    function animate() {
        if (!splash.parentNode) return;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.translate(W / 2, H / 2);

        for (var j = 0; j < stars.length; j++) {
            var s = stars[j];
            s.z -= warping ? 22 : 2;
            if (s.z <= 0) s.z = W;

            var sx = s.x / (s.z / W);
            var sy = s.y / (s.z / W);
            var r  = (1 - s.z / W) * 2;
            var op = (1 - s.z / W);

            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + op + ')';
            ctx.fill();

            if (warping) {
                var tailX = s.x / ((s.z + 35) / W);
                var tailY = s.y / ((s.z + 35) / W);
                var tailOp = op * 0.5;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(tailX, tailY);
                ctx.strokeStyle = 'rgba(0,242,255,' + tailOp + ')';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        ctx.translate(-W / 2, -H / 2);
        requestAnimationFrame(animate);
    }

    animate();

    // --- 오프닝 시퀀스 ---

    // 0.1초 후: 1단계 메시지
    setTimeout(function() {
        if (!textEl) return;
        textEl.style.opacity = '1';
        textEl.textContent = '데이터베이스 연결 중....';
    }, 100);

    // 1.6초 후: 2단계 메시지
    setTimeout(function() {
        if (!textEl) return;
        textEl.textContent = '서버 로드 성공 / 시스템 무결성 확인됨';
        textEl.style.color = '#00F2FF';
        textEl.style.textShadow = '0 0 20px #00F2FF';
    }, 1600);

    // 3.1초 후: 워프 돌입 + 메시지 사라짐
    setTimeout(function() {
        warping = true;
        if (!textEl) return;
        textEl.style.transition = 'opacity 0.5s';
        textEl.style.opacity   = '0';
    }, 3100);

    // 4.6초 후: 스플래시 페이드아웃 시작
    setTimeout(function() {
        splash.style.transition = 'opacity 1s ease-out';
        splash.style.opacity    = '0';
        setTimeout(function() {
            splash.remove();
            document.body.style.overflow = 'auto';
        }, 1000);
    }, 4600);
});
