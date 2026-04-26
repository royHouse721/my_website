document.addEventListener('DOMContentLoaded', () => {

    // 1. 햄버거 메뉴
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    hamburger?.addEventListener('click', () => navLinks.classList.toggle('active'));

    // 현재 페이지 메뉴 활성화
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. FSM 상태 표시기
    const fsmStates = [
        'IDLE / 대기 중',
        'DIAGNOSING / 시스템 진단 진행',
        'CALIBRATING / 정밀 보정 중',
        'ANALYZING / 데이터 분석 중',
        'MAINTENANCE / 예방 보전 루틴 실행'
    ];
    const fsmTextElement = document.getElementById('fsm-text');
    if (fsmTextElement) {
        setInterval(() => {
            if (Math.random() > 0.7) {
                const randomState = fsmStates[Math.floor(Math.random() * (fsmStates.length - 1)) + 1];
                fsmTextElement.textContent = '현재 상태: ' + randomState;
                setTimeout(() => {
                    if (fsmTextElement) fsmTextElement.textContent = '현재 상태: ' + fsmStates[0];
                }, 3000);
            }
        }, 5000);
    }

    // 3. Firebase 게시판 (community 페이지에서만 작동)
    const firebaseConfig = {
        apiKey: "AIzaSyAMReng6mULQLZuXXYxj-sDE9zieWgTGPY",
        authDomain: "amk-portpolio.firebaseapp.com",
        databaseURL: "https://amk-portpolio-default-rtdb.firebaseio.com",
        projectId: "amk-portpolio",
        storageBucket: "amk-portpolio.firebasestorage.app",
        messagingSenderId: "463724956104",
        appId: "1:463724956104:web:487cd328d6ebc177ff98fd"
    };

    const boardFormEl = document.getElementById('board-form');
    if (boardFormEl && typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        const postsRef = db.ref('posts');

        const btnShow = document.getElementById('btn-show-form');
        const btnHide = document.getElementById('btn-hide-form');
        const formContainer = document.getElementById('form-container');
        const boardActions = document.querySelector('.board-actions');

        btnShow?.addEventListener('click', () => {
            formContainer.style.display = 'block';
            boardActions.style.display = 'none';
        });
        btnHide?.addEventListener('click', () => {
            formContainer.style.display = 'none';
            boardActions.style.display = 'flex';
            boardFormEl.reset();
        });

        postsRef.on('value', (snapshot) => {
            const container = document.getElementById('posts-container');
            if (!container) return;
            const data = snapshot.val();
            container.innerHTML = '';

            if (!data) {
                container.innerHTML = '<div style="text-align:center;color:#A0B0C0;padding:20px;">등록된 피드백이 없습니다.</div>';
                return;
            }

            const posts = Object.keys(data).map(k => ({ id: k, ...data[k] })).sort((a, b) => b.timestamp - a.timestamp);
            const liked = JSON.parse(localStorage.getItem('amk_liked') || '[]');

            posts.forEach(p => {
                const el = document.createElement('div');
                el.className = 'board-item';
                const isLiked = liked.includes(p.id);
                const comments = p.comments ? Object.values(p.comments) : [];
                const commentsHTML = comments.map(c => '<div style="font-size:0.85rem;color:#A0B0C0;margin-top:5px;">• ' + c + '</div>').join('');

                el.innerHTML = ''
                    + '<div class="board-item-header">'
                    + '<span class="board-item-author">' + p.author + '</span>'
                    + '<span class="board-item-date">' + p.date + '</span>'
                    + '</div>'
                    + '<div class="board-item-content">' + p.content + '</div>'
                    + commentsHTML
                    + '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:12px;">'
                    + '<button class="btn-like-fb" data-id="' + p.id + '" style="border:1px solid #00F2FF;background:' + (isLiked ? '#00F2FF' : 'transparent') + ';color:' + (isLiked ? '#000' : '#00F2FF') + ';padding:5px 15px;border-radius:20px;cursor:pointer;">추천 ' + (p.likes || 0) + '</button>'
                    + '<button class="btn-delete-fb" data-id="' + p.id + '" style="border:none;background:transparent;color:#FF0000;cursor:pointer;">삭제</button>'
                    + '</div>'
                    + '<div style="display:flex;gap:8px;margin-top:10px;">'
                    + '<input type="text" class="comment-input contact-input" data-id="' + p.id + '" placeholder="피드백 입력..." style="flex:1;padding:6px;">'
                    + '<button class="btn-comment-fb btn-submit-contact" data-id="' + p.id + '" style="padding:6px 12px;">등록</button>'
                    + '</div>';
                container.appendChild(el);
            });

            // 추천 버튼
            container.querySelectorAll('.btn-like-fb').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const likedArr = JSON.parse(localStorage.getItem('amk_liked') || '[]');
                    if (likedArr.includes(id)) { alert('이미 추천하셨습니다.'); return; }
                    db.ref('posts/' + id + '/likes').transaction(l => (l || 0) + 1);
                    likedArr.push(id);
                    localStorage.setItem('amk_liked', JSON.stringify(likedArr));
                });
            });

            // 삭제 버튼
            container.querySelectorAll('.btn-delete-fb').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const pw = prompt('비밀번호를 입력하세요:');
                    if (!pw) return;
                    postsRef.child(id).once('value', s => {
                        if (s.val() && s.val().password === pw) {
                            if (confirm('삭제하시겠습니까?')) db.ref('posts/' + id).remove();
                        } else {
                            alert('비밀번호가 일치하지 않습니다.');
                        }
                    });
                });
            });

            // 댓글 버튼
            container.querySelectorAll('.btn-comment-fb').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const input = container.querySelector('.comment-input[data-id="' + id + '"]');
                    if (input && input.value.trim()) {
                        db.ref('posts/' + id + '/comments').push(input.value.trim());
                        input.value = '';
                    }
                });
            });
        });

        boardFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            postsRef.push({
                author: document.getElementById('author').value.trim(),
                password: document.getElementById('password').value.trim(),
                content: document.getElementById('content').value.trim(),
                date: new Date().toLocaleString(),
                timestamp: Date.now(),
                likes: 0
            });
            boardFormEl.reset();
            formContainer.style.display = 'none';
            boardActions.style.display = 'flex';
        });
    }
});

