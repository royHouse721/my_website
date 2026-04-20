document.addEventListener('DOMContentLoaded', () => {
    // 1. Hamburger Menu & Smooth Scroll
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    hamburger?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // 네비게이션 스크롤 액티브 로직 (페이지 이동용으로 변경됨)
    const navLinksList = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinksList.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    navLinksList.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active'); // Close mobile menu on click
        });
    });

    // 2. FSM 상태 표시기 로직 (Engineering Identity)
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
            // 70% 확률로 IDLE 유지, 30% 확률로 다른 상태
            if (Math.random() > 0.7) {
                const randomState = fsmStates[Math.floor(Math.random() * (fsmStates.length - 1)) + 1];
                fsmTextElement.textContent = `현재 상태: ${randomState}`;
                
                // 3초 후 다시 IDLE로 복귀
                setTimeout(() => {
                    fsmTextElement.textContent = `현재 상태: ${fsmStates[0]}`;
                }, 3000);
            }
        }, 5000);
    }

    // 3. COMMUNITY 게시판 로직 (localStorage 활용, 추천/댓글 포함)
    const boardForm = document.getElementById('board-form');
    const postsContainer = document.getElementById('posts-container');
    const formContainer = document.getElementById('form-container');
    const btnShowForm = document.getElementById('btn-show-form');
    const btnHideForm = document.getElementById('btn-hide-form');
    const boardActions = document.querySelector('.board-actions');
    
    if (boardForm && postsContainer) {
        // 폼 열기
        btnShowForm?.addEventListener('click', () => {
            formContainer.style.display = 'block';
            boardActions.style.display = 'none';
        });

        // 폼 닫기
        btnHideForm?.addEventListener('click', () => {
            formContainer.style.display = 'none';
            boardActions.style.display = 'flex';
            boardForm.reset();
        });

        // 데이터 불러오기
        const loadPosts = () => {
            const posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
            postsContainer.innerHTML = '';
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div style="text-align: center; color: var(--color-silver); padding: 20px;">등록된 기술 피드백이 없습니다. 자유롭게 의견을 남겨주세요.</div>';
                return;
            }

            posts.forEach(post => {
                // 구조 호환: 좋아요와 댓글이 없는 예전 데이터 기본값 세팅
                const likes = post.likes || 0;
                const comments = post.comments || [];

                const postEl = document.createElement('div');
                postEl.className = 'board-item';
                
                // 댓글 렌더링
                let commentsHTML = '';
                if (comments.length > 0) {
                    commentsHTML = '<div class="comment-list">' + comments.map(c => `<div class="comment-item">${escapeHTML(c)}</div>`).join('') + '</div>';
                }

                postEl.innerHTML = `
                    <div class="board-item-header">
                        <span class="board-item-author">${escapeHTML(post.author)}</span>
                        <span class="board-item-date">${post.date}</span>
                    </div>
                    <div class="board-item-content">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
                    
                    <div class="board-item-interaction">
                        <div class="interaction-stats">
                            <span><i class="fas fa-thumbs-up"></i> ${likes}</span>
                            <span><i class="fas fa-comment"></i> ${comments.length}</span>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-like" data-id="${post.id}">추천</button>
                            <button class="btn-edit" data-id="${post.id}" style="border:none; background:transparent; color:var(--color-silver); cursor:pointer;">수정</button>
                            <button class="btn-delete" data-id="${post.id}" style="border:none; background:transparent; color:var(--color-neon-red); cursor:pointer;">삭제</button>
                        </div>
                    </div>
                    
                    ${commentsHTML}
                    
                    <div class="comment-form">
                        <input type="text" id="comment-input-${post.id}" placeholder="동료 피드백을 남겨주세요..." class="contact-input">
                        <button class="btn-submit-comment btn-submit-contact" data-id="${post.id}">등록</button>
                    </div>
                `;
                postsContainer.appendChild(postEl);
            });
            
            attachBoardEvents();
        };

        // 데이터 저장하기
        boardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const authorInput = document.getElementById('author').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            const contentInput = document.getElementById('content').value.trim();
            
            if (!authorInput || !passwordInput || !contentInput) return;

            const posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
            
            const newPost = {
                id: Date.now().toString(),
                author: authorInput,
                password: passwordInput,
                content: contentInput,
                date: new Date().toLocaleString(),
                likes: 0,
                comments: []
            };
            
            posts.unshift(newPost);
            localStorage.setItem('amk_board_posts', JSON.stringify(posts));
            
            boardForm.reset();
            formContainer.style.display = 'none';
            boardActions.style.display = 'flex';
            loadPosts();
        });

        const attachBoardEvents = () => {
            // 삭제
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                    const post = posts.find(p => p.id === id);

                    if (!post) return;

                    const password = prompt('비밀번호를 입력하세요:');
                    if (password === post.password) {
                        if (confirm('이 기록을 삭제하시겠습니까?')) {
                            posts = posts.filter(p => p.id !== id);
                            localStorage.setItem('amk_board_posts', JSON.stringify(posts));
                            loadPosts();
                        }
                    } else if (password !== null) {
                        alert('비밀번호가 일치하지 않습니다.');
                    }
                });
            });

            // 수정
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                    const post = posts.find(p => p.id === id);
                    
                    if (post) {
                        const password = prompt('비밀번호를 입력하세요:');
                        if (password === post.password) {
                            const newContent = prompt('수정할 내용을 입력하세요:', post.content);
                            if (newContent !== null && newContent.trim() !== '') {
                                post.content = newContent.trim();
                                post.date = new Date().toLocaleString() + ' (수정됨)';
                                localStorage.setItem('amk_board_posts', JSON.stringify(posts));
                                loadPosts();
                            }
                        } else if (password !== null) {
                            alert('비밀번호가 일치하지 않습니다.');
                        }
                    }
                });
            });

            // 추천
            document.querySelectorAll('.btn-like').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                    const post = posts.find(p => p.id === id);
                    
                    if (post) {
                        post.likes = (post.likes || 0) + 1;
                        localStorage.setItem('amk_board_posts', JSON.stringify(posts));
                        loadPosts();
                    }
                });
            });

            // 댓글 등록
            document.querySelectorAll('.btn-submit-comment').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const inputEl = document.getElementById(`comment-input-${id}`);
                    const comment = inputEl.value.trim();

                    if (comment) {
                        let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                        const post = posts.find(p => p.id === id);
                        
                        if (post) {
                            post.comments = post.comments || [];
                            post.comments.push(comment);
                            localStorage.setItem('amk_board_posts', JSON.stringify(posts));
                            loadPosts();
                        }
                    }
                });
            });
        };

        // 초기 로드
        loadPosts();
    }

    // 4. Contact Form 제출 로직
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('메시지가 성공적으로 전송되었습니다.');
            contactForm.reset();
        });
    }

    // 5. Lightbox 기능 (최적화 및 시각화 반영)
    const initLightbox = () => {
        const modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.innerHTML = '<img id="lightbox-img" src="" alt="확대 이미지">';
        document.body.appendChild(modal);

        const imgElements = document.querySelectorAll('.technical-asset');
        const lightboxImg = document.getElementById('lightbox-img');

        imgElements.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                modal.style.display = 'flex';
            });
        });

        modal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    };

    initLightbox();
});

