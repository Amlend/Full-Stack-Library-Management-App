window.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

async function fetchData() {
  try {
    const response = await axios.get("http://localhost:3000/orders");
    const response2 = await axios.get("http://localhost:3000/returnedOrders");

    console.log("data Loaded");
    console.log(response);
    console.log(response2);
    const items = response.data.allOrders;
    const items2 = response2.data.allOrders;
    for (let i = 0; i < items.length; i++) {
      addToOwnedList(items[i]);
    }
    for (let i = 0; i < items2.length; i++) {
      addToReturnedList(items2[i]);
    }
  } catch (error) {
    console.log(error);
  }
}

//*************************************************

//************************************************
function addToOwnedList(item) {
  const { name, bookedAt, returnAt, fine } = item;

  const ownedDiv = document.getElementById("owned");

  const div = document.createElement("div");
  div.className = "books";

  div.appendChild(document.createTextNode(`Book name: ${name}`));
  div.appendChild(document.createElement("br"));
  div.appendChild(
    document.createTextNode(`Book taken on: ${convertUTCtoIST(bookedAt)}`)
  );
  div.appendChild(document.createElement("br"));
  div.appendChild(
    document.createTextNode(`Book return date: ${convertUTCtoIST(returnAt)}`)
  );
  div.appendChild(document.createElement("br"));
  div.appendChild(document.createTextNode(`Fine: ${fine}`));
  div.appendChild(document.createElement("br"));

  //*************************
  const btn = document.createElement("button");
  btn.className = " btn btn-primary";
  btn.appendChild(document.createTextNode("Return book"));
  div.appendChild(btn);

  ownedDiv.appendChild(div);

  btn.addEventListener("click", returnItem);

  async function returnItem() {
    let id = item.id;
    console.log(id);
    if (item.fine > 0) {
      // remove all child elements
      while (div.firstChild) {
        div.removeChild(div.firstChild);
      }
      const input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("value", `${item.fine}`);
      input.setAttribute("readonly", "readonly");
      div.appendChild(input);
      div.appendChild(document.createElement("br"));

      const button = document.createElement("button");
      button.className = "finePaid btn-danger";
      button.appendChild(document.createTextNode("Pay Fine"));
      div.appendChild(button);
      button.addEventListener("click", async () => {
        try {
          postReturned(item);
          ownedDiv.removeChild(div);
          const deleteDiv = await axios.delete(
            `http://localhost:3000/orders/${id}`
          );
        } catch (error) {
          console.log(error);
        }
        window.location.reload();
      });
    } else {
      try {
        ownedDiv.removeChild(div);
        postReturned(item);
        const deleteDiv = await axios.delete(
          `http://localhost:3000/orders/${id}`
        );
        console.log("Item Deleted...");
      } catch (err) {
        console.log(err);
      }
      window.location.reload();
    }
  }
}

function addToReturnedList(item) {
  const { name, fine, returnAt } = item;
  const returnedDiv = document.getElementById("returned");
  const div = document.createElement("div");
  div.className = "returnedBooks";

  div.appendChild(document.createTextNode(`Book name: ${name}`));
  div.appendChild(document.createElement("br"));
  div.appendChild(document.createTextNode(`Fine: ${fine}`));
  div.appendChild(document.createElement("br"));
  div.appendChild(
    document.createTextNode(`Returned At: ${convertUTCtoIST(returnAt)}`)
  );
  returnedDiv.appendChild(div);
}
//******************************************************************

function freeHolds() {
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

async function postReturned(item) {
  let returned = {
    name: item.name,
    fine: item.fine,
  };
  try {
    const postData = await axios.post(
      "http://localhost:3000/returned",
      returned
    );
  } catch (err) {
    console.log(err);
  }
}

function convertUTCtoIST(utcTimeString) {
  // Create a Date object from the UTC string
  const utcDate = new Date(utcTimeString);

  // Get the time difference in milliseconds between UTC and IST (IST is 5.5 hours ahead of UTC)
  const timeDifferenceInMs = 60 * 60 * 1000;

  // Add the time difference to the UTC date to get the IST date
  const istDate = new Date(utcDate.getTime() + timeDifferenceInMs);

  // Format the IST date in the desired format (dd-mm-yyyy, hh:mm:ss am/pm)
  const day = String(istDate.getDate()).padStart(2, "0");
  const month = String(istDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = istDate.getFullYear();

  const hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, "0");
  const seconds = String(istDate.getSeconds()).padStart(2, "0");

  const amPm = hours >= 12 ? "pm" : "am";
  const adjustedHours = hours % 12 || 12; // Convert to 12-hour format

  return `${day}-${month}-${year}, ${
    adjustedHours - 1
  }:${minutes}:${seconds} ${amPm} IST`;
}
