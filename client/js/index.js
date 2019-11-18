/*
Joseph P. Pasaoa
ClientSide Index JS | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const log = console.log;

const serverComm = async (method, urlAdds) => {
  const url = `http://localhost:11000/${urlAdds}`;
  try {
    const response = await axios[method](url);
    return response.data;
  } catch (err) {
    log("client-side error: ", err);
  }
}

const clearStage = () => {
  const stage = document.querySelector('#stage');
  while (stage.firstChild) {
    stage.removeChild(stage.lastChild);
  }
}

const populateSelect = async () => {
  const data = await serverComm("get", "researchers");
  const researcherSelect = document.querySelector('#selResearcher');
  for (let researcher of data.payload) {
    let makingOpt = document.createElement('option');
    makingOpt.name = "selResearcher";
    makingOpt.value = researcher.id;
    makingOpt.innerText = researcher.name;
    researcherSelect.appendChild(makingOpt);
  }
}

const grabSightings = async () => {
  let pathAdded = `sightings/`;
  const researcherNum = document.querySelector('#selResearcher').value;
  if (researcherNum !== "") {
    pathAdded += `researchers/${researcherNum}`;
  }
  const response = await serverComm("get", pathAdded);
  return response;
}

const buildCard = (entryObj) => {
  const stage = document.querySelector('#stage');
  const makingCard = document.createElement('div');
  makingCard.className = "card";
  makingCard.innerHTML = `<b>${entryObj.id}.</b><h2>${entryObj.researcher}</h2><em>${entryObj.r_title}</em>`;
  makingCard.innerHTML += `<div class="species">${entryObj.species}</div><div class="habitat">${entryObj.habitat}</div>`;
  stage.appendChild(makingCard);
}

const dataToCardParse = (data) => {
  if (!data) {
    buildCard({
      id: 0,
      researcher: "No Sightings",
      r_title: "",
      species: "",
      habitat: ""
    });
  } else if (!Array.isArray(data.payload)) {
    buildCard(data.payload);
  } else {
    for (let entry of data.payload) {
      buildCard(entry);
    }
  }
}


/* POST-DOMLoaded Exec */
document.addEventListener("DOMContentLoaded", async () => {
    populateSelect();
    dataToCardParse(await grabSightings());
    document.querySelector('#selResearcher').addEventListener("change", async (e) => {
        clearStage();
        dataToCardParse(await grabSightings());
    });
});