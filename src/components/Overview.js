import React from "react";
import { useState, useEffect } from "react";
import BoxPlotsAll from "./BoxPlotsAll";

export default function Overview({ machHandler, searchHandler }) {
  const [partData, setPartData] = useState({
    partType: "369P-01",
    startDate: Date.now(),
    machineData: [],
    side: "c-side",
    metric: "Diameter",
  });

  useEffect(() => {
    setPartData(prevState => {
      return { ...prevState, machineData: [] };
    });
    const getMachinesData = async () => {
      const defFile = "./config/machDefinitions.json";
      let fetchArray = [];

      const response = await fetch(defFile);
      const machines = await response.json();

      for (const mach of machines) {
        fetchArray.push(
          `https://salty-inlet-93542.herokuapp.com/parts/?parttype=${partData.partType}&machine=${mach}&timestamp=${partData.startDate}`
        );
      }
      let requests = fetchArray.map(url => fetch(url));

      Promise.all(requests)
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(jsonObjects => {
          let validMachines = [];
          for (const obj of jsonObjects) {
            if (obj.length) {
              validMachines.push(obj);
            }
          }
          setPartData(prevState => {
            return {
              ...prevState,
              partType: partData.partType,
              startDate: partData.startDate,
              machineData: validMachines,
            };
          });
        });
    };

    getMachinesData();
  }, [partData.partType, partData.startDate]);

  const setPartType = e => {
    const partType = e.target.value;
    setPartData(prevState => {
      return { ...prevState, partType: partType };
    });
  };

  const setSide = e => {
    const side = e.target.value;
    setPartData(prevState => {
      return { ...prevState, side: side };
    });
  };

  const setMetric = e => {
    const metric = e.target.value;
    setPartData(prevState => {
      return { ...prevState, metric: metric };
    });
  };

  const getTodayFormattedString = date => {
    // req format: 2022-05-23T16:46
    const origDate = new Date(date);
    const stringDate = origDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const stringTime = origDate
      .toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace("AM", "")
      .replace("PM", "")
      .trim();
    const splitDate = stringDate.split("/");
    const splitTime = stringTime.split(":");
    const todayDefault = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}T${splitTime[0]}:${splitTime[1]}`;
    return todayDefault;
  };

  const setStartDate = e => {
    setPartData(prevState => {
      return { ...prevState, startDate: Date.parse(e.target.value) };
    });
  };

  return (
    <div className="OverviewDisplay">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <div className="machine-info">
          <p className="display-4 lead">
            {partData.partType}
            <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
          </p>

          <p className="display-4 lead">Process Overview</p>
        </div>
      </div>
      {partData ? (
        <div className="overview-content">
          <div className="overview-selectors">
            <div className="part-params">
              <select
                name="parttype-select"
                className="form-select form-select-lg mb-3"
                aria-label=".form-select-lg example"
                onChange={setPartType}
              >
                <option value="369P-01">369P-01</option>
                <option value="1789P-01">1789P-01</option>
                <option value="2078P-01">2078P-01</option>
                <option value="1565P-01">1565P-01</option>
              </select>
              <select
                className="form-select form-select-lg mb-3"
                aria-label=".form-select-lg example"
                onChange={setSide}
              >
                <option value="c-side">C-Side</option>
                <option value="a-side">A-Side</option>
              </select>
              <select
                className="form-select form-select-lg mb-3"
                aria-label=".form-select-lg example"
                onChange={setMetric}
              >
                <option value="Diameter">Diameter</option>
                <option value="Position">Position</option>
              </select>
            </div>
            <div className="overview-date-input">
              <input
                className="form-control"
                name="overview-date"
                type="datetime-local"
                defaultValue={getTodayFormattedString(Date.now())}
                onChange={setStartDate}
              />
            </div>
          </div>
          <div className="overview-boxplots">
            <BoxPlotsAll
              data={partData.machineData}
              side={partData.side}
              metric={partData.metric}
              machHandler={machHandler}
              searchHandler={searchHandler}
              partType={partData.partType}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
