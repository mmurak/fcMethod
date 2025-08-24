class GlobalManager {
	constructor() {
		this.entry = document.getElementById("FCEntry");
		this.entry.addEventListener("input", () => {
			let target = this.entry.value;
			target = target.replaceAll(/\s/g, "");
			if (target.match(/[^\d\/.]/))  return;
			if (target.match(/^\s*$/)) {
				return;
			}
			const pvalue = preProcess(target);
			const regexp = new RegExp("^" + pvalue);
			G.cycle = 0;
			search(regexp);
		});
		this.kanjiEntry = document.getElementById("KanjiEntry");
		this.kanjiEntry.addEventListener("change", (evt) => {
			kanjiToFC();
		});
		document.addEventListener("keydown", (evt) => {
			if (evt.key == "Escape") {
				clearEntry();
			}
		});
/*
		document.addEventListener("visibilitychange", (evt) => {
			if (!document.hidden) {
				clearEntry();
				this.entry.focus();
			}
		});
*/
		this.entry.addEventListener("focus", () => {
			this.entry.select();
		});
		this.resultArea = document.getElementById("ResultArea");
		this.maxItems = 50;
		this.cycle = 0;
		this.clipboard = document.getElementById("Clipboard");
	}
}
const G = new GlobalManager();
fourCorner.sort((a, b) => {
	if (a[1] < b[1]) {
		return -1;
	}
	if (a[1] > b[1]) {
		return 1;
	}
	if (a[0] < b[0]) {
		return -1;
	}
	if (a[0] > b[0]) {
		return 1;
	}
	return 0;
});

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
		cell.innerHTML = "　<< 前";
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
//				if (evt.shiftKey) {
					copyToClipboard(entry[0]);
//				}
			});
			if (matchCount >= endPoint) {
				row = table.insertRow(-1);
				const cell = row.insertCell(0);
				cell.innerHTML = "　次 >>";
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
	return str.slice(0, 4) + "<span class='subscript'>" + str.slice(4) + "</span>";
}

function dotNotation(str) {
	return str.slice(0, 4) + "." + str.slice(4);
}

function kanjiToFC() {
	const kanji = G.kanjiEntry.value;
	if (kanji == "") {
		clearEntry();
		return;
	}
	const target = kanji.substring(0, 1);
	G.kanjiEntry.value = target;
	for (let db of fourCorner) {
		if (target == db[0]) {
			G.entry.value = db[1];
			const regexp = new RegExp("^" + db[1]);
			G.cycle = 0;
			search(regexp);
			return;
		}
	}
	G.kanjiEntry.value += "...未登録。";
}

function clearEntry() {
	G.entry.value = "";
	G.kanjiEntry.value = "";
	G.resultArea.innerHTML = "";
	G.entry.focus();
}

async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		G.clipboard.innerHTML = text;
	} catch (err) {
	}
}
