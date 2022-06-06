import React from 'react';
import { useState, useEffect } from 'react';
import BoxPlotsAll from './BoxPlotsAll';

export default function Overview({ machHandler }) {
  const [partData, setPartData] = useState({
    partType: '369P-01',
    startDate: Date.now(),
    machineData: [],
    side: 'c-side',
    metric: 'Diameter',
    tols: {},
    isAngleHole: false,
    groupNum: 0,
  });

  useEffect(() => {
    setPartData(prevState => {
      return { ...prevState, machineData: [] };
    });

    const getMachinesData = async currentType => {
      const machDefFile = './config/machDefinitions.json';
      const partDefFile = './config/partDefinitions.json';

      let fetchArray = [];
      let tolerances = {};
      let isAngleHole = false;

      const response = await fetch(machDefFile);
      const machines = await response.json();

      const partResponse = await fetch(partDefFile);
      const partDef = await partResponse.json();

      for (const mach of machines) {
        fetchArray.push(
          `https://salty-inlet-93542.herokuapp.com/parts/?parttype=${partData.partType}&machine=${mach}&timestamp=${partData.startDate}`
        );
      }

      for (const part of partDef) {
        if (String(part.partType).trim() === String(currentType).trim()) {
          tolerances = part.tolerances;
          isAngleHole = part.textFileSpecs.isAngleHole;
        }
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
              tols: tolerances,
              isAngleHole: isAngleHole,
            };
          });
        });
    };

    getMachinesData(partData.partType);
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
    const stringDate = origDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const stringTime = origDate
      .toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace('AM', '')
      .replace('PM', '')
      .trim();
    const splitDate = stringDate.split('/');
    const splitTime = stringTime.split(':');
    const todayDefault = `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}T${splitTime[0]}:${splitTime[1]}`;
    return todayDefault;
  };

  const setStartDate = e => {
    setPartData(prevState => {
      return { ...prevState, startDate: Date.parse(e.target.value) };
    });
  };

  const changeGroupNext = () => {
    if (partData.groupNum < Math.floor(partData.machineData.length / 6)) {
      setPartData(prevState => {
        return { ...prevState, groupNum: partData.groupNum + 1 };
      });
    } else {
      setPartData(prevState => {
        return { ...prevState, groupNum: 0 };
      });
    }
  };
  const changeGroupPrev = () => {
    if (partData.groupNum === 0) {
      setPartData(prevState => {
        return {
          ...prevState,
          groupNum: Math.floor(partData.machineData.length / 6),
        };
      });
    } else {
      setPartData(prevState => {
        return { ...prevState, groupNum: partData.groupNum - 1 };
      });
    }
  };

  return (
    <div className="OverviewDisplay">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <div className="machine-info">
          <p className="display-4 lead">
            {partData.partType}
            <span style={{ color: 'rgb(39, 97, 204)' }}> &nbsp;| &nbsp;</span>
          </p>

          <p className="display-4 lead">Process Overview</p>
        </div>
      </div>
      {partData ? (
        <div className="overview-content">
          <div className="overview-selectors">
            <div className="part-params">
              <div className="prev-machgroup-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="bi bi-chevron-double-left prev-group-arrow"
                  viewBox="0 0 15 15"
                  onClick={changeGroupPrev}
                >
                  <path
                    fillRule="evenodd"
                    d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                  <path
                    fillRule="evenodd"
                    d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </div>
              <select
                name="parttype-select"
                id="form-select"
                className="form-select form-select mb-3"
                aria-label=".form-select example"
                onChange={setPartType}
              >
                <option value="369P-01">369P-01</option>
                <option value="1789P-01">1789P-01</option>
                <option value="2078P-01">2078P-01</option>
                <option value="1565P-01">1565P-01</option>
              </select>
              <select
                id="form-select"
                className="form-select form-select mb-3"
                aria-label=".form-select example"
                onChange={setSide}
              >
                <option value="c-side">C-Side</option>
                <option value="a-side">A-Side</option>
              </select>
              <select
                id="form-select"
                className="form-select form-select mb-3"
                aria-label=".form-select example"
                onChange={setMetric}
              >
                <option value="Diameter">Diameter</option>
                <option value="Position">Position</option>
              </select>
              <div className="overview-date-input">
                <input
                  id="form-select"
                  className="form-control"
                  name="overview-date"
                  type="datetime-local"
                  defaultValue={getTodayFormattedString(Date.now())}
                  onChange={setStartDate}
                />
              </div>
              <div className="next-machgroup-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="bi bi-chevron-double-right next-group-arrow"
                  viewBox="0 0 15 15"
                  onClick={changeGroupNext}
                >
                  <path
                    fillRule="evenodd"
                    d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                  <path
                    fillRule="evenodd"
                    d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </div>
            </div>
            {/* <input type="number" defaultValue={5} onChange={setNumOfMachines} /> */}
          </div>
          <div className="overview-boxplots">
            <BoxPlotsAll
              data={partData.machineData}
              side={partData.side}
              metric={partData.metric}
              machHandler={machHandler}
              partType={partData.partType}
              tols={partData.tols}
              isAngleHole={partData.isAngleHole}
              startDate={partData.startDate}
              groupNum={partData.groupNum}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
