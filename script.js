document.addEventListener('DOMContentLoaded', () => {
    // 1. 네비게이션 액티브 상태 처리
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
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

    // 3. COMMUNITY 게시판 로직 (localStorage 활용)
    const boardForm = document.getElementById('board-form');
    const postsContainer = document.getElementById('posts-container');
    
    if (boardForm && postsContainer) {
        // 데이터 불러오기
        const loadPosts = () => {
            const posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
            postsContainer.innerHTML = '';
            
            if (posts.length === 0) {
                postsContainer.innerHTML = '<div style="text-align: center; color: var(--color-silver); padding: 20px;">등록된 기록이 없습니다. 자유롭게 의견을 남겨주세요.</div>';
                return;
            }

            posts.forEach(post => {
                const postEl = document.createElement('div');
                postEl.className = 'board-item';
                postEl.innerHTML = `
                    <div class="board-item-header">
                        <span class="board-item-author">${escapeHTML(post.author)}</span>
                        <span class="board-item-date">${post.date}</span>
                    </div>
                    <div class="board-item-content">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
                    <div class="board-item-actions">
                        <button class="btn-edit" data-id="${post.id}">수정</button>
                        <button class="btn-danger btn-delete" data-id="${post.id}">삭제</button>
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
            const contentInput = document.getElementById('content').value.trim();
            
            if (!authorInput || !contentInput) return;

            const posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
            
            const newPost = {
                id: Date.now().toString(),
                author: authorInput,
                content: contentInput,
                date: new Date().toLocaleString()
            };
            
            posts.unshift(newPost);
            localStorage.setItem('amk_board_posts', JSON.stringify(posts));
            
            boardForm.reset();
            loadPosts();
        });

        const attachBoardEvents = () => {
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm('이 기록을 삭제하시겠습니까?')) {
                        let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                        posts = posts.filter(p => p.id !== id);
                        localStorage.setItem('amk_board_posts', JSON.stringify(posts));
                        loadPosts();
                    }
                });
            });

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    let posts = JSON.parse(localStorage.getItem('amk_board_posts')) || [];
                    const post = posts.find(p => p.id === id);
                    
                    if (post) {
                        const newContent = prompt('수정할 내용을 입력하세요:', post.content);
                        if (newContent !== null && newContent.trim() !== '') {
                            post.content = newContent.trim();
                            post.date = new Date().toLocaleString() + ' (수정됨)';
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
