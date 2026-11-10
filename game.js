(() => {
  const initial = { day: 1, soil: 58, water: 68, bio: 42, pest: 35, harvest: 0, selected: 'compost', finished: false, logCount: 1 };
  let state = { ...initial };
  const actions = {
    compost: { title: 'Kompos organik', tip: 'Kompos membantu tanah menyimpan air dan mendukung organisme pengurai.', apply: s => { s.soil += 14; s.bio += 3; s.pest -= 2; } },
    water: { title: 'Irigasi hemat', tip: 'Arahkan air ke zona akar. Irigasi berlebih dapat meningkatkan risiko penyakit.', apply: s => { s.water += 24; s.soil += 2; } },
    refugia: { title: 'Tanam refugia', tip: 'Bunga refugia menyediakan pakan dan tempat berlindung bagi musuh alami hama.', apply: s => { s.bio += 14; s.pest -= 12; s.soil += 2; } },
    rotation: { title: 'Rotasi tanaman', tip: 'Rotasi tanaman membantu memutus siklus hidup hama dan menjaga keseimbangan hara.', apply: s => { s.soil += 6; s.bio += 5; s.pest -= 8; } },
    pesticide: { title: 'Pestisida kimia', tip: 'Gunakan hanya bila perlu: pestisida nonselektif juga dapat membunuh penyerbuk dan predator alami.', apply: s => { s.pest -= 28; s.bio -= 12; s.soil -= 4; } }
  };
  const weather = [
    { label: 'CERAH', event: 'Cuaca cerah: penguapan meningkat.', water: -8, pest: 3, icon: '☀' },
    { label: 'BERAWAN', event: 'Berawan: tanaman tumbuh dengan penguapan lebih rendah.', water: -4, pest: 2, icon: '☁' },
    { label: 'CERAH', event: 'Cerah berangin: kelembapan lahan berkurang.', water: -7, pest: 2, icon: '☀' },
    { label: 'PANAS', event: 'Hari panas: air menguap lebih cepat.', water: -12, pest: 4, icon: '☀' },
    { label: 'HUJAN', event: 'Hujan sedang: air tanah terisi kembali.', water: 14, pest: 1, icon: '☂' },
    { label: 'CERAH', event: 'Cuaca cerah: penguapan meningkat.', water: -8, pest: 2, icon: '☀' },
    { label: 'CERAH', event: 'Hari panen tiba. Mari evaluasi kebunmu!', water: -5, pest: 2, icon: '☀' }
  ];
  const $ = id => document.getElementById(id);
  const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
  function update() {
    ['soil','water','bio','pest'].forEach(key => {
      const val = clamp(state[key]); state[key] = val;
      $(key + 'Value').textContent = val;
      $(key + 'Bar').style.width = val + '%';
    });
    $('soilTrend').textContent = state.soil >= 65 ? 'SEHAT' : state.soil >= 45 ? 'BAIK' : 'RENDAH';
    $('waterTrend').textContent = state.water >= 65 ? 'CUKUP' : state.water >= 35 ? 'PERLU PANTAU' : 'RENDAH';
    $('bioTrend').textContent = state.bio >= 65 ? 'TINGGI' : state.bio >= 45 ? 'SEDANG' : 'RENDAH';
    $('pestTrend').textContent = state.pest <= 25 ? 'RENDAH' : state.pest <= 45 ? 'TERKENDALI' : 'TINGGI';
    $('pestBar').style.background = state.pest > 60 ? '#d98068' : '';
    $('dayLabel').textContent = state.finished ? 'SELESAI' : `HARI ${state.day}`;
    $('weatherLabel').textContent = weather[Math.min(state.day - 1, 6)].label;
    $('dayDots').innerHTML = Array.from({length:7},(_,i)=>`<i class="${i < state.day-1 ? 'done' : ''} ${i === state.day-1 && !state.finished ? 'active' : ''}"></i>`).join('');
    $('daysRemaining').textContent = state.finished ? 'misi selesai' : `${7-state.day} hari`;
    $('harvestValue').textContent = clamp(state.harvest);
    $('harvestBar').style.width = clamp(state.harvest) + '%';
    $('soilTarget').textContent = `${state.soil}/60`;
    $('bioTarget').textContent = `${state.bio}/55`;
    $('pestTarget').textContent = `${state.pest}/40`;
    $('soilCheck').classList.toggle('complete', state.soil >= 60);
    $('bioCheck').classList.toggle('complete', state.bio >= 55);
    $('pestCheck').classList.toggle('complete', state.pest <= 40);
    $('pollinatorStatus').textContent = state.bio >= 40 ? 'Aktif' : 'Menurun';
    $('predatorStatus').textContent = state.bio >= 45 ? 'Banyak' : state.bio >= 25 ? 'Ada' : 'Sedikit';
    $('decomposerStatus').textContent = state.soil >= 40 ? 'Ada' : 'Menurun';
    $('pollinatorStatus').classList.toggle('low', state.bio < 40);
    $('predatorStatus').classList.toggle('low', state.bio < 25);
    $('decomposerStatus').classList.toggle('low', state.soil < 40);
    const growth = state.harvest < 15 ? 'Tanaman mulai beradaptasi' : state.harvest < 45 ? 'Fase vegetatif · daun bertambah' : state.harvest < 75 ? 'Fase generatif · bakal buah' : 'Buah berkembang · mendekati panen';
    $('fieldStatus').textContent = state.finished ? 'Siklus pengamatan selesai' : growth;
    $('growthNote').textContent = state.finished ? 'Hasil akhir tercatat' : (state.water < 30 ? 'Perlu irigasi' : state.pest > 60 ? 'Waspadai serangan hama' : `${Math.round(state.harvest)}% potensi panen`);
    $('fieldArt').classList.toggle('rainy', weather[Math.min(state.day-1,6)].label === 'HUJAN');
    $('cropBed').style.setProperty('--growth', Math.max(.68, .68 + state.harvest/300));
    $('cropBed').querySelectorAll('.crop').forEach((el,i) => { el.style.setProperty('--h', `${Math.min(105, 50 + state.harvest*.45 + (i%3)*7)}px`); });
    $('runDayBtn').disabled = state.finished;
  }
  function addLog(title, detail, isNew=true) {
    if (isNew) state.logCount++;
    const row = document.createElement('div'); row.className = 'log-entry';
    row.innerHTML = `<span class="log-dot"></span><div><b>${title}</b><small>${detail}</small></div>`;
    $('logList').prepend(row); $('logCount').textContent = String(state.logCount).padStart(2,'0');
    while ($('logList').children.length > 6) $('logList').lastElementChild.remove();
  }
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }
  document.querySelectorAll('.action-card').forEach(card => card.addEventListener('click', () => {
    if (state.finished) return;
    state.selected = card.dataset.action;
    document.querySelectorAll('.action-card').forEach(c => c.classList.toggle('selected', c === card));
    $('actionTip').innerHTML = `<span class="tip-icon">✦</span> ${actions[state.selected].tip}`;
  }));
  $('runDayBtn').addEventListener('click', () => {
    if (state.finished) return;
    const currentDay = state.day;
    const climate = weather[currentDay - 1];
    const action = actions[state.selected];
    action.apply(state);
    // Daily ecosystem processes: soil respiration, pest pressure and weather-driven water changes.
    state.soil -= 1;
    state.water += climate.water;
    state.pest += climate.pest;
    if (state.bio >= 50) state.pest -= 4;
    else if (state.bio < 30) state.pest += 3;
    if (state.water > 88) { state.pest += 2; }
    // Growth rewards balanced soil moisture, healthy soil, biodiversity, and manageable pests.
    let growth = 5;
    if (state.soil >= 50) growth += 4;
    else if (state.soil < 30) growth -= 4;
    if (state.water >= 35 && state.water <= 82) growth += 4;
    else if (state.water < 30) growth -= 5;
    else if (state.water > 88) growth -= 2;
    if (state.bio >= 50) growth += 3;
    else if (state.bio < 25) growth -= 4;
    if (state.pest <= 40) growth += 3;
    else if (state.pest > 60) growth -= 6;
    state.harvest = clamp(state.harvest + Math.max(2, growth));
    state.soil = clamp(state.soil); state.water = clamp(state.water); state.bio = clamp(state.bio); state.pest = clamp(state.pest);
    addLog(action.title, `Hari ${currentDay} · ${climate.event}`);
    $('weatherLabel').textContent = climate.label;
    $('fieldArt').classList.add('growing'); setTimeout(() => $('fieldArt').classList.remove('growing'), 750);
    if (state.day >= 7) {
      state.finished = true; update(); showResult();
    } else {
      state.day++;
      update();
      const next = weather[state.day-1];
      $('weatherLabel').textContent = next.label;
      toast(`${climate.icon} ${climate.event}`);
    }
  });
  function showResult() {
    const success = state.soil >= 60 && state.bio >= 55 && state.pest <= 40 && state.harvest >= 65;
    $('resultKicker').textContent = success ? 'MISI BERHASIL' : 'EVALUASI LAPANGAN';
    $('resultTitle').textContent = success ? 'Kebunmu berkembang!' : 'Siklus pengamatan selesai';
    $('resultArt').textContent = success ? '🌾' : '🌱';
    $('resultCopy').textContent = success
      ? 'Kamu menjaga tanah, air, dan organisme tetap seimbang. Kebun yang sehat menghasilkan panen sekaligus merawat lingkungan.'
      : 'Setiap keputusan memberi pelajaran. Coba lagi dengan mengamati indikator: pulihkan tanah dan hayati, atur air, lalu kendalikan hama secara terpadu.';
    $('resultStats').innerHTML = `<div><strong>${state.harvest}%</strong><small>potensi panen</small></div><div><strong>${state.bio}</strong><small>keanekaragaman</small></div><div><strong>${state.pest}</strong><small>tekanan hama</small></div>`;
    $('modalBackdrop').hidden = false;
  }
  $('modalClose').addEventListener('click', () => $('modalBackdrop').hidden = true);
  $('modalBackdrop').addEventListener('click', e => { if (e.target === $('modalBackdrop')) $('modalBackdrop').hidden = true; });
  $('restartBtn').addEventListener('click', () => {
    state = { ...initial }; $('logList').innerHTML = ''; state.logCount = 0;
    addLog('Pengamatan awal', 'Hari 1 · Kondisi lahan dicatat');
    document.querySelectorAll('.action-card').forEach(c => c.classList.toggle('selected', c.dataset.action === 'compost'));
    $('actionTip').innerHTML = `<span class="tip-icon">✦</span> ${actions.compost.tip}`;
    $('modalBackdrop').hidden = true; update(); toast('Misi baru dimulai. Selamat mengelola kebun!');
  });
  $('helpBtn').addEventListener('click', () => {
    toast('Pilih satu tindakan per hari. Jaga tanah ≥60, hayati ≥55, hama ≤40, dan potensi panen ≥65%.');
  });
  update();
})();
