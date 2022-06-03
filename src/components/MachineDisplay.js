import React, { useEffect, useState } from 'react';
import BoxPlots from './BoxPlots';

export default function MachineDisplay({ searchHandler, machine, parttype }) {
  const [partData, setPartData] = useState({
    parts: [],
    machine: machine,
    partType: parttype,
    numOfParts: 5,
    metric: 'Diameter',
    side: 'c-side',
    startDate: Date.now(),
    tols: {},
    isAngleHole: false,
  });

  useEffect(() => {
    const getPartTols = async currentType => {
      console.log(currentType);
      const defFile = './config/partDefinitions.json';
      let tolerances = {};
      let isAngleHole = false;

      const response = await fetch(defFile);
      const partDef = await response.json();

      for (const part of partDef) {
        if (String(part.partType).trim() === String(currentType).trim()) {
          tolerances = part.tolerances;
          isAngleHole = part.textFileSpecs.isAngleHole;
        }
      }

      fetch(
        `https://salty-inlet-93542.herokuapp.com/parts/?machine=${partData.machine}&parttype=${partData.partType}&timestamp=${partData.startDate}&flag=mach-page`
      )
        .then(response => {
          return response.json();
        })
        .then(data => {
          setPartData({
            parts: data,
            machine: partData.machine,
            partType: partData.partType,
            numOfParts: partData.numOfParts,
            metric: partData.metric,
            side: partData.side,
            startDate: partData.startDate,
            tols: tolerances,
            isAngleHole: isAngleHole,
          });
        })
        .catch(error => {
          console.log(error);
        });
    };
    // ****Rename this function
    getPartTols(partData.partType);
  }, [partData.machine, partData.startDate, partData.partType]);

  const setMachine = e => {
    setPartData(prevState => {
      return { ...prevState, machine: e.target.value };
    });
  };

  const setNumOfParts = e => {
    let value = e.target.value;
    if (value > 9) {
      value = 9;
    } else if (value < 1) {
      value = 1;
    }

    setPartData(prevState => {
      return { ...prevState, numOfParts: value };
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

  const setStartDate = e => {
    setPartData(prevState => {
      return { ...prevState, startDate: Date.parse(e.target.value) };
    });
  };

  // alter time with slider for currently selected day
  const setStartTime = e => {
    const currentDate = Date.parse(partData.startDate);
    setPartData(prevState => {
      return { ...prevState, startDate: Date.parse(e.target.value) };
    });
  };

  const getPartColor = partType => {
    let borderColor = '';
    let backgroundColor = '';

    if (String(partType).trim() === '369P-01') {
      borderColor = 'rgb(252, 186, 3, 1)';
      backgroundColor = 'rgb(252, 186, 3, .2)';
    } else if (String(partType).trim() === '1789P-01') {
      borderColor = 'rgb(2, 117, 216, 1)';
      backgroundColor = 'rgb(2, 117, 216, .2)';
    } else if (String(partType).trim() === '2078P-01') {
      borderColor = 'rgb(92, 184, 92, 1)';
      backgroundColor = 'rgb(92, 184, 92, .2)';
    } else if (String(partType).trim() === '1534P-01') {
      borderColor = 'rgb(219, 112, 4, 1)';
      backgroundColor = 'rgb(219, 112, 4, .2)';
    } else if (String(partType).trim() === '1557P-01') {
      borderColor = 'rgb(68, 242, 207, 1)';
      backgroundColor = 'rgb(68, 242, 207, .2)';
    } else if (String(partType).trim() === '2129P-01') {
      borderColor = 'rgb(252, 3, 102, 1)';
      backgroundColor = 'rgb(252, 3, 102, .2)';
    } else if (String(partType).trim() === '2129P-02') {
      borderColor = 'rgb(175, 104, 252, 1)';
      backgroundColor = 'rgb(175, 104, 252, .2)';
    } else if (String(partType).trim() === '2129P-03') {
      borderColor = 'rgb(1, 0, 3, 1)';
      backgroundColor = 'rgb(1, 0, 3, .2)';
    } else if (String(partType).trim() === '1565P-01') {
      borderColor = 'rgb(171, 194, 21, 1)';
      backgroundColor = 'rgb(171, 194, 21, .2)';
    }

    return [borderColor, backgroundColor];
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

  const setPartType = e => {
    const partType = e.target.value;
    setPartData(prevState => {
      return { ...prevState, partType: partType };
    });
  };

  return (
    <div className="MachineDisplay">
      <div id="machine-title" className="jumbotron machine-jumbotron">
        <div className="machine-info">
          <p className="display-4 lead">
            {partData.machine}
            <span style={{ color: 'rgb(39, 97, 204)' }}> &nbsp;| &nbsp;</span>
          </p>
          <p className="display-4 lead">Machine Display</p>
          {/* <p className="display-4 lead">
            {partData.partType}
            <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
          </p>
          <p className="display-4 lead">
            {partData.side[0].toUpperCase() +
              partData.side.substring(1, 2) +
              partData.side[2].toUpperCase() +
              partData.side.substring(3)}
            <span style={{ color: "rgb(39, 97, 204)" }}> &nbsp;| &nbsp;</span>
          </p>
          <p className="display-4 lead">{partData.metric} </p> */}
        </div>
      </div>
      {partData ? (
        <div className="machine-content">
          <div className="machine-dropdown-and-date">
            <div className="overview-selectors">
              <div className="part-params">
                <select
                  name="parttype-select"
                  id="form-select"
                  className="form-select form-select mb-3"
                  aria-label=".form-select example"
                  value={partData.machine}
                  onChange={setMachine}
                >
                  {/* All machines option, different query required? */}
                  {/* <option value="%">All Machines</option> */}
                  <option value="WAM 101">WAM 101</option>
                  <option value="WAM 106">WAM 106</option>
                  <option value="WAM 110">WAM 110</option>
                  <option value="WAM 116">WAM 116</option>
                  <option value="WAM 120">WAM 120</option>
                  <option value="WAM 132">WAM 132</option>
                  <option value="WAM 134">WAM 134</option>
                  <option value="WAM 136">WAM 136</option>
                  <option value="WAM 137">WAM 137</option>
                  <option value="WAM 138">WAM 138</option>
                  <option value="WAM 139">WAM 139</option>
                  <option value="WAM 140">WAM 140</option>
                  <option value="WAM 141">WAM 141</option>
                  <option value="WAM 142">WAM 142</option>
                  <option value="WAM 143">WAM 143</option>
                  <option value="WAM 144">WAM 144</option>
                  <option value="WAM 145">WAM 145</option>
                  <option value="WAM 901">WAM 901</option>
                  <option value="WAM 902">WAM 902</option>
                  <option value="WAM 903">WAM 903</option>
                  <option value="WAM 904">WAM 904</option>
                </select>
                <select
                  id="form-select"
                  name="parttype-select"
                  className="form-select form-select mb-3"
                  aria-label=".form-select example"
                  onChange={setPartType}
                  defaultValue={partData.partType}
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
                {/* <div className="form num-of-parts-input">
                  <input
                    type="number"
                    defaultValue={5}
                    onChange={setNumOfParts}
                  />
                </div> */}
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
              </div>
            </div>
          </div>
          <div className="dropdown-and-title"></div>
          <div className="boxplots-and-buttons">
            <div className="boxplots">
              <BoxPlots
                partData={partData.parts.slice(0, partData.numOfParts)}
                side={partData.side}
                metric={partData.metric}
                searchHandler={searchHandler}
                tols={partData.tols}
                parttype={partData.partType}
                isAngleHole={partData.isAngleHole}
              />
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
