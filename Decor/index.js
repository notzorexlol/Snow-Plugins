var plugin = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // project:node_modules/jpeg-js/lib/encoder.js
  var require_encoder = __commonJS({
    "project:node_modules/jpeg-js/lib/encoder.js"(exports, module) {
      var btoa = btoa || function(buf) {
        return Buffer.from(buf).toString("base64");
      };
      function JPEGEncoder(quality) {
        var self = this;
        var fround = Math.round;
        var ffloor = Math.floor;
        var YTable = new Array(64);
        var UVTable = new Array(64);
        var fdtbl_Y = new Array(64);
        var fdtbl_UV = new Array(64);
        var YDC_HT;
        var UVDC_HT;
        var YAC_HT;
        var UVAC_HT;
        var bitcode = new Array(65535);
        var category = new Array(65535);
        var outputfDCTQuant = new Array(64);
        var DU = new Array(64);
        var byteout = [];
        var bytenew = 0;
        var bytepos = 7;
        var YDU = new Array(64);
        var UDU = new Array(64);
        var VDU = new Array(64);
        var clt = new Array(256);
        var RGB_YUV_TABLE = new Array(2048);
        var currentQuality;
        var ZigZag = [
          0,
          1,
          5,
          6,
          14,
          15,
          27,
          28,
          2,
          4,
          7,
          13,
          16,
          26,
          29,
          42,
          3,
          8,
          12,
          17,
          25,
          30,
          41,
          43,
          9,
          11,
          18,
          24,
          31,
          40,
          44,
          53,
          10,
          19,
          23,
          32,
          39,
          45,
          52,
          54,
          20,
          22,
          33,
          38,
          46,
          51,
          55,
          60,
          21,
          34,
          37,
          47,
          50,
          56,
          59,
          61,
          35,
          36,
          48,
          49,
          57,
          58,
          62,
          63
        ];
        var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
        var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125];
        var std_ac_luminance_values = [
          1,
          2,
          3,
          0,
          4,
          17,
          5,
          18,
          33,
          49,
          65,
          6,
          19,
          81,
          97,
          7,
          34,
          113,
          20,
          50,
          129,
          145,
          161,
          8,
          35,
          66,
          177,
          193,
          21,
          82,
          209,
          240,
          36,
          51,
          98,
          114,
          130,
          9,
          10,
          22,
          23,
          24,
          25,
          26,
          37,
          38,
          39,
          40,
          41,
          42,
          52,
          53,
          54,
          55,
          56,
          57,
          58,
          67,
          68,
          69,
          70,
          71,
          72,
          73,
          74,
          83,
          84,
          85,
          86,
          87,
          88,
          89,
          90,
          99,
          100,
          101,
          102,
          103,
          104,
          105,
          106,
          115,
          116,
          117,
          118,
          119,
          120,
          121,
          122,
          131,
          132,
          133,
          134,
          135,
          136,
          137,
          138,
          146,
          147,
          148,
          149,
          150,
          151,
          152,
          153,
          154,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          178,
          179,
          180,
          181,
          182,
          183,
          184,
          185,
          186,
          194,
          195,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          210,
          211,
          212,
          213,
          214,
          215,
          216,
          217,
          218,
          225,
          226,
          227,
          228,
          229,
          230,
          231,
          232,
          233,
          234,
          241,
          242,
          243,
          244,
          245,
          246,
          247,
          248,
          249,
          250
        ];
        var std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
        var std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119];
        var std_ac_chrominance_values = [
          0,
          1,
          2,
          3,
          17,
          4,
          5,
          33,
          49,
          6,
          18,
          65,
          81,
          7,
          97,
          113,
          19,
          34,
          50,
          129,
          8,
          20,
          66,
          145,
          161,
          177,
          193,
          9,
          35,
          51,
          82,
          240,
          21,
          98,
          114,
          209,
          10,
          22,
          36,
          52,
          225,
          37,
          241,
          23,
          24,
          25,
          26,
          38,
          39,
          40,
          41,
          42,
          53,
          54,
          55,
          56,
          57,
          58,
          67,
          68,
          69,
          70,
          71,
          72,
          73,
          74,
          83,
          84,
          85,
          86,
          87,
          88,
          89,
          90,
          99,
          100,
          101,
          102,
          103,
          104,
          105,
          106,
          115,
          116,
          117,
          118,
          119,
          120,
          121,
          122,
          130,
          131,
          132,
          133,
          134,
          135,
          136,
          137,
          138,
          146,
          147,
          148,
          149,
          150,
          151,
          152,
          153,
          154,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          178,
          179,
          180,
          181,
          182,
          183,
          184,
          185,
          186,
          194,
          195,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          210,
          211,
          212,
          213,
          214,
          215,
          216,
          217,
          218,
          226,
          227,
          228,
          229,
          230,
          231,
          232,
          233,
          234,
          242,
          243,
          244,
          245,
          246,
          247,
          248,
          249,
          250
        ];
        function initQuantTables(sf) {
          var YQT = [
            16,
            11,
            10,
            16,
            24,
            40,
            51,
            61,
            12,
            12,
            14,
            19,
            26,
            58,
            60,
            55,
            14,
            13,
            16,
            24,
            40,
            57,
            69,
            56,
            14,
            17,
            22,
            29,
            51,
            87,
            80,
            62,
            18,
            22,
            37,
            56,
            68,
            109,
            103,
            77,
            24,
            35,
            55,
            64,
            81,
            104,
            113,
            92,
            49,
            64,
            78,
            87,
            103,
            121,
            120,
            101,
            72,
            92,
            95,
            98,
            112,
            100,
            103,
            99
          ];
          for (var i = 0; i < 64; i++) {
            var t = ffloor((YQT[i] * sf + 50) / 100);
            if (t < 1) {
              t = 1;
            } else if (t > 255) {
              t = 255;
            }
            YTable[ZigZag[i]] = t;
          }
          var UVQT = [
            17,
            18,
            24,
            47,
            99,
            99,
            99,
            99,
            18,
            21,
            26,
            66,
            99,
            99,
            99,
            99,
            24,
            26,
            56,
            99,
            99,
            99,
            99,
            99,
            47,
            66,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99,
            99
          ];
          for (var j = 0; j < 64; j++) {
            var u = ffloor((UVQT[j] * sf + 50) / 100);
            if (u < 1) {
              u = 1;
            } else if (u > 255) {
              u = 255;
            }
            UVTable[ZigZag[j]] = u;
          }
          var aasf = [
            1,
            1.387039845,
            1.306562965,
            1.175875602,
            1,
            0.785694958,
            0.5411961,
            0.275899379
          ];
          var k = 0;
          for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
              fdtbl_Y[k] = 1 / (YTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
              fdtbl_UV[k] = 1 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8);
              k++;
            }
          }
        }
        function computeHuffmanTbl(nrcodes, std_table) {
          var codevalue = 0;
          var pos_in_table = 0;
          var HT = new Array();
          for (var k = 1; k <= 16; k++) {
            for (var j = 1; j <= nrcodes[k]; j++) {
              HT[std_table[pos_in_table]] = [];
              HT[std_table[pos_in_table]][0] = codevalue;
              HT[std_table[pos_in_table]][1] = k;
              pos_in_table++;
              codevalue++;
            }
            codevalue *= 2;
          }
          return HT;
        }
        function initHuffmanTbl() {
          YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
          UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
          YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
          UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
        }
        function initCategoryNumber() {
          var nrlower = 1;
          var nrupper = 2;
          for (var cat = 1; cat <= 15; cat++) {
            for (var nr = nrlower; nr < nrupper; nr++) {
              category[32767 + nr] = cat;
              bitcode[32767 + nr] = [];
              bitcode[32767 + nr][1] = cat;
              bitcode[32767 + nr][0] = nr;
            }
            for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
              category[32767 + nrneg] = cat;
              bitcode[32767 + nrneg] = [];
              bitcode[32767 + nrneg][1] = cat;
              bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
            }
            nrlower <<= 1;
            nrupper <<= 1;
          }
        }
        function initRGBYUVTable() {
          for (var i = 0; i < 256; i++) {
            RGB_YUV_TABLE[i] = 19595 * i;
            RGB_YUV_TABLE[i + 256 >> 0] = 38470 * i;
            RGB_YUV_TABLE[i + 512 >> 0] = 7471 * i + 32768;
            RGB_YUV_TABLE[i + 768 >> 0] = -11059 * i;
            RGB_YUV_TABLE[i + 1024 >> 0] = -21709 * i;
            RGB_YUV_TABLE[i + 1280 >> 0] = 32768 * i + 8421375;
            RGB_YUV_TABLE[i + 1536 >> 0] = -27439 * i;
            RGB_YUV_TABLE[i + 1792 >> 0] = -5329 * i;
          }
        }
        function writeBits(bs) {
          var value = bs[0];
          var posval = bs[1] - 1;
          while (posval >= 0) {
            if (value & 1 << posval) {
              bytenew |= 1 << bytepos;
            }
            posval--;
            bytepos--;
            if (bytepos < 0) {
              if (bytenew == 255) {
                writeByte(255);
                writeByte(0);
              } else {
                writeByte(bytenew);
              }
              bytepos = 7;
              bytenew = 0;
            }
          }
        }
        function writeByte(value) {
          byteout.push(value);
        }
        function writeWord(value) {
          writeByte(value >> 8 & 255);
          writeByte(value & 255);
        }
        function fDCTQuant(data, fdtbl) {
          var d0, d1, d2, d3, d4, d5, d6, d7;
          var dataOff = 0;
          var i;
          var I8 = 8;
          var I64 = 64;
          for (i = 0; i < I8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 1];
            d2 = data[dataOff + 2];
            d3 = data[dataOff + 3];
            d4 = data[dataOff + 4];
            d5 = data[dataOff + 5];
            d6 = data[dataOff + 6];
            d7 = data[dataOff + 7];
            var tmp0 = d0 + d7;
            var tmp7 = d0 - d7;
            var tmp1 = d1 + d6;
            var tmp6 = d1 - d6;
            var tmp2 = d2 + d5;
            var tmp5 = d2 - d5;
            var tmp3 = d3 + d4;
            var tmp4 = d3 - d4;
            var tmp10 = tmp0 + tmp3;
            var tmp13 = tmp0 - tmp3;
            var tmp11 = tmp1 + tmp2;
            var tmp12 = tmp1 - tmp2;
            data[dataOff] = tmp10 + tmp11;
            data[dataOff + 4] = tmp10 - tmp11;
            var z1 = (tmp12 + tmp13) * 0.707106781;
            data[dataOff + 2] = tmp13 + z1;
            data[dataOff + 6] = tmp13 - z1;
            tmp10 = tmp4 + tmp5;
            tmp11 = tmp5 + tmp6;
            tmp12 = tmp6 + tmp7;
            var z5 = (tmp10 - tmp12) * 0.382683433;
            var z2 = 0.5411961 * tmp10 + z5;
            var z4 = 1.306562965 * tmp12 + z5;
            var z3 = tmp11 * 0.707106781;
            var z11 = tmp7 + z3;
            var z13 = tmp7 - z3;
            data[dataOff + 5] = z13 + z2;
            data[dataOff + 3] = z13 - z2;
            data[dataOff + 1] = z11 + z4;
            data[dataOff + 7] = z11 - z4;
            dataOff += 8;
          }
          dataOff = 0;
          for (i = 0; i < I8; ++i) {
            d0 = data[dataOff];
            d1 = data[dataOff + 8];
            d2 = data[dataOff + 16];
            d3 = data[dataOff + 24];
            d4 = data[dataOff + 32];
            d5 = data[dataOff + 40];
            d6 = data[dataOff + 48];
            d7 = data[dataOff + 56];
            var tmp0p2 = d0 + d7;
            var tmp7p2 = d0 - d7;
            var tmp1p2 = d1 + d6;
            var tmp6p2 = d1 - d6;
            var tmp2p2 = d2 + d5;
            var tmp5p2 = d2 - d5;
            var tmp3p2 = d3 + d4;
            var tmp4p2 = d3 - d4;
            var tmp10p2 = tmp0p2 + tmp3p2;
            var tmp13p2 = tmp0p2 - tmp3p2;
            var tmp11p2 = tmp1p2 + tmp2p2;
            var tmp12p2 = tmp1p2 - tmp2p2;
            data[dataOff] = tmp10p2 + tmp11p2;
            data[dataOff + 32] = tmp10p2 - tmp11p2;
            var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
            data[dataOff + 16] = tmp13p2 + z1p2;
            data[dataOff + 48] = tmp13p2 - z1p2;
            tmp10p2 = tmp4p2 + tmp5p2;
            tmp11p2 = tmp5p2 + tmp6p2;
            tmp12p2 = tmp6p2 + tmp7p2;
            var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
            var z2p2 = 0.5411961 * tmp10p2 + z5p2;
            var z4p2 = 1.306562965 * tmp12p2 + z5p2;
            var z3p2 = tmp11p2 * 0.707106781;
            var z11p2 = tmp7p2 + z3p2;
            var z13p2 = tmp7p2 - z3p2;
            data[dataOff + 40] = z13p2 + z2p2;
            data[dataOff + 24] = z13p2 - z2p2;
            data[dataOff + 8] = z11p2 + z4p2;
            data[dataOff + 56] = z11p2 - z4p2;
            dataOff++;
          }
          var fDCTQuant2;
          for (i = 0; i < I64; ++i) {
            fDCTQuant2 = data[i] * fdtbl[i];
            outputfDCTQuant[i] = fDCTQuant2 > 0 ? fDCTQuant2 + 0.5 | 0 : fDCTQuant2 - 0.5 | 0;
          }
          return outputfDCTQuant;
        }
        function writeAPP0() {
          writeWord(65504);
          writeWord(16);
          writeByte(74);
          writeByte(70);
          writeByte(73);
          writeByte(70);
          writeByte(0);
          writeByte(1);
          writeByte(1);
          writeByte(0);
          writeWord(1);
          writeWord(1);
          writeByte(0);
          writeByte(0);
        }
        function writeAPP1(exifBuffer) {
          if (!exifBuffer) return;
          writeWord(65505);
          if (exifBuffer[0] === 69 && exifBuffer[1] === 120 && exifBuffer[2] === 105 && exifBuffer[3] === 102) {
            writeWord(exifBuffer.length + 2);
          } else {
            writeWord(exifBuffer.length + 5 + 2);
            writeByte(69);
            writeByte(120);
            writeByte(105);
            writeByte(102);
            writeByte(0);
          }
          for (var i = 0; i < exifBuffer.length; i++) {
            writeByte(exifBuffer[i]);
          }
        }
        function writeSOF0(width, height) {
          writeWord(65472);
          writeWord(17);
          writeByte(8);
          writeWord(height);
          writeWord(width);
          writeByte(3);
          writeByte(1);
          writeByte(17);
          writeByte(0);
          writeByte(2);
          writeByte(17);
          writeByte(1);
          writeByte(3);
          writeByte(17);
          writeByte(1);
        }
        function writeDQT() {
          writeWord(65499);
          writeWord(132);
          writeByte(0);
          for (var i = 0; i < 64; i++) {
            writeByte(YTable[i]);
          }
          writeByte(1);
          for (var j = 0; j < 64; j++) {
            writeByte(UVTable[j]);
          }
        }
        function writeDHT() {
          writeWord(65476);
          writeWord(418);
          writeByte(0);
          for (var i = 0; i < 16; i++) {
            writeByte(std_dc_luminance_nrcodes[i + 1]);
          }
          for (var j = 0; j <= 11; j++) {
            writeByte(std_dc_luminance_values[j]);
          }
          writeByte(16);
          for (var k = 0; k < 16; k++) {
            writeByte(std_ac_luminance_nrcodes[k + 1]);
          }
          for (var l = 0; l <= 161; l++) {
            writeByte(std_ac_luminance_values[l]);
          }
          writeByte(1);
          for (var m = 0; m < 16; m++) {
            writeByte(std_dc_chrominance_nrcodes[m + 1]);
          }
          for (var n = 0; n <= 11; n++) {
            writeByte(std_dc_chrominance_values[n]);
          }
          writeByte(17);
          for (var o = 0; o < 16; o++) {
            writeByte(std_ac_chrominance_nrcodes[o + 1]);
          }
          for (var p = 0; p <= 161; p++) {
            writeByte(std_ac_chrominance_values[p]);
          }
        }
        function writeCOM(comments) {
          if (typeof comments === "undefined" || comments.constructor !== Array) return;
          comments.forEach((e) => {
            if (typeof e !== "string") return;
            writeWord(65534);
            var l = e.length;
            writeWord(l + 2);
            var i;
            for (i = 0; i < l; i++)
              writeByte(e.charCodeAt(i));
          });
        }
        function writeSOS() {
          writeWord(65498);
          writeWord(12);
          writeByte(3);
          writeByte(1);
          writeByte(0);
          writeByte(2);
          writeByte(17);
          writeByte(3);
          writeByte(17);
          writeByte(0);
          writeByte(63);
          writeByte(0);
        }
        function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
          var EOB = HTAC[0];
          var M16zeroes = HTAC[240];
          var pos;
          var I16 = 16;
          var I63 = 63;
          var I64 = 64;
          var DU_DCT = fDCTQuant(CDU, fdtbl);
          for (var j = 0; j < I64; ++j) {
            DU[ZigZag[j]] = DU_DCT[j];
          }
          var Diff = DU[0] - DC;
          DC = DU[0];
          if (Diff == 0) {
            writeBits(HTDC[0]);
          } else {
            pos = 32767 + Diff;
            writeBits(HTDC[category[pos]]);
            writeBits(bitcode[pos]);
          }
          var end0pos = 63;
          for (; end0pos > 0 && DU[end0pos] == 0; end0pos--) {
          }
          ;
          if (end0pos == 0) {
            writeBits(EOB);
            return DC;
          }
          var i = 1;
          var lng;
          while (i <= end0pos) {
            var startpos = i;
            for (; DU[i] == 0 && i <= end0pos; ++i) {
            }
            var nrzeroes = i - startpos;
            if (nrzeroes >= I16) {
              lng = nrzeroes >> 4;
              for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
                writeBits(M16zeroes);
              nrzeroes = nrzeroes & 15;
            }
            pos = 32767 + DU[i];
            writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
            writeBits(bitcode[pos]);
            i++;
          }
          if (end0pos != I63) {
            writeBits(EOB);
          }
          return DC;
        }
        function initCharLookupTable() {
          var sfcc = String.fromCharCode;
          for (var i = 0; i < 256; i++) {
            clt[i] = sfcc(i);
          }
        }
        this.encode = function(image, quality2) {
          var time_start = (/* @__PURE__ */ new Date()).getTime();
          if (quality2) setQuality(quality2);
          byteout = new Array();
          bytenew = 0;
          bytepos = 7;
          writeWord(65496);
          writeAPP0();
          writeCOM(image.comments);
          writeAPP1(image.exifBuffer);
          writeDQT();
          writeSOF0(image.width, image.height);
          writeDHT();
          writeSOS();
          var DCY = 0;
          var DCU = 0;
          var DCV = 0;
          bytenew = 0;
          bytepos = 7;
          this.encode.displayName = "_encode_";
          var imageData = image.data;
          var width = image.width;
          var height = image.height;
          var quadWidth = width * 4;
          var tripleWidth = width * 3;
          var x, y = 0;
          var r, g, b;
          var start, p, col, row, pos;
          while (y < height) {
            x = 0;
            while (x < quadWidth) {
              start = quadWidth * y + x;
              p = start;
              col = -1;
              row = 0;
              for (pos = 0; pos < 64; pos++) {
                row = pos >> 3;
                col = (pos & 7) * 4;
                p = start + row * quadWidth + col;
                if (y + row >= height) {
                  p -= quadWidth * (y + 1 + row - height);
                }
                if (x + col >= quadWidth) {
                  p -= x + col - quadWidth + 4;
                }
                r = imageData[p++];
                g = imageData[p++];
                b = imageData[p++];
                YDU[pos] = (RGB_YUV_TABLE[r] + RGB_YUV_TABLE[g + 256 >> 0] + RGB_YUV_TABLE[b + 512 >> 0] >> 16) - 128;
                UDU[pos] = (RGB_YUV_TABLE[r + 768 >> 0] + RGB_YUV_TABLE[g + 1024 >> 0] + RGB_YUV_TABLE[b + 1280 >> 0] >> 16) - 128;
                VDU[pos] = (RGB_YUV_TABLE[r + 1280 >> 0] + RGB_YUV_TABLE[g + 1536 >> 0] + RGB_YUV_TABLE[b + 1792 >> 0] >> 16) - 128;
              }
              DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
              DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
              DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
              x += 32;
            }
            y += 8;
          }
          if (bytepos >= 0) {
            var fillbits = [];
            fillbits[1] = bytepos + 1;
            fillbits[0] = (1 << bytepos + 1) - 1;
            writeBits(fillbits);
          }
          writeWord(65497);
          if (typeof module === "undefined") return new Uint8Array(byteout);
          return Buffer.from(byteout);
          var jpegDataUri = "data:image/jpeg;base64," + btoa(byteout.join(""));
          byteout = [];
          var duration = (/* @__PURE__ */ new Date()).getTime() - time_start;
          return jpegDataUri;
        };
        function setQuality(quality2) {
          if (quality2 <= 0) {
            quality2 = 1;
          }
          if (quality2 > 100) {
            quality2 = 100;
          }
          if (currentQuality == quality2) return;
          var sf = 0;
          if (quality2 < 50) {
            sf = Math.floor(5e3 / quality2);
          } else {
            sf = Math.floor(200 - quality2 * 2);
          }
          initQuantTables(sf);
          currentQuality = quality2;
        }
        function init() {
          var time_start = (/* @__PURE__ */ new Date()).getTime();
          if (!quality) quality = 50;
          initCharLookupTable();
          initHuffmanTbl();
          initCategoryNumber();
          initRGBYUVTable();
          setQuality(quality);
          var duration = (/* @__PURE__ */ new Date()).getTime() - time_start;
        }
        init();
      }
      if (typeof module !== "undefined") {
        module.exports = encode;
      } else if (typeof window !== "undefined") {
        window["jpeg-js"] = window["jpeg-js"] || {};
        window["jpeg-js"].encode = encode;
      }
      function encode(imgData, qu) {
        if (typeof qu === "undefined") qu = 50;
        var encoder = new JPEGEncoder(qu);
        var data = encoder.encode(imgData, qu);
        return {
          data,
          width: imgData.width,
          height: imgData.height
        };
      }
    }
  });

  // project:node_modules/jpeg-js/lib/decoder.js
  var require_decoder = __commonJS({
    "project:node_modules/jpeg-js/lib/decoder.js"(exports, module) {
      var JpegImage = (function jpegImage() {
        "use strict";
        var dctZigZag = new Int32Array([
          0,
          1,
          8,
          16,
          9,
          2,
          3,
          10,
          17,
          24,
          32,
          25,
          18,
          11,
          4,
          5,
          12,
          19,
          26,
          33,
          40,
          48,
          41,
          34,
          27,
          20,
          13,
          6,
          7,
          14,
          21,
          28,
          35,
          42,
          49,
          56,
          57,
          50,
          43,
          36,
          29,
          22,
          15,
          23,
          30,
          37,
          44,
          51,
          58,
          59,
          52,
          45,
          38,
          31,
          39,
          46,
          53,
          60,
          61,
          54,
          47,
          55,
          62,
          63
        ]);
        var dctCos1 = 4017;
        var dctSin1 = 799;
        var dctCos3 = 3406;
        var dctSin3 = 2276;
        var dctCos6 = 1567;
        var dctSin6 = 3784;
        var dctSqrt2 = 5793;
        var dctSqrt1d2 = 2896;
        function constructor() {
        }
        function buildHuffmanTable(codeLengths, values) {
          var k = 0, code = [], i, j, length = 16;
          while (length > 0 && !codeLengths[length - 1])
            length--;
          code.push({ children: [], index: 0 });
          var p = code[0], q;
          for (i = 0; i < length; i++) {
            for (j = 0; j < codeLengths[i]; j++) {
              p = code.pop();
              p.children[p.index] = values[k];
              while (p.index > 0) {
                if (code.length === 0)
                  throw new Error("Could not recreate Huffman Table");
                p = code.pop();
              }
              p.index++;
              code.push(p);
              while (code.length <= i) {
                code.push(q = { children: [], index: 0 });
                p.children[p.index] = q.children;
                p = q;
              }
              k++;
            }
            if (i + 1 < length) {
              code.push(q = { children: [], index: 0 });
              p.children[p.index] = q.children;
              p = q;
            }
          }
          return code[0].children;
        }
        function decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successivePrev, successive, opts) {
          var precision = frame.precision;
          var samplesPerLine = frame.samplesPerLine;
          var scanLines = frame.scanLines;
          var mcusPerLine = frame.mcusPerLine;
          var progressive = frame.progressive;
          var maxH = frame.maxH, maxV = frame.maxV;
          var startOffset = offset, bitsData = 0, bitsCount = 0;
          function readBit() {
            if (bitsCount > 0) {
              bitsCount--;
              return bitsData >> bitsCount & 1;
            }
            bitsData = data[offset++];
            if (bitsData == 255) {
              var nextByte = data[offset++];
              if (nextByte) {
                throw new Error("unexpected marker: " + (bitsData << 8 | nextByte).toString(16));
              }
            }
            bitsCount = 7;
            return bitsData >>> 7;
          }
          function decodeHuffman(tree) {
            var node = tree, bit;
            while ((bit = readBit()) !== null) {
              node = node[bit];
              if (typeof node === "number")
                return node;
              if (typeof node !== "object")
                throw new Error("invalid huffman sequence");
            }
            return null;
          }
          function receive(length) {
            var n2 = 0;
            while (length > 0) {
              var bit = readBit();
              if (bit === null) return;
              n2 = n2 << 1 | bit;
              length--;
            }
            return n2;
          }
          function receiveAndExtend(length) {
            var n2 = receive(length);
            if (n2 >= 1 << length - 1)
              return n2;
            return n2 + (-1 << length) + 1;
          }
          function decodeBaseline(component2, zz) {
            var t = decodeHuffman(component2.huffmanTableDC);
            var diff = t === 0 ? 0 : receiveAndExtend(t);
            zz[0] = component2.pred += diff;
            var k2 = 1;
            while (k2 < 64) {
              var rs = decodeHuffman(component2.huffmanTableAC);
              var s = rs & 15, r = rs >> 4;
              if (s === 0) {
                if (r < 15)
                  break;
                k2 += 16;
                continue;
              }
              k2 += r;
              var z = dctZigZag[k2];
              zz[z] = receiveAndExtend(s);
              k2++;
            }
          }
          function decodeDCFirst(component2, zz) {
            var t = decodeHuffman(component2.huffmanTableDC);
            var diff = t === 0 ? 0 : receiveAndExtend(t) << successive;
            zz[0] = component2.pred += diff;
          }
          function decodeDCSuccessive(component2, zz) {
            zz[0] |= readBit() << successive;
          }
          var eobrun = 0;
          function decodeACFirst(component2, zz) {
            if (eobrun > 0) {
              eobrun--;
              return;
            }
            var k2 = spectralStart, e = spectralEnd;
            while (k2 <= e) {
              var rs = decodeHuffman(component2.huffmanTableAC);
              var s = rs & 15, r = rs >> 4;
              if (s === 0) {
                if (r < 15) {
                  eobrun = receive(r) + (1 << r) - 1;
                  break;
                }
                k2 += 16;
                continue;
              }
              k2 += r;
              var z = dctZigZag[k2];
              zz[z] = receiveAndExtend(s) * (1 << successive);
              k2++;
            }
          }
          var successiveACState = 0, successiveACNextValue;
          function decodeACSuccessive(component2, zz) {
            var k2 = spectralStart, e = spectralEnd, r = 0;
            while (k2 <= e) {
              var z = dctZigZag[k2];
              var direction = zz[z] < 0 ? -1 : 1;
              switch (successiveACState) {
                case 0:
                  var rs = decodeHuffman(component2.huffmanTableAC);
                  var s = rs & 15, r = rs >> 4;
                  if (s === 0) {
                    if (r < 15) {
                      eobrun = receive(r) + (1 << r);
                      successiveACState = 4;
                    } else {
                      r = 16;
                      successiveACState = 1;
                    }
                  } else {
                    if (s !== 1)
                      throw new Error("invalid ACn encoding");
                    successiveACNextValue = receiveAndExtend(s);
                    successiveACState = r ? 2 : 3;
                  }
                  continue;
                case 1:
                // skipping r zero items
                case 2:
                  if (zz[z])
                    zz[z] += (readBit() << successive) * direction;
                  else {
                    r--;
                    if (r === 0)
                      successiveACState = successiveACState == 2 ? 3 : 0;
                  }
                  break;
                case 3:
                  if (zz[z])
                    zz[z] += (readBit() << successive) * direction;
                  else {
                    zz[z] = successiveACNextValue << successive;
                    successiveACState = 0;
                  }
                  break;
                case 4:
                  if (zz[z])
                    zz[z] += (readBit() << successive) * direction;
                  break;
              }
              k2++;
            }
            if (successiveACState === 4) {
              eobrun--;
              if (eobrun === 0)
                successiveACState = 0;
            }
          }
          function decodeMcu(component2, decode2, mcu2, row, col) {
            var mcuRow = mcu2 / mcusPerLine | 0;
            var mcuCol = mcu2 % mcusPerLine;
            var blockRow = mcuRow * component2.v + row;
            var blockCol = mcuCol * component2.h + col;
            if (component2.blocks[blockRow] === void 0 && opts.tolerantDecoding)
              return;
            decode2(component2, component2.blocks[blockRow][blockCol]);
          }
          function decodeBlock(component2, decode2, mcu2) {
            var blockRow = mcu2 / component2.blocksPerLine | 0;
            var blockCol = mcu2 % component2.blocksPerLine;
            if (component2.blocks[blockRow] === void 0 && opts.tolerantDecoding)
              return;
            decode2(component2, component2.blocks[blockRow][blockCol]);
          }
          var componentsLength = components.length;
          var component, i, j, k, n;
          var decodeFn;
          if (progressive) {
            if (spectralStart === 0)
              decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
            else
              decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
          } else {
            decodeFn = decodeBaseline;
          }
          var mcu = 0, marker;
          var mcuExpected;
          if (componentsLength == 1) {
            mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
          } else {
            mcuExpected = mcusPerLine * frame.mcusPerColumn;
          }
          if (!resetInterval) resetInterval = mcuExpected;
          var h, v;
          while (mcu < mcuExpected) {
            for (i = 0; i < componentsLength; i++)
              components[i].pred = 0;
            eobrun = 0;
            if (componentsLength == 1) {
              component = components[0];
              for (n = 0; n < resetInterval; n++) {
                decodeBlock(component, decodeFn, mcu);
                mcu++;
              }
            } else {
              for (n = 0; n < resetInterval; n++) {
                for (i = 0; i < componentsLength; i++) {
                  component = components[i];
                  h = component.h;
                  v = component.v;
                  for (j = 0; j < v; j++) {
                    for (k = 0; k < h; k++) {
                      decodeMcu(component, decodeFn, mcu, j, k);
                    }
                  }
                }
                mcu++;
                if (mcu === mcuExpected) break;
              }
            }
            if (mcu === mcuExpected) {
              do {
                if (data[offset] === 255) {
                  if (data[offset + 1] !== 0) {
                    break;
                  }
                }
                offset += 1;
              } while (offset < data.length - 2);
            }
            bitsCount = 0;
            marker = data[offset] << 8 | data[offset + 1];
            if (marker < 65280) {
              throw new Error("marker was not found");
            }
            if (marker >= 65488 && marker <= 65495) {
              offset += 2;
            } else
              break;
          }
          return offset - startOffset;
        }
        function buildComponentData(frame, component) {
          var lines = [];
          var blocksPerLine = component.blocksPerLine;
          var blocksPerColumn = component.blocksPerColumn;
          var samplesPerLine = blocksPerLine << 3;
          var R = new Int32Array(64), r = new Uint8Array(64);
          function quantizeAndInverse(zz, dataOut, dataIn) {
            var qt = component.quantizationTable;
            var v0, v1, v2, v3, v4, v5, v6, v7, t;
            var p = dataIn;
            var i2;
            for (i2 = 0; i2 < 64; i2++)
              p[i2] = zz[i2] * qt[i2];
            for (i2 = 0; i2 < 8; ++i2) {
              var row = 8 * i2;
              if (p[1 + row] == 0 && p[2 + row] == 0 && p[3 + row] == 0 && p[4 + row] == 0 && p[5 + row] == 0 && p[6 + row] == 0 && p[7 + row] == 0) {
                t = dctSqrt2 * p[0 + row] + 512 >> 10;
                p[0 + row] = t;
                p[1 + row] = t;
                p[2 + row] = t;
                p[3 + row] = t;
                p[4 + row] = t;
                p[5 + row] = t;
                p[6 + row] = t;
                p[7 + row] = t;
                continue;
              }
              v0 = dctSqrt2 * p[0 + row] + 128 >> 8;
              v1 = dctSqrt2 * p[4 + row] + 128 >> 8;
              v2 = p[2 + row];
              v3 = p[6 + row];
              v4 = dctSqrt1d2 * (p[1 + row] - p[7 + row]) + 128 >> 8;
              v7 = dctSqrt1d2 * (p[1 + row] + p[7 + row]) + 128 >> 8;
              v5 = p[3 + row] << 4;
              v6 = p[5 + row] << 4;
              t = v0 - v1 + 1 >> 1;
              v0 = v0 + v1 + 1 >> 1;
              v1 = t;
              t = v2 * dctSin6 + v3 * dctCos6 + 128 >> 8;
              v2 = v2 * dctCos6 - v3 * dctSin6 + 128 >> 8;
              v3 = t;
              t = v4 - v6 + 1 >> 1;
              v4 = v4 + v6 + 1 >> 1;
              v6 = t;
              t = v7 + v5 + 1 >> 1;
              v5 = v7 - v5 + 1 >> 1;
              v7 = t;
              t = v0 - v3 + 1 >> 1;
              v0 = v0 + v3 + 1 >> 1;
              v3 = t;
              t = v1 - v2 + 1 >> 1;
              v1 = v1 + v2 + 1 >> 1;
              v2 = t;
              t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
              v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
              v7 = t;
              t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
              v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
              v6 = t;
              p[0 + row] = v0 + v7;
              p[7 + row] = v0 - v7;
              p[1 + row] = v1 + v6;
              p[6 + row] = v1 - v6;
              p[2 + row] = v2 + v5;
              p[5 + row] = v2 - v5;
              p[3 + row] = v3 + v4;
              p[4 + row] = v3 - v4;
            }
            for (i2 = 0; i2 < 8; ++i2) {
              var col = i2;
              if (p[1 * 8 + col] == 0 && p[2 * 8 + col] == 0 && p[3 * 8 + col] == 0 && p[4 * 8 + col] == 0 && p[5 * 8 + col] == 0 && p[6 * 8 + col] == 0 && p[7 * 8 + col] == 0) {
                t = dctSqrt2 * dataIn[i2 + 0] + 8192 >> 14;
                p[0 * 8 + col] = t;
                p[1 * 8 + col] = t;
                p[2 * 8 + col] = t;
                p[3 * 8 + col] = t;
                p[4 * 8 + col] = t;
                p[5 * 8 + col] = t;
                p[6 * 8 + col] = t;
                p[7 * 8 + col] = t;
                continue;
              }
              v0 = dctSqrt2 * p[0 * 8 + col] + 2048 >> 12;
              v1 = dctSqrt2 * p[4 * 8 + col] + 2048 >> 12;
              v2 = p[2 * 8 + col];
              v3 = p[6 * 8 + col];
              v4 = dctSqrt1d2 * (p[1 * 8 + col] - p[7 * 8 + col]) + 2048 >> 12;
              v7 = dctSqrt1d2 * (p[1 * 8 + col] + p[7 * 8 + col]) + 2048 >> 12;
              v5 = p[3 * 8 + col];
              v6 = p[5 * 8 + col];
              t = v0 - v1 + 1 >> 1;
              v0 = v0 + v1 + 1 >> 1;
              v1 = t;
              t = v2 * dctSin6 + v3 * dctCos6 + 2048 >> 12;
              v2 = v2 * dctCos6 - v3 * dctSin6 + 2048 >> 12;
              v3 = t;
              t = v4 - v6 + 1 >> 1;
              v4 = v4 + v6 + 1 >> 1;
              v6 = t;
              t = v7 + v5 + 1 >> 1;
              v5 = v7 - v5 + 1 >> 1;
              v7 = t;
              t = v0 - v3 + 1 >> 1;
              v0 = v0 + v3 + 1 >> 1;
              v3 = t;
              t = v1 - v2 + 1 >> 1;
              v1 = v1 + v2 + 1 >> 1;
              v2 = t;
              t = v4 * dctSin3 + v7 * dctCos3 + 2048 >> 12;
              v4 = v4 * dctCos3 - v7 * dctSin3 + 2048 >> 12;
              v7 = t;
              t = v5 * dctSin1 + v6 * dctCos1 + 2048 >> 12;
              v5 = v5 * dctCos1 - v6 * dctSin1 + 2048 >> 12;
              v6 = t;
              p[0 * 8 + col] = v0 + v7;
              p[7 * 8 + col] = v0 - v7;
              p[1 * 8 + col] = v1 + v6;
              p[6 * 8 + col] = v1 - v6;
              p[2 * 8 + col] = v2 + v5;
              p[5 * 8 + col] = v2 - v5;
              p[3 * 8 + col] = v3 + v4;
              p[4 * 8 + col] = v3 - v4;
            }
            for (i2 = 0; i2 < 64; ++i2) {
              var sample2 = 128 + (p[i2] + 8 >> 4);
              dataOut[i2] = sample2 < 0 ? 0 : sample2 > 255 ? 255 : sample2;
            }
          }
          requestMemoryAllocation(samplesPerLine * blocksPerColumn * 8);
          var i, j;
          for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
            var scanLine = blockRow << 3;
            for (i = 0; i < 8; i++)
              lines.push(new Uint8Array(samplesPerLine));
            for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
              quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);
              var offset = 0, sample = blockCol << 3;
              for (j = 0; j < 8; j++) {
                var line = lines[scanLine + j];
                for (i = 0; i < 8; i++)
                  line[sample + i] = r[offset++];
              }
            }
          }
          return lines;
        }
        function clampTo8bit(a) {
          return a < 0 ? 0 : a > 255 ? 255 : a;
        }
        constructor.prototype = {
          load: function load(path) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", path, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = (function() {
              var data = new Uint8Array(xhr.response || xhr.mozResponseArrayBuffer);
              this.parse(data);
              if (this.onload)
                this.onload();
            }).bind(this);
            xhr.send(null);
          },
          parse: function parse(data) {
            var maxResolutionInPixels = this.opts.maxResolutionInMP * 1e3 * 1e3;
            var offset = 0, length = data.length;
            function readUint16() {
              var value = data[offset] << 8 | data[offset + 1];
              offset += 2;
              return value;
            }
            function readDataBlock() {
              var length2 = readUint16();
              var array = data.subarray(offset, offset + length2 - 2);
              offset += array.length;
              return array;
            }
            function prepareComponents(frame2) {
              var maxH2 = 1, maxV2 = 1;
              var component2, componentId2;
              for (componentId2 in frame2.components) {
                if (frame2.components.hasOwnProperty(componentId2)) {
                  component2 = frame2.components[componentId2];
                  if (maxH2 < component2.h) maxH2 = component2.h;
                  if (maxV2 < component2.v) maxV2 = component2.v;
                }
              }
              var mcusPerLine = Math.ceil(frame2.samplesPerLine / 8 / maxH2);
              var mcusPerColumn = Math.ceil(frame2.scanLines / 8 / maxV2);
              for (componentId2 in frame2.components) {
                if (frame2.components.hasOwnProperty(componentId2)) {
                  component2 = frame2.components[componentId2];
                  var blocksPerLine = Math.ceil(Math.ceil(frame2.samplesPerLine / 8) * component2.h / maxH2);
                  var blocksPerColumn = Math.ceil(Math.ceil(frame2.scanLines / 8) * component2.v / maxV2);
                  var blocksPerLineForMcu = mcusPerLine * component2.h;
                  var blocksPerColumnForMcu = mcusPerColumn * component2.v;
                  var blocksToAllocate = blocksPerColumnForMcu * blocksPerLineForMcu;
                  var blocks = [];
                  requestMemoryAllocation(blocksToAllocate * 256);
                  for (var i2 = 0; i2 < blocksPerColumnForMcu; i2++) {
                    var row = [];
                    for (var j2 = 0; j2 < blocksPerLineForMcu; j2++)
                      row.push(new Int32Array(64));
                    blocks.push(row);
                  }
                  component2.blocksPerLine = blocksPerLine;
                  component2.blocksPerColumn = blocksPerColumn;
                  component2.blocks = blocks;
                }
              }
              frame2.maxH = maxH2;
              frame2.maxV = maxV2;
              frame2.mcusPerLine = mcusPerLine;
              frame2.mcusPerColumn = mcusPerColumn;
            }
            var jfif = null;
            var adobe = null;
            var pixels = null;
            var frame, resetInterval;
            var quantizationTables = [], frames = [];
            var huffmanTablesAC = [], huffmanTablesDC = [];
            var fileMarker = readUint16();
            var malformedDataOffset = -1;
            this.comments = [];
            if (fileMarker != 65496) {
              throw new Error("SOI not found");
            }
            fileMarker = readUint16();
            while (fileMarker != 65497) {
              var i, j, l;
              switch (fileMarker) {
                case 65280:
                  break;
                case 65504:
                // APP0 (Application Specific)
                case 65505:
                // APP1
                case 65506:
                // APP2
                case 65507:
                // APP3
                case 65508:
                // APP4
                case 65509:
                // APP5
                case 65510:
                // APP6
                case 65511:
                // APP7
                case 65512:
                // APP8
                case 65513:
                // APP9
                case 65514:
                // APP10
                case 65515:
                // APP11
                case 65516:
                // APP12
                case 65517:
                // APP13
                case 65518:
                // APP14
                case 65519:
                // APP15
                case 65534:
                  var appData = readDataBlock();
                  if (fileMarker === 65534) {
                    var comment = String.fromCharCode.apply(null, appData);
                    this.comments.push(comment);
                  }
                  if (fileMarker === 65504) {
                    if (appData[0] === 74 && appData[1] === 70 && appData[2] === 73 && appData[3] === 70 && appData[4] === 0) {
                      jfif = {
                        version: { major: appData[5], minor: appData[6] },
                        densityUnits: appData[7],
                        xDensity: appData[8] << 8 | appData[9],
                        yDensity: appData[10] << 8 | appData[11],
                        thumbWidth: appData[12],
                        thumbHeight: appData[13],
                        thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
                      };
                    }
                  }
                  if (fileMarker === 65505) {
                    if (appData[0] === 69 && appData[1] === 120 && appData[2] === 105 && appData[3] === 102 && appData[4] === 0) {
                      this.exifBuffer = appData.subarray(5, appData.length);
                    }
                  }
                  if (fileMarker === 65518) {
                    if (appData[0] === 65 && appData[1] === 100 && appData[2] === 111 && appData[3] === 98 && appData[4] === 101 && appData[5] === 0) {
                      adobe = {
                        version: appData[6],
                        flags0: appData[7] << 8 | appData[8],
                        flags1: appData[9] << 8 | appData[10],
                        transformCode: appData[11]
                      };
                    }
                  }
                  break;
                case 65499:
                  var quantizationTablesLength = readUint16();
                  var quantizationTablesEnd = quantizationTablesLength + offset - 2;
                  while (offset < quantizationTablesEnd) {
                    var quantizationTableSpec = data[offset++];
                    requestMemoryAllocation(64 * 4);
                    var tableData = new Int32Array(64);
                    if (quantizationTableSpec >> 4 === 0) {
                      for (j = 0; j < 64; j++) {
                        var z = dctZigZag[j];
                        tableData[z] = data[offset++];
                      }
                    } else if (quantizationTableSpec >> 4 === 1) {
                      for (j = 0; j < 64; j++) {
                        var z = dctZigZag[j];
                        tableData[z] = readUint16();
                      }
                    } else
                      throw new Error("DQT: invalid table spec");
                    quantizationTables[quantizationTableSpec & 15] = tableData;
                  }
                  break;
                case 65472:
                // SOF0 (Start of Frame, Baseline DCT)
                case 65473:
                // SOF1 (Start of Frame, Extended DCT)
                case 65474:
                  readUint16();
                  frame = {};
                  frame.extended = fileMarker === 65473;
                  frame.progressive = fileMarker === 65474;
                  frame.precision = data[offset++];
                  frame.scanLines = readUint16();
                  frame.samplesPerLine = readUint16();
                  frame.components = {};
                  frame.componentsOrder = [];
                  var pixelsInFrame = frame.scanLines * frame.samplesPerLine;
                  if (pixelsInFrame > maxResolutionInPixels) {
                    var exceededAmount = Math.ceil((pixelsInFrame - maxResolutionInPixels) / 1e6);
                    throw new Error(`maxResolutionInMP limit exceeded by ${exceededAmount}MP`);
                  }
                  var componentsCount = data[offset++], componentId;
                  var maxH = 0, maxV = 0;
                  for (i = 0; i < componentsCount; i++) {
                    componentId = data[offset];
                    var h = data[offset + 1] >> 4;
                    var v = data[offset + 1] & 15;
                    var qId = data[offset + 2];
                    if (h <= 0 || v <= 0) {
                      throw new Error("Invalid sampling factor, expected values above 0");
                    }
                    frame.componentsOrder.push(componentId);
                    frame.components[componentId] = {
                      h,
                      v,
                      quantizationIdx: qId
                    };
                    offset += 3;
                  }
                  prepareComponents(frame);
                  frames.push(frame);
                  break;
                case 65476:
                  var huffmanLength = readUint16();
                  for (i = 2; i < huffmanLength; ) {
                    var huffmanTableSpec = data[offset++];
                    var codeLengths = new Uint8Array(16);
                    var codeLengthSum = 0;
                    for (j = 0; j < 16; j++, offset++) {
                      codeLengthSum += codeLengths[j] = data[offset];
                    }
                    requestMemoryAllocation(16 + codeLengthSum);
                    var huffmanValues = new Uint8Array(codeLengthSum);
                    for (j = 0; j < codeLengthSum; j++, offset++)
                      huffmanValues[j] = data[offset];
                    i += 17 + codeLengthSum;
                    (huffmanTableSpec >> 4 === 0 ? huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] = buildHuffmanTable(codeLengths, huffmanValues);
                  }
                  break;
                case 65501:
                  readUint16();
                  resetInterval = readUint16();
                  break;
                case 65500:
                  readUint16();
                  readUint16();
                  break;
                case 65498:
                  var scanLength = readUint16();
                  var selectorsCount = data[offset++];
                  var components = [], component;
                  for (i = 0; i < selectorsCount; i++) {
                    component = frame.components[data[offset++]];
                    var tableSpec = data[offset++];
                    component.huffmanTableDC = huffmanTablesDC[tableSpec >> 4];
                    component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
                    components.push(component);
                  }
                  var spectralStart = data[offset++];
                  var spectralEnd = data[offset++];
                  var successiveApproximation = data[offset++];
                  var processed = decodeScan(
                    data,
                    offset,
                    frame,
                    components,
                    resetInterval,
                    spectralStart,
                    spectralEnd,
                    successiveApproximation >> 4,
                    successiveApproximation & 15,
                    this.opts
                  );
                  offset += processed;
                  break;
                case 65535:
                  if (data[offset] !== 255) {
                    offset--;
                  }
                  break;
                default:
                  if (data[offset - 3] == 255 && data[offset - 2] >= 192 && data[offset - 2] <= 254) {
                    offset -= 3;
                    break;
                  } else if (fileMarker === 224 || fileMarker == 225) {
                    if (malformedDataOffset !== -1) {
                      throw new Error(`first unknown JPEG marker at offset ${malformedDataOffset.toString(16)}, second unknown JPEG marker ${fileMarker.toString(16)} at offset ${(offset - 1).toString(16)}`);
                    }
                    malformedDataOffset = offset - 1;
                    const nextOffset = readUint16();
                    if (data[offset + nextOffset - 2] === 255) {
                      offset += nextOffset - 2;
                      break;
                    }
                  }
                  throw new Error("unknown JPEG marker " + fileMarker.toString(16));
              }
              fileMarker = readUint16();
            }
            if (frames.length != 1)
              throw new Error("only single frame JPEGs supported");
            for (var i = 0; i < frames.length; i++) {
              var cp = frames[i].components;
              for (var j in cp) {
                cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
                delete cp[j].quantizationIdx;
              }
            }
            this.width = frame.samplesPerLine;
            this.height = frame.scanLines;
            this.jfif = jfif;
            this.adobe = adobe;
            this.components = [];
            for (var i = 0; i < frame.componentsOrder.length; i++) {
              var component = frame.components[frame.componentsOrder[i]];
              this.components.push({
                lines: buildComponentData(frame, component),
                scaleX: component.h / frame.maxH,
                scaleY: component.v / frame.maxV
              });
            }
          },
          getData: function getData(width, height) {
            var scaleX = this.width / width, scaleY = this.height / height;
            var component1, component2, component3, component4;
            var component1Line, component2Line, component3Line, component4Line;
            var x, y;
            var offset = 0;
            var Y, Cb, Cr, K, C, M, Ye, R, G, B;
            var colorTransform;
            var dataLength = width * height * this.components.length;
            requestMemoryAllocation(dataLength);
            var data = new Uint8Array(dataLength);
            switch (this.components.length) {
              case 1:
                component1 = this.components[0];
                for (y = 0; y < height; y++) {
                  component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                  for (x = 0; x < width; x++) {
                    Y = component1Line[0 | x * component1.scaleX * scaleX];
                    data[offset++] = Y;
                  }
                }
                break;
              case 2:
                component1 = this.components[0];
                component2 = this.components[1];
                for (y = 0; y < height; y++) {
                  component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                  component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                  for (x = 0; x < width; x++) {
                    Y = component1Line[0 | x * component1.scaleX * scaleX];
                    data[offset++] = Y;
                    Y = component2Line[0 | x * component2.scaleX * scaleX];
                    data[offset++] = Y;
                  }
                }
                break;
              case 3:
                colorTransform = true;
                if (this.adobe && this.adobe.transformCode)
                  colorTransform = true;
                else if (typeof this.opts.colorTransform !== "undefined")
                  colorTransform = !!this.opts.colorTransform;
                component1 = this.components[0];
                component2 = this.components[1];
                component3 = this.components[2];
                for (y = 0; y < height; y++) {
                  component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                  component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                  component3Line = component3.lines[0 | y * component3.scaleY * scaleY];
                  for (x = 0; x < width; x++) {
                    if (!colorTransform) {
                      R = component1Line[0 | x * component1.scaleX * scaleX];
                      G = component2Line[0 | x * component2.scaleX * scaleX];
                      B = component3Line[0 | x * component3.scaleX * scaleX];
                    } else {
                      Y = component1Line[0 | x * component1.scaleX * scaleX];
                      Cb = component2Line[0 | x * component2.scaleX * scaleX];
                      Cr = component3Line[0 | x * component3.scaleX * scaleX];
                      R = clampTo8bit(Y + 1.402 * (Cr - 128));
                      G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                      B = clampTo8bit(Y + 1.772 * (Cb - 128));
                    }
                    data[offset++] = R;
                    data[offset++] = G;
                    data[offset++] = B;
                  }
                }
                break;
              case 4:
                if (!this.adobe)
                  throw new Error("Unsupported color mode (4 components)");
                colorTransform = false;
                if (this.adobe && this.adobe.transformCode)
                  colorTransform = true;
                else if (typeof this.opts.colorTransform !== "undefined")
                  colorTransform = !!this.opts.colorTransform;
                component1 = this.components[0];
                component2 = this.components[1];
                component3 = this.components[2];
                component4 = this.components[3];
                for (y = 0; y < height; y++) {
                  component1Line = component1.lines[0 | y * component1.scaleY * scaleY];
                  component2Line = component2.lines[0 | y * component2.scaleY * scaleY];
                  component3Line = component3.lines[0 | y * component3.scaleY * scaleY];
                  component4Line = component4.lines[0 | y * component4.scaleY * scaleY];
                  for (x = 0; x < width; x++) {
                    if (!colorTransform) {
                      C = component1Line[0 | x * component1.scaleX * scaleX];
                      M = component2Line[0 | x * component2.scaleX * scaleX];
                      Ye = component3Line[0 | x * component3.scaleX * scaleX];
                      K = component4Line[0 | x * component4.scaleX * scaleX];
                    } else {
                      Y = component1Line[0 | x * component1.scaleX * scaleX];
                      Cb = component2Line[0 | x * component2.scaleX * scaleX];
                      Cr = component3Line[0 | x * component3.scaleX * scaleX];
                      K = component4Line[0 | x * component4.scaleX * scaleX];
                      C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
                      M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
                      Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
                    }
                    data[offset++] = 255 - C;
                    data[offset++] = 255 - M;
                    data[offset++] = 255 - Ye;
                    data[offset++] = 255 - K;
                  }
                }
                break;
              default:
                throw new Error("Unsupported color mode");
            }
            return data;
          },
          copyToImageData: function copyToImageData(imageData, formatAsRGBA) {
            var width = imageData.width, height = imageData.height;
            var imageDataArray = imageData.data;
            var data = this.getData(width, height);
            var i = 0, j = 0, x, y;
            var Y, K, C, M, R, G, B;
            switch (this.components.length) {
              case 1:
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    Y = data[i++];
                    imageDataArray[j++] = Y;
                    imageDataArray[j++] = Y;
                    imageDataArray[j++] = Y;
                    if (formatAsRGBA) {
                      imageDataArray[j++] = 255;
                    }
                  }
                }
                break;
              case 3:
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    R = data[i++];
                    G = data[i++];
                    B = data[i++];
                    imageDataArray[j++] = R;
                    imageDataArray[j++] = G;
                    imageDataArray[j++] = B;
                    if (formatAsRGBA) {
                      imageDataArray[j++] = 255;
                    }
                  }
                }
                break;
              case 4:
                for (y = 0; y < height; y++) {
                  for (x = 0; x < width; x++) {
                    C = data[i++];
                    M = data[i++];
                    Y = data[i++];
                    K = data[i++];
                    R = 255 - clampTo8bit(C * (1 - K / 255) + K);
                    G = 255 - clampTo8bit(M * (1 - K / 255) + K);
                    B = 255 - clampTo8bit(Y * (1 - K / 255) + K);
                    imageDataArray[j++] = R;
                    imageDataArray[j++] = G;
                    imageDataArray[j++] = B;
                    if (formatAsRGBA) {
                      imageDataArray[j++] = 255;
                    }
                  }
                }
                break;
              default:
                throw new Error("Unsupported color mode");
            }
          }
        };
        var totalBytesAllocated = 0;
        var maxMemoryUsageBytes = 0;
        function requestMemoryAllocation(increaseAmount = 0) {
          var totalMemoryImpactBytes = totalBytesAllocated + increaseAmount;
          if (totalMemoryImpactBytes > maxMemoryUsageBytes) {
            var exceededAmount = Math.ceil((totalMemoryImpactBytes - maxMemoryUsageBytes) / 1024 / 1024);
            throw new Error(`maxMemoryUsageInMB limit exceeded by at least ${exceededAmount}MB`);
          }
          totalBytesAllocated = totalMemoryImpactBytes;
        }
        constructor.resetMaxMemoryUsage = function(maxMemoryUsageBytes_) {
          totalBytesAllocated = 0;
          maxMemoryUsageBytes = maxMemoryUsageBytes_;
        };
        constructor.getBytesAllocated = function() {
          return totalBytesAllocated;
        };
        constructor.requestMemoryAllocation = requestMemoryAllocation;
        return constructor;
      })();
      if (typeof module !== "undefined") {
        module.exports = decode;
      } else if (typeof window !== "undefined") {
        window["jpeg-js"] = window["jpeg-js"] || {};
        window["jpeg-js"].decode = decode;
      }
      function decode(jpegData, userOpts = {}) {
        var defaultOpts = {
          // "undefined" means "Choose whether to transform colors based on the image’s color model."
          colorTransform: void 0,
          useTArray: false,
          formatAsRGBA: true,
          tolerantDecoding: true,
          maxResolutionInMP: 100,
          // Don't decode more than 100 megapixels
          maxMemoryUsageInMB: 512
          // Don't decode if memory footprint is more than 512MB
        };
        var opts = { ...defaultOpts, ...userOpts };
        var arr = new Uint8Array(jpegData);
        var decoder = new JpegImage();
        decoder.opts = opts;
        JpegImage.resetMaxMemoryUsage(opts.maxMemoryUsageInMB * 1024 * 1024);
        decoder.parse(arr);
        var channels = opts.formatAsRGBA ? 4 : 3;
        var bytesNeeded = decoder.width * decoder.height * channels;
        try {
          JpegImage.requestMemoryAllocation(bytesNeeded);
          var image = {
            width: decoder.width,
            height: decoder.height,
            exifBuffer: decoder.exifBuffer,
            data: opts.useTArray ? new Uint8Array(bytesNeeded) : Buffer.alloc(bytesNeeded)
          };
          if (decoder.comments.length > 0) {
            image["comments"] = decoder.comments;
          }
        } catch (err) {
          if (err instanceof RangeError) {
            throw new Error("Could not allocate enough memory for the image. Required: " + bytesNeeded);
          }
          if (err instanceof ReferenceError) {
            if (err.message === "Buffer is not defined") {
              throw new Error("Buffer is not globally defined in this environment. Consider setting useTArray to true");
            }
          }
          throw err;
        }
        decoder.copyToImageData(image, opts.formatAsRGBA);
        return image;
      }
    }
  });

  // project:node_modules/jpeg-js/index.js
  var require_jpeg_js = __commonJS({
    "project:node_modules/jpeg-js/index.js"(exports, module) {
      var encode = require_encoder();
      var decode = require_decoder();
      module.exports = {
        encode,
        decode
      };
    }
  });

  // project:node_modules/pako/lib/utils/common.js
  var require_common = __commonJS({
    "project:node_modules/pako/lib/utils/common.js"(exports) {
      "use strict";
      var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
      function _has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      }
      exports.assign = function(obj) {
        var sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
          var source = sources.shift();
          if (!source) {
            continue;
          }
          if (typeof source !== "object") {
            throw new TypeError(source + "must be non-object");
          }
          for (var p in source) {
            if (_has(source, p)) {
              obj[p] = source[p];
            }
          }
        }
        return obj;
      };
      exports.shrinkBuf = function(buf, size) {
        if (buf.length === size) {
          return buf;
        }
        if (buf.subarray) {
          return buf.subarray(0, size);
        }
        buf.length = size;
        return buf;
      };
      var fnTyped = {
        arraySet: function(dest, src, src_offs, len, dest_offs) {
          if (src.subarray && dest.subarray) {
            dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
            return;
          }
          for (var i = 0; i < len; i++) {
            dest[dest_offs + i] = src[src_offs + i];
          }
        },
        // Join array of chunks to single array.
        flattenChunks: function(chunks) {
          var i, l, len, pos, chunk, result;
          len = 0;
          for (i = 0, l = chunks.length; i < l; i++) {
            len += chunks[i].length;
          }
          result = new Uint8Array(len);
          pos = 0;
          for (i = 0, l = chunks.length; i < l; i++) {
            chunk = chunks[i];
            result.set(chunk, pos);
            pos += chunk.length;
          }
          return result;
        }
      };
      var fnUntyped = {
        arraySet: function(dest, src, src_offs, len, dest_offs) {
          for (var i = 0; i < len; i++) {
            dest[dest_offs + i] = src[src_offs + i];
          }
        },
        // Join array of chunks to single array.
        flattenChunks: function(chunks) {
          return [].concat.apply([], chunks);
        }
      };
      exports.setTyped = function(on) {
        if (on) {
          exports.Buf8 = Uint8Array;
          exports.Buf16 = Uint16Array;
          exports.Buf32 = Int32Array;
          exports.assign(exports, fnTyped);
        } else {
          exports.Buf8 = Array;
          exports.Buf16 = Array;
          exports.Buf32 = Array;
          exports.assign(exports, fnUntyped);
        }
      };
      exports.setTyped(TYPED_OK);
    }
  });

  // project:node_modules/pako/lib/zlib/trees.js
  var require_trees = __commonJS({
    "project:node_modules/pako/lib/zlib/trees.js"(exports) {
      "use strict";
      var utils = require_common();
      var Z_FIXED = 4;
      var Z_BINARY = 0;
      var Z_TEXT = 1;
      var Z_UNKNOWN = 2;
      function zero(buf) {
        var len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      }
      var STORED_BLOCK = 0;
      var STATIC_TREES = 1;
      var DYN_TREES = 2;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var Buf_size = 16;
      var MAX_BL_BITS = 7;
      var END_BLOCK = 256;
      var REP_3_6 = 16;
      var REPZ_3_10 = 17;
      var REPZ_11_138 = 18;
      var extra_lbits = (
        /* extra bits for each length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
      );
      var extra_dbits = (
        /* extra bits for each distance code */
        [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
      );
      var extra_blbits = (
        /* extra bits for each bit length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
      );
      var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      var DIST_CODE_LEN = 512;
      var static_ltree = new Array((L_CODES + 2) * 2);
      zero(static_ltree);
      var static_dtree = new Array(D_CODES * 2);
      zero(static_dtree);
      var _dist_code = new Array(DIST_CODE_LEN);
      zero(_dist_code);
      var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
      zero(_length_code);
      var base_length = new Array(LENGTH_CODES);
      zero(base_length);
      var base_dist = new Array(D_CODES);
      zero(base_dist);
      function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
        this.static_tree = static_tree;
        this.extra_bits = extra_bits;
        this.extra_base = extra_base;
        this.elems = elems;
        this.max_length = max_length;
        this.has_stree = static_tree && static_tree.length;
      }
      var static_l_desc;
      var static_d_desc;
      var static_bl_desc;
      function TreeDesc(dyn_tree, stat_desc) {
        this.dyn_tree = dyn_tree;
        this.max_code = 0;
        this.stat_desc = stat_desc;
      }
      function d_code(dist) {
        return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
      }
      function put_short(s, w) {
        s.pending_buf[s.pending++] = w & 255;
        s.pending_buf[s.pending++] = w >>> 8 & 255;
      }
      function send_bits(s, value, length) {
        if (s.bi_valid > Buf_size - length) {
          s.bi_buf |= value << s.bi_valid & 65535;
          put_short(s, s.bi_buf);
          s.bi_buf = value >> Buf_size - s.bi_valid;
          s.bi_valid += length - Buf_size;
        } else {
          s.bi_buf |= value << s.bi_valid & 65535;
          s.bi_valid += length;
        }
      }
      function send_code(s, c, tree) {
        send_bits(
          s,
          tree[c * 2],
          tree[c * 2 + 1]
          /*.Len*/
        );
      }
      function bi_reverse(code, len) {
        var res = 0;
        do {
          res |= code & 1;
          code >>>= 1;
          res <<= 1;
        } while (--len > 0);
        return res >>> 1;
      }
      function bi_flush(s) {
        if (s.bi_valid === 16) {
          put_short(s, s.bi_buf);
          s.bi_buf = 0;
          s.bi_valid = 0;
        } else if (s.bi_valid >= 8) {
          s.pending_buf[s.pending++] = s.bi_buf & 255;
          s.bi_buf >>= 8;
          s.bi_valid -= 8;
        }
      }
      function gen_bitlen(s, desc) {
        var tree = desc.dyn_tree;
        var max_code = desc.max_code;
        var stree = desc.stat_desc.static_tree;
        var has_stree = desc.stat_desc.has_stree;
        var extra = desc.stat_desc.extra_bits;
        var base = desc.stat_desc.extra_base;
        var max_length = desc.stat_desc.max_length;
        var h;
        var n, m;
        var bits;
        var xbits;
        var f;
        var overflow = 0;
        for (bits = 0; bits <= MAX_BITS; bits++) {
          s.bl_count[bits] = 0;
        }
        tree[s.heap[s.heap_max] * 2 + 1] = 0;
        for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
          n = s.heap[h];
          bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
          if (bits > max_length) {
            bits = max_length;
            overflow++;
          }
          tree[n * 2 + 1] = bits;
          if (n > max_code) {
            continue;
          }
          s.bl_count[bits]++;
          xbits = 0;
          if (n >= base) {
            xbits = extra[n - base];
          }
          f = tree[n * 2];
          s.opt_len += f * (bits + xbits);
          if (has_stree) {
            s.static_len += f * (stree[n * 2 + 1] + xbits);
          }
        }
        if (overflow === 0) {
          return;
        }
        do {
          bits = max_length - 1;
          while (s.bl_count[bits] === 0) {
            bits--;
          }
          s.bl_count[bits]--;
          s.bl_count[bits + 1] += 2;
          s.bl_count[max_length]--;
          overflow -= 2;
        } while (overflow > 0);
        for (bits = max_length; bits !== 0; bits--) {
          n = s.bl_count[bits];
          while (n !== 0) {
            m = s.heap[--h];
            if (m > max_code) {
              continue;
            }
            if (tree[m * 2 + 1] !== bits) {
              s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
              tree[m * 2 + 1] = bits;
            }
            n--;
          }
        }
      }
      function gen_codes(tree, max_code, bl_count) {
        var next_code = new Array(MAX_BITS + 1);
        var code = 0;
        var bits;
        var n;
        for (bits = 1; bits <= MAX_BITS; bits++) {
          next_code[bits] = code = code + bl_count[bits - 1] << 1;
        }
        for (n = 0; n <= max_code; n++) {
          var len = tree[n * 2 + 1];
          if (len === 0) {
            continue;
          }
          tree[n * 2] = bi_reverse(next_code[len]++, len);
        }
      }
      function tr_static_init() {
        var n;
        var bits;
        var length;
        var code;
        var dist;
        var bl_count = new Array(MAX_BITS + 1);
        length = 0;
        for (code = 0; code < LENGTH_CODES - 1; code++) {
          base_length[code] = length;
          for (n = 0; n < 1 << extra_lbits[code]; n++) {
            _length_code[length++] = code;
          }
        }
        _length_code[length - 1] = code;
        dist = 0;
        for (code = 0; code < 16; code++) {
          base_dist[code] = dist;
          for (n = 0; n < 1 << extra_dbits[code]; n++) {
            _dist_code[dist++] = code;
          }
        }
        dist >>= 7;
        for (; code < D_CODES; code++) {
          base_dist[code] = dist << 7;
          for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
            _dist_code[256 + dist++] = code;
          }
        }
        for (bits = 0; bits <= MAX_BITS; bits++) {
          bl_count[bits] = 0;
        }
        n = 0;
        while (n <= 143) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        while (n <= 255) {
          static_ltree[n * 2 + 1] = 9;
          n++;
          bl_count[9]++;
        }
        while (n <= 279) {
          static_ltree[n * 2 + 1] = 7;
          n++;
          bl_count[7]++;
        }
        while (n <= 287) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        gen_codes(static_ltree, L_CODES + 1, bl_count);
        for (n = 0; n < D_CODES; n++) {
          static_dtree[n * 2 + 1] = 5;
          static_dtree[n * 2] = bi_reverse(n, 5);
        }
        static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
        static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
        static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
      }
      function init_block(s) {
        var n;
        for (n = 0; n < L_CODES; n++) {
          s.dyn_ltree[n * 2] = 0;
        }
        for (n = 0; n < D_CODES; n++) {
          s.dyn_dtree[n * 2] = 0;
        }
        for (n = 0; n < BL_CODES; n++) {
          s.bl_tree[n * 2] = 0;
        }
        s.dyn_ltree[END_BLOCK * 2] = 1;
        s.opt_len = s.static_len = 0;
        s.last_lit = s.matches = 0;
      }
      function bi_windup(s) {
        if (s.bi_valid > 8) {
          put_short(s, s.bi_buf);
        } else if (s.bi_valid > 0) {
          s.pending_buf[s.pending++] = s.bi_buf;
        }
        s.bi_buf = 0;
        s.bi_valid = 0;
      }
      function copy_block(s, buf, len, header) {
        bi_windup(s);
        if (header) {
          put_short(s, len);
          put_short(s, ~len);
        }
        utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
        s.pending += len;
      }
      function smaller(tree, n, m, depth) {
        var _n2 = n * 2;
        var _m2 = m * 2;
        return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
      }
      function pqdownheap(s, tree, k) {
        var v = s.heap[k];
        var j = k << 1;
        while (j <= s.heap_len) {
          if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
            j++;
          }
          if (smaller(tree, v, s.heap[j], s.depth)) {
            break;
          }
          s.heap[k] = s.heap[j];
          k = j;
          j <<= 1;
        }
        s.heap[k] = v;
      }
      function compress_block(s, ltree, dtree) {
        var dist;
        var lc;
        var lx = 0;
        var code;
        var extra;
        if (s.last_lit !== 0) {
          do {
            dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
            lc = s.pending_buf[s.l_buf + lx];
            lx++;
            if (dist === 0) {
              send_code(s, lc, ltree);
            } else {
              code = _length_code[lc];
              send_code(s, code + LITERALS + 1, ltree);
              extra = extra_lbits[code];
              if (extra !== 0) {
                lc -= base_length[code];
                send_bits(s, lc, extra);
              }
              dist--;
              code = d_code(dist);
              send_code(s, code, dtree);
              extra = extra_dbits[code];
              if (extra !== 0) {
                dist -= base_dist[code];
                send_bits(s, dist, extra);
              }
            }
          } while (lx < s.last_lit);
        }
        send_code(s, END_BLOCK, ltree);
      }
      function build_tree(s, desc) {
        var tree = desc.dyn_tree;
        var stree = desc.stat_desc.static_tree;
        var has_stree = desc.stat_desc.has_stree;
        var elems = desc.stat_desc.elems;
        var n, m;
        var max_code = -1;
        var node;
        s.heap_len = 0;
        s.heap_max = HEAP_SIZE;
        for (n = 0; n < elems; n++) {
          if (tree[n * 2] !== 0) {
            s.heap[++s.heap_len] = max_code = n;
            s.depth[n] = 0;
          } else {
            tree[n * 2 + 1] = 0;
          }
        }
        while (s.heap_len < 2) {
          node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
          tree[node * 2] = 1;
          s.depth[node] = 0;
          s.opt_len--;
          if (has_stree) {
            s.static_len -= stree[node * 2 + 1];
          }
        }
        desc.max_code = max_code;
        for (n = s.heap_len >> 1; n >= 1; n--) {
          pqdownheap(s, tree, n);
        }
        node = elems;
        do {
          n = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[
            1
            /*SMALLEST*/
          ] = s.heap[s.heap_len--];
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
          m = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[--s.heap_max] = n;
          s.heap[--s.heap_max] = m;
          tree[node * 2] = tree[n * 2] + tree[m * 2];
          s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
          tree[n * 2 + 1] = tree[m * 2 + 1] = node;
          s.heap[
            1
            /*SMALLEST*/
          ] = node++;
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
        } while (s.heap_len >= 2);
        s.heap[--s.heap_max] = s.heap[
          1
          /*SMALLEST*/
        ];
        gen_bitlen(s, desc);
        gen_codes(tree, max_code, s.bl_count);
      }
      function scan_tree(s, tree, max_code) {
        var n;
        var prevlen = -1;
        var curlen;
        var nextlen = tree[0 * 2 + 1];
        var count = 0;
        var max_count = 7;
        var min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        tree[(max_code + 1) * 2 + 1] = 65535;
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            s.bl_tree[curlen * 2] += count;
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              s.bl_tree[curlen * 2]++;
            }
            s.bl_tree[REP_3_6 * 2]++;
          } else if (count <= 10) {
            s.bl_tree[REPZ_3_10 * 2]++;
          } else {
            s.bl_tree[REPZ_11_138 * 2]++;
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      }
      function send_tree(s, tree, max_code) {
        var n;
        var prevlen = -1;
        var curlen;
        var nextlen = tree[0 * 2 + 1];
        var count = 0;
        var max_count = 7;
        var min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            do {
              send_code(s, curlen, s.bl_tree);
            } while (--count !== 0);
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              send_code(s, curlen, s.bl_tree);
              count--;
            }
            send_code(s, REP_3_6, s.bl_tree);
            send_bits(s, count - 3, 2);
          } else if (count <= 10) {
            send_code(s, REPZ_3_10, s.bl_tree);
            send_bits(s, count - 3, 3);
          } else {
            send_code(s, REPZ_11_138, s.bl_tree);
            send_bits(s, count - 11, 7);
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      }
      function build_bl_tree(s) {
        var max_blindex;
        scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
        scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
        build_tree(s, s.bl_desc);
        for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
          if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
            break;
          }
        }
        s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
        return max_blindex;
      }
      function send_all_trees(s, lcodes, dcodes, blcodes) {
        var rank;
        send_bits(s, lcodes - 257, 5);
        send_bits(s, dcodes - 1, 5);
        send_bits(s, blcodes - 4, 4);
        for (rank = 0; rank < blcodes; rank++) {
          send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
        }
        send_tree(s, s.dyn_ltree, lcodes - 1);
        send_tree(s, s.dyn_dtree, dcodes - 1);
      }
      function detect_data_type(s) {
        var black_mask = 4093624447;
        var n;
        for (n = 0; n <= 31; n++, black_mask >>>= 1) {
          if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
            return Z_BINARY;
          }
        }
        if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
          return Z_TEXT;
        }
        for (n = 32; n < LITERALS; n++) {
          if (s.dyn_ltree[n * 2] !== 0) {
            return Z_TEXT;
          }
        }
        return Z_BINARY;
      }
      var static_init_done = false;
      function _tr_init(s) {
        if (!static_init_done) {
          tr_static_init();
          static_init_done = true;
        }
        s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
        s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
        s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
        s.bi_buf = 0;
        s.bi_valid = 0;
        init_block(s);
      }
      function _tr_stored_block(s, buf, stored_len, last) {
        send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
        copy_block(s, buf, stored_len, true);
      }
      function _tr_align(s) {
        send_bits(s, STATIC_TREES << 1, 3);
        send_code(s, END_BLOCK, static_ltree);
        bi_flush(s);
      }
      function _tr_flush_block(s, buf, stored_len, last) {
        var opt_lenb, static_lenb;
        var max_blindex = 0;
        if (s.level > 0) {
          if (s.strm.data_type === Z_UNKNOWN) {
            s.strm.data_type = detect_data_type(s);
          }
          build_tree(s, s.l_desc);
          build_tree(s, s.d_desc);
          max_blindex = build_bl_tree(s);
          opt_lenb = s.opt_len + 3 + 7 >>> 3;
          static_lenb = s.static_len + 3 + 7 >>> 3;
          if (static_lenb <= opt_lenb) {
            opt_lenb = static_lenb;
          }
        } else {
          opt_lenb = static_lenb = stored_len + 5;
        }
        if (stored_len + 4 <= opt_lenb && buf !== -1) {
          _tr_stored_block(s, buf, stored_len, last);
        } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
          send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
          compress_block(s, static_ltree, static_dtree);
        } else {
          send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
          send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
          compress_block(s, s.dyn_ltree, s.dyn_dtree);
        }
        init_block(s);
        if (last) {
          bi_windup(s);
        }
      }
      function _tr_tally(s, dist, lc) {
        s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
        s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
        s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
        s.last_lit++;
        if (dist === 0) {
          s.dyn_ltree[lc * 2]++;
        } else {
          s.matches++;
          dist--;
          s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
          s.dyn_dtree[d_code(dist) * 2]++;
        }
        return s.last_lit === s.lit_bufsize - 1;
      }
      exports._tr_init = _tr_init;
      exports._tr_stored_block = _tr_stored_block;
      exports._tr_flush_block = _tr_flush_block;
      exports._tr_tally = _tr_tally;
      exports._tr_align = _tr_align;
    }
  });

  // project:node_modules/pako/lib/zlib/adler32.js
  var require_adler32 = __commonJS({
    "project:node_modules/pako/lib/zlib/adler32.js"(exports, module) {
      "use strict";
      function adler32(adler, buf, len, pos) {
        var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
        while (len !== 0) {
          n = len > 2e3 ? 2e3 : len;
          len -= n;
          do {
            s1 = s1 + buf[pos++] | 0;
            s2 = s2 + s1 | 0;
          } while (--n);
          s1 %= 65521;
          s2 %= 65521;
        }
        return s1 | s2 << 16 | 0;
      }
      module.exports = adler32;
    }
  });

  // project:node_modules/pako/lib/zlib/crc32.js
  var require_crc32 = __commonJS({
    "project:node_modules/pako/lib/zlib/crc32.js"(exports, module) {
      "use strict";
      function makeTable() {
        var c, table = [];
        for (var n = 0; n < 256; n++) {
          c = n;
          for (var k = 0; k < 8; k++) {
            c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
          }
          table[n] = c;
        }
        return table;
      }
      var crcTable = makeTable();
      function crc32(crc, buf, len, pos) {
        var t = crcTable, end = pos + len;
        crc ^= -1;
        for (var i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
        }
        return crc ^ -1;
      }
      module.exports = crc32;
    }
  });

  // project:node_modules/pako/lib/zlib/messages.js
  var require_messages = __commonJS({
    "project:node_modules/pako/lib/zlib/messages.js"(exports, module) {
      "use strict";
      module.exports = {
        2: "need dictionary",
        /* Z_NEED_DICT       2  */
        1: "stream end",
        /* Z_STREAM_END      1  */
        0: "",
        /* Z_OK              0  */
        "-1": "file error",
        /* Z_ERRNO         (-1) */
        "-2": "stream error",
        /* Z_STREAM_ERROR  (-2) */
        "-3": "data error",
        /* Z_DATA_ERROR    (-3) */
        "-4": "insufficient memory",
        /* Z_MEM_ERROR     (-4) */
        "-5": "buffer error",
        /* Z_BUF_ERROR     (-5) */
        "-6": "incompatible version"
        /* Z_VERSION_ERROR (-6) */
      };
    }
  });

  // project:node_modules/pako/lib/zlib/deflate.js
  var require_deflate = __commonJS({
    "project:node_modules/pako/lib/zlib/deflate.js"(exports) {
      "use strict";
      var utils = require_common();
      var trees = require_trees();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var msg = require_messages();
      var Z_NO_FLUSH = 0;
      var Z_PARTIAL_FLUSH = 1;
      var Z_FULL_FLUSH = 3;
      var Z_FINISH = 4;
      var Z_BLOCK = 5;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_STREAM_ERROR = -2;
      var Z_DATA_ERROR = -3;
      var Z_BUF_ERROR = -5;
      var Z_DEFAULT_COMPRESSION = -1;
      var Z_FILTERED = 1;
      var Z_HUFFMAN_ONLY = 2;
      var Z_RLE = 3;
      var Z_FIXED = 4;
      var Z_DEFAULT_STRATEGY = 0;
      var Z_UNKNOWN = 2;
      var Z_DEFLATED = 8;
      var MAX_MEM_LEVEL = 9;
      var MAX_WBITS = 15;
      var DEF_MEM_LEVEL = 8;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
      var PRESET_DICT = 32;
      var INIT_STATE = 42;
      var EXTRA_STATE = 69;
      var NAME_STATE = 73;
      var COMMENT_STATE = 91;
      var HCRC_STATE = 103;
      var BUSY_STATE = 113;
      var FINISH_STATE = 666;
      var BS_NEED_MORE = 1;
      var BS_BLOCK_DONE = 2;
      var BS_FINISH_STARTED = 3;
      var BS_FINISH_DONE = 4;
      var OS_CODE = 3;
      function err(strm, errorCode) {
        strm.msg = msg[errorCode];
        return errorCode;
      }
      function rank(f) {
        return (f << 1) - (f > 4 ? 9 : 0);
      }
      function zero(buf) {
        var len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      }
      function flush_pending(strm) {
        var s = strm.state;
        var len = s.pending;
        if (len > strm.avail_out) {
          len = strm.avail_out;
        }
        if (len === 0) {
          return;
        }
        utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
        strm.next_out += len;
        s.pending_out += len;
        strm.total_out += len;
        strm.avail_out -= len;
        s.pending -= len;
        if (s.pending === 0) {
          s.pending_out = 0;
        }
      }
      function flush_block_only(s, last) {
        trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
        s.block_start = s.strstart;
        flush_pending(s.strm);
      }
      function put_byte(s, b) {
        s.pending_buf[s.pending++] = b;
      }
      function putShortMSB(s, b) {
        s.pending_buf[s.pending++] = b >>> 8 & 255;
        s.pending_buf[s.pending++] = b & 255;
      }
      function read_buf(strm, buf, start, size) {
        var len = strm.avail_in;
        if (len > size) {
          len = size;
        }
        if (len === 0) {
          return 0;
        }
        strm.avail_in -= len;
        utils.arraySet(buf, strm.input, strm.next_in, len, start);
        if (strm.state.wrap === 1) {
          strm.adler = adler32(strm.adler, buf, len, start);
        } else if (strm.state.wrap === 2) {
          strm.adler = crc32(strm.adler, buf, len, start);
        }
        strm.next_in += len;
        strm.total_in += len;
        return len;
      }
      function longest_match(s, cur_match) {
        var chain_length = s.max_chain_length;
        var scan = s.strstart;
        var match;
        var len;
        var best_len = s.prev_length;
        var nice_match = s.nice_match;
        var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
        var _win = s.window;
        var wmask = s.w_mask;
        var prev = s.prev;
        var strend = s.strstart + MAX_MATCH;
        var scan_end1 = _win[scan + best_len - 1];
        var scan_end = _win[scan + best_len];
        if (s.prev_length >= s.good_match) {
          chain_length >>= 2;
        }
        if (nice_match > s.lookahead) {
          nice_match = s.lookahead;
        }
        do {
          match = cur_match;
          if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
            continue;
          }
          scan += 2;
          match++;
          do {
          } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
          len = MAX_MATCH - (strend - scan);
          scan = strend - MAX_MATCH;
          if (len > best_len) {
            s.match_start = cur_match;
            best_len = len;
            if (len >= nice_match) {
              break;
            }
            scan_end1 = _win[scan + best_len - 1];
            scan_end = _win[scan + best_len];
          }
        } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
        if (best_len <= s.lookahead) {
          return best_len;
        }
        return s.lookahead;
      }
      function fill_window(s) {
        var _w_size = s.w_size;
        var p, n, m, more, str;
        do {
          more = s.window_size - s.lookahead - s.strstart;
          if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
            utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
            s.match_start -= _w_size;
            s.strstart -= _w_size;
            s.block_start -= _w_size;
            n = s.hash_size;
            p = n;
            do {
              m = s.head[--p];
              s.head[p] = m >= _w_size ? m - _w_size : 0;
            } while (--n);
            n = _w_size;
            p = n;
            do {
              m = s.prev[--p];
              s.prev[p] = m >= _w_size ? m - _w_size : 0;
            } while (--n);
            more += _w_size;
          }
          if (s.strm.avail_in === 0) {
            break;
          }
          n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
          s.lookahead += n;
          if (s.lookahead + s.insert >= MIN_MATCH) {
            str = s.strstart - s.insert;
            s.ins_h = s.window[str];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
            while (s.insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
              s.prev[str & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = str;
              str++;
              s.insert--;
              if (s.lookahead + s.insert < MIN_MATCH) {
                break;
              }
            }
          }
        } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
      }
      function deflate_stored(s, flush) {
        var max_block_size = 65535;
        if (max_block_size > s.pending_buf_size - 5) {
          max_block_size = s.pending_buf_size - 5;
        }
        for (; ; ) {
          if (s.lookahead <= 1) {
            fill_window(s);
            if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.strstart += s.lookahead;
          s.lookahead = 0;
          var max_start = s.block_start + max_block_size;
          if (s.strstart === 0 || s.strstart >= max_start) {
            s.lookahead = s.strstart - max_start;
            s.strstart = max_start;
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
          if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.strstart > s.block_start) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_NEED_MORE;
      }
      function deflate_fast(s, flush) {
        var hash_head;
        var bflush;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
              s.match_length--;
              do {
                s.strstart++;
                s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              } while (--s.match_length !== 0);
              s.strstart++;
            } else {
              s.strstart += s.match_length;
              s.match_length = 0;
              s.ins_h = s.window[s.strstart];
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
            }
          } else {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_slow(s, flush) {
        var hash_head;
        var bflush;
        var max_insert;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          s.prev_length = s.match_length;
          s.prev_match = s.match_start;
          s.match_length = MIN_MATCH - 1;
          if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
            if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
              s.match_length = MIN_MATCH - 1;
            }
          }
          if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
            max_insert = s.strstart + s.lookahead - MIN_MATCH;
            bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
            s.lookahead -= s.prev_length - 1;
            s.prev_length -= 2;
            do {
              if (++s.strstart <= max_insert) {
                s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              }
            } while (--s.prev_length !== 0);
            s.match_available = 0;
            s.match_length = MIN_MATCH - 1;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          } else if (s.match_available) {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
            if (bflush) {
              flush_block_only(s, false);
            }
            s.strstart++;
            s.lookahead--;
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          } else {
            s.match_available = 1;
            s.strstart++;
            s.lookahead--;
          }
        }
        if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          s.match_available = 0;
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_rle(s, flush) {
        var bflush;
        var prev;
        var scan, strend;
        var _win = s.window;
        for (; ; ) {
          if (s.lookahead <= MAX_MATCH) {
            fill_window(s);
            if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.match_length = 0;
          if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
            scan = s.strstart - 1;
            prev = _win[scan];
            if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
              strend = s.strstart + MAX_MATCH;
              do {
              } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
              s.match_length = MAX_MATCH - (strend - scan);
              if (s.match_length > s.lookahead) {
                s.match_length = s.lookahead;
              }
            }
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            s.strstart += s.match_length;
            s.match_length = 0;
          } else {
            bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function deflate_huff(s, flush) {
        var bflush;
        for (; ; ) {
          if (s.lookahead === 0) {
            fill_window(s);
            if (s.lookahead === 0) {
              if (flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              break;
            }
          }
          s.match_length = 0;
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.last_lit) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      }
      function Config(good_length, max_lazy, nice_length, max_chain, func) {
        this.good_length = good_length;
        this.max_lazy = max_lazy;
        this.nice_length = nice_length;
        this.max_chain = max_chain;
        this.func = func;
      }
      var configuration_table;
      configuration_table = [
        /*      good lazy nice chain */
        new Config(0, 0, 0, 0, deflate_stored),
        /* 0 store only */
        new Config(4, 4, 8, 4, deflate_fast),
        /* 1 max speed, no lazy matches */
        new Config(4, 5, 16, 8, deflate_fast),
        /* 2 */
        new Config(4, 6, 32, 32, deflate_fast),
        /* 3 */
        new Config(4, 4, 16, 16, deflate_slow),
        /* 4 lazy matches */
        new Config(8, 16, 32, 32, deflate_slow),
        /* 5 */
        new Config(8, 16, 128, 128, deflate_slow),
        /* 6 */
        new Config(8, 32, 128, 256, deflate_slow),
        /* 7 */
        new Config(32, 128, 258, 1024, deflate_slow),
        /* 8 */
        new Config(32, 258, 258, 4096, deflate_slow)
        /* 9 max compression */
      ];
      function lm_init(s) {
        s.window_size = 2 * s.w_size;
        zero(s.head);
        s.max_lazy_match = configuration_table[s.level].max_lazy;
        s.good_match = configuration_table[s.level].good_length;
        s.nice_match = configuration_table[s.level].nice_length;
        s.max_chain_length = configuration_table[s.level].max_chain;
        s.strstart = 0;
        s.block_start = 0;
        s.lookahead = 0;
        s.insert = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        s.ins_h = 0;
      }
      function DeflateState() {
        this.strm = null;
        this.status = 0;
        this.pending_buf = null;
        this.pending_buf_size = 0;
        this.pending_out = 0;
        this.pending = 0;
        this.wrap = 0;
        this.gzhead = null;
        this.gzindex = 0;
        this.method = Z_DEFLATED;
        this.last_flush = -1;
        this.w_size = 0;
        this.w_bits = 0;
        this.w_mask = 0;
        this.window = null;
        this.window_size = 0;
        this.prev = null;
        this.head = null;
        this.ins_h = 0;
        this.hash_size = 0;
        this.hash_bits = 0;
        this.hash_mask = 0;
        this.hash_shift = 0;
        this.block_start = 0;
        this.match_length = 0;
        this.prev_match = 0;
        this.match_available = 0;
        this.strstart = 0;
        this.match_start = 0;
        this.lookahead = 0;
        this.prev_length = 0;
        this.max_chain_length = 0;
        this.max_lazy_match = 0;
        this.level = 0;
        this.strategy = 0;
        this.good_match = 0;
        this.nice_match = 0;
        this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
        this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
        this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
        zero(this.dyn_ltree);
        zero(this.dyn_dtree);
        zero(this.bl_tree);
        this.l_desc = null;
        this.d_desc = null;
        this.bl_desc = null;
        this.bl_count = new utils.Buf16(MAX_BITS + 1);
        this.heap = new utils.Buf16(2 * L_CODES + 1);
        zero(this.heap);
        this.heap_len = 0;
        this.heap_max = 0;
        this.depth = new utils.Buf16(2 * L_CODES + 1);
        zero(this.depth);
        this.l_buf = 0;
        this.lit_bufsize = 0;
        this.last_lit = 0;
        this.d_buf = 0;
        this.opt_len = 0;
        this.static_len = 0;
        this.matches = 0;
        this.insert = 0;
        this.bi_buf = 0;
        this.bi_valid = 0;
      }
      function deflateResetKeep(strm) {
        var s;
        if (!strm || !strm.state) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.total_in = strm.total_out = 0;
        strm.data_type = Z_UNKNOWN;
        s = strm.state;
        s.pending = 0;
        s.pending_out = 0;
        if (s.wrap < 0) {
          s.wrap = -s.wrap;
        }
        s.status = s.wrap ? INIT_STATE : BUSY_STATE;
        strm.adler = s.wrap === 2 ? 0 : 1;
        s.last_flush = Z_NO_FLUSH;
        trees._tr_init(s);
        return Z_OK;
      }
      function deflateReset(strm) {
        var ret = deflateResetKeep(strm);
        if (ret === Z_OK) {
          lm_init(strm.state);
        }
        return ret;
      }
      function deflateSetHeader(strm, head) {
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        if (strm.state.wrap !== 2) {
          return Z_STREAM_ERROR;
        }
        strm.state.gzhead = head;
        return Z_OK;
      }
      function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        var wrap = 1;
        if (level === Z_DEFAULT_COMPRESSION) {
          level = 6;
        }
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else if (windowBits > 15) {
          wrap = 2;
          windowBits -= 16;
        }
        if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
          return err(strm, Z_STREAM_ERROR);
        }
        if (windowBits === 8) {
          windowBits = 9;
        }
        var s = new DeflateState();
        strm.state = s;
        s.strm = strm;
        s.wrap = wrap;
        s.gzhead = null;
        s.w_bits = windowBits;
        s.w_size = 1 << s.w_bits;
        s.w_mask = s.w_size - 1;
        s.hash_bits = memLevel + 7;
        s.hash_size = 1 << s.hash_bits;
        s.hash_mask = s.hash_size - 1;
        s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
        s.window = new utils.Buf8(s.w_size * 2);
        s.head = new utils.Buf16(s.hash_size);
        s.prev = new utils.Buf16(s.w_size);
        s.lit_bufsize = 1 << memLevel + 6;
        s.pending_buf_size = s.lit_bufsize * 4;
        s.pending_buf = new utils.Buf8(s.pending_buf_size);
        s.d_buf = 1 * s.lit_bufsize;
        s.l_buf = (1 + 2) * s.lit_bufsize;
        s.level = level;
        s.strategy = strategy;
        s.method = method;
        return deflateReset(strm);
      }
      function deflateInit(strm, level) {
        return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
      }
      function deflate(strm, flush) {
        var old_flush, s;
        var beg, val;
        if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
          return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
        }
        s = strm.state;
        if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
          return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
        }
        s.strm = strm;
        old_flush = s.last_flush;
        s.last_flush = flush;
        if (s.status === INIT_STATE) {
          if (s.wrap === 2) {
            strm.adler = 0;
            put_byte(s, 31);
            put_byte(s, 139);
            put_byte(s, 8);
            if (!s.gzhead) {
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, 0);
              put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
              put_byte(s, OS_CODE);
              s.status = BUSY_STATE;
            } else {
              put_byte(
                s,
                (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
              );
              put_byte(s, s.gzhead.time & 255);
              put_byte(s, s.gzhead.time >> 8 & 255);
              put_byte(s, s.gzhead.time >> 16 & 255);
              put_byte(s, s.gzhead.time >> 24 & 255);
              put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
              put_byte(s, s.gzhead.os & 255);
              if (s.gzhead.extra && s.gzhead.extra.length) {
                put_byte(s, s.gzhead.extra.length & 255);
                put_byte(s, s.gzhead.extra.length >> 8 & 255);
              }
              if (s.gzhead.hcrc) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
              }
              s.gzindex = 0;
              s.status = EXTRA_STATE;
            }
          } else {
            var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
            var level_flags = -1;
            if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
              level_flags = 0;
            } else if (s.level < 6) {
              level_flags = 1;
            } else if (s.level === 6) {
              level_flags = 2;
            } else {
              level_flags = 3;
            }
            header |= level_flags << 6;
            if (s.strstart !== 0) {
              header |= PRESET_DICT;
            }
            header += 31 - header % 31;
            s.status = BUSY_STATE;
            putShortMSB(s, header);
            if (s.strstart !== 0) {
              putShortMSB(s, strm.adler >>> 16);
              putShortMSB(s, strm.adler & 65535);
            }
            strm.adler = 1;
          }
        }
        if (s.status === EXTRA_STATE) {
          if (s.gzhead.extra) {
            beg = s.pending;
            while (s.gzindex < (s.gzhead.extra.length & 65535)) {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  break;
                }
              }
              put_byte(s, s.gzhead.extra[s.gzindex] & 255);
              s.gzindex++;
            }
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (s.gzindex === s.gzhead.extra.length) {
              s.gzindex = 0;
              s.status = NAME_STATE;
            }
          } else {
            s.status = NAME_STATE;
          }
        }
        if (s.status === NAME_STATE) {
          if (s.gzhead.name) {
            beg = s.pending;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  val = 1;
                  break;
                }
              }
              if (s.gzindex < s.gzhead.name.length) {
                val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (val === 0) {
              s.gzindex = 0;
              s.status = COMMENT_STATE;
            }
          } else {
            s.status = COMMENT_STATE;
          }
        }
        if (s.status === COMMENT_STATE) {
          if (s.gzhead.comment) {
            beg = s.pending;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                beg = s.pending;
                if (s.pending === s.pending_buf_size) {
                  val = 1;
                  break;
                }
              }
              if (s.gzindex < s.gzhead.comment.length) {
                val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            if (val === 0) {
              s.status = HCRC_STATE;
            }
          } else {
            s.status = HCRC_STATE;
          }
        }
        if (s.status === HCRC_STATE) {
          if (s.gzhead.hcrc) {
            if (s.pending + 2 > s.pending_buf_size) {
              flush_pending(strm);
            }
            if (s.pending + 2 <= s.pending_buf_size) {
              put_byte(s, strm.adler & 255);
              put_byte(s, strm.adler >> 8 & 255);
              strm.adler = 0;
              s.status = BUSY_STATE;
            }
          } else {
            s.status = BUSY_STATE;
          }
        }
        if (s.pending !== 0) {
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === FINISH_STATE && strm.avail_in !== 0) {
          return err(strm, Z_BUF_ERROR);
        }
        if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
          var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
          if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
            s.status = FINISH_STATE;
          }
          if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
            if (strm.avail_out === 0) {
              s.last_flush = -1;
            }
            return Z_OK;
          }
          if (bstate === BS_BLOCK_DONE) {
            if (flush === Z_PARTIAL_FLUSH) {
              trees._tr_align(s);
            } else if (flush !== Z_BLOCK) {
              trees._tr_stored_block(s, 0, 0, false);
              if (flush === Z_FULL_FLUSH) {
                zero(s.head);
                if (s.lookahead === 0) {
                  s.strstart = 0;
                  s.block_start = 0;
                  s.insert = 0;
                }
              }
            }
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          }
        }
        if (flush !== Z_FINISH) {
          return Z_OK;
        }
        if (s.wrap <= 0) {
          return Z_STREAM_END;
        }
        if (s.wrap === 2) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          put_byte(s, strm.adler >> 16 & 255);
          put_byte(s, strm.adler >> 24 & 255);
          put_byte(s, strm.total_in & 255);
          put_byte(s, strm.total_in >> 8 & 255);
          put_byte(s, strm.total_in >> 16 & 255);
          put_byte(s, strm.total_in >> 24 & 255);
        } else {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        flush_pending(strm);
        if (s.wrap > 0) {
          s.wrap = -s.wrap;
        }
        return s.pending !== 0 ? Z_OK : Z_STREAM_END;
      }
      function deflateEnd(strm) {
        var status;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        status = strm.state.status;
        if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.state = null;
        return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
      }
      function deflateSetDictionary(strm, dictionary) {
        var dictLength = dictionary.length;
        var s;
        var str, n;
        var wrap;
        var avail;
        var next;
        var input;
        var tmpDict;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        s = strm.state;
        wrap = s.wrap;
        if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
          return Z_STREAM_ERROR;
        }
        if (wrap === 1) {
          strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
        }
        s.wrap = 0;
        if (dictLength >= s.w_size) {
          if (wrap === 0) {
            zero(s.head);
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
          tmpDict = new utils.Buf8(s.w_size);
          utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
          dictionary = tmpDict;
          dictLength = s.w_size;
        }
        avail = strm.avail_in;
        next = strm.next_in;
        input = strm.input;
        strm.avail_in = dictLength;
        strm.next_in = 0;
        strm.input = dictionary;
        fill_window(s);
        while (s.lookahead >= MIN_MATCH) {
          str = s.strstart;
          n = s.lookahead - (MIN_MATCH - 1);
          do {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
          } while (--n);
          s.strstart = str;
          s.lookahead = MIN_MATCH - 1;
          fill_window(s);
        }
        s.strstart += s.lookahead;
        s.block_start = s.strstart;
        s.insert = s.lookahead;
        s.lookahead = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        strm.next_in = next;
        strm.input = input;
        strm.avail_in = avail;
        s.wrap = wrap;
        return Z_OK;
      }
      exports.deflateInit = deflateInit;
      exports.deflateInit2 = deflateInit2;
      exports.deflateReset = deflateReset;
      exports.deflateResetKeep = deflateResetKeep;
      exports.deflateSetHeader = deflateSetHeader;
      exports.deflate = deflate;
      exports.deflateEnd = deflateEnd;
      exports.deflateSetDictionary = deflateSetDictionary;
      exports.deflateInfo = "pako deflate (from Nodeca project)";
    }
  });

  // project:node_modules/pako/lib/utils/strings.js
  var require_strings = __commonJS({
    "project:node_modules/pako/lib/utils/strings.js"(exports) {
      "use strict";
      var utils = require_common();
      var STR_APPLY_OK = true;
      var STR_APPLY_UIA_OK = true;
      try {
        String.fromCharCode.apply(null, [0]);
      } catch (__) {
        STR_APPLY_OK = false;
      }
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch (__) {
        STR_APPLY_UIA_OK = false;
      }
      var _utf8len = new utils.Buf8(256);
      for (q = 0; q < 256; q++) {
        _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
      }
      var q;
      _utf8len[254] = _utf8len[254] = 1;
      exports.string2buf = function(str) {
        var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
        for (m_pos = 0; m_pos < str_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
        }
        buf = new utils.Buf8(buf_len);
        for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          if (c < 128) {
            buf[i++] = c;
          } else if (c < 2048) {
            buf[i++] = 192 | c >>> 6;
            buf[i++] = 128 | c & 63;
          } else if (c < 65536) {
            buf[i++] = 224 | c >>> 12;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          } else {
            buf[i++] = 240 | c >>> 18;
            buf[i++] = 128 | c >>> 12 & 63;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          }
        }
        return buf;
      };
      function buf2binstring(buf, len) {
        if (len < 65534) {
          if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
            return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
          }
        }
        var result = "";
        for (var i = 0; i < len; i++) {
          result += String.fromCharCode(buf[i]);
        }
        return result;
      }
      exports.buf2binstring = function(buf) {
        return buf2binstring(buf, buf.length);
      };
      exports.binstring2buf = function(str) {
        var buf = new utils.Buf8(str.length);
        for (var i = 0, len = buf.length; i < len; i++) {
          buf[i] = str.charCodeAt(i);
        }
        return buf;
      };
      exports.buf2string = function(buf, max) {
        var i, out, c, c_len;
        var len = max || buf.length;
        var utf16buf = new Array(len * 2);
        for (out = 0, i = 0; i < len; ) {
          c = buf[i++];
          if (c < 128) {
            utf16buf[out++] = c;
            continue;
          }
          c_len = _utf8len[c];
          if (c_len > 4) {
            utf16buf[out++] = 65533;
            i += c_len - 1;
            continue;
          }
          c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
          while (c_len > 1 && i < len) {
            c = c << 6 | buf[i++] & 63;
            c_len--;
          }
          if (c_len > 1) {
            utf16buf[out++] = 65533;
            continue;
          }
          if (c < 65536) {
            utf16buf[out++] = c;
          } else {
            c -= 65536;
            utf16buf[out++] = 55296 | c >> 10 & 1023;
            utf16buf[out++] = 56320 | c & 1023;
          }
        }
        return buf2binstring(utf16buf, out);
      };
      exports.utf8border = function(buf, max) {
        var pos;
        max = max || buf.length;
        if (max > buf.length) {
          max = buf.length;
        }
        pos = max - 1;
        while (pos >= 0 && (buf[pos] & 192) === 128) {
          pos--;
        }
        if (pos < 0) {
          return max;
        }
        if (pos === 0) {
          return max;
        }
        return pos + _utf8len[buf[pos]] > max ? pos : max;
      };
    }
  });

  // project:node_modules/pako/lib/zlib/zstream.js
  var require_zstream = __commonJS({
    "project:node_modules/pako/lib/zlib/zstream.js"(exports, module) {
      "use strict";
      function ZStream() {
        this.input = null;
        this.next_in = 0;
        this.avail_in = 0;
        this.total_in = 0;
        this.output = null;
        this.next_out = 0;
        this.avail_out = 0;
        this.total_out = 0;
        this.msg = "";
        this.state = null;
        this.data_type = 2;
        this.adler = 0;
      }
      module.exports = ZStream;
    }
  });

  // project:node_modules/pako/lib/deflate.js
  var require_deflate2 = __commonJS({
    "project:node_modules/pako/lib/deflate.js"(exports) {
      "use strict";
      var zlib_deflate = require_deflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var toString = Object.prototype.toString;
      var Z_NO_FLUSH = 0;
      var Z_FINISH = 4;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_SYNC_FLUSH = 2;
      var Z_DEFAULT_COMPRESSION = -1;
      var Z_DEFAULT_STRATEGY = 0;
      var Z_DEFLATED = 8;
      function Deflate(options) {
        if (!(this instanceof Deflate)) return new Deflate(options);
        this.options = utils.assign({
          level: Z_DEFAULT_COMPRESSION,
          method: Z_DEFLATED,
          chunkSize: 16384,
          windowBits: 15,
          memLevel: 8,
          strategy: Z_DEFAULT_STRATEGY,
          to: ""
        }, options || {});
        var opt = this.options;
        if (opt.raw && opt.windowBits > 0) {
          opt.windowBits = -opt.windowBits;
        } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
          opt.windowBits += 16;
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        var status = zlib_deflate.deflateInit2(
          this.strm,
          opt.level,
          opt.method,
          opt.windowBits,
          opt.memLevel,
          opt.strategy
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        if (opt.header) {
          zlib_deflate.deflateSetHeader(this.strm, opt.header);
        }
        if (opt.dictionary) {
          var dict;
          if (typeof opt.dictionary === "string") {
            dict = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            dict = new Uint8Array(opt.dictionary);
          } else {
            dict = opt.dictionary;
          }
          status = zlib_deflate.deflateSetDictionary(this.strm, dict);
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          this._dict_set = true;
        }
      }
      Deflate.prototype.push = function(data, mode) {
        var strm = this.strm;
        var chunkSize = this.options.chunkSize;
        var status, _mode;
        if (this.ended) {
          return false;
        }
        _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.string2buf(data);
        } else if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        do {
          if (strm.avail_out === 0) {
            strm.output = new utils.Buf8(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_deflate.deflate(strm, _mode);
          if (status !== Z_STREAM_END && status !== Z_OK) {
            this.onEnd(status);
            this.ended = true;
            return false;
          }
          if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
        if (_mode === Z_FINISH) {
          status = zlib_deflate.deflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return status === Z_OK;
        }
        if (_mode === Z_SYNC_FLUSH) {
          this.onEnd(Z_OK);
          strm.avail_out = 0;
          return true;
        }
        return true;
      };
      Deflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Deflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function deflate(input, options) {
        var deflator = new Deflate(options);
        deflator.push(input, true);
        if (deflator.err) {
          throw deflator.msg || msg[deflator.err];
        }
        return deflator.result;
      }
      function deflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return deflate(input, options);
      }
      function gzip(input, options) {
        options = options || {};
        options.gzip = true;
        return deflate(input, options);
      }
      exports.Deflate = Deflate;
      exports.deflate = deflate;
      exports.deflateRaw = deflateRaw;
      exports.gzip = gzip;
    }
  });

  // project:node_modules/pako/lib/zlib/inffast.js
  var require_inffast = __commonJS({
    "project:node_modules/pako/lib/zlib/inffast.js"(exports, module) {
      "use strict";
      var BAD = 30;
      var TYPE = 12;
      module.exports = function inflate_fast(strm, start) {
        var state;
        var _in;
        var last;
        var _out;
        var beg;
        var end;
        var dmax;
        var wsize;
        var whave;
        var wnext;
        var s_window;
        var hold;
        var bits;
        var lcode;
        var dcode;
        var lmask;
        var dmask;
        var here;
        var op;
        var len;
        var dist;
        var from;
        var from_source;
        var input, output;
        state = strm.state;
        _in = strm.next_in;
        input = strm.input;
        last = _in + (strm.avail_in - 5);
        _out = strm.next_out;
        output = strm.output;
        beg = _out - (start - strm.avail_out);
        end = _out + (strm.avail_out - 257);
        dmax = state.dmax;
        wsize = state.wsize;
        whave = state.whave;
        wnext = state.wnext;
        s_window = state.window;
        hold = state.hold;
        bits = state.bits;
        lcode = state.lencode;
        dcode = state.distcode;
        lmask = (1 << state.lenbits) - 1;
        dmask = (1 << state.distbits) - 1;
        top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op === 0) {
                  output[_out++] = here & 65535;
                } else if (op & 16) {
                  len = here & 65535;
                  op &= 15;
                  if (op) {
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                    len += hold & (1 << op) - 1;
                    hold >>>= op;
                    bits -= op;
                  }
                  if (bits < 15) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  here = dcode[hold & dmask];
                  dodist:
                    for (; ; ) {
                      op = here >>> 24;
                      hold >>>= op;
                      bits -= op;
                      op = here >>> 16 & 255;
                      if (op & 16) {
                        dist = here & 65535;
                        op &= 15;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                          if (bits < op) {
                            hold += input[_in++] << bits;
                            bits += 8;
                          }
                        }
                        dist += hold & (1 << op) - 1;
                        if (dist > dmax) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                        hold >>>= op;
                        bits -= op;
                        op = _out - beg;
                        if (dist > op) {
                          op = dist - op;
                          if (op > whave) {
                            if (state.sane) {
                              strm.msg = "invalid distance too far back";
                              state.mode = BAD;
                              break top;
                            }
                          }
                          from = 0;
                          from_source = s_window;
                          if (wnext === 0) {
                            from += wsize - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          } else if (wnext < op) {
                            from += wsize + wnext - op;
                            op -= wnext;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = 0;
                              if (wnext < len) {
                                op = wnext;
                                len -= op;
                                do {
                                  output[_out++] = s_window[from++];
                                } while (--op);
                                from = _out - dist;
                                from_source = output;
                              }
                            }
                          } else {
                            from += wnext - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                          while (len > 2) {
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            len -= 3;
                          }
                          if (len) {
                            output[_out++] = from_source[from++];
                            if (len > 1) {
                              output[_out++] = from_source[from++];
                            }
                          }
                        } else {
                          from = _out - dist;
                          do {
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            len -= 3;
                          } while (len > 2);
                          if (len) {
                            output[_out++] = output[from++];
                            if (len > 1) {
                              output[_out++] = output[from++];
                            }
                          }
                        }
                      } else if ((op & 64) === 0) {
                        here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                        continue dodist;
                      } else {
                        strm.msg = "invalid distance code";
                        state.mode = BAD;
                        break top;
                      }
                      break;
                    }
                } else if ((op & 64) === 0) {
                  here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dolen;
                } else if (op & 32) {
                  state.mode = TYPE;
                  break top;
                } else {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break top;
                }
                break;
              }
          } while (_in < last && _out < end);
        len = bits >> 3;
        _in -= len;
        bits -= len << 3;
        hold &= (1 << bits) - 1;
        strm.next_in = _in;
        strm.next_out = _out;
        strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
        strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
        state.hold = hold;
        state.bits = bits;
        return;
      };
    }
  });

  // project:node_modules/pako/lib/zlib/inftrees.js
  var require_inftrees = __commonJS({
    "project:node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
      "use strict";
      var utils = require_common();
      var MAXBITS = 15;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var lbase = [
        /* Length codes 257..285 base */
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        13,
        15,
        17,
        19,
        23,
        27,
        31,
        35,
        43,
        51,
        59,
        67,
        83,
        99,
        115,
        131,
        163,
        195,
        227,
        258,
        0,
        0
      ];
      var lext = [
        /* Length codes 257..285 extra */
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        20,
        20,
        20,
        20,
        21,
        21,
        21,
        21,
        16,
        72,
        78
      ];
      var dbase = [
        /* Distance codes 0..29 base */
        1,
        2,
        3,
        4,
        5,
        7,
        9,
        13,
        17,
        25,
        33,
        49,
        65,
        97,
        129,
        193,
        257,
        385,
        513,
        769,
        1025,
        1537,
        2049,
        3073,
        4097,
        6145,
        8193,
        12289,
        16385,
        24577,
        0,
        0
      ];
      var dext = [
        /* Distance codes 0..29 extra */
        16,
        16,
        16,
        16,
        17,
        17,
        18,
        18,
        19,
        19,
        20,
        20,
        21,
        21,
        22,
        22,
        23,
        23,
        24,
        24,
        25,
        25,
        26,
        26,
        27,
        27,
        28,
        28,
        29,
        29,
        64,
        64
      ];
      module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
        var bits = opts.bits;
        var len = 0;
        var sym = 0;
        var min = 0, max = 0;
        var root = 0;
        var curr = 0;
        var drop = 0;
        var left = 0;
        var used = 0;
        var huff = 0;
        var incr;
        var fill;
        var low;
        var mask;
        var next;
        var base = null;
        var base_index = 0;
        var end;
        var count = new utils.Buf16(MAXBITS + 1);
        var offs = new utils.Buf16(MAXBITS + 1);
        var extra = null;
        var extra_index = 0;
        var here_bits, here_op, here_val;
        for (len = 0; len <= MAXBITS; len++) {
          count[len] = 0;
        }
        for (sym = 0; sym < codes; sym++) {
          count[lens[lens_index + sym]]++;
        }
        root = bits;
        for (max = MAXBITS; max >= 1; max--) {
          if (count[max] !== 0) {
            break;
          }
        }
        if (root > max) {
          root = max;
        }
        if (max === 0) {
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          opts.bits = 1;
          return 0;
        }
        for (min = 1; min < max; min++) {
          if (count[min] !== 0) {
            break;
          }
        }
        if (root < min) {
          root = min;
        }
        left = 1;
        for (len = 1; len <= MAXBITS; len++) {
          left <<= 1;
          left -= count[len];
          if (left < 0) {
            return -1;
          }
        }
        if (left > 0 && (type === CODES || max !== 1)) {
          return -1;
        }
        offs[1] = 0;
        for (len = 1; len < MAXBITS; len++) {
          offs[len + 1] = offs[len] + count[len];
        }
        for (sym = 0; sym < codes; sym++) {
          if (lens[lens_index + sym] !== 0) {
            work[offs[lens[lens_index + sym]]++] = sym;
          }
        }
        if (type === CODES) {
          base = extra = work;
          end = 19;
        } else if (type === LENS) {
          base = lbase;
          base_index -= 257;
          extra = lext;
          extra_index -= 257;
          end = 256;
        } else {
          base = dbase;
          extra = dext;
          end = -1;
        }
        huff = 0;
        sym = 0;
        len = min;
        next = table_index;
        curr = root;
        drop = 0;
        low = -1;
        used = 1 << root;
        mask = used - 1;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        for (; ; ) {
          here_bits = len - drop;
          if (work[sym] < end) {
            here_op = 0;
            here_val = work[sym];
          } else if (work[sym] > end) {
            here_op = extra[extra_index + work[sym]];
            here_val = base[base_index + work[sym]];
          } else {
            here_op = 32 + 64;
            here_val = 0;
          }
          incr = 1 << len - drop;
          fill = 1 << curr;
          min = fill;
          do {
            fill -= incr;
            table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
          } while (fill !== 0);
          incr = 1 << len - 1;
          while (huff & incr) {
            incr >>= 1;
          }
          if (incr !== 0) {
            huff &= incr - 1;
            huff += incr;
          } else {
            huff = 0;
          }
          sym++;
          if (--count[len] === 0) {
            if (len === max) {
              break;
            }
            len = lens[lens_index + work[sym]];
          }
          if (len > root && (huff & mask) !== low) {
            if (drop === 0) {
              drop = root;
            }
            next += min;
            curr = len - drop;
            left = 1 << curr;
            while (curr + drop < max) {
              left -= count[curr + drop];
              if (left <= 0) {
                break;
              }
              curr++;
              left <<= 1;
            }
            used += 1 << curr;
            if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
              return 1;
            }
            low = huff & mask;
            table[low] = root << 24 | curr << 16 | next - table_index | 0;
          }
        }
        if (huff !== 0) {
          table[next + huff] = len - drop << 24 | 64 << 16 | 0;
        }
        opts.bits = root;
        return 0;
      };
    }
  });

  // project:node_modules/pako/lib/zlib/inflate.js
  var require_inflate = __commonJS({
    "project:node_modules/pako/lib/zlib/inflate.js"(exports) {
      "use strict";
      var utils = require_common();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var inflate_fast = require_inffast();
      var inflate_table = require_inftrees();
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var Z_FINISH = 4;
      var Z_BLOCK = 5;
      var Z_TREES = 6;
      var Z_OK = 0;
      var Z_STREAM_END = 1;
      var Z_NEED_DICT = 2;
      var Z_STREAM_ERROR = -2;
      var Z_DATA_ERROR = -3;
      var Z_MEM_ERROR = -4;
      var Z_BUF_ERROR = -5;
      var Z_DEFLATED = 8;
      var HEAD = 1;
      var FLAGS = 2;
      var TIME = 3;
      var OS = 4;
      var EXLEN = 5;
      var EXTRA = 6;
      var NAME = 7;
      var COMMENT = 8;
      var HCRC = 9;
      var DICTID = 10;
      var DICT = 11;
      var TYPE = 12;
      var TYPEDO = 13;
      var STORED = 14;
      var COPY_ = 15;
      var COPY = 16;
      var TABLE = 17;
      var LENLENS = 18;
      var CODELENS = 19;
      var LEN_ = 20;
      var LEN = 21;
      var LENEXT = 22;
      var DIST = 23;
      var DISTEXT = 24;
      var MATCH = 25;
      var LIT = 26;
      var CHECK = 27;
      var LENGTH = 28;
      var DONE = 29;
      var BAD = 30;
      var MEM = 31;
      var SYNC = 32;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var MAX_WBITS = 15;
      var DEF_WBITS = MAX_WBITS;
      function zswap32(q) {
        return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
      }
      function InflateState() {
        this.mode = 0;
        this.last = false;
        this.wrap = 0;
        this.havedict = false;
        this.flags = 0;
        this.dmax = 0;
        this.check = 0;
        this.total = 0;
        this.head = null;
        this.wbits = 0;
        this.wsize = 0;
        this.whave = 0;
        this.wnext = 0;
        this.window = null;
        this.hold = 0;
        this.bits = 0;
        this.length = 0;
        this.offset = 0;
        this.extra = 0;
        this.lencode = null;
        this.distcode = null;
        this.lenbits = 0;
        this.distbits = 0;
        this.ncode = 0;
        this.nlen = 0;
        this.ndist = 0;
        this.have = 0;
        this.next = null;
        this.lens = new utils.Buf16(320);
        this.work = new utils.Buf16(288);
        this.lendyn = null;
        this.distdyn = null;
        this.sane = 0;
        this.back = 0;
        this.was = 0;
      }
      function inflateResetKeep(strm) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        strm.total_in = strm.total_out = state.total = 0;
        strm.msg = "";
        if (state.wrap) {
          strm.adler = state.wrap & 1;
        }
        state.mode = HEAD;
        state.last = 0;
        state.havedict = 0;
        state.dmax = 32768;
        state.head = null;
        state.hold = 0;
        state.bits = 0;
        state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
        state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
        state.sane = 1;
        state.back = -1;
        return Z_OK;
      }
      function inflateReset(strm) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        state.wsize = 0;
        state.whave = 0;
        state.wnext = 0;
        return inflateResetKeep(strm);
      }
      function inflateReset2(strm, windowBits) {
        var wrap;
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else {
          wrap = (windowBits >> 4) + 1;
          if (windowBits < 48) {
            windowBits &= 15;
          }
        }
        if (windowBits && (windowBits < 8 || windowBits > 15)) {
          return Z_STREAM_ERROR;
        }
        if (state.window !== null && state.wbits !== windowBits) {
          state.window = null;
        }
        state.wrap = wrap;
        state.wbits = windowBits;
        return inflateReset(strm);
      }
      function inflateInit2(strm, windowBits) {
        var ret;
        var state;
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        state = new InflateState();
        strm.state = state;
        state.window = null;
        ret = inflateReset2(strm, windowBits);
        if (ret !== Z_OK) {
          strm.state = null;
        }
        return ret;
      }
      function inflateInit(strm) {
        return inflateInit2(strm, DEF_WBITS);
      }
      var virgin = true;
      var lenfix;
      var distfix;
      function fixedtables(state) {
        if (virgin) {
          var sym;
          lenfix = new utils.Buf32(512);
          distfix = new utils.Buf32(32);
          sym = 0;
          while (sym < 144) {
            state.lens[sym++] = 8;
          }
          while (sym < 256) {
            state.lens[sym++] = 9;
          }
          while (sym < 280) {
            state.lens[sym++] = 7;
          }
          while (sym < 288) {
            state.lens[sym++] = 8;
          }
          inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
          sym = 0;
          while (sym < 32) {
            state.lens[sym++] = 5;
          }
          inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
          virgin = false;
        }
        state.lencode = lenfix;
        state.lenbits = 9;
        state.distcode = distfix;
        state.distbits = 5;
      }
      function updatewindow(strm, src, end, copy) {
        var dist;
        var state = strm.state;
        if (state.window === null) {
          state.wsize = 1 << state.wbits;
          state.wnext = 0;
          state.whave = 0;
          state.window = new utils.Buf8(state.wsize);
        }
        if (copy >= state.wsize) {
          utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
          state.wnext = 0;
          state.whave = state.wsize;
        } else {
          dist = state.wsize - state.wnext;
          if (dist > copy) {
            dist = copy;
          }
          utils.arraySet(state.window, src, end - copy, dist, state.wnext);
          copy -= dist;
          if (copy) {
            utils.arraySet(state.window, src, end - copy, copy, 0);
            state.wnext = copy;
            state.whave = state.wsize;
          } else {
            state.wnext += dist;
            if (state.wnext === state.wsize) {
              state.wnext = 0;
            }
            if (state.whave < state.wsize) {
              state.whave += dist;
            }
          }
        }
        return 0;
      }
      function inflate(strm, flush) {
        var state;
        var input, output;
        var next;
        var put;
        var have, left;
        var hold;
        var bits;
        var _in, _out;
        var copy;
        var from;
        var from_source;
        var here = 0;
        var here_bits, here_op, here_val;
        var last_bits, last_op, last_val;
        var len;
        var ret;
        var hbuf = new utils.Buf8(4);
        var opts;
        var n;
        var order = (
          /* permutation of code lengths */
          [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
        );
        if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.mode === TYPE) {
          state.mode = TYPEDO;
        }
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        _in = have;
        _out = left;
        ret = Z_OK;
        inf_leave:
          for (; ; ) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                state.flags = 0;
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || /* check if zlib header allowed */
                (((hold & 255) << 8) + (hold >> 8)) % 31) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                } else if (len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = hold >> 8 & 1;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              /* falls through */
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  hbuf[2] = hold >>> 16 & 255;
                  hbuf[3] = hold >>> 24 & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              /* falls through */
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              /* falls through */
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = hold >>> 8 & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              /* falls through */
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Array(state.head.extra_len);
                      }
                      utils.arraySet(
                        state.head.extra,
                        input,
                        next,
                        // extra field is limited to 65536 bytes
                        // - no need for additional size check
                        copy,
                        /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                        len
                      );
                    }
                    if (state.flags & 512) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              /* falls through */
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              /* falls through */
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              /* falls through */
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = state.flags >> 9 & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = zswap32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              /* falls through */
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              /* falls through */
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case COPY_:
                state.mode = COPY;
              /* falls through */
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  utils.arraySet(output, input, next, copy, put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              /* falls through */
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              /* falls through */
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (; ; ) {
                    here = state.lencode[hold & (1 << state.lenbits) - 1];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case LEN_:
                state.mode = LEN;
              /* falls through */
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              /* falls through */
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              /* falls through */
              case DIST:
                for (; ; ) {
                  here = state.distcode[hold & (1 << state.distbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              /* falls through */
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              /* falls through */
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                    state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              /* falls through */
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              /* falls through */
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              /* falls through */
              default:
                return Z_STREAM_ERROR;
            }
          }
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
          if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
            state.mode = MEM;
            return Z_MEM_ERROR;
          }
        }
        _in -= strm.avail_in;
        _out -= strm.avail_out;
        strm.total_in += _in;
        strm.total_out += _out;
        state.total += _out;
        if (state.wrap && _out) {
          strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
          state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
        }
        strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
        if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
          ret = Z_BUF_ERROR;
        }
        return ret;
      }
      function inflateEnd(strm) {
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        var state = strm.state;
        if (state.window) {
          state.window = null;
        }
        strm.state = null;
        return Z_OK;
      }
      function inflateGetHeader(strm, head) {
        var state;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if ((state.wrap & 2) === 0) {
          return Z_STREAM_ERROR;
        }
        state.head = head;
        head.done = false;
        return Z_OK;
      }
      function inflateSetDictionary(strm, dictionary) {
        var dictLength = dictionary.length;
        var state;
        var dictid;
        var ret;
        if (!strm || !strm.state) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.wrap !== 0 && state.mode !== DICT) {
          return Z_STREAM_ERROR;
        }
        if (state.mode === DICT) {
          dictid = 1;
          dictid = adler32(dictid, dictionary, dictLength, 0);
          if (dictid !== state.check) {
            return Z_DATA_ERROR;
          }
        }
        ret = updatewindow(strm, dictionary, dictLength, dictLength);
        if (ret) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
        state.havedict = 1;
        return Z_OK;
      }
      exports.inflateReset = inflateReset;
      exports.inflateReset2 = inflateReset2;
      exports.inflateResetKeep = inflateResetKeep;
      exports.inflateInit = inflateInit;
      exports.inflateInit2 = inflateInit2;
      exports.inflate = inflate;
      exports.inflateEnd = inflateEnd;
      exports.inflateGetHeader = inflateGetHeader;
      exports.inflateSetDictionary = inflateSetDictionary;
      exports.inflateInfo = "pako inflate (from Nodeca project)";
    }
  });

  // project:node_modules/pako/lib/zlib/constants.js
  var require_constants = __commonJS({
    "project:node_modules/pako/lib/zlib/constants.js"(exports, module) {
      "use strict";
      module.exports = {
        /* Allowed flush values; see deflate() and inflate() below for details */
        Z_NO_FLUSH: 0,
        Z_PARTIAL_FLUSH: 1,
        Z_SYNC_FLUSH: 2,
        Z_FULL_FLUSH: 3,
        Z_FINISH: 4,
        Z_BLOCK: 5,
        Z_TREES: 6,
        /* Return codes for the compression/decompression functions. Negative values
        * are errors, positive values are used for special but normal events.
        */
        Z_OK: 0,
        Z_STREAM_END: 1,
        Z_NEED_DICT: 2,
        Z_ERRNO: -1,
        Z_STREAM_ERROR: -2,
        Z_DATA_ERROR: -3,
        //Z_MEM_ERROR:     -4,
        Z_BUF_ERROR: -5,
        //Z_VERSION_ERROR: -6,
        /* compression levels */
        Z_NO_COMPRESSION: 0,
        Z_BEST_SPEED: 1,
        Z_BEST_COMPRESSION: 9,
        Z_DEFAULT_COMPRESSION: -1,
        Z_FILTERED: 1,
        Z_HUFFMAN_ONLY: 2,
        Z_RLE: 3,
        Z_FIXED: 4,
        Z_DEFAULT_STRATEGY: 0,
        /* Possible values of the data_type field (though see inflate()) */
        Z_BINARY: 0,
        Z_TEXT: 1,
        //Z_ASCII:                1, // = Z_TEXT (deprecated)
        Z_UNKNOWN: 2,
        /* The deflate compression method */
        Z_DEFLATED: 8
        //Z_NULL:                 null // Use -1 or null inline, depending on var type
      };
    }
  });

  // project:node_modules/pako/lib/zlib/gzheader.js
  var require_gzheader = __commonJS({
    "project:node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
      "use strict";
      function GZheader() {
        this.text = 0;
        this.time = 0;
        this.xflags = 0;
        this.os = 0;
        this.extra = null;
        this.extra_len = 0;
        this.name = "";
        this.comment = "";
        this.hcrc = 0;
        this.done = false;
      }
      module.exports = GZheader;
    }
  });

  // project:node_modules/pako/lib/inflate.js
  var require_inflate2 = __commonJS({
    "project:node_modules/pako/lib/inflate.js"(exports) {
      "use strict";
      var zlib_inflate = require_inflate();
      var utils = require_common();
      var strings = require_strings();
      var c = require_constants();
      var msg = require_messages();
      var ZStream = require_zstream();
      var GZheader = require_gzheader();
      var toString = Object.prototype.toString;
      function Inflate(options) {
        if (!(this instanceof Inflate)) return new Inflate(options);
        this.options = utils.assign({
          chunkSize: 16384,
          windowBits: 0,
          to: ""
        }, options || {});
        var opt = this.options;
        if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
          opt.windowBits = -opt.windowBits;
          if (opt.windowBits === 0) {
            opt.windowBits = -15;
          }
        }
        if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
          opt.windowBits += 32;
        }
        if (opt.windowBits > 15 && opt.windowBits < 48) {
          if ((opt.windowBits & 15) === 0) {
            opt.windowBits |= 15;
          }
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        var status = zlib_inflate.inflateInit2(
          this.strm,
          opt.windowBits
        );
        if (status !== c.Z_OK) {
          throw new Error(msg[status]);
        }
        this.header = new GZheader();
        zlib_inflate.inflateGetHeader(this.strm, this.header);
        if (opt.dictionary) {
          if (typeof opt.dictionary === "string") {
            opt.dictionary = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            opt.dictionary = new Uint8Array(opt.dictionary);
          }
          if (opt.raw) {
            status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
            if (status !== c.Z_OK) {
              throw new Error(msg[status]);
            }
          }
        }
      }
      Inflate.prototype.push = function(data, mode) {
        var strm = this.strm;
        var chunkSize = this.options.chunkSize;
        var dictionary = this.options.dictionary;
        var status, _mode;
        var next_out_utf8, tail, utf8str;
        var allowBufError = false;
        if (this.ended) {
          return false;
        }
        _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.binstring2buf(data);
        } else if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        do {
          if (strm.avail_out === 0) {
            strm.output = new utils.Buf8(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
          if (status === c.Z_NEED_DICT && dictionary) {
            status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
          }
          if (status === c.Z_BUF_ERROR && allowBufError === true) {
            status = c.Z_OK;
            allowBufError = false;
          }
          if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
            this.onEnd(status);
            this.ended = true;
            return false;
          }
          if (strm.next_out) {
            if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
              if (this.options.to === "string") {
                next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
                tail = strm.next_out - next_out_utf8;
                utf8str = strings.buf2string(strm.output, next_out_utf8);
                strm.next_out = tail;
                strm.avail_out = chunkSize - tail;
                if (tail) {
                  utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
                }
                this.onData(utf8str);
              } else {
                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
              }
            }
          }
          if (strm.avail_in === 0 && strm.avail_out === 0) {
            allowBufError = true;
          }
        } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
        if (status === c.Z_STREAM_END) {
          _mode = c.Z_FINISH;
        }
        if (_mode === c.Z_FINISH) {
          status = zlib_inflate.inflateEnd(this.strm);
          this.onEnd(status);
          this.ended = true;
          return status === c.Z_OK;
        }
        if (_mode === c.Z_SYNC_FLUSH) {
          this.onEnd(c.Z_OK);
          strm.avail_out = 0;
          return true;
        }
        return true;
      };
      Inflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Inflate.prototype.onEnd = function(status) {
        if (status === c.Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function inflate(input, options) {
        var inflator = new Inflate(options);
        inflator.push(input, true);
        if (inflator.err) {
          throw inflator.msg || msg[inflator.err];
        }
        return inflator.result;
      }
      function inflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return inflate(input, options);
      }
      exports.Inflate = Inflate;
      exports.inflate = inflate;
      exports.inflateRaw = inflateRaw;
      exports.ungzip = inflate;
    }
  });

  // project:node_modules/pako/index.js
  var require_pako = __commonJS({
    "project:node_modules/pako/index.js"(exports, module) {
      "use strict";
      var assign = require_common().assign;
      var deflate = require_deflate2();
      var inflate = require_inflate2();
      var constants = require_constants();
      var pako2 = {};
      assign(pako2, deflate, inflate, constants);
      module.exports = pako2;
    }
  });

  // Decor.entry.js
  var Decor_entry_exports = {};
  __export(Decor_entry_exports, {
    default: () => Decor_entry_default
  });

  // project:src/runtime.js
  function createRuntime(B, meta, defaults = {}) {
    const React = B.React;
    const RN = B.ReactNative;
    if (!React?.createElement || !RN?.View) throw new Error(`${meta.name}: host React/React Native unavailable`);
    const D = B.metro?.common?.components || {};
    const C = B.ui?.components || D;
    const cleanups = [];
    const listeners = /* @__PURE__ */ new Set();
    const requests = /* @__PURE__ */ new Set();
    const openSheets = /* @__PURE__ */ new Map();
    const control = new AbortController();
    let active = true;
    const initial = JSON.parse(JSON.stringify(defaults));
    const store = B.plugin?.createStorage ? B.plugin.createStorage(initial) : initial;
    for (const [key, value] of Object.entries(initial)) if (store[key] === void 0) store[key] = value;
    const alerts = /* @__PURE__ */ new Set();
    const r = {
      B,
      meta,
      React,
      RN,
      C,
      D,
      h: React.createElement,
      store,
      metro: B.metro,
      common: B.metro?.common || {},
      host: B,
      context: { signal: control.signal },
      get active() {
        return active && !control.signal.aborted;
      },
      status: {},
      api: {
        commands: B.commands || B.api?.commands,
        flux: B.flux || B.api?.flux,
        patcher: B.patcher || B.api?.patcher,
        storage: {
          createStorage: () => store,
          get value() {
            return store;
          },
          flush: () => B.plugin?.flushStorage?.() || Promise.resolve()
        },
        ui: {
          ...B.ui,
          openAlert(id, element) {
            if (!r.active) return;
            alerts.add(id);
            return B.ui.openAlert(id, element);
          },
          dismissAlert(id) {
            alerts.delete(id);
            return B.ui.dismissAlert(id);
          }
        }
      },
      own(fn) {
        if (typeof fn === "function") cleanups.push(fn);
        return fn;
      },
      changed() {
        for (const fn of listeners) fn();
      },
      useRefresh() {
        B.plugin?.useProxy?.(store);
        const [, bump] = React.useState(0);
        React.useEffect(() => {
          if (!r.active) return;
          const fn = () => bump((n) => n + 1);
          listeners.add(fn);
          return () => listeners.delete(fn);
        }, []);
        return () => r.changed();
      },
      set(key, value) {
        if (!r.active) return;
        store[key] = value;
        r.changed();
        Promise.resolve(B.plugin?.flushStorage?.()).catch((e) => r.error("Save settings", e));
      },
      find(...props) {
        try {
          return B.metro.findByProps?.(...props);
        } catch {
          return void 0;
        }
      },
      byName(name, raw = false) {
        try {
          return B.metro.findByName?.(name, !raw) || B.metro.findByDisplayName?.(name, !raw);
        } catch {
          return void 0;
        }
      },
      byStore(name) {
        try {
          return B.metro.findByStoreName?.(name);
        } catch {
          return void 0;
        }
      },
      toast(message, icon) {
        if (!r.active) return;
        const text = String(message);
        const show = B.ui?.showToast || B.ui?.toasts?.showToast;
        if (typeof show !== "function") return;
        if (icon) {
          try {
            show(text, icon);
            return;
          } catch {
          }
          try {
            show({ content: text, icon });
            return;
          } catch {
          }
        }
        show(text);
      },
      error(label, error) {
        const text = `${label}: ${error?.message || error}`;
        console.error(`[${meta.name}]`, text);
        r.status.lastError = text;
        r.changed();
        r.toast(text);
      },
      patch(kind, parent, key, callback) {
        const patcher = r.api.patcher;
        if (typeof parent?.[key] !== "function" || typeof patcher?.[kind] !== "function") return false;
        r.own(patcher[kind](key, parent, callback));
        return true;
      },
      subscribe(type, callback) {
        const flux = r.api.flux;
        if (typeof flux?.subscribe !== "function") throw new Error(`${meta.name}: flux.subscribe unavailable`);
        return r.own(flux.subscribe(type, (payload) => {
          if (r.active) callback(payload);
        }));
      },
      channelId(ctx) {
        if (typeof ctx === "string" && /^\d{5,}$/.test(ctx)) return ctx;
        if (ctx && !Array.isArray(ctx)) {
          const id = ctx.channel?.id || ctx.channel?.channelId || ctx.channelId || ctx.channel_id;
          if (id) return id;
        }
        const selected = r.byStore("SelectedChannelStore");
        return selected?.getChannelId?.() || selected?.getCurrentlySelectedChannelId?.() || selected?.getLastSelectedChannelId?.() || null;
      },
      local(channelId, content) {
        if (!r.active) return false;
        const util = r.find("sendBotMessage");
        if (typeof util?.sendBotMessage === "function") {
          try {
            util.sendBotMessage(channelId, content);
            return true;
          } catch {
          }
        }
        r.toast(String(content));
        return false;
      },
      command(command) {
        const register2 = r.api.commands?.registerCommand;
        if (typeof register2 !== "function") throw new Error(`${meta.name}: commands.registerCommand unavailable`);
        const name = command.name;
        const execute = command.execute;
        const prepared = {
          ...command,
          name,
          options: (command.options || []).map((opt) => ({ ...opt })),
          async execute(args, ctx) {
            if (!r.active) return;
            try {
              const result = await execute(args, ctx);
              if (!r.active) return;
              return result;
            } catch (error) {
              if (r.active) r.error(`/${name}`, error);
            }
          }
        };
        return r.own(register2(prepared));
      },
      wait(ms) {
        if (!r.active) return Promise.reject(new Error("Plugin stopped"));
        return new Promise((resolve, reject) => {
          const finish = () => {
            clearTimeout(timer);
            control.signal.removeEventListener("abort", abort);
          };
          const abort = () => {
            finish();
            reject(new Error("Plugin stopped"));
          };
          const timer = setTimeout(() => {
            finish();
            resolve();
          }, ms);
          control.signal.addEventListener("abort", abort, { once: true });
        });
      },
      async request(url, options = {}, timeout = 15e3, maxBytes = Infinity) {
        if (!r.active) throw new Error("Plugin stopped");
        const controller = new AbortController();
        let rejectDeadline;
        const deadline = new Promise((_, reject) => {
          rejectDeadline = reject;
        });
        const abort = () => {
          controller.abort();
          rejectDeadline(new Error(r.active ? "Request timed out" : "Plugin stopped"));
        };
        requests.add(abort);
        control.signal.addEventListener("abort", abort, { once: true });
        const timer = setTimeout(abort, timeout);
        try {
          const response = await Promise.race([fetch(url, { ...options, signal: controller.signal }), deadline]);
          if (Number(response.headers?.get("content-length")) > maxBytes) {
            controller.abort();
            throw new Error("Response exceeds the preview size limit");
          }
          const text = await Promise.race([response.text(), deadline]);
          if (text.length > maxBytes) throw new Error("Response exceeds the preview size limit");
          if (!r.active) throw new Error("Plugin stopped");
          if (!response.ok) {
            let body;
            try {
              body = JSON.parse(text);
            } catch {
              body = {};
            }
            const error = new Error(body.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.retryAfter = Number(body.retry_after) || 0;
            throw error;
          }
          return { response, text, json() {
            return text ? JSON.parse(text) : null;
          } };
        } finally {
          clearTimeout(timer);
          requests.delete(abort);
          control.signal.removeEventListener("abort", abort);
        }
      },
      async discord(path, options = {}) {
        if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid Discord API path");
        if (!r.active) throw new Error("Plugin stopped");
        const found = r.find("HTTP", "get", "post", "put", "patch", "del") || r.find("get", "post", "put", "del");
        const client = found?.HTTP || found;
        const method = (options.method || "GET").toLowerCase().replace(/^delete$/, "del");
        if (typeof client?.[method] !== "function") throw new Error("Discord HTTP client unavailable");
        try {
          const response = await client[method]({ url: path, ...options.body != null ? { body: typeof options.body === "string" ? JSON.parse(options.body) : options.body } : {} });
          if (!r.active) throw new Error("Plugin stopped");
          if (response?.status >= 400) throw Object.assign(new Error(response.body?.message || `HTTP ${response.status}`), { status: response.status, body: response.body });
          return { response, json() {
            return response?.body ?? null;
          } };
        } catch (cause) {
          const error = new Error(cause?.body?.message || cause?.message || "Discord request failed");
          error.status = cause?.status;
          error.retryAfter = Number(cause?.body?.retry_after) || 0;
          throw error;
        }
      },
      hook(names, transform) {
        const set = new Set(names);
        const jsx = B.api?.react?.jsx;
        if (jsx?.onJsxCreate && jsx?.deleteJsxCreate) {
          for (const name of names) {
            const callback = (_Component, element) => {
              if (!r.active) return;
              r.status[name] = (r.status[name] || 0) + 1;
              try {
                return transform(element, name);
              } catch (error) {
                r.error(`JSX ${name}`, error);
              }
            };
            jsx.onJsxCreate(name, callback);
            r.own(() => jsx.deleteJsxCreate(name, callback));
          }
        }
        r.patch("after", React, "createElement", (args, result) => {
          if (!r.active || !result) return;
          const type = args[0];
          const name = typeof type === "string" ? type : type?.displayName || type?.name || type?.type?.name;
          if (!name || !set.has(name)) return;
          r.status[name] = (r.status[name] || 0) + 1;
          try {
            return transform(result, name) ?? result;
          } catch (error) {
            r.error(`createElement ${name}`, error);
          }
        });
      },
      patchRows(transform) {
        const apply = (value) => {
          try {
            const wasString = typeof value === "string";
            const rows = wasString ? JSON.parse(value) : value;
            const next = transform(rows);
            if (next == null) return value;
            return wasString ? typeof next === "string" ? next : JSON.stringify(next) : next;
          } catch {
            return value;
          }
        };
        const modules = r.RN.NativeModules || {};
        for (const key of Object.keys(modules)) {
          if (typeof modules[key]?.updateRows === "function") {
            r.patch("before", modules[key], "updateRows", (args) => {
              if (args && args[1] != null) args[1] = apply(args[1]);
            });
          }
        }
        const manager = r.byName("RowManager");
        const proto = manager?.prototype || manager;
        if (typeof proto?.generate === "function") {
          r.patch("after", proto, "generate", (_args, row) => apply(row));
        }
      },
      hideSheets() {
        for (const close of [...openSheets.values()]) {
          try {
            close();
          } catch {
          }
        }
        openSheets.clear();
      },
      open(key, Component, props = {}, options = {}) {
        if (!r.active) throw new Error("Plugin stopped");
        const sheets = B.ui?.sheets;
        const ActionSheet = D.ActionSheet || C.ActionSheet;
        if (!sheets?.showSheet || !sheets?.hideSheet || !ActionSheet) throw new Error("Snow bottom-sheet components unavailable");
        const id = `${meta.id}.${key}`;
        openSheets.get(id)?.();
        let closed = false;
        const close = () => {
          if (closed) return;
          closed = true;
          if (openSheets.get(id) === close) openSheets.delete(id);
          sheets.hideSheet(id);
        };
        class Boundary extends React.Component {
          state = { error: null };
          static getDerivedStateFromError(error) {
            return { error };
          }
          componentDidCatch(error) {
            r.error("Sheet rendering", error);
          }
          render() {
            if (!this.state.error) return this.props.children;
            const U = ui(r);
            return r.h(U.Page, { title: "Could not display this page", close }, r.h(U.Text, null, this.state.error.message));
          }
        }
        function Page() {
          React.useEffect(() => () => {
            if (openSheets.get(id) === close) openSheets.delete(id);
            closed = true;
          }, []);
          return r.h(ActionSheet, { scrollable: options.scrollable ?? true }, r.h(Boundary, null, r.h(Component, { ...props, close })));
        }
        openSheets.set(id, close);
        try {
          sheets.showSheet(id, Page);
        } catch (error) {
          close();
          throw error;
        }
        return close;
      },
      copy(text) {
        if (!r.active) return;
        const clip = r.common.clipboard || r.find("setString");
        if (!clip?.setString) throw new Error("Clipboard unavailable");
        clip.setString(String(text));
        r.toast("Copied");
      },
      dispose() {
        active = false;
        control.abort();
        for (const id of alerts) {
          try {
            B.ui?.dismissAlert?.(id);
          } catch (e) {
            console.error(`[${meta.name}] alert cleanup`, e?.message);
          }
        }
        alerts.clear();
        for (const abort of requests) abort();
        requests.clear();
        for (const close of [...openSheets.values()]) {
          try {
            close();
          } catch {
          }
        }
        openSheets.clear();
        while (cleanups.length) {
          try {
            cleanups.pop()();
          } catch (e) {
            console.error(`[${meta.name}] cleanup`, e?.message);
          }
        }
        r.changed();
        listeners.clear();
        return r.api.storage.flush();
      }
    };
    return r;
  }
  function ui(r) {
    const { h, C, D, RN, store } = r;
    function Text({ children, muted = false, heading = false, color, ...props }) {
      const Comp = D.Text || C.Text;
      if (Comp) return h(Comp, { variant: heading ? "heading-md/semibold" : "text-md/normal", color: color || (muted ? "text-muted" : "text-normal"), ...props }, children);
      return h(RN.Text, props, children);
    }
    function Button({ text, onPress, disabled, variant = "primary", ...props }) {
      const Comp = D.Button;
      if (Comp) return h(Comp, { text, onPress, disabled, variant, size: "md", ...props });
      return h(RN.Pressable || RN.TouchableOpacity, { onPress, disabled, accessibilityRole: "button", style: { padding: 12 } }, h(Text, null, text));
    }
    function Page({ title, children, close }) {
      const body = [
        title ? h(Text, { key: "title", heading: true, accessibilityRole: "header" }, title) : null,
        children,
        close ? h(Button, { key: "close", text: "Close", variant: "secondary", onPress: close }) : null
      ];
      if (C.SettingsPage) return h(C.SettingsPage, null, ...body);
      return h(RN.View, { style: { padding: 16, gap: 12 } }, ...body);
    }
    function Input({ value, onChange, ...props }) {
      if (D.TextInput) return h(D.TextInput, { value, onChange, ...props });
      if (C.TextInput) return h(C.TextInput, { value, onChange, ...props });
      return h(RN.TextInput, { value, onChangeText: onChange, ...props });
    }
    function Toggle({ setting, label, subLabel, icon }) {
      r.useRefresh();
      const Row = D.TableSwitchRow || C.TableSwitchRow;
      if (!Row) return null;
      return h(Row, {
        label,
        subLabel,
        icon: icon || (C.RowIcon ? h(C.RowIcon, { name: "SettingsIcon" }) : void 0),
        value: !!store[setting],
        onValueChange: (v) => r.set(setting, v)
      });
    }
    function Slider({ value, onValueChange, minimumValue = 0, maximumValue = 1, step, ...props }) {
      const Comp = D.Slider || C.Slider;
      if (Comp) return h(Comp, { value, onValueChange, minimumValue, maximumValue, step, ...props });
      return h(Input, { value: String(value), onChange: (text) => onValueChange(Number(text) || 0), keyboardType: "numeric" });
    }
    return { Text, Button, Page, Input, Toggle, Slider };
  }
  function register(meta, factory) {
    const B = bunny;
    let runtime;
    let instance;
    return definePlugin({
      async start() {
        if (runtime) {
          try {
            await instance?.stop?.();
          } finally {
            await runtime.dispose();
          }
        }
        runtime = createRuntime(B, meta, factory.defaults || {});
        try {
          instance = factory(runtime);
          await instance.start?.();
        } catch (error) {
          runtime.error("Start failed", error);
          await runtime.dispose();
          throw error;
        }
      },
      async stop() {
        try {
          await instance?.stop?.();
        } finally {
          await runtime?.dispose();
          instance = null;
          runtime = null;
        }
      },
      SettingsComponent() {
        return instance?.Settings ? runtime.h(instance.Settings) : null;
      }
    });
  }

  // project:src/image-conversion.js
  var import_jpeg_js = __toESM(require_jpeg_js());
  var import_pako = __toESM(require_pako());
  function encodePng(rgba, width, height) {
    const scan = new Uint8Array(height * (width * 4 + 1));
    for (let row = 0; row < height; row++) scan.set(rgba.subarray(row * width * 4, (row + 1) * width * 4), row * (width * 4 + 1) + 1);
    function chunk(type, data) {
      const out2 = new Uint8Array(data.length + 12), v = new DataView(out2.buffer);
      v.setUint32(0, data.length);
      out2.set(Array.from(type, (c) => c.charCodeAt(0)), 4);
      out2.set(data, 8);
      let crc = 4294967295;
      for (let i = 4; i < out2.length - 4; i++) {
        crc ^= out2[i];
        for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
      }
      v.setUint32(out2.length - 4, (crc ^ 4294967295) >>> 0);
      return out2;
    }
    const header = new Uint8Array(13), view = new DataView(header.buffer);
    view.setUint32(0, width);
    view.setUint32(4, height);
    header[8] = 8;
    header[9] = 6;
    const chunks = [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", import_pako.default.deflate(scan)), chunk("IEND", new Uint8Array())];
    const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  }
  function decode64(value) {
    const s = String(value).replace(/^data:[^,]+,/, "").replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4 === 1) throw new Error("Invalid image data");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", out = [];
    let acc = 0, bits = 0;
    for (const c of s.replace(/=+$/, "")) {
      acc = acc << 6 | chars.indexOf(c);
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push(acc >> bits & 255);
      }
    }
    return new Uint8Array(out);
  }
  function encode64(bytes) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let out = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const n = bytes[i] << 16 | (bytes[i + 1] || 0) << 8 | (bytes[i + 2] || 0);
      out += chars[n >>> 18] + chars[n >>> 12 & 63] + (i + 1 < bytes.length ? chars[n >>> 6 & 63] : "=") + (i + 2 < bytes.length ? chars[n & 63] : "=");
    }
    return out;
  }
  function toPng(base64) {
    if (String(base64).length > 12 * 1024 * 1024) throw new Error("Image is too large; choose a file under 8 MB");
    let bytes = decode64(base64);
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error("Choose an image under 8 MB");
    let animated = false;
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      if (bytes.length < 33 || view.getUint32(8) !== 13) throw new Error("Invalid PNG header");
      const width = view.getUint32(16), height = view.getUint32(20);
      if (!width || !height || width * height > 4 * 1024 * 1024) throw new Error("Image dimensions exceed 4 megapixels");
      let ended = false;
      for (let offset = 8; offset + 12 <= bytes.length; ) {
        const length = view.getUint32(offset);
        if (offset + length + 12 > bytes.length) throw new Error("Truncated PNG");
        const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
        if (type === "acTL") animated = true;
        if (type === "IEND") {
          ended = true;
          break;
        }
        offset += length + 12;
      }
      if (!ended) throw new Error("Incomplete PNG");
    } else if (bytes[0] === 255 && bytes[1] === 216) {
      const decoded = import_jpeg_js.default.decode(bytes, { useTArray: true, maxResolutionInMP: 4, maxMemoryUsageInMB: 64, tolerantDecoding: false });
      bytes = encodePng(decoded.data, decoded.width, decoded.height);
    } else throw new Error("Use PNG, APNG or JPEG. Convert HEIC, GIF and WebP externally to preserve their appearance or animation.");
    if (bytes.length > 8 * 1024 * 1024) throw new Error("Converted PNG exceeds 8 MB");
    return { uri: "data:image/png;base64," + encode64(bytes), type: "image/png", name: animated ? "decoration.apng" : "decoration.png", animated, bytes: bytes.length };
  }

  // project:src/plugins/decor.js
  function Decor(r) {
    let nativeClose;
    const uploadAborters = /* @__PURE__ */ new Set();
    const uiTimers = /* @__PURE__ */ new Set();
    let stopped = false;
    function schedule(callback, delay) {
      if (stopped || !r.active) return;
      const timer = setTimeout(() => {
        uiTimers.delete(timer);
        if (!stopped && r.active) callback();
      }, delay);
      uiTimers.add(timer);
      return timer;
    }
    var unpatches = [];
    var _storage;
    var usersDecorations = {};
    var fetchQueue = {};
    var bulkTimer = null;
    var presets = [];
    var myDecorations = [];
    var selectedHash = null;
    var selectedDecorationObj = null;
    var selectionEpoch = 0;
    var selectionHydrated = false;
    var selectionListeners = [];
    var putInFlight = null;
    var lastPutKey = void 0;
    var createDraft = { asset: null, alt: "" };
    function notifySelection() {
      for (var i = 0; i < selectionListeners.length; i++) {
        try {
          selectionListeners[i]();
        } catch (_e) {
        }
      }
    }
    function subscribeSelection(fn) {
      if (typeof fn !== "function") return function() {
      };
      selectionListeners.push(fn);
      return function() {
        var i = selectionListeners.indexOf(fn);
        if (i >= 0) selectionListeners.splice(i, 1);
      };
    }
    var BASE_URL = "https://decor.fieryflames.dev";
    var API_URL = BASE_URL + "/api";
    var AUTHORIZE_URL = API_URL + "/authorize";
    var CDN_URL = "https://ugc.decor.fieryflames.dev";
    var CLIENT_ID = "1096966363416899624";
    var SKU_ID = "100101099111114";
    var RAW_SKU_ID = "11497119";
    function log() {
      try {
        console.log.apply(console, ["[Decor]"].concat([].slice.call(arguments)));
      } catch (_e) {
      }
    }
    function logError() {
      try {
        console.error.apply(console, ["[Decor]"].concat([].slice.call(arguments)));
      } catch (_e) {
      }
    }
    function eachClient(fn) {
      fn(r.host);
    }
    function getMod() {
      return r.host;
    }
    function metroRoots() {
      return [r.metro];
    }
    function findByProps() {
      var args = arguments;
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByProps;
        if (!fn) continue;
        try {
          var found = fn.apply(roots[i], args);
          if (found) return found;
        } catch (_e) {
        }
      }
      return null;
    }
    function findByPropsAll() {
      var args = arguments;
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByPropsAll;
        if (!fn) continue;
        try {
          var found = fn.apply(roots[i], args);
          if (found && found.length) return found;
        } catch (_e) {
        }
      }
      var one = findByProps.apply(null, args);
      return one ? [one] : [];
    }
    function findByName(name, expDefault) {
      if (expDefault === void 0) expDefault = true;
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByName;
        if (!fn) continue;
        try {
          var found = fn.call(roots[i], name, expDefault);
          if (found) return found;
        } catch (_e) {
          try {
            var found2 = fn.call(roots[i], name);
            if (found2) return found2;
          } catch (_e2) {
          }
        }
      }
      return null;
    }
    function findByDisplayName(name, expDefault) {
      if (expDefault === void 0) expDefault = true;
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByDisplayName;
        if (!fn) continue;
        try {
          var found = fn.call(roots[i], name, expDefault);
          if (found) return found;
        } catch (_e) {
        }
      }
      return null;
    }
    function findByTypeName(name, expDefault) {
      if (expDefault === void 0) expDefault = true;
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByTypeName;
        if (!fn) continue;
        try {
          var found = fn.call(roots[i], name, expDefault);
          if (found) return found;
        } catch (_e) {
        }
      }
      return null;
    }
    function findByStoreName(name) {
      var roots = metroRoots();
      for (var i = 0; i < roots.length; i++) {
        var fn = roots[i].findByStoreName;
        if (!fn) continue;
        try {
          var found = fn.call(roots[i], name);
          if (found) return found;
        } catch (_e) {
        }
      }
      return findByName(name);
    }
    function getPatcher() {
      return r.api.patcher;
    }
    function hardWrap(kind, obj, method, cb) {
      return patchMethod(kind, obj, method, cb);
    }
    function patchMethod(kind, obj, method, cb) {
      if (typeof obj?.[method] !== "function") return null;
      return r.own(r.api.patcher[kind](method, obj, cb));
    }
    function getReact() {
      return r.React;
    }
    function getRN() {
      return r.RN;
    }
    function getStorage() {
      return r.store;
    }
    function getCurrentUser() {
      var store = findByStoreName("UserStore") || findByProps("getCurrentUser", "getUser");
      return store && store.getCurrentUser ? store.getCurrentUser() : null;
    }
    function getToken() {
      var me = getCurrentUser();
      var store = getStorage();
      if (me && store.tokens && store.tokens[me.id]) return store.tokens[me.id];
      return store.token || null;
    }
    function setToken(token) {
      var store = getStorage();
      var me = getCurrentUser();
      store.token = token;
      r.api.storage.flush().catch((error) => r.error("Save Decor token", error));
      if (!store.tokens) store.tokens = {};
      if (me) store.tokens[me.id] = token;
    }
    function decorationToAsset(decoration) {
      if (!decoration) return null;
      if (typeof decoration === "string") return decoration;
      return (decoration.animated ? "a_" : "") + decoration.hash;
    }
    function decorationToAvatar(decoration) {
      var asset = decorationToAsset(decoration);
      if (!asset) return null;
      return { asset, skuId: SKU_ID };
    }
    function getDecorAvatarDecorationURL(avatarDecoration, canAnimate) {
      if (!avatarDecoration) return null;
      if (avatarDecoration.skuId === SKU_ID) {
        var parts = String(avatarDecoration.asset || "").split("_");
        if (!canAnimate && parts[0] === "a") parts.shift();
        return CDN_URL + "/" + parts.join("_") + ".png";
      }
      if (avatarDecoration.skuId === RAW_SKU_ID) return avatarDecoration.asset;
      return null;
    }
    function applyDecorationToUser(user, decorationAsset) {
      if (!user) return user;
      if (decorationAsset) {
        user.avatarDecoration = { asset: decorationAsset, skuId: SKU_ID };
      } else if (user.avatarDecoration && (user.avatarDecoration.skuId === SKU_ID || user.avatarDecoration.skuId === RAW_SKU_ID)) {
        user.avatarDecoration = null;
      }
      user.avatarDecorationData = user.avatarDecoration;
      user.avatar_decoration_data = user.avatarDecoration;
      return user;
    }
    function doFetch(url, opts) {
      return r.request(url, opts).then((result) => ({ ok: true, status: result.response.status, json: async () => result.json(), text: async () => result.text })).catch((error) => {
        if (error.status === 401 && url.startsWith(API_URL)) setToken(null);
        throw error;
      });
    }
    function getUsersDecorations(ids) {
      if (ids && !ids.length) return Promise.resolve({});
      var url = API_URL + "/users";
      if (ids && ids.length) url += "?ids=" + encodeURIComponent(JSON.stringify(ids));
      return doFetch(url).then(function(r2) {
        if (!r2 || r2.status && r2.status >= 400) throw new Error("http " + (r2 && r2.status));
        return r2.json();
      });
    }
    function authFetch(path, opts) {
      opts = opts || {};
      var token = getToken();
      if (!token) return Promise.reject(new Error("unauthorized"));
      var headers = Object.assign({}, opts.headers || {}, { Authorization: "Bearer " + token });
      return doFetch(API_URL + path, Object.assign({}, opts, { headers })).then(function(r2) {
        if (r2 && r2.status === 401) {
          setToken(null);
          throw new Error("unauthorized");
        }
        if (!r2 || !r2.ok) throw new Error("http " + (r2 && r2.status));
        return r2;
      });
    }
    function getFluxDispatcher() {
      return r.common.FluxDispatcher;
    }
    function stampUserFromStore(userId, decoration) {
      var store = findByStoreName("UserStore") || findByProps("getUser", "getCurrentUser");
      var user = store && store.getUser ? store.getUser(userId) : null;
      if (!user) return;
      applyDecorationToUser(user, decoration);
      var Flux = getFluxDispatcher();
      if (Flux && typeof Flux.dispatch === "function") {
        try {
          Flux.dispatch({ type: "USER_UPDATE", user });
        } catch (_e) {
        }
      }
    }
    function bulkFetch() {
      bulkTimer = null;
      var ids = Object.keys(fetchQueue);
      fetchQueue = {};
      if (!ids.length) return Promise.resolve();
      return getUsersDecorations(ids).then(function(map) {
        map = map || {};
        var me = getCurrentUser();
        var meId = me && me.id;
        for (var i = 0; i < ids.length; i++) {
          var id = ids[i];
          var deco = Object.prototype.hasOwnProperty.call(map, id) ? map[id] : null;
          if (meId && id === meId && selectionHydrated) {
            var local = selectedDecorationObj ? decorationToAsset(selectedDecorationObj) : selectedHash || null;
            if (deco && selectedHash && String(deco).indexOf(selectedHash) >= 0) {
              usersDecorations[id] = deco;
            } else {
              usersDecorations[id] = local;
            }
            continue;
          }
          usersDecorations[id] = deco;
          if (deco) stampUserFromStore(id, deco);
        }
        log("fetched", ids.length, "users");
      }).catch(function(err) {
        logError("bulkFetch", err);
      });
    }
    function queueFetch(userId, force) {
      if (!userId) return;
      if (!force && Object.prototype.hasOwnProperty.call(usersDecorations, userId)) return;
      fetchQueue[userId] = true;
      if (bulkTimer) return;
      bulkTimer = setTimeout(bulkFetch, 250);
    }
    function queueMany(userIds) {
      if (!userIds || !userIds.length) return;
      for (var i = 0; i < userIds.length; i++) queueFetch(userIds[i], false);
    }
    function loadConfig() {
      return doFetch(API_URL + "/config").then(function(r2) {
        return r2 && r2.json ? r2.json() : null;
      }).then(function(cfg) {
        if (!cfg) return;
        if (cfg.CDN_URL) CDN_URL = cfg.CDN_URL;
        if (cfg.CLIENT_ID) CLIENT_ID = cfg.CLIENT_ID;
        log("config", CDN_URL);
      }).catch(function() {
      });
    }
    function stampIfKnown(user) {
      if (!user || !user.id) return user;
      if (Object.prototype.hasOwnProperty.call(usersDecorations, user.id)) {
        applyDecorationToUser(user, usersDecorations[user.id]);
      } else {
        queueFetch(user.id, false);
      }
      return user;
    }
    function handleFlux(event) {
      if (!event) return;
      var type = event.type;
      if (type === "CONNECTION_OPEN") {
        var me = getCurrentUser();
        if (me) queueFetch(me.id, true);
        if (event.user) stampIfKnown(event.user);
        if (event.users) {
          var list = Array.isArray(event.users) ? event.users : [];
          queueMany(list.map(function(u) {
            return u && u.id;
          }).filter(Boolean));
          for (var i = 0; i < list.length; i++) stampIfKnown(list[i]);
        }
        if (getToken()) refreshMine();
        return;
      }
      if ((type === "USER_UPDATE" || type === "CURRENT_USER_UPDATE") && event.user) {
        stampIfKnown(event.user);
        return;
      }
      if (type === "USER_PROFILE_MODAL_OPEN" && event.userId) {
        queueFetch(event.userId, true);
        return;
      }
      if (type === "LOAD_MESSAGES_SUCCESS" && event.messages) {
        queueMany(event.messages.map(function(m) {
          return m && m.author && m.author.id;
        }).filter(Boolean));
        return;
      }
      if (type === "MESSAGE_CREATE") {
        var msg = event.message || event;
        var author = msg && msg.author;
        if (author && author.id) queueFetch(author.id, false);
        return;
      }
      if (type === "TYPING_START" && event.userId) queueFetch(event.userId, false);
    }
    function decoUrlFromAsset(asset, canAnimate) {
      if (!asset) return null;
      if (/^(https?:|file:|content:|ph:|data:)/i.test(String(asset))) return asset;
      return getDecorAvatarDecorationURL({ asset, skuId: SKU_ID }, canAnimate !== false);
    }
    function decorationForUserId(userId) {
      if (!userId) return null;
      if (Object.prototype.hasOwnProperty.call(usersDecorations, userId)) return usersDecorations[userId] || null;
      queueFetch(userId, false);
      return null;
    }
    function decorationUrlFromOpts(opts) {
      if (!opts) return null;
      var uid = opts.userId || opts.user && opts.user.id;
      var cached = decorationForUserId(uid);
      if (cached) return decoUrlFromAsset(cached, opts.canAnimate);
      return getDecorAvatarDecorationURL(opts.avatarDecoration, opts.canAnimate);
    }
    function avatarPixelSize(size) {
      if (typeof size === "number" && size > 0) return size;
      if (size && typeof size === "object") {
        if (typeof size.size === "number") return size.size;
        if (typeof size.width === "number") return size.width;
      }
      var named = {
        xxxsmall: 16,
        xxsmall: 20,
        xsmall: 24,
        extraSmall: 16,
        small: 32,
        medium: 40,
        large: 80,
        xlarge: 120,
        xxlarge: 160,
        xxxlarge: 192,
        size16: 16,
        size20: 20,
        size24: 24,
        size32: 32,
        size40: 40,
        size48: 48,
        size56: 56,
        size64: 64,
        size80: 80,
        size120: 120
      };
      if (typeof size === "string" && named[size] != null) return named[size];
      var mod = findByProps("AvatarSizes");
      try {
        var sizes = mod && (mod.AvatarSizes || mod) || {};
        var v = size != null ? sizes[size] : null;
        if (typeof v === "number") return v;
        if (v && typeof v.size === "number") return v.size;
      } catch (_e) {
      }
      return 32;
    }
    function styleDim(style, key) {
      if (!style) return null;
      if (Array.isArray(style)) {
        for (var i = style.length - 1; i >= 0; i--) {
          var v = styleDim(style[i], key);
          if (typeof v === "number") return v;
        }
        return null;
      }
      if (typeof style[key] === "number") return style[key];
      return null;
    }
    function resolveAvatarSize(props, ret) {
      var w = styleDim(props && props.style, "width") || styleDim(ret && ret.props && ret.props.style, "width");
      var h2 = styleDim(props && props.style, "height") || styleDim(ret && ret.props && ret.props.style, "height");
      if (w && h2) return Math.min(w, h2);
      if (w) return w;
      return avatarPixelSize(props && (props.size || props.avatarSize));
    }
    function overlayEl(uri, size) {
      var RN = getRN() || {};
      var Image = RN.Image;
      if (!Image || !uri) return null;
      return h(Image, {
        key: "mime-decor-overlay",
        source: { uri },
        pointerEvents: "none",
        resizeMode: "contain",
        style: {
          position: "absolute",
          width: size * 1.2,
          height: size * 1.2,
          left: -size * 0.1,
          top: -size * 0.1,
          zIndex: 2
        }
      });
    }
    function swapOverlayChild(node, uri, size) {
      if (!node || !node.props) return false;
      var kids = node.props.children;
      var overlay = uri ? overlayEl(uri, size) : null;
      if (Array.isArray(kids)) {
        var idx = -1;
        for (var i = 0; i < kids.length; i++) {
          if (kids[i] && kids[i].key === "mime-decor-overlay") {
            idx = i;
            break;
          }
        }
        if (idx >= 0) {
          var next = kids.slice();
          if (overlay) next[idx] = overlay;
          else next.splice(idx, 1);
          node.props.children = next;
          return true;
        }
        return false;
      }
      if (kids && kids.key === "mime-decor-overlay") {
        node.props.children = overlay;
        return true;
      }
      return false;
    }
    function addDecorOverlay(ret, uri, size) {
      var RN = getRN() || {};
      var View = RN.View;
      if (!ret) return ret;
      if (swapOverlayChild(ret, uri, size)) return ret;
      if (!uri) return ret;
      var overlay = overlayEl(uri, size);
      if (!overlay) return ret;
      var t = ret.type;
      var native = typeof t === "string";
      if (native || !ret.props) {
        return h(View, { style: { width: size, height: size, overflow: "visible" } }, ret, overlay);
      }
      var kids = ret.props.children;
      if (Array.isArray(kids)) ret.props.children = kids.concat([overlay]);
      else if (kids != null) ret.props.children = [kids, overlay];
      else ret.props.children = overlay;
      var style = ret.props.style;
      if (style == null) ret.props.style = { overflow: "visible" };
      else if (Array.isArray(style)) ret.props.style = style.concat([{ overflow: "visible" }]);
      else ret.props.style = [style, { overflow: "visible" }];
      return ret;
    }
    function stripOfficialDecorArgs(args) {
      var props = args && args[0];
      if (!props || props.__mimeDecorPreview) return args;
      var user = props.user || props.guildMember || null;
      var uid = props.userId || user && user.id;
      if (!uid || !decorationForUserId(uid)) return args;
      var next = Object.assign({}, props, {
        avatarDecoration: null,
        pendingAvatarDecoration: null
      });
      if (user) {
        next.user = Object.assign({}, user, {
          avatarDecoration: null,
          avatarDecorationData: null,
          avatar_decoration_data: null
        });
      }
      var out = [].slice.call(args);
      out[0] = next;
      return out;
    }
    function overlayFromProps(args, ret) {
      var props = args && args[0] || {};
      if (props.__mimeDecorPreview) return ret;
      var user = props.user || props.guildMember || null;
      var uid = props.userId || user && user.id;
      if (!uid) return ret;
      var asset = decorationForUserId(uid);
      var size = resolveAvatarSize(props, ret);
      if (!asset) return addDecorOverlay(ret, null, size);
      return addDecorOverlay(ret, decoUrlFromAsset(asset, true), size);
    }
    function wrapAvatarExport(obj, key) {
      var orig = obj[key];
      if (typeof orig !== "function" || orig.__mimeDecorAvatar) return false;
      function wrapped() {
        var args = stripOfficialDecorArgs(arguments);
        var ret = orig.apply(this, args);
        try {
          ret = overlayFromProps(args, ret);
        } catch (err) {
          logError("avatar overlay", err);
        }
        return ret;
      }
      wrapped.__mimeDecorAvatar = true;
      obj[key] = wrapped;
      unpatches.push(function() {
        if (obj[key] === wrapped) obj[key] = orig;
      });
      return true;
    }
    function wrapAvatarModule(mod) {
      if (!mod) return;
      if (typeof mod === "function") return;
      if (typeof mod.default === "function") wrapAvatarExport(mod, "default");
      if (typeof mod.type === "function") wrapAvatarExport(mod, "type");
      if (mod.prototype && typeof mod.prototype.render === "function") wrapAvatarExport(mod.prototype, "render");
    }
    function patchUrlResolver(resolver) {
      if (!resolver) return;
      if (typeof resolver.getAvatarDecorationURL === "function") {
        var unUrl = patchMethod("instead", resolver, "getAvatarDecorationURL", function(args, orig) {
          var custom = decorationUrlFromOpts(args && args[0]);
          if (custom) return custom;
          try {
            return orig.apply(resolver, args);
          } catch (_e) {
            return orig(args[0]);
          }
        });
        if (unUrl) log("patched getAvatarDecorationURL");
      }
      if (resolver.default) patchUrlResolver(resolver.default);
    }
    function patchAvatars() {
      var i;
      var list = findByPropsAll("getAvatarDecorationURL");
      for (i = 0; i < list.length; i++) patchUrlResolver(list[i]);
      patchUrlResolver(findByProps("getAvatarDecorationURL", "default"));
      patchUrlResolver(findByProps("getAvatarDecorationURL", "getUserAvatarURL"));
      patchUrlResolver(findByProps("getAvatarDecorationURL"));
      var sizes = findByProps("AvatarSizes");
      if (sizes) wrapAvatarModule(sizes);
      var comps = getMod().metro && getMod().metro.common && getMod().metro.common.components || {};
      if (comps.Avatar) wrapAvatarModule(typeof comps.Avatar === "function" ? { default: comps.Avatar } : comps.Avatar);
      var names = ["Avatar", "UserAvatar", "DisplayAvatar"];
      for (i = 0; i < names.length; i++) {
        var raw = findByName(names[i], false) || findByDisplayName(names[i], false) || findByTypeName(names[i], false);
        if (raw) wrapAvatarModule(raw);
      }
      log("patched avatars");
    }
    function patchStores() {
      var UserStore = findByStoreName("UserStore") || findByProps("getUser", "getCurrentUser");
      if (UserStore) {
        var un = patchMethod("after", UserStore, "getUser", function(_args, user) {
          return stampIfKnown(user);
        });
        if (un) log("patched UserStore.getUser");
        if (typeof UserStore.getCurrentUser === "function") {
          patchMethod("after", UserStore, "getCurrentUser", function(_args, user) {
            return stampIfKnown(user);
          });
        }
      }
      patchAvatars();
      var anim = findByProps("isAnimatedAvatarDecoration");
      if (anim && typeof anim.isAnimatedAvatarDecoration === "function") {
        patchMethod("after", anim, "isAnimatedAvatarDecoration", function(args, ret) {
          var d = args && args[0];
          var asset = d && (d.asset || d);
          if (typeof asset === "string" && asset.indexOf("a_") === 0) return true;
          return ret;
        });
      }
      var Flux = getFluxDispatcher();
      if (Flux && typeof Flux.dispatch === "function") {
        patchMethod("before", Flux, "dispatch", function(args) {
          var e = args && args[0];
          if (!e) return;
          if (e.user) stampIfKnown(e.user);
          if (e.message && e.message.author) stampIfKnown(e.message.author);
        });
      }
    }
    function subscribeFlux() {
      for (const type of ["CONNECTION_OPEN", "USER_PROFILE_MODAL_OPEN", "LOAD_MESSAGES_SUCCESS", "MESSAGE_CREATE", "TYPING_START"]) {
        r.subscribe(type, (payload) => handleFlux({ ...payload, type }));
      }
    }
    function showToast(message) {
      r.toast(message);
    }
    function hideSheet() {
      nativeClose?.();
      nativeClose = null;
    }
    function getWebView() {
      var named = findByName("WebView");
      if (named) return named;
      var mod = findByProps("WebView");
      if (!mod) return null;
      if (typeof mod.WebView === "function") return mod.WebView;
      if (mod.default && typeof mod.default === "function") return mod.default;
      return null;
    }
    function discordAuthorizeUrl() {
      return "https://discord.com/oauth2/authorize?client_id=" + encodeURIComponent(CLIENT_ID) + "&redirect_uri=" + encodeURIComponent(AUTHORIZE_URL) + "&response_type=code&scope=identify";
    }
    function decoImageUri(decoration) {
      var asset = decorationToAsset(decoration);
      if (!asset) return null;
      return CDN_URL + "/" + asset + ".png";
    }
    function isLikelyJwt(token) {
      token = String(token || "").trim();
      if (!token || token.length < 16) return false;
      if (token.charAt(0) === "<" || token.indexOf("<!DOCTYPE") >= 0 || token.indexOf("{") === 0) return false;
      return token.split(".").length >= 2;
    }
    function exchangeDecorToken(location) {
      var url = String(location || "");
      if (!url) return Promise.reject(new Error("no location"));
      if (url.indexOf("http") !== 0 && url.charAt(0) === "/") url = "https://discord.com" + url;
      if (new URL(url).origin !== BASE_URL || new URL(url).pathname !== "/api/authorize" || !new URL(url).searchParams.has("code")) {
        return Promise.reject(new Error("not a Decor redirect"));
      }
      function stripClient(u) {
        return u.replace(/([?&])client=[^&]*/g, "$1").replace(/[?&]$/, "").replace("?&", "?");
      }
      function tryClient(client) {
        var u = stripClient(url);
        u += (u.indexOf("?") >= 0 ? "&" : "?") + "client=" + encodeURIComponent(client);
        return doFetch(u).then(function(r2) {
          return r2.text();
        }).then(function(token) {
          token = String(token || "").trim();
          if (!isLikelyJwt(token)) throw new Error("bad token for " + client);
          setToken(token);
          hideSheet();
          showToast("Decor authorized");
          log("authorized", client);
          return refreshMine().then(function() {
            return token;
          });
        });
      }
      return tryClient("vencord");
    }
    function finishAuthFromRedirect(location) {
      try {
        const u = new URL(location);
        if (u.origin !== BASE_URL || u.pathname !== "/api/authorize" || !u.searchParams.has("code")) return false;
      } catch {
        return false;
      }
      exchangeDecorToken(location).catch((error) => r.error("Authorize Decor", error));
      return true;
    }
    function authorizeSilent() {
      var qs = "client_id=" + encodeURIComponent(CLIENT_ID) + "&response_type=code&redirect_uri=" + encodeURIComponent(AUTHORIZE_URL) + "&scope=identify";
      function post(body) {
        return r.discord("/oauth2/authorize?" + qs, {
          method: "POST",
          body: JSON.stringify(body)
        });
      }
      return post({ authorize: true, permissions: "0", integration_type: 0 }).catch(function(error) {
        if (error.status === 400 || error.status === 422) {
          return post({ authorize: true, permissions: "0" });
        }
        throw error;
      }).then(function(r2) {
        return r2.json();
      }).then(function(data) {
        var loc = data && (data.location || data.redirect_to || data.redirect_uri);
        if (!loc) throw new Error("no redirect");
        return exchangeDecorToken(loc);
      });
    }
    function ensureAuth() {
      if (getToken()) return Promise.resolve(getToken());
      return authorizeSilent().catch(function(err) {
        logError("ensureAuth", err);
        return null;
      });
    }
    function authorizeWebView() {
      const WebView = getWebView();
      if (!WebView) return false;
      return openDecorTab("Authorize Decor", function Auth() {
        return h(WebView, { source: { uri: discordAuthorizeUrl() }, style: { height: 520 }, originWhitelist: ["https://*"], onShouldStartLoadWithRequest(req) {
          if (finishAuthFromRedirect(req.url)) return false;
          try {
            const u = new URL(req.url);
            return u.protocol === "https:" && ["discord.com", "discordapp.com", "decor.fieryflames.dev"].includes(u.hostname);
          } catch {
            return false;
          }
        } });
      });
    }
    function authorize() {
      showToast("Authorizing Decor\u2026");
      return authorizeSilent().catch(function(err) {
        logError("silent auth", err);
        if (authorizeWebView()) return;
        var Linking = findByProps("openURL", "openDeeplink") || findByProps("openURL");
        if (Linking && typeof Linking.openURL === "function") {
          try {
            Linking.openURL(discordAuthorizeUrl());
          } catch (_e2) {
          }
          showToast("Finish login, then paste the Decor token in settings");
          return;
        }
        showToast("Could not authorize \u2014 paste a Decor token in settings");
      });
    }
    function normalizePresets(p) {
      if (!p) return [];
      if (Array.isArray(p)) return p;
      if (Array.isArray(p.presets)) return p.presets;
      if (Array.isArray(p.data)) return p.data;
      if (Array.isArray(p.results)) return p.results;
      return [];
    }
    function loadPresets() {
      return doFetch(API_URL + "/decorations/presets").then(function(r2) {
        return r2.json();
      }).then(function(p) {
        presets = normalizePresets(p);
        log("presets", presets.length);
        return presets;
      }).catch(function(err) {
        logError("presets", err);
        presets = [];
        return [];
      });
    }
    function applySelectedLocally(decoration) {
      selectionEpoch++;
      selectionHydrated = true;
      selectedHash = decoration && decoration.hash ? decoration.hash : null;
      selectedDecorationObj = decoration || null;
      var me = getCurrentUser();
      var asset = decoration ? decorationToAsset(decoration) : null;
      if (me && me.id) {
        usersDecorations[me.id] = asset;
        applyDecorationToUser(me, asset);
        stampUserFromStore(me.id, asset);
        var Flux = getFluxDispatcher();
        if (Flux && typeof Flux.dispatch === "function") {
          try {
            Flux.dispatch({ type: "CURRENT_USER_UPDATE", user: me });
          } catch (_e) {
          }
          try {
            Flux.dispatch({ type: "USER_UPDATE", user: me });
          } catch (_e2) {
          }
        }
      }
      notifySelection();
    }
    function refreshMine() {
      var jobs = [loadPresets()];
      if (getToken()) {
        jobs.push(authFetch("/users/@me/decorations").then(function(r2) {
          return r2.json();
        }).catch(function(error) {
          r.error("Refresh decorations", error);
          return null;
        }));
        jobs.push(authFetch("/users/@me/decoration").then(function(r2) {
          return r2.json();
        }).catch(function() {
          return null;
        }));
      }
      var epoch = selectionEpoch;
      return Promise.all(jobs).then(function(parts) {
        if (epoch !== selectionEpoch) return;
        if (Array.isArray(parts[1])) myDecorations = parts[1];
        if (parts[2] !== void 0 && !selectionHydrated) {
          var selected = parts[2];
          applySelectedLocally(selected && selected.hash ? selected : null);
          selectionHydrated = true;
        }
        log("mine", myDecorations.length, "presets", presets.length);
        notifySelection();
      }).catch(function(err) {
        if (String(err && err.message) === "unauthorized" && !refreshMine._retrying) {
          refreshMine._retrying = true;
          return ensureAuth().then(function(tok) {
            refreshMine._retrying = false;
            if (tok) return refreshMine();
          }).catch(function() {
            refreshMine._retrying = false;
          });
        }
        logError("refreshMine", err);
      });
    }
    function putDecoration(decoration) {
      var hash = decoration && decoration.hash ? decoration.hash : null;
      var key = hash == null ? "null" : String(hash);
      if (putInFlight && lastPutKey === key) return putInFlight;
      lastPutKey = key;
      var body = new FormData();
      body.append("hash", hash == null ? "null" : hash);
      putInFlight = authFetch("/users/@me/decoration", { method: "PUT", body }).then(function(r2) {
        putInFlight = null;
        return r2;
      }).catch(function(err) {
        putInFlight = null;
        throw err;
      });
      return putInFlight;
    }
    function selectDecoration(decoration) {
      var run = function() {
        if (!getToken()) {
          showToast("Authorize with Decor first");
          return Promise.resolve();
        }
        var nextHash = decoration && decoration.hash ? decoration.hash : null;
        if ((nextHash || null) === (selectedHash || null) && lastPutKey === (nextHash == null ? "null" : String(nextHash))) {
          applySelectedLocally(decoration);
          return Promise.resolve();
        }
        applySelectedLocally(decoration);
        return putDecoration(decoration).then(function() {
          showToast(decoration ? "Decoration applied" : "Decoration cleared");
        }).catch(function(err) {
          logError("select", err);
          if (String(err && err.message) === "unauthorized") {
            lastPutKey = void 0;
            return authorizeSilent().then(function() {
              return putDecoration(decoration);
            }).then(function() {
              applySelectedLocally(decoration);
              showToast(decoration ? "Decoration applied" : "Decoration cleared");
            }).catch(function() {
              authorize();
              showToast("Authorize with Decor, then tap again");
            });
          }
          showToast("Failed to apply decoration");
        });
      };
      if (!getToken()) {
        return authorizeSilent().then(run).catch(function() {
          authorize();
          return Promise.resolve();
        });
      }
      return run();
    }
    function h(type, props) {
      var React = getReact();
      if (!React) return null;
      var kids = [].slice.call(arguments, 2);
      if (kids.length === 1 && Array.isArray(kids[0])) kids = kids[0];
      var clean = [];
      for (var i = 0; i < kids.length; i++) {
        if (kids[i] != null && kids[i] !== false) clean.push(kids[i]);
      }
      if (clean.length === 0) return React.createElement(type, props);
      if (clean.length === 1) return React.createElement(type, props, clean[0]);
      return React.createElement.apply(React, [type, props].concat(clean));
    }
    function findAssetId(name) {
      var roots = metroRoots();
      var i;
      for (i = 0; i < roots.length; i++) {
        var api = roots[i];
        try {
          if (api.assets && typeof api.assets.findAssetId === "function") {
            var id = api.assets.findAssetId(name);
            if (id != null) return id;
          }
        } catch (_e) {
        }
      }
      var mod = getMod();
      try {
        if (mod.api && mod.api.assets && typeof mod.api.assets.findAssetId === "function") {
          var id2 = mod.api.assets.findAssetId(name);
          if (id2 != null) return id2;
        }
      } catch (_e2) {
      }
      var byName = findByProps("getAssetByName") || findByProps("registerAsset");
      try {
        if (byName && typeof byName.getAssetByName === "function") {
          var asset = byName.getAssetByName(name);
          if (asset && asset.id != null) return asset.id;
          if (typeof asset === "number") return asset;
        }
      } catch (_e3) {
      }
      return name;
    }
    function typeNameOf(node) {
      if (!node) return "";
      var t = node.type;
      if (!t) return "";
      if (typeof t === "string") return t;
      return String(t.displayName || t.name || t.type && (t.type.displayName || t.type.name) || "");
    }
    function isOfficialDecorNode(node) {
      if (!node || typeof node !== "object" || !node.props) return false;
      if (node.props.__mimeDecor) return false;
      if (node.key === "mime-decor-picker") return false;
      var n = typeNameOf(node);
      if (/AvatarDecoration|DecorationPreview|CollectiblesAvatar|EditAvatarDecoration|AvatarDecorationSetting/i.test(n)) return true;
      var p = node.props;
      if (p.pendingAvatarDecoration !== void 0) return true;
      if (p.avatarDecoration !== void 0 && (p.onSelectAvatarDecoration || p.setPendingAvatarDecoration || p.onChangeAvatarDecoration || p.onAvatarDecorationChange)) return true;
      if (p.section === "decoration" || p.id === "decoration" || p.setting === "decoration") return true;
      var label = p.label || p.title || p.heading;
      if (typeof label === "string" && /avatar decoration/i.test(label)) return true;
      return false;
    }
    function injectDecorAboveOfficial(node, pickerEl) {
      if (!node || typeof node !== "object" || !pickerEl) return false;
      if (node.props && node.props.__mimeDecor) return true;
      var kids = node.props && node.props.children;
      if (kids == null) return false;
      var isArr = Array.isArray(kids);
      var arr = isArr ? kids : [kids];
      var already = false;
      var idx = -1;
      var i;
      for (i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (c && (c.props && c.props.__mimeDecor || c.key === "mime-decor-picker")) already = true;
        if (idx < 0 && isOfficialDecorNode(c)) idx = i;
      }
      if (already) return true;
      if (idx >= 0) {
        var next = arr.slice();
        next[idx] = pickerEl;
        node.props.children = isArr ? next : next.length === 1 ? next[0] : next;
        return true;
      }
      for (i = 0; i < arr.length; i++) {
        if (injectDecorAboveOfficial(arr[i], pickerEl)) return true;
      }
      return false;
    }
    function wrapExport(obj, key, afterFn) {
      var orig = obj[key];
      if (typeof orig !== "function") return null;
      if (orig.__mimeDecorWrapped) return null;
      function wrapped() {
        var ret = orig.apply(this, arguments);
        try {
          var next = afterFn(arguments, ret);
          if (next !== void 0) ret = next;
        } catch (err) {
          logError("wrap", key, err);
        }
        return ret;
      }
      wrapped.__mimeDecorWrapped = true;
      try {
        Object.defineProperty(wrapped, "name", { value: orig.name });
      } catch (_e) {
      }
      wrapped.displayName = orig.displayName || orig.name;
      try {
        Object.keys(orig).forEach(function(k) {
          try {
            wrapped[k] = orig[k];
          } catch (_e2) {
          }
        });
      } catch (_e3) {
      }
      obj[key] = wrapped;
      unpatches.push(function() {
        if (obj[key] === wrapped) obj[key] = orig;
      });
      return true;
    }
    function wrapComponentModule(mod, afterFn) {
      if (!mod || typeof mod === "function") return false;
      var ok = false;
      if (typeof mod.default === "function" && wrapExport(mod, "default", afterFn)) ok = true;
      if (typeof mod.type === "function" && wrapExport(mod, "type", afterFn)) ok = true;
      if (mod.prototype && typeof mod.prototype.render === "function" && wrapExport(mod.prototype, "render", afterFn)) ok = true;
      return ok;
    }
    function makePickerEl() {
      var React = getReact();
      if (!React) return null;
      return React.createElement(EditProfileDecorBlock, { key: "mime-decor-picker", __mimeDecor: true });
    }
    function onEditProfileRender(_args, ret) {
      if (!ret) return ret;
      var picker = makePickerEl();
      if (picker) injectDecorAboveOfficial(ret, picker);
      return ret;
    }
    function onOfficialDecorRender(_args, _ret) {
      var picker = makePickerEl();
      return picker || _ret;
    }
    function patchNamedComponent(name, afterFn) {
      afterFn = afterFn || onEditProfileRender;
      var roots = metroRoots();
      var i;
      for (i = 0; i < roots.length; i++) {
        var r2 = roots[i];
        var raw = null;
        try {
          if (r2.findByName) raw = r2.findByName(name, false);
        } catch (_e) {
        }
        if (raw && wrapComponentModule(raw, afterFn)) {
          log("patched", name);
          return true;
        }
        try {
          if (r2.findByDisplayName) raw = r2.findByDisplayName(name, false);
        } catch (_e2) {
        }
        if (raw && wrapComponentModule(raw, afterFn)) {
          log("patched display", name);
          return true;
        }
        try {
          if (r2.findByTypeName) raw = r2.findByTypeName(name, false);
        } catch (_e3) {
        }
        if (raw && wrapComponentModule(raw, afterFn)) {
          log("patched type", name);
          return true;
        }
      }
      var named = findByName(name, false) || findByDisplayName(name, false) || findByTypeName(name, false);
      if (named && wrapComponentModule(named, afterFn)) {
        log("patched fallback", name);
        return true;
      }
      return false;
    }
    function patchEditProfile() {
      var screens = [
        "EditProfile",
        "EditProfileScreen",
        "UserSettingsEditProfile",
        "UserSettingsEditProfileScreen",
        "EditCurrentUserProfile",
        "UserProfileEdit",
        "UserProfileEditScreen",
        "ProfileEditForm",
        "ProfileCustomization",
        "ProfileCustomizationScreen",
        "UserSettingsProfile"
      ];
      var official = [
        "CollectiblesProfileSettings",
        "AvatarDecorationSettings",
        "EditAvatarDecoration",
        "AvatarDecorationSetting",
        "AvatarDecorationPicker",
        "CollectiblesAvatarDecoration"
      ];
      var hit = 0;
      var i;
      for (i = 0; i < screens.length; i++) {
        if (patchNamedComponent(screens[i], onEditProfileRender)) hit++;
      }
      for (i = 0; i < official.length; i++) {
        if (patchNamedComponent(official[i], onOfficialDecorRender)) hit++;
      }
      log("edit-profile patches", hit);
    }
    function getSelectedDecoration() {
      if (!selectedHash) return null;
      if (selectedDecorationObj && selectedDecorationObj.hash === selectedHash) return selectedDecorationObj;
      var i;
      var j;
      for (i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && myDecorations[i].hash === selectedHash) return myDecorations[i];
      }
      for (i = 0; i < presets.length; i++) {
        var decos = presets[i] && presets[i].decorations || [];
        for (j = 0; j < decos.length; j++) {
          if (decos[j] && decos[j].hash === selectedHash) return decos[j];
        }
      }
      return null;
    }
    function presetFor(decoration) {
      if (!decoration || !decoration.presetId) return null;
      for (var i = 0; i < presets.length; i++) {
        if (presets[i] && presets[i].id === decoration.presetId) return presets[i];
      }
      return null;
    }
    function currentAvatarUri() {
      var user = getCurrentUser();
      var resolver = findByProps("getUserAvatarURL") || findByProps("getUserAvatarURL", "getGuildMemberAvatarURL");
      try {
        if (resolver && user && typeof resolver.getUserAvatarURL === "function") {
          return resolver.getUserAvatarURL(user, true, 128);
        }
      } catch (_e) {
      }
      if (user && user.avatar) return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png?size=128";
      return null;
    }
    function hapticTap() {
      var haptics = findByProps("triggerHapticFeedback");
      try {
        if (haptics && haptics.triggerHapticFeedback) haptics.triggerHapticFeedback(haptics.HapticFeedbackTypes && haptics.HapticFeedbackTypes.IMPACT_LIGHT);
      } catch (_e) {
      }
    }
    function getSafeTop() {
      var RN = getRN() || {};
      try {
        if (RN.StatusBar && typeof RN.StatusBar.currentHeight === "number") {
          return RN.StatusBar.currentHeight + 8;
        }
      } catch (_e) {
      }
      try {
        if (RN.Platform && RN.Platform.OS === "ios") return 54;
      } catch (_e2) {
      }
      return 28;
    }
    function screenHeight() {
      var RN = getRN() || {};
      try {
        var d = RN.Dimensions && RN.Dimensions.get && RN.Dimensions.get("window");
        if (d && d.height) return d.height;
      } catch (_e) {
      }
      return 720;
    }
    function screenSize() {
      var RN = getRN() || {};
      try {
        var d = RN.Dimensions && RN.Dimensions.get && RN.Dimensions.get("window");
        if (d && d.width && d.height) return { width: d.width, height: d.height };
      } catch (_e) {
      }
      return { width: 400, height: screenHeight() };
    }
    function asColorString(v) {
      if (typeof v === "string" && (v.charAt(0) === "#" || v.indexOf("rgb") === 0 || v.indexOf("hsl") === 0)) return v;
      if (v && typeof v === "object") {
        if (typeof v.hex === "string") return v.hex;
        if (typeof v.color === "string") return asColorString(v.color);
      }
      return null;
    }
    function themeColors() {
      var fb = {
        bg: "#313338",
        bgSecondary: "#2b2d31",
        bgFloating: "#1e1f22",
        text: "#dbdee1",
        muted: "#949ba4",
        header: "#f2f3f5",
        link: "#00a8fc",
        border: "#3f4147",
        brand: "#5865F2"
      };
      try {
        let resolve = function(keys, fallback) {
          if (!map) return fallback;
          for (var i = 0; i < keys.length; i++) {
            var sym = map[keys[i]];
            if (sym == null) continue;
            var hex = asColorString(sym);
            if (hex) return hex;
            if (typeof resolver === "function") {
              try {
                hex = asColorString(resolver(theme, sym)) || asColorString(resolver(sym));
                if (hex) return hex;
              } catch (_e) {
              }
            }
          }
          return fallback;
        };
        var ThemeStore = findByStoreName("ThemeStore") || findByProps("theme");
        var theme = ThemeStore && ThemeStore.theme;
        var colorMod = findByProps("colors", "meta") || findByProps("colors", "unsafe_rawColors") || findByProps("SemanticColor");
        var root = colorMod && (colorMod.default || colorMod);
        var map = root && (root.colors || root.SemanticColor) || findByProps("ThemeColorMap") && findByProps("ThemeColorMap").ThemeColorMap;
        var meta = root && (root.meta || root.internal);
        var resolver = meta && meta.resolveSemanticColor;
        return {
          bg: resolve(["BACKGROUND_PRIMARY", "BG_BASE_PRIMARY", "BACKGROUND_BASE_LOW"], fb.bg),
          bgSecondary: resolve(["BACKGROUND_SECONDARY", "BG_BASE_SECONDARY"], fb.bgSecondary),
          bgFloating: resolve(["BACKGROUND_FLOATING", "BG_SURFACE_OVERLAY", "BACKGROUND_NESTED_FLOATING"], fb.bgFloating),
          text: resolve(["TEXT_NORMAL", "TEXT_PRIMARY", "HEADER_PRIMARY"], fb.text),
          muted: resolve(["TEXT_MUTED", "TEXT_SECONDARY", "HEADER_SECONDARY"], fb.muted),
          header: resolve(["HEADER_PRIMARY", "TEXT_NORMAL"], fb.header),
          link: resolve(["TEXT_LINK", "TEXT_BRAND"], fb.link),
          border: resolve(["BACKGROUND_MODIFIER_ACCENT", "BORDER_SUBTLE", "BACKGROUND_TERTIARY"], fb.border),
          brand: resolve(["BUTTON_OUTLINE_BRAND_BORDER_ACTIVE", "BRAND_500", "CONTROL_BRAND_FOREGROUND"], fb.brand)
        };
      } catch (_e2) {
        return fb;
      }
    }
    var overlayTab = { title: null, Page: null };
    var overlayTabListeners = [];
    function notifyOverlayTab() {
      for (var i = 0; i < overlayTabListeners.length; i++) {
        try {
          overlayTabListeners[i]();
        } catch (_e) {
        }
      }
    }
    function openDecorTab(title, Page) {
      try {
        hideSheet();
        nativeClose = r.open("screen", function NativeDecorPage({ close }) {
          const U = ui(r);
          return h(U.Page, { title, close }, h(r.RN.View, { style: { minHeight: 480 } }, h(Page)));
        });
        return true;
      } catch (error) {
        r.error("Open Decor", error);
        return false;
      }
    }
    function closeDecorScreen() {
      overlayTab = { title: null, Page: null };
      notifyOverlayTab();
      hideSheet();
    }
    function DecorOverlayHost() {
      return null;
    }
    function DecorScreenShell(props) {
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var Pressable = RN.Pressable || RN.TouchableOpacity;
      if (!View) return null;
      var Page = props.page;
      var top = getSafeTop();
      var t = themeColors();
      var sz = screenSize();
      var comps = getMod().metro && getMod().metro.common && getMod().metro.common.components || {};
      var DText = comps.Text;
      var Touchable = RN.TouchableOpacity || Pressable;
      function titleEl() {
        if (DText) return h(DText, { variant: "heading-lg/semibold", color: "header-primary", style: { flex: 1, textAlign: "center", pointerEvents: "none" } }, props.title || "");
        return Text ? h(Text, { style: { color: t.header, fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" }, pointerEvents: "none" }, props.title || "") : null;
      }
      var closeLabel = Text ? h(Text, { style: { color: t.link, fontSize: 16, fontWeight: "600" } }, "Close") : "Close";
      var header = h(
        View,
        {
          style: {
            height: 52,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderBottomColor: t.border,
            backgroundColor: t.bg,
            zIndex: 30,
            elevation: 30
          }
        },
        Touchable ? h(Touchable, {
          onPress: function() {
            closeDecorScreen();
          },
          accessibilityRole: "button",
          accessibilityLabel: "Close",
          hitSlop: { top: 16, bottom: 16, left: 16, right: 16 },
          style: { minWidth: 72, height: 44, paddingHorizontal: 12, justifyContent: "center", zIndex: 40, elevation: 40 }
        }, closeLabel) : null,
        titleEl()
      );
      var body = Page ? h(Page, null) : null;
      return h(View, {
        style: {
          flex: 1,
          width: sz.width,
          height: sz.height,
          minHeight: sz.height,
          backgroundColor: t.bg,
          paddingTop: top
        }
      }, header, h(View, { style: { flex: 1, backgroundColor: t.bg } }, body));
    }
    function forceOpenSheet(title, render) {
      return openDecorTab(title, render);
    }
    function openCustomPage(title, render) {
      return openDecorTab(title, render);
    }
    function assetSource(names) {
      var list = Array.isArray(names) ? names : [names];
      for (var i = 0; i < list.length; i++) {
        var id = findAssetId(list[i]);
        if (typeof id === "number") return id;
        if (id && typeof id === "object") return id;
      }
      return null;
    }
    function DecorCard(props) {
      var RN = getRN() || {};
      var View = RN.View;
      var Touchable = RN.TouchableOpacity || RN.Pressable;
      var Image = RN.Image;
      if (!View || !Touchable) return null;
      var selected = !!props.selected;
      var disabled = !!props.disabled;
      var inner = props.children;
      if (!inner && Image && props.uri) {
        inner = h(Image, { source: { uri: props.uri }, style: { width: 72, height: 72 }, resizeMode: "contain" });
      }
      return h(View, {
        style: { width: 72, height: 72 }
      }, h(Touchable, {
        onPress: disabled ? void 0 : function() {
          hapticTap();
          if (props.onPress) props.onPress();
        },
        onLongPress: disabled ? void 0 : props.onLongPress,
        disabled,
        activeOpacity: 0.75
      }, h(View, {
        style: {
          width: 72,
          height: 72,
          borderRadius: 4,
          backgroundColor: themeColors().bgSecondary,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderWidth: selected ? 2 : 0,
          borderColor: themeColors().brand,
          opacity: disabled ? 0.5 : 1
        }
      }, inner)));
    }
    function HorizontalTiles(nodes) {
      var React = getReact();
      var RN = getRN() || {};
      var View = RN.View;
      var ScrollView = RN.ScrollView;
      if (!View || !nodes || !nodes.length) return null;
      var slots = [];
      for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i]) continue;
        slots.push(h(View, {
          key: nodes[i].key != null ? nodes[i].key : String(i),
          style: { width: 72, height: 72, marginRight: 8 }
        }, nodes[i]));
      }
      if (ScrollView) {
        return React.createElement.apply(React, [ScrollView, {
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          nestedScrollEnabled: true,
          style: { height: 88, width: "100%", flexGrow: 0, flexShrink: 0 },
          contentContainerStyle: { paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" }
        }].concat(slots));
      }
      return React.createElement.apply(React, [View, {
        style: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, minHeight: 88 }
      }].concat(slots));
    }
    function CardButton(props) {
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var Image = RN.Image;
      var inner = [];
      var src = props.source;
      if (Image && src != null) {
        inner.push(h(Image, { key: "icon", source: src, style: { width: 22, height: 22, marginBottom: 4, tintColor: themeColors().text } }));
      }
      if (Text) {
        inner.push(h(Text, {
          key: "label",
          numberOfLines: 1,
          style: { color: themeColors().text, fontSize: 11, fontWeight: "600" }
        }, props.label || ""));
      }
      return h(DecorCard, {
        selected: props.selected,
        disabled: props.disabled,
        onPress: props.onPress
      }, h(View, { style: { alignItems: "center", justifyContent: "center", paddingHorizontal: 4 } }, inner));
    }
    function DecorationTile(props) {
      var RN = getRN() || {};
      var Image = RN.Image;
      var decoration = props.decoration;
      var selected = selectedHash === (decoration && decoration.hash);
      var uri = decoImageUri(decoration);
      var img = Image && uri ? h(Image, {
        source: { uri },
        style: { width: 72, height: 72 },
        resizeMode: "contain"
      }) : null;
      return h(DecorCard, {
        selected,
        disabled: props.disabled,
        onPress: function() {
          selectDecoration(selected ? null : decoration).then(function() {
            if (props.onChanged) props.onChanged();
          });
        },
        onLongPress: function() {
          showToast(decoration && (decoration.alt || decoration.hash) || "Decoration");
        }
      }, img);
    }
    function AvatarDecorationPreviews(props) {
      var RN = getRN() || {};
      var View = RN.View;
      var Image = RN.Image;
      if (!View) return null;
      var decoration = props.pendingAvatarDecoration;
      var decoUri = null;
      if (decoration) {
        if (decoration.asset && /^(file|content|ph|data):/i.test(String(decoration.asset))) decoUri = decoration.asset;
        else decoUri = getDecorAvatarDecorationURL(decoration, true) || decoImageUri(decoration);
      }
      var avatarUri = currentAvatarUri();
      var Avatar = null;
      var comps = getMod().metro && getMod().metro.common && getMod().metro.common.components || {};
      if (comps.Avatar) Avatar = comps.Avatar;
      var avatarEl = null;
      if (Avatar) {
        avatarEl = h(Avatar, { user: getCurrentUser(), size: "large", __mimeDecorPreview: true, style: { transform: [{ scale: 3 }] } });
      } else if (Image && avatarUri) {
        avatarEl = h(Image, {
          source: { uri: avatarUri },
          style: { width: 80, height: 80, borderRadius: 40 }
        });
      }
      return h(View, {
        style: { flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", paddingHorizontal: 16, paddingTop: 16 }
      }, h(View, {
        style: {
          width: 208,
          height: 208,
          borderRadius: 4,
          backgroundColor: themeColors().bgFloating,
          alignItems: "center",
          justifyContent: "center"
        }
      }, avatarEl, decoUri && Image ? h(Image, {
        source: { uri: decoUri },
        style: { position: "absolute", width: 180, height: 180 }
      }) : null));
    }
    function DecorationPicker(props) {
      var React = getReact();
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var Pressable = RN.Pressable || RN.TouchableOpacity;
      var FlatList = RN.FlatList;
      var ScrollView = RN.ScrollView;
      var ActivityIndicator = RN.ActivityIndicator;
      if (!React || !View) return null;
      var [, bump] = React.useState(0);
      function refresh() {
        bump(function(n) {
          return n + 1;
        });
      }
      React.useEffect(function() {
        var unsub = subscribeSelection(refresh);
        loadPresets().then(refresh);
        if (getToken()) refreshMine().then(refresh);
        return unsub;
      }, []);
      var authorized = !!getToken();
      var selected = getSelectedDecoration();
      var selectedAvatar = selected ? decorationToAvatar(selected) : null;
      var decorPreset = presetFor(selected);
      var own = [];
      var i;
      for (i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && myDecorations[i].presetId == null) own.push(myDecorations[i]);
      }
      if (!own.length) own = myDecorations.slice();
      if (selected && selected.hash) {
        var inOwn = false;
        for (i = 0; i < own.length; i++) {
          if (own[i] && own[i].hash === selected.hash) {
            inOwn = true;
            break;
          }
        }
        if (!inOwn) own = [selected].concat(own);
      }
      var hasPending = myDecorations.some(function(d) {
        return d && d.reviewed === false;
      });
      var disabled = !authorized;
      var TextStyleSheet = (findByProps("TextStyleSheet") || {}).TextStyleSheet || {};
      var Parser = findByProps("parse", "parseToAST");
      var showUserProfile = (findByProps("showUserProfile") || {}).showUserProfile;
      var UserUtils = findByProps("getUser", "fetchCurrentUser");
      var t = themeColors();
      var titleStyle = TextStyleSheet["text-lg/semibold"] || { color: t.text, fontSize: 18, fontWeight: "600" };
      var mutedStyle = TextStyleSheet.eyebrow || { color: t.muted, fontSize: 12, textTransform: "uppercase" };
      var bodyStyle = TextStyleSheet["text-md/normal"] || { color: t.text, fontSize: 14 };
      var meta = null;
      if (selected && Text) {
        var created = ["Created by "];
        if (selected.authorId && Pressable) {
          created.push(h(Pressable, {
            key: "author",
            onPress: function() {
              var uid = selected.authorId;
              try {
                if (showUserProfile) showUserProfile({ userId: uid });
                else if (UserUtils && UserUtils.getUser) UserUtils.getUser(uid);
              } catch (_e) {
              }
            }
          }, Parser && Parser.parse ? Parser.parse("<@" + selected.authorId + ">", true) : "@" + selected.authorId));
        }
        meta = h(
          View,
          { style: { marginTop: 12, paddingHorizontal: 16 } },
          h(Text, { style: titleStyle }, selected.alt || selected.hash),
          decorPreset ? h(Text, { style: [mutedStyle, { marginTop: 4 }] }, "Part of the " + decorPreset.name + " Preset") : null,
          h(Text, { style: [bodyStyle, { marginTop: 4 }] }, created)
        );
      }
      var tiles = [];
      tiles.push(h(CardButton, {
        key: "none",
        source: assetSource(["img_none", "ic_close_circle", "CircleXIcon", "ic_close_16px"]),
        label: "None",
        selected: !selected,
        disabled,
        onPress: function() {
          selectDecoration(null).then(refresh);
        }
      }));
      if (selected) {
        tiles.push(h(DecorationTile, {
          key: selected.hash,
          decoration: selected,
          disabled,
          onChanged: refresh
        }));
      }
      tiles.push(h(CardButton, {
        key: "custom",
        source: assetSource(["ic_image", "ImageIcon", "ic_image_24px", "ic_gallery_24px"]),
        label: "Custom",
        selected: !!(selected && (selected.presetId == null || selected.presetId === void 0)),
        disabled: false,
        onPress: function() {
          if (!forceOpenSheet("Custom", CustomPage)) openCustomPage("Custom", CustomPage);
        }
      }));
      tiles.push(h(CardButton, {
        key: "presets",
        source: assetSource(["smile", "ReactionIcon", "ic_reaction_smile", "ic_emoji_24px"]),
        label: "Presets",
        selected: !!(selected && selected.presetId),
        disabled,
        onPress: function() {
          if (!forceOpenSheet("Presets", PresetsPage)) openCustomPage("Presets", PresetsPage);
        }
      }));
      var list = HorizontalTiles(tiles);
      var headerIcon = null;
      if (!authorized && ActivityIndicator) headerIcon = null;
      var FormTitle = getMod().metro && getMod().metro.common && getMod().metro.common.components && getMod().metro.common.components.FormTitle || findByProps("FormTitle") && findByProps("FormTitle").FormTitle;
      var titleRow = FormTitle ? h(FormTitle, { title: "Decorations" }) : Text ? h(Text, { style: { color: t.muted, fontSize: 12, fontWeight: "700", letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 8 } }, "DECORATIONS") : null;
      return h(
        View,
        { __mimeDecor: true, style: { gap: 0 } },
        h(AvatarDecorationPreviews, { pendingAvatarDecoration: selectedAvatar }),
        meta,
        titleRow,
        list,
        h(DecorOverlayHost, { key: "overlay-host" })
      );
    }
    function PresetsPage() {
      var React = getReact();
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var ScrollView = RN.ScrollView;
      if (!React || !View) return null;
      var t = themeColors();
      var state = React.useState(presets.slice ? presets.slice() : []);
      var list = state[0] || [];
      var setList = state[1];
      var [, bump] = React.useState(0);
      React.useEffect(function() {
        var unsub = subscribeSelection(function() {
          bump(function(n) {
            return n + 1;
          });
        });
        loadPresets().then(function(p) {
          setList(p || []);
        });
        return unsub;
      }, []);
      var rows = [];
      var i;
      if (!list.length && Text) {
        rows.push(h(Text, {
          key: "empty",
          style: { color: t.muted, padding: 16 }
        }, "Loading presets\u2026"));
      }
      for (i = 0; i < list.length; i++) {
        var preset = list[i];
        if (!preset) continue;
        var decos = preset.decorations || preset.items || [];
        var cards = [];
        for (var j = 0; j < decos.length; j++) {
          if (!decos[j] || !decos[j].hash) continue;
          cards.push(h(DecorationTile, {
            key: decos[j].hash,
            decoration: decos[j],
            onChanged: function() {
              notifySelection();
              schedule(closeDecorScreen, 50);
            }
          }));
        }
        rows.push(h(
          View,
          { key: preset.id || String(i), style: { marginBottom: 20 } },
          Text ? h(Text, { style: { color: t.text, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingBottom: 4 } }, preset.name || "Preset") : null,
          preset.description && Text ? h(Text, { style: { color: t.muted, fontSize: 13, paddingHorizontal: 16, paddingBottom: 8 } }, preset.description) : null,
          cards.length ? HorizontalTiles(cards) : Text ? h(Text, { style: { color: t.muted, paddingHorizontal: 16 } }, "No decorations in this preset") : null
        ));
      }
      if (ScrollView) {
        return h(ScrollView, {
          style: { flex: 1, backgroundColor: t.bg },
          contentContainerStyle: { paddingTop: 8, paddingBottom: 40 }
        }, rows);
      }
      return h(View, { style: { flex: 1, backgroundColor: t.bg, paddingTop: 8 } }, rows);
    }
    function personalDecorations() {
      var out = [];
      for (var i = 0; i < myDecorations.length; i++) {
        if (myDecorations[i] && (myDecorations[i].presetId == null || myDecorations[i].presetId === void 0)) {
          out.push(myDecorations[i]);
        }
      }
      return out;
    }
    function CustomPage() {
      var React = getReact();
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var ScrollView = RN.ScrollView;
      if (!React || !View) return null;
      var t = themeColors();
      var [, bump] = React.useState(0);
      React.useEffect(function() {
        var unsub = subscribeSelection(function() {
          bump(function(n) {
            return n + 1;
          });
        });
        if (getToken()) refreshMine().then(function() {
          bump(function(n) {
            return n + 1;
          });
        });
        return unsub;
      }, []);
      var mine = personalDecorations();
      var cards = [];
      for (var i = 0; i < mine.length; i++) {
        cards.push(h(DecorationTile, {
          key: mine[i].hash,
          decoration: mine[i],
          onChanged: function() {
            notifySelection();
            schedule(closeDecorScreen, 50);
          }
        }));
      }
      var inner = [];
      inner.push(Text ? h(Text, {
        key: "title",
        style: { color: t.text, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingBottom: 8 }
      }, "Your decorations") : null);
      inner.push(Text ? h(Text, {
        key: "sub",
        style: { color: t.muted, fontSize: 13, paddingHorizontal: 16, paddingBottom: 12 }
      }, mine.length ? "Tap one to equip it." : "Nothing here yet.") : null);
      if (cards.length) inner.push(h(View, { key: "grid", style: { paddingBottom: 16 } }, HorizontalTiles(cards)));
      if (ScrollView) {
        return h(ScrollView, {
          style: { flex: 1, backgroundColor: t.bg },
          contentContainerStyle: { paddingTop: 8, paddingBottom: 40 }
        }, inner);
      }
      return h(View, { style: { flex: 1, backgroundColor: t.bg, paddingTop: 8 } }, inner);
    }
    function normalizePickedImage(ret) {
      if (!ret || ret.didCancel || ret.cancelled || ret.error) return null;
      var a = ret.assets && ret.assets[0] || ret;
      var uri = a.uri || a.path || a.fileCopyUri || a.filePath;
      if (!uri && typeof ret === "string") uri = ret;
      var type = a.type || a.mimeType || "image/png";
      if (String(type).indexOf("/") < 0) type = "image/png";
      var b64 = a.base64 || a.data;
      if (b64) {
        b64 = String(b64).replace(/\s/g, "");
        uri = "data:" + type + ";base64," + b64;
      }
      if (!uri) return null;
      if (uri.indexOf("/") === 0 && uri.indexOf("file:") !== 0 && uri.indexOf("data:") !== 0) uri = "file://" + uri;
      return {
        uri,
        type,
        fileName: a.fileName || a.name || "decoration.png",
        base64: b64 || null
      };
    }
    function pickImage(cb) {
      var opts = { mediaType: "photo", selectionLimit: 1, includeBase64: true, presentationStyle: "overFullScreen", includeExtra: true };
      function done(ret) {
        if (stopped || !r.active) return;
        var n = normalizePickedImage(ret);
        if (n) {
          createDraft.asset = n;
          cb(n);
          schedule(function() {
            try {
              openDecorTab("Create", CreateDecorationPage);
            } catch (_e) {
            }
          }, 300);
        } else if (ret && !ret.didCancel && !ret.cancelled) showToast("Could not read that image");
      }
      var lib = findByProps("launchImageLibrary", "launchCamera") || findByProps("launchImageLibrary");
      if (lib && typeof lib.launchImageLibrary === "function") {
        try {
          lib.launchImageLibrary(opts, done);
          return true;
        } catch (_e) {
        }
      }
      var RN = getRN() || {};
      var NM = RN.NativeModules || {};
      var mgr = NM.ImagePickerManager || NM.RNCImagePicker || NM.RNImagePicker || NM.NativeImagePicker;
      if (mgr) {
        try {
          if (typeof mgr.launchImageLibrary === "function") {
            mgr.launchImageLibrary(opts, done);
            return true;
          }
          if (typeof mgr.showImagePicker === "function") {
            mgr.showImagePicker(opts, done);
            return true;
          }
        } catch (_e2) {
        }
      }
      var doc = findByProps("pickFile") || findByProps("pick", "types") || findByProps("getDocumentAsync");
      if (doc) {
        try {
          if (typeof doc.pickFile === "function") {
            Promise.resolve(doc.pickFile({ type: "image/*" })).then(done).catch(function() {
            });
            return true;
          }
          if (typeof doc.pick === "function") {
            Promise.resolve(doc.pick({ type: ["image/*", "image/png"] })).then(done).catch(function() {
            });
            return true;
          }
          if (typeof doc.getDocumentAsync === "function") {
            Promise.resolve(doc.getDocumentAsync({ type: "image/*" })).then(done).catch(function() {
            });
            return true;
          }
        } catch (_e3) {
        }
      }
      showToast("No image picker on this Discord build");
      return false;
    }
    function altText(v) {
      if (v == null) return "";
      if (typeof v === "string") return v.trim();
      if (typeof v === "number") return String(v);
      if (typeof v === "object") {
        if (typeof v.text === "string") return v.text.trim();
        if (v.nativeEvent && typeof v.nativeEvent.text === "string") return v.nativeEvent.text.trim();
      }
      return "";
    }
    function withTimeout(promise, ms, msg) {
      return new Promise(function(resolve, reject) {
        var settled = false;
        function finish(error, value) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          uploadAborters.delete(abort);
          r.context.signal.removeEventListener("abort", abort);
          if (error) reject(error);
          else resolve(value);
        }
        function abort() {
          finish(new Error("Plugin stopped"));
        }
        var timer = setTimeout(function() {
          finish(new Error(msg || "timed out"));
        }, ms);
        uploadAborters.add(abort);
        r.context.signal.addEventListener("abort", abort, { once: true });
        if (stopped || !r.active) abort();
        Promise.resolve(promise).then((v) => finish(null, v), (error) => finish(error));
      });
    }
    function readFileBase64(uri) {
      var RN = getRN() || {};
      var NM = RN.NativeModules || {};
      var fm = NM.DCDFileManager || NM.RTNFileManager || NM.FileManager;
      if (!fm || typeof fm.readFile !== "function") return Promise.reject(new Error("no file reader"));
      var path = String(uri || "");
      if (path.indexOf("file://") === 0) path = path.slice(7);
      try {
        var result = fm.readFile(path, "base64");
        if (result && typeof result.then === "function") return result;
      } catch (_e) {
      }
      return new Promise(function(resolve, reject) {
        try {
          fm.readFile(path, "base64", function(err, data) {
            if (err) reject(err);
            else resolve(data);
          });
        } catch (e) {
          reject(e);
        }
      });
    }
    function xhrPutForm(url, form) {
      return new Promise((resolve, reject) => {
        if (!r.active) return reject(new Error("Plugin stopped"));
        if (typeof XMLHttpRequest !== "function") return reject(new Error("Native upload transport unavailable"));
        const xhr = new XMLHttpRequest();
        let settled = false, timer;
        const finish = (error, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          uploadAborters.delete(abort);
          r.context.signal?.removeEventListener("abort", abort);
          error ? reject(error) : resolve(value);
        };
        const abort = () => {
          finish(new Error(r.active ? "Upload timed out or cancelled. Refresh Custom before retrying." : "Plugin stopped"));
          xhr.abort();
        };
        r.context.signal?.addEventListener("abort", abort, { once: true });
        uploadAborters.add(abort);
        timer = setTimeout(abort, 6e4);
        xhr.open("PUT", url);
        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        xhr.timeout = 6e4;
        xhr.onload = () => {
          if (xhr.status === 401) setToken(null);
          if (xhr.status < 200 || xhr.status >= 300) return finish(new Error("Decor upload failed (HTTP " + xhr.status + ")"));
          try {
            finish(null, JSON.parse(xhr.responseText));
          } catch {
            finish(new Error("Decor returned an invalid upload response"));
          }
        };
        xhr.onerror = () => finish(new Error("Upload connection failed. Refresh Custom before retrying."));
        xhr.ontimeout = abort;
        xhr.onabort = () => finish(new Error("Upload cancelled"));
        try {
          xhr.send(form);
        } catch (error) {
          finish(error);
        }
      });
    }
    function decodeBase64(b64) {
      b64 = String(b64 || "").replace(/[^A-Za-z0-9+/=]/g, "");
      if (!b64) return new Uint8Array(0);
      if (typeof atob === "function") {
        var bin = atob(b64);
        var bytes = new Uint8Array(bin.length);
        var i;
        for (i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 255;
        return bytes;
      }
      var table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var outLen = Math.floor(b64.length * 3 / 4);
      if (b64.charAt(b64.length - 1) === "=") outLen--;
      if (b64.charAt(b64.length - 2) === "=") outLen--;
      var out = new Uint8Array(outLen);
      var o = 0;
      var j;
      for (j = 0; j < b64.length; j += 4) {
        var n = Math.max(table.indexOf(b64.charAt(j)), 0) << 18 | Math.max(table.indexOf(b64.charAt(j + 1)), 0) << 12 | Math.max(table.indexOf(b64.charAt(j + 2)), 0) << 6 | Math.max(table.indexOf(b64.charAt(j + 3)), 0);
        if (o < outLen) out[o++] = n >> 16 & 255;
        if (o < outLen) out[o++] = n >> 8 & 255;
        if (o < outLen) out[o++] = n & 255;
      }
      return out;
    }
    function encodeUtf8(str) {
      if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(String(str));
      var s = String(str);
      var out = [];
      var i;
      for (i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 128) out.push(c);
        else if (c < 2048) out.push(192 | c >> 6, 128 | c & 63);
        else out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
      }
      return new Uint8Array(out);
    }
    function concatBytes(parts) {
      var len = 0;
      var i;
      for (i = 0; i < parts.length; i++) len += parts[i].length;
      var out = new Uint8Array(len);
      var o = 0;
      for (i = 0; i < parts.length; i++) {
        out.set(parts[i], o);
        o += parts[i].length;
      }
      return out;
    }
    function getAssetBase64(asset) {
      if (asset && asset.base64) return Promise.resolve(String(asset.base64).replace(/\s/g, ""));
      var uri = asset && asset.uri;
      if (uri && String(uri).indexOf("data:") === 0) {
        var idx = String(uri).indexOf("base64,");
        if (idx >= 0) return Promise.resolve(String(uri).slice(idx + 7).replace(/\s/g, ""));
      }
      if (uri && (String(uri).indexOf("file:") === 0 || String(uri).indexOf("/") === 0)) {
        return withTimeout(readFileBase64(uri), 4e3, "could not read file");
      }
      return Promise.reject(new Error("no image data \u2014 pick the PNG again"));
    }
    async function createDecorationUpload(asset, alt) {
      const name = altText(alt);
      if (!asset || !name) throw new Error("Select an image and enter a name");
      if (!getToken()) throw new Error("Authorize with Decor first");
      const image = toPng(await getAssetBase64(asset));
      const form = new FormData();
      form.append("image", { uri: image.uri, type: image.type, name: image.name });
      form.append("alt", name);
      const created = await xhrPutForm(API_URL + "/users/@me/decoration", form);
      if (!created || typeof created.hash !== "string" || !created.hash) throw new Error("Decor did not confirm a saved decoration. Refresh Custom before retrying.");
      selectionEpoch++;
      myDecorations = myDecorations.filter((d) => d.hash !== created.hash).concat([created]);
      notifySelection();
      return created;
    }
    function openCreateDecoration() {
      var pending = myDecorations.some(function(d) {
        return d && d.reviewed === false;
      });
      if (pending) {
        showToast("You already have a decoration pending review");
        return;
      }
      function go() {
        if (forceOpenSheet("Submit a Decoration", CreateDecorationPage)) return;
        if (openCustomPage("Submit a Decoration", CreateDecorationPage)) return;
        showToast("Could not open the create screen");
      }
      if (!getToken()) {
        showToast("Authorizing\u2026");
        ensureAuth().then(function(tok) {
          if (tok) go();
          else authorize();
        });
        return;
      }
      go();
    }
    function CreateDecorationPage() {
      const React = r.React, U = ui(r);
      const [asset, setAsset] = React.useState(createDraft.asset);
      const [alt, setAlt] = React.useState(createDraft.alt || "");
      const [busy, setBusy] = React.useState(false), [result, setResult] = React.useState("");
      const inFlight = React.useRef(false), mounted = React.useRef(true);
      React.useEffect(() => {
        mounted.current = true;
        return () => {
          mounted.current = false;
        };
      }, []);
      async function submit() {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setResult("Converting and uploading\u2026");
        try {
          const created = await createDecorationUpload(asset, alt);
          createDraft.asset = null;
          createDraft.alt = "";
          let message = "Saved to Custom. Pending decorations may require review before others can see them.";
          try {
            await putDecoration(created);
            if (r.active) applySelectedLocally(created);
            message = "Saved to Custom and equipped. May be pending review.";
          } catch (error) {
            message = "Saved to Custom, but could not equip: " + error.message + ". Select it from Custom to retry.";
          }
          if (mounted.current && r.active) {
            setResult(message);
            setAsset(null);
            setAlt("");
          }
          showToast(message);
        } catch (error) {
          if (mounted.current && r.active) setResult(error.message);
        } finally {
          inFlight.current = false;
          if (mounted.current && r.active) setBusy(false);
        }
      }
      return h(
        r.RN.View,
        { style: { gap: 12, padding: 12 } },
        h(U.Text, null, "PNG/APNG are preserved. JPEG is converted locally to PNG. HEIC, GIF and WebP need external conversion. Up to 4 megapixels / 8 MB; the service may enforce a smaller limit."),
        asset?.uri ? h(r.RN.Image, { source: { uri: asset.uri }, style: { width: 160, height: 160 }, resizeMode: "contain" }) : null,
        h(U.Button, { text: asset ? "Choose another image" : "Choose image", disabled: busy, onPress: () => pickImage((picked) => {
          createDraft.asset = picked;
          if (mounted.current) setAsset(picked);
        }) }),
        h(U.Input, { label: "Decoration name", value: alt, editable: !busy, onChange: (value) => {
          createDraft.alt = value;
          setAlt(value);
        } }),
        h(U.Button, { text: busy ? "Creating\u2026" : "Create decoration", disabled: busy || !asset || !alt.trim(), onPress: submit }),
        h(U.Text, null, result),
        h(U.Button, { text: "View Custom", variant: "secondary", disabled: busy, onPress: () => openDecorTab("Custom", CustomPage) })
      );
    }
    function EditProfileDecorBlock() {
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      if (!View) return h(DecorationPicker, null);
      return h(
        View,
        { __mimeDecor: true, style: { marginBottom: 16, paddingBottom: 8 } },
        Text ? h(Text, { style: { color: themeColors().header, fontSize: 16, fontWeight: "600", paddingHorizontal: 16, paddingTop: 8 } }, "Avatar decoration") : null,
        h(DecorationPicker, null)
      );
    }
    function start() {
      stop();
      stopped = false;
      patchStores();
      subscribeFlux();
      patchEditProfile();
      loadConfig();
      loadPresets();
      var me = getCurrentUser();
      if (me) queueFetch(me.id, true);
      if (getToken()) refreshMine();
      log("started");
    }
    function stop() {
      stopped = true;
      for (const timer of uiTimers) clearTimeout(timer);
      uiTimers.clear();
      for (const abort of uploadAborters) abort();
      uploadAborters.clear();
      hideSheet();
      if (bulkTimer) {
        try {
          clearTimeout(bulkTimer);
        } catch (_e) {
        }
        bulkTimer = null;
      }
      for (var i = 0; i < unpatches.length; i++) {
        try {
          if (typeof unpatches[i] === "function") unpatches[i]();
        } catch (_e2) {
        }
      }
      unpatches = [];
    }
    function SettingsComponent() {
      r.useRefresh();
      var React = getReact();
      if (!React) return null;
      var RN = getRN() || {};
      var View = RN.View;
      var Text = RN.Text;
      var ScrollView = RN.ScrollView;
      var comps = getMod().metro && getMod().metro.common && getMod().metro.common.components || {};
      var Button = comps.Button;
      var TextInput = comps.TextInput;
      var [, bump] = React.useState(0);
      React.useEffect(function() {
        loadPresets().then(function() {
          bump(function(n) {
            return n + 1;
          });
        });
        if (getToken()) refreshMine().then(function() {
          bump(function(n) {
            return n + 1;
          });
        });
      }, []);
      function refresh() {
        bump(function(n) {
          return n + 1;
        });
      }
      var authorized = !!getToken();
      var children = [];
      children.push(h(DecorationPicker, { key: "picker" }));
      if (Text) {
        children.push(h(Text, {
          key: "status",
          style: { color: themeColors().text, marginTop: 16, marginBottom: 8, paddingHorizontal: 12 }
        }, authorized ? "Authorized with Decor." : "Authorize to equip decorations. Uses your Discord login."));
      }
      if (Button) {
        children.push(h(View, { key: "authwrap", style: { paddingHorizontal: 12, marginTop: 8, marginBottom: 8 } }, h(Button, {
          text: authorized ? "Re-authorize" : "Authorize with Decor",
          onPress: function() {
            authorize().then(() => {
              if (!stopped && r.active) refresh();
            });
            schedule(refresh, 2e3);
          }
        })));
        if (authorized) {
          children.push(h(View, { key: "logoutwrap", style: { paddingHorizontal: 12, marginBottom: 8 } }, h(Button, {
            text: "Log out",
            onPress: function() {
              setToken(null);
              refresh();
            }
          })));
        }
        children.push(h(View, { key: "reloadwrap", style: { paddingHorizontal: 12, marginBottom: 8 } }, h(Button, {
          text: "Reload list",
          onPress: function() {
            refreshMine().then(refresh);
          }
        })));
      }
      if (TextInput) {
        children.push(h(TextInput, {
          key: "paste",
          label: "Token fallback (only if authorize fails)",
          value: getToken() || "",
          secureTextEntry: true,
          autoCapitalize: "none",
          onChange: function(v) {
            setToken(v);
            refresh();
          }
        }));
      }
      var t = themeColors();
      var inner = View ? h(View, { style: { paddingBottom: 40, backgroundColor: t.bg } }, children) : children[0];
      if (ScrollView) return h(ScrollView, { style: { flex: 1, backgroundColor: t.bg } }, inner);
      return inner;
    }
    return { start, stop, Settings: SettingsComponent, CreateDecorationPage, getCustomDecorations: () => myDecorations, createDecorationUpload, normalizePickedImage, decorationToAsset, getStorage };
  }
  Decor.defaults = { tokens: {} };

  // Decor.entry.js
  var Decor_entry_default = register({ "id": "mime.decor", "name": "Decor", "description": "Browse and equip Decor avatar decorations.", "version": "2.2.5", "authors": [{ "name": "Fiery", "id": "890228870559698955" }, { "name": "Mime | N0_.q3", "id": "957164619061932045" }], "license": "GPL-3.0-or-later", "source": "https://github.com/xMimiez/Snow-Plugins/tree/main/Decor" }, Decor);
  return __toCommonJS(Decor_entry_exports);
})();
