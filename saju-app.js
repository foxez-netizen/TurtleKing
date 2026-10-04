/* 느릿느릿 사주풀이 — 화면 로직 */
(function () {
  'use strict';
  var C = window.SajuCore;
  var $ = function (id) { return document.getElementById(id); };
  var ELC = ['wood', 'fire', 'earth', 'metal', 'water'];

  var DAYMASTER = [
    ['갑목', '우뚝 선 큰 나무', '곧게 위로 뻗는 개척자 기질입니다. 시작하는 힘과 책임감이 크고 자존심이 강한 편이며, 한번 정한 방향은 쉽게 굽히지 않습니다. 융통성을 더하면 큰 그늘을 만드는 나무가 됩니다.'],
    ['을목', '바람에 휘는 풀과 덩굴', '부드럽게 휘면서도 끝내 살아남는 생활력의 사주입니다. 사람 사이를 잇는 친화력과 적응력이 좋고, 환경에 맞춰 길을 찾는 유연함이 장점입니다. 눈치를 보다 자기 주장을 놓치지 않도록 주의하세요.'],
    ['병화', '온 세상을 비추는 태양', '숨김없이 밝고 뜨거운 에너지를 가진 사람입니다. 표현력과 리더십이 좋고 베풀기를 즐기지만, 감정이 앞서 과열되거나 끝맺음이 약해질 수 있습니다. 꾸준함을 더하면 존재감이 오래갑니다.'],
    ['정화', '어둠을 밝히는 촛불·등불', '겉은 차분해도 속에 집중력과 열정이 타오르는 섬세한 불입니다. 한 사람, 한 분야를 깊게 파고드는 힘이 있고 배려심이 깊습니다. 마음을 혼자 오래 태우지 않도록 풀어주는 통로가 필요합니다.'],
    ['무토', '큰 산과 넓은 대지', '묵직하고 믿음직한 중심 역할의 사주입니다. 포용력과 인내가 크고 쉽게 흔들리지 않지만, 한번 굳으면 변화를 싫어해 고집으로 비칠 수 있습니다. 때를 기다리는 힘이 가장 큰 무기입니다.'],
    ['기토', '곡식을 키우는 논밭의 흙', '조용히 길러내고 품어주는 실속형 사주입니다. 현실 감각과 꼼꼼함, 사람을 키우는 재주가 있으며, 걱정이 많아지거나 속으로 삭이는 습관은 줄이는 편이 좋습니다.'],
    ['경금', '단단한 바위와 쇠칼', '결단력과 의리, 추진력이 강한 사주입니다. 옳고 그름이 분명하고 한번 뜻을 정하면 밀어붙이지만, 날이 서면 주변이 다칠 수 있습니다. 단련될수록 빛나는 원석입니다.'],
    ['신금', '다듬어진 보석과 칼날', '예민하고 섬세하며 완성도를 중시하는 금입니다. 심미안과 분석력이 뛰어나고 자존심이 강합니다. 작은 흠에 오래 매이지 않고 스스로를 너그럽게 대할 때 가치가 커집니다.'],
    ['임수', '넓은 바다와 큰 강', '스케일이 크고 지혜로우며 흐름을 읽는 능력이 좋은 물입니다. 포용력과 도전 정신이 있고 한곳에 머물기보다 넓게 움직이려 합니다. 방향을 잡아줄 제방(목표)이 있으면 힘이 배가됩니다.'],
    ['계수', '이슬과 빗물, 샘물', '조용히 스며드는 섬세한 지혜의 사주입니다. 직감과 감수성이 좋고 한 걸음 물러서 관찰하는 힘이 있습니다. 생각이 많아 행동이 늦어지지 않도록 작은 실행을 쌓아가세요.']
  ];
  var TEN_TEXT = [
    ['비견', '나와 같은 동료·자립심', '독립심과 자존심, 동료·경쟁자'],
    ['겁재', '경쟁과 승부욕', '승부욕, 협력과 경쟁, 재물 변동'],
    ['식신', '표현과 즐거움, 먹고사는 재주', '여유·재능·표현, 의식주의 복'],
    ['상관', '재능과 반골 기질', '창의·언변·비판 정신, 틀을 깨는 힘'],
    ['편재', '큰 재물과 활동 무대', '사업 수완·유동 재물, 활동적인 인간관계'],
    ['정재', '안정된 재물과 성실', '월급·저축 같은 꾸준한 재물, 현실 감각'],
    ['편관', '압박과 도전, 추진력', '규율·책임·권력, 스트레스와 단련'],
    ['정관', '명예와 질서', '직장·조직·평판, 반듯한 자기관리'],
    ['편인', '독특한 학습과 직관', '특수 분야·영감·비주류 공부'],
    ['정인', '배움과 보호', '학업·어른의 도움·안정과 자격']
  ];
  var EL_LACK = [
    '목(木)이 없습니다. 시작하는 힘과 성장 에너지를 의식적으로 채우는 것이 좋습니다. 초록 식물, 산책, 새로운 배움이 도움이 됩니다.',
    '화(火)가 없습니다. 열정과 표현이 부족해지기 쉬우니 사람을 만나고 몸을 움직이며 감정을 표현하는 시간이 필요합니다.',
    '토(土)가 없습니다. 중심을 잡고 신뢰를 쌓는 힘이 약할 수 있어 규칙적인 생활 리듬과 꾸준한 습관이 보완이 됩니다.',
    '금(金)이 없습니다. 맺고 끊는 결단과 마무리가 약해질 수 있습니다. 마감일을 정하고 정리하는 습관이 도움이 됩니다.',
    '수(水)가 없습니다. 지혜와 유연함, 휴식이 부족해지기 쉽습니다. 충분한 수면과 독서, 물가에서의 휴식이 균형을 줍니다.'
  ];
  var EL_EXCESS = [
    '목(木)이 많습니다. 의욕과 자존심이 넘쳐 고집이 세질 수 있으니 한 박자 쉬며 주변 의견을 듣는 연습이 좋습니다.',
    '화(火)가 많습니다. 에너지가 크지만 쉽게 달아오르고 지칠 수 있어 열을 식히는 휴식과 절제가 필요합니다.',
    '토(土)가 많습니다. 안정 지향이 강해 변화에 느릴 수 있으니 작은 시도를 일부러 늘려보세요.',
    '금(金)이 많습니다. 원칙이 강해 날카롭게 비칠 수 있어 부드러운 표현과 감정 돌봄이 균형을 줍니다.',
    '수(水)가 많습니다. 생각이 깊은 만큼 우유부단이나 걱정이 늘 수 있으니 결정 기한을 정해 행동으로 옮기세요.'
  ];
  var SINSAL_TEXT = {
    cheoneul: ['천을귀인', '가장 큰 길신으로 꼽힙니다. 어려울 때 귀인의 도움을 받기 쉽다고 봅니다.'],
    dohwa: ['도화살', '사람을 끄는 매력·인기의 별입니다. 예술·서비스·방송 분야에서 장점으로 쓰이며, 이성 문제는 절제가 필요합니다.'],
    yeokma: ['역마살', '이동·변화·해외·출장과 연결되는 별입니다. 한곳에 머물기보다 움직일 때 운이 트이는 경향이 있습니다.'],
    hwagae: ['화개살', '학문·예술·종교·정신세계에 이끌리는 별입니다. 혼자만의 시간이 힘이 되며 고독해지기 쉬운 면도 있습니다.'],
    baekho: ['백호대살', '강한 기운이 응축된 일주(柱)입니다. 추진력·승부 근성으로 쓰이면 강점이며, 급한 선택과 사고·건강은 조심하라고 봅니다.'],
    gwaegang: ['괴강살', '리더십과 극단적 결단력을 상징합니다. 강직하고 카리스마가 있어 크게 쓰이거나 크게 부딪히기도 합니다.'],
    yangin: ['양인살', '칼날처럼 날카로운 승부의 기운입니다. 전문직·무관·의료 등 날을 쓰는 일에서 강점이 되며, 성급함은 다스려야 합니다.'],
    munchang: ['문창귀인', '글·학문·시험에 유리한 지혜의 별입니다. 공부와 문서 운이 좋다고 봅니다.'],
    gwimun: ['귀문관살', '예민한 직감과 집중력의 별입니다. 예술·연구에 재능이 되지만 생각이 많아 불안·신경과민으로 번질 수 있습니다.'],
    wonjin: ['원진살', '서로 끌리면서도 어긋나는 미묘한 불화의 관계입니다. 가까운 사이에서 오해가 생기기 쉬우니 소통을 자주 하세요.'],
    cheondeok: ['천덕귀인', '하늘의 덕이라 불리며 큰 위기를 피하고 도움받는 길신입니다.'],
    woldeok: ['월덕귀인', '달의 덕이라 불리며 재난을 줄이고 복을 부르는 길신입니다.']
  };
  var KIND = { cheoneul: 'good', munchang: 'good', cheondeok: 'good', woldeok: 'good', dohwa: 'mid', yeokma: 'mid', hwagae: 'mid', baekho: 'warn', gwaegang: 'warn', yangin: 'warn', gwimun: 'warn', wonjin: 'warn' };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
  function p2(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtKST(jd) { var t = C.jdToKST(jd); return t.y + '.' + p2(t.m) + '.' + p2(t.d) + ' ' + p2(t.h) + ':' + p2(t.mi); }
  function chip(stem) { return '<span class="chip ' + ELC[C.STEM_EL[stem]] + '">' + C.STEMS_H[stem] + '</span>'; }
  function gzChips(p) { return '<span class="gzname"><span class="chip sm ' + ELC[C.STEM_EL[p.s]] + '">' + C.STEMS_H[p.s] + '</span><span class="chip sm ' + ELC[C.BRANCH_EL[p.b]] + '">' + C.BRANCHES_H[p.b] + '</span></span>'; }

  function initSelects() {
    var cy = new Date().getFullYear();
    var ys = $('f-year'); for (var y = cy; y >= 1900; y--) { var o = el('option'); o.value = y; o.textContent = y + '년'; ys.appendChild(o); }
    ys.value = 1990;
    var ms = $('f-month'); for (var m = 1; m <= 12; m++) { var o2 = el('option'); o2.value = m; o2.textContent = m + '월'; ms.appendChild(o2); }
    var ds = $('f-day'); for (var d = 1; d <= 31; d++) { var o3 = el('option'); o3.value = d; o3.textContent = d + '일'; ds.appendChild(o3); }
    var hs = $('f-hour'); var names = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
    for (var h = 0; h < 24; h++) { var o4 = el('option'); o4.value = h; o4.textContent = p2(h) + '시'; hs.appendChild(o4); }
    hs.value = 12;
    var mis = $('f-min'); for (var i = 0; i < 60; i++) { var o5 = el('option'); o5.value = i; o5.textContent = p2(i) + '분'; mis.appendChild(o5); }
  }

  function readForm() {
    var cal = document.querySelector('input[name="cal"]:checked').value;
    var o = {
      y: +$('f-year').value, m: +$('f-month').value, d: +$('f-day').value,
      h: +$('f-hour').value, mi: +$('f-min').value,
      unknownTime: $('f-notime').checked,
      gender: document.querySelector('input[name="gender"]:checked').value,
      yaja: $('f-jasi').value === 'yaja',
      longitudeFix: $('f-lon').checked,
      cal: cal, leap: $('f-leap').checked
    };
    return o;
  }

  function validateAndConvert(o) {
    var out = { solar: null, lunar: null, error: '' };
    if (o.cal === 'lunar') {
      var s = C.lunarToSolar(o.y, o.m, o.d, o.leap);
      if (!s) { out.error = '입력하신 음력 날짜가 존재하지 않습니다. (윤달 여부와 일수를 확인해 주세요)'; return out; }
      out.solar = { y: s.y, m: s.m, d: s.d };
      out.lunar = { y: o.y, m: o.m, d: o.d, leap: o.leap };
    } else {
      var dim = new Date(o.y, o.m, 0).getDate();
      if (o.d > dim) { out.error = o.y + '년 ' + o.m + '월은 ' + dim + '일까지만 있습니다.'; return out; }
      out.solar = { y: o.y, m: o.m, d: o.d };
      var l = C.solarToLunar(o.y, o.m, o.d);
      out.lunar = l;
    }
    if (out.solar.y < 1900 || out.solar.y > 2100) { out.error = '1900년~2100년 사이 날짜만 지원합니다.'; }
    return out;
  }

  function render() {
    var o = readForm();
    var conv = validateAndConvert(o);
    var err = $('form-error');
    if (conv.error) { err.textContent = conv.error; err.hidden = false; return; }
    err.hidden = true;
    var input = { y: conv.solar.y, m: conv.solar.m, d: conv.solar.d, h: o.h, mi: o.mi, unknownTime: o.unknownTime, gender: o.gender, yaja: o.yaja, longitudeFix: o.longitudeFix };
    var saju = C.calcSaju(input);
    var A = C.analyze(saju);
    var dae = C.calcDaeun(saju, o.gender);
    var sin = C.findSinsal(saju);
    var rel = C.branchRelations(saju);
    window.__saju = { saju: saju, A: A, dae: dae };
    $('result').hidden = false;
    renderHeader(o, conv, saju);
    renderTable(saju, A);
    renderElements(saju, A);
    renderTen(saju, A);
    renderDay(saju, A);
    renderSinsal(sin, rel, saju);
    renderDaeun(saju, A, dae);
    renderBasis(saju, conv, input);
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderHeader(o, conv, saju) {
    var P = saju.pillars, a = C.ANIMALS[P.year.b];
    var s = conv.solar, l = conv.lunar;
    var line = '양력 ' + s.y + '년 ' + s.m + '월 ' + s.d + '일';
    if (l) line += ' (음력 ' + l.y + '년 ' + (l.leap ? '윤' : '') + l.m + '월 ' + l.d + '일)';
    line += o.unknownTime ? ' · 태어난 시각 모름' : ' ' + p2(o.h) + ':' + p2(o.mi);
    line += ' · ' + (o.gender === 'M' ? '남성' : '여성');
    $('r-title').textContent = C.pillarName(P.year) + '년 ' + a + '띠';
    $('r-sub').textContent = line;
    var names = [P.hour, P.day, P.month, P.year].map(function (p) { return p ? C.pillarName(p) : '모름'; });
    $('r-ganji').innerHTML = '사주팔자 ' + [P.year, P.month, P.day, P.hour].map(function (p, i) { return (p ? C.pillarName(p) : '··') + ['년', '월', '일', '시'][i]; }).join(' ');
  }

  function tdStem(p, god, extra) {
    return '<td class="pcell ' + ELC[C.STEM_EL[p.s]] + '"><div class="hj">' + C.STEMS_H[p.s] + '</div><div class="ko">' + C.STEMS[p.s] + C.EL[C.STEM_EL[p.s]] + '</div></td>';
  }
  function renderTable(saju, A) {
    var P = saju.pillars, cols = ['hour', 'day', 'month', 'year'], names = { hour: '시주', day: '일주', month: '월주', year: '연주' };
    var h = '<table class="saju-table"><thead><tr><th></th>';
    cols.forEach(function (c) { h += '<th>' + names[c] + (c === 'day' ? ' <small>(나)</small>' : '') + '</th>'; });
    h += '</tr></thead><tbody>';
    h += '<tr><th>천간 십성</th>' + cols.map(function (c) {
      if (!P[c]) return '<td class="muted">-</td>';
      if (c === 'day') return '<td class="god me">일간(나)</td>';
      return '<td class="god">' + C.TEN_NAMES[A.detail[c].stemTen] + '</td>';
    }).join('') + '</tr>';
    h += '<tr><th>천간</th>' + cols.map(function (c) { return P[c] ? tdStem(P[c]) : '<td class="pcell none">?</td>'; }).join('') + '</tr>';
    h += '<tr><th>지지</th>' + cols.map(function (c) {
      if (!P[c]) return '<td class="pcell none">?</td>';
      var e = C.BRANCH_EL[P[c].b];
      return '<td class="pcell ' + ELC[e] + '"><div class="hj">' + C.BRANCHES_H[P[c].b] + '</div><div class="ko">' + C.BRANCHES[P[c].b] + C.EL[e] + '</div></td>';
    }).join('') + '</tr>';
    h += '<tr><th>지지 십성</th>' + cols.map(function (c) { return P[c] ? '<td class="god">' + C.TEN_NAMES[A.detail[c].branchTen] + '</td>' : '<td class="muted">-</td>'; }).join('') + '</tr>';
    h += '<tr><th>지장간</th>' + cols.map(function (c) {
      if (!P[c]) return '<td class="muted">-</td>';
      return '<td class="hid">' + A.detail[c].hidden.map(function (x) { return '<span class="hchip ' + ELC[C.STEM_EL[x.stem]] + '" title="' + C.TEN_NAMES[x.ten] + '">' + C.STEMS[x.stem] + '</span>'; }).join('') + '</td>';
    }).join('') + '</tr>';
    h += '<tr><th>12운성</th>' + cols.map(function (c) { return P[c] ? '<td class="god">' + A.detail[c].unseong + '</td>' : '<td class="muted">-</td>'; }).join('') + '</tr>';
    h += '</tbody></table>';
    $('r-table').innerHTML = h;
  }

  function renderElements(saju, A) {
    var total = A.elCount.reduce(function (a, b) { return a + b; }, 0);
    var wMax = Math.max.apply(null, A.elWeighted);
    var wTot = A.elWeighted.reduce(function (a, b) { return a + b; }, 0);
    var h = '';
    for (var i = 0; i < 5; i++) {
      var pct = Math.round(A.elWeighted[i] / wTot * 100);
      h += '<div class="bar-row"><span class="bar-label ' + ELC[i] + '">' + C.EL[i] + '(' + C.EL_H[i] + ')</span>' +
        '<span class="bar-track"><span class="bar-fill ' + ELC[i] + '" style="width:' + (A.elWeighted[i] / wMax * 100) + '%"></span></span>' +
        '<span class="bar-val">' + A.elCount[i] + '개 · ' + pct + '%</span></div>';
    }
    var notes = [];
    A.missing.forEach(function (i) { notes.push('<li>' + EL_LACK[i] + '</li>'); });
    A.excess.forEach(function (i) { notes.push('<li>' + EL_EXCESS[i] + '</li>'); });
    if (!notes.length) notes.push('<li>다섯 오행이 비교적 고르게 퍼져 있습니다. 극단적으로 비거나 넘치는 오행이 없는 편입니다.</li>');
    var max = A.elWeighted.indexOf(wMax);
    h += '<p class="note">가장 힘이 센 오행은 <b class="' + ELC[max] + '-t">' + C.EL[max] + '(' + C.EL_H[max] + ')</b>입니다. 막대 길이는 지장간(숨은 글자)까지 반영한 힘의 비율이며, 왼쪽의 개수는 겉으로 드러난 여덟 글자의 개수입니다.</p><ul class="plain">' + notes.join('') + '</ul>';
    $('r-elements').innerHTML = h;
  }

  function renderTen(saju, A) {
    var groups = [['비겁', [0, 1], '나와 같은 힘(자립·경쟁)'], ['식상', [2, 3], '내가 낳는 힘(표현·재능)'], ['재성', [4, 5], '내가 다스리는 힘(재물·현실)'], ['관성', [6, 7], '나를 다스리는 힘(직업·규율)'], ['인성', [8, 9], '나를 돕는 힘(학습·보호)']];
    var h = '<div class="ten-grid">';
    groups.forEach(function (g) {
      var n = A.tenCount[g[1][0]] + A.tenCount[g[1][1]];
      h += '<div class="ten-card' + (n === 0 ? ' zero' : '') + '"><div class="ten-name">' + g[0] + '</div><div class="ten-n">' + n + '</div><div class="ten-d">' + g[2] + '</div><div class="ten-s">' + C.TEN_NAMES[g[1][0]] + ' ' + A.tenCount[g[1][0]] + ' · ' + C.TEN_NAMES[g[1][1]] + ' ' + A.tenCount[g[1][1]] + '</div></div>';
    });
    h += '</div>';
    var sorted = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(function (a, b) { return A.tenCount[b] - A.tenCount[a]; });
    var top = sorted[0];
    h += '<p class="note">천간과 지지(정기)를 합친 십성 개수입니다. 가장 두드러진 십성은 <b>' + TEN_TEXT[top][0] + '</b> — ' + TEN_TEXT[top][2] + ' 성향이 강하게 드러납니다. ' + (A.tenCount.slice(0).every(function (x, i) { return true; }) ? '' : '') + '</p>';
    h += '<p class="note"><b>일간의 강약: ' + A.strength + '</b> (자기 편 힘 ' + Math.round(A.ratio * 100) + '% · ' + (A.inSeason ? '월령을 얻음' : '월령을 얻지 못함') + '). ' +
      (A.ratio >= 0.58 ? '자기 힘이 넘치는 편이므로 그 힘을 밖으로 쓰는 식상·재성·관성 운에서 일이 풀리기 쉽다고 봅니다.' :
        A.ratio <= 0.42 ? '자기 힘이 약한 편이므로 나를 돕는 인성·비겁 운에서 안정되고 힘이 붙는다고 봅니다.' :
          '힘의 균형이 비교적 맞아, 운에 따라 쓰임이 달라지는 중화에 가깝습니다.') + ' 이는 단순 점수 기반의 참고 판정이며 실제 용신 판단은 조후·합충 등 더 많은 요소를 종합해야 합니다.</p>';
    $('r-ten').innerHTML = h;
  }

  function renderDay(saju, A) {
    var ds = saju.pillars.day.s, d = DAYMASTER[ds];
    var yp = saju.pillars.day;
    var h = '<div class="daymaster"><div class="dm-chip">' + chip(ds) + '</div><div><div class="dm-name">일간 ' + d[0] + ' — ' + d[1] + '</div><p>' + d[2] + '</p></div></div>';
    h += '<p class="note">일주는 <b>' + C.pillarName(yp) + '일주(' + C.pillarHanja(yp) + ')</b>이며 일지의 십성은 <b>' + C.TEN_NAMES[A.detail.day.branchTen] + '</b>(' + TEN_TEXT[A.detail.day.branchTen][1] + '), 12운성은 <b>' + A.detail.day.unseong + '</b>입니다. 일지는 배우자궁이자 나의 속마음 자리로 봅니다.</p>';
    $('r-day').innerHTML = h;
  }

  function renderSinsal(sin, rel, saju) {
    var h = '';
    if (!sin.list.length) h += '<p class="note">이 사주에서 두드러지는 대표 신살은 발견되지 않았습니다.</p>';
    sin.list.forEach(function (s) {
      var t = SINSAL_TEXT[s.key];
      h += '<div class="sin-card ' + (KIND[s.key] || 'mid') + '"><div class="sin-head"><b>' + t[0] + '</b><span class="sin-where">' + s.where.join(', ') + '</span></div><p>' + t[1] + '</p></div>';
    });
    var gm = sin.gongmang;
    h += '<div class="sin-card mid"><div class="sin-head"><b>공망(空亡)</b><span class="sin-where">' + C.BRANCHES[gm.branches[0]] + '·' + C.BRANCHES[gm.branches[1]] + (gm.where.length ? ' → ' + gm.where.join(', ') : ' (원국에 해당 없음)') + '</span></div><p>일주 기준으로 비어 있다고 보는 두 지지입니다. 해당 지지가 있는 자리의 일이 기대만큼 채워지지 않거나, 반대로 집착을 내려놓는 힘으로 쓰이기도 합니다.</p></div>';
    $('r-sinsal').innerHTML = h;
    var rh = '';
    if (!rel.length) rh = '<p class="note">원국 지지 사이에 뚜렷한 충·합 관계가 없습니다.</p>';
    else rh = '<ul class="plain">' + rel.map(function (r) { return '<li><span class="rel-type">' + r.type + '</span> ' + r.text + '</li>'; }).join('') + '</ul>' +
      '<p class="note">충(沖)은 부딪혀 변동이 생기는 관계, 합(合)은 묶여 서로 끌리는 관계입니다. 길흉을 단정하기보다 해당 자리(년·월·일·시)의 일이 움직이기 쉽다는 신호로 읽습니다.</p>';
    $('r-rel').innerHTML = rh;
  }

  function renderDaeun(saju, A, dae) {
    var ds = saju.pillars.day.s, now = new Date(), cy = now.getFullYear();
    var birthYear = C.jdToKST(saju.jdBirth).y;
    var h = '<p class="note">' + (dae.forward ? '순행' : '역행') + ' 대운 · 대운수 <b>' + dae.years + '세 ' + dae.months + '개월</b> (출생부터 ' + (dae.forward ? '다음' : '직전') + ' 절기 <b>' + dae.targetName + '</b>까지 ' + dae.days.toFixed(1) + '일 ÷ 3). 연도는 양력 기준 대략의 시작 연도입니다.</p>';
    h += '<div class="daeun-row">';
    var curIdx = -1;
    dae.steps.forEach(function (s, i) { if (cy >= s.startYear && cy <= s.endYear) curIdx = i; });
    dae.steps.forEach(function (s, i) {
      var tg = C.tenGod(ds, s.p.s), tb = C.tenGod(ds, C.MAIN_STEM[s.p.b]);
      h += '<button type="button" class="dae-card' + (i === curIdx ? ' now' : '') + '" data-i="' + i + '"><div class="dae-age">' + s.startAge + '세~</div>' +
        '<div class="dae-ten">' + C.TEN_NAMES[tg] + '</div>' + gzChips(s.p) + '<div class="dae-ten">' + C.TEN_NAMES[tb] + '</div><div class="dae-year">' + s.startYear + '~</div></button>';
    });
    h += '</div><div id="seun-box"></div>';
    $('r-daeun').innerHTML = h;
    var btns = $('r-daeun').querySelectorAll('.dae-card');
    function pick(i) {
      Array.prototype.forEach.call(btns, function (b, j) { b.classList.toggle('sel', j === i); });
      renderSeun(saju, A, dae.steps[i]);
    }
    Array.prototype.forEach.call(btns, function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-i')); }); });
    pick(curIdx >= 0 ? curIdx : 0);
  }

  function renderSeun(saju, A, step) {
    var ds = saju.pillars.day.s, cy = new Date().getFullYear();
    var h = '<h4 class="sub">' + C.pillarName(step.p) + ' 대운(' + step.startYear + '~' + step.endYear + ')의 세운</h4><div class="seun-grid">';
    for (var y = step.startYear; y <= step.endYear; y++) {
      var p = C.seun(y), tg = C.tenGod(ds, p.s), tb = C.tenGod(ds, C.MAIN_STEM[p.b]);
      h += '<div class="seun-card' + (y === cy ? ' now' : '') + '"><div class="seun-y">' + y + (y === cy ? ' · 올해' : '') + '</div>' + gzChips(p) + '<div class="seun-t">' + C.TEN_NAMES[tg] + ' / ' + C.TEN_NAMES[tb] + '</div></div>';
    }
    h += '</div>';
    // 대운 간지가 원국과 충·합 이루는 지지 표시
    var br = [];
    ['year', 'month', 'day', 'hour'].forEach(function (c) {
      var P = saju.pillars[c]; if (!P) return;
      if ((P.b + 6) % 12 === step.p.b) br.push({ c: c, t: '충' });
    });
    var nm = { year: '연지', month: '월지', day: '일지', hour: '시지' };
    if (br.length) h += '<p class="note">이 대운의 지지(' + C.BRANCHES[step.p.b] + ')는 원국 ' + br.map(function (x) { return nm[x.c] + '(' + C.BRANCHES[saju.pillars[x.c].b] + ')와 충'; }).join(', ') + '을 이룹니다. 해당 자리와 관련된 환경 변화가 생기기 쉬운 시기로 읽습니다.</p>';
    h += '<p class="note">대운 천간은 ' + C.TEN_NAMES[C.tenGod(ds, step.p.s)] + '(' + TEN_TEXT[C.tenGod(ds, step.p.s)][2] + '), 지지는 ' + C.TEN_NAMES[C.tenGod(ds, C.MAIN_STEM[step.p.b])] + '(' + TEN_TEXT[C.tenGod(ds, C.MAIN_STEM[step.p.b])][2] + ') 기운이 10년 동안 배경으로 깔립니다. 세운의 연도 간지는 매년 입춘(2월 4일 무렵)에 바뀝니다.</p>';
    $('seun-box').innerHTML = h;
  }

  function renderBasis(saju, conv, input) {
    var j = saju.jie, ip = C.termJD(saju.yearForPillar === input.y ? input.y : input.y, 315);
    var h = '<ul class="plain">' +
      '<li>입력 시각은 한국 표준시(KST) 기준으로 계산했습니다' + (input.longitudeFix ? ' (서울 경도 보정 -30분 적용)' : ' (경도 보정 없음)') + '.</li>' +
      '<li>연주는 입춘(' + fmtKST(ip) + ')을 기준으로 바뀝니다. 이 사주의 연주 기준 연도는 <b>' + saju.yearForPillar + '년</b>입니다.</li>' +
      '<li>월주는 직전 절기 <b>' + j.curName + '(' + fmtKST(j.curJD) + ')</b>부터 다음 절기 <b>' + j.nextName + '(' + fmtKST(j.nextJD) + ')</b> 직전까지입니다.</li>' +
      (saju.jaSi ? '<li>23시~24시 출생이므로 자시 처리 방식(' + (input.yaja ? '야자시: 당일 일주 유지' : '조자시: 다음날 일주 적용') + ')이 반영되었습니다.</li>' : '') +
      '<li>절기 시각은 태양 황경을 천문 계산하여 구하며, 오차는 보통 10분 이내입니다. 절입 시각 앞뒤 30분 이내 출생이라면 공식 만세력으로 한 번 더 확인해 주세요.</li></ul>';
    $('r-basis').innerHTML = h;
  }

  function copyText() {
    var d = window.__saju; if (!d) return;
    var P = d.saju.pillars;
    var t = '[느릿느릿 사주풀이] ' + $('r-sub').textContent + '\n사주: ' + [P.hour, P.day, P.month, P.year].map(function (p) { return p ? C.pillarName(p) : '??'; }).join(' ') + ' (시·일·월·년)\n일간: ' + C.STEMS[P.day.s] + ' / 강약: ' + d.A.strength + '\n오행: ' + C.EL.map(function (e, i) { return e + d.A.elCount[i]; }).join(' ');
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { $('copy-btn').textContent = '복사했어요 ✓'; setTimeout(function () { $('copy-btn').textContent = '요약 복사하기'; }, 1800); });
  }

  function renderToday() {
    var n = new Date();
    var p = C.todayPillars(n.getFullYear(), n.getMonth() + 1, n.getDate());
    var box = $('today');
    if (!box) return;
    box.innerHTML = '오늘(' + (n.getMonth() + 1) + '월 ' + n.getDate() + '일)의 일진은 ' + gzChips(p) + ' <b>' + C.pillarName(p) + '일</b>입니다.';
  }

  function toggleCal() {
    var lunar = document.querySelector('input[name="cal"]:checked').value === 'lunar';
    $('leap-wrap').hidden = !lunar;
    if (!lunar) $('f-leap').checked = false;
  }
  function toggleTime() { $('f-hour').disabled = $('f-min').disabled = $('f-notime').checked; }

  function initTheme() {
    var btn = $('theme-btn'), root = document.documentElement;
    var saved = null; try { saved = localStorage.getItem('sj-theme'); } catch (e) { }
    if (saved) root.setAttribute('data-theme', saved);
    function label() { var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches); btn.textContent = dark ? '☀️ 라이트' : '🌙 다크'; }
    label();
    btn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next);
      try { localStorage.setItem('sj-theme', next); } catch (e) { }
      label();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if ($('theme-btn')) initTheme();
    if (!$('f-year')) return;
    initSelects(); renderToday();
    document.querySelectorAll('input[name="cal"]').forEach(function (r) { r.addEventListener('change', toggleCal); });
    $('f-notime').addEventListener('change', toggleTime);
    $('saju-form').addEventListener('submit', function (e) { e.preventDefault(); render(); });
    $('copy-btn').addEventListener('click', copyText);
    toggleCal(); toggleTime();
  });
})();
