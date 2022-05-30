import React, { useEffect, useState } from 'react';
import DragAndDrop from './DragAndDrop';
import { LineGraph } from './LineGraph';
import { ScatterPlot } from './ScatterPlot';
import { MetricHighlights } from './MetricHighlights';

export default function PartDisplay(props) {
  const [partData, setPartData] = useState(null);

  // ***************Make methods into class that can be imported into Components***********
  // *************************************************************************************
  class Part {
    constructor(headerInfo, cSideData, aSideData, aFlipData, tolerances) {
      this.machine = headerInfo.machine;
      this.parttype = headerInfo.partType;
      this.tracking = headerInfo.tracking;
      this.timestamp = headerInfo.date;
      this.csidedata = cSideData;
      this.asidedata = aSideData;
      this.aflipdata = aFlipData;
      this.tolerances = tolerances;
    }
  }

  useEffect(() => {
    fetch(`https://192.168.0.2:3001/parts/?tracking=${props.tracking}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        console.log('...found', data[0]);
        if (data[0] === undefined) {
          setPartData(null);
        } else {
          setPartData({
            part: data[0],
            metric: 'diameter',
            side: 'c-side',
          });
        }
      })
      .catch(error => {
        console.log('tracking error', error);
      });
  }, [props.tracking]);

  // File Drag-and-Drop Functionality
  const onDrop = file => {
    // init csideonly and modified time
    let cSideOnly = false;
    const mtime = file[0].lastModified;

    if (file[0].name.includes('C_SideOnly')) {
      cSideOnly = true;
    } else {
      cSideOnly = false;
    }

    const data = file[0].text().then(text => {
      const lines = text.split(/\r?\n/);
      // console.log(lines);
      const partPromise = tfParser(lines, mtime, cSideOnly);
      partPromise.then(part => {
        console.log(part);
        setPartData({
          part: part,
          metric: 'diameter',
          side: 'c-side',
        });
      });
    });
  };

  // Parse first few lines and get header information from text file
  const getHeaderInfo = (textFile, mtime) => {
    var count = 0;
    var headerInfo = {};
    var partType, machine, tracking, date, summit;

    for (const line of textFile) {
      if (count === 0) {
        if (String(line.substring(20, 23)) === '809') {
          partType = '1565P-01';
        } else if (String(line.substring(20, 23)) === '887') {
          partType = '1787P-01';
        } else if (line.includes('817P')) {
          partType = '817P-01';
        } else if (line.includes('-317-')) {
          partType = '317P-01';
        } else {
          partType = String(line.substring(9, 17));
        }
      }
      date = mtime;

      if (count === 2) {
        summit = String(line.substring(75, 100)).trim();
        if (summit === 'S625XP11091449') {
          summit = 'Summit_1';
        } else if (summit === 'S600XP21031901') {
          summit = 'Summit_2';
        } else {
          summit = 'Summit_3';
        }
      }

      if (count === 4) {
        machine = 'WAM ' + String(line.substring(55, 58));
        tracking = String(line.substring(79, 90)).trim();
      }

      if (count > 5) {
        headerInfo.partType = partType;
        headerInfo.date = date;
        headerInfo.summit = summit;
        headerInfo.machine = machine;
        headerInfo.tracking = tracking;
        break;
      }
      count += 1;
    }
    return headerInfo;
  };

  // Retrieve text file specification from partDefinitions config file
  const getTextFileSpecs = async (currentType, cSideOnly) => {
    const defFile = './config/partDefinitions.json';

    const response = await fetch(defFile);
    const partDef = await response.json();

    for (const part of partDef) {
      if (
        String(part.partType).trim() === String(currentType).trim() &&
        cSideOnly === part.textFileSpecs.cSideOnly
      ) {
        let textFileSpecs,
          tolerances = {};
        textFileSpecs = part.textFileSpecs;
        tolerances = part.tolerances;
        return [textFileSpecs, tolerances];
      }
    }
  };

  // Get hole data from text file based on specs
  const getPartData = (textFileSpecs, textFile) => {
    var cSideData = {};
    var aSideData = {};
    var aFlipData = {};

    var lineCount = 0;
    var holeCount = 1;

    for (const line of textFile) {
      // C Side Data
      if (!line.includes('Ellipse')) {
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cDia = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cXY = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cX = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          var cY = String(line.substring(28, 36)).trim();
          cSideData[`hole_${holeCount}`] = {
            cDia: cDia,
            cXY: cXY,
            cX: cX,
            cY: cY,
          };
          holeCount++;
        }
      }

      // C-Side angle hole data
      if (line.includes('Ellipse')) {
        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.truePosString) +
            textFileSpecs.truePosString.length +
            2;
          cXY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.xPosString) +
            textFileSpecs.xPosString.length +
            2;
          cX = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.yPosString) +
            textFileSpecs.yPosString.length +
            2;
          cY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount <= textFileSpecs.cEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.diaString) +
            textFileSpecs.diaString.length +
            2;
          cDia = String(line.substring(startIndex, startIndex + 8)).trim();
          cSideData[`hole_${holeCount}`] = {
            cDia: cDia,
            cXY: cXY,
            cX: cX,
            cY: cY,
          };
          holeCount++;
        }
      }

      // A Side Data
      // reset hole count at A side
      if (!textFileSpecs.cSideOnly) {
        if (lineCount === textFileSpecs.cEnd + 1) {
          holeCount = 1;
        }

        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aDia = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aXY = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aX = String(line.substring(28, 36)).trim();
        }

        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount > textFileSpecs.cEnd &&
          lineCount < textFileSpecs.aEnd
        ) {
          var aY = String(line.substring(28, 36)).trim();
          aSideData[`hole_${holeCount}`] = {
            aDia: aDia,
            aXY: aXY,
            aX: aX,
            aY: aY,
          };
          holeCount++;
        }
      }

      // A Flip Data
      if (textFileSpecs.includeAFlip) {
        if (!line.includes('Ellipse')) {
          // reset hole count at a-flip data
          if (lineCount === textFileSpecs.aEnd + 1) {
            holeCount = 1;
          }
          if (
            line.includes(textFileSpecs.diaString) &&
            lineCount > textFileSpecs.aEnd
          ) {
            var aFlipDia = String(line.substring(28, 36)).trim();

            aFlipData[`hole_${holeCount}`] = {
              aFlipDia: aFlipDia,
            };
            holeCount++;
          }
        }
      }
      if (line.includes('Ellipse')) {
        if (
          line.includes(textFileSpecs.truePosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.truePosString) +
            textFileSpecs.truePosString.length +
            2;
          aXY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.xPosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.xPosString) +
            textFileSpecs.xPosString.length +
            2;
          aX = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.yPosString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.yPosString) +
            textFileSpecs.yPosString.length +
            2;
          aY = String(line.substring(startIndex, startIndex + 8)).trim();
        }
        if (
          line.includes(textFileSpecs.diaString) &&
          lineCount > textFileSpecs.aEnd
        ) {
          let startIndex =
            line.indexOf(textFileSpecs.diaString) +
            textFileSpecs.diaString.length +
            2;
          aDia = String(line.substring(startIndex, startIndex + 8)).trim();
          aSideData[`hole_${holeCount}`] = {
            aDia: aDia,
            aXY: aXY,
            aX: aX,
            aY: aY,
          };
          holeCount++;
        }
      }

      lineCount++;
    }
    return [cSideData, aSideData, aFlipData];
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

  const changeMetric = metricSel => {
    setPartData(prevState => {
      return { ...prevState, metric: metricSel };
    });
  };

  const tfParser = async (textFile, mtime, cSideOnly) => {
    //Get header info from text file
    const headerInfo = getHeaderInfo(textFile, mtime);

    //Get line numbers and other file specifics for given part type
    const [textFileSpecs, tolerances] = await getTextFileSpecs(
      headerInfo.partType,
      cSideOnly
    );

    //Create data objects for each section of the part
    const [cSideData, aSideData, aFlipData] = getPartData(
      textFileSpecs,
      textFile
    );

    //Create part object with all metrics
    const part = new Part(
      headerInfo,
      cSideData,
      aSideData,
      aFlipData,
      tolerances
    );
    return part;
  };

  const importTest = async partData => {
    console.log(partData.tracking);
    const response = await fetch(`http://localhost:3001/parts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partData),
    });
    const data = response.json();
    console.log(data);
  };

  return (
    <div className="PartDisplay">
      {partData ? (
        <div>
          <div
            id="part-title"
            className="jumbotron jumbotron-fluid part-jumbotron"
          >
            <div className="part-info">
              {/* <button
                className="btn btn-outline-success"
                onClick={importTest.bind(null, partData.part)}
              >
                import test
              </button> */}
              <p className="display-4 lead">
                {partData.part.tracking}
                <span style={{ color: getPartColor(partData.part.parttype) }}>
                  |
                </span>
              </p>
              <p className="display-4 lead">
                {partData.part.parttype}
                <span style={{ color: getPartColor(partData.part.parttype) }}>
                  |
                </span>
              </p>
              <p className="display-4 lead">{partData.part.machine} </p>
            </div>
          </div>
          <div>
            <div className="data-display">
              <select
                className="form-select form-select-lg mb-3 line-metric-selector"
                aria-label=".form-select-lg example"
                onChange={changeMetric}
              >
                <option value="Diameter">Diameter</option>
                <option value="Position">Position</option>
              </select>
              <div
                id="carouselExampleIndicators"
                className="carousel slide"
                data-ride="false"
                data-interval="false"
              >
                <ol className="carousel-indicators">
                  <li
                    data-target="#carouselExampleIndicators"
                    data-slide-to="0"
                    className="active"
                  ></li>
                  <li
                    data-target="#carouselExampleIndicators"
                    data-slide-to="1"
                  ></li>
                  <li
                    data-target="#carouselExampleIndicators"
                    data-slide-to="2"
                  ></li>
                </ol>
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <div className="linegraph-and-buttons">
                      <div className="line-graph">
                        <LineGraph
                          partData={partData.part}
                          metric={partData.metric}
                        />
                      </div>
                      {/* <div className="metric-buttons">
                        <ul>
                          <li>
                            <button
                              className="btn btn-outline-primary m-3"
                              onClick={changeMetric.bind(null, 'diameter')}
                            >
                              diameter
                            </button>
                          </li>
                          <li>
                            <button
                              className="btn btn-outline-primary m-3"
                              onClick={changeMetric.bind(null, 'position')}
                            >
                              position
                            </button>
                          </li>
                        </ul>
                      </div> */}
                    </div>
                  </div>
                  <div className="carousel-item">
                    <div className="linegraph-and-buttons">
                      <div className="scatter-graph">
                        <ScatterPlot
                          partData={partData.part}
                          side={partData.side}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="carousel-item">
                    <div className="linegraph-and-buttons">
                      <MetricHighlights partData={partData.part} />
                    </div>
                  </div>
                </div>
              </div>
              <a
                className="carousel-control carousel-control-prev"
                href="#carouselExampleIndicators"
                role="button"
                data-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Previous</span>
              </a>
              <a
                className="carousel-control carousel-control-next"
                href="#carouselExampleIndicators"
                role="button"
                data-slide="next"
              >
                <span
                  className="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span className="sr-only">Next</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <DragAndDrop className="drag-drop-area" onDrop={onDrop} />
        </div>
      )}
    </div>
  );
}
