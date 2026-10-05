/* 느릿느릿 사주풀이 — 만세력 계산 엔진 (브라우저/Node 공용)
 * 태양 황경(Meeus) 기반 24절기, 삭(朔) 기반 음력 변환, 사주 4주·십성·대운·세운·신살.
 * 모든 시각은 한국 표준시(KST, UTC+9) 기준. */
(function (root) {
  'use strict';
  var RAD = Math.PI / 180;
  var STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
  var STEMS_H = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
  var BRANCHES_H = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var ANIMALS = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
  var EL = ['목','화','토','금','수'];
  var EL_H = ['木','火','土','金','水'];
  var STEM_EL = [0,0,1,1,2,2,3,3,4,4];
  var BRANCH_EL = [4,2,0,0,2,1,1,2,3,3,2,4];
  var BRANCH_YANG = [1,0,1,0,1,0,1,0,1,0,1,0]; // 체(體) 기준 음양
  var HIDDEN = [ // 지장간 [여기, 중기, 정기]
    [8,9],[9,7,5],[4,2,0],[0,1],[1,9,4],[4,6,2],[2,5,3],[3,1,5],[4,8,6],[6,7],[7,3,4],[4,0,8]
  ];
  // 지지 본기(정기)의 천간 인덱스: 십성 계산용(자=계, 오=정)
  var MAIN_STEM = [9,5,0,1,4,2,3,5,6,7,4,8];

  /* ---------- 천문 계산 ---------- */
  function jdFromUTC(y, mo, d, h) { // 그레고리력 -> JD
    if (mo <= 2) { y -= 1; mo += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5 + h / 24;
  }
  function dayNumFromYMD(y, m, d) { return Math.floor(jdFromUTC(y, m, d, 0) + 0.5); } // 정수 날짜번호 (JDN)
  function ymdFromDayNum(n) {
    var a = n + 32044, b = Math.floor((4 * a + 3) / 146097), c = a - Math.floor(146097 * b / 4);
    var d = Math.floor((4 * c + 3) / 1461), e = c - Math.floor(1461 * d / 4), m = Math.floor((5 * e + 2) / 153);
    return { y: 100 * b + d - 4800 + Math.floor(m / 10), m: m + 3 - 12 * Math.floor(m / 10), d: e - Math.floor((153 * m + 2) / 5) + 1 };
  }
  function deltaT(y) { // 초
    var t;
    if (y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t; }
    if (y < 1941) { t = y - 1920; return 21.20 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t * t * t; }
    if (y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t + 0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5); }
    if (y < 2050) { t = y - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    return -20 + 32 * Math.pow((y - 1820) / 100, 2);
  }
  function normDeg(x) { x = x % 360; return x < 0 ? x + 360 : x; }
  // 태양 겉보기 황경(도). jdUT: UT 기준 JD
  function sunLongitude(jdUT) {
    var jde = jdUT + deltaT(2000 + (jdUT - 2451545) / 365.25) / 86400;
    var T = (jde - 2451545) / 36525;
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var e = 0.016708634 - 0.000042037 * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) + 0.000289 * Math.sin(3 * M * RAD);
    var pert = 0.00134 * Math.cos((153.23 + 22518.7541 * T) * RAD) + 0.00154 * Math.cos((216.57 + 45037.5082 * T) * RAD) +
               0.00200 * Math.cos((312.69 + 32964.3577 * T) * RAD) + 0.00179 * Math.sin((350.74 + 445267.1142 * T - 0.00144 * T * T) * RAD) +
               0.00178 * Math.sin((231.19 + 20.20 * T) * RAD);
    var trueLon = L0 + C + pert;
    var omega = 125.04 - 1934.136 * T;
    return normDeg(trueLon - 0.00569 - 0.00478 * Math.sin(omega * RAD));
  }
  // 황경 target(도)에 태양이 도달하는 UT JD (guess 근처)
  function solveSun(target, guessJD) {
    var jd = guessJD;
    for (var i = 0; i < 40; i++) {
      var diff = ((target - sunLongitude(jd) + 540) % 360) - 180;
      jd += diff / 360.0 * 365.2422 * 0.985;
      if (Math.abs(diff) < 1e-7) break;
    }
    return jd;
  }
  // 해당 연도(양력)에서 황경 target에 도달하는 시각(KST JD, 즉 UT+9h)
  function termJD(year, target) {
    // 대략적 시기: 황경 0° = 3/20 부근
    var days = ((target - 0 + 360) % 360) / 360 * 365.2422;
    var guess = jdFromUTC(year, 3, 20, 0) + days; // 춘분 기준
    if (guess > jdFromUTC(year + 1, 1, 1, 0)) guess -= 365.2422;
    return solveSun(target, guess);
  }
  var TERM_NAMES = ['춘분','청명','곡우','입하','소만','망종','하지','소서','대서','입추','처서','백로','추분','한로','상강','입동','소설','대설','동지','소한','대한','입춘','우수','경칩'];
  // 24절기: 황경 0°(춘분)부터 15° 간격
  function termLongitude(i) { return (i * 15) % 360; }
  var JIE_LON = [315,345,15,45,75,105,135,165,195,225,255,285]; // 입춘..소한 (월 시작 '절')
  var JIE_NAMES = ['입춘','경칩','청명','입하','망종','소서','입추','백로','한로','입동','대설','소한'];

  function jdToKST(jdUT) { // -> {y,m,d,h,mi,s}
    var j = jdUT + 9 / 24 + 0.5, z = Math.floor(j), f = j - z;
    var ymd = ymdFromDayNum(z);
    var sec = Math.round(f * 86400);
    if (sec >= 86400) { sec -= 86400; ymd = ymdFromDayNum(z + 1); }
    return { y: ymd.y, m: ymd.m, d: ymd.d, h: Math.floor(sec / 3600), mi: Math.floor(sec % 3600 / 60), s: sec % 60 };
  }
  function kstToJD(y, m, d, h, mi) { return jdFromUTC(y, m, d, 0) + ((h || 0) * 60 + (mi || 0)) / 1440 - 9 / 24; }

  /* ---------- 월 절기 (사주 월주 기준) ---------- */
  // 주어진 JD(UT)에서 직전 '절'과 다음 '절' 시각 및 월 인덱스(0=인월)
  function jieAround(jdUT) {
    var lon = sunLongitude(jdUT);
    // 현재 절 구간 인덱스: 315° 이상부터 0
    var idx = Math.floor(normDeg(lon - 315) / 30); // 0=입춘~
    var curLon = JIE_LON[idx], nextLon = JIE_LON[(idx + 1) % 12];
    var back = normDeg(lon - curLon) / 360 * 365.2422;
    var cur = solveSun(curLon, jdUT - back);
    var nxt = solveSun(nextLon, cur + 30.4);
    return { idx: idx, curJD: cur, nextJD: nxt, curName: JIE_NAMES[idx], nextName: JIE_NAMES[(idx + 1) % 12] };
  }

  /* ---------- 음력 변환 ---------- */
  var nmCache = {};
  function newMoonJDE(k) {
    var T = k / 1236.85;
    var jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T + 0.00000000073 * T * T * T * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T) * RAD;
    var Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T - 0.000000058 * T * T * T * T) * RAD;
    var F = (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T) * RAD;
    var Om = (124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T) * RAD;
    var s = Math.sin;
    var c = -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F) +
      0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M) -
      0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M) -
      0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F) -
      0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om) - 0.00007 * s(Mp + 2 * M) +
      0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F) +
      0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F) -
      0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
    // 행성 섭동 보정 (Meeus Table 49.A 추가항)
    var A = [299.77 + 0.107408 * k - 0.009173 * T * T, 251.88 + 0.016321 * k, 251.83 + 26.651886 * k,
      349.42 + 36.412478 * k, 84.66 + 18.206239 * k, 141.74 + 53.303771 * k, 207.14 + 2.453732 * k,
      154.84 + 7.30686 * k, 34.52 + 27.261239 * k, 207.19 + 0.121824 * k, 291.34 + 1.844379 * k,
      161.72 + 24.198154 * k, 239.56 + 25.513099 * k, 331.55 + 3.592518 * k];
    var co = [0.000325, 0.000165, 0.000164, 0.000126, 0.00011, 0.000062, 0.00006, 0.000056, 0.000047, 0.000042, 0.000040, 0.000037, 0.000035, 0.000023];
    var p = 0;
    for (var i = 0; i < 14; i++) p += co[i] * s(A[i] * RAD);
    return jde + c + p;
  }
  // 삭(新月)의 KST 날짜번호(JDN)
  function newMoonDay(k) {
    if (nmCache[k] !== undefined) return nmCache[k];
    var jde = newMoonJDE(k);
    var jdUT = jde - deltaT(2000 + (jde - 2451545) / 365.25) / 86400;
    var v = Math.floor(jdUT + 9 / 24 + 0.5);
    nmCache[k] = v;
    return v;
  }
  function kFromDayNum(dn) { return Math.floor((dn - 2451550.1) / 29.530588861); }
  // 해당 일(JDN)이 속하는 달의 삭 일(JDN)과 k
  function monthStartFor(dn) {
    var k = kFromDayNum(dn) + 1;
    while (newMoonDay(k) > dn) k--;
    while (newMoonDay(k + 1) <= dn) k++;
    return k;
  }
  // 중기(황경 30n) 가 속한 KST 날짜번호
  function zhongqiDay(year, lon) {
    var jd = termJD(year, lon);
    return Math.floor(jd + 9 / 24 + 0.5);
  }
  var lunarSeqCache = {};
  // year 의 11월(동지월) 시작 k ~ year+1 의 11월 시작 k 사이 달력. {startK, months:[{k,start,end,num,leap}]}
  function lunarSequence(year) { // 11월(year-1) .. 10월(year) 까지 포함
    if (lunarSeqCache[year]) return lunarSeqCache[year];
    var w0 = zhongqiDay(year - 1, 270), w1 = zhongqiDay(year, 270);
    var k0 = monthStartFor(w0), k1 = monthStartFor(w1);
    var n = k1 - k0; // 12 또는 13
    var months = [], leapDone = false, num = 11;
    // 각 달에 중기 존재 여부
    var zq = [];
    for (var i = 0; i < 26; i++) { // 동지(year-1)부터 동지(year)까지 중기 13개 이상 -> 개별 계산
    }
    var zdays = [];
    // 중기 황경: 270(동지), 300, 330, 0, 30, ..., 240, 270
    var lons = [270, 300, 330, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270];
    for (var j = 0; j < lons.length; j++) {
      var yy = (j === 0) ? year - 1 : year;
      if (lons[j] === 300 || lons[j] === 330 || lons[j] === 270) yy = (j === 0) ? year - 1 : (j <= 2 ? year - 1 : year);
      // 300°(대한) 330°(우수)는 같은 해 1~2월 -> year 에 속함
      if (lons[j] === 300 || lons[j] === 330) yy = year;
      if (j === 0) yy = year - 1;
      if (j === lons.length - 1) yy = year;
      zdays.push(zhongqiDay(yy, lons[j]));
    }
    var leapPrev = false;
    for (var m = 0; m < n; m++) {
      var k = k0 + m, st = newMoonDay(k), en = newMoonDay(k + 1);
      var has = false;
      for (var z = 0; z < zdays.length; z++) if (zdays[z] >= st && zdays[z] < en) { has = true; break; }
      var leap = false;
      if (m > 0 && n === 13 && !leapDone && !has) { leap = true; leapDone = true; }
      var label;
      if (m === 0) label = 11; else if (leap) label = months[m - 1].num; else label = (months[m - 1].num % 12) + 1;
      months.push({ k: k, start: st, end: en, num: label, leap: leap, lunarYear: 0 });
    }
    // 음력 연도: 11,12월은 year-1, 그 외 year
    months.forEach(function (mo) { mo.lunarYear = (mo.num >= 11) ? year - 1 : year; });
    lunarSeqCache[year] = months;
    return months;
  }
  function solarToLunar(y, m, d) {
    var dn = dayNumFromYMD(y, m, d);
    var seqs = [lunarSequence(y), lunarSequence(y + 1)];
    for (var s = 0; s < 2; s++) {
      for (var i = 0; i < seqs[s].length; i++) {
        var mo = seqs[s][i];
        if (dn >= mo.start && dn < mo.end) return { y: mo.lunarYear, m: mo.num, d: dn - mo.start + 1, leap: mo.leap, monthDays: mo.end - mo.start };
      }
    }
    return null;
  }
  function lunarToSolar(ly, lm, ld, leap) {
    var seqs = [lunarSequence(ly), lunarSequence(ly + 1)];
    for (var s = 0; s < 2; s++) {
      for (var i = 0; i < seqs[s].length; i++) {
        var mo = seqs[s][i];
        if (mo.lunarYear === ly && mo.num === lm && !!mo.leap === !!leap) {
          var len = mo.end - mo.start;
          if (ld < 1 || ld > len) return null;
          var r = ymdFromDayNum(mo.start + ld - 1);
          return { y: r.y, m: r.m, d: r.d, monthDays: len };
        }
      }
    }
    return null;
  }
  function lunarLeapMonthOf(ly) { // 해당 음력 연도의 윤달 번호 (없으면 0)
    var found = 0;
    [lunarSequence(ly), lunarSequence(ly + 1)].forEach(function (seq) {
      seq.forEach(function (mo) { if (mo.leap && mo.lunarYear === ly) found = mo.num; });
    });
    return found;
  }

  /* ---------- 사주 4주 ---------- */
  function gz(i) { i = ((i % 60) + 60) % 60; return { s: i % 10, b: i % 12, idx: i }; }
  function pillarName(p) { return STEMS[p.s] + BRANCHES[p.b]; }
  function pillarHanja(p) { return STEMS_H[p.s] + BRANCHES_H[p.b]; }
  function dayIndex(dn) { return ((dn - 2415021) % 60 + 10 + 60) % 60; } // 1900-01-01(JDN 2415021)=갑술(10)

  /* opts: {y,m,d,h,mi (KST 양력), unknownTime, gender:'M'|'F', yaja:true, longitudeFix:bool} */
  function calcSaju(o) {
    var h = o.unknownTime ? 12 : (o.h || 0), mi = o.unknownTime ? 0 : (o.mi || 0);
    var corr = o.longitudeFix ? -30 : 0; // 경도 보정(분)
    var totalMin = h * 60 + mi + corr;
    var jdBirth = kstToJD(o.y, o.m, o.d, 0, 0) + totalMin / 1440; // UT JD 보정 포함
    var dn = dayNumFromYMD(o.y, o.m, o.d);
    if (totalMin < 0) { dn -= 1; totalMin += 1440; }
    else if (totalMin >= 1440) { dn += 1; totalMin -= 1440; }
    var minOfDay = totalMin;
    // 년주: 입춘 기준
    var lon = sunLongitude(jdBirth);
    var ipchun = termJD(o.y, 315);
    var yearForPillar = o.y;
    if (jdBirth < ipchun) yearForPillar = o.y - 1;
    var yp = gz(yearForPillar - 4);
    // 월주
    var jie = jieAround(jdBirth);
    var monthBranch = (2 + jie.idx) % 12;
    var monthStem = ((yp.s % 5) * 2 + 2 + jie.idx) % 10;
    var mp = { s: monthStem, b: monthBranch };
    // 일주 (자시 처리)
    var dIdx = dayIndex(dn);
    var jaSi = minOfDay >= 23 * 60; // 23:00~
    var dayIdxUsed = dIdx;
    if (jaSi && !o.unknownTime && !o.yaja) dayIdxUsed = (dIdx + 1) % 60; // 조자시: 다음날 일주
    var dp = gz(dayIdxUsed);
    // 시주
    var hp = null;
    if (!o.unknownTime) {
      var hb = Math.floor(((minOfDay + 60) % 1440) / 120);
      var dayStemForHour = dp.s;
      if (jaSi && o.yaja) dayStemForHour = (gz(dIdx + 1)).s; // 야자시: 시간 천간은 다음날 기준
      hp = { s: ((dayStemForHour % 5) * 2 + hb) % 10, b: hb };
    }
    var res = { input: o, pillars: { year: yp, month: mp, day: dp, hour: hp }, jie: jie, jdBirth: jdBirth, jaSi: jaSi && !o.unknownTime };
    res.yearForPillar = yearForPillar;
    return res;
  }

  /* ---------- 십성 ---------- */
  var TEN_NAMES = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
  var TEN_HANJA = ['比肩','劫財','食神','傷官','偏財','正財','偏官','正官','偏印','正印'];
  function tenGod(dayStem, other) {
    var de = STEM_EL[dayStem], oe = STEM_EL[other];
    var same = (dayStem % 2) === (other % 2);
    var rel = (oe - de + 5) % 5; // 0 동, 1 내가 생(식상), 2 내가 극(재), 3 나를 극(관), 4 나를 생(인)
    var base = [0, 2, 4, 6, 8][rel];
    return base + (same ? 0 : 1);
  }
  // 12운성
  var UNSUNG = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
  var JANGSAENG = [11,6,2,9,2,9,5,0,8,3]; // 갑해 을오 병인 정유 무인 기유 경사 신자 임신 계묘
  function twelveUnseong(stem, branch) {
    var start = JANGSAENG[stem];
    var yang = stem % 2 === 0;
    var diff = yang ? (branch - start + 12) % 12 : (start - branch + 12) % 12;
    return UNSUNG[diff];
  }
  // 공망
  function gongmang(dayPillar) {
    var xun = Math.floor(dayPillar.idx / 10) * 10; // 해당 순의 갑일 인덱스
    var startBranch = xun % 12;
    var a = (startBranch + 10) % 12, b = (startBranch + 11) % 12;
    return [a, b];
  }

  /* ---------- 신살 ---------- */
  var TRIAD = function (b) { // 삼합 그룹 인덱스: 인오술(0) 신자진(1) 사유축(2) 해묘미(3)
    if ([2,6,10].indexOf(b) >= 0) return 0;
    if ([8,0,4].indexOf(b) >= 0) return 1;
    if ([5,9,1].indexOf(b) >= 0) return 2;
    return 3;
  };
  var CHEONEUL = { 0:[1,7], 4:[1,7], 6:[1,7], 1:[0,8], 5:[0,8], 2:[11,9], 3:[11,9], 7:[2,6], 8:[3,5], 9:[3,5] };
  var DOHWA = [3, 9, 6, 0];
  var YEOKMA = [8, 2, 11, 5];
  var HWAGAE = [10, 4, 1, 7];
  var MUNCHANG = [5,6,8,9,8,9,11,0,2,3];
  var YANGIN = { 0:3, 2:6, 4:6, 6:9, 8:0 };
  var BAEKHO = ['갑진','을미','병술','정축','무진','임술','계축'];
  var GWAEGANG = ['경진','경술','임진','무술'];
  var GWIMUN = [[0,9],[1,6],[2,7],[3,8],[4,11],[5,10]];
  var WONJIN = [[0,7],[1,6],[2,9],[3,8],[4,11],[5,10]];
  var CHUNG = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
  var YUKHAP = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
  var YUKHAP_EL = [2,4,0,1,3,2]; // 자축토 인해목 묘술화 진유금 사신수 오미화(토) — 표준: 子丑土 寅亥木 卯戌火 辰酉金 巳申水 午未火/土
  var SAMHAP = [[8,0,4,4],[2,6,10,1],[5,9,1,3],[11,3,7,0]]; // 신자진수, 인오술화, 사유축금, 해묘미목 (마지막: 오행 인덱스 아님 -> 아래에서 정의)
  var SAMHAP_DEF = [
    { b:[8,0,4], el:4, name:'신자진 수국' }, { b:[2,6,10], el:1, name:'인오술 화국' },
    { b:[5,9,1], el:3, name:'사유축 금국' }, { b:[11,3,7], el:0, name:'해묘미 목국' }
  ];
  var CHEONDEOK = { 2:[3,'stem'], 3:[8,'branch'], 4:[8,'stem'], 5:[7,'stem'], 6:[11,'branch'], 7:[0,'stem'], 8:[9,'stem'], 9:[2,'branch'], 10:[2,'stem'], 11:[1,'stem'], 0:[5,'branch'], 1:[6,'stem'] };
  // 천덕: 월지 -> (인:정, 묘:신(申), 진:임, 사:신(辛), 오:해, 미:갑, 신:계, 유:인, 술:병, 해:을, 자:사, 축:경)
  var CHEONDEOK_TBL = { 2:{s:3}, 3:{b:8}, 4:{s:8}, 5:{s:7}, 6:{b:11}, 7:{s:0}, 8:{s:9}, 9:{b:2}, 10:{s:2}, 11:{s:1}, 0:{b:5}, 1:{s:6} };
  var WOLDEOK = [8, 6, 0, 2]; // 그룹별(인오술:병 / 신자진:임 / 사유축:경 / 해묘미:갑) 인덱스 순서는 TRIAD 와 동일
  var WOLDEOK_STEM = [2, 8, 6, 0];

  function pillarStrAt(p) { return STEMS[p.s] + BRANCHES[p.b]; }

  function findSinsal(saju) {
    var P = saju.pillars, list = [];
    var cols = ['year','month','day','hour'];
    var colKo = { year:'년주', month:'월주', day:'일주', hour:'시주' };
    var present = cols.filter(function (c) { return P[c]; });
    var dayS = P.day.s, dayB = P.day.b, yearB = P.year.b;
    function add(name, key, where, note) { list.push({ name: name, key: key, where: where, note: note || '' }); }

    // 천을귀인: 일간/년간 기준
    var ce = [];
    [['day', dayS], ['year', P.year.s]].forEach(function (pair) {
      var targets = CHEONEUL[pair[1]];
      present.forEach(function (c) {
        if (targets.indexOf(P[c].b) >= 0 && ce.indexOf(c) < 0) ce.push(c);
      });
    });
    if (ce.length) add('천을귀인', 'cheoneul', ce.map(function (c) { return colKo[c]; }));
    // 도화·역마·화개: 일지/년지 기준 삼합
    [['도화살','dohwa',DOHWA],['역마살','yeokma',YEOKMA],['화개살','hwagae',HWAGAE]].forEach(function (t) {
      var where = [];
      [['day', dayB], ['year', yearB]].forEach(function (pair) {
        var target = t[2][TRIAD(pair[1])];
        present.forEach(function (c) {
          if (P[c].b === target && c !== pair[0] && where.indexOf(c) < 0) where.push(c);
        });
      });
      if (where.length) add(t[0], t[1], where.map(function (c) { return colKo[c]; }));
    });
    // 백호대살, 괴강살: 주(柱) 자체
    var bw = [], gw = [];
    present.forEach(function (c) {
      var s = pillarStrAt(P[c]);
      if (BAEKHO.indexOf(s) >= 0) bw.push(colKo[c]);
      if (GWAEGANG.indexOf(s) >= 0) gw.push(colKo[c]);
    });
    if (bw.length) add('백호대살', 'baekho', bw);
    if (gw.length) add('괴강살', 'gwaegang', gw);
    // 양인살
    if (YANGIN[dayS] !== undefined) {
      var yw = present.filter(function (c) { return P[c].b === YANGIN[dayS]; }).map(function (c) { return colKo[c]; });
      if (yw.length) add('양인살', 'yangin', yw);
    }
    // 문창귀인
    var mw = present.filter(function (c) { return P[c].b === MUNCHANG[dayS]; }).map(function (c) { return colKo[c]; });
    if (mw.length) add('문창귀인', 'munchang', mw);
    // 귀문관살 / 원진살: 지지 쌍
    function pairs(tbl, name, key) {
      var found = [];
      for (var i = 0; i < present.length; i++) for (var j = i + 1; j < present.length; j++) {
        var a = P[present[i]].b, b = P[present[j]].b;
        tbl.forEach(function (pr) {
          if ((pr[0] === a && pr[1] === b) || (pr[0] === b && pr[1] === a)) found.push(colKo[present[i]] + '·' + colKo[present[j]] + '(' + BRANCHES[a] + BRANCHES[b] + ')');
        });
      }
      if (found.length) add(name, key, found);
    }
    pairs(GWIMUN, '귀문관살', 'gwimun');
    pairs(WONJIN, '원진살', 'wonjin');
    // 천덕·월덕 (월지 기준)
    var mb = P.month.b, dk = CHEONDEOK_TBL[mb], dkWhere = [];
    present.forEach(function (c) {
      if (c === 'month' && dk.s !== undefined && P[c].s === dk.s) dkWhere.push(colKo[c] + '천간');
      else if (dk.s !== undefined && P[c].s === dk.s) dkWhere.push(colKo[c] + '천간');
      if (dk.b !== undefined && P[c].b === dk.b) dkWhere.push(colKo[c] + '지지');
    });
    if (dkWhere.length) add('천덕귀인', 'cheondeok', dkWhere);
    var wd = WOLDEOK_STEM[TRIAD(mb)], wdWhere = [];
    present.forEach(function (c) { if (P[c].s === wd) wdWhere.push(colKo[c] + '천간'); });
    if (wdWhere.length) add('월덕귀인', 'woldeok', wdWhere);
    // 공망
    var gm = gongmang(P.day), gmWhere = [];
    present.forEach(function (c) { if (c !== 'day' && gm.indexOf(P[c].b) >= 0) gmWhere.push(colKo[c] + '(' + BRANCHES[P[c].b] + ')'); });
    var gongmangInfo = { branches: gm, where: gmWhere };
    return { list: list, gongmang: gongmangInfo };
  }

  // 지지 관계 (충·육합·삼합/반합·형·파·해)
  function branchRelations(saju) {
    var P = saju.pillars, cols = ['year','month','day','hour'], colKo = { year:'년지', month:'월지', day:'일지', hour:'시지' };
    var present = cols.filter(function (c) { return P[c]; }), out = [];
    function nm(c) { return colKo[c] + '(' + BRANCHES[P[c].b] + ')'; }
    for (var i = 0; i < present.length; i++) for (var j = i + 1; j < present.length; j++) {
      var a = P[present[i]].b, b = P[present[j]].b;
      CHUNG.forEach(function (p) { if ((p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)) out.push({ type: '충', text: nm(present[i]) + ' ↔ ' + nm(present[j]) }); });
      YUKHAP.forEach(function (p, pi) { if ((p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)) out.push({ type: '육합', text: nm(present[i]) + ' ⇄ ' + nm(present[j]) + ' → ' + EL[[2,0,1,3,4,1][pi]] }); });
    }
    SAMHAP_DEF.forEach(function (g) {
      var have = present.filter(function (c) { return g.b.indexOf(P[c].b) >= 0; });
      var uniq = []; have.forEach(function (c) { if (uniq.indexOf(P[c].b) < 0) uniq.push(P[c].b); });
      if (uniq.length === 3) out.push({ type: '삼합', text: g.name + ' 완성' });
      else if (uniq.length === 2 && uniq.indexOf(g.b[1]) >= 0) out.push({ type: '반합', text: g.name + ' 반합 (' + uniq.map(function (b) { return BRANCHES[b]; }).join('·') + ')' });
    });
    // 형: 인사신, 축술미 삼형 / 자묘 상형 / 자형(진진 오오 유유 해해)
    var bs = present.map(function (c) { return P[c].b; });
    function hasAll(arr) { return arr.every(function (x) { return bs.indexOf(x) >= 0; }); }
    if (hasAll([2,5,8])) out.push({ type: '형', text: '인사신 삼형' });
    else if ([[2,5],[5,8],[2,8]].some(function (p) { return hasAll(p); })) out.push({ type: '형', text: '인·사·신 중 두 글자 형' });
    if (hasAll([1,10,7])) out.push({ type: '형', text: '축술미 삼형' });
    else if ([[1,10],[10,7],[1,7]].some(function (p) { return hasAll(p); })) out.push({ type: '형', text: '축·술·미 중 두 글자 형' });
    if (hasAll([0,3])) out.push({ type: '형', text: '자묘 상형' });
    [4,6,9,11].forEach(function (x) { if (bs.filter(function (y) { return y === x; }).length >= 2) out.push({ type: '자형', text: BRANCHES[x] + BRANCHES[x] + ' 자형' }); });
    return out;
  }

  /* ---------- 분석: 오행·십성·강약 ---------- */
  function analyze(saju) {
    var P = saju.pillars, cols = ['year','month','day','hour'];
    var ds = P.day.s;
    var elCount = [0,0,0,0,0], elWeighted = [0,0,0,0,0];
    var tenCount = [0,0,0,0,0,0,0,0,0,0];
    var detail = {};
    cols.forEach(function (c) {
      var p = P[c]; if (!p) return;
      var stemTen = (c === 'day') ? -1 : tenGod(ds, p.s);
      var hid = HIDDEN[p.b];
      var branchTen = tenGod(ds, MAIN_STEM[p.b]);
      detail[c] = {
        stemTen: stemTen,
        branchTen: branchTen,
        hidden: hid.map(function (h) { return { stem: h, ten: tenGod(ds, h) }; }),
        unseong: twelveUnseong(ds, p.b)
      };
      elCount[STEM_EL[p.s]]++;
      elCount[BRANCH_EL[p.b]]++;
      if (stemTen >= 0) tenCount[stemTen]++;
      tenCount[branchTen]++;
      // 가중치(지장간 포함)
      elWeighted[STEM_EL[p.s]] += 1.0;
      var w = hid.length === 3 ? [0.2, 0.2, 0.6] : [0.3, 0.7];
      if (c === 'month') w = hid.length === 3 ? [0.2, 0.2, 0.9] : [0.3, 1.0]; // 월령 강조
      hid.forEach(function (h, i) { elWeighted[STEM_EL[h]] += w[i]; });
    });
    // 강약 판정
    var me = STEM_EL[ds], self = 0, other = 0;
    var inSeason = false;
    cols.forEach(function (c) {
      var p = P[c]; if (!p) return;
      var weightStem = (c === 'day') ? 0 : 10;
      if (weightStem) { var t = detail[c].stemTen; if (t <= 1 || t >= 8) self += weightStem; else other += weightStem; }
      var wB = (c === 'month') ? 30 : (c === 'day' ? 15 : 10);
      var tb = detail[c].branchTen;
      if (tb <= 1 || tb >= 8) self += wB; else other += wB;
      if (c === 'month') inSeason = (tb <= 1 || tb >= 8);
    });
    var ratio = self / (self + other);
    var strength = ratio >= 0.58 ? '신강' : (ratio <= 0.42 ? '신약' : (ratio > 0.5 ? '중화(신강 쪽)' : '중화(신약 쪽)'));
    var missing = [], excess = [];
    var total = elCount.reduce(function (a, b) { return a + b; }, 0);
    for (var i = 0; i < 5; i++) { if (elCount[i] === 0) missing.push(i); if (elCount[i] >= 4) excess.push(i); }
    return { elCount: elCount, elWeighted: elWeighted, tenCount: tenCount, detail: detail, strength: strength, ratio: ratio, inSeason: inSeason, missing: missing, excess: excess, dayEl: me };
  }

  /* ---------- 대운·세운 ---------- */
  function calcDaeun(saju, gender) {
    var P = saju.pillars, yearYang = P.year.s % 2 === 0;
    var forward = (gender === 'M') ? yearYang : !yearYang;
    var jd = saju.jdBirth;
    var j = saju.jie, target;
    if (forward) target = j.nextJD; else target = j.curJD;
    var days = Math.abs(target - jd);
    var yearsF = days / 3;
    var years = Math.floor(yearsF), months = Math.round((yearsF - years) * 12);
    if (months >= 12) { years += 1; months = 0; }
    var startAgeDec = years + months / 12;
    var steps = [];
    var monthIdx = ((P.month.s) + 0), baseIdx = gz(0);
    // 월주 60갑자 인덱스 찾기
    var mIdx = -1;
    for (var i = 0; i < 60; i++) if (i % 10 === P.month.s && i % 12 === P.month.b) { mIdx = i; break; }
    var birthJD = saju.jdBirth;
    var birthKST = jdToKST(birthJD);
    for (var n = 1; n <= 10; n++) {
      var idx = forward ? mIdx + n : mIdx - n;
      var p = gz(idx);
      var startAge = years + (n - 1) * 10;
      var startYear = birthKST.y + startAge + (birthKST.m * 31 + birthKST.d + months * 31 > 12 * 31 ? 0 : 0);
      // 시작 연도: 출생일 + (years년 months개월) + 10(n-1)년
      var sm = birthKST.m + months, sy = birthKST.y + startAge + Math.floor((sm - 1) / 12);
      steps.push({ n: n, p: p, startAge: startAge, startMonths: months, startYear: sy, endYear: sy + 9 });
    }
    return { forward: forward, years: years, months: months, days: days, steps: steps, targetName: forward ? j.nextName : j.curName, targetJD: target };
  }
  function seun(year) { return gz(year - 4); }

  /* ---------- 오늘의 일진 ---------- */
  function todayPillars(y, m, d) { return gz(dayIndex(dayNumFromYMD(y, m, d))); }

  var API = {
    STEMS: STEMS, STEMS_H: STEMS_H, BRANCHES: BRANCHES, BRANCHES_H: BRANCHES_H, ANIMALS: ANIMALS, EL: EL, EL_H: EL_H,
    STEM_EL: STEM_EL, BRANCH_EL: BRANCH_EL, HIDDEN: HIDDEN, MAIN_STEM: MAIN_STEM, TEN_NAMES: TEN_NAMES, TEN_HANJA: TEN_HANJA,
    TERM_NAMES: TERM_NAMES, JIE_NAMES: JIE_NAMES, JIE_LON: JIE_LON,
    sunLongitude: sunLongitude, termJD: termJD, jdToKST: jdToKST, kstToJD: kstToJD, jdFromUTC: jdFromUTC,
    solarToLunar: solarToLunar, lunarToSolar: lunarToSolar, lunarLeapMonthOf: lunarLeapMonthOf,
    calcSaju: calcSaju, analyze: analyze, calcDaeun: calcDaeun, seun: seun, gz: gz,
    pillarName: pillarName, pillarHanja: pillarHanja, tenGod: tenGod, twelveUnseong: twelveUnseong,
    findSinsal: findSinsal, branchRelations: branchRelations, gongmang: gongmang, todayPillars: todayPillars,
    dayNumFromYMD: dayNumFromYMD, ymdFromDayNum: ymdFromDayNum, dayIndex: dayIndex
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.SajuCore = API;
})(typeof window !== 'undefined' ? window : this);
