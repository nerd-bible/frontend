"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normal = exports.primitive = exports.boolean = exports.rowId = exports.intId = exports.rowNumber = void 0;
exports.recordConllu = recordConllu;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var z = require("../src/index");
exports.rowNumber = z.number().gt(0);
exports.intId = z.codecs.number().gt(0);
exports.rowId = z.union([
    // Normal integer like 1, 2
    exports.intId,
    // Multiword token like 1-4 or 1.2-4.2
    z
        .string()
        .regex(/[1-9][0-9]*\.\d+-\d+\.\d+/),
]);
exports.boolean = z.codecs.boolean({
    true: ["yes", "true"],
    false: ["no", "false"],
});
exports.primitive = z.union([z.string(), exports.boolean, z.codecs.number()]);
function recordConllu(delims) {
    if (delims === void 0) { delims = { prop: "|", value: "=" }; }
    return z.codecs.custom(z.string(), z.record(z.string(), exports.primitive), {
        decode: function (value, ctx) {
            var success = true;
            var output = {};
            var length = ctx.jsonPath.length;
            for (var _i = 0, _a = value.split(delims.prop); _i < _a.length; _i++) {
                var cur = _a[_i];
                // 14:nmod:into
                var index = cur.indexOf(delims.value);
                var k = index == -1 ? cur : cur.substring(0, index);
                if (!k)
                    continue;
                var v = index == -1 ? "" : cur.substring(index + 1);
                ctx.jsonPath[length] = k;
                var decoded = exports.primitive.decode(v, ctx);
                if (decoded.success)
                    output[k] = decoded.output;
                else
                    success = false;
            }
            ctx.jsonPath.length = length;
            if (!success)
                return { success: success, errors: ctx.errors };
            return { success: success, output: output };
        },
        encode: function (v) {
            var entries = Object.entries(v);
            if (!entries.length)
                return { success: true, output: "_" };
            return {
                success: true,
                output: entries
                    .map(function (_a) {
                    var k = _a[0], v = _a[1];
                    return "".concat(k).concat(delims.value).concat(v);
                })
                    .join(delims.prop),
            };
        },
    });
}
var word = z.object({
    id: exports.rowId,
    form: z.string(),
    lemma: z.string(),
    upos: z.string(),
    xpos: z.string(),
    feats: recordConllu(),
    head: z.codecs.number(),
    deprel: z.string(),
    deps: recordConllu({ prop: "|", value: ":" }),
    //.pipe(z.record(z.codecs.number().gte(0), primitive)),
    misc: recordConllu(),
});
var columns = Object.keys(word.shape);
var wordConllu = z.codecs.custom(z.string(), word, {
    decode: function (v, ctx) {
        var split = v
            .split("\t")
            // spec is unclear what a missing _ means
            // the _ are there for readability in editors that don't show whitespace
            .map(function (v) { return (v == "_" ? "" : v); });
        var res = {};
        for (var i = 0; i < columns.length; i++)
            res[columns[i]] = split[i];
        return word.decode(res, ctx);
    },
    encode: function (value) {
        var output = "";
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var c = columns_1[_i];
            var v = value[c];
            if (v === "")
                output += "_";
            else {
                var encoded = word.shape[c].encode(v);
                if (!encoded.success)
                    return encoded;
                output += encoded.output;
            }
            if (c != "misc")
                output += "\t";
        }
        return { success: true, output: output };
    },
});
var headers = z.record(z.string(), z.union([z.string(), z.undefined()])).pipe(z
    .object({
    sent_id: z.string().minLength(1),
    text: z.string().minLength(1),
})
    .loose());
var headerPrefix = "# ";
var headersConllu = z.codecs.custom(z.string(), headers, {
    decode: function (str, ctx) {
        var kvs = {};
        var lines = str.split(/\r?\n/);
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            line = line.substring(headerPrefix.length);
            var i = line.indexOf("=");
            if (i == -1) {
                kvs[line] = undefined;
            }
            else {
                kvs[line.substring(0, i).trim()] = line.substring(i + 1).trim();
            }
            ctx.jsonPath[0] += 1;
        }
        return headers.decode(kvs);
    },
    encode: function (obj) {
        var output = "";
        for (var k in obj) {
            output += "# ".concat(k);
            if (obj[k] != null)
                output += " = ".concat(obj[k]);
            output += "\n";
        }
        return { success: true, output: output };
    },
});
var sentence = z.object({ headers: headers, words: z.array(word) });
var sentenceConllu = z.codecs.custom(z.string(), sentence, {
    decode: function (str, ctx) {
        var headersEnd = str.match(/^[^#]/m);
        var output = {
            headers: {},
            words: [],
        };
        if (headersEnd === null || headersEnd === void 0 ? void 0 : headersEnd.index) {
            var headerSection = str.substring(0, headersEnd.index - 1);
            str = str.substring(headersEnd.index);
            var decoded = headersConllu.decode(headerSection, ctx);
            if (!decoded.success)
                return decoded;
            output.headers = decoded.output;
        }
        var lines = str.split(/\r?\n/);
        for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
            var line = lines_2[_i];
            if (line) {
                var decoded = wordConllu.decode(line, ctx);
                if (!decoded.success)
                    return decoded;
                output.words.push(decoded.output);
            }
            ctx.jsonPath[0] += 1;
        }
        return { success: true, output: output };
    },
    encode: function (sentence) {
        var h = headersConllu.encode(sentence.headers);
        if (!h.success)
            return h;
        var output = h.output;
        for (var _i = 0, _a = sentence.words; _i < _a.length; _i++) {
            var w = _a[_i];
            var encoded = wordConllu.encode(w);
            if (!encoded.success)
                return encoded;
            output += encoded.output;
            output += "\n";
        }
        return { success: true, output: output.trimEnd() };
    },
});
// Makes sure syntax is followed and required fields are included.
exports.normal = z.codecs.custom(z.string(), z.array(sentence), {
    decode: function (str, ctx) {
        var output = [];
        var split = str.split(/\r?\n\r?\n/);
        ctx.jsonPath[0] = 1;
        for (var _i = 0, split_1 = split; _i < split_1.length; _i++) {
            var s = split_1[_i];
            var decoded = sentenceConllu.decode(s, ctx);
            if (!decoded.success)
                return decoded;
            output.push(decoded.output);
            ctx.jsonPath[0] += 2;
        }
        return { success: true, output: output };
    },
    encode: function (sentences, ctx) {
        var output = "";
        for (var _i = 0, sentences_1 = sentences; _i < sentences_1.length; _i++) {
            var s = sentences_1[_i];
            var encoded = sentenceConllu.encode(s, ctx);
            if (!encoded.success)
                return encoded;
            output += encoded.output;
            output += "\n\n";
        }
        return { success: true, output: output.trimEnd() };
    },
});
// const decoded = wordConllu.decode(
// 		"1	In	in	ADP	IN	_	0	case	3:foo	Verse=1|SourceMap=1",
// 	);
// if (decoded.success) {
// 	console.dir(decoded.output, { depth: null });
// 	console.log(wordConllu.encode(decoded.output).output)
// }
var text = (0, node_fs_1.readFileSync)((0, node_path_1.join)(import.meta.dir, "gum.conllu"), "utf8");
var parsed = exports.normal.decode(text);
// console.dir(parsed, { depth: null });
if (parsed.success) {
    var reencoded = exports.normal.encode(parsed.output);
    if (reencoded.success)
        console.log(reencoded.output);
}