// XSS 방지 유틸
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// --- Dynamic High-Tech Animation Background ---
document.addEventListener('DOMContentLoaded', () => {
    const bgWrapper = document.querySelector('.bg-wrapper');
    if (!bgWrapper) return;
    
    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'tech-bg-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    // Override any static CSS background settings
    bgWrapper.style.backgroundImage = 'none';
    bgWrapper.style.background = '#020C1B'; // Deep Dark Navy Base
    bgWrapper.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Setup Particles (Red glowing dots)
    const particles = [];
    const particleCount = 150;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            alpha: Math.random() * 0.8 + 0.2
        });
    }

    let time = 0;

    function render() {
        // Clear background with soft fade for trail/glow effect
        ctx.fillStyle = 'rgba(2, 12, 27, 0.4)'; 
        ctx.fillRect(0, 0, width, height);

        // Draw overlapping flowing red ribbon waves
        ctx.globalCompositeOperation = 'screen';
        const waveColors = [
            'rgba(255, 50, 50, 0.02)',
            'rgba(255, 30, 30, 0.03)',
            'rgba(220, 10, 10, 0.04)'
        ];

        for (let j = 0; j < waveColors.length; j++) {
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            for (let i = 0; i <= width; i += 40) {
                // Complex sine wave math for organic flow
                const y = Math.sin((i * 0.002) + time * 0.8 + j) * 120 
                        + Math.cos((i * 0.005) - time * 0.5) * 80 
                        + (height / 2) + Math.sin(time + j) * 40;
                ctx.lineTo(i, y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fillStyle = waveColors[j];
            ctx.fill();

            // Line stroke on top of the ribbon for the crisp wave edge
            ctx.beginPath();
            ctx.moveTo(0, height / 2);
            for (let i = 0; i <= width; i += 20) {
                const y = Math.sin((i * 0.002) + time * 0.8 + j) * 120 
                        + Math.cos((i * 0.005) - time * 0.5) * 80 
                        + (height / 2) + Math.sin(time + j) * 40;
                ctx.lineTo(i, y);
            }
            ctx.strokeStyle = `rgba(255, 30, 30, ${0.15 + j * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.globalCompositeOperation = 'source-over';

        // Draw scattered glowing particles (like data points)
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Screen wrap
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Pulse effect
            p.alpha += (Math.random() - 0.5) * 0.04;
            if (p.alpha < 0.2) p.alpha = 0.2;
            if (p.alpha > 1.0) p.alpha = 1.0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 0, 0, 0.9)';
            ctx.fillStyle = `rgba(255, 60, 60, ${p.alpha})`;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        });

        time += 0.015;
        requestAnimationFrame(render);
    }

    render();
});
