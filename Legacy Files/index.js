let cards = [];

function onParsed() {
  for (const k of Object.entries(cardsParsed)) {
    let cardParsed = k[1];
    cards.push(cardParsed[0]);
    console.log(cardParsed[0]);
    const card = document.createElement("img");
    card.src = cardParsed[1];
    card.alt =
      "Error loading card. Please check internet. If issue persists, alert an administrator.";
    card.classList.add("card");
    card.id = cardParsed[0];
    card.onclick = function () {
      load(card.id);
    };
    document.body.appendChild(card);
  }

  document
    .getElementById("cardinfo")
    .addEventListener("click", function (event) {
      if (event.target.id === "cardinfo") {
        document.getElementById("cardinfo").style.display = "none";
      } else if (event.target.id === "cardinfotext") {
        event.stopPropagation();
      }
    });
}

let cardsParsed = ""; // {'cardName': ['cardName', 'cardImage', 'cardDesc']}  ==> 0=cardName, 1=cardImage, 2=cardDesc
function fetchJSON() {
  fetch("https://entification.github.io/ccgcatalog.github.io/cards.json")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      cardsParsed = data;
      onParsed();
    })
    .catch((error) => {
      setTimeout(fetchJSON, 1000);
      console.error("Error:", error);
    });
}
fetchJSON();

function load(loadID) {
  document.getElementById("cardinfo").style.display = "block";
  document.getElementById("cardinfotext").innerHTML = cardsParsed[loadID][2]
    .replaceAll("\n", "<br>")
    .replaceAll("\\n", "<br>");
  document.getElementById("cardinfotext").scrollTop = 0;
}

function searchForCards() {
  let nameInput = document.getElementById("searchbyname").value;
  let descInput = document.getElementById("searchbydesc").value;
  cards.forEach((card) => {
    if (
      card.toUpperCase().includes(nameInput.toUpperCase()) &&
      cardsParsed[card][2].toUpperCase().includes(descInput.toUpperCase())
    ) {
      document.getElementById(card).style.display = "block";
    } else {
      document.getElementById(card).style.display = "none";
    }
  });
}
