/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define("ace/mode/vyper_highlight_rules", function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var VyperHighlightRules = function() {

	var keywords = (
		"and|as|assert|break|continue|def|del|elif|else|" +
		"for|from|if|import|in|is|not|or|pass|raise|return|while|" +
		"with|int128|int256|uint256|decimal|real|address|contract|bool|bytes32|" +
		"bytes|timestamp|wei_value|currency_value|indexed|real128x128|until|push|" +
		"dup|swap|stop|throw|event|public|private|payable|constant"
	);

	var builtinConstants = (
		"True|False|None|NotImplemented|Ellipsis|ERC20|ether|wei|finney|" +
		"szabo|shannon|lovelace|ada|babbage|gwei|kwei|mwei|twei|pwei"
	);

	var builtinFunctions = (
		"send|call|selfdestruct|convert|floor|ceil|uint256_add|uint256_sub|" +
		"uint256_mul|uint256_div|uint256_mod|uint256_mulmod|uint256_addmod|" +
		"uint256_exp|uint256_gt|uint256_ge|uint256_lt|uint256_le|shift|" +
		"create_with_code_of|RLPList|min|max|keccak256|slice|as_unitless_number|" +
		"concat|len|sha3|method_id|ecrecover|avo|ecadd|ecmul|extract32|" +
		"as_wei_value|raw_call|blockhash|raw_log|bitwise_and|bitwise_or|" +
		"bitwise_xor|bitwise_not"
	);

	//var futureReserved = "";
	var keywordMapper = this.createKeywordMapper({
		"invalid.deprecated": "internal|__log__|num|num256|while|true|false|null",
		"support.function": builtinFunctions,
		"variable.language": "self|cls|msg|block",
		"constant.language": builtinConstants,
		"keyword": keywords
	}, "identifier");

	var strPre = "(?:r|u|ur|R|U|UR|Ur|uR)?";

	var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
	var octInteger = "(?:0[oO]?[0-7]+)";
	var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
	var binInteger = "(?:0[bB][01]+)";
	var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";

	var exponent = "(?:[eE][+-]?\\d+)";
	var fraction = "(?:\\.\\d+)";
	var intPart = "(?:\\d+)";
	var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
	var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
	var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

	var stringEscape =  "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";

	this.$rules = {
		"start" : [ {
			token : "comment",
			regex : "#.*$"
		}, {
			token : "string",           // multi line """ string start
			regex : strPre + '"{3}',
			next : "qqstring3"
		}, {
			token : "string",           // " string
			regex : strPre + '"(?=.)',
			next : "qqstring"
		}, {
			token : "string",           // multi line ''' string start
			regex : strPre + "'{3}",
			next : "qstring3"
		}, {
			token : "string",           // ' string
			regex : strPre + "'(?=.)",
			next : "qstring"
		}, {
			token : "constant.numeric", // imaginary
			regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
		}, {
			token : "constant.numeric", // float
			regex : floatNumber
		}, {
			token : "constant.numeric", // long integer
			regex : integer + "[lL]\\b"
		}, {
			token : "constant.numeric", // integer
			regex : integer + "\\b"
		}, {
			token : keywordMapper,
			regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
		}, {
			token : "keyword.operator",
			regex : "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
		}, {
			token : "paren.lparen",
			regex : "[\\[\\(\\{]"
		}, {
			token : "paren.rparen",
			regex : "[\\]\\)\\}]"
		}, {
			token : "text",
			regex : "\\s+"
		} ],
		"qqstring3" : [ {
			token : "constant.language.escape",
			regex : stringEscape
		}, {
			token : "string", // multi line """ string end
			regex : '"{3}',
			next : "start"
		}, {
			defaultToken : "string"
		} ],
		"qstring3" : [ {
			token : "constant.language.escape",
			regex : stringEscape
		}, {
			token : "string",  // multi line ''' string end
			regex : "'{3}",
			next : "start"
		}, {
			defaultToken : "string"
		} ],
		"qqstring" : [{
			token : "constant.language.escape",
			regex : stringEscape
		}, {
			token : "string",
			regex : "\\\\$",
			next  : "qqstring"
		}, {
			token : "string",
			regex : '"|$',
			next  : "start"
		}, {
			defaultToken: "string"
		}],
		"qstring" : [{
			token : "constant.language.escape",
			regex : stringEscape
		}, {
			token : "string",
			regex : "\\\\$",
			next  : "qstring"
		}, {
			token : "string",
			regex : "'|$",
			next  : "start"
		}, {
			defaultToken: "string"
		}]
	};
};

oop.inherits(VyperHighlightRules, TextHighlightRules);

exports.VyperHighlightRules = VyperHighlightRules;
});

define("ace/mode/folding/pythonic", function(require, exports, module) {
"use strict";

var oop = require("../../lib/oop");
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(markers) {
	this.foldingStartMarker = new RegExp("([\\[{])(?:\\s*)$|(" + markers + ")(?:\\s*)(?:#.*)?$");
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

	this.getFoldWidgetRange = function(session, foldStyle, row) {
		var line = session.getLine(row);
		var match = line.match(this.foldingStartMarker);
		if (match) {
			if (match[1])
				return this.openingBracketBlock(session, match[1], row, match.index);
			if (match[2])
				return this.indentationBlock(session, row, match.index + match[2].length);
			return this.indentationBlock(session, row);
		}
	};

}).call(FoldMode.prototype);

});

define("ace/mode/vyper", function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var VyperHighlightRules = require("./vyper_highlight_rules").VyperHighlightRules;
var PythonFoldMode = require("./folding/pythonic").FoldMode;
var Range = require("../range").Range;

var Mode = function() {
	this.HighlightRules = VyperHighlightRules;
	this.foldingRules = new PythonFoldMode("\\:");
	this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

	this.lineCommentStart = "#";

	this.getNextLineIndent = function(state, line, tab) {
		var indent = this.$getIndent(line);

		var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
		var tokens = tokenizedLine.tokens;

		if (tokens.length && tokens[tokens.length-1].type == "comment") {
			return indent;
		}

		if (state == "start") {
			var match = line.match(/^.*[\{\(\[:]\s*$/);
			if (match) {
				indent += tab;
			}
		}

		return indent;
	};

	var outdents = {
		"pass": 1,
		"return": 1,
		"raise": 1,
		"break": 1,
		"continue": 1
	};
	
	this.checkOutdent = function(state, line, input) {
		if (input !== "\r\n" && input !== "\r" && input !== "\n")
			return false;

		var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;
		
		if (!tokens)
			return false;
		
		// ignore trailing comments
		do {
			var last = tokens.pop();
		} while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
		
		if (!last)
			return false;
		
		return (last.type == "keyword" && outdents[last.value]);
	};

	this.autoOutdent = function(state, doc, row) {
		// outdenting in python is slightly different because it always applies
		// to the next line and only of a new line is inserted
		
		row += 1;
		var indent = this.$getIndent(doc.getLine(row));
		var tab = doc.getTabString();
		if (indent.slice(-tab.length) == tab)
			doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
	};

	this.$id = "ace/mode/vyper";
}).call(Mode.prototype);

exports.Mode = Mode;
});
