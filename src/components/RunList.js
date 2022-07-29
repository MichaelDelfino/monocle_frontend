import React, { useState, useEffect } from "react";
import { LineGraph } from "./LineGraph";

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
    selectedPart: "3979386",
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
      month: "long",
      day: "2-digit",
    });
    return date;
  };

  // Function that says for each part in data, create a <tr> inside <tbody>
  const populateTableData = parts => {
    console.log(parts);
    for (const part of parts) {
      // get table parent to append children to
      const table = document.querySelector("#table-body");
      // create new row and data elements
      const newRow = document.createElement("tr");
      const newTracking = document.createElement("td");
      const newPartType = document.createElement("td");
      const newDate = document.createElement("td");
      // give new row some values
      newTracking.textContent = part.tracking;
      newPartType.textContent = part.parttype;
      newDate.textContent = part.timestamp;
      // append data to new row and then append to parent table
      newRow.appendChild(newTracking);
      newRow.appendChild(newPartType);
      newRow.appendChild(newDate);
      table.appendChild(newRow);
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Tracking No.</th>
            <th scope="col">Part Type</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody id="table-body"></tbody>
      </table>
      {/* <LineGraph partData={partData.parts[0]} /> */}
    </div>
  );
}