// --- 우주 배경 애니메이션 ---
document.addEventListener('DOMContentLoaded', () => {
    const bg = document.querySelector('.bg-wrapper');
    if (!bg) return;
    const cvs = document.createElement('canvas');
    Object.assign(cvs.style, { position:'absolute', top:'0', left:'0', width:'100%', height:'100%', zIndex:'0' });
    bg.style.background = '#010510';
    bg.appendChild(cvs);
    const ctx = cvs.getContext('2d');
    let W = cvs.width = window.innerWidth;
    let H = cvs.height = window.innerHeight;
    window.addEventListener('resize', () => { W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; });

    const stars = [];
    for (let i = 0; i < 300; i++) {
        stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.1, o: Math.random()*0.6+0.2, sp: Math.random()*0.05+0.01 });
    }
    const nebulas = [
        { x: W*0.2, y: H*0.3, rad: 600, rgb: '30,90,200', vx: 0.2, vy: 0.1 },
        { x: W*0.7, y: H*0.6, rad: 500, rgb: '130,40,180', vx: -0.15, vy: 0.2 },
        { x: W*0.5, y: H*0.1, rad: 700, rgb: '0,180,255', vx: 0.1, vy: -0.1 }
    ];

    function draw() {
        ctx.fillStyle = '#010510'; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'screen';
        nebulas.forEach(n => {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > W) n.vx *= -1;
            if (n.y < 0 || n.y > H) n.vy *= -1;
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rad);
            g.addColorStop(0, 'rgba(' + n.rgb + ',0.3)');
            g.addColorStop(1, 'rgba(' + n.rgb + ',0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.rad, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
        stars.forEach(s => {
            s.y -= s.sp; if (s.y < 0) { s.y = H; s.x = Math.random()*W; }
            ctx.fillStyle = 'rgba(200,230,255,' + s.o + ')';
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    draw();
});
