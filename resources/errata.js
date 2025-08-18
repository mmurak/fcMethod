
const errata = {
	"抸": "52037",
	"契": "57430",
	"奷": "42440",
	"佽": "27282",
};

for (let i = 0; i < fourCorner.length; i++) {
	const kanji = fourCorner[i][0];
	if (kanji in errata) {
		fourCorner[i][1] = errata[kanji];
	}
}
