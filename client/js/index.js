/*
Joseph P. Pasaoa
ClientSide Index JS | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const log = console.log;

const serverComm = async (method, urlAdds, body) => {
  const url = `http://localhost:11000/sightings/${urlAdds}`;
  try {
    const response = await axios[method](url, body);
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

const grabAllSightings = async () => {
  const researcherId = document.querySelector('#txtResearcher').value;
  const response = await serverComm("get", `${researcherId}`);
  return response;
}


document.addEventListener("DOMContentLoaded", async () => {
    // document.
    document.querySelector('#btnAllSightings').addEventListener("click", async (e) => {
        clearStage();
        const data = await grabAllSightings();
        document.querySelector('#stage').innerHTML += JSON.stringify(data, null, 2);
    });
});