import React, { useState, useEffect } from "react";

export default function RunList(
  searchHandler,
  machine,
  parttype,
  metric,
  side,
  startDate
) {
  // Hardcoded values for testing purposes only
  const [partData, setPartData] = useState({
    machine: "WAM 136",
    startDate: 1659114327003,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const getParts = async () => {
      // const defFile = "./config/partDefinitions.json";
      // let tolerances = {};
      // let isAngleHole = false;

      // const response = await fetch(defFile);
      // const partDef = await response.json();

      // for (const part of partDef) {
      //   if (String(part.partType).trim() === String(currentType).trim()) {
      //     tolerances = part.tolerances;
      //     isAngleHole = part.textFileSpecs.isAngleHole;
      //   }
      // }

      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?machine=${partData.machine}&timestamp=${partData.startDate}&flag=list`,
        {
          signal: abortController.signal,
        }
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          setPartData(prevState => {
            return { ...prevState, parts: data };
          });
          populateTableData(data);
        })
        .catch(error => {
          if (error.name === "AbortError") {
            console.log(error);
          }
        });
    };
    getParts();

    return () => {
      abortController.abort();
    };
  }, [partData.machine, partData.startDate]);

  const getFormattedDateStringFromUnix = date => {
    // resulting format: 2022-05-23T16:46
    const origDate = new Date(date);
    const stringDate = origDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const stringTime = origDate
      .toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace("AM", "")
      .replace("PM", "")
      .trim();
    const splitDate = stringDate.split("/");
    const splitTime = stringTime.split(":");
    const formattedDate = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}T${splitTime[0]}:${splitTime[1]}`;
    return formattedDate;
  };

  // Function that says for each part in data, create a <tr> inside <tbody>
  const populateTableData = parts => {
    console.log(parts);
    for (const part of parts) {
      // get table parent to append children to
      const table = document.querySelector("#table-body");
      // create new row and data elements
      const newRow = document.createElement("tr");
      const newTracking = document.createElement("th");
      const newPartType = document.createElement("th");
      const newDate = document.createElement("th");
      // give new row some values
      newTracking.textContent = part.tracking;
      newPartType.textContent = part.parttype;
      newDate.textContent = getFormattedDateStringFromUnix(part.timestamp);
      // append data to new row and then append to parent table
      newRow.appendChild(newTracking);
      newRow.appendChild(newPartType);
      newRow.appendChild(newDate);
      table.appendChild(newRow);
    }
  };

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Tracking No.</th>
            <th scope="col">Part Type</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody id="table-body"></tbody>
      </table>
    </div>
  );
}
