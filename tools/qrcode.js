// QR Code tool – offline, self-contained
// QR engine: qrcode-generator by Kazuhiko Arase (MIT)
window._tools = window._tools || {};
window._tools['qrcode'] = (function () {

  /* ── QR engine (embedded, MIT license) ─────────────────────────────── */
  var _qr = (function () {
    var qrcode = function (typeNumber, errorCorrectionLevel) {
      var PAD0 = 0xEC, PAD1 = 0x11;
      var _typeNumber = typeNumber;
      var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
      var _modules = null, _moduleCount = 0, _dataCache = null, _dataList = [];
      var _this = {};
      var makeImpl = function (test, maskPattern) {
        _moduleCount = _typeNumber * 4 + 17;
        _modules = (function (n) { var m = new Array(n); for (var i = 0; i < n; i++) { m[i] = new Array(n); for (var j = 0; j < n; j++) m[i][j] = null; } return m; })(_moduleCount);
        setupPositionProbePattern(0, 0); setupPositionProbePattern(_moduleCount - 7, 0); setupPositionProbePattern(0, _moduleCount - 7);
        setupPositionAdjustPattern(); setupTimingPattern(); setupTypeInfo(test, maskPattern);
        if (_typeNumber >= 7) setupTypeNumber(test);
        if (_dataCache == null) _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
        mapData(_dataCache, maskPattern);
      };
      var setupPositionProbePattern = function (row, col) {
        for (var r = -1; r <= 7; r++) { if (row + r <= -1 || _moduleCount <= row + r) continue; for (var c = -1; c <= 7; c++) { if (col + c <= -1 || _moduleCount <= col + c) continue; _modules[row + r][col + c] = ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)); } }
      };
      var getBestMaskPattern = function () { var min = 0, pat = 0; for (var i = 0; i < 8; i++) { makeImpl(true, i); var lp = QRUtil.getLostPoint(_this); if (i == 0 || min > lp) { min = lp; pat = i; } } return pat; };
      var setupTimingPattern = function () { for (var r = 8; r < _moduleCount - 8; r++) { if (_modules[r][6] == null) _modules[r][6] = (r % 2 == 0); } for (var c = 8; c < _moduleCount - 8; c++) { if (_modules[6][c] == null) _modules[6][c] = (c % 2 == 0); } };
      var setupPositionAdjustPattern = function () { var pos = QRUtil.getPatternPosition(_typeNumber); for (var i = 0; i < pos.length; i++) for (var j = 0; j < pos.length; j++) { var row = pos[i], col = pos[j]; if (_modules[row][col] != null) continue; for (var r = -2; r <= 2; r++) for (var c = -2; c <= 2; c++) _modules[row + r][col + c] = (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)); } };
      var setupTypeNumber = function (test) { var bits = QRUtil.getBCHTypeNumber(_typeNumber); for (var i = 0; i < 18; i++) { var mod = (!test && ((bits >> i) & 1) == 1); _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod; } for (var i = 0; i < 18; i++) { var mod = (!test && ((bits >> i) & 1) == 1); _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod; } };
      var setupTypeInfo = function (test, maskPattern) { var data = (_errorCorrectionLevel << 3) | maskPattern, bits = QRUtil.getBCHTypeInfo(data); for (var i = 0; i < 15; i++) { var mod = (!test && ((bits >> i) & 1) == 1); if (i < 6) _modules[i][8] = mod; else if (i < 8) _modules[i + 1][8] = mod; else _modules[_moduleCount - 15 + i][8] = mod; } for (var i = 0; i < 15; i++) { var mod = (!test && ((bits >> i) & 1) == 1); if (i < 8) _modules[8][_moduleCount - i - 1] = mod; else if (i < 9) _modules[8][15 - i - 1 + 1] = mod; else _modules[8][15 - i - 1] = mod; } _modules[_moduleCount - 8][8] = (!test); };
      var mapData = function (data, maskPattern) { var inc = -1, row = _moduleCount - 1, bitIndex = 7, byteIndex = 0, maskFunc = QRUtil.getMaskFunction(maskPattern); for (var col = _moduleCount - 1; col > 0; col -= 2) { if (col == 6) col--; while (true) { for (var c = 0; c < 2; c++) { if (_modules[row][col - c] == null) { var dark = (byteIndex < data.length) ? ((data[byteIndex] >>> bitIndex) & 1) == 1 : false; if (maskFunc(row, col - c)) dark = !dark; _modules[row][col - c] = dark; bitIndex--; if (bitIndex == -1) { byteIndex++; bitIndex = 7; } } } row += inc; if (row < 0 || _moduleCount <= row) { row -= inc; inc = -inc; break; } } } };
      var createBytes = function (buffer, rsBlocks) { var offset = 0, maxDc = 0, maxEc = 0, dcdata = new Array(rsBlocks.length), ecdata = new Array(rsBlocks.length); for (var r = 0; r < rsBlocks.length; r++) { var dcCount = rsBlocks[r].dataCount, ecCount = rsBlocks[r].totalCount - dcCount; maxDc = Math.max(maxDc, dcCount); maxEc = Math.max(maxEc, ecCount); dcdata[r] = new Array(dcCount); for (var i = 0; i < dcdata[r].length; i++) dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset]; offset += dcCount; var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount), rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1), modPoly = rawPoly.mod(rsPoly); ecdata[r] = new Array(rsPoly.getLength() - 1); for (var i = 0; i < ecdata[r].length; i++) { var modIndex = i + modPoly.getLength() - ecdata[r].length; ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0; } } var totalCodeCount = 0; for (var i = 0; i < rsBlocks.length; i++) totalCodeCount += rsBlocks[i].totalCount; var data = new Array(totalCodeCount), index = 0; for (var i = 0; i < maxDc; i++) for (var r = 0; r < rsBlocks.length; r++) { if (i < dcdata[r].length) data[index++] = dcdata[r][i]; } for (var i = 0; i < maxEc; i++) for (var r = 0; r < rsBlocks.length; r++) { if (i < ecdata[r].length) data[index++] = ecdata[r][i]; } return data; };
      var createData = function (typeNumber, errorCorrectionLevel, dataList) { var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel), buffer = qrBitBuffer(); for (var i = 0; i < dataList.length; i++) { var data = dataList[i]; buffer.put(data.getMode(), 4); buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber)); data.write(buffer); } var totalDataCount = 0; for (var i = 0; i < rsBlocks.length; i++) totalDataCount += rsBlocks[i].dataCount; if (buffer.getLengthInBits() > totalDataCount * 8) throw 'overflow'; if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4); while (buffer.getLengthInBits() % 8 != 0) buffer.putBit(false); while (true) { if (buffer.getLengthInBits() >= totalDataCount * 8) break; buffer.put(PAD0, 8); if (buffer.getLengthInBits() >= totalDataCount * 8) break; buffer.put(PAD1, 8); } return createBytes(buffer, rsBlocks); };
      _this.addData = function (data, mode) { mode = mode || 'Byte'; var nd = null; switch (mode) { case 'Numeric': nd = qrNumber(data); break; case 'Alphanumeric': nd = qrAlphaNum(data); break; case 'Byte': nd = qr8BitByte(data); break; default: throw 'mode:' + mode; } _dataList.push(nd); _dataCache = null; };
      _this.isDark = function (row, col) { if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) throw row + ',' + col; return _modules[row][col]; };
      _this.getModuleCount = function () { return _moduleCount; };
      _this.make = function () { if (_typeNumber < 1) { var tn = 1; for (; tn < 40; tn++) { var rsb = QRRSBlock.getRSBlocks(tn, _errorCorrectionLevel), buf = qrBitBuffer(); for (var i = 0; i < _dataList.length; i++) { var d = _dataList[i]; buf.put(d.getMode(), 4); buf.put(d.getLength(), QRUtil.getLengthInBits(d.getMode(), tn)); d.write(buf); } var tdc = 0; for (var i = 0; i < rsb.length; i++) tdc += rsb[i].dataCount; if (buf.getLengthInBits() <= tdc * 8) break; } _typeNumber = tn; } makeImpl(false, getBestMaskPattern()); };
      _this.createSvgTag = function (opts) {
        opts = opts || {};
        var cellSize = opts.cellSize || 4, margin = (typeof opts.margin != 'undefined') ? opts.margin : cellSize * 4;
        var size = _this.getModuleCount() * cellSize + margin * 2;
        var rect = 'l' + cellSize + ',0 0,' + cellSize + ' -' + cellSize + ',0 0,-' + cellSize + 'z ';
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" preserveAspectRatio="xMinYMin meet">';
        svg += '<rect width="100%" height="100%" fill="white"/><path d="';
        for (var r = 0; r < _this.getModuleCount(); r++) { var mr = r * cellSize + margin; for (var c = 0; c < _this.getModuleCount(); c++) { if (_this.isDark(r, c)) { var mc = c * cellSize + margin; svg += 'M' + mc + ',' + mr + rect; } } }
        svg += '" fill="black" stroke="transparent"/></svg>';
        return svg;
      };
      return _this;
    };

    var QRErrorCorrectionLevel = { L: 1, M: 0, Q: 3, H: 2 };
    var QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };

    var QRUtil = (function () {
      var PPT = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
      var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | 1;
      var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | 1;
      var G15M = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
      var _t = {};
      var bchDigit = function (d) { var n = 0; while (d != 0) { n++; d >>>= 1; } return n; };
      _t.getBCHTypeInfo = function (d) { var x = d << 10; while (bchDigit(x) - bchDigit(G15) >= 0) x ^= (G15 << (bchDigit(x) - bchDigit(G15))); return ((d << 10) | x) ^ G15M; };
      _t.getBCHTypeNumber = function (d) { var x = d << 12; while (bchDigit(x) - bchDigit(G18) >= 0) x ^= (G18 << (bchDigit(x) - bchDigit(G18))); return (d << 12) | x; };
      _t.getPatternPosition = function (tn) { return PPT[tn - 1]; };
      _t.getMaskFunction = function (mp) { switch (mp) { case 0: return function (i, j) { return (i + j) % 2 == 0; }; case 1: return function (i, j) { return i % 2 == 0; }; case 2: return function (i, j) { return j % 3 == 0; }; case 3: return function (i, j) { return (i + j) % 3 == 0; }; case 4: return function (i, j) { return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0; }; case 5: return function (i, j) { return (i * j) % 2 + (i * j) % 3 == 0; }; case 6: return function (i, j) { return ((i * j) % 2 + (i * j) % 3) % 2 == 0; }; case 7: return function (i, j) { return ((i * j) % 3 + (i + j) % 2) % 2 == 0; }; default: throw 'bad mask:' + mp; } };
      _t.getErrorCorrectPolynomial = function (ecl) { var a = qrPolynomial([1], 0); for (var i = 0; i < ecl; i++) a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0)); return a; };
      _t.getLengthInBits = function (mode, type) { if (type < 10) { switch (mode) { case 1: return 10; case 2: return 9; case 4: return 8; case 8: return 8; } } else if (type < 27) { switch (mode) { case 1: return 12; case 2: return 11; case 4: return 16; case 8: return 10; } } else { switch (mode) { case 1: return 14; case 2: return 13; case 4: return 16; case 8: return 12; } } throw 'mode/type'; };
      _t.getLostPoint = function (qr) { var n = qr.getModuleCount(), lp = 0; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) { var sc = 0, dark = qr.isDark(r, c); for (var dr = -1; dr <= 1; dr++) { if (r + dr < 0 || n <= r + dr) continue; for (var dc = -1; dc <= 1; dc++) { if (c + dc < 0 || n <= c + dc) continue; if (dr == 0 && dc == 0) continue; if (dark == qr.isDark(r + dr, c + dc)) sc++; } } if (sc > 5) lp += 3 + sc - 5; } for (var r = 0; r < n - 1; r++) for (var c = 0; c < n - 1; c++) { var cnt = 0; if (qr.isDark(r, c)) cnt++; if (qr.isDark(r + 1, c)) cnt++; if (qr.isDark(r, c + 1)) cnt++; if (qr.isDark(r + 1, c + 1)) cnt++; if (cnt == 0 || cnt == 4) lp += 3; } for (var r = 0; r < n; r++) for (var c = 0; c < n - 6; c++) { if (qr.isDark(r, c) && !qr.isDark(r, c + 1) && qr.isDark(r, c + 2) && qr.isDark(r, c + 3) && qr.isDark(r, c + 4) && !qr.isDark(r, c + 5) && qr.isDark(r, c + 6)) lp += 40; } for (var c = 0; c < n; c++) for (var r = 0; r < n - 6; r++) { if (qr.isDark(r, c) && !qr.isDark(r + 1, c) && qr.isDark(r + 2, c) && qr.isDark(r + 3, c) && qr.isDark(r + 4, c) && !qr.isDark(r + 5, c) && qr.isDark(r + 6, c)) lp += 40; } var dk = 0; for (var c = 0; c < n; c++) for (var r = 0; r < n; r++) { if (qr.isDark(r, c)) dk++; } lp += Math.abs(100 * dk / n / n - 50) / 5 * 10; return lp; };
      return _t;
    })();

    var QRMath = (function () { var ET = new Array(256), LT = new Array(256); for (var i = 0; i < 8; i++) ET[i] = 1 << i; for (var i = 8; i < 256; i++) ET[i] = ET[i - 4] ^ ET[i - 5] ^ ET[i - 6] ^ ET[i - 8]; for (var i = 0; i < 255; i++) LT[ET[i]] = i; var _t = {}; _t.glog = function (n) { if (n < 1) throw 'glog(' + n + ')'; return LT[n]; }; _t.gexp = function (n) { while (n < 0) n += 255; while (n >= 256) n -= 255; return ET[n]; }; return _t; })();

    function qrPolynomial(num, shift) { var _num = (function () { var o = 0; while (o < num.length && num[o] == 0) o++; var n = new Array(num.length - o + shift); for (var i = 0; i < num.length - o; i++) n[i] = num[i + o]; return n; })(); var _t = {}; _t.getAt = function (i) { return _num[i]; }; _t.getLength = function () { return _num.length; }; _t.multiply = function (e) { var n = new Array(_t.getLength() + e.getLength() - 1); for (var i = 0; i < _t.getLength(); i++) for (var j = 0; j < e.getLength(); j++) n[i + j] ^= QRMath.gexp(QRMath.glog(_t.getAt(i)) + QRMath.glog(e.getAt(j))); return qrPolynomial(n, 0); }; _t.mod = function (e) { if (_t.getLength() - e.getLength() < 0) return _t; var ratio = QRMath.glog(_t.getAt(0)) - QRMath.glog(e.getAt(0)), n = new Array(_t.getLength()); for (var i = 0; i < _t.getLength(); i++) n[i] = _t.getAt(i); for (var i = 0; i < e.getLength(); i++) n[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio); return qrPolynomial(n, 0).mod(e); }; return _t; }

    var QRRSBlock = (function () {
      var T = [[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];
      var qrRSBlock = function (tc, dc) { return { totalCount: tc, dataCount: dc }; };
      var _t = {};
      _t.getRSBlocks = function (tn, ecl) { var tb = T[(tn - 1) * 4 + [0,1,2,3][ecl == 1 ? 0 : ecl == 0 ? 1 : ecl == 3 ? 2 : 3]]; if (!tb) throw 'bad rs block'; var len = tb.length / 3, list = []; for (var i = 0; i < len; i++) { var cnt = tb[i * 3], tc = tb[i * 3 + 1], dc = tb[i * 3 + 2]; for (var j = 0; j < cnt; j++) list.push(qrRSBlock(tc, dc)); } return list; };
      return _t;
    })();

    var qrBitBuffer = function () { var _buf = [], _len = 0, _t = {}; _t.getBuffer = function () { return _buf; }; _t.put = function (num, length) { for (var i = 0; i < length; i++) _t.putBit(((num >>> (length - i - 1)) & 1) == 1); }; _t.getLengthInBits = function () { return _len; }; _t.putBit = function (bit) { var bi = Math.floor(_len / 8); if (_buf.length <= bi) _buf.push(0); if (bit) _buf[bi] |= (0x80 >>> (_len % 8)); _len++; }; return _t; };

    var qrNumber = function (data) { var _t = {}; _t.getMode = function () { return 1; }; _t.getLength = function () { return data.length; }; _t.write = function (buf) { var i = 0; while (i + 2 < data.length) { buf.put(+data.substring(i, i + 3), 10); i += 3; } if (i < data.length) { if (data.length - i == 1) buf.put(+data.substring(i, i + 1), 4); else buf.put(+data.substring(i, i + 2), 7); } }; return _t; };
    var qrAlphaNum = function (data) { var _t = {}, gc = function (c) { if (c >= '0' && c <= '9') return c.charCodeAt(0) - 48; if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 55; switch (c) { case ' ': return 36; case '$': return 37; case '%': return 38; case '*': return 39; case '+': return 40; case '-': return 41; case '.': return 42; case '/': return 43; case ':': return 44; } throw 'illegal:' + c; }; _t.getMode = function () { return 2; }; _t.getLength = function () { return data.length; }; _t.write = function (buf) { var i = 0; while (i + 1 < data.length) { buf.put(gc(data.charAt(i)) * 45 + gc(data.charAt(i + 1)), 11); i += 2; } if (i < data.length) buf.put(gc(data.charAt(i)), 6); }; return _t; };
    var qr8BitByte = function (data) {
      var _bytes = (function () { var utf8 = []; for (var i = 0; i < data.length; i++) { var c = data.charCodeAt(i); if (c < 0x80) utf8.push(c); else if (c < 0x800) { utf8.push(0xc0 | (c >> 6)); utf8.push(0x80 | (c & 0x3f)); } else { utf8.push(0xe0 | (c >> 12)); utf8.push(0x80 | ((c >> 6) & 0x3f)); utf8.push(0x80 | (c & 0x3f)); } } return utf8; })();
      var _t = {}; _t.getMode = function () { return 4; }; _t.getLength = function () { return _bytes.length; }; _t.write = function (buf) { for (var i = 0; i < _bytes.length; i++) buf.put(_bytes[i], 8); }; return _t;
    };

    qrcode.stringToBytes = function (s) { var b = []; for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 0xff); return b; };

    return qrcode;
  })();
  /* ── end QR engine ──────────────────────────────────────────────────── */

  return {
    name: 'Gerador de QR Code',
    icon: '⬛',
    desc: 'Gera QR code offline · qualquer texto ou link',

    css: `
.qr-tool { padding: 20px 20px 32px; }
.qr-field label { display: block; font-size: .78rem; color: var(--txt-2); font-weight: 500; margin-bottom: 6px; }
.qr-field textarea {
  width: 100%; box-sizing: border-box; resize: vertical;
  background: var(--superficie); border: 1px solid var(--borda); border-radius: 6px;
  font-family: inherit; font-size: .95rem; color: var(--txt);
  padding: 10px 12px; outline: none; min-height: 80px;
  transition: border-color .15s, box-shadow .15s;
}
.qr-field textarea:focus { border-color: var(--azul-700); box-shadow: 0 0 0 3px rgba(44,62,80,.1); }
.qr-field textarea::placeholder { color: #bbb; }
.qr-counter { font-size: .7rem; color: #aaa; text-align: right; margin-top: 3px; margin-bottom: 14px; }
.qr-box {
  display: flex; flex-direction: column; align-items: center;
  background: #f8f9fa; border: 1px solid #ddd; border-radius: 12px;
  padding: 20px; min-height: 180px; justify-content: center;
  transition: background .2s;
}
.qr-box svg { width: 100%; max-width: 260px; height: auto; display: block; border-radius: 4px; }
.qr-box.qr-vazio { color: #bbb; font-size: .9rem; }
.qr-actions { display: flex; gap: 10px; margin-top: 14px; width: 100%; max-width: 260px; }
.qr-btn {
  flex: 1; padding: 9px 0; border: none; border-radius: 6px; cursor: pointer;
  font-family: inherit; font-size: .82rem; font-weight: 600;
  transition: opacity .15s, transform .1s;
}
.qr-btn:active { transform: scale(.97); }
.qr-btn-dl  { background: var(--azul-700); color: #fff; }
.qr-btn-cp  { background: #e8edf2; color: var(--azul-700); }
.qr-btn:hover { opacity: .88; }
.qr-toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: var(--azul-700); color: #fff; padding: 8px 20px; border-radius: 20px;
  font-size: .82rem; pointer-events: none; opacity: 0;
  transition: opacity .25s; z-index: 9999;
}
.qr-toast.show { opacity: 1; }
`,

    html: `
<div class="qr-tool">
  <div class="qr-field">
    <label for="qr-input">Texto ou link</label>
    <textarea id="qr-input" placeholder="https://exemplo.com.br" rows="3" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
    <div class="qr-counter"><span id="qr-count">0</span> caracteres</div>
  </div>
  <div class="qr-box qr-vazio" id="qr-box">
    <span id="qr-placeholder">Digite algo para gerar o QR code</span>
    <div id="qr-svg-wrap"></div>
    <div class="qr-actions" id="qr-actions" style="display:none">
      <button class="qr-btn qr-btn-dl" id="qr-dl">⬇ Baixar SVG</button>
      <button class="qr-btn qr-btn-cp" id="qr-cp">⎘ Copiar SVG</button>
    </div>
  </div>
</div>
<div class="qr-toast" id="qr-toast"></div>
`,

    init: function () {
      var input    = document.getElementById('qr-input');
      var counter  = document.getElementById('qr-count');
      var box      = document.getElementById('qr-box');
      var ph       = document.getElementById('qr-placeholder');
      var svgWrap  = document.getElementById('qr-svg-wrap');
      var actions  = document.getElementById('qr-actions');
      var btnDl    = document.getElementById('qr-dl');
      var btnCp    = document.getElementById('qr-cp');
      var toast    = document.getElementById('qr-toast');
      var _svg     = '';
      var _toastTm = null;

      function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(_toastTm);
        _toastTm = setTimeout(function () { toast.classList.remove('show'); }, 1800);
      }

      function render() {
        var text = input.value;
        counter.textContent = text.length;

        if (!text.trim()) {
          box.classList.add('qr-vazio');
          ph.style.display = '';
          svgWrap.innerHTML = '';
          actions.style.display = 'none';
          _svg = '';
          return;
        }

        try {
          var qr = _qr(0, 'M');
          qr.addData(text, 'Byte');
          qr.make();
          _svg = qr.createSvgTag({ cellSize: 6, margin: 24 });
          box.classList.remove('qr-vazio');
          ph.style.display = 'none';
          svgWrap.innerHTML = _svg;
          actions.style.display = 'flex';
        } catch (e) {
          box.classList.add('qr-vazio');
          ph.style.display = '';
          ph.textContent = 'Texto muito longo para um QR code.';
          svgWrap.innerHTML = '';
          actions.style.display = 'none';
          _svg = '';
        }
      }

      input.addEventListener('input', render);

      btnDl.addEventListener('click', function () {
        if (!_svg) return;
        var blob = new Blob([_svg], { type: 'image/svg+xml' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = 'qrcode.svg';
        a.click();
        URL.revokeObjectURL(url);
        showToast('SVG baixado!');
      });

      btnCp.addEventListener('click', function () {
        if (!_svg) return;
        navigator.clipboard.writeText(_svg).then(function () {
          showToast('SVG copiado!');
        });
      });

      setTimeout(function () { input.focus(); }, 50);
    }
  };
})();
