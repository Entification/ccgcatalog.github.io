let cards = [];

function onParsed() {
	for (const k of Object.entries(cardsParsed)) {
	let cardParsed = k[1];
	cards.push(cardParsed[0]);
	console.log(cardParsed[0]);
	const card = document.createElement('img');
	card.src = 'https://i.imgur.com/' + cardParsed[1] + '.png';
	card.alt = 'Error loading card. Please check internet. If issue persists, alert an administrator.'
	card.classList.add('card');
	card.id = cardParsed[0];
	card.onclick = function() { load(card.id); };
	document.body.appendChild(card);
}
}

let cardsParsed = ""; // {'cardName': ['cardName', 'cardImage', 'cardDesc']}  ==> 0=cardName, 1=cardImage, 2=cardDesc
fetch("https://entification.github.io/ccgcatalog.github.io/cards.json")
  .then(response => response.json())
  .then(data => {console.log(data); cardsParsed = data; onParsed();})
  .catch(error => console.error('Error:', error));




function load(loadID) {
  document.getElementById('cardinfo');.style.display = 'block';
  document.getElementById('cardinfotext');.innerHTML = cardsParsed[loadID][2];
}

function searchForCards() {
  let nameInput = document.getElementById('searchbyname');.value;
  let descInput = document.getElementById('searchbydesc');.value;
  cards.forEach(card => {
		if (card.toUpperCase().includes(nameInput.toUpperCase()) && cardsParsed[card][2].toUpperCase().includes(descInput.toUpperCase())) {
			document.querySelector('#' + card).style.display = 'block';
		} else {
			document.querySelector('#' + card).style.display = 'none';
		}
	});
}
