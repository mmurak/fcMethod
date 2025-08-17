class GlobalManager {
	constructor() {
		this.entry = document.getElementById("Entry");
		this.entry.addEventListener("input", () => {
			let target = this.entry.value;
			target = target.replaceAll(/\s/g, "");
			if (target.match(/[^\d\/.]/))  return;
			if (target.match(/^\s*$/)) {
				fillMessage();
				return;
			}
			const pvalue = preProcess(target);
			const regexp = new RegExp("^" + pvalue);
			G.cycle = 0;
			search(regexp);
		});
		this.entry.addEventListener("keydown", (evt) => {
			if (evt.key == "Escape") {
				clearEntry();
			}
		});
		this.entry.addEventListener("focus", () => {
			this.entry.select();
		});
		this.resultArea = document.getElementById("ResultArea");
		this.mondai = document.getElementById("Mondai");
		this.kaitou = "";
		this.reveal = document.getElementById("Reveal");
		this.kotae = document.getElementById("Kotae");
		this.kossori = "解答を見る→";
		this.unkossori = "解答を隠す→";
		this.cheatState = false;
		this.briefManual = "<h3>「四角號碼」訓練アプリ</h3><ul><li>数値をそのまま入力してください（附角も5桁目の数字として指定します）。</li><li>特定できない桁がある場合、「/」を使って考えられる数値を羅列できます。<br>（例：2か8か分からない場合には「2/8」、5か6か7か分からない場合には「5/6/7」と指定できます。）</li><li>入力中の空白は検索時に除去されます。</li><li>「.」は0〜9のすべてに適合します。</li><li>入力欄左横の「四角號碼」をクリックすると、指定した漢字の四角号碼を調べることができます。</li></ul><br>";
		this.maxItems = 50;
		this.cycle = 0;
	}
}
const G = new GlobalManager();
fillMessage();
G.reveal.innerHTML = G.kossori;
G.entry.focus();

function search(regexp) {
	G.resultArea.innerHTML = "";
	const table = document.createElement("table");
	G.resultArea.appendChild(table);
	const colMax = 4;
	let colSize = colMax + 1;
	let row;
	let matchCount = 0;
	const startPoint = G.maxItems * G.cycle;
	const endPoint = G.maxItems * (G.cycle + 1);
	if (G.cycle > 0) {
		row = table.insertRow(-1);
		const cell = row.insertCell(0);
		cell.innerHTML = "　<< 前 <<";
		cell.style = "color: green;";
		cell.addEventListener("click", (evt) => {
			G.cycle--;
			search(regexp);
			return;
		});
	}
	for (let entry of fourCorner) {
		if (entry[1].match(regexp)) {
			matchCount++;
			if (matchCount <= startPoint) continue;
			if (colSize > colMax) {
				row = table.insertRow(-1);
				colSize = 0;
			}
			const cell = row.insertCell(colSize);
			colSize++;
			cell.innerHTML = entry[0] + " (" + regulate(entry[1]) + ")";
			cell.addEventListener("click", (evt) => {
				if (evt.shiftKey) {
					copyToClipboard(entry[0]);
				}
			});
			if (matchCount >= endPoint) {
				row = table.insertRow(-1);
				const cell = row.insertCell(0);
				cell.innerHTML = "　>> 次 >>";
				cell.style = "color: green;";
				cell.addEventListener("click", (evt) => {
					G.cycle++;
					search(regexp);
					return;
				});
				return;
			}
		}
	}
}

function preProcess(content) {
	content = content.replaceAll(/\s/g, "");
	let novoContent = "";
	let newContent = "";
	do {
		novoContent = content.replace(/(\d)\/(\d)/, "[$1$2]");
		if (novoContent == content) {
			return content;		// EXIT POINT
		}
		content = novoContent;
		newContent = "";
		do {
			newContent = content.replace(/\]\/(\d)/, "$1]");
			if (newContent == content) {
				break;
			}
			content = newContent;
		} while (true);
	} while (true);

}

function regulate(str) {
	return str.slice(0, 4) + ".<span class='subscript'>" + str.slice(4) + "</span>";
}

function kanjiToFC() {
	const kanji = prompt("漢字を1文字入力してください：");
	if ((kanji == "") || (kanji == null)) return;
	const target = kanji.substring(0, 1);
	for (let db of fourCorner) {
		if (target == db[0]) {
			alert(target + ":" + regulate(db[1]));
			clearEntry();
			return;
		}
	}
	alert("登録されていません。");
	clearEntry();
}

function randomKanji() {
	if (G.cheatState) {
		toggleReveal();
	}
	const ptr = Math.trunc(Math.random() * fourCorner.length);
	G.kaitou = regulate(fourCorner[ptr][1]);
	G.mondai.innerHTML = fourCorner[ptr][0];
	clearEntry();
}

function toggleReveal() {
	if (G.cheatState) {
		G.kotae.innerHTML = "";
		G.reveal.innerHTML = G.kossori;
		G.cheatState = false;
	} else {
		G.kotae.innerHTML = G.kaitou;
		G.reveal.innerHTML = G.unkossori;
		G.cheatState = true;
	}
	G.entry.focus();
}

function clearEntry() {
	G.entry.value = "";
	fillMessage();
	G.entry.focus();
}

function fillMessage() {
	G.resultArea.innerHTML = G.briefManual + credit;
}

async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
	}
}
