let currentChapters = [];
let targetChapterId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadChapterIndex();
});

async function loadChapterIndex() {
  try {
    const res = await fetch('data/index.json');
    currentChapters = await res.json();
    renderChapterGrid();
  } catch (err) {
    console.error("Error loading chapter index:", err);
  }
}

function renderChapterGrid() {
  const isPremium = localStorage.getItem('ssc_premium_user') === 'true';
  const grid = document.getElementById('chapterGrid');
  grid.innerHTML = '';

  currentChapters.forEach(ch => {
    const isLocked = !ch.isFree && !isPremium;
    const card = document.createElement('div');
    card.className = "bg-slate-800 border border-slate-700/80 rounded-xl p-5 card-hover flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <span class="text-xs px-2.5 py-1 rounded-full font-medium ${ch.isFree ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
            ${ch.isFree ? 'ফ্রি অধ্যায়' : 'প্রিমিয়াম'}
          </span>
          ${isLocked ? '<i class="fa-solid fa-lock text-amber-400"></i>' : '<i class="fa-solid fa-book-open text-emerald-400"></i>'}
        </div>
        <h3 class="font-bold text-white text-lg mb-2">${ch.title}</h3>
        <p class="text-xs text-slate-400 mb-4">মোট প্রশ্ন সমাধান: ${ch.totalQuestions} টি</p>
      </div>
      <button onclick="openChapter(${ch.id}, ${isLocked})" class="w-full py-2 bg-slate-700 hover:bg-slate-600 text-amber-400 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition">
        ${isLocked ? 'আনলক করুন' : 'অধ্যায় প্রবেশ করুন'} <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    `;
    grid.appendChild(card);
  });
}

async function openChapter(id, isLocked) {
  if (isLocked) {
    targetChapterId = id;
    document.getElementById('unlockModal').classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(`data/chapter-${id}.json`);
    const chapterData = await res.json();
    renderChapterDetail(chapterData);
  } catch (err) {
    alert("অধ্যায়ের তথ্য লোড করতে সমস্যা হয়েছে!");
  }
}

function renderChapterDetail(data) {
  document.getElementById('homeView').classList.add('hidden');
  document.getElementById('backBtn').classList.remove('hidden');
  
  const detail = document.getElementById('chapterDetailView');
  detail.classList.remove('hidden');

  let sampleQHtml = data.sampleQuestions.map(q => `
    <div class="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3">
      <p class="font-semibold text-amber-300 text-sm mb-2">${q.question}</p>
      <button onclick="toggleAnswer('${q.id}')" class="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded transition mb-2">
        <i class="fa-solid fa-eye"></i> সমাধান দেখুন
      </button>
      <div id="${q.id}" class="hidden mt-2 p-3 bg-slate-900/80 rounded-lg text-xs text-slate-300 border-l-2 border-emerald-500">
        ${q.answer}
      </div>
    </div>
  `).join('');

  detail.innerHTML = `
    <div class="mb-6 border-b border-slate-700 pb-4">
      <h2 class="text-2xl font-bold text-amber-400 mb-2">${data.chapterTitle}</h2>
      <div class="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-sm text-slate-300 leading-relaxed mb-4">
        <h4 class="font-semibold text-white mb-1"><i class="fa-solid fa-lightbulb text-amber-400"></i> অধ্যায় আলোচনা:</h4>
        ${data.discussion}
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-lg font-bold text-white mb-3">নমুনা প্রশ্ন ও উত্তর</h3>
      ${sampleQHtml || '<p class="text-xs text-slate-400">কোনো নমুনা প্রশ্ন পাওয়া যায়নি।</p>'}
    </div>
  `;
}

function toggleAnswer(id) {
  const el = document.getElementById(id);
  el.classList.toggle('hidden');
}

function showHome() {
  document.getElementById('chapterDetailView').classList.add('hidden');
  document.getElementById('backBtn').classList.add('hidden');
  document.getElementById('homeView').classList.remove('hidden');
}

function closeUnlockModal() {
  document.getElementById('unlockModal').classList.add('hidden');
}

function verifyAccessCode() {
  const code = document.getElementById('accessCodeInput').value.trim();
  if (code === 'SSC2026') {
    localStorage.setItem('ssc_premium_user', 'true');
    alert("অভিনন্দন! সফলভাবে প্রিমিয়াম সার্ভিস আনলক হয়েছে।");
    closeUnlockModal();
    renderChapterGrid();
  } else {
    alert("ভুল এক্সেস কোড! সঠিক কোডটি দিন।");
  }
}